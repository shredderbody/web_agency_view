import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE, SESSION_MAX_AGE, issueToken, verifyAccess, verifyCredentials,
  type PortalRole,
} from "@/lib/portal/auth";
import { ADMIN_SLUG, getTenant } from "@/lib/portal/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* POST /api/portal/login → cookie de session. Deux corps acceptés :

     { slug, code }        — la voie normale : une démo, son code d'accès.
     { email, password }   — les comptes de test (cf. lib/portal/auth.ts) :
                             <slug>@debug.com ouvre CETTE démo et elle seule,
                             test@debug.com ouvre l'administration.

   Le message d'erreur est volontairement le même que le code soit faux ou le
   slug inconnu : distinguer les deux dirait à un curieux quelles démos existent. */

export async function POST(req: NextRequest) {
  let body: { slug?: string; code?: string; email?: string; password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  let target: string;
  let role: PortalRole | null;

  if (body.email !== undefined || body.password !== undefined) {
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");
    if (!email.trim() || !password) {
      return NextResponse.json({ error: "Renseignez l'e-mail et le mot de passe." }, { status: 400 });
    }
    const account = verifyCredentials(email, password);
    if (!account) {
      return NextResponse.json({ error: "E-mail ou mot de passe incorrect." }, { status: 401 });
    }
    // L'e-mail dit la vitrine : c'est lui qui choisit l'espace ouvert.
    target = account.slug;
    role = account.role;
  } else {
    const slug = String(body.slug ?? "").trim().toLowerCase();
    const code = String(body.code ?? "");
    if (!slug || !code) {
      return NextResponse.json({ error: "Renseignez la démo et le code d'accès." }, { status: 400 });
    }

    const known = slug === ADMIN_SLUG || getTenant(slug) !== null;
    role = known ? verifyAccess(slug, code) : null;
    if (!role) {
      return NextResponse.json({ error: "Code d'accès invalide pour cette démo." }, { status: 401 });
    }

    // Un code admin saisi sur un espace client ouvre bien CET espace, avec les
    // droits admin : c'est le mode « dépannage » (on regarde l'espace du client
    // pendant qu'on l'a au téléphone).
    target = role === "admin" && slug === ADMIN_SLUG ? ADMIN_SLUG : slug;
  }

  const res = NextResponse.json({ ok: true, slug: target, role });
  res.cookies.set(SESSION_COOKIE, issueToken(target, role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
