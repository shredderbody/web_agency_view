import type { Lang } from "./i18n";

/* ════════════════════════════════════════════════════════════════════════════
   Maison Éphémère — Wedding & Event Planner — Paris (démo concept)
   Contenu structuré bilingue FR/EN. Démo « idée d'événementiel » (mariage) :
   ce n'est PAS un client réel Google — l'imagerie est générée sur-mesure (KIE)
   et les témoignages illustrent le métier de wedding planner. Tarifs indicatifs.
   Photos : public/clients/maison-ephemere/photo_00..09.webp
   ════════════════════════════════════════════════════════════════════════════ */

export const IMG = "/clients/maison-ephemere";

export type Service = { name: string; desc: string; price: string; img?: string; tag?: string };
export type PriceItem = { name: string; price: string };
export type PriceColumn = { title: string; icon: string; items: PriceItem[] };
export type Review = { text: string; author: string; meta: string; rating: number };

export const FACTS = {
  name: "Maison Éphémère",
  fullName: "Maison Éphémère · Wedding & Event Planner",
  trade: { fr: "Wedding & event planner · Paris", en: "Wedding & event planner · Paris" },
  city: "Paris",
  address: "18 rue des Archives, 75004 Paris",
  phone: "01 84 80 00 14",
  website: "https://maison-ephemere.fr",
  rating: "5,0",
  ratingEn: "5.0",
  reviewCount: 32,
  lat: 48.8584,
  lon: 2.3559,
  // Centre de Paris (Le Marais) — la maison reçoit sur rendez-vous.
  mapsUri:
    "https://www.google.com/maps/search/?api=1&query=18+rue+des+Archives+75004+Paris",
  hours: {
    fr: [
      { d: "Lundi", h: "10h00 – 19h00" },
      { d: "Mardi", h: "10h00 – 19h00" },
      { d: "Mercredi", h: "10h00 – 19h00" },
      { d: "Jeudi", h: "10h00 – 19h00" },
      { d: "Vendredi", h: "10h00 – 19h00" },
      { d: "Samedi", h: "sur rendez-vous" },
      { d: "Dimanche", h: "fermé" },
    ],
    en: [
      { d: "Monday", h: "10:00am – 7:00pm" },
      { d: "Tuesday", h: "10:00am – 7:00pm" },
      { d: "Wednesday", h: "10:00am – 7:00pm" },
      { d: "Thursday", h: "10:00am – 7:00pm" },
      { d: "Friday", h: "10:00am – 7:00pm" },
      { d: "Saturday", h: "by appointment" },
      { d: "Sunday", h: "closed" },
    ],
  },
} as const;

// Bandeau défilant — vocabulaire événementiel, pur effet d'immersion.
export const MARQUEE = [
  "Mariage", "Coordination jour J", "Scénographie florale", "Lieux d'exception",
  "Fiançailles", "Cérémonie laïque", "Traiteur & accords", "Papeterie",
  "Sur-mesure", "Baby shower", "Événement privé",
];

// Types d'événement proposés dans la modale « rendez-vous découverte ».
export type EventType = { name: string; desc: string; price: string };
const EVENT_TYPES_FR: EventType[] = [
  { name: "Mariage", desc: "Cérémonie, réception, déco et coordination clé en main.", price: "Sur-mesure" },
  { name: "Fiançailles / PACS", desc: "Une fête intime et élégante pour célébrer le oui.", price: "Sur-mesure" },
  { name: "Baby shower / anniversaire", desc: "Un moment privé orchestré dans le moindre détail.", price: "Sur-mesure" },
  { name: "Événement d'entreprise", desc: "Soirée, lancement ou séminaire haut de gamme.", price: "Sur devis" },
];
const EVENT_TYPES_EN: EventType[] = [
  { name: "Wedding", desc: "Ceremony, reception, décor and turnkey coordination.", price: "Bespoke" },
  { name: "Engagement / civil union", desc: "An intimate, elegant party to celebrate the yes.", price: "Bespoke" },
  { name: "Baby shower / birthday", desc: "A private moment orchestrated down to the detail.", price: "Bespoke" },
  { name: "Corporate event", desc: "Upscale evening, launch or seminar.", price: "On quote" },
];
export function getEventTypes(lang: Lang): EventType[] {
  return lang === "en" ? EVENT_TYPES_EN : EVENT_TYPES_FR;
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
  heroKicker: "Wedding & event planner · Le Marais, Paris",
  heroTitle: "Votre jour, orchestré dans le moindre détail.",
  heroLead:
    "Maison Éphémère imagine et orchestre des mariages et des événements privés d'exception. De la première idée au dernier toast, on s'occupe de tout — vous n'avez qu'à profiter de l'instant.",
  heroPrimary: "Rendez-vous découverte",
  heroSecondary: "Nos prestations",
  ratingMeta: "sur 32 avis de mariés",
  openBadge: "Sur rendez-vous",
  openHoursShort: "Du lundi au vendredi · 10h–19h",
  storyKicker: "La maison",
  storyTitle: "Une vision, mille détails, une seule promesse.",
  storyBody: [
    "Depuis notre atelier du Marais, nous concevons des célébrations à votre image : un lieu qui vous ressemble, une scénographie cousue main, une journée qui se déroule sans la moindre fausse note.",
    "Recherche de lieu, sélection des prestataires, décoration florale, planning minuté, coordination le jour J : on tient tous les fils pour que vous, vos familles et vos invités viviez l'événement pleinement — et rien d'autre.",
  ],
  stats: [
    { n: "5/5", l: "sur 32 avis de mariés" },
    { n: "120+", l: "prestataires de confiance" },
    { n: "Sur-mesure", l: "chaque événement est unique" },
  ],
  servicesKicker: "Nos prestations",
  servicesTitle: "Trois façons d'être accompagné·e.",
  servicesLead:
    "De la simple coordination le jour J à l'organisation clé en main, on s'adapte à votre projet et à votre budget. Tarifs indicatifs — précisés après le rendez-vous découverte.",
  featured: [
    { name: "Mariage clé en main", desc: "De la conception à la coordination : on imagine, on planifie et on orchestre tout, du oui au dernier slow.", price: "dès 4 900 €", img: `${IMG}/photo_01.webp`, tag: "Le plus demandé" },
    { name: "Décoration & scénographie florale", desc: "Univers floral sur-mesure, art de la table et mise en lumière pour un décor qui coupe le souffle.", price: "dès 2 500 €", img: `${IMG}/photo_04.webp`, tag: "Signature" },
    { name: "Coordination jour J", desc: "Vous avez tout prévu ? On prend la main le jour J : planning, prestataires, imprévus — vous profitez.", price: "dès 1 200 €", img: `${IMG}/photo_03.webp`, tag: "Sérénité" },
  ],
  menuKicker: "Formules & prestations",
  menuTitle: "Des accompagnements clairs, sans surprise.",
  menuLead:
    "Choisissez la formule qui vous correspond, complétez avec les prestations à la carte. Tarifs indicatifs — le devis est établi sur-mesure après votre rendez-vous découverte.",
  menuPriceNote: "Rendez-vous découverte offert",
  priceColumns: [
    {
      title: "Nos formules", icon: "💍", items: [
        { name: "Rendez-vous découverte", price: "offert" },
        { name: "Coordination jour J", price: "dès 1 200 €" },
        { name: "Cérémonie laïque", price: "dès 900 €" },
        { name: "Organisation partielle", price: "dès 2 800 €" },
        { name: "Mariage clé en main", price: "dès 4 900 €" },
      ],
    },
    {
      title: "À la carte", icon: "✦", items: [
        { name: "Recherche de lieu d'exception", price: "dès 600 €" },
        { name: "Décoration & scénographie florale", price: "dès 2 500 €" },
        { name: "Sélection traiteur & accords", price: "sur devis" },
        { name: "Papeterie & faire-part", price: "dès 350 €" },
        { name: "Logistique & transport invités", price: "sur devis" },
      ],
    },
  ],
  menuBoardCaption: "Une planche d'ambiance préparée pour un mariage d'automne.",
  craftKicker: "Notre approche",
  craftTitle: "Vous rêvez la journée, on en fait une réalité.",
  craftBody: [
    "« On nous avait dit qu'organiser un mariage était stressant. Avec Maison Éphémère, on n'a rien vu venir : tout était fluide, beau, à l'heure » — c'est ce que nous disent les couples.",
    "Une seule interlocutrice du premier café au jour J, un budget tenu, un réseau de prestataires triés sur le volet et une obsession du détail : voilà ce qui fait la différence entre un joli mariage et un mariage inoubliable.",
  ],
  craftRole: "Wedding planner · fondatrice",
  craftCaption: "Camille, fondatrice, en repérage sur l'un de nos lieux partenaires.",
  galleryKicker: "Réalisations",
  galleryTitle: "Quelques instants signés Maison Éphémère.",
  galleryLead:
    "Cérémonies en plein air, dîners aux chandelles, premières danses : un aperçu de ce qu'on aime créer.",
  galleryCaptions: [
    "Arche fleurie pour une cérémonie en extérieur.",
    "Première danse sous une voûte de guirlandes lumineuses.",
    "Dressage de table et papeterie calligraphiée.",
  ],
  reviewsKicker: "Ils nous ont fait confiance",
  reviewsTitle: "Ce que disent les mariés.",
  reviewsLead: "Des témoignages de couples accompagnés par la maison.",
  reviews: [
    { text: "Camille et son équipe ont rendu notre mariage absolument parfait. Tout était pensé, organisé, magnifique — et le jour J, nous n'avons eu qu'à profiter. On recommande les yeux fermés.", author: "Léa & Antoine", meta: "Mariage · Château de Vallery", rating: 5 },
    { text: "Un accompagnement d'une douceur et d'un professionnalisme rares. Notre budget a été respecté à l'euro près et la déco florale a fait pleurer nos invités. Merci pour cette journée de rêve.", author: "Sarah & Marion", meta: "Mariage · Domaine des Évis", rating: 5 },
  ],
  infoKicker: "Nous rencontrer",
  infoTitle: "Prenons un café.",
  addressLabel: "Atelier",
  hoursLabel: "Disponibilités",
  phoneLabel: "Téléphone",
  mapsCta: "Voir sur Google Maps",
  closingTitle: "Et si on parlait de votre grand jour ?",
  closingLead:
    "Le rendez-vous découverte est offert et sans engagement. Parlez-nous de votre projet : on vous dit tout de suite comment on peut le rendre inoubliable.",
  closingPrimary: "Rendez-vous découverte",
  closingSecondary: "Nous appeler",
  navServices: "Prestations",
  navCard: "Formules",
  navCraft: "Approche",
  navGallery: "Réalisations",
  navReviews: "Avis",
  navInfo: "Contact",
};

const EN: Content = {
  heroKicker: "Wedding & event planner · Le Marais, Paris",
  heroTitle: "Your day, orchestrated down to the smallest detail.",
  heroLead:
    "Maison Éphémère designs and orchestrates exceptional weddings and private events. From the first idea to the last toast, we handle everything — you just enjoy the moment.",
  heroPrimary: "Book a consultation",
  heroSecondary: "Our services",
  ratingMeta: "across 32 newlywed reviews",
  openBadge: "By appointment",
  openHoursShort: "Monday to Friday · 10am–7pm",
  storyKicker: "The studio",
  storyTitle: "One vision, a thousand details, a single promise.",
  storyBody: [
    "From our studio in Le Marais, we craft celebrations in your image: a venue that feels like you, bespoke staging, and a day that unfolds without a single wrong note.",
    "Venue scouting, vendor selection, floral design, minute-by-minute planning, day-of coordination: we hold every thread so that you, your families and your guests can live the event fully — and nothing else.",
  ],
  stats: [
    { n: "5/5", l: "across 32 newlywed reviews" },
    { n: "120+", l: "trusted vendors" },
    { n: "Bespoke", l: "every event is one of a kind" },
  ],
  servicesKicker: "Our services",
  servicesTitle: "Three ways to be supported.",
  servicesLead:
    "From simple day-of coordination to full turnkey planning, we adapt to your project and your budget. Indicative prices — confirmed after the discovery consultation.",
  featured: [
    { name: "Turnkey wedding", desc: "From concept to coordination: we imagine, plan and orchestrate everything, from the vows to the last slow dance.", price: "from €4,900", img: `${IMG}/photo_01.webp`, tag: "Most requested" },
    { name: "Décor & floral design", desc: "Bespoke floral world, table styling and lighting for a setting that takes your breath away.", price: "from €2,500", img: `${IMG}/photo_04.webp`, tag: "Signature" },
    { name: "Day-of coordination", desc: "Planned it all yourself? We take over on the day: timeline, vendors, surprises — you simply enjoy.", price: "from €1,200", img: `${IMG}/photo_03.webp`, tag: "Peace of mind" },
  ],
  menuKicker: "Packages & services",
  menuTitle: "Clear support, no surprises.",
  menuLead:
    "Pick the package that suits you, then add à la carte services. Indicative prices — your bespoke quote is set after the discovery consultation.",
  menuPriceNote: "Discovery consultation free",
  priceColumns: [
    {
      title: "Our packages", icon: "💍", items: [
        { name: "Discovery consultation", price: "free" },
        { name: "Day-of coordination", price: "from €1,200" },
        { name: "Civil ceremony", price: "from €900" },
        { name: "Partial planning", price: "from €2,800" },
        { name: "Turnkey wedding", price: "from €4,900" },
      ],
    },
    {
      title: "À la carte", icon: "✦", items: [
        { name: "Exceptional venue scouting", price: "from €600" },
        { name: "Décor & floral design", price: "from €2,500" },
        { name: "Caterer & pairing selection", price: "on quote" },
        { name: "Stationery & invitations", price: "from €350" },
        { name: "Logistics & guest transport", price: "on quote" },
      ],
    },
  ],
  menuBoardCaption: "A mood board prepared for an autumn wedding.",
  craftKicker: "Our approach",
  craftTitle: "You dream the day, we make it real.",
  craftBody: [
    "\"We were told planning a wedding was stressful. With Maison Éphémère, we never felt it: everything was smooth, beautiful, on time\" — that's what couples tell us.",
    "A single point of contact from the first coffee to the big day, a budget that's respected, a hand-picked network of vendors and an obsession with detail: that's what turns a lovely wedding into an unforgettable one.",
  ],
  craftRole: "Wedding planner · founder",
  craftCaption: "Camille, founder, scouting one of our partner venues.",
  galleryKicker: "Our work",
  galleryTitle: "A few moments signed Maison Éphémère.",
  galleryLead:
    "Outdoor ceremonies, candlelit dinners, first dances: a glimpse of what we love to create.",
  galleryCaptions: [
    "Floral arch for an outdoor ceremony.",
    "First dance under a canopy of string lights.",
    "Table styling and calligraphed stationery.",
  ],
  reviewsKicker: "They trusted us",
  reviewsTitle: "What newlyweds say.",
  reviewsLead: "Testimonials from couples the studio has guided.",
  reviews: [
    { text: "Camille and her team made our wedding absolutely perfect. Everything was thought through, organised, gorgeous — and on the day, all we had to do was enjoy. We recommend them wholeheartedly.", author: "Léa & Antoine", meta: "Wedding · Château de Vallery", rating: 5 },
    { text: "A rare blend of warmth and professionalism. Our budget was respected to the euro and the floral décor brought our guests to tears. Thank you for a dream day.", author: "Sarah & Marion", meta: "Wedding · Domaine des Évis", rating: 5 },
  ],
  infoKicker: "Meet us",
  infoTitle: "Let's grab a coffee.",
  addressLabel: "Studio",
  hoursLabel: "Availability",
  phoneLabel: "Phone",
  mapsCta: "View on Google Maps",
  closingTitle: "Shall we talk about your big day?",
  closingLead:
    "The discovery consultation is free and no-strings. Tell us about your project and we'll tell you right away how we can make it unforgettable.",
  closingPrimary: "Book a consultation",
  closingSecondary: "Call us",
  navServices: "Services",
  navCard: "Packages",
  navCraft: "Approach",
  navGallery: "Our work",
  navReviews: "Reviews",
  navInfo: "Contact",
};

export function getEphemereContent(lang: Lang): Content {
  return lang === "en" ? EN : FR;
}
