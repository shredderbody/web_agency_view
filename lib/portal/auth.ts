// ⚠️ MODULE SERVEUR UNIQUEMENT (lit PORTAL_SECRET).

import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_SLUG, DEMO_TENANTS, getTenant } from "./registry";

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

/** Surcharge par slug : `<PREFIXE>_<SLUG_EN_MAJUSCULES_AVEC_UNDERSCORES>`. */
function envForSlug(prefix: string, slug: string): string | undefined {
  const key = `${prefix}${slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  return process.env[key];
}

/** Code d'accès d'un slug (ou de `admin`). Affiché dans l'espace administrateur. */
export function accessCodeFor(slug: string): string {
  if (slug === ADMIN_SLUG) return process.env.PORTAL_ADMIN_CODE || derivedCode(ADMIN_SLUG);
  return envForSlug("PORTAL_CODE_", slug) || derivedCode(slug);
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

/* ── Comptes de test (e-mail + mot de passe) ────────────────────────────────
   UN COMPTE PAR DÉMO, plus un compte agence. C'est le point important : quand
   on montre une vitrine à un prospect, il se connecte à SA démo et n'y voit que
   SES données — pas la consommation des onze autres, ni leurs codes d'accès.

     <slug>@debug.com   → session `client` sur /espace/<slug>, cette démo seule
     test@debug.com     → session `admin`, vision sur toutes les vitrines

   L'e-mail dit la vitrine : `barbershop@debug.com`, `ines-garden@debug.com`.
   Mot de passe commun (Test123!) — il se dicte à voix haute devant un prospect,
   c'est tout ce qu'on lui demande. Surcharges :

     PORTAL_TEST_DOMAIN            domaine des e-mails de démo (défaut debug.com)
     PORTAL_TEST_EMAIL             e-mail du compte agence
     PORTAL_TEST_EMAIL_<SLUG>      e-mail d'une démo en particulier
     PORTAL_TEST_PASSWORD          mot de passe commun
     PORTAL_TEST_PASSWORD_<SLUG>   mot de passe d'une démo en particulier
     PORTAL_TEST_ACCOUNT=off       ferme tous ces comptes d'un coup

   Ces comptes sont un CONFORT DE DÉMONSTRATION, pas un système de comptes :
   le jour où l'espace sert à de vrais clients payants, on pose `off`.         */

const TEST_ADMIN_EMAIL_DEFAULT = "test@debug.com";
const TEST_PASSWORD_DEFAULT = "Test123!";

export function isTestAccountEnabled(): boolean {
  return (process.env.PORTAL_TEST_ACCOUNT || "").trim().toLowerCase() !== "off";
}

function testDomain(): string {
  return (process.env.PORTAL_TEST_DOMAIN || "debug.com").trim().toLowerCase();
}

/** E-mail de connexion d'une démo (ou du compte agence pour `admin`). */
export function testEmailFor(slug: string): string {
  const raw = slug === ADMIN_SLUG
    ? process.env.PORTAL_TEST_EMAIL || TEST_ADMIN_EMAIL_DEFAULT
    : envForSlug("PORTAL_TEST_EMAIL_", slug) || `${slug}@${testDomain()}`;
  return raw.trim().toLowerCase();
}

/** Mot de passe d'une démo. Commun par défaut : il se dicte de vive voix. */
export function testPasswordFor(slug: string): string {
  return envForSlug("PORTAL_TEST_PASSWORD_", slug)
    || process.env.PORTAL_TEST_PASSWORD
    || TEST_PASSWORD_DEFAULT;
}

/** Les deux identifiants d'une démo, tels que l'espace admin les affiche. */
export function testAccountFor(slug: string): { email: string; password: string } {
  return { email: testEmailFor(slug), password: testPasswordFor(slug) };
}

/**
 * Vérifie un couple e-mail / mot de passe et dit QUELLE PORTE il ouvre :
 * l'espace d'une démo (`client`), ou l'administration (`admin`).
 *
 * L'e-mail sert à trouver le compte, jamais à répondre : qu'il soit inconnu ou
 * que le mot de passe soit faux, l'appelant renvoie le même message. Un e-mail
 * inconnu fait quand même la comparaison, pour ne pas se trahir au chrono.
 */
export function verifyCredentials(
  email: string, password: string,
): { slug: string; role: PortalRole } | null {
  if (!isTestAccountEnabled()) return null;
  const clean = email.trim().toLowerCase();

  if (safeEqual(clean, testEmailFor(ADMIN_SLUG))) {
    return safeEqual(password, testPasswordFor(ADMIN_SLUG)) ? { slug: ADMIN_SLUG, role: "admin" } : null;
  }
  const tenant = DEMO_TENANTS.find((t) => testEmailFor(t.slug) === clean);
  if (!tenant) {
    safeEqual(password, testPasswordFor(ADMIN_SLUG)); // même travail, même durée
    return null;
  }
  return safeEqual(password, testPasswordFor(tenant.slug))
    ? { slug: tenant.slug, role: "client" }
    : null;
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
