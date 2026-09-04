/* ════════════════════════════════════════════════════════════════════════════
   LE CATALOGUE d'une vitrine — les prestations telles que la page publique les
   affiche, transformées en lignes chiffrables.

   Personne ne ressaisit une carte. « La coupe Brutus · 28 € » est écrite une
   seule fois, dans `lib/vitrineContent.ts`, et c'est cette ligne-là qui se pose
   dans le devis. Le jour où le prix change sur la vitrine, il change dans
   l'outil : il n'y a pas deux vérités.

   ── Le parseur de prix ─────────────────────────────────────────────────────
   Les prix d'une vitrine sont écrits POUR ÊTRE LUS, pas pour être calculés.
   L'audit en a relevé huit formes : `28 €`, `10,50 €`, `75 $`, `dès 5 $`,
   `Rp 95K`, `dès 1 200 €`, `from €1,200`, et tout ce qui n'est pas un nombre
   — `Devis gratuit`, `Sur-mesure`, `offert`, `24/7`.

   Règle : ce qui se chiffre est chiffré ; ce qui ne se chiffre pas devient une
   ligne À CHIFFRER à 0, avec son libellé d'origine conservé. Un plombier
   texan dont toute la grille dit « Free quote » obtient donc son catalogue de
   prestations, à remplir ligne par ligne — ce qui est exactement son métier.
   ════════════════════════════════════════════════════════════════════════════ */

import type { Lang } from "../i18n";
import { getVitrine } from "../vitrineContent";
import { getThaiContent } from "../thaiViens";
import { getBarberContent } from "../barberCourbevoie";
import { getLakContent } from "../lakNailSalon";
import { getOpenHouseContent } from "../openhouseCanggu";
import { getInesGardenContent, getProducts } from "../inesGarden";
import { getEphemereContent } from "../maisonEphemere";
import { getTexasPlumbingContent } from "../texasPlumbing";

export type CatalogItem = {
  /** Libellé qui atterrit dans la ligne du devis. */
  name: string;
  /** Détail court, repris de la vitrine quand elle en donne un. */
  desc?: string;
  /** Prix unitaire HT, dans la devise de la vitrine. 0 si à chiffrer. */
  unitPrice: number;
  /** `true` quand la vitrine annonce « sur devis », « offert », « 24/7 »… */
  toQuote: boolean;
  /** Le prix tel qu'il est écrit sur la vitrine, gardé pour l'affichage. */
  rawPrice: string;
};

export type CatalogGroup = { title: string; items: CatalogItem[] };

/* ── Parseur ─────────────────────────────────────────────────────────────── */

/** Mots qui, seuls, signifient « pas de prix affiché ». */
const NON_NUMERIC = /^(sur[- ]?(devis|mesure)|devis gratuit|offert|gratuit|nous consulter|bespoke|free quote|on quote|free|same day|jour même|24\/7|garanti|warrantied)$/i;

/**
 * Lit un prix de vitrine. Renvoie `null` quand rien n'est chiffrable.
 *
 * Le `K` d'un `Rp 95K` vaut mille : c'est l'écriture normale d'un prix en
 * Indonésie, pas une abréviation approximative.
 */
export function parsePrice(raw: string): number | null {
  const s = raw.trim();
  if (!s || NON_NUMERIC.test(s)) return null;

  // On isole le nombre : chiffres, espaces (y compris insécables), points et
  // virgules. Le `K` éventuel est capturé à part.
  const m = s.match(/(\d[\d\s\u00a0\u202f.,]*)\s*([kK])?/);
  if (!m) return null;

  let digits = m[1].replace(/[\s\u00a0\u202f]/g, "");
  const isThousands = Boolean(m[2]);

  // Séparateur décimal : le DERNIER point ou virgule, à condition qu'il ne
  // reste qu'un ou deux chiffres derrière. `1,200` est mille deux cents ;
  // `10,50` est dix euros cinquante. Cette règle-là tranche les deux.
  const lastSep = Math.max(digits.lastIndexOf(","), digits.lastIndexOf("."));
  if (lastSep >= 0) {
    const decimals = digits.length - lastSep - 1;
    if (decimals === 1 || decimals === 2) {
      digits = `${digits.slice(0, lastSep).replace(/[.,]/g, "")}.${digits.slice(lastSep + 1)}`;
    } else {
      digits = digits.replace(/[.,]/g, "");
    }
  }

  const n = Number(digits);
  if (!Number.isFinite(n)) return null;
  return isThousands ? n * 1000 : n;
}

function item(name: string, rawPrice: string, desc?: string): CatalogItem {
  const parsed = parsePrice(rawPrice);
  return {
    name: name.trim(),
    desc: desc?.trim() || undefined,
    unitPrice: parsed ?? 0,
    toQuote: parsed === null,
    rawPrice: rawPrice.trim(),
  };
}

/** Écarte les groupes vides — un catalogue ne montre pas de rayon vide. */
function groups(...gs: CatalogGroup[]): CatalogGroup[] {
  return gs.filter((g) => g.items.length > 0);
}

/* ── Un catalogue par vitrine ────────────────────────────────────────────── */

type Service = { name: string; desc: string; price: string };
type PriceColumn = { title: string; items: { name: string; price: string }[] };

/** Le gabarit commun aux sept démos réelles : mis en avant + grille tarifaire. */
function fromFeaturedAndColumns(
  featured: Service[],
  priceColumns: PriceColumn[],
  featuredTitle: string,
): CatalogGroup[] {
  return groups(
    { title: featuredTitle, items: featured.map((s) => item(s.name, s.price, s.desc)) },
    ...priceColumns.map((c) => ({
      title: c.title,
      items: c.items.map((i) => item(i.name, i.price)),
    })),
  );
}

/**
 * Le catalogue d'une vitrine, dans la langue demandée. Tableau vide si le slug
 * n'expose rien de chiffrable — l'éditeur reste utilisable en saisie libre.
 */
export function catalogFor(slug: string, lang: Lang): CatalogGroup[] {
  // ── Vitrines génériques : une seule liste de prestations, déjà prête.
  const vit = getVitrine(lang, slug);
  if (vit) {
    return groups({
      title: vit.servicesTitle,
      items: vit.services.map((s) => item(s.name, s.price, s.desc)),
    });
  }

  switch (slug) {
    // ── Restaurant thaï : la carte est plate (tous les plats au même prix), et
    //    les suppléments sont écrits « Libellé · 1,00 € ». On rend les trois
    //    strates : les plats signatures, la carte par viande, les suppléments.
    case "thai-viens-express": {
      const c = getThaiContent(lang);
      const flat = parsePrice(c.menuPriceNote);
      return groups(
        { title: c.dishesTitle, items: c.dishes.map((d) => item(d.name, d.price, d.desc)) },
        ...c.menuColumns.map((col) => ({
          title: `${c.menuTitle} · ${col.title}`,
          items: col.items.map((name) =>
            flat === null
              ? item(name, c.menuPriceNote)
              : { name, unitPrice: flat, toQuote: false, rawPrice: c.menuPriceNote },
          ),
        })),
        {
          title: c.extrasTitle,
          items: c.extras.map((line) => {
            const [name, price] = line.split("·");
            return item(name ?? line, price ?? "");
          }),
        },
      );
    }

    case "barbershop-courbevoie": {
      const c = getBarberContent(lang);
      return fromFeaturedAndColumns(c.featured, c.priceColumns, c.servicesTitle);
    }
    case "lak-nail-salon": {
      const c = getLakContent(lang);
      return fromFeaturedAndColumns(c.featured, c.priceColumns, c.servicesTitle);
    }
    case "openhouse-canggu": {
      const c = getOpenHouseContent(lang);
      return fromFeaturedAndColumns(c.featured, c.priceColumns, c.servicesTitle);
    }
    case "maison-ephemere": {
      const c = getEphemereContent(lang);
      return fromFeaturedAndColumns(c.featured, c.priceColumns, c.servicesTitle);
    }
    case "texas-plumbing-pros": {
      const c = getTexasPlumbingContent(lang);
      return fromFeaturedAndColumns(c.featured, c.priceColumns, c.servicesTitle);
    }

    // ── Ines Garden vend des OBJETS : la liste des produits fait catalogue,
    //    en plus des prestations mises en avant.
    case "ines-garden": {
      const c = getInesGardenContent(lang);
      return groups(
        ...fromFeaturedAndColumns(c.featured, c.priceColumns, c.servicesTitle),
        {
          title: lang === "fr" ? "Catalogue fonte" : "Cast-iron catalogue",
          items: getProducts(lang).map((p) => item(p.name, p.price)),
        },
      );
    }

    default:
      return [];
  }
}
