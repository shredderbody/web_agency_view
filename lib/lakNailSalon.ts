import type { Lang } from "./i18n";

/* ════════════════════════════════════════════════════════════════════════════
   L.A.K Nail Salon — New York (NoLita) — données client (démo)
   Contenu structuré bilingue FR/EN à partir des données réelles Google Places
   (place_id ChIJ2fQZM8hZwokR2cE3VIthTeo, récupérées le 2026-06-13). Tarifs
   indicatifs reconstitués d'après les prestations citées dans les avis Google
   (pédicure spa 68 $, Gel-X, poudre dip, soak-off) — la maison n'affiche pas
   d'ardoise publique.
   Photos : public/clients/lak-nail-salon/photo_00..09.webp
   ════════════════════════════════════════════════════════════════════════════ */

export const IMG = "/clients/lak-nail-salon";

export type Service = { name: string; desc: string; price: string; img?: string; tag?: string };
export type PriceItem = { name: string; price: string };
export type PriceColumn = { title: string; icon: string; items: PriceItem[] };
export type Review = { text: string; author: string; meta: string; rating: number };

export const FACTS = {
  name: "L.A.K Nail Salon",
  fullName: "L.A.K Nail Salon · NoLita",
  trade: { fr: "Onglerie · Manucure & pédicure", en: "Nail salon · Manicure & pedicure" },
  city: "New York",
  address: "176 Lafayette St, New York, NY 10013",
  phone: "(646) 755-0959",
  website: "http://l-a-k-nailsalonnyc.com/",
  rating: "4,5",
  ratingEn: "4.5",
  reviewCount: 328,
  lat: 40.7204908,
  lon: -73.9988457,
  placeId: "ChIJ2fQZM8hZwokR2cE3VIthTeo",
  mapsUri:
    "https://www.google.com/maps/dir/?api=1&destination=40.7204908,-73.9988457&destination_place_id=ChIJ2fQZM8hZwokR2cE3VIthTeo",
  hours: {
    fr: [
      { d: "Lundi", h: "10h00 – 20h00" },
      { d: "Mardi", h: "10h00 – 20h30" },
      { d: "Mercredi", h: "10h00 – 20h30" },
      { d: "Jeudi", h: "10h30 – 20h30" },
      { d: "Vendredi", h: "10h30 – 20h30" },
      { d: "Samedi", h: "10h30 – 20h30" },
      { d: "Dimanche", h: "10h00 – 20h00" },
    ],
    en: [
      { d: "Monday", h: "10:00am – 8:00pm" },
      { d: "Tuesday", h: "10:00am – 8:30pm" },
      { d: "Wednesday", h: "10:00am – 8:30pm" },
      { d: "Thursday", h: "10:30am – 8:30pm" },
      { d: "Friday", h: "10:30am – 8:30pm" },
      { d: "Saturday", h: "10:30am – 8:30pm" },
      { d: "Sunday", h: "10:00am – 8:00pm" },
    ],
  },
} as const;

// Bandeau défilant — vocabulaire onglerie, pur effet d'immersion.
export const MARQUEE = [
  "Gel-X", "Manucure", "Pédicure", "Nail art", "Poudre dip", "Chrome",
  "Vernis gel", "French", "Soak-off", "Builder gel", "Ouvert 7j/7",
];

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
  heroKicker: "Onglerie · Manucure & pédicure · NoLita, New York",
  heroTitle: "Des ongles qui font tourner les têtes, en plein cœur de NoLita.",
  heroLead:
    "Sur Lafayette Street, L.A.K Nail Salon habille vos mains et vos pieds : pose Gel-X, vernis gel, poudre dip, ombré et nail art sur-mesure. Une finition impeccable, sept jours sur sept — sans rendez-vous bienvenue.",
  heroPrimary: "Prendre rendez-vous",
  heroSecondary: "Voir les prestations",
  ratingMeta: "328 avis Google",
  openBadge: "Ouvert 7j/7",
  openHoursShort: "Tous les jours · jusqu'à 20h30",
  storyKicker: "Le salon",
  storyTitle: "L'adresse beauté des ongles à Lafayette Street.",
  storyBody: [
    "À deux pas de SoHo et de Little Italy, L.A.K Nail Salon est de ces adresses où l'on entre pour une pose et où l'on revient pour l'accueil. On vous y reçoit dès la porte, on prend le temps de choisir la bonne forme et la bonne couleur — amande, carré, French ou chrome.",
    "Gel-X, poudre dip, vernis gel, ombré et nail art : les prothésistes y soignent chaque détail, du soak-off à la dernière couche de top coat. On en ressort avec des ongles nets, brillants — et l'envie de revenir.",
  ],
  stats: [
    { n: "4,5/5", l: "sur 328 avis Google" },
    { n: "7j/7", l: "tous les jours, jusqu'à 20h30" },
    { n: "Gel-X", l: "ombré, chrome & nail art sur-mesure" },
  ],
  servicesKicker: "Les prestations",
  servicesTitle: "Ce pour quoi on revient.",
  servicesLead:
    "Pose, manucure et nail art, exécutés avec soin et finis au top coat. Tarifs indicatifs — précisés au salon selon la forme et la longueur.",
  featured: [
    { name: "Gel-X · pose complète", desc: "Pose souple et légère, forme amande ou carré, finition brillante longue tenue.", price: "75 $", img: `${IMG}/photo_01.webp`, tag: "Le plus demandé" },
    { name: "Manucure gel ombré", desc: "Dégradé fondu sur-mesure, top coat miroir — l'effet « ongles parfaits » qui dure.", price: "40 $", img: `${IMG}/photo_04.webp`, tag: "Chic" },
    { name: "Nail art sur-mesure", desc: "Motifs dessinés à main levée, chrome, strass — autant d'ongles que vous voulez.", price: "dès 5 $", img: `${IMG}/photo_03.webp`, tag: "Création" },
  ],
  menuKicker: "La carte",
  menuTitle: "Manucure, pose et pédicure.",
  menuLead:
    "Des prestations claires, à prix justes. Tarifs indicatifs reconstitués d'après les soins les plus demandés — le détail vous est confirmé au salon.",
  menuPriceNote: "Sans rendez-vous bienvenue",
  priceColumns: [
    {
      title: "Manucure & vernis", icon: "💅", items: [
        { name: "Manucure classique", price: "25 $" },
        { name: "Pose vernis gel", price: "40 $" },
        { name: "Builder gel · BIAB", price: "55 $" },
        { name: "Poudre dip (dip powder)", price: "50 $" },
        { name: "Dépose & soin (soak-off)", price: "15 $" },
      ],
    },
    {
      title: "Pose, pédicure & art", icon: "✨", items: [
        { name: "Gel-X · pose complète", price: "75 $" },
        { name: "Acrylique · pose complète", price: "65 $" },
        { name: "Remplissage (fill)", price: "55 $" },
        { name: "Pédicure spa deluxe", price: "68 $" },
        { name: "Nail art · chrome · strass", price: "dès 5 $" },
      ],
    },
  ],
  menuBoardCaption: "Quelques créations réalisées au salon.",
  craftKicker: "Le savoir-faire",
  craftTitle: "Des mains expertes, une finition impeccable.",
  craftBody: [
    "« Lily a fait un travail magnifique sur mon soak-off et ma nouvelle pose. J'ai adoré la couleur et la forme amande » — c'est ce que disent les habituées de L.A.K.",
    "Soak-off soigné, formes nettes, dégradés fondus et nail art à main levée : les prothésistes prennent le temps de bien faire. On vient pour une pose, on repart avec des ongles qu'on a envie de montrer.",
  ],
  craftRole: "Prothésistes ongulaires",
  craftCaption: "French délicate et nail art floral, réalisés au salon.",
  galleryKicker: "Les créations",
  galleryTitle: "Couleur, chrome et nail art.",
  galleryLead:
    "Quelques poses du jour. On vient pour une couleur, on revient pour les détails.",
  galleryCaptions: [
    "Vernis gel rouge, un grand classique de la maison.",
    "Nail art coloré, dessiné à main levée.",
    "French revisitée et finitions soignées.",
  ],
  reviewsKicker: "Elles en parlent",
  reviewsTitle: "Ce que disent les clientes.",
  reviewsLead: "Des avis Google authentiques, récoltés au fil des poses.",
  reviews: [
    { text: "Je suis venue après le travail et on m'a accueillie tout de suite. Lily a fait un travail magnifique sur mon soak-off et ma nouvelle pose. J'ai adoré la couleur et la forme amande. Je reviendrai, c'est sûr !", author: "Ana Garcia", meta: "Avis Google · 5★", rating: 5 },
    { text: "Quel salon fabuleux, et abordable en plus ! Co Co a remis mes ongles en état et posé une superbe poudre dip « Christmas Red ». Travail impeccable, je recommande vivement et je réserverai à nouveau dès mon retour à New York 👏", author: "Susan Clift", meta: "Avis Google · 5★", rating: 5 },
  ],
  infoKicker: "Infos pratiques",
  infoTitle: "Venir nous voir.",
  addressLabel: "Adresse",
  hoursLabel: "Horaires",
  phoneLabel: "Téléphone",
  mapsCta: "Itinéraire Google Maps",
  closingTitle: "Vos prochains ongles vous attendent.",
  closingLead:
    "Réservez en ligne en deux gestes, appelez-nous, ou passez directement : c'est ouvert tous les jours jusqu'à 20h30.",
  closingPrimary: "Prendre rendez-vous",
  closingSecondary: "Appeler le salon",
  navServices: "Prestations",
  navCard: "La carte",
  navCraft: "Savoir-faire",
  navGallery: "Créations",
  navReviews: "Avis",
  navInfo: "Infos",
};

const EN: Content = {
  heroKicker: "Nail salon · Manicure & pedicure · NoLita, New York",
  heroTitle: "Head-turning nails, right in the heart of NoLita.",
  heroLead:
    "On Lafayette Street, L.A.K Nail Salon takes care of your hands and feet: Gel-X sets, gel polish, dip powder, ombré and custom nail art. A flawless finish, seven days a week — walk-ins welcome.",
  heroPrimary: "Book an appointment",
  heroSecondary: "See the services",
  ratingMeta: "328 Google reviews",
  openBadge: "Open 7 days",
  openHoursShort: "Every day · until 8:30pm",
  storyKicker: "The salon",
  storyTitle: "The nail destination on Lafayette Street.",
  storyBody: [
    "A stone's throw from SoHo and Little Italy, L.A.K Nail Salon is one of those spots you walk into for a set and come back to for the welcome. You're greeted at the door, and they take the time to find the right shape and the right color — almond, square, French or chrome.",
    "Gel-X, dip powder, gel polish, ombré and nail art: the techs care for every detail, from the soak-off to the final coat of top coat. You leave with clean, glossy nails — and a reason to come back.",
  ],
  stats: [
    { n: "4.5/5", l: "across 328 Google reviews" },
    { n: "7 days", l: "every day, until 8:30pm" },
    { n: "Gel-X", l: "ombré, chrome & custom nail art" },
  ],
  servicesKicker: "The services",
  servicesTitle: "What people come back for.",
  servicesLead:
    "Sets, manicures and nail art, done with care and finished with top coat. Indicative prices — confirmed in salon by shape and length.",
  featured: [
    { name: "Gel-X · full set", desc: "Light, flexible set, almond or square shape, long-lasting glossy finish.", price: "$75", img: `${IMG}/photo_01.webp`, tag: "Most requested" },
    { name: "Ombré gel manicure", desc: "Custom blended fade, mirror top coat — the lasting \"perfect nails\" effect.", price: "$40", img: `${IMG}/photo_04.webp`, tag: "Chic" },
    { name: "Custom nail art", desc: "Freehand designs, chrome, rhinestones — as many nails as you like.", price: "from $5", img: `${IMG}/photo_03.webp`, tag: "Bespoke" },
  ],
  menuKicker: "The menu",
  menuTitle: "Manicure, sets and pedicure.",
  menuLead:
    "Clear services, fairly priced. Indicative prices based on the most requested treatments — the detail is confirmed in salon.",
  menuPriceNote: "Walk-ins welcome",
  priceColumns: [
    {
      title: "Manicure & polish", icon: "💅", items: [
        { name: "Classic manicure", price: "$25" },
        { name: "Gel polish", price: "$40" },
        { name: "Builder gel · BIAB", price: "$55" },
        { name: "Dip powder", price: "$50" },
        { name: "Removal & care (soak-off)", price: "$15" },
      ],
    },
    {
      title: "Sets, pedicure & art", icon: "✨", items: [
        { name: "Gel-X · full set", price: "$75" },
        { name: "Acrylic · full set", price: "$65" },
        { name: "Fill", price: "$55" },
        { name: "Deluxe spa pedicure", price: "$68" },
        { name: "Nail art · chrome · rhinestones", price: "from $5" },
      ],
    },
  ],
  menuBoardCaption: "A few designs created in the salon.",
  craftKicker: "The craft",
  craftTitle: "Expert hands, a flawless finish.",
  craftBody: [
    "\"Lily did an excellent job on my soak-off and my new set. I loved the color and the almond shape\" — that's what L.A.K's regulars say.",
    "Careful soak-offs, clean shapes, blended fades and freehand nail art: the techs take the time to do it right. You come in for a set, you leave with nails you want to show off.",
  ],
  craftRole: "Nail technicians",
  craftCaption: "Delicate French and floral nail art, done in the salon.",
  galleryKicker: "The designs",
  galleryTitle: "Color, chrome and nail art.",
  galleryLead:
    "A few of the day's sets. You come for a color, you stay for the details.",
  galleryCaptions: [
    "Red gel polish, a house classic.",
    "Colorful freehand nail art.",
    "A reimagined French and clean finishing.",
  ],
  reviewsKicker: "Word of mouth",
  reviewsTitle: "What clients say.",
  reviewsLead: "Genuine Google reviews, gathered set after set.",
  reviews: [
    { text: "Came in after work and was welcomed right away. Lily did an excellent job on my soak-off and my new set. I loved the color and the almond shape. I'll definitely be back!", author: "Ana Garcia", meta: "Google review · 5★", rating: 5 },
    { text: "What a fabulous salon, and affordable too! Co Co cleaned up my nails and added an awesome dip powder in \"Christmas Red\". Fantastic job — I highly recommend it and will book again when I'm back in NYC 👏", author: "Susan Clift", meta: "Google review · 5★", rating: 5 },
  ],
  infoKicker: "Practical info",
  infoTitle: "Come and see us.",
  addressLabel: "Address",
  hoursLabel: "Opening hours",
  phoneLabel: "Phone",
  mapsCta: "Directions on Google Maps",
  closingTitle: "Your next set is waiting.",
  closingLead:
    "Book online in two taps, give us a call, or just drop by: open every day until 8:30pm.",
  closingPrimary: "Book an appointment",
  closingSecondary: "Call the salon",
  navServices: "Services",
  navCard: "Menu",
  navCraft: "The craft",
  navGallery: "Designs",
  navReviews: "Reviews",
  navInfo: "Info",
};

export function getLakContent(lang: Lang): Content {
  return lang === "en" ? EN : FR;
}
