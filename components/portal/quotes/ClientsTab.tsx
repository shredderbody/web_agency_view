"use client";

import { useMemo, useState } from "react";
import { Bot, FileText, Search, Trash2, UserPlus, UserRound } from "lucide-react";
import type { PortalCustomer } from "@/lib/portal/types";
import { useQuotes } from "./context";

/* Le fichier client, modifiable.

   Une fiche n'a rien d'obligatoire pour faire un devis — on peut taper un nom à
   la main dans l'éditeur. Elle sert quand la personne revient : on la choisit,
   son adresse suit, et le devis suivant se compose en trois clics.

   Deux origines cohabitent, et la fiche le dit : celles qu'a inscrites la
   standardiste au téléphone, et celles saisies ici. Savoir d'où vient une
   coordonnée change la confiance qu'on lui accorde. */

type Form = {
  name: string; company: string; phone: string; email: string;
  address: string; postalCode: string; city: string; siret: string; notes: string;
};

const EMPTY: Form = {
  name: "", company: "", phone: "", email: "",
  address: "", postalCode: "", city: "", siret: "", notes: "",
};

function toForm(c: PortalCustomer): Form {
  return {
    name: c.full_name ?? "",
    company: c.company ?? "",
    phone: c.phone.startsWith("manual:") ? "" : (c.phone_raw ?? c.phone),
    email: c.email ?? "",
    address: c.address ?? "",
    postalCode: c.postal_code ?? "",
    city: c.city ?? "",
    siret: c.siret ?? "",
    notes: c.notes ?? "",
  };
}

export default function ClientsTab() {
  const ctx = useQuotes();
  const { t, customers, documents } = ctx;
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      (c.full_name ?? "").toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q));
  }, [customers, query]);

  const docsOf = (id: string) => documents.filter((d) => d.customer_id === id).length;

  function open(c: PortalCustomer | null) {
    setProblem(null);
    if (!c) { setEditing("new"); setForm(EMPTY); return; }
    setEditing(c.id);
    setForm(toForm(c));
  }

  async function save() {
    if (!form.name.trim() && !form.company.trim()) {
      setProblem(t.clients.needName);
      return;
    }
    setBusy(true);
    const saved = await ctx.saveCustomer(
      {
        name: form.name || null, company: form.company || null,
        phone: form.phone || null, email: form.email || null,
        address: form.address || null, postalCode: form.postalCode || null,
        city: form.city || null, siret: form.siret || null, notes: form.notes || null,
      },
      editing === "new" ? undefined : editing ?? undefined,
    );
    setBusy(false);
    if (saved) setEditing(null);
  }

  const field = (key: keyof Form, label: string, type = "text") => (
    <label className="esp-field">
      <span className="esp-label">{label}</span>
      <input className="esp-input" type={type} value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
    </label>
  );

  return (
    <div className="esp-stack">
      <section className="esp-panel">
        <header className="esp-panel-head">
          <h2 className="esp-h2">{t.clients.title}</h2>
          <div className="qa-search">
            <Search size={14} aria-hidden />
            <input className="esp-input" value={query} placeholder={t.clients.search}
              aria-label={t.clients.search} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button type="button" className="esp-btn esp-btn-primary esp-btn-sm" onClick={() => open(null)}>
            <UserPlus size={13} aria-hidden /> {t.clients.add}
          </button>
        </header>

        {rows.length === 0 ? (
          <div className="esp-empty">
            <UserRound size={22} aria-hidden style={{ color: "var(--esp-ink-3)" }} />
            <p className="esp-empty-t">{t.clients.emptyT}</p>
            <p className="esp-empty-d">{t.clients.emptyD}</p>
          </div>
        ) : (
          <div className="esp-tablewrap">
            <table className="esp-table">
              <thead>
                <tr>
                  <th scope="col">{t.clientName}</th>
                  <th scope="col">{t.clients.company}</th>
                  <th scope="col">{t.clientPhone}</th>
                  <th scope="col">{t.clientCity}</th>
                  <th scope="col" className="n">{t.tabs.quote}</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <button type="button" className="doc-open" onClick={() => open(c)}>
                        {c.full_name ?? c.company ?? "—"}
                      </button>
                      {/* D'où vient cette fiche : au téléphone, ou saisie ici. */}
                      <span className="qa-origin" title={c.source === "portal" ? t.clients.fromPortal : t.clients.fromVoice}>
                        {c.source === "portal"
                          ? <UserRound size={11} aria-hidden />
                          : <Bot size={11} aria-hidden />}
                      </span>
                    </td>
                    <td>{c.company ?? "—"}</td>
                    <td>{c.phone.startsWith("manual:") ? "—" : c.phone}</td>
                    <td>{c.city ?? "—"}</td>
                    <td className="n">{docsOf(c.id) || "—"}</td>
                    <td className="n">
                      <button type="button" className="esp-btn esp-btn-sm esp-btn-quiet"
                        title={t.clients.useInQuote} aria-label={t.clients.useInQuote}
                        onClick={() => { open(c); ctx.goTo("editor"); }}>
                        <FileText size={12} aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing !== null && (
        <section className="esp-panel">
          <header className="esp-panel-head">
            <h2 className="esp-h3">{editing === "new" ? t.clients.add : t.clients.title}</h2>
            <button type="button" className="esp-btn esp-btn-sm esp-btn-quiet"
              onClick={() => setEditing(null)}>{t.back}</button>
          </header>
          <div className="esp-panel-body" style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {problem && <p className="esp-note esp-note-warn" role="alert">{problem}</p>}

            <div className="doc-grid-2">
              {field("name", t.clientName)}
              {field("company", t.clients.company)}
            </div>
            <div className="doc-grid-2">
              {field("phone", t.clientPhone, "tel")}
              {field("email", t.clientEmail, "email")}
            </div>
            {field("address", t.clientAddress)}
            <div className="doc-grid-3">
              {field("postalCode", t.clientPostal)}
              {field("city", t.clientCity)}
            </div>
            {field("siret", t.clients.siret)}
            <label className="esp-field">
              <span className="esp-label">{t.clients.notesLabel}</span>
              <textarea className="esp-textarea" value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </label>

            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <button type="button" className="esp-btn esp-btn-primary" onClick={save} disabled={busy}>
                {busy ? t.saving : t.clients.save}
              </button>
              {editing !== "new" && (
                <button type="button" className="esp-btn esp-btn-danger" disabled={busy}
                  onClick={async () => {
                    if (!window.confirm(t.clients.delConfirm)) return;
                    setBusy(true);
                    await ctx.removeCustomer(editing);
                    setBusy(false);
                    setEditing(null);
                  }}>
                  <Trash2 size={13} aria-hidden /> {t.clients.del}
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
