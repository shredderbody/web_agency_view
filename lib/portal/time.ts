/* ════════════════════════════════════════════════════════════════════════════
   Créneaux — du « douze septembre à seize heures » dicté à l'assistant, vers un
   instant absolu stockable.

   Le piège : un créneau dicté est une HEURE LOCALE DU COMMERCE. « 19h » chez
   Open House, c'est 19h à Bali — pas 19h à Paris, ni 19h UTC. On convertit donc
   avec le fuseau du tenant (`DemoTenant.timezone`), pas celui du serveur ni
   celui du navigateur. Sans ça, le calendrier de l'espace décale les
   réservations de Bali de sept heures et personne ne comprend pourquoi.

   Sans dépendance : `Intl.DateTimeFormat` sait déjà tout ce qu'il faut, y
   compris les changements d'heure.
   ════════════════════════════════════════════════════════════════════════════ */

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** Décalage du fuseau `tz` à l'instant `at`, en millisecondes. */
function offsetMs(at: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(at)) parts[p.type] = p.value;
  const asUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour) % 24, Number(parts.minute), Number(parts.second),
  );
  return asUtc - at.getTime();
}

/** Heure murale d'un fuseau → instant absolu. Deux passes pour les bascules DST. */
export function zonedToUtc(
  y: number, month: number, d: number, h: number, min: number, tz: string,
): Date {
  const naive = Date.UTC(y, month - 1, d, h, min);
  let ts = naive - offsetMs(new Date(naive), tz);
  ts = naive - offsetMs(new Date(ts), tz);
  return new Date(ts);
}

/** `12/09/2026` · `2026-09-12` · `12 septembre 2026` → [année, mois, jour]. */
function parseDate(raw: string, refYear: number): [number, number, number] | null {
  const s = raw.trim().toLowerCase();

  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];

  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/.exec(s);
  if (m) {
    const year = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
    const a = Number(m[1]);
    const b = Number(m[2]);
    // Le schéma des function tools Vapi impose JJ/MM/AAAA pour les douze démos
    // (vérifié dans vapi_export/assistants/*.json), donc JJ/MM par défaut.
    // Mais un assistant qui répond en anglais glisse parfois en MM/JJ : quand
    // le SECOND nombre dépasse 12, ce ne peut pas être un mois, et on retourne
    // la lecture. Aucune supposition dans les cas ambigus — la seule règle sûre.
    if (b > 12 && a <= 12) return [year, a, b];
    return [year, b, a];
  }

  m = /^(\d{1,2})[/.-](\d{1,2})$/.exec(s);
  if (m) return [refYear, Number(m[2]), Number(m[1])];

  m = /^(\d{1,2})\s+([a-zàâçéèêëîïôûùüÿñæœ]+)\.?\s*(\d{4})?/.exec(s);
  if (m) {
    const idx = MONTHS_FR.findIndex((mo) => mo.startsWith(m![2].slice(0, 4)));
    if (idx >= 0) return [m[3] ? Number(m[3]) : refYear, idx + 1, Number(m[1])];
  }
  return null;
}

/** `16:00` · `16h` · `16 h 30` · `4:00 PM` → [heures, minutes]. */
function parseTime(raw: string): [number, number] | null {
  const s = raw.trim().toLowerCase();
  const pm = /\bp\.?m\.?\b/.test(s);
  const am = /\ba\.?m\.?\b/.test(s);
  const m = /(\d{1,2})\s*(?::|h|\.)?\s*(\d{2})?/.exec(s);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  if (pm && h < 12) h += 12;
  if (am && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return [h, min];
}

/**
 * Créneau dicté → ISO UTC. Renvoie `null` si la date est inexploitable : mieux
 * vaut une réservation « sans créneau » à requalifier qu'un rendez-vous inventé
 * posé au mauvais jour dans le calendrier.
 */
export function parseSlot(
  date: unknown, time: unknown, timezone: string, reference = new Date(),
): string | null {
  if (typeof date !== "string" || !date.trim()) return null;
  const refYear = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric" }).format(reference),
  );
  const ymd = parseDate(date, refYear);
  if (!ymd) return null;
  const hm = typeof time === "string" && time.trim() ? parseTime(time) : [0, 0];
  if (!hm) return null;
  const [y, mo, d] = ymd;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return zonedToUtc(y, mo, d, hm[0], hm[1], timezone).toISOString();
}

/** Clé `AAAA-MM-JJ` d'un instant DANS le fuseau du commerce (regroupement calendrier). */
export function dayKeyInZone(iso: string, timezone: string): string {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  });
  return dtf.format(new Date(iso));
}
