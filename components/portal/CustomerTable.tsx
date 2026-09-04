"use client";

import { useMemo, useState } from "react";
import { Search, UsersRound } from "lucide-react";
import type { PortalCustomer } from "@/lib/portal/types";
import { usePortalI18n } from "@/lib/portal/i18nClient";
import { fmtAgo } from "./format";

/* Fichier client : les coordonnées pour le suivi, et ce que chaque personne a
   fait. Dédoublonné en amont sur le téléphone normalisé (cf. lib/portal/phone.ts),
   donc une ligne = une personne, pas une réservation. */

export default function CustomerTable({ customers }: { customers: PortalCustomer[] }) {
  const { lang, t } = usePortalI18n();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => (c.full_name ?? "").toLowerCase().includes(q) ||
        c.phone.includes(q) || (c.email ?? "").toLowerCase().includes(q),
    );
  }, [customers, query]);

  return (
    <section className="esp-panel">
      <header className="esp-panel-head">
        <h2 className="esp-h2">{t.cust.title}</h2>
        <span className="esp-small">{t.cust.count(customers.length)}</span>
        {customers.length > 6 && (
          <div style={{ position: "relative", maxWidth: "15rem", width: "100%" }}>
            <Search size={14} aria-hidden style={{
              position: "absolute", left: "0.6rem", top: "50%",
              transform: "translateY(-50%)", color: "var(--esp-ink-3)",
            }} />
            <input
              className="esp-input" style={{ paddingLeft: "1.9rem", minHeight: "2.1rem" }}
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t.cust.searchPlaceholder} aria-label={t.cust.searchAria}
            />
          </div>
        )}
      </header>

      {rows.length === 0 ? (
        <div className="esp-empty">
          <UsersRound size={22} aria-hidden style={{ color: "var(--esp-ink-3)" }} />
          <p className="esp-empty-t">
            {customers.length === 0 ? t.cust.emptyT : t.cust.noResultT}
          </p>
          <p className="esp-empty-d">
            {customers.length === 0
              ? t.cust.emptyD
              : t.cust.noResultD}
          </p>
        </div>
      ) : (
        <div className="esp-tablewrap">
          <table className="esp-table">
            <thead>
              <tr>
                <th scope="col">{t.cust.colClient}</th>
                <th scope="col">{t.cust.colPhone}</th>
                <th scope="col">{t.cust.colEmail}</th>
                <th scope="col" className="n">{t.cust.colActions}</th>
                <th scope="col" className="n">{t.cust.colBookings}</th>
                <th scope="col" className="n">{t.cust.colCancels}</th>
                <th scope="col">{t.cust.colLastSeen}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.full_name ?? t.cust.noName}</td>
                  <td>
                    <a href={`tel:${c.phone}`} style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}>
                      {c.phone}
                    </a>
                  </td>
                  <td style={{ color: c.email ? "inherit" : "var(--esp-ink-3)" }}>{c.email ?? "—"}</td>
                  <td className="n">{c.actions_count}</td>
                  <td className="n">{c.bookings_count}</td>
                  <td className="n" style={{ color: c.cancels_count > 0 ? "var(--esp-bad)" : "var(--esp-ink-3)" }}>
                    {c.cancels_count}
                  </td>
                  <td className="esp-small">{fmtAgo(c.last_seen_at, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
