// ⚠️ MODULE SERVEUR UNIQUEMENT (lit PORTAL_SECRET).

import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_SLUG, getTenant } from "./registry";

/* ════════════════════════════════════════════════════════════════════════════
   Session de l'espace client.

   Reprise du login de ~/receptionist (Zerocall) : même flux, même vocabulaire,
   même sensation. MAIS pas la même mécanique — et c'est délibéré :

   receptionist s'appuie sur Supabase Auth (`profiles`, `organizations`, OAuth
   Google). Rien de tout ça n'existe ici : les démos n'ont pas de comptes
   utilisateurs, elles ont des SLUGS. Recréer Supabase Auth pour douze vitrines
   de démonstration serait une usine à gaz, avec un annuaire d'utilisateurs à
   maintenir à la main.

   Donc : un CODE D'ACCÈS par slug, et un cookie signé HMAC-SHA256 (HttpOnly,
   SameSite=Lax). Zéro dépendance, zéro table, révocable en changeant
   PORTAL_SECRET. Le code de chaque démo est DÉRIVÉ du secret : rien à créer
   quand une démo s'ajoute, et l'espace admin les affiche pour les transmettre.
   ════════════════════════════════════════════════════════════════════════════ */

export const SESSION_COOKIE = "av_espace";
const SESSION_TTL_S = 60 * 60 * 12; // 12 h : une journée de travail, pas plus.

export type PortalRole = "client" | "admin";
export type PortalSession = { slug: string; role: PortalRole; exp: number };

function secret(): string {
  const s = process.env.PORTAL_SECRET;
  if (s && s.length >= 16) return s;
  // Repli explicite : sans secret configuré, l'espace reste utilisable en local
  // mais le signale (cf. `isUsingFallbackSecret`). En production, poser
  // PORTAL_SECRET dans .env.
  return "atelier-vitrine-espace-dev-secret-change-me";
}

export function isUsingFallbackSecret(): boolean {
  return !process.env.PORTAL_SECRET || process.env.PORTAL_SECRET.length < 16;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Comparaison à temps constant : un code d'accès ne se devine pas au chrono. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/* ── Codes d'accès ──────────────────────────────────────────────────────────
   Dérivés : HMAC(secret, "code:<slug>") → 8 caractères sans ambiguïté visuelle
   (ni 0/O, ni 1/I/L : ces codes se dictent au téléphone). Surchargeables par
   PORTAL_CODE_<SLUG_EN_MAJUSCULES_AVEC_UNDERSCORES>, et PORTAL_ADMIN_CODE pour
   l'administrateur.                                                           */

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function derivedCode(slug: string): string {
  const digest = createHmac("sha256", secret()).update(`code:${slug}`).digest();
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPHABET[digest[i] % ALPHABET.length];
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

function envOverride(slug: string): string | undefined {
  const key = `PORTAL_CODE_${slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  return process.env[key];
}

/** Code d'accès d'un slug (ou de `admin`). Affiché dans l'espace administrateur. */
export function accessCodeFor(slug: string): string {
  if (slug === ADMIN_SLUG) return process.env.PORTAL_ADMIN_CODE || derivedCode(ADMIN_SLUG);
  return envOverride(slug) || derivedCode(slug);
}

/**
 * Vérifie un code saisi. L'administrateur ouvre TOUTES les portes : pratique
 * pour dépanner un client au téléphone sans lui demander son code.
 */
export function verifyAccess(slug: string, code: string): PortalRole | null {
  const clean = code.trim().toUpperCase().replace(/\s+/g, "");
  const adminCode = accessCodeFor(ADMIN_SLUG).toUpperCase();
  if (safeEqual(clean, adminCode)) return "admin";
  if (slug === ADMIN_SLUG) return null;
  const expected = accessCodeFor(slug).toUpperCase();
  return safeEqual(clean, expected) ? "client" : null;
}

/* ── Jeton de session ─────────────────────────────────────────────────────── */

export function issueToken(slug: string, role: PortalRole): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_S;
  const payload = b64url(JSON.stringify({ slug, role, exp, n: randomBytes(6).toString("hex") }));
  return `${payload}.${sign(payload)}`;
}

export function readToken(token: string | undefined): PortalSession | null {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".", 2);
  if (!payload || !sig) return null;
  if (!safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as PortalSession;
    if (!data.slug || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    if (data.role !== "admin" && data.role !== "client") return null;
    return { slug: data.slug, role: data.role, exp: data.exp };
  } catch {
    return null;
  }
}

/** Session courante lue depuis le cookie. `null` si absente ou expirée. */
export async function currentSession(): Promise<PortalSession | null> {
  const jar = await cookies();
  return readToken(jar.get(SESSION_COOKIE)?.value);
}

/**
 * La session a-t-elle le droit de voir `slug` ?
 * — `admin` voit tout, y compris chaque espace client ;
 * — un client ne voit que le sien.
 */
export function canAccess(session: PortalSession | null, slug: string): boolean {
  if (!session) return false;
  if (session.role === "admin") return true;
  return session.slug === slug && getTenant(slug) !== null;
}

export const SESSION_MAX_AGE = SESSION_TTL_S;
