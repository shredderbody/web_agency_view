import type { Lang } from "@/lib/i18n";
import { portalStrings } from "@/lib/portal/portalStrings";

/* Formatage partagé de l'espace. Regroupé ici pour que « 1 h 04 » s'écrive
   pareil dans une tuile, une carte et un tableau — la cohérence d'unités est
   une part du soin, pas un détail.

   ⚠️ TOUT PREND LA LANGUE EN ARGUMENT. `fr-FR` a longtemps été écrit en dur ici,
   et c'est ce qui empêchait l'espace d'être réellement bilingue : un tableau de
   bord en anglais qui annonce « 4 septembre » et « il y a 3 j » n'est pas
   traduit, il est à moitié traduit — ce qui se remarque davantage. */

const loc = (lang: Lang) => portalStrings(lang).locale;

export function fmtDuration(seconds: number, lang: Lang): { value: string; unit: string } {
  const f = portalStrings(lang).fmt;
  if (seconds < 60) return { value: String(Math.round(seconds)), unit: f.unitS };
  const min = Math.floor(seconds / 60);
  if (min < 60) return { value: String(min), unit: f.unitMin };
  const h = Math.floor(min / 60);
  return { value: f.hoursMins(h, String(min % 60).padStart(2, "0")), unit: "" };
}

export function fmtCost(usd: number, lang: Lang): string {
  if (usd === 0) return (0).toLocaleString(loc(lang), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return usd.toLocaleString(loc(lang), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtNumber(n: number, lang: Lang): string {
  return n.toLocaleString(loc(lang));
}

/** Date + heure DANS le fuseau du commerce (cf. lib/portal/time.ts). */
export function fmtSlot(iso: string | null, timezone: string, lang: Lang): string {
  if (!iso) return portalStrings(lang).fmt.noSlot;
  const out = new Intl.DateTimeFormat(loc(lang), {
    timeZone: timezone, weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
  // « 19:30 » s'écrit « 19h30 » en français, et reste tel quel en anglais.
  return lang === "fr" ? out.replace(":", "h") : out;
}

export function fmtTimeOnly(iso: string | null, timezone: string, lang: Lang): string {
  if (!iso) return "—";
  const out = new Intl.DateTimeFormat(loc(lang), {
    timeZone: timezone, hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
  return lang === "fr" ? out.replace(":", "h") : out;
}

export function fmtDayLabel(day: string, lang: Lang): string {
  return new Intl.DateTimeFormat(loc(lang), {
    day: "numeric", month: "long", timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
}

/** Mois et année, pour l'en-tête du calendrier. */
export function fmtMonth(month: string, lang: Lang): string {
  return new Intl.DateTimeFormat(loc(lang), {
    month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${month}-01T12:00:00Z`));
}

/** Jour en toutes lettres, pour le titre d'une journée sélectionnée. */
export function fmtFullDay(day: string, lang: Lang): string {
  return new Intl.DateTimeFormat(loc(lang), {
    weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
}

/** Date et heure complètes — sert d'infobulle sur un horodatage relatif. */
export function fmtExact(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(loc(lang));
}

/** « il y a 3 h », « 3 h ago ». Pour un journal, le relatif se lit plus vite. */
export function fmtAgo(iso: string, lang: Lang): string {
  const f = portalStrings(lang).fmt;
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return f.now;
  if (min < 60) return f.minsAgo(min);
  const h = Math.round(min / 60);
  if (h < 24) return f.hoursAgo(h);
  const d = Math.round(h / 24);
  if (d < 31) return f.daysAgo(d);
  return new Intl.DateTimeFormat(loc(lang), { day: "numeric", month: "short" }).format(new Date(iso));
}

/* ── Saisie d'un créneau ──────────────────────────────────────────────────
   Ces deux-là ne dépendent PAS de la langue : `<input type="datetime-local">`
   parle toujours `AAAA-MM-JJTHH:MM`, quelle que soit la langue affichée. */

/** Valeur pour un <input type="datetime-local"> exprimée dans le fuseau du commerce. */
export function toLocalInput(iso: string | null, timezone: string): string {
  if (!iso) return "";
  const p: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date(iso))) p[part.type] = part.value;
  return `${p.year}-${p.month}-${p.day}T${String(Number(p.hour) % 24).padStart(2, "0")}:${p.minute}`;
}

/** L'inverse : saisie « heure du commerce » → instant absolu. */
export function fromLocalInput(value: string, timezone: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number) as unknown as number[];
  const naive = Date.UTC(y, mo - 1, d, h, mi);
  const off = (at: number) => {
    const p: Record<string, string> = {};
    for (const part of new Intl.DateTimeFormat("en-US", {
      timeZone: timezone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(new Date(at))) p[part.type] = part.value;
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - at;
  };
  let ts = naive - off(naive);
  ts = naive - off(ts);
  return new Date(ts).toISOString();
}
