/* Formatage partagé de l'espace. Regroupé ici pour que « 1 h 04 » s'écrive
   pareil dans une tuile, une carte et un tableau — la cohérence d'unités est
   une part du soin, pas un détail. */

export function fmtDuration(seconds: number): { value: string; unit: string } {
  if (seconds < 60) return { value: String(Math.round(seconds)), unit: "\u202fs" };
  const min = Math.floor(seconds / 60);
  if (min < 60) return { value: String(min), unit: "\u202fmin" };
  const h = Math.floor(min / 60);
  return { value: `${h} h ${String(min % 60).padStart(2, "0")}`, unit: "" };
}

export function fmtCost(usd: number): string {
  if (usd === 0) return "0,00";
  return usd.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtNumber(n: number): string {
  return n.toLocaleString("fr-FR");
}

/** Date + heure DANS le fuseau du commerce (cf. lib/portal/time.ts). */
export function fmtSlot(iso: string | null, timezone: string): string {
  if (!iso) return "Créneau à préciser";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone, weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso)).replace(":", "h");
}

export function fmtTimeOnly(iso: string | null, timezone: string): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone, hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso)).replace(":", "h");
}

export function fmtDayLabel(day: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric", month: "long", timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
}

/** « il y a 3 h », « il y a 2 j ». Pour un journal, le relatif se lit plus vite. */
export function fmtAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 31) return `il y a ${d} j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(iso));
}

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
