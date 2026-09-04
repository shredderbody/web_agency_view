import { NextRequest, NextResponse } from "next/server";
import { guard, readJson, nullableNum, nullableStr, num, str } from "@/lib/portal/apiGuard";
import { issuerFor } from "@/lib/portal/issuer";
import {
  CATALOG_UNITS, createCategory, createItem, deleteCategory, deleteItem,
  loadCatalog, patchCategory, patchItem, type CatalogUnit,
} from "@/lib/portal/catalogStore";
import { isLang } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ════════════════════════════════════════════════════════════════════════════
   /api/portal/catalog — le catalogue modifiable d'une vitrine.

     GET    ?slug=&lang=            catégories + prestations (semé si vide)
     POST   { kind: 'category' }    crée un rayon
     POST   { kind: 'item' }        crée une prestation
     PATCH  { kind, id, … }         modifie l'un ou l'autre
     DELETE ?kind=&id=              supprime

   Le tenant vient de la SESSION, jamais du corps seul (cf. lib/portal/apiGuard).
   ════════════════════════════════════════════════════════════════════════════ */

function unitOf(v: unknown): CatalogUnit | undefined {
  const s = str(v, 20);
  return (CATALOG_UNITS as string[]).includes(s) ? (s as CatalogUnit) : undefined;
}

export async function GET(req: NextRequest) {
  const g = await guard(req.nextUrl.searchParams.get("slug"));
  if (!g.ok) return g.res;

  const raw = req.nextUrl.searchParams.get("lang");
  const lang = isLang(raw) ? raw : "fr";
  const snapshot = await loadCatalog(g.tenant, lang);
  return NextResponse.json(snapshot);
}

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const g = await guard(str(body.slug, 80) || null);
  if (!g.ok) return g.res;

  if (body.kind === "category") {
    const name = str(body.name, 120);
    if (!name) return NextResponse.json({ error: "nom manquant" }, { status: 400 });
    const category = await createCategory(g.tenant, {
      name,
      color: str(body.color, 20) || undefined,
      position: num(body.position, 0, 10_000, 0),
    });
    return NextResponse.json({ ok: true, category });
  }

  const name = str(body.name, 200);
  if (!name) return NextResponse.json({ error: "nom manquant" }, { status: 400 });
  const lang = isLang(body.lang) ? body.lang : "fr";
  const defaultTax = issuerFor(g.tenant.slug, lang)?.taxRate ?? 20;

  const item = await createItem(g.tenant, {
    categoryId: nullableStr(body.categoryId, 40),
    name,
    description: nullableStr(body.description, 500),
    unitPrice: num(body.unitPrice, -1_000_000, 10_000_000, 0),
    taxRate: num(body.taxRate, 0, 100, defaultTax),
    unit: unitOf(body.unit),
    purchasePrice: nullableNum(body.purchasePrice, 0, 10_000_000),
    toQuote: body.toQuote === true,
    position: num(body.position, 0, 1_000_000, 0),
  }, defaultTax);
  return NextResponse.json({ ok: true, item });
}

export async function PATCH(req: NextRequest) {
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const g = await guard(str(body.slug, 80) || null);
  if (!g.ok) return g.res;

  const id = str(body.id, 40);
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  if (body.kind === "category") {
    const category = await patchCategory(g.tenant.assistantId, id, {
      name: body.name === undefined ? undefined : str(body.name, 120),
      color: body.color === undefined ? undefined : str(body.color, 20),
      position: body.position === undefined ? undefined : num(body.position, 0, 10_000, 0),
    });
    if (!category) return NextResponse.json({ error: "introuvable" }, { status: 404 });
    return NextResponse.json({ ok: true, category });
  }

  const item = await patchItem(g.tenant.assistantId, id, {
    categoryId: body.categoryId === undefined ? undefined : nullableStr(body.categoryId, 40),
    name: body.name === undefined ? undefined : str(body.name, 200),
    description: body.description === undefined ? undefined : nullableStr(body.description, 500),
    unitPrice: body.unitPrice === undefined ? undefined : num(body.unitPrice, -1_000_000, 10_000_000, 0),
    taxRate: body.taxRate === undefined ? undefined : num(body.taxRate, 0, 100, 0),
    unit: body.unit === undefined ? undefined : unitOf(body.unit),
    purchasePrice: body.purchasePrice === undefined ? undefined : nullableNum(body.purchasePrice, 0, 10_000_000),
    toQuote: body.toQuote === undefined ? undefined : body.toQuote === true,
    position: body.position === undefined ? undefined : num(body.position, 0, 1_000_000, 0),
  });
  if (!item) return NextResponse.json({ error: "introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: NextRequest) {
  const g = await guard(req.nextUrl.searchParams.get("slug"));
  if (!g.ok) return g.res;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  // Supprimer un rayon ne supprime pas ses prestations : la clé étrangère est
  // en `on delete set null`, elles retombent dans « sans rayon ». Effacer un
  // classement ne doit pas effacer ce qui était classé.
  if (req.nextUrl.searchParams.get("kind") === "category") {
    await deleteCategory(g.tenant.assistantId, id);
  } else {
    await deleteItem(g.tenant.assistantId, id);
  }
  return NextResponse.json({ ok: true });
}
