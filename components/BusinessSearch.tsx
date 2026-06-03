"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Search, Star, X } from "lucide-react";
import { useLang } from "@/lib/lang-context";

type Suggestion = { id: string; main: string; secondary: string };
type Review = { rating: number | null; text: string; author: string; when: string };
type Place = {
  id: string;
  name: string;
  primaryType?: string;
  primaryTypeDisplay?: string;
  types?: string[];
  address: string;
  streetNumber?: string;
  route?: string;
  locality?: string;
  postalCode?: string;
  adminArea?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  phoneNational?: string;
  phoneInternational?: string;
  website?: string;
  mapsUri?: string;
  rating?: number | null;
  userRatingCount?: number | null;
  openingHours?: string[];
  reviews?: Review[];
  businessStatus?: string;
};

const GOLD = "#E0A12B";

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", gap: "0.1rem" }} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          style={{ color: i <= full ? GOLD : "var(--border)", fill: i <= full ? GOLD : "transparent" }}
        />
      ))}
    </span>
  );
}

export default function BusinessSearch() {
  const { lang, t } = useLang();
  const s = t.demoSearch;

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Place | null>(null);
  const [manual, setManual] = useState(false);
  const [form, setForm] = useState({ name: "", trade: "", city: "", email: "", phone: "" });
  const [popupEmail, setPopupEmail] = useState("");
  const [popupPhone, setPopupPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  // Recherche d'autocomplétion débouncée (300 ms).
  useEffect(() => {
    if (selected) return;
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) {
      setSuggestions([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const reqId = ++reqIdRef.current;
      try {
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(q)}&lang=${lang}`);
        const data = await res.json();
        if (reqId !== reqIdRef.current) return; // réponse périmée
        setSuggestions(data.suggestions ?? []);
        setOpen(true);
        setSearched(true);
      } catch {
        if (reqId === reqIdRef.current) setSuggestions([]);
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, lang, selected]);

  // Ferme le dropdown au clic extérieur.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Pop-up ouverte : Échap pour fermer + verrou du scroll de la page.
  useEffect(() => {
    if (!selected) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) closeModal();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, submitting]);

  async function pick(sug: Suggestion) {
    setOpen(false);
    setLoading(true);
    setSubmitted(false);
    setError(false);
    try {
      const res = await fetch(`/api/places/details?id=${encodeURIComponent(sug.id)}&lang=${lang}`);
      const data = await res.json();
      setSelected(data?.id ? (data as Place) : { id: sug.id, name: sug.main, address: sug.secondary });
    } catch {
      setSelected({ id: sug.id, name: sug.main, address: sug.secondary });
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setSelected(null);
    setSubmitted(false);
    setError(false);
    setPopupEmail("");
    setPopupPhone("");
    setQuery("");
    setSuggestions([]);
    setSearched(false);
    setOpen(false);
  }

  function googlePayload(p: Place) {
    return {
      source: "google",
      lang,
      place_id: p.id,
      name: p.name,
      primary_type: p.primaryType,
      primary_type_display: p.primaryTypeDisplay,
      types: p.types,
      formatted_address: p.address,
      street_number: p.streetNumber,
      route: p.route,
      locality: p.locality,
      postal_code: p.postalCode,
      admin_area: p.adminArea,
      country: p.country,
      latitude: p.latitude,
      longitude: p.longitude,
      // Téléphone saisi par l'entreprise s'il est fourni, sinon celui de Google.
      phone_national: popupPhone.trim() || p.phoneNational,
      phone_international: p.phoneInternational,
      email: popupEmail.trim(),
      website: p.website,
      google_maps_uri: p.mapsUri,
      rating: p.rating,
      user_rating_count: p.userRatingCount,
      opening_hours: p.openingHours,
      reviews: p.reviews,
      business_status: p.businessStatus,
    };
  }

  function manualPayload() {
    return {
      source: "manual",
      lang,
      name: form.name.trim(),
      primary_type_display: form.trade.trim(),
      locality: form.city.trim(),
      email: form.email.trim(),
      phone_national: form.phone.trim(),
    };
  }

  async function submitLead(payload: Record<string, unknown>) {
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) setSubmitted(true);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const emailOk = /\S+@\S+\.\S+/.test(form.email.trim());
  const manualValid = !!(form.name.trim() && form.trade.trim() && form.city.trim() && emailOk);

  const inputBase: React.CSSProperties = {
    width: "100%",
    border: "1px solid oklch(1 0 0 / 0.4)",
    background: "var(--surface)",
    color: "var(--ink)",
    borderRadius: "0.7rem",
    padding: "0.9rem 1rem 0.9rem 2.8rem",
    fontSize: "1rem",
    fontFamily: "inherit",
    outline: "none",
  };

  // Bouton d'envoi partagé (Google + manuel) : état envoi → envoyé.
  function SubmitButton({
    onClick,
    enabled,
  }: {
    onClick: () => void;
    enabled: boolean;
  }) {
    if (submitted) {
      return (
        <button
          type="button"
          disabled
          className="btn btn-lg"
          style={{
            marginTop: "0.9rem",
            width: "100%",
            justifyContent: "center",
            background: "oklch(0.62 0.13 150)",
            color: "#fff",
            border: "none",
            cursor: "default",
          }}
        >
          <Check size={18} /> {s.sent}
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!enabled || submitting}
        className="btn btn-lg"
        style={{
          marginTop: "0.9rem",
          width: "100%",
          justifyContent: "center",
          background: "var(--vermilion-deep)",
          color: "var(--surface)",
          border: "none",
          opacity: enabled || submitting ? 1 : 0.5,
          pointerEvents: enabled && !submitting ? "auto" : submitting ? "auto" : "none",
          cursor: enabled && !submitting ? "pointer" : "default",
        }}
      >
        {submitting ? (
          <>
            {s.sending} <Loader2 size={18} className="bs-spin" />
          </>
        ) : (
          <>
            {s.submit} <ArrowRight size={18} />
          </>
        )}
      </button>
    );
  }

  const statusLine = (
    <>
      {submitted && (
        <p style={{ margin: "0.6rem 0 0", fontSize: "0.88rem", color: "var(--ink-dim)" }}>{s.success}</p>
      )}
      {error && (
        <p style={{ margin: "0.6rem 0 0", fontSize: "0.85rem", color: "var(--vermilion-deep)" }}>{s.errorMsg}</p>
      )}
    </>
  );

  // ── Saisie manuelle (entreprise absente de Google) ──
  if (manual) {
    const fieldStyle: React.CSSProperties = { ...inputBase, padding: "0.8rem 1rem" };
    return (
      <div style={{ width: "100%" }}>
        <p style={{ margin: "0 0 0.7rem", fontSize: "0.9rem", color: "oklch(0.96 0.02 40)" }}>{s.manualTitle}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={s.manualName} aria-label={s.manualName} style={fieldStyle} />
          <input type="text" value={form.trade} onChange={(e) => setForm((f) => ({ ...f, trade: e.target.value }))} placeholder={s.manualTrade} aria-label={s.manualTrade} style={fieldStyle} />
          <input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder={s.manualCity} aria-label={s.manualCity} style={fieldStyle} />
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder={s.manualEmail} aria-label={s.manualEmail} style={fieldStyle} />
          <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder={s.manualPhone} aria-label={s.manualPhone} style={fieldStyle} />
        </div>
        <SubmitButton onClick={() => submitLead(manualPayload())} enabled={manualValid} />
        {statusLine}
        {!submitted && (
          <button
            type="button"
            onClick={() => {
              setManual(false);
              setError(false);
            }}
            style={{
              marginTop: "0.7rem",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "oklch(0.96 0.02 40)",
              fontSize: "0.85rem",
              textDecoration: "underline",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <ArrowLeft size={14} /> {s.backToSearch}
          </button>
        )}
      </div>
    );
  }

  const shownReviews = (selected?.reviews ?? []).filter((r) => r.text?.trim()).slice(0, 3);

  // ── Recherche + pop-up entreprise ──
  return (
    <>
      <div ref={boxRef} style={{ width: "100%", position: "relative" }}>
        <label htmlFor="business-search" style={{ display: "block", margin: "0 0 0.5rem", fontSize: "0.9rem", color: "oklch(0.96 0.02 40)" }}>
          {s.label}
        </label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--ink-dim)", display: "inline-flex" }}>
            {loading ? <Loader2 size={18} className="bs-spin" /> : <Search size={18} />}
          </span>
          <input
            id="business-search"
            type="text"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={s.placeholder}
            style={inputBase}
          />
        </div>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.82rem", color: "oklch(0.96 0.02 40 / 0.85)" }}>{s.hint}</p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setManual(true);
          }}
          style={{ marginTop: "0.55rem", background: "transparent", border: "none", cursor: "pointer", color: "var(--surface)", fontSize: "0.85rem", textDecoration: "underline", padding: 0 }}
        >
          {s.cantFind}
        </button>

        {open && (suggestions.length > 0 || (searched && !loading)) && (
          <ul
            style={{
              listStyle: "none",
              margin: "0.4rem 0 0",
              padding: "0.3rem",
              position: "absolute",
              zIndex: 20,
              width: "100%",
              background: "var(--surface)",
              color: "var(--ink)",
              borderRadius: "0.7rem",
              boxShadow: "0 12px 40px oklch(0 0 0 / 0.25)",
              maxHeight: "20rem",
              overflowY: "auto",
            }}
          >
            {suggestions.length === 0 ? (
              <li style={{ padding: "0.7rem 0.8rem", fontSize: "0.9rem", color: "var(--ink-dim)" }}>{s.noResults}</li>
            ) : (
              suggestions.map((sug) => (
                <li key={sug.id}>
                  <button
                    type="button"
                    onClick={() => pick(sug)}
                    style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "0.6rem 0.7rem", borderRadius: "0.5rem", color: "var(--ink)", fontSize: "0.95rem" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <MapPin size={16} style={{ color: "var(--vermilion)", flexShrink: 0, marginTop: "0.15rem" }} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 600 }}>{sug.main}</span>
                      {sug.secondary && <span style={{ display: "block", fontSize: "0.85rem", color: "var(--ink-dim)" }}>{sug.secondary}</span>}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* ── POP-UP fiche entreprise ── */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => !submitting && closeModal()}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "oklch(0.15 0.02 40 / 0.55)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            padding: "1.2rem",
            animation: "bs-fade 0.18s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "33rem",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "var(--surface)",
              color: "var(--ink)",
              borderRadius: "1.2rem",
              padding: "clamp(1.5rem, 4vw, 2.4rem)",
              boxShadow: "0 30px 90px oklch(0 0 0 / 0.45)",
              animation: "bs-pop 0.22s cubic-bezier(0.2,0.8,0.2,1)",
            }}
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label={s.change}
              style={{ position: "absolute", top: "0.9rem", right: "0.9rem", background: "var(--paper-2)", border: "none", borderRadius: "50%", width: "2rem", height: "2rem", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--ink-dim)" }}
            >
              <X size={17} />
            </button>

            {/* Métier */}
            {selected.primaryTypeDisplay && (
              <span className="kicker" style={{ marginBottom: "0.7rem", color: "var(--vermilion-deep)" }}>
                {selected.primaryTypeDisplay}
              </span>
            )}

            {/* Nom — mis en avant */}
            <h3 className="d-lg" style={{ margin: "0 0 0.6rem", fontFamily: "var(--font-display)", lineHeight: 1.1 }}>
              {selected.name}
            </h3>

            {/* Note + nombre d'avis */}
            {typeof selected.rating === "number" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                <Stars rating={selected.rating} size={18} />
                <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{selected.rating.toFixed(1)}</span>
                {typeof selected.userRatingCount === "number" && (
                  <span style={{ color: "var(--ink-dim)", fontSize: "0.92rem" }}>
                    · {selected.userRatingCount} {s.reviewsWord}
                  </span>
                )}
              </div>
            )}

            {/* Adresse */}
            {selected.address && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--ink-dim)", fontSize: "0.95rem", marginBottom: "1.1rem" }}>
                <MapPin size={17} style={{ color: "var(--vermilion)", flexShrink: 0, marginTop: "0.1rem" }} />
                <span>{selected.address}</span>
              </div>
            )}

            {/* Avis */}
            {shownReviews.length > 0 && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.1rem", marginBottom: "0.4rem" }}>
                <p style={{ margin: "0 0 0.8rem", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-dim)" }}>
                  {s.reviewsTitle}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {shownReviews.map((r, i) => (
                    <div key={i} style={{ background: "var(--paper-2)", borderRadius: "0.8rem", padding: "0.8rem 0.9rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        {typeof r.rating === "number" && <Stars rating={r.rating} size={13} />}
                        <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{r.author}</span>
                        {r.when && <span style={{ color: "var(--ink-dim)", fontSize: "0.8rem" }}>· {r.when}</span>}
                      </div>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--ink)", lineHeight: 1.5 }}>
                        {r.text.length > 180 ? r.text.slice(0, 180).trimEnd() + "…" : r.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* E-mail facultatif pour recontacter l'entreprise */}
            {!submitted && (
              <input
                type="email"
                value={popupEmail}
                onChange={(e) => setPopupEmail(e.target.value)}
                placeholder={s.popupEmail}
                aria-label={s.popupEmail}
                style={{
                  width: "100%",
                  marginTop: shownReviews.length > 0 || selected.address ? "1.1rem" : "0.4rem",
                  border: "1px solid var(--border)",
                  background: "var(--paper-2)",
                  color: "var(--ink)",
                  borderRadius: "0.7rem",
                  padding: "0.8rem 1rem",
                  fontSize: "0.98rem",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            )}

            {/* Téléphone facultatif */}
            {!submitted && (
              <input
                type="tel"
                value={popupPhone}
                onChange={(e) => setPopupPhone(e.target.value)}
                placeholder={s.manualPhone}
                aria-label={s.manualPhone}
                style={{
                  width: "100%",
                  marginTop: "0.6rem",
                  border: "1px solid var(--border)",
                  background: "var(--paper-2)",
                  color: "var(--ink)",
                  borderRadius: "0.7rem",
                  padding: "0.8rem 1rem",
                  fontSize: "0.98rem",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            )}

            {/* CTA → envoi + remplissage Supabase en arrière-plan */}
            <SubmitButton onClick={() => submitLead(googlePayload(selected))} enabled />
            {statusLine}
          </div>
        </div>
      )}

      <style>{`
        .bs-spin { animation: bs-spin 0.8s linear infinite; }
        @keyframes bs-spin { to { transform: rotate(360deg); } }
        @keyframes bs-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bs-pop { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
      `}</style>
    </>
  );
}
