import { NextRequest, NextResponse } from "next/server";
import { guard, readJson, str } from "@/lib/portal/apiGuard";
import { parseDictation, VoiceError, type CatalogHint } from "@/lib/portal/voice";
import { getSettings } from "@/lib/portal/docSettings";
import { issuerFor } from "@/lib/portal/issuer";
import { listItems } from "@/lib/portal/catalogStore";
import { getDocument } from "@/lib/portal/documents";
import { insert } from "@/lib/portal/supabase";
import { logAction } from "@/lib/portal/ledger";
import { isLang } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* POST /api/portal/voice/parse — un texte dicté, des lignes chiffrées.

   Le CATALOGUE de la vitrine est envoyé au modèle : c'est ce qui permet à
   « deux pad thaï » de devenir deux lignes à 12,50 € sans que le prix ait été
   dicté. Sans lui, le modèle inventerait un prix ou en laisserait zéro — et un
   devis avec des prix inventés est pire qu'un devis vide.

   La dictée est journalisée (`demo_voice_sessions`) avec ce qu'elle a produit :
   quand une analyse rate, on peut la relire sans redemander à quelqu'un de
   redicter son chantier. */

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const g = await guard(str(body.slug, 80) || null);
  if (!g.ok) return g.res;

  const transcript = str(body.transcript, 4000);
  if (!transcript) return NextResponse.json({ error: "dictée vide" }, { status: 400 });

  const lang = isLang(body.lang) ? body.lang : "fr";
  const documentId = str(body.documentId, 40) || null;

  const [settings, items] = await Promise.all([
    getSettings(g.tenant.assistantId),
    listItems(g.tenant.assistantId).catch(() => []),
  ]);
  const issuer = issuerFor(g.tenant.slug, lang);
  const defaultTax = settings?.tax_rate_default ?? issuer?.taxRate ?? 20;

  const catalog: CatalogHint[] = items
    .filter((i) => !i.to_quote)
    .map((i) => ({ name: i.name, unitPrice: i.unit_price, taxRate: i.tax_rate, unit: i.unit }));

  // Les lignes déjà posées : le modèle doit savoir ce qu'il complète, sinon
  // « ajoute une heure de main-d'œuvre » redémarre un devis vide.
  let existing: { label: string; qty: number; unit_price: number }[] = [];
  if (documentId) {
    const doc = await getDocument(documentId).catch(() => null);
    if (doc && doc.assistant_id === g.tenant.assistantId) {
      existing = (doc.lines ?? []).map((l) => ({
        label: l.label, qty: l.qty, unit_price: l.unit_price,
      }));
    }
  }

  try {
    const result = await parseDictation({
      transcript, lang, defaultTax,
      currency: issuer?.currency ?? "EUR",
      catalog, existing,
    });

    // Journal de la dictée — best effort : une trace manquante ne doit pas
    // faire perdre à l'utilisateur les lignes qu'il vient de dicter.
    await insert("demo_voice_sessions", [{
      assistant_id: g.tenant.assistantId,
      demo_slug: g.tenant.slug,
      document_id: documentId,
      transcript,
      result: result.lines,
      outcome: result.lines.length > 0 ? "ok" : "empty",
    }]).catch(() => undefined);

    if (result.lines.length > 0) {
      await logAction({
        tenant: g.tenant,
        action: "quote_dictated",
        actor: "portal",
        documentId: documentId ?? undefined,
        note: transcript.slice(0, 200),
      }).catch(() => undefined);
    }

    return NextResponse.json(result);
  } catch (err) {
    await insert("demo_voice_sessions", [{
      assistant_id: g.tenant.assistantId,
      demo_slug: g.tenant.slug,
      document_id: documentId,
      transcript,
      result: [],
      outcome: "error",
    }]).catch(() => undefined);

    const status = err instanceof VoiceError ? err.status : 502;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analyse impossible." },
      { status },
    );
  }
}
