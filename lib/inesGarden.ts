import type { Lang } from "./i18n";

/* ════════════════════════════════════════════════════════════════════════════
   Ines Garden — Les Jardins d'Inès — Chalezeule (près de Besançon, Doubs).
   Données client (démo) bâties sur les données réelles Google Places
   (place_id ChIJvUTZqMN9jUcRi4HbtEAcSuc, récupérées le 2026-06-24, 5,0/5) et le
   site officiel ines-garden.com : spécialiste de la reproduction d'ornements de
   jardin en fonte de fer — vases & vasques Médicis, jardinières, bacs à oranger,
   fontaines, statues, têtes de cheval. Livraison offerte. Prix relevés sur les
   fiches produits du site (indicatifs, en euros).
   Photos : public/clients/ines-garden/photo_00..08.webp
   ════════════════════════════════════════════════════════════════════════════ */

export const IMG = "/clients/ines-garden";

export type Service = { name: string; desc: string; price: string; img?: string; tag?: string };
export type PriceItem = { name: string; price: string };
export type PriceColumn = { title: string; icon: string; items: PriceItem[] };
export type Review = { text: string; author: string; meta: string; rating: number };

export const FACTS = {
  name: "Ines Garden",
  fullName: "Ines Garden · Les Jardins d'Inès",
  trade: { fr: "Ornements de jardin en fonte · style Médicis", en: "Cast-iron garden ornaments · Medici style" },
  city: "Chalezeule, près de Besançon",
  address: "10 Chem. du Rond Buisson, 25220 Chalezeule, France",
  phone: "+33 6 75 63 55 28",
  website: "https://www.ines-garden.com/",
  rating: "5,0",
  ratingEn: "5.0",
  reviewCount: 2,
  lat: 47.2680399,
  lon: 6.0588706,
  placeId: "ChIJvUTZqMN9jUcRi4HbtEAcSuc",
  mapsUri:
    "https://www.google.com/maps/dir/?api=1&destination=47.2680399,6.0588706&destination_place_id=ChIJvUTZqMN9jUcRi4HbtEAcSuc",
  hours: {
    fr: [
      { d: "Lundi", h: "Boutique en ligne · 24h/24" },
      { d: "Mardi", h: "Boutique en ligne · 24h/24" },
      { d: "Mercredi", h: "Boutique en ligne · 24h/24" },
      { d: "Jeudi", h: "Boutique en ligne · 24h/24" },
      { d: "Vendredi", h: "Boutique en ligne · 24h/24" },
      { d: "Samedi", h: "Boutique en ligne · 24h/24" },
      { d: "Dimanche", h: "Boutique en ligne · 24h/24" },
    ],
    en: [
      { d: "Monday", h: "Online shop · 24/7" },
      { d: "Tuesday", h: "Online shop · 24/7" },
      { d: "Wednesday", h: "Online shop · 24/7" },
      { d: "Thursday", h: "Online shop · 24/7" },
      { d: "Friday", h: "Online shop · 24/7" },
      { d: "Saturday", h: "Online shop · 24/7" },
      { d: "Sunday", h: "Online shop · 24/7" },
    ],
  },
} as const;

// Bandeau défilant — vocabulaire ornement de jardin en fonte.
export const MARQUEE = [
  "Vases Médicis", "Fonte de fer", "Vasques", "Jardinières", "Bacs à oranger",
  "Fontaines", "Statues 4 saisons", "Têtes de cheval", "Livraison offerte", "Style Médicis", "Fait pour durer",
];

// Liste produits réelle (extraite des fiches ines-garden.com) — alimente le
// panier de la modale « boutique ». Prix indicatifs, en euros.
export const PRODUCTS_FR: PriceItem[] = [
  { name: "Vase Médicis fonte · Gris 43 cm", price: "180 €" },
  { name: "Vase Médicis fonte · Bronze-vert 86 cm", price: "290 €" },
  { name: "Vase Médicis fonte · Pierre 151 cm", price: "550 €" },
  { name: "Vasque Médicis fonte · 45 cm", price: "650 €" },
  { name: "Jardinière en fonte · 12 cm", price: "55 €" },
  { name: "Bac à oranger en fonte · 52 cm", price: "510 €" },
  { name: "Tête de cheval en fonte · 50 cm", price: "570 €" },
  { name: "Fontaine en fonte · 142 cm", price: "1100 €" },
];
export const PRODUCTS_EN: PriceItem[] = [
  { name: "Cast-iron Medici vase · Grey 43 cm", price: "180 €" },
  { name: "Cast-iron Medici vase · Bronze-green 86 cm", price: "290 €" },
  { name: "Cast-iron Medici vase · Stone 151 cm", price: "550 €" },
  { name: "Cast-iron Medici basin · 45 cm", price: "650 €" },
  { name: "Cast-iron planter · 12 cm", price: "55 €" },
  { name: "Cast-iron orangery box · 52 cm", price: "510 €" },
  { name: "Cast-iron horse head · 50 cm", price: "570 €" },
  { name: "Cast-iron fountain · 142 cm", price: "1100 €" },
];
export function getProducts(lang: Lang): PriceItem[] {
  return lang === "en" ? PRODUCTS_EN : PRODUCTS_FR;
}

export type Content = {
  heroKicker: string;
  heroTitle: string;
  heroLead: string;
  heroPrimary: string;
  heroSecondary: string;
  ratingMeta: string;
  openBadge: string;
  openHoursShort: string;
  storyKicker: string;
  storyTitle: string;
  storyBody: string[];
  stats: { n: string; l: string }[];
  servicesKicker: string;
  servicesTitle: string;
  servicesLead: string;
  featured: Service[];
  menuKicker: string;
  menuTitle: string;
  menuLead: string;
  menuPriceNote: string;
  priceColumns: PriceColumn[];
  menuBoardCaption: string;
  craftKicker: string;
  craftTitle: string;
  craftBody: string[];
  craftRole: string;
  craftCaption: string;
  galleryKicker: string;
  galleryTitle: string;
  galleryLead: string;
  galleryCaptions: string[];
  reviewsKicker: string;
  reviewsTitle: string;
  reviewsLead: string;
  reviews: Review[];
  infoKicker: string;
  infoTitle: string;
  addressLabel: string;
  hoursLabel: string;
  phoneLabel: string;
  mapsCta: string;
  closingTitle: string;
  closingLead: string;
  closingPrimary: string;
  closingSecondary: string;
  navServices: string;
  navCard: string;
  navCraft: string;
  navGallery: string;
  navReviews: string;
  navInfo: string;
};

const FR: Content = {
  heroKicker: "Ornements de jardin en fonte · Style Médicis",
  heroTitle: "Le vase Médicis en fonte, comme dans les jardins à la française.",
  heroLead:
    "Ines Garden reproduit en fonte de fer les grands ornements des jardins classiques : vases et vasques Médicis, jardinières, bacs à oranger, fontaines, statues. Des pièces patinées, faites pour traverser les saisons — et les décennies. Livraison offerte partout en France.",
  heroPrimary: "Commander mes pièces",
  heroSecondary: "Voir le catalogue",
  ratingMeta: "Boutique notée 5/5",
  openBadge: "Commande en ligne 24h/24",
  openHoursShort: "Livraison offerte · partout en France",
  storyKicker: "La maison",
  storyTitle: "Les Jardins d'Inès, spécialiste du Médicis en fonte.",
  storyBody: [
    "Depuis Chalezeule, aux portes de Besançon, Ines Garden façonne et patine des ornements de jardin en fonte de fer dans la grande tradition des jardins à la française. La fonte, plus dense et plus durable que la résine ou la pierre reconstituée, donne à chaque vase ce galbe profond et cette patine qui se bonifie avec le temps.",
    "Du petit vase Médicis de 24 cm à la fontaine monumentale de plus de trois mètres, chaque pièce est proposée en plusieurs tailles et finitions — bronze-vert, pierre, gris, noir mat. On commande en ligne, on est livré gratuitement, et on installe une pièce qui restera là bien après nous.",
  ],
  stats: [
    { n: "5/5", l: "sur les avis Google vérifiés" },
    { n: "Fonte de fer", l: "matière noble, faite pour durer" },
    { n: "Offerte", l: "livraison partout en France" },
  ],
  servicesKicker: "Les pièces signatures",
  servicesTitle: "Trois grands classiques de la fonte.",
  servicesLead:
    "Les ornements les plus demandés de la maison, déclinés en plusieurs tailles et patines. Le catalogue complet en compte bien davantage.",
  featured: [
    { name: "Vase Médicis en fonte", desc: "La pièce signature. Reproduction fidèle du vase Médicis en fonte de fer, du modèle de 24 cm au géant de 155 cm. Finitions bronze-vert, pierre, gris ou noir mat.", price: "dès 60 €", img: `${IMG}/photo_01.webp`, tag: "Best-seller" },
    { name: "Fontaine en fonte", desc: "Fontaine de jardin en fonte, de un à trois étages, jusqu'à 3,60 m de haut. Le point d'eau qui structure tout un parc.", price: "dès 1 100 €", img: `${IMG}/photo_02.webp`, tag: "Pièce d'exception" },
    { name: "Statue en fonte 4 saisons", desc: "Statues en fonte de fer de 150 à 233 cm, allégories des quatre saisons. Finition bronze ou pierre, pour ponctuer une allée ou un bassin.", price: "dès 3 500 €", img: `${IMG}/photo_05.webp`, tag: "Sur-mesure" },
  ],
  menuKicker: "Le catalogue",
  menuTitle: "De la jardinière au vase monumental.",
  menuLead:
    "Toutes nos familles d'ornements en fonte, avec leurs tailles et finitions. Composez votre commande — la livraison est offerte sur l'ensemble du catalogue.",
  menuPriceNote: "Prix indicatifs · Livraison offerte",
  priceColumns: [
    {
      title: "Vases & vasques Médicis", icon: "⚱️", items: [
        { name: "Vase Médicis fonte (24 – 155 cm)", price: "dès 60 €" },
        { name: "Vasque Médicis fonte (27 – 55 cm)", price: "dès 175 €" },
        { name: "Vasque Médicis sur colonne", price: "dès 900 €" },
        { name: "Vasque fontaine aux oiseaux", price: "sur devis" },
        { name: "Vase Médicis cannelé", price: "dès 290 €" },
        { name: "Socle / colonne en fonte", price: "dès 390 €" },
      ],
    },
    {
      title: "Jardin & sculptures", icon: "🏛️", items: [
        { name: "Jardinière en fonte (12 – 30 cm)", price: "dès 50 €" },
        { name: "Bac à oranger / caisse (52 – 79 cm)", price: "dès 510 €" },
        { name: "Fontaine en fonte (1 à 3 étages)", price: "dès 1 100 €" },
        { name: "Statue 4 saisons (150 – 233 cm)", price: "dès 3 500 €" },
        { name: "Tête de cheval en fonte (50 cm)", price: "570 €" },
        { name: "Salon de jardin en fonte", price: "dès 1 900 €" },
      ],
    },
  ],
  menuBoardCaption: "Vases Médicis sur socles, patine bronze-vert.",
  craftKicker: "Le savoir-faire",
  craftTitle: "La fonte, une matière qui se bonifie dehors.",
  craftBody: [
    "Là où la résine ternit et où la pierre reconstituée s'effrite, la fonte de fer s'installe dans le temps. Sa densité lui donne ce poids rassurant, sa patine se nuance saison après saison, et le moindre détail moulé — cannelures, godrons, mascarons — reste net pendant des décennies.",
    "Chaque ornement Ines Garden reprend les proportions des modèles classiques, du vase Médicis aux statues des quatre saisons. On choisit sa taille, sa finition, et on reçoit une pièce livrée, prête à poser — celle qui donnera son allure au jardin.",
  ],
  craftRole: "Reproduction d'ornements · fonte de fer",
  craftCaption: "Statue en fonte sur socle, finition patinée.",
  galleryKicker: "La collection",
  galleryTitle: "Du vrai, photographié au jardin.",
  galleryLead:
    "Quelques pièces de la maison en situation — vases sur socles, bacs à oranger, têtes de cheval. La fonte, dehors, par tous les temps.",
  galleryCaptions: [
    "Vases Médicis sur socles cannelés, devant la bâtisse.",
    "Bacs à oranger en fonte, façon caisses de Versailles.",
    "Tête de cheval en fonte, au milieu des vases.",
  ],
  reviewsKicker: "Ils nous font confiance",
  reviewsTitle: "Ce que disent les clients.",
  reviewsLead: "Des avis Google authentiques, laissés après livraison.",
  reviews: [
    { text: "Belle boutique, du choix, de superbes produits ! J'ai été livré rapidement et je suis ravi !", author: "Aaron Schmidt", meta: "Avis Google · 5★", rating: 5 },
    { text: "Ma commande répond parfaitement à mes attentes, très professionnel, je vous recommande.", author: "Kaliane Silva", meta: "Avis Google · 5★", rating: 5 },
  ],
  infoKicker: "Infos pratiques",
  infoTitle: "Nous trouver.",
  addressLabel: "Adresse",
  hoursLabel: "Disponibilité",
  phoneLabel: "Téléphone",
  mapsCta: "Itinéraire Google Maps",
  closingTitle: "Une pièce en fonte pour votre jardin ?",
  closingLead:
    "Dites-nous ce que vous cherchez : on vous conseille la taille et la finition, et on organise la livraison offerte de vos pièces.",
  closingPrimary: "Commander mes pièces",
  closingSecondary: "Nous appeler",
  navServices: "Signatures",
  navCard: "Catalogue",
  navCraft: "Savoir-faire",
  navGallery: "Collection",
  navReviews: "Avis",
  navInfo: "Infos",
};

const EN: Content = {
  heroKicker: "Cast-iron garden ornaments · Medici style",
  heroTitle: "The cast-iron Medici vase, just like in the great formal gardens.",
  heroLead:
    "Ines Garden reproduces the great ornaments of classical gardens in cast iron: Medici vases and basins, planters, orangery boxes, fountains and statues. Patinated pieces, built to weather the seasons — and the decades. Free delivery across France.",
  heroPrimary: "Order my pieces",
  heroSecondary: "See the catalogue",
  ratingMeta: "Shop rated 5/5",
  openBadge: "Order online 24/7",
  openHoursShort: "Free delivery · across France",
  storyKicker: "The house",
  storyTitle: "Les Jardins d'Inès, the cast-iron Medici specialist.",
  storyBody: [
    "From Chalezeule, on the edge of Besançon, Ines Garden casts and patinates garden ornaments in iron, in the grand tradition of the French formal garden. Denser and far more durable than resin or reconstituted stone, cast iron gives every vase its deep curve and a patina that only improves with time.",
    "From the small 24 cm Medici vase to the monumental fountain over three metres tall, every piece comes in several sizes and finishes — bronze-green, stone, grey, matte black. Order online, get it delivered free, and install a piece that will still be there long after we are.",
  ],
  stats: [
    { n: "5/5", l: "across verified Google reviews" },
    { n: "Cast iron", l: "a noble material, built to last" },
    { n: "Free", l: "delivery across France" },
  ],
  servicesKicker: "The signature pieces",
  servicesTitle: "Three great cast-iron classics.",
  servicesLead:
    "The house's most requested ornaments, available in several sizes and patinas. The full catalogue holds plenty more.",
  featured: [
    { name: "Cast-iron Medici vase", desc: "The signature piece. A faithful reproduction of the Medici vase in cast iron, from the 24 cm model to the 155 cm giant. Bronze-green, stone, grey or matte-black finishes.", price: "from €60", img: `${IMG}/photo_01.webp`, tag: "Best-seller" },
    { name: "Cast-iron fountain", desc: "A cast-iron garden fountain, one to three tiers, up to 3.60 m tall. The water feature that anchors a whole park.", price: "from €1,100", img: `${IMG}/photo_02.webp`, tag: "Statement piece" },
    { name: "Cast-iron Four Seasons statue", desc: "Cast-iron statues from 150 to 233 cm, allegories of the four seasons. Bronze or stone finish, to punctuate a path or a pond.", price: "from €3,500", img: `${IMG}/photo_05.webp`, tag: "Made to order" },
  ],
  menuKicker: "The catalogue",
  menuTitle: "From the planter to the monumental vase.",
  menuLead:
    "All our families of cast-iron ornaments, with their sizes and finishes. Build your order — delivery is free across the whole catalogue.",
  menuPriceNote: "Indicative prices · Free delivery",
  priceColumns: [
    {
      title: "Medici vases & basins", icon: "⚱️", items: [
        { name: "Cast-iron Medici vase (24 – 155 cm)", price: "from €60" },
        { name: "Cast-iron Medici basin (27 – 55 cm)", price: "from €175" },
        { name: "Medici basin on column", price: "from €900" },
        { name: "Bird fountain basin", price: "on quote" },
        { name: "Fluted Medici vase", price: "from €290" },
        { name: "Cast-iron plinth / column", price: "from €390" },
      ],
    },
    {
      title: "Garden & sculptures", icon: "🏛️", items: [
        { name: "Cast-iron planter (12 – 30 cm)", price: "from €50" },
        { name: "Orangery box / crate (52 – 79 cm)", price: "from €510" },
        { name: "Cast-iron fountain (1 to 3 tiers)", price: "from €1,100" },
        { name: "Four Seasons statue (150 – 233 cm)", price: "from €3,500" },
        { name: "Cast-iron horse head (50 cm)", price: "€570" },
        { name: "Cast-iron garden set", price: "from €1,900" },
      ],
    },
  ],
  menuBoardCaption: "Medici vases on plinths, bronze-green patina.",
  craftKicker: "The craft",
  craftTitle: "Cast iron, a material that ages well outdoors.",
  craftBody: [
    "Where resin dulls and reconstituted stone crumbles, cast iron settles into time. Its density gives it that reassuring weight, its patina deepens season after season, and every moulded detail — flutes, gadroons, mascarons — stays crisp for decades.",
    "Every Ines Garden ornament keeps the proportions of the classical models, from the Medici vase to the Four Seasons statues. You choose the size and the finish, and you receive a piece delivered ready to place — the one that gives the garden its allure.",
  ],
  craftRole: "Ornament reproduction · cast iron",
  craftCaption: "Cast-iron statue on plinth, patinated finish.",
  galleryKicker: "The collection",
  galleryTitle: "The real thing, shot in the garden.",
  galleryLead:
    "A few of the house's pieces in situ — vases on plinths, orangery boxes, horse heads. Cast iron, outdoors, in all weathers.",
  galleryCaptions: [
    "Medici vases on fluted plinths, in front of the house.",
    "Cast-iron orangery boxes, Versailles-crate style.",
    "Cast-iron horse head, among the vases.",
  ],
  reviewsKicker: "They trust us",
  reviewsTitle: "What customers say.",
  reviewsLead: "Genuine Google reviews, left after delivery.",
  reviews: [
    { text: "Lovely shop, great choice, superb products! I was delivered quickly and I'm delighted!", author: "Aaron Schmidt", meta: "Google review · 5★", rating: 5 },
    { text: "My order matches my expectations perfectly, very professional, I recommend them.", author: "Kaliane Silva", meta: "Google review · 5★", rating: 5 },
  ],
  infoKicker: "Practical info",
  infoTitle: "Find us.",
  addressLabel: "Address",
  hoursLabel: "Availability",
  phoneLabel: "Phone",
  mapsCta: "Directions on Google Maps",
  closingTitle: "A cast-iron piece for your garden?",
  closingLead:
    "Tell us what you're after: we'll advise on the size and finish, and arrange free delivery of your pieces.",
  closingPrimary: "Order my pieces",
  closingSecondary: "Call us",
  navServices: "Signatures",
  navCard: "Catalogue",
  navCraft: "Craft",
  navGallery: "Collection",
  navReviews: "Reviews",
  navInfo: "Info",
};

export function getInesGardenContent(lang: Lang): Content {
  return lang === "en" ? EN : FR;
}
