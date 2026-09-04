// ⚠️ MODULE SERVEUR UNIQUEMENT (passe par `lib/portal/supabase.ts`, service_role).

import { insert, select, update, rest, q } from "./supabase";
import { catalogFor } from "./catalog";
import { issuerFor } from "./issuer";
import type { DemoTenant } from "./registry";
import type { Lang } from "../i18n";

/* ════════════════════════════════════════════════════════════════════════════
   LE CATALOGUE MODIFIABLE d'une vitrine.

   `lib/portal/catalog.ts` lit les prestations SUR LA VITRINE : c'est une vue,
   figée, qui suit la page publique. Ce module-ci porte le catalogue que
   l'exploitant possède — celui qu'il complète, corrige et range.

   ── Le semis ────────────────────────────────────────────────────────────────
   Au tout premier accès, la table est vide. Présenter un catalogue vide à
   quelqu'un dont les prix sont déjà écrits sur sa page publique serait absurde :
   on SÈME donc le catalogue depuis la vitrine, une fois, puis on n'y revient
   plus. À partir de là il lui appartient — s'il supprime une ligne, elle ne
   repousse pas au prochain chargement.

   C'est la différence qui compte entre les deux modules : `catalog.ts` dit ce
   que la vitrine affiche, `catalogStore.ts` dit ce que l'exploitant vend.
   ════════════════════════════════════════════════════════════════════════════ */

export type CatalogUnit = "unite" | "heure" | "jour" | "forfait" | "m2" | "ml" | "kg";

export const CATALOG_UNITS: CatalogUnit[] = ["unite", "heure", "jour", "forfait", "m2", "ml", "kg"];

export type StoredCategory = {
  id: string;
  assistant_id: string;
  demo_slug: string | null;
  name: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type StoredCatalogItem = {
  id: string;
  assistant_id: string;
  demo_slug: string | null;
  category_id: string | null;
  name: string;
  description: string | null;
  unit_price: number;
  tax_rate: number;
  unit: CatalogUnit;
  purchase_price: number | null;
  to_quote: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

const CAT_COLS = "id,assistant_id,demo_slug,name,color,position,created_at,updated_at";
const ITEM_COLS =
  "id,assistant_id,demo_slug,category_id,name,description,unit_price,tax_rate,unit," +
  "purchase_price,to_quote,position,created_at,updated_at";

/* Palette des rayons — reprise des couleurs de série de l'espace, pas de
   l'accent de marque : un rayon de catalogue n'est pas une action. */
const COLORS = ["#4b6bb7", "#b07b3e", "#3f8161", "#a3506e", "#6b5ea8", "#8a6a3c"];

/* ── Lectures ─────────────────────────────────────────────────────────────── */

export function listCategories(assistantId: string): Promise<StoredCategory[]> {
  return select<StoredCategory>(
    "demo_catalog_categories",
    `select=${CAT_COLS}&assistant_id=eq.${q(assistantId)}&order=position.asc,name.asc`,
  );
}

export function listItems(assistantId: string): Promise<StoredCatalogItem[]> {
  return select<StoredCatalogItem>(
    "demo_catalog_items",
    `select=${ITEM_COLS}&assistant_id=eq.${q(assistantId)}&order=position.asc,name.asc&limit=1000`,
  );
}

export type CatalogSnapshot = {
  categories: StoredCategory[];
  items: StoredCatalogItem[];
  /** `true` quand ce chargement vient de semer le catalogue depuis la vitrine. */
  seeded: boolean;
};

/**
 * Le catalogue d'une vitrine, semé depuis la page publique s'il est vide.
 *
 * `lang` ne sert qu'au semis : c'est la langue dans laquelle les prestations
 * seront écrites la première fois. Ensuite le catalogue est un texte qui
 * appartient à l'exploitant, et il ne se retraduit pas tout seul — retraduire
 * les libellés qu'il a lui-même corrigés serait les écraser.
 */
export async function loadCatalog(
  tenant: DemoTenant,
  lang: Lang,
): Promise<CatalogSnapshot> {
  const [categories, items] = await Promise.all([
    listCategories(tenant.assistantId),
    listItems(tenant.assistantId),
  ]);
  if (categories.length > 0 || items.length > 0) {
    return { categories, items, seeded: false };
  }

  const seeded = await seedFromVitrine(tenant, lang);
  return { ...seeded, seeded: true };
}

/* ── Semis ────────────────────────────────────────────────────────────────── */

async function seedFromVitrine(
  tenant: DemoTenant,
  lang: Lang,
): Promise<{ categories: StoredCategory[]; items: StoredCatalogItem[] }> {
  const groups = catalogFor(tenant.slug, lang);
  if (groups.length === 0) return { categories: [], items: [] };

  const defaultTax = issuerFor(tenant.slug, lang)?.taxRate ?? 20;

  const createdCategories = await insert<StoredCategory>(
    "demo_catalog_categories",
    groups.map((g, i) => ({
      assistant_id: tenant.assistantId,
      demo_slug: tenant.slug,
      name: g.title.slice(0, 120),
      color: COLORS[i % COLORS.length],
      position: i,
    })),
  );

  // On réaligne sur le rang plutôt que sur le nom : deux rayons peuvent porter
  // le même titre (« Carte · Poulet » et « Carte · Bœuf » tronqués à l'identique
  // dans une vitrine bavarde), et l'ordre d'insertion, lui, ne ment pas.
  const byPosition = new Map(createdCategories.map((c) => [c.position, c.id]));

  const rows = groups.flatMap((g, gi) =>
    g.items.map((it, ii) => ({
      assistant_id: tenant.assistantId,
      demo_slug: tenant.slug,
      category_id: byPosition.get(gi) ?? null,
      name: it.name.slice(0, 200),
      description: it.desc?.slice(0, 500) ?? null,
      unit_price: it.unitPrice,
      tax_rate: defaultTax,
      unit: "unite",
      to_quote: it.toQuote,
      position: gi * 1000 + ii,
    })),
  );
  if (rows.length === 0) return { categories: createdCategories, items: [] };

  // PostgREST accepte le lot ; on le découpe quand même, une carte de restaurant
  // dépasse facilement la centaine de lignes.
  const items: StoredCatalogItem[] = [];
  for (let i = 0; i < rows.length; i += 100) {
    items.push(...(await insert<StoredCatalogItem>("demo_catalog_items", rows.slice(i, i + 100))));
  }
  return { categories: createdCategories, items };
}

/* ── Écritures ────────────────────────────────────────────────────────────── */

export type CategoryInput = { name: string; color?: string; position?: number };

export async function createCategory(
  tenant: DemoTenant, input: CategoryInput,
): Promise<StoredCategory | null> {
  const rows = await insert<StoredCategory>("demo_catalog_categories", [{
    assistant_id: tenant.assistantId,
    demo_slug: tenant.slug,
    name: input.name,
    color: input.color ?? COLORS[0],
    position: input.position ?? 0,
  }]);
  return rows[0] ?? null;
}

export async function patchCategory(
  assistantId: string, id: string, patch: Partial<CategoryInput>,
): Promise<StoredCategory | null> {
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.color !== undefined) body.color = patch.color;
  if (patch.position !== undefined) body.position = patch.position;
  // Le filtre porte le tenant : un id seul ne suffit jamais à écrire.
  const rows = await update<StoredCategory>(
    "demo_catalog_categories",
    `id=eq.${q(id)}&assistant_id=eq.${q(assistantId)}&select=${CAT_COLS}`,
    body,
  );
  return rows[0] ?? null;
}

export async function deleteCategory(assistantId: string, id: string): Promise<void> {
  await rest("demo_catalog_categories", {
    method: "DELETE",
    query: `id=eq.${q(id)}&assistant_id=eq.${q(assistantId)}`,
  });
}

export type ItemInput = {
  categoryId?: string | null;
  name: string;
  description?: string | null;
  unitPrice?: number;
  taxRate?: number;
  unit?: CatalogUnit;
  purchasePrice?: number | null;
  toQuote?: boolean;
  position?: number;
};

export async function createItem(
  tenant: DemoTenant, input: ItemInput, defaultTax: number,
): Promise<StoredCatalogItem | null> {
  const rows = await insert<StoredCatalogItem>("demo_catalog_items", [{
    assistant_id: tenant.assistantId,
    demo_slug: tenant.slug,
    category_id: input.categoryId ?? null,
    name: input.name,
    description: input.description ?? null,
    unit_price: input.unitPrice ?? 0,
    tax_rate: input.taxRate ?? defaultTax,
    unit: input.unit ?? "unite",
    purchase_price: input.purchasePrice ?? null,
    to_quote: input.toQuote ?? false,
    position: input.position ?? 0,
  }]);
  return rows[0] ?? null;
}

export async function patchItem(
  assistantId: string, id: string, patch: Partial<ItemInput>,
): Promise<StoredCatalogItem | null> {
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.categoryId !== undefined) body.category_id = patch.categoryId;
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.description !== undefined) body.description = patch.description;
  if (patch.unitPrice !== undefined) body.unit_price = patch.unitPrice;
  if (patch.taxRate !== undefined) body.tax_rate = patch.taxRate;
  if (patch.unit !== undefined) body.unit = patch.unit;
  if (patch.purchasePrice !== undefined) body.purchase_price = patch.purchasePrice;
  if (patch.toQuote !== undefined) body.to_quote = patch.toQuote;
  if (patch.position !== undefined) body.position = patch.position;
  const rows = await update<StoredCatalogItem>(
    "demo_catalog_items",
    `id=eq.${q(id)}&assistant_id=eq.${q(assistantId)}&select=${ITEM_COLS}`,
    body,
  );
  return rows[0] ?? null;
}

export async function deleteItem(assistantId: string, id: string): Promise<void> {
  await rest("demo_catalog_items", {
    method: "DELETE",
    query: `id=eq.${q(id)}&assistant_id=eq.${q(assistantId)}`,
  });
}
