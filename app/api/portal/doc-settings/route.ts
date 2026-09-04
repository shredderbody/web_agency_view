import { NextRequest, NextResponse } from "next/server";
import { guard, readJson, nullableNum, nullableStr, str } from "@/lib/portal/apiGuard";
import { effectiveIssuer, getSettings, saveSettings } from "@/lib/portal/docSettings";
import { isLang } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ════════════════════════════════════════════════════════════════════════════
   /api/portal/doc-settings — les réglages de l'émetteur.

     GET   ?slug=&lang=   les réglages bruts ET l'émetteur effectif
     PATCH { slug, … }    enregistre (upsert sur le tenant)

   Le GET renvoie les DEUX : les réglages tels qu'ils sont enregistrés (ce que
   le formulaire édite) et l'émetteur effectif (ce qui s'imprimera, vitrine
   comprise). L'écran a besoin des deux pour montrer, sous un champ vide, la
   valeur héritée de la vitrine plutôt qu'un blanc trompeur.
   ════════════════════════════════════════════════════════════════════════════ */

export async function GET(req: NextRequest) {
  const g = await guard(req.nextUrl.searchParams.get("slug"));
  if (!g.ok) return g.res;

  const raw = req.nextUrl.searchParams.get("lang");
  const lang = isLang(raw) ? raw : "fr";
  const settings = await getSettings(g.tenant.assistantId);
  return NextResponse.json({
    settings,
    issuer: effectiveIssuer(g.tenant.slug, lang, settings),
  });
}

export async function PATCH(req: NextRequest) {
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const g = await guard(str(body.slug, 80) || null);
  if (!g.ok) return g.res;

  const lang = isLang(body.lang) ? body.lang : "fr";
  const settings = await saveSettings(g.tenant, {
    company_name: nullableStr(body.companyName, 160),
    legal_form: nullableStr(body.legalForm, 80),
    siret: nullableStr(body.siret, 40),
    vat_number: nullableStr(body.vatNumber, 40),
    address: nullableStr(body.address, 240),
    postal_code: nullableStr(body.postalCode, 20),
    city: nullableStr(body.city, 120),
    country: nullableStr(body.country, 80),
    phone: nullableStr(body.phone, 40),
    email: nullableStr(body.email, 160),
    website: nullableStr(body.website, 200),
    logo_url: nullableStr(body.logoUrl, 500),
    iban: nullableStr(body.iban, 60),
    bic: nullableStr(body.bic, 20),
    payment_method: nullableStr(body.paymentMethod, 120),
    payment_days: nullableNum(body.paymentDays, 0, 365),
    validity_days: nullableNum(body.validityDays, 1, 365),
    tax_rate_default: nullableNum(body.taxRateDefault, 0, 100),
    footer_notes: nullableStr(body.footerNotes, 2000),
    insurance_label: nullableStr(body.insuranceLabel, 160),
    insurance_detail: nullableStr(body.insuranceDetail, 300),
  });

  return NextResponse.json({
    ok: true,
    settings,
    issuer: effectiveIssuer(g.tenant.slug, lang, settings),
  });
}
