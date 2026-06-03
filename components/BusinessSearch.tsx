"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Search, X } from "lucide-react";
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
  const [form, setForm] = useState({ name: "", trade: "", city: "", phone: "" });
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
        const res = await fetch(
          `/api/places/autocomplete?q=${encodeURIComponent(q)}&lang=${lang}`
        );
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

  async function pick(sug: Suggestion) {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/places/details?id=${encodeURIComponent(sug.id)}&lang=${lang}`
      );
      const data = await res.json();
      if (data?.id) {
        setSelected(data as Place);
      } else {
        setSelected({ id: sug.id, name: sug.main, address: sug.secondary });
      }
    } catch {
      setSelected({ id: sug.id, name: sug.main, address: sug.secondary });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSelected(null);
    setQuery("");
    setSuggestions([]);
    setSearched(false);
    setOpen(false);
    setError(false);
  }

  // Mappe les données vers les colonnes de la table business_leads.
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
      phone_national: p.phoneNational,
      phone_international: p.phoneInternational,
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

  const manualValid = !!(form.name.trim() && form.trade.trim() && form.city.trim());

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

  const submitBtnStyle = (enabled: boolean): React.CSSProperties => ({
    marginTop: "0.8rem",
    width: "100%",
    background: "var(--surface)",
    color: "var(--ink)",
    justifyContent: "center",
    opacity: enabled ? 1 : 0.5,
    pointerEvents: enabled ? "auto" : "none",
    border: "none",
    cursor: enabled ? "pointer" : "default",
  });

  const errorLine = error && (
    <p style={{ margin: "0.6rem 0 0", fontSize: "0.85rem", color: "oklch(0.96 0.02 40)" }}>
      {s.errorMsg}
    </p>
  );

  // ── État confirmation (lead enregistré) ──
  if (submitted) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.7rem",
          background: "var(--surface)",
          color: "var(--ink)",
          borderRadius: "0.7rem",
          padding: "1rem 1.1rem",
        }}
      >
        <span
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: "2rem",
            height: "2rem",
            flexShrink: 0,
            borderRadius: "50%",
            background: "var(--vermilion)",
            color: "var(--surface)",
          }}
        >
          <Check size={18} />
        </span>
        <p style={{ margin: 0, fontSize: "0.95rem" }}>{s.success}</p>
      </div>
    );
  }

  // ── État sélectionné : carte de confirmation + envoi ──
  if (selected) {
    return (
      <div style={{ width: "100%" }}>
        <p style={{ margin: "0 0 0.6rem", fontSize: "0.9rem", color: "oklch(0.96 0.02 40)" }}>
          {s.foundLabel}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.7rem",
            background: "var(--surface)",
            color: "var(--ink)",
            borderRadius: "0.7rem",
            padding: "0.9rem 1rem",
          }}
        >
          <MapPin size={20} style={{ color: "var(--vermilion)", flexShrink: 0, marginTop: "0.15rem" }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontFamily: "var(--font-display)" }}>{selected.name}</div>
            {selected.address && (
              <div style={{ fontSize: "0.9rem", color: "var(--ink-dim)" }}>{selected.address}</div>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label={s.change}
            title={s.change}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-dim)",
              padding: "0.2rem",
              display: "inline-flex",
            }}
          >
            <X size={18} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => submitLead(googlePayload(selected))}
          className="btn btn-lg"
          disabled={submitting}
          style={submitBtnStyle(!submitting)}
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
        {errorLine}
      </div>
    );
  }

  // ── État saisie manuelle (entreprise absente de Google) ──
  if (manual) {
    const fieldStyle: React.CSSProperties = { ...inputBase, padding: "0.8rem 1rem" };
    return (
      <div style={{ width: "100%" }}>
        <p style={{ margin: "0 0 0.7rem", fontSize: "0.9rem", color: "oklch(0.96 0.02 40)" }}>
          {s.manualTitle}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={s.manualName}
            aria-label={s.manualName}
            style={fieldStyle}
          />
          <input
            type="text"
            value={form.trade}
            onChange={(e) => setForm((f) => ({ ...f, trade: e.target.value }))}
            placeholder={s.manualTrade}
            aria-label={s.manualTrade}
            style={fieldStyle}
          />
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder={s.manualCity}
            aria-label={s.manualCity}
            style={fieldStyle}
          />
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder={s.manualPhone}
            aria-label={s.manualPhone}
            style={fieldStyle}
          />
        </div>
        <button
          type="button"
          onClick={() => submitLead(manualPayload())}
          className="btn btn-lg"
          disabled={!manualValid || submitting}
          style={submitBtnStyle(manualValid && !submitting)}
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
        {errorLine}
        <button
          type="button"
          onClick={() => setManual(false)}
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
      </div>
    );
  }

  // ── État recherche ──
  return (
    <div ref={boxRef} style={{ width: "100%", position: "relative" }}>
      <label
        htmlFor="business-search"
        style={{ display: "block", margin: "0 0 0.5rem", fontSize: "0.9rem", color: "oklch(0.96 0.02 40)" }}
      >
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
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.82rem", color: "oklch(0.96 0.02 40 / 0.85)" }}>
        {s.hint}
      </p>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setManual(true);
        }}
        style={{
          marginTop: "0.55rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--surface)",
          fontSize: "0.85rem",
          textDecoration: "underline",
          padding: 0,
        }}
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
            <li style={{ padding: "0.7rem 0.8rem", fontSize: "0.9rem", color: "var(--ink-dim)" }}>
              {s.noResults}
            </li>
          ) : (
            suggestions.map((sug) => (
              <li key={sug.id}>
                <button
                  type="button"
                  onClick={() => pick(sug)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.6rem",
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.6rem 0.7rem",
                    borderRadius: "0.5rem",
                    color: "var(--ink)",
                    fontSize: "0.95rem",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <MapPin size={16} style={{ color: "var(--vermilion)", flexShrink: 0, marginTop: "0.15rem" }} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600 }}>{sug.main}</span>
                    {sug.secondary && (
                      <span style={{ display: "block", fontSize: "0.85rem", color: "var(--ink-dim)" }}>
                        {sug.secondary}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      <style>{`
        .bs-spin { animation: bs-spin 0.8s linear infinite; }
        @keyframes bs-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
