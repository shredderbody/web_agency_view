"use client";
import { useEffect, useMemo, useState } from "react";
import { X, Check, ChevronLeft, Minus, Plus } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import type { Service } from "@/lib/vitrineContent";

type Vit = "barber" | "onglerie" | "traiteur" | "resto" | "plombier";
type FD = Record<string, any>;

// ── Time slot banks ───────────────────────────────────────────────────────────
const BARBER_SLOTS  = ["9:00","9:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];
const ONGL_SLOTS    = ["10:00","10:30","11:00","11:30","12:00","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];
const LUNCH_SLOTS   = ["12:00","12:30","13:00","13:30"];
const DINNER_SLOTS  = ["19:00","19:30","20:00","20:30","21:00"];

// ── i18n ──────────────────────────────────────────────────────────────────────
const ML = {
  fr: {
    back: "Retour", next: "Continuer", submit: "Envoyer ma demande",
    close: "Fermer",
    done_title: "C'est noté !",
    titles:  { barber: "Prendre rendez-vous", onglerie: "Réserver un soin", traiteur: "Commander", resto: "Réserver une table", plombier: "Demander un devis" },
    steps:   { barber: ["Prestation","Créneau","Coordonnées"], onglerie: ["Soin","Créneau","Coordonnées"], traiteur: ["Commande","Retrait","Coordonnées"], resto: ["Date & service","Couverts","Coordonnées"], plombier: ["Votre besoin","Disponibilités","Coordonnées"] },
    success: { barber: "Votre demande est enregistrée. Maison Brutus vous confirme votre rendez-vous par SMS.", onglerie: "Réservation prise en compte. L'Atelier Rosé vous confirme par SMS.", traiteur: "Commande enregistrée ! Maison Ferrand vous contacte pour confirmer le retrait.", resto: "Table réservée ! {business} vous confirme par SMS sous peu.", plombier: "Demande reçue ! Julien Mercier vous rappelle sous 24 h avec un devis détaillé." },
    DAYS:   ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],
    MONTHS: ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"],
    service_q: "Quelle prestation souhaitez-vous ?",
    soin_q: "Quel soin souhaitez-vous ?",
    date_l: "Choisissez une date",
    time_l: "Choisissez un horaire",
    name_l: "Votre prénom", phone_l: "Votre téléphone",
    name_ph: "Prénom", phone_ph: "06 00 00 00 00",
    product_q: "Que souhaitez-vous commander ?",
    qty_l: "Quantité / personnes",
    occasion_l: "Occasion (facultatif)", occasion_ph: "Anniversaire, apéro entre amis…",
    retrait_date: "Date de retrait souhaitée",
    retrait_slot: "Créneau de retrait",
    morning: "Matin · 8h – 13h", afternoon: "Après-midi · 15h – 19h",
    service_l: "Service",
    lunch: "Déjeuner", dinner: "Dîner",
    time_resto: "Heure d'arrivée",
    covers_l: "Nombre de couverts",
    occasion_resto: "Occasion particulière ?",
    occ_opts: ["Aucune","Anniversaire","Professionnel","Romantique","Autre"],
    type_l: "Type de prestation",
    desc_l: "Décrivez votre besoin", desc_ph: "Ex : fuite sous l'évier, remplacement du chauffe-eau…",
    urgency_l: "Est-ce urgent ?",
    urgent_yes: "Oui, intervention urgente",
    urgent_no: "Non, planifiable",
    pref_slot: "Créneau préféré pour l'intervention",
    pref_slots: ["Matin · 8h – 12h","Après-midi · 14h – 18h","Peu importe"],
    email_l: "Votre e-mail (facultatif)", email_ph: "vous@exemple.fr",
  },
  en: {
    back: "Back", next: "Continue", submit: "Send my request",
    close: "Close",
    done_title: "All set!",
    titles:  { barber: "Book an appointment", onglerie: "Book a treatment", traiteur: "Place an order", resto: "Book a table", plombier: "Request a quote" },
    steps:   { barber: ["Service","Slot","Details"], onglerie: ["Treatment","Slot","Details"], traiteur: ["Order","Collection","Details"], resto: ["Date & time","Guests","Details"], plombier: ["Your need","Availability","Details"] },
    success: { barber: "Request received! Maison Brutus will confirm your appointment by SMS.", onglerie: "Booking received! L'Atelier Rosé will confirm by SMS.", traiteur: "Order placed! Maison Ferrand will contact you to confirm collection.", resto: "Table reserved! {business} will confirm by SMS.", plombier: "Request received! Julien Mercier will call back within 24 h with a detailed quote." },
    DAYS:   ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    MONTHS: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    service_q: "Which service would you like?",
    soin_q: "Which treatment would you like?",
    date_l: "Choose a date",
    time_l: "Choose a time",
    name_l: "Your first name", phone_l: "Your phone",
    name_ph: "First name", phone_ph: "+33 6 00 00 00 00",
    product_q: "What would you like to order?",
    qty_l: "Quantity / number of guests",
    occasion_l: "Occasion (optional)", occasion_ph: "Birthday, aperitif…",
    retrait_date: "Preferred collection date",
    retrait_slot: "Collection slot",
    morning: "Morning · 8am – 1pm", afternoon: "Afternoon · 3pm – 7pm",
    service_l: "Service",
    lunch: "Lunch", dinner: "Dinner",
    time_resto: "Arrival time",
    covers_l: "Number of guests",
    occasion_resto: "Special occasion?",
    occ_opts: ["None","Birthday","Business","Romantic","Other"],
    type_l: "Type of work",
    desc_l: "Describe your need", desc_ph: "E.g. leak under sink, water heater replacement…",
    urgency_l: "Is it urgent?",
    urgent_yes: "Yes, urgent call-out",
    urgent_no: "No, can be planned",
    pref_slot: "Preferred time slot for the visit",
    pref_slots: ["Morning · 8am – 12pm","Afternoon · 2pm – 6pm","Any time"],
    email_l: "Your email (optional)", email_ph: "you@example.com",
  },
};

// ── Validation ────────────────────────────────────────────────────────────────
function canAdvance(vit: Vit, step: number, fd: FD): boolean {
  if (vit === "barber" || vit === "onglerie") {
    if (step === 0) return !!fd.service;
    if (step === 1) return !!fd.date && !!fd.time;
    if (step === 2) return !!(fd.name?.trim()) && !!(fd.phone?.trim());
  }
  if (vit === "traiteur") {
    if (step === 0) return !!fd.product;
    if (step === 1) return !!fd.date && !!fd.slot;
    if (step === 2) return !!(fd.name?.trim()) && !!(fd.phone?.trim());
  }
  if (vit === "resto") {
    if (step === 0) return !!fd.date && !!fd.mealService && !!fd.time;
    if (step === 1) return (fd.covers ?? 0) >= 1;
    if (step === 2) return !!(fd.name?.trim()) && !!(fd.phone?.trim());
  }
  if (vit === "plombier") {
    if (step === 0) return !!fd.workType;
    if (step === 1) return true;
    if (step === 2) return !!(fd.name?.trim()) && !!(fd.phone?.trim());
  }
  return true;
}

// ── Tiny shared primitives ────────────────────────────────────────────────────
function Label({ text }: { text: string }) {
  return (
    <div style={{ fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-dim)", marginBottom: "0.6rem" }}>
      {text}
    </div>
  );
}

function PillChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ flexShrink: 0, padding: "0.45rem 0.9rem", borderRadius: "99px", border: `1.5px solid ${selected ? "var(--accent)" : "var(--line)"}`, background: selected ? "var(--accent)" : "transparent", color: selected ? "var(--bg)" : "var(--fg)", fontSize: "0.86rem", fontWeight: selected ? 600 : 400, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

function DateChipRow({ dates, selectedDate, onSelect, lang }: { dates: Date[]; selectedDate: Date | undefined; onSelect: (d: Date) => void; lang: "fr" | "en" }) {
  const l = ML[lang];
  return (
    <div style={{ display: "flex", gap: "0.45rem", overflowX: "auto", paddingBottom: "0.2rem", scrollbarWidth: "none" }}>
      {dates.map((d, i) => {
        const sel = selectedDate?.toDateString() === d.toDateString();
        return (
          <button key={i} type="button" onClick={() => onSelect(d)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "0.45rem 0.7rem", borderRadius: "0.65rem", border: `1.5px solid ${sel ? "var(--accent)" : "var(--line)"}`, background: sel ? "var(--accent)" : "transparent", color: sel ? "var(--bg)" : "var(--fg)", cursor: "pointer", minWidth: "3rem", fontFamily: "inherit", transition: "all 0.15s" }}>
            <span style={{ fontSize: "0.66rem", opacity: sel ? 1 : 0.6, marginBottom: "0.1rem" }}>{l.DAYS[d.getDay()]}</span>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1 }}>{d.getDate()}</span>
            <span style={{ fontSize: "0.66rem", opacity: sel ? 1 : 0.6, marginTop: "0.1rem" }}>{l.MONTHS[d.getMonth()]}</span>
          </button>
        );
      })}
    </div>
  );
}

function TimeGrid({ slots, selected, onSelect }: { slots: string[]; selected: string | undefined; onSelect: (t: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
      {slots.map((t) => (
        <button key={t} type="button" onClick={() => onSelect(t)} style={{ padding: "0.42rem 0.8rem", borderRadius: "0.5rem", border: `1.5px solid ${t === selected ? "var(--accent)" : "var(--line)"}`, background: t === selected ? "var(--accent)" : "transparent", color: t === selected ? "var(--bg)" : "var(--fg)", fontSize: "0.86rem", fontWeight: t === selected ? 600 : 400, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}>
          {t}
        </button>
      ))}
    </div>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Label text={label} />
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} style={{ width: "2.3rem", height: "2.3rem", borderRadius: "0.5rem", border: "1.5px solid var(--line)", background: "transparent", cursor: value <= min ? "not-allowed" : "pointer", display: "grid", placeItems: "center", color: "var(--fg)", fontFamily: "inherit", opacity: value <= min ? 0.35 : 1, transition: "opacity 0.15s" }}>
          <Minus size={16} />
        </button>
        <span style={{ fontSize: "1.4rem", fontWeight: 700, minWidth: "2.2rem", textAlign: "center" }}>{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} style={{ width: "2.3rem", height: "2.3rem", borderRadius: "0.5rem", border: "1.5px solid var(--line)", background: "transparent", cursor: value >= max ? "not-allowed" : "pointer", display: "grid", placeItems: "center", color: "var(--fg)", fontFamily: "inherit", opacity: value >= max ? 0.35 : 1, transition: "opacity 0.15s" }}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function TInput({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label text={label} />
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "0.72rem 0.95rem", borderRadius: "0.6rem", border: "1.5px solid var(--line)", background: "var(--bg-2)", color: "var(--fg)", fontSize: "0.95rem", fontFamily: "inherit", outline: "none", transition: "border-color 0.15s" }}
        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
        onBlur={e => (e.target.style.borderColor = "var(--line)")}
      />
    </div>
  );
}

function TArea({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label text={label} />
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        style={{ width: "100%", padding: "0.72rem 0.95rem", borderRadius: "0.6rem", border: "1.5px solid var(--line)", background: "var(--bg-2)", color: "var(--fg)", fontSize: "0.95rem", fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.5, transition: "border-color 0.15s" }}
        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
        onBlur={e => (e.target.style.borderColor = "var(--line)")}
      />
    </div>
  );
}

function ServiceCard({ s, selected, onSelect }: { s: Service; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", padding: "0.85rem 1rem", borderRadius: "0.75rem", border: `1.5px solid ${selected ? "var(--accent)" : "var(--line)"}`, background: selected ? "var(--bg-2)" : "transparent", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit", color: "var(--fg)", transition: "border-color 0.15s, background 0.15s", boxShadow: selected ? "inset 3px 0 0 var(--accent)" : "none" }}>
      <div>
        <div style={{ fontSize: "0.94rem", fontWeight: 600, marginBottom: "0.18rem" }}>{s.name}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--fg-dim)", lineHeight: 1.35 }}>{s.desc}</div>
      </div>
      <div style={{ flexShrink: 0, fontSize: "0.94rem", fontWeight: 700, color: selected ? "var(--accent)" : "var(--fg-dim)", paddingTop: "0.1rem", whiteSpace: "nowrap" }}>{s.price}</div>
    </button>
  );
}

// ── Step content (per vit, per step) ─────────────────────────────────────────
function StepContent({ vit, step, fd, setFd, services, lang, dates }: {
  vit: Vit; step: number; fd: FD; setFd: (fn: (p: FD) => FD) => void;
  services: Service[]; lang: "fr" | "en"; dates: Date[];
}) {
  const l = ML[lang];
  const set = (k: string, v: any) => setFd(p => ({ ...p, [k]: v }));

  // ── STEP 0 ────────────────────────────────────────────────────────────────
  if (step === 0) {
    if (vit === "barber") return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
        <Label text={l.service_q} />
        {services.map(s => <ServiceCard key={s.name} s={s} selected={fd.service === s.name} onSelect={() => set("service", s.name)} />)}
      </div>
    );

    if (vit === "onglerie") return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
        <Label text={l.soin_q} />
        {services.map(s => <ServiceCard key={s.name} s={s} selected={fd.service === s.name} onSelect={() => set("service", s.name)} />)}
      </div>
    );

    if (vit === "traiteur") return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
          <Label text={l.product_q} />
          {services.map(s => <ServiceCard key={s.name} s={s} selected={fd.product === s.name} onSelect={() => set("product", s.name)} />)}
        </div>
        <Stepper label={l.qty_l} value={fd.qty ?? 2} min={1} max={50} onChange={v => set("qty", v)} />
        <TInput label={l.occasion_l} placeholder={l.occasion_ph} value={fd.occasion ?? ""} onChange={v => set("occasion", v)} />
      </div>
    );

    if (vit === "resto") {
      const timeSlots = fd.mealService === "dinner" ? DINNER_SLOTS : LUNCH_SLOTS;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
          <div>
            <Label text={l.date_l} />
            <DateChipRow dates={dates} selectedDate={fd.date} onSelect={d => { set("date", d); set("time", undefined); }} lang={lang} />
          </div>
          <div>
            <Label text={l.service_l} />
            <div style={{ display: "flex", gap: "0.55rem" }}>
              <PillChip label={l.lunch} selected={fd.mealService === "lunch"} onClick={() => { set("mealService", "lunch"); set("time", undefined); }} />
              <PillChip label={l.dinner} selected={fd.mealService === "dinner"} onClick={() => { set("mealService", "dinner"); set("time", undefined); }} />
            </div>
          </div>
          {fd.mealService && (
            <div>
              <Label text={l.time_resto} />
              <TimeGrid slots={timeSlots} selected={fd.time} onSelect={t => set("time", t)} />
            </div>
          )}
        </div>
      );
    }

    if (vit === "plombier") return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
          <Label text={l.type_l} />
          {services.map(s => (
            <button key={s.name} type="button" onClick={() => set("workType", s.name)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem", padding: "0.78rem 1rem", borderRadius: "0.7rem", border: `1.5px solid ${fd.workType === s.name ? "var(--accent)" : "var(--line)"}`, background: fd.workType === s.name ? "var(--bg-2)" : "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit", color: "var(--fg)", transition: "all 0.15s", boxShadow: fd.workType === s.name ? "inset 3px 0 0 var(--accent)" : "none" }}>
              <span style={{ fontSize: "0.91rem", fontWeight: 600 }}>{s.name}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--fg-dim)", flexShrink: 0 }}>{s.price}</span>
            </button>
          ))}
        </div>
        <TArea label={l.desc_l} placeholder={l.desc_ph} value={fd.desc ?? ""} onChange={v => set("desc", v)} />
      </div>
    );
  }

  // ── STEP 1 ────────────────────────────────────────────────────────────────
  if (step === 1) {
    if (vit === "barber" || vit === "onglerie") {
      const slots = vit === "barber" ? BARBER_SLOTS : ONGL_SLOTS;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
          <div>
            <Label text={l.date_l} />
            <DateChipRow dates={dates} selectedDate={fd.date} onSelect={d => { set("date", d); set("time", undefined); }} lang={lang} />
          </div>
          {fd.date && (
            <div>
              <Label text={l.time_l} />
              <TimeGrid slots={slots} selected={fd.time} onSelect={t => set("time", t)} />
            </div>
          )}
        </div>
      );
    }

    if (vit === "traiteur") return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
        <div>
          <Label text={l.retrait_date} />
          <DateChipRow dates={dates} selectedDate={fd.date} onSelect={d => set("date", d)} lang={lang} />
        </div>
        <div>
          <Label text={l.retrait_slot} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <PillChip label={l.morning} selected={fd.slot === "morning"} onClick={() => set("slot", "morning")} />
            <PillChip label={l.afternoon} selected={fd.slot === "afternoon"} onClick={() => set("slot", "afternoon")} />
          </div>
        </div>
      </div>
    );

    if (vit === "resto") {
      const occOpts: string[] = l.occ_opts as string[];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
          <Stepper label={l.covers_l} value={fd.covers ?? 2} min={1} max={12} onChange={v => set("covers", v)} />
          <div>
            <Label text={l.occasion_resto} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {occOpts.map(o => (
                <PillChip key={o} label={o} selected={(fd.diningOccasion ?? occOpts[0]) === o} onClick={() => set("diningOccasion", o)} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (vit === "plombier") {
      const prefSlots: string[] = l.pref_slots as string[];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
          <div>
            <Label text={l.urgency_l} />
            <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
              <PillChip label={l.urgent_yes} selected={fd.urgency === true} onClick={() => set("urgency", true)} />
              <PillChip label={l.urgent_no} selected={fd.urgency === false} onClick={() => set("urgency", false)} />
            </div>
          </div>
          <div>
            <Label text={l.pref_slot} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {prefSlots.map(s => (
                <PillChip key={s} label={s} selected={fd.preferredSlot === s} onClick={() => set("preferredSlot", s)} />
              ))}
            </div>
          </div>
        </div>
      );
    }
  }

  // ── STEP 2: Contact ───────────────────────────────────────────────────────
  if (step === 2) return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      <TInput label={l.name_l} placeholder={l.name_ph} value={fd.name ?? ""} onChange={v => set("name", v)} />
      <TInput label={l.phone_l} placeholder={l.phone_ph} value={fd.phone ?? ""} onChange={v => set("phone", v)} type="tel" />
      {vit === "plombier" && (
        <TInput label={l.email_l} placeholder={l.email_ph} value={fd.email ?? ""} onChange={v => set("email", v)} type="email" />
      )}
    </div>
  );

  return null;
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function OrderModal({ vit, services, business, onClose }: {
  vit: Vit; services: Service[]; business: string; onClose: () => void;
}) {
  const { lang } = useLang();
  const l = ML[lang];
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [fd, setFd] = useState<FD>({ covers: 2, qty: 2 });

  const TOTAL_STEPS = 3;

  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i + 1);
      return d;
    });
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Masque la bulle Vapi tant que la modale est ouverte : sur mobile, la bulle
    // fixe en bas à droite recouvre le bouton d'action de la modale (cf. CSS
    // `body.om-open [data-vapi-metier]` dans globals.css).
    document.body.classList.add("om-open");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("om-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const ok = canAdvance(vit, step, fd);
  const stepsLabels: string[] = (l.steps as any)[vit];
  const title: string = (l.titles as any)[vit];
  const successMsg: string = ((l.success as any)[vit] as string).replace("{business}", business);
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />

      {/* Container */}
      <div className="om-container" style={{ position: "fixed", inset: 0, zIndex: 201, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", pointerEvents: "none" }}>
        <div
          className="om-panel"
          role="dialog" aria-modal="true" aria-label={title}
          style={{ pointerEvents: "auto", width: "min(520px, 100%)", maxHeight: "min(92dvh, 720px)", background: "var(--bg)", color: "var(--fg)", borderRadius: "1.5rem", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 30px 90px oklch(0 0 0 / 0.5), 0 0 0 1px var(--line)", animation: "omIn 0.34s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {!done ? (
            <>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.25rem 1rem", borderBottom: "1px solid var(--line)", flexShrink: 0, gap: "0.75rem" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--fg-dim)", marginTop: "0.1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{business}</div>
                </div>
                <button onClick={onClose} aria-label="Fermer" style={{ flexShrink: 0, width: "2.1rem", height: "2.1rem", borderRadius: "0.5rem", border: "1.5px solid var(--line)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--fg)", fontFamily: "inherit" }}>
                  <X size={15} />
                </button>
              </div>

              {/* Progress bar + step name */}
              <div style={{ padding: "0.85rem 1.25rem 0.5rem", flexShrink: 0, borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.55rem" }}>
                  {stepsLabels.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: "3px", borderRadius: "99px", background: i <= step ? "var(--accent)" : "var(--line)", transition: "background 0.3s ease" }} />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.04em" }}>{stepsLabels[step]}</span>
                  <span style={{ fontSize: "0.74rem", color: "var(--fg-dim)" }}>· {step + 1} / {TOTAL_STEPS}</span>
                </div>
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", scrollbarWidth: "thin" }}>
                <StepContent vit={vit} step={step} fd={fd} setFd={setFd} services={services} lang={lang} dates={dates} />
              </div>

              {/* Footer */}
              <div style={{ flexShrink: 0, borderTop: "1px solid var(--line)", padding: "0.9rem 1.25rem", display: "flex", gap: "0.65rem", background: "var(--bg-2)" }}>
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.7rem 1rem", borderRadius: "0.6rem", border: "1.5px solid var(--line)", background: "transparent", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500, color: "var(--fg)", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0 }}>
                    <ChevronLeft size={15} /> {l.back}
                  </button>
                )}
                <button
                  onClick={() => { if (!ok) return; if (!isLast) setStep(s => s + 1); else setDone(true); }}
                  disabled={!ok}
                  style={{ flex: 1, padding: "0.7rem 1rem", borderRadius: "0.6rem", border: "none", background: ok ? "var(--accent)" : "var(--line)", color: ok ? "var(--bg)" : "var(--fg-dim)", cursor: ok ? "pointer" : "not-allowed", fontSize: "0.95rem", fontWeight: 700, fontFamily: "inherit", transition: "all 0.2s", opacity: ok ? 1 : 0.55 }}
                >
                  {isLast ? l.submit : l.next}
                </button>
              </div>
            </>
          ) : (
            /* Success */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.8rem 2rem", textAlign: "center", gap: "1.3rem" }}>
              <div style={{ width: "4.2rem", height: "4.2rem", borderRadius: "50%", background: "var(--accent)", display: "grid", placeItems: "center", color: "var(--bg)", animation: "omCheckIn 0.4s cubic-bezier(0.16,1,0.3,1) 0.12s both" }}>
                <Check size={26} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: "1.45rem", fontWeight: 700, marginBottom: "0.55rem" }}>{l.done_title}</div>
                <div style={{ fontSize: "0.96rem", color: "var(--fg-dim)", maxWidth: "34ch", lineHeight: 1.55 }}>{successMsg}</div>
              </div>
              <button onClick={onClose} style={{ marginTop: "0.5rem", padding: "0.72rem 2rem", borderRadius: "0.6rem", border: "1.5px solid var(--line)", background: "transparent", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "var(--fg)", fontFamily: "inherit" }}>
                {l.close}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes omIn { from { opacity: 0; transform: scale(0.94) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes omInMobile { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes omCheckIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @media (max-width: 600px) {
          .om-container { align-items: flex-end !important; padding: 0 !important; }
          .om-panel { width: 100% !important; max-width: 100% !important; max-height: 92dvh !important; border-radius: 1.4rem 1.4rem 0 0 !important; animation-name: omInMobile !important; }
        }
        .om-panel input, .om-panel textarea { font-size: 1rem !important; }
      `}</style>
    </>
  );
}
