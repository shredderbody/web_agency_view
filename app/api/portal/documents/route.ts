import { NextRequest, NextResponse } from "next/server";
import { canAccess, currentSession } from "@/lib/portal/auth";
import { getTenant, getTenantByAssistant } from "@/lib/portal/registry";
import { issuerFor } from "@/lib/portal/issuer";
import {
  convertToInvoice, createDocument, deleteDocument, getDocument, listDocuments,
  updateDocument,
} from "@/lib/portal/documents";
import {
  DOC_UNITS, statusesFor, type DocClient, type DocKind, type DocLine, type DocStatus,
  type DocUnit,
} from "@/lib/portal/documents.shared";
import { isLang } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ════════════════════════════════════════════════════════════════════════════
   /api/portal/documents — devis et factures d'une vitrine.

     GET     ?slug=…            la liste du tenant
     POST    { slug, kind, … }  crée un document
     POST    { slug, convert }  convertit un devis en facture
     PATCH   { id, … }          modifie un document
     DELETE  ?id=…              supprime un document

   Deux règles tenues à chaque verbe :

   • LE TENANT NE VIENT JAMAIS DU CORPS DE LA REQUÊTE seul. Pour une écriture
     sur un document existant, il est relu depuis la ligne en base, puis
     confronté à la session. Un `slug` posté ne donne aucun droit par lui-même.

   • TOUT CE QUI ARRIVE DU NAVIGATEUR EST RÉÉCRIT AVANT D'ÊTRE STOCKÉ : les
     lignes sont normalisées ici (types, bornes, longueurs), les totaux
     recalculés par `lib/portal/documents.ts`. Le client propose, le serveur
     dispose.
   ════════════════════════════════════════════════════════════════════════════ */

/* ── Normalisation de ce qui arrive du navigateur ────────────────────────── */

const MAX_LINES = 100;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max).trim() : "";
}

function nullableStr(v: unknown, max: number): string | null {
  const s = str(v, max);
  return s === "" ? null : s;
}

/** Un nombre fini, borné. Tout le reste vaut `fallback`. */
function num(v: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function cleanLines(raw: unknown): DocLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_LINES).map((r, i): DocLine => {
    const l = (r ?? {}) as Record<string, unknown>;
    const kind = l.kind === "discount" ? "discount" : "item";
    return {
      id: str(l.id, 40) || `l${i}`,
      kind,
      label: str(l.label, 200),
      desc: nullableStr(l.desc, 500) ?? undefined,
      // Une quantité négative n'existe pas ; un prix négatif, si — c'est ainsi
      // qu'on pose un geste commercial ou un acompte déjà versé.
      qty: kind === "discount" ? 0 : num(l.qty, 0, 100_000, 1),
      unit_price: kind === "discount" ? 0 : num(l.unit_price, -1_000_000, 10_000_000),
      tax_rate: num(l.tax_rate, 0, 100),
      percent: kind === "discount" ? num(l.percent, 0, 100) : undefined,
      unit: (DOC_UNITS as string[]).includes(str(l.unit, 20))
        ? (str(l.unit, 20) as DocUnit)
        : undefined,
    };
  });
}

function cleanClient(raw: unknown): DocClient {
  const c = (raw ?? {}) as Record<string, unknown>;
  return {
    name: str(c.name, 160),
    email: nullableStr(c.email, 160),
    phone: nullableStr(c.phone, 40),
    address: nullableStr(c.address, 240),
    postal_code: nullableStr(c.postal_code, 20),
    city: nullableStr(c.city, 120),
  };
}

/** Date `AAAA-MM-JJ`, ou `null`. On n'accepte pas une date approximative. */
function cleanDate(v: unknown): string | null {
  const s = str(v, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

/* ── GET : la liste ──────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug") ?? session.slug;
  const tenant = getTenant(slug);
  if (!tenant) return NextResponse.json({ error: "tenant inconnu" }, { status: 404 });
  if (!canAccess(session, slug)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  return NextResponse.json({ documents: await listDocuments(tenant.assistantId) });
}

/* ── POST : création, ou conversion devis → facture ──────────────────────── */

export async function POST(req: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // ── Conversion : le tenant se lit sur le DEVIS, pas dans le corps reçu.
  if (typeof body.convert === "string") {
    const quote = await getDocument(body.convert);
    if (!quote) return NextResponse.json({ error: "introuvable" }, { status: 404 });
    if (quote.kind !== "quote") {
      return NextResponse.json({ error: "seul un devis se convertit" }, { status: 400 });
    }
    const tenant = getTenantByAssistant(quote.assistant_id);
    if (!tenant) return NextResponse.json({ error: "tenant inconnu" }, { status: 404 });
    if (!canAccess(session, tenant.slug)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const issuer = issuerFor(tenant.slug, quote.lang);
    const invoice = await convertToInvoice(tenant, quote, issuer?.paymentDays ?? 30);
    return NextResponse.json({ ok: true, document: invoice });
  }

  // ── Création.
  const slug = str(body.slug, 80) || session.slug;
  const tenant = getTenant(slug);
  if (!tenant) return NextResponse.json({ error: "tenant inconnu" }, { status: 404 });
  if (!canAccess(session, slug)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const lang = isLang(body.lang) ? body.lang : "fr";
  const issuer = issuerFor(slug, lang);
  if (!issuer) return NextResponse.json({ error: "vitrine sans identité" }, { status: 404 });

  const kind: DocKind = body.kind === "invoice" ? "invoice" : "quote";
  const issuedOn = cleanDate(body.issuedOn) ?? new Date().toISOString().slice(0, 10);
  // Échéance par défaut : validité du devis, ou délai de paiement de la facture.
  const days = kind === "quote" ? issuer.validityDays : issuer.paymentDays;
  const dueOn =
    cleanDate(body.dueOn) ??
    new Date(new Date(`${issuedOn}T00:00:00Z`).getTime() + days * 86_400_000)
      .toISOString()
      .slice(0, 10);

  const document = await createDocument(tenant, {
    kind,
    lang,
    currency: issuer.currency,
    taxLabel: issuer.taxLabel,
    client: cleanClient(body.client),
    customerId: nullableStr(body.customerId, 40),
    lines: cleanLines(body.lines),
    notes: nullableStr(body.notes, 2000),
    issuedOn,
    dueOn,
  });

  return NextResponse.json({ ok: true, document });
}

/* ── PATCH : modification ────────────────────────────────────────────────── */

export async function PATCH(req: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const id = str(body.id, 40);
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const doc = await getDocument(id);
  if (!doc) return NextResponse.json({ error: "introuvable" }, { status: 404 });

  const tenant = getTenantByAssistant(doc.assistant_id);
  if (!tenant) return NextResponse.json({ error: "tenant inconnu" }, { status: 404 });
  if (!canAccess(session, tenant.slug)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Un statut ne vaut que s'il appartient au vocabulaire de CETTE nature :
  // une facture ne devient pas « acceptée », un devis ne devient pas « payé ».
  let status: DocStatus | undefined;
  if (typeof body.status === "string") {
    const allowed = statusesFor(doc.kind);
    if (!allowed.includes(body.status as DocStatus)) {
      return NextResponse.json({ error: "statut impossible pour ce document" }, { status: 400 });
    }
    status = body.status as DocStatus;
  }

  const updated = await updateDocument(tenant, doc, {
    client: body.client === undefined ? undefined : cleanClient(body.client),
    customerId: body.customerId === undefined ? undefined : nullableStr(body.customerId, 40),
    lines: body.lines === undefined ? undefined : cleanLines(body.lines),
    notes: body.notes === undefined ? undefined : nullableStr(body.notes, 2000),
    dueOn: body.dueOn === undefined ? undefined : cleanDate(body.dueOn),
    issuedOn: cleanDate(body.issuedOn) ?? undefined,
    status,
  });

  return NextResponse.json({ ok: true, document: updated });
}

/* ── DELETE ──────────────────────────────────────────────────────────────── */

export async function DELETE(req: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const doc = await getDocument(id);
  if (!doc) return NextResponse.json({ ok: true, alreadyGone: true });

  const tenant = getTenantByAssistant(doc.assistant_id);
  if (!tenant) return NextResponse.json({ error: "tenant inconnu" }, { status: 404 });
  if (!canAccess(session, tenant.slug)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await deleteDocument(tenant, id);
  return NextResponse.json({ ok: true });
}
