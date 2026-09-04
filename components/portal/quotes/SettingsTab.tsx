"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useQuotes } from "./context";

/* Les réglages de l'émetteur.

   Un champ vide n'efface rien : il RETOMBE sur la vitrine, et l'écran le dit
   sous le champ — « Vitrine : Maison Brutus ». Sans cette mention, un champ vide
   se lit comme une donnée manquante, alors que c'est le comportement voulu dans
   la grande majorité des cas.

   Les mentions légales dérivées (pénalités de retard, indemnité forfaitaire de
   40 €) n'apparaissent pas ici : elles portent le droit applicable et ne sont
   pas négociables. Ce qu'on saisit en pied de document vient EN PLUS. */

type Key =
  | "companyName" | "legalForm" | "siret" | "vatNumber" | "address" | "postalCode"
  | "city" | "country" | "phone" | "email" | "website" | "logoUrl"
  | "iban" | "bic" | "paymentMethod" | "paymentDays" | "validityDays"
  | "taxRateDefault" | "footerNotes" | "insuranceLabel" | "insuranceDetail";

export default function SettingsTab() {
  const ctx = useQuotes();
  const { t, settings, issuer } = ctx;

  const [form, setForm] = useState<Record<Key, string>>({
    companyName: settings?.company_name ?? "",
    legalForm: settings?.legal_form ?? "",
    siret: settings?.siret ?? "",
    vatNumber: settings?.vat_number ?? "",
    address: settings?.address ?? "",
    postalCode: settings?.postal_code ?? "",
    city: settings?.city ?? "",
    country: settings?.country ?? "",
    phone: settings?.phone ?? "",
    email: settings?.email ?? "",
    website: settings?.website ?? "",
    logoUrl: settings?.logo_url ?? "",
    iban: settings?.iban ?? "",
    bic: settings?.bic ?? "",
    paymentMethod: settings?.payment_method ?? "",
    paymentDays: settings?.payment_days?.toString() ?? "",
    validityDays: settings?.validity_days?.toString() ?? "",
    taxRateDefault: settings?.tax_rate_default?.toString() ?? "",
    footerNotes: settings?.footer_notes ?? "",
    insuranceLabel: settings?.insurance_label ?? "",
    insuranceDetail: settings?.insurance_detail ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: Key, v: string) => { setForm((f) => ({ ...f, [k]: v })); setDone(false); };

  /** Le champ, et sous lui ce que la vitrine dirait s'il restait vide. */
  const field = (k: Key, label: string, inherited?: string | null, type = "text") => (
    <label className="esp-field" key={k}>
      <span className="esp-label">{label}</span>
      <input className="esp-input" type={type} value={form[k]}
        onChange={(e) => set(k, e.target.value)} />
      {inherited && !form[k].trim() && (
        <span className="esp-micro">{t.set.inherited(inherited)}</span>
      )}
    </label>
  );

  async function save() {
    setBusy(true);
    await ctx.saveSettings({
      companyName: form.companyName, legalForm: form.legalForm, siret: form.siret,
      vatNumber: form.vatNumber, address: form.address, postalCode: form.postalCode,
      city: form.city, country: form.country, phone: form.phone, email: form.email,
      website: form.website, logoUrl: form.logoUrl, iban: form.iban, bic: form.bic,
      paymentMethod: form.paymentMethod,
      paymentDays: form.paymentDays === "" ? null : Number(form.paymentDays),
      validityDays: form.validityDays === "" ? null : Number(form.validityDays),
      taxRateDefault: form.taxRateDefault === "" ? null : Number(form.taxRateDefault),
      footerNotes: form.footerNotes, insuranceLabel: form.insuranceLabel,
      insuranceDetail: form.insuranceDetail,
    });
    setBusy(false);
    setDone(true);
  }

  return (
    <div className="esp-stack">
      <div className="esp-pagehead">
        <div>
          <h2 className="esp-h2">{t.set.title}</h2>
          <p className="esp-lead" style={{ marginTop: "0.25rem" }}>{t.set.lead}</p>
        </div>
      </div>

      <section className="esp-panel">
        <header className="esp-panel-head"><h3 className="esp-h3">{t.set.identity}</h3></header>
        <div className="esp-panel-body" style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          <div className="doc-grid-2">
            {field("companyName", t.set.companyName, issuer.name)}
            {field("legalForm", t.set.legalForm)}
          </div>
          <div className="doc-grid-2">
            {field("siret", t.set.siret, issuer.registration)}
            {field("vatNumber", t.set.vatNumber)}
          </div>
          {field("address", t.set.address, issuer.address)}
          <div className="doc-grid-3">
            {field("postalCode", t.set.postalCode)}
            {field("city", t.set.city, issuer.city)}
          </div>
          <div className="doc-grid-2">
            {field("phone", t.set.phone, issuer.phone, "tel")}
            {field("email", t.set.email, issuer.email, "email")}
          </div>
          <div className="doc-grid-2">
            {field("website", t.set.website, issuer.website, "url")}
            {field("logoUrl", t.set.logoUrl, null, "url")}
          </div>
        </div>
      </section>

      <section className="esp-panel">
        <header className="esp-panel-head"><h3 className="esp-h3">{t.set.payment}</h3></header>
        <div className="esp-panel-body" style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          <div className="doc-grid-2">
            {field("iban", t.set.iban)}
            {field("bic", t.set.bic)}
          </div>
          {field("paymentMethod", t.set.paymentMethod)}
          <div className="doc-grid-3">
            {field("paymentDays", t.set.paymentDays, String(issuer.paymentDays), "number")}
            {field("validityDays", t.set.validityDays, String(issuer.validityDays), "number")}
          </div>
          {field("taxRateDefault", t.set.taxRateDefault, String(issuer.taxRate), "number")}
        </div>
      </section>

      <section className="esp-panel">
        <header className="esp-panel-head"><h3 className="esp-h3">{t.set.legal}</h3></header>
        <div className="esp-panel-body" style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          <div className="doc-grid-2">
            {field("insuranceLabel", t.set.insuranceLabel)}
            {field("insuranceDetail", t.set.insuranceDetail)}
          </div>
          <label className="esp-field">
            <span className="esp-label">{t.set.footerNotes}</span>
            <textarea className="esp-textarea" value={form.footerNotes}
              onChange={(e) => set("footerNotes", e.target.value)} />
            <span className="esp-micro">{t.set.footerHint}</span>
          </label>

          {/* Ce qui s'imprimera de toute façon : on le montre, pour qu'on ne le
              cherche pas dans les champs ci-dessus. */}
          <div className="qa-legal-preview">
            {issuer.legalNotes.map((n) => <p key={n} className="esp-micro">{n}</p>)}
          </div>
        </div>
      </section>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" className="esp-btn esp-btn-primary" onClick={save} disabled={busy}>
          {busy ? <Loader2 size={14} className="esp-spin" aria-hidden /> : null}
          {busy ? t.saving : t.set.save}
        </button>
        {done && (
          <span className="esp-small" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <Check size={14} aria-hidden style={{ color: "var(--esp-ok)" }} /> {t.set.saved}
          </span>
        )}
      </div>
    </div>
  );
}
