import { NextRequest, NextResponse } from "next/server";
import { guard, readJson, nullableStr, str } from "@/lib/portal/apiGuard";
import {
  createCustomerManually, deleteCustomer, listCustomers, patchCustomer,
} from "@/lib/portal/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ════════════════════════════════════════════════════════════════════════════
   /api/portal/clients — le fichier client d'une vitrine, modifiable.

     GET    ?slug=          la liste
     POST   { … }           crée (ou complète, si le téléphone est déjà connu)
     PATCH  { id, … }       modifie
     DELETE ?id=            supprime la fiche — PAS le journal

   La suppression ne touche pas `demo_actions` : ses lignes gardent le nom et le
   numéro tels qu'ils étaient au moment des faits. Effacer une fiche ne réécrit
   pas l'histoire, c'est tout l'intérêt d'un journal immuable.
   ════════════════════════════════════════════════════════════════════════════ */

function fields(body: Record<string, unknown>) {
  return {
    name: body.name === undefined ? undefined : nullableStr(body.name, 160),
    phone: body.phone === undefined ? undefined : nullableStr(body.phone, 40),
    email: body.email === undefined ? undefined : nullableStr(body.email, 160),
    address: body.address === undefined ? undefined : nullableStr(body.address, 240),
    postalCode: body.postalCode === undefined ? undefined : nullableStr(body.postalCode, 20),
    city: body.city === undefined ? undefined : nullableStr(body.city, 120),
    company: body.company === undefined ? undefined : nullableStr(body.company, 160),
    siret: body.siret === undefined ? undefined : nullableStr(body.siret, 40),
    notes: body.notes === undefined ? undefined : nullableStr(body.notes, 2000),
  };
}

export async function GET(req: NextRequest) {
  const g = await guard(req.nextUrl.searchParams.get("slug"));
  if (!g.ok) return g.res;
  return NextResponse.json({ customers: await listCustomers(g.tenant.assistantId) });
}

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const g = await guard(str(body.slug, 80) || null);
  if (!g.ok) return g.res;

  const input = fields(body);
  // Un nom OU une société : une fiche sans aucune des deux ne se retrouve pas
  // dans une liste, et ne sert donc à rien.
  if (!input.name && !input.company) {
    return NextResponse.json({ error: "nom ou société requis" }, { status: 400 });
  }
  const customer = await createCustomerManually(g.tenant, input);
  return NextResponse.json({ ok: true, customer });
}

export async function PATCH(req: NextRequest) {
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const g = await guard(str(body.slug, 80) || null);
  if (!g.ok) return g.res;

  const id = str(body.id, 40);
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const customer = await patchCustomer(g.tenant.assistantId, id, fields(body));
  if (!customer) return NextResponse.json({ error: "introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true, customer });
}

export async function DELETE(req: NextRequest) {
  const g = await guard(req.nextUrl.searchParams.get("slug"));
  if (!g.ok) return g.res;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  await deleteCustomer(g.tenant.assistantId, id);
  return NextResponse.json({ ok: true });
}
