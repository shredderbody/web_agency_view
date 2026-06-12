"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

// Champ du formulaire pré-rempli (libellé + contrôle), style cohérent pop-up.
const popupFieldStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border-strong)",
  background: "oklch(0.965 0.05 88)",
  color: "var(--ink)",
  borderRadius: "0.7rem",
  padding: "0.8rem 1rem",
  fontSize: "0.98rem",
  fontFamily: "inherit",
  outline: "none",
};

function PopupField({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} style={{ display: "block", margin: "0 0 0.35rem", fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// Devine un secteur (parmi la liste contrôlée s.sectors, même ordre/index) à
// partir des types Google Places — comparaison exacte sur les valeurs d'énum
// Google (https://developers.google.com/maps/documentation/places/web-service/place-types)
// pour éviter les faux positifs de sous-chaîne (ex. "bar" ⊂ "barber_shop").
const SECTOR_TYPE_INDEX: Record<string, number> = {
  restaurant: 0, food: 0, bakery: 0, cafe: 0, bar: 0, meal_takeaway: 0, meal_delivery: 0, catering_service: 0,
  barber_shop: 1, hair_care: 1, hair_salon: 1,
  beauty_salon: 2, spa: 2, nail_salon: 2, massage: 2,
  doctor: 3, dentist: 3, health: 3, medical_lab: 3, pharmacy: 3, physiotherapist: 3, hospital: 3,
  plumber: 4, electrician: 4, general_contractor: 4, roofing_contractor: 4, locksmith: 4, painter: 4,
  store: 5, clothing_store: 5, shopping_mall: 5, supermarket: 5, florist: 5, jewelry_store: 5,
  hotel: 6, lodging: 6, travel_agency: 6, tourist_attraction: 6, campground: 6,
  gym: 7, stadium: 7, sports_club: 7, fitness_center: 7,
  real_estate_agency: 8, lawyer: 8, accounting: 8, insurance_agency: 8, laundry: 8, moving_company: 8,
};

function guessSector(p: Place, sectors: string[]): string {
  for (const t of [p.primaryType, ...(p.types ?? [])]) {
    if (!t) continue;
    const idx = SECTOR_TYPE_INDEX[t.toLowerCase()];
    if (idx !== undefined) return sectors[idx] ?? "";
  }
  return sectors[sectors.length - 1] ?? ""; // "Autre" / "Other"
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
  // Champs « entreprise trouvée », pré-remplis depuis Google Places puis modifiables.
  const [gName, setGName] = useState("");
  const [gSector, setGSector] = useState("");
  const [gAddress, setGAddress] = useState("");
  const [gWebsite, setGWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  // Chargement des détails Google (fiche déjà ouverte, infos en cours d'enrichissement).
  const [detailsLoading, setDetailsLoading] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  // Jeton de session Places : partagé par toutes les frappes d'autocomplétion ET
  // le Place Details final → une seule session facturée. Régénéré après sélection.
  const newToken = () =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2);
  const sessionTokenRef = useRef<string>(newToken());

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
        const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(q)}&lang=${lang}&sessiontoken=${sessionTokenRef.current}`);
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
    // Masque la bulle Vapi tant que la fiche est ouverte : sur mobile, la bulle
    // fixe en bas à droite recouvre le bouton d'envoi (même règle CSS que
    // l'OrderModal — `body.om-open [data-vapi-metier]` dans globals.css).
    document.body.classList.add("om-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      document.body.classList.remove("om-open");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, submitting]);

  async function pick(sug: Suggestion) {
    setOpen(false);
    setSubmitted(false);
    setError(false);
    // Ouvre la fiche IMMÉDIATEMENT avec les infos de base (nom + adresse) : retour
    // visuel instantané, puis on enrichit dès que Place Details répond. Évite
    // l'impression de « système figé » pendant l'appel réseau.
    setSelected({ id: sug.id, name: sug.main, address: sug.secondary });
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/places/details?id=${encodeURIComponent(sug.id)}&lang=${lang}&sessiontoken=${sessionTokenRef.current}`);
      const data = await res.json();
      if (data?.id) setSelected(data as Place); // sinon on garde la fiche de base
    } catch {
      /* on conserve la fiche de base déjà affichée */
    } finally {
      // La session est consommée par ce Place Details → on en ouvre une neuve.
      sessionTokenRef.current = newToken();
      setDetailsLoading(false);
    }
  }

  // Pré-remplit le formulaire éditable dès qu'une fiche Google est sélectionnée
  // (et le ré-initialise sur demande, bouton « Réinitialiser »).
  function prefillFromGoogle(p: Place) {
    setGName(p.name ?? "");
    setGSector(guessSector(p, s.sectors));
    setGAddress(p.address ?? "");
    setGWebsite(p.website ?? "");
    setPopupPhone(p.phoneNational ?? "");
  }

  useEffect(() => {
    if (selected) prefillFromGoogle(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  function closeModal() {
    setSelected(null);
    setDetailsLoading(false);
    setSubmitted(false);
    setError(false);
    setPopupEmail("");
    setPopupPhone("");
    setGName("");
    setGSector("");
    setGAddress("");
    setGWebsite("");
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
      // Champs modifiés par le prospect dans le formulaire pré-rempli (sinon valeur Google).
      name: gName.trim() || p.name,
      sector: gSector.trim() || undefined,
      primary_type: p.primaryType,
      primary_type_display: p.primaryTypeDisplay,
      types: p.types,
      formatted_address: gAddress.trim() || p.address,
      street_number: p.streetNumber,
      route: p.route,
      locality: p.locality,
      postal_code: p.postalCode,
      admin_area: p.adminArea,
      country: p.country,
      latitude: p.latitude,
      longitude: p.longitude,
      phone_national: popupPhone.trim() || p.phoneNational,
      phone_international: p.phoneInternational,
      email: popupEmail.trim(),
      website: gWebsite.trim() || p.website,
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

          {/* Liste d'autocomplétion : ancrée juste sous le champ de saisie
              (top:100%), elle recouvre l'aide/le lien en dessous au lieu de
              s'insérer dans le flux. */}
          {open && (suggestions.length > 0 || (searched && !loading)) && (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: "0.3rem",
                position: "absolute",
                top: "calc(100% + 0.4rem)",
                left: 0,
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
      </div>

      {/* ── POP-UP fiche entreprise ── */}
      {/* Rendue via portal sur <body> : indispensable car ce composant est rendu
          à l'intérieur d'un <Reveal> dont l'animation laisse un `transform`, ce qui
          ferait du conteneur (et son overflow:hidden) le bloc de référence du
          position:fixed → modale rognée/piégée. Le portal la sort du flux. */}
      {selected && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => !submitting && closeModal()}
          className="bs-overlay"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            // Voile sombre opaque, SANS backdrop-filter : le flou plein écran
            // forçait le GPU à re-flouter tout le viewport en continu → arrière-plan
            // figé/saccadé tant que la modale était ouverte.
            background: "oklch(0.15 0.02 40 / 0.66)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Marge de sécurité tout autour + respect des encoches (safe-area).
            padding:
              "max(1.2rem, env(safe-area-inset-top)) max(1.2rem, env(safe-area-inset-right)) max(1.2rem, env(safe-area-inset-bottom)) max(1.2rem, env(safe-area-inset-left))",
            animation: "bs-fade 0.18s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bs-panel"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "33rem",
              // dvh (et non vh) → tient compte des barres mobiles ; jamais coupée.
              maxHeight: "min(88dvh, 46rem)",
              // Colonne flex : en-tête fixe + corps scrollable. Le bouton fermer
              // reste TOUJOURS visible (avant il défilait avec le contenu → on se
              // retrouvait piégé dans la modale sur mobile).
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "var(--surface)",
              color: "var(--ink)",
              borderRadius: "1.2rem",
              boxShadow: "0 30px 90px oklch(0 0 0 / 0.45)",
              animation: "bs-pop 0.22s cubic-bezier(0.2,0.8,0.2,1)",
            }}
          >
            {/* En-tête fixe (non scrollable) : poignée de glissement (mobile) +
                bouton fermer toujours accessible. */}
            <div
              className="bs-panel-head"
              style={{ flexShrink: 0, position: "relative", display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "0.8rem 0.8rem 0.4rem" }}
            >
              <span className="bs-grab" aria-hidden style={{ display: "none", position: "absolute", top: "0.5rem", left: "50%", transform: "translateX(-50%)", width: "2.6rem", height: "0.28rem", borderRadius: "99px", background: "var(--border-strong)" }} />
              <button
                type="button"
                onClick={closeModal}
                aria-label={s.change}
                style={{ background: "var(--paper-2)", border: "none", borderRadius: "50%", width: "2rem", height: "2rem", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--ink-dim)" }}
              >
                <X size={17} />
              </button>
            </div>

            {/* Corps scrollable */}
            <div
              className="bs-panel-body"
              style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "0.2rem clamp(1.5rem, 4vw, 2.4rem) clamp(1.5rem, 4vw, 2.4rem)" }}
            >
            {/* Bandeau : informations pré-remplies depuis Google Places */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "oklch(0.94 0.05 150)",
                color: "oklch(0.4 0.09 150)",
                border: "1px solid oklch(0.82 0.08 150)",
                borderRadius: "0.6rem",
                padding: "0.55rem 0.85rem",
                marginBottom: "1rem",
                fontSize: "0.86rem",
                fontWeight: 700,
              }}
            >
              {detailsLoading ? <Loader2 size={15} className="bs-spin" /> : <Check size={15} />}
              {detailsLoading ? s.searching : s.loadedFromGoogle}
            </div>

            {/* Note + nombre d'avis (repère visuel : « c'est bien votre établissement ») */}
            {typeof selected.rating === "number" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.1rem", flexWrap: "wrap" }}>
                <Stars rating={selected.rating} size={16} />
                <span style={{ fontWeight: 700, fontSize: "0.98rem" }}>{selected.rating.toFixed(1)}</span>
                {typeof selected.userRatingCount === "number" && (
                  <span style={{ color: "var(--ink-dim)", fontSize: "0.88rem" }}>
                    · {selected.userRatingCount} {s.reviewsWord}
                  </span>
                )}
              </div>
            )}

            {/* Formulaire pré-rempli depuis Google Places — entièrement modifiable avant envoi */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <PopupField label={s.fieldName} htmlFor="g-name">
                <input id="g-name" type="text" value={gName} onChange={(e) => setGName(e.target.value)} placeholder={s.manualName} aria-label={s.fieldName} style={popupFieldStyle} />
              </PopupField>

              <PopupField label={s.fieldSector} htmlFor="g-sector">
                <select id="g-sector" value={gSector} onChange={(e) => setGSector(e.target.value)} aria-label={s.fieldSector} style={{ ...popupFieldStyle, cursor: "pointer" }}>
                  <option value="" disabled>{s.sectorPlaceholder}</option>
                  {s.sectors.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </PopupField>

              <PopupField label={s.fieldAddress} htmlFor="g-address">
                <input id="g-address" type="text" value={gAddress} onChange={(e) => setGAddress(e.target.value)} placeholder={s.fieldAddress} aria-label={s.fieldAddress} style={popupFieldStyle} />
              </PopupField>

              <PopupField label={s.fieldWebsite} htmlFor="g-website">
                <input id="g-website" type="url" value={gWebsite} onChange={(e) => setGWebsite(e.target.value)} placeholder={s.websitePlaceholder} aria-label={s.fieldWebsite} style={popupFieldStyle} />
              </PopupField>

              <PopupField label={s.popupEmailLabel} htmlFor="popup-email">
                <input id="popup-email" type="email" value={popupEmail} onChange={(e) => setPopupEmail(e.target.value)} placeholder={s.popupEmail} aria-label={s.popupEmail} style={popupFieldStyle} />
              </PopupField>

              <PopupField label={s.fieldPhone} htmlFor="popup-phone">
                <input id="popup-phone" type="tel" value={popupPhone} onChange={(e) => setPopupPhone(e.target.value)} placeholder={s.manualPhone} aria-label={s.fieldPhone} style={popupFieldStyle} />
              </PopupField>
            </div>

            {/* Avis — preuve sociale, conservée sous le formulaire */}
            {shownReviews.length > 0 && (
              <div style={{ borderTop: "1px solid var(--border)", marginTop: "1.2rem", paddingTop: "1.1rem", marginBottom: "0.4rem" }}>
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

            {/* Réinitialiser → revient aux valeurs d'origine Google Places */}
            {!submitted && (
              <button
                type="button"
                onClick={() => prefillFromGoogle(selected)}
                style={{
                  marginTop: "1.1rem",
                  background: "transparent",
                  border: "1.5px solid var(--border-strong)",
                  borderRadius: "0.6rem",
                  cursor: "pointer",
                  color: "var(--ink-dim)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  padding: "0.55rem 1rem",
                }}
              >
                {s.reset}
              </button>
            )}

            {/* CTA → envoi + remplissage Supabase en arrière-plan */}
            <SubmitButton onClick={() => submitLead(googlePayload(selected))} enabled={!!gName.trim() && !detailsLoading} />
            {statusLine}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .bs-spin { animation: bs-spin 0.8s linear infinite; }
        @keyframes bs-spin { to { transform: rotate(360deg); } }
        @keyframes bs-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bs-pop { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes bs-pop-mobile { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: none; } }
        /* Format mobile : la fiche devient une feuille plein écran ancrée en bas,
           coins hauts arrondis, padding bas sécurisé (safe-area) pour ne rien couper. */
        @media (max-width: 600px) {
          .bs-overlay { align-items: flex-end !important; padding: 0 !important; }
          .bs-panel {
            max-width: 100% !important;
            max-height: 92dvh !important;
            border-radius: 1.2rem 1.2rem 0 0 !important;
            animation-name: bs-pop-mobile !important;
          }
          /* Poignée de glissement visible (affordance de fermeture) + en-tête
             un peu plus haut pour la loger. */
          .bs-grab { display: block !important; }
          .bs-panel-head { padding-top: 1rem !important; }
          /* Le corps scrollable porte le padding + le bas sécurisé (safe-area). */
          .bs-panel-body {
            padding: 0.2rem 1.25rem max(1.6rem, calc(env(safe-area-inset-bottom) + 0.8rem)) !important;
          }
          /* 16px mini sur les champs → empêche le zoom auto iOS à la mise au point. */
          .bs-panel input, .bs-panel select { font-size: 1rem !important; }
        }
      `}</style>
    </>
  );
}
