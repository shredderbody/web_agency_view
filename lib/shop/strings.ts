import type { Lang } from "../i18n";

/* Chaînes d'interface de la boutique (chrome, filtres, panier, fiches). */
export type ShopStrings = {
  announce: string;
  navHome: string;
  navCollections: string;
  navAbout: string;
  navContact: string;
  cart: string;
  menu: string;
  close: string;
  search: string;
  // home
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  heroCta: string;
  heroCta2: string;
  heroBadge: string;
  collectionsEyebrow: string;
  collectionsTitle: string;
  collectionsLead: string;
  featuredEyebrow: string;
  featuredTitle: string;
  featuredLead: string;
  viewAll: string;
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string[];
  perks: { title: string; text: string }[];
  newsletterTitle: string;
  newsletterText: string;
  newsletterPlaceholder: string;
  newsletterCta: string;
  // collection
  allCollections: string;
  products: string;
  product: string;
  filterColor: string;
  filterAll: string;
  sortBy: string;
  sortFeatured: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortSize: string;
  noResults: string;
  from: string;
  // product
  home: string;
  reference: string;
  finish: string;
  height: string;
  width: string;
  base: string;
  weight: string;
  inStock: string;
  onOrder: string;
  stockUnits: string;
  addToCart: string;
  quantity: string;
  description: string;
  specifications: string;
  related: string;
  relatedLead: string;
  quickView: string;
  // cart
  yourCart: string;
  cartEmpty: string;
  cartEmptyCta: string;
  subtotal: string;
  shippingNote: string;
  checkout: string;
  continue: string;
  remove: string;
  each: string;
  // footer
  footerTagline: string;
  footerShop: string;
  footerHouse: string;
  footerContact: string;
  aboutUs: string;
  delivery: string;
  legal: string;
  cgv: string;
  rights: string;
};

const FR: ShopStrings = {
  announce: "Livraison OFFERTE partout en France · Fonte de fer massive · Boutique notée 5/5",
  navHome: "Accueil",
  navCollections: "Collections",
  navAbout: "La maison",
  navContact: "Contact",
  cart: "Panier",
  menu: "Menu",
  close: "Fermer",
  search: "Rechercher",
  heroEyebrow: "Ornements de jardin en fonte · depuis Chalezeule",
  heroTitle: "Le Médicis en fonte, comme dans les jardins à la française.",
  heroLead:
    "Ines Garden reproduit en fonte de fer massive les grands ornements des jardins classiques — vases et vasques Médicis, fontaines, statues, bacs à oranger. Des pièces patinées, faites pour traverser les décennies. Livraison offerte.",
  heroCta: "Explorer les collections",
  heroCta2: "La pièce signature",
  heroBadge: "76 pièces en fonte · 8 collections",
  collectionsEyebrow: "Par thèmes",
  collectionsTitle: "Nos collections",
  collectionsLead:
    "Huit familles d'ornements en fonte de fer, de la jardinière de rebord au vase Médicis monumental de près de trois mètres.",
  featuredEyebrow: "Les incontournables",
  featuredTitle: "Une sélection de la maison",
  featuredLead: "Une belle pièce dans chaque famille — pour se faire une idée de la collection.",
  viewAll: "Voir toute la collection",
  storyEyebrow: "Le savoir-faire",
  storyTitle: "La fonte, une matière qui se bonifie dehors.",
  storyBody: [
    "Là où la résine ternit et où la pierre reconstituée s'effrite, la fonte de fer s'installe dans le temps. Sa densité lui donne ce poids rassurant, sa patine se nuance saison après saison, et le moindre détail moulé reste net pendant des décennies.",
    "Chaque ornement Ines Garden reprend les proportions des modèles classiques, du vase Médicis aux statues des quatre saisons. On choisit sa taille et sa finition, et on reçoit une pièce livrée gratuitement, prête à poser.",
  ],
  perks: [
    { title: "Livraison offerte", text: "Partout en France, sur toute la collection." },
    { title: "Fonte de fer massive", text: "Matière noble, faite pour rester dehors." },
    { title: "Patine durable", text: "Bronze-vert, pierre, gris, noir mat." },
    { title: "Boutique notée 5/5", text: "Avis Google authentiques, après livraison." },
  ],
  newsletterTitle: "Restons en contact",
  newsletterText: "Nouveautés, pièces rares et conseils d'installation — une lettre discrète, jamais de spam.",
  newsletterPlaceholder: "Votre e-mail",
  newsletterCta: "S'inscrire",
  allCollections: "Toutes les collections",
  products: "produits",
  product: "produit",
  filterColor: "Finition",
  filterAll: "Toutes",
  sortBy: "Trier",
  sortFeatured: "En vedette",
  sortPriceAsc: "Prix croissant",
  sortPriceDesc: "Prix décroissant",
  sortSize: "Hauteur",
  noResults: "Aucune pièce ne correspond à ce filtre.",
  from: "dès",
  home: "Accueil",
  reference: "Référence",
  finish: "Finition",
  height: "Hauteur",
  width: "Largeur",
  base: "Diamètre du pied",
  weight: "Poids",
  inStock: "En stock",
  onOrder: "Sur commande",
  stockUnits: "pièces disponibles",
  addToCart: "Ajouter au panier",
  quantity: "Quantité",
  description: "Description",
  specifications: "Caractéristiques",
  related: "Dans la même collection",
  relatedLead: "D'autres pièces à découvrir",
  quickView: "Aperçu",
  yourCart: "Votre panier",
  cartEmpty: "Votre panier est vide.",
  cartEmptyCta: "Découvrir les collections",
  subtotal: "Sous-total",
  shippingNote: "Livraison offerte · calculée à la commande",
  checkout: "Commander",
  continue: "Continuer mes achats",
  remove: "Retirer",
  each: "l'unité",
  footerTagline: "Les Jardins d'Inès — reproductions d'ornements de jardin en fonte de fer, style Médicis. Chalezeule, près de Besançon.",
  footerShop: "La boutique",
  footerHouse: "La maison",
  footerContact: "Contact",
  aboutUs: "Notre histoire",
  delivery: "Livraison & retours",
  legal: "Mentions légales",
  cgv: "CGV",
  rights: "Tous droits réservés.",
};

const EN: ShopStrings = {
  announce: "FREE delivery across France · Solid cast iron · Shop rated 5/5",
  navHome: "Home",
  navCollections: "Collections",
  navAbout: "The house",
  navContact: "Contact",
  cart: "Cart",
  menu: "Menu",
  close: "Close",
  search: "Search",
  heroEyebrow: "Cast-iron garden ornaments · from Chalezeule",
  heroTitle: "The cast-iron Medici, just like in the great formal gardens.",
  heroLead:
    "Ines Garden reproduces the great ornaments of classical gardens in solid cast iron — Medici vases and basins, fountains, statues, orangery boxes. Patinated pieces, built to weather the decades. Free delivery.",
  heroCta: "Explore the collections",
  heroCta2: "The signature piece",
  heroBadge: "76 cast-iron pieces · 8 collections",
  collectionsEyebrow: "By theme",
  collectionsTitle: "Our collections",
  collectionsLead:
    "Eight families of cast-iron ornaments, from the windowsill planter to the near three-metre monumental Medici vase.",
  featuredEyebrow: "The essentials",
  featuredTitle: "A house selection",
  featuredLead: "One fine piece from each family — a taste of the collection.",
  viewAll: "See the whole collection",
  storyEyebrow: "The craft",
  storyTitle: "Cast iron, a material that ages well outdoors.",
  storyBody: [
    "Where resin dulls and reconstituted stone crumbles, cast iron settles into time. Its density gives it that reassuring weight, its patina deepens season after season, and every moulded detail stays crisp for decades.",
    "Every Ines Garden ornament keeps the proportions of the classical models, from the Medici vase to the Four Seasons statues. You choose the size and finish, and receive a piece delivered free, ready to place.",
  ],
  perks: [
    { title: "Free delivery", text: "Across France, on the whole collection." },
    { title: "Solid cast iron", text: "A noble material, built to stay outdoors." },
    { title: "Lasting patina", text: "Bronze-green, stone, grey, matte black." },
    { title: "Rated 5/5", text: "Genuine Google reviews, after delivery." },
  ],
  newsletterTitle: "Let's keep in touch",
  newsletterText: "New arrivals, rare pieces and installation tips — a discreet letter, never spam.",
  newsletterPlaceholder: "Your email",
  newsletterCta: "Subscribe",
  allCollections: "All collections",
  products: "products",
  product: "product",
  filterColor: "Finish",
  filterAll: "All",
  sortBy: "Sort",
  sortFeatured: "Featured",
  sortPriceAsc: "Price, low to high",
  sortPriceDesc: "Price, high to low",
  sortSize: "Height",
  noResults: "No piece matches this filter.",
  from: "from",
  home: "Home",
  reference: "Reference",
  finish: "Finish",
  height: "Height",
  width: "Width",
  base: "Foot diameter",
  weight: "Weight",
  inStock: "In stock",
  onOrder: "Made to order",
  stockUnits: "pieces available",
  addToCart: "Add to cart",
  quantity: "Quantity",
  description: "Description",
  specifications: "Specifications",
  related: "In the same collection",
  relatedLead: "More pieces to discover",
  quickView: "Quick view",
  yourCart: "Your cart",
  cartEmpty: "Your cart is empty.",
  cartEmptyCta: "Discover the collections",
  subtotal: "Subtotal",
  shippingNote: "Free delivery · calculated at checkout",
  checkout: "Checkout",
  continue: "Continue shopping",
  remove: "Remove",
  each: "each",
  footerTagline: "Les Jardins d'Inès — cast-iron garden ornament reproductions, Medici style. Chalezeule, near Besançon.",
  footerShop: "The shop",
  footerHouse: "The house",
  footerContact: "Contact",
  aboutUs: "Our story",
  delivery: "Delivery & returns",
  legal: "Legal notice",
  cgv: "Terms",
  rights: "All rights reserved.",
};

export function shopStrings(lang: Lang): ShopStrings {
  return lang === "en" ? EN : FR;
}
