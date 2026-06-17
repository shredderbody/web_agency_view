import type { Lang } from "./i18n";

/* ════════════════════════════════════════════════════════════════════════════
   Texas Plumbing Pros — Gun Barrel City, TX (Cedar Creek Lake) — données client
   (démo). Contenu structuré bilingue FR/EN à partir des données réelles Google
   Places (place_id ChIJgdNI238kSYYR5rk1By0vA-k, récupérées le 2026-06-17) et du
   site officiel txplumbingpros.com : entreprise familiale depuis 2014, licence
   RMP #41426 (Texas State Board of Plumbing Examiners), service 24/7. Les
   prestations de plomberie se chiffrant sur devis, les colonnes « tarifs »
   affichent la disponibilité réelle (24/7, jour même, devis gratuit) plutôt
   qu'un prix fixe.
   Photos : public/clients/texas-plumbing-pros/photo_00..09.webp
   ════════════════════════════════════════════════════════════════════════════ */

export const IMG = "/clients/texas-plumbing-pros";

export type Service = { name: string; desc: string; price: string; img?: string; tag?: string };
export type PriceItem = { name: string; price: string };
export type PriceColumn = { title: string; icon: string; items: PriceItem[] };
export type Review = { text: string; author: string; meta: string; rating: number };

export const FACTS = {
  name: "Texas Plumbing Pros",
  fullName: "Texas Plumbing Pros · Gun Barrel City",
  trade: { fr: "Plomberie · Dépannage & installation", en: "Plumbing · Repair & installation" },
  city: "Gun Barrel City, TX",
  address: "322 N Gun Barrel Ln, Gun Barrel City, TX 75156",
  phone: "(903) 802-9839",
  email: "brandon@txplumbingpros.com",
  website: "https://www.txplumbingpros.com/",
  license: "RMP #41426",
  since: 2014,
  rating: "4,9",
  ratingEn: "4.9",
  reviewCount: 463,
  lat: 32.3341064,
  lon: -96.1110733,
  placeId: "ChIJgdNI238kSYYR5rk1By0vA-k",
  mapsUri:
    "https://www.google.com/maps/dir/?api=1&destination=32.3341064,-96.1110733&destination_place_id=ChIJgdNI238kSYYR5rk1By0vA-k",
  hours: {
    fr: [
      { d: "Lundi", h: "08h00 – 17h00" },
      { d: "Mardi", h: "08h00 – 17h00" },
      { d: "Mercredi", h: "08h00 – 17h00" },
      { d: "Jeudi", h: "08h00 – 17h00" },
      { d: "Vendredi", h: "08h00 – 17h00" },
      { d: "Samedi", h: "Urgences 24/7" },
      { d: "Dimanche", h: "Urgences 24/7" },
    ],
    en: [
      { d: "Monday", h: "8:00am – 5:00pm" },
      { d: "Tuesday", h: "8:00am – 5:00pm" },
      { d: "Wednesday", h: "8:00am – 5:00pm" },
      { d: "Thursday", h: "8:00am – 5:00pm" },
      { d: "Friday", h: "8:00am – 5:00pm" },
      { d: "Saturday", h: "24/7 emergency" },
      { d: "Sunday", h: "24/7 emergency" },
    ],
  },
} as const;

// Bandeau défilant — vocabulaire plomberie, pur effet d'immersion (anglais
// conservé dans les deux langues, comme le vocabulaire métier des autres démos).
export const MARQUEE = [
  "Water heaters", "Leak repair", "Drain cleaning", "Sewer lines", "Gas leak detection",
  "Slab leaks", "Faucets", "Toilets", "24/7 emergency", "Licensed & bonded", "Since 2014",
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
  heroKicker: "Plombier · Gun Barrel City · Cedar Creek Lake, Texas",
  heroTitle: "Quand la plomberie lâche, Texas Plumbing Pros est déjà en route.",
  heroLead:
    "Entreprise familiale au bord du Cedar Creek Lake depuis 2014. Chauffe-eau, fuites, débouchage, canalisations, gaz : du dépannage 24/7 au gros chantier, un travail propre, honnête et garanti. « Experience you want, service you deserve, quality you expect. »",
  heroPrimary: "Demander un devis",
  heroSecondary: "Voir les prestations",
  ratingMeta: "463 avis Google",
  openBadge: "Urgences 24/7",
  openHoursShort: "Dépannage à toute heure",
  storyKicker: "L'entreprise",
  storyTitle: "Votre plombier du Cedar Creek Lake.",
  storyBody: [
    "Depuis 2014, Texas Plumbing Pros dépanne les foyers et les commerces de Gun Barrel City et de tout le secteur de Cedar Creek Lake — Mabank, Athens, Kaufman, Canton, Corsicana et au-delà. Une entreprise familiale, licenciée par le Texas State Board of Plumbing Examiners (RMP #41426), assurée et cautionnée.",
    "On vous explique le problème, on chiffre avant d'intervenir, et on fait le travail dans les règles — du remplacement de chauffe-eau à la fuite sous dalle. Devis honnête, finition soignée, et une seule obsession : 100 % de clients satisfaits.",
  ],
  stats: [
    { n: "4,9/5", l: "sur 463 avis Google" },
    { n: "Depuis 2014", l: "entreprise familiale · RMP #41426" },
    { n: "24/7", l: "service d'urgence, 7j/7" },
  ],
  servicesKicker: "Les prestations",
  servicesTitle: "Ce pour quoi on nous appelle.",
  servicesLead:
    "Résidentiel et commercial, du dépannage express au remplacement complet. Diagnostic clair, devis avant travaux — toujours gratuit.",
  featured: [
    { name: "Chauffe-eau — réparation & pose", desc: "Plus d'eau chaude ? Diagnostic, réparation ou remplacement d'un chauffe-eau neuf, posé dans les règles.", price: "Devis gratuit", img: `${IMG}/photo_08.webp`, tag: "Le plus demandé" },
    { name: "Fuites & dégâts des eaux", desc: "Détection et réparation de fuites — robinetterie, sous dalle, fondation — avant que les dégâts ne s'aggravent.", price: "Devis gratuit", img: `${IMG}/photo_01.webp`, tag: "Urgence" },
    { name: "Débouchage & canalisations", desc: "Évier, WC, égout bouché : débouchage, curage et caméra d'inspection pour repartir sur du propre.", price: "Devis gratuit", img: `${IMG}/photo_00.webp`, tag: "Jour même" },
  ],
  menuKicker: "Les services",
  menuTitle: "Résidentiel & commercial, de A à Z.",
  menuLead:
    "Tout ce qu'un plombier licencié doit savoir faire — réuni sous un même toit. Chaque intervention est chiffrée avant le départ.",
  menuPriceNote: "Devis gratuit",
  priceColumns: [
    {
      title: "Dépannage & réparation", icon: "🔧", items: [
        { name: "Réparation de chauffe-eau", price: "Jour même" },
        { name: "Détection & réparation de fuite", price: "24/7" },
        { name: "Débouchage / curage d'égout", price: "Jour même" },
        { name: "WC, robinets & sanitaires", price: "Devis gratuit" },
        { name: "Détection de fuite de gaz", price: "24/7" },
      ],
    },
    {
      title: "Installation & gros œuvre", icon: "🚿", items: [
        { name: "Remplacement de chauffe-eau", price: "Garanti" },
        { name: "Réparation sous dalle / fondation", price: "Sur devis" },
        { name: "Réparation de canalisation d'égout", price: "Sur devis" },
        { name: "Plomberie résidentielle complète", price: "Sur devis" },
        { name: "Plomberie commerciale", price: "Sur devis" },
      ],
    },
  ],
  menuBoardCaption: "L'un de nos techniciens, prêt à intervenir.",
  craftKicker: "Le savoir-faire",
  craftTitle: "Des pros licenciés, un travail fait dans les règles.",
  craftBody: [
    "« Sewer bouché : ils sont venus le jour même et ont trouvé le problème vite. Gentils, clairs et honnêtes — je les rappellerai sans hésiter. » C'est ce que disent les clients de Texas Plumbing Pros.",
    "Diagnostic posé, devis avant travaux, finition propre et garantie : nos techniciens prennent le temps de bien faire — même un dimanche, en astreinte. Licenciés, assurés et cautionnés.",
  ],
  craftRole: "Plombiers licenciés · RMP #41426",
  craftCaption: "Curage haute pression d'une canalisation, sur le terrain.",
  galleryKicker: "Sur le terrain",
  galleryTitle: "Du chantier, pas des photos d'agence.",
  galleryLead:
    "Quelques interventions réelles autour de Cedar Creek Lake. Du chauffe-eau à la fuite sous dalle.",
  galleryCaptions: [
    "Chauffe-eau électrique remplacé et raccordé proprement.",
    "Réparation d'une fuite sous dalle, cloison ouverte.",
    "Intervention sur WC et reprise après dégât des eaux.",
  ],
  reviewsKicker: "Ils en parlent",
  reviewsTitle: "Ce que disent les clients.",
  reviewsLead: "Des avis Google authentiques, récoltés intervention après intervention.",
  reviews: [
    { text: "J'ai d'abord appelé pour un égout bouché. Ils étaient là le jour même et ont trouvé le problème vite. Ils ont dû remplacer toutes mes canalisations en fonte, mais si c'était à refaire, je les rappellerais. Gentils, clairs et honnêtes — ils ont rendu une situation difficile aussi fluide que possible.", author: "Justin Ross", meta: "Avis Google · 5★", rating: 5 },
    { text: "Jason Bell est une mine de connaissances et il a été très minutieux. Mon mari et moi avons de l'expérience avec les égouts, et ça faisait du bien de voir quelqu'un d'honnête. Excellent service un dimanche, en astreinte. C'est ma deuxième expérience avec Texas Plumbing Pros et je les recommande sans hésiter.", author: "Michelle", meta: "Avis Google · 5★", rating: 5 },
  ],
  infoKicker: "Infos pratiques",
  infoTitle: "Nous joindre.",
  addressLabel: "Adresse",
  hoursLabel: "Horaires",
  phoneLabel: "Téléphone",
  mapsCta: "Itinéraire Google Maps",
  closingTitle: "Une fuite, un chauffe-eau, une urgence ?",
  closingLead:
    "Demandez votre devis gratuit en ligne, ou appelez-nous directement : ligne d'urgence ouverte 24h/24, 7j/7.",
  closingPrimary: "Demander un devis",
  closingSecondary: "Appeler maintenant",
  navServices: "Prestations",
  navCard: "Services",
  navCraft: "Savoir-faire",
  navGallery: "Réalisations",
  navReviews: "Avis",
  navInfo: "Infos",
};

const EN: Content = {
  heroKicker: "Plumber · Gun Barrel City · Cedar Creek Lake, Texas",
  heroTitle: "When the plumbing fails, Texas Plumbing Pros is already on the way.",
  heroLead:
    "A family-owned shop on Cedar Creek Lake since 2014. Water heaters, leaks, drains, sewer lines, gas: from 24/7 emergency calls to full installs — clean, honest, guaranteed work. \"Experience you want, service you deserve, quality you expect.\"",
  heroPrimary: "Request a quote",
  heroSecondary: "See the services",
  ratingMeta: "463 Google reviews",
  openBadge: "24/7 emergency",
  openHoursShort: "Round-the-clock service",
  storyKicker: "The company",
  storyTitle: "Your Cedar Creek Lake plumbing company.",
  storyBody: [
    "Since 2014, Texas Plumbing Pros has kept homes and businesses running across Gun Barrel City and all of Cedar Creek Lake — Mabank, Athens, Kaufman, Canton, Corsicana and beyond. Family-owned, licensed by the Texas State Board of Plumbing Examiners (RMP #41426), insured and bonded.",
    "We explain the problem, we quote before we work, and we do it right — from a water-heater swap to a slab leak. An honest estimate, clean finish, and one obsession: 100% customer satisfaction.",
  ],
  stats: [
    { n: "4.9/5", l: "across 463 Google reviews" },
    { n: "Since 2014", l: "family-owned · RMP #41426" },
    { n: "24/7", l: "emergency service, every day" },
  ],
  servicesKicker: "The services",
  servicesTitle: "What people call us for.",
  servicesLead:
    "Residential and commercial, from a fast fix to a full replacement. Clear diagnosis, a quote before the work — always free.",
  featured: [
    { name: "Water heater — repair & install", desc: "No hot water? Diagnosis, repair, or a brand-new heater installed and hooked up the right way.", price: "Free estimate", img: `${IMG}/photo_08.webp`, tag: "Most requested" },
    { name: "Leaks & water damage", desc: "Leak detection and repair — fixtures, slab, foundation — before the damage gets worse.", price: "Free estimate", img: `${IMG}/photo_01.webp`, tag: "Emergency" },
    { name: "Drain & sewer cleanout", desc: "Sink, toilet, backed-up sewer: clearing, jetting and camera inspection to start fresh.", price: "Free estimate", img: `${IMG}/photo_00.webp`, tag: "Same day" },
  ],
  menuKicker: "The services",
  menuTitle: "Residential & commercial, A to Z.",
  menuLead:
    "Everything a licensed plumber should handle — under one roof. Every job is quoted before we roll out.",
  menuPriceNote: "Free estimates",
  priceColumns: [
    {
      title: "Repair & service", icon: "🔧", items: [
        { name: "Water heater repair", price: "Same day" },
        { name: "Leak detection & repair", price: "24/7" },
        { name: "Drain / sewer cleanout", price: "Same day" },
        { name: "Toilets, faucets & fixtures", price: "Free quote" },
        { name: "Gas leak detection", price: "24/7" },
      ],
    },
    {
      title: "Install & big jobs", icon: "🚿", items: [
        { name: "Water heater replacement", price: "Warrantied" },
        { name: "Slab / foundation leak repair", price: "On quote" },
        { name: "Sewer line repair", price: "On quote" },
        { name: "Full residential plumbing", price: "On quote" },
        { name: "Commercial plumbing", price: "On quote" },
      ],
    },
  ],
  menuBoardCaption: "One of our technicians, ready to roll.",
  craftKicker: "The craft",
  craftTitle: "Licensed pros, work done the right way.",
  craftBody: [
    "\"Backed-up sewer line — they were out same day and found the problem fast. Kind, informative and fair. I'd call them again in a heartbeat.\" That's what Texas Plumbing Pros' customers say.",
    "Careful diagnosis, a quote before the work, a clean finish and a guarantee: our techs take the time to do it right — even on a Sunday, on call. Licensed, insured and bonded.",
  ],
  craftRole: "Licensed plumbers · RMP #41426",
  craftCaption: "High-pressure jetting on a sewer line, out in the field.",
  galleryKicker: "On the job",
  galleryTitle: "Real jobs, not stock photos.",
  galleryLead:
    "A few real calls around Cedar Creek Lake. From water heaters to slab leaks.",
  galleryCaptions: [
    "Electric water heater swapped out and cleanly reconnected.",
    "Slab leak repair, wall opened up to reach the line.",
    "Toilet work and cleanup after water damage.",
  ],
  reviewsKicker: "Word of mouth",
  reviewsTitle: "What customers say.",
  reviewsLead: "Genuine Google reviews, gathered job after job.",
  reviews: [
    { text: "I initially called because we had a backed-up sewer line. These guys were out, same day, and found the problem fast. They had to replace all my cast iron pipes, but if I had to do it over again, I'd go with these guys again. They were kind, informative, and fair — they made a very difficult situation as smooth as they could.", author: "Justin Ross", meta: "Google review · 5★", rating: 5 },
    { text: "Jason Bell was a wealth of knowledge and very thorough. My husband and I have experience with sewer work, and it was refreshing to know he was honest. Great customer service on a Sunday while on call. This is my second experience with Texas Plumbing Pros and I'd definitely recommend them.", author: "Michelle", meta: "Google review · 5★", rating: 5 },
  ],
  infoKicker: "Practical info",
  infoTitle: "Get in touch.",
  addressLabel: "Address",
  hoursLabel: "Hours",
  phoneLabel: "Phone",
  mapsCta: "Directions on Google Maps",
  closingTitle: "A leak, a water heater, an emergency?",
  closingLead:
    "Request your free quote online, or call us directly: emergency line open 24/7, every day of the year.",
  closingPrimary: "Request a quote",
  closingSecondary: "Call now",
  navServices: "Services",
  navCard: "What we do",
  navCraft: "The craft",
  navGallery: "Our work",
  navReviews: "Reviews",
  navInfo: "Info",
};

export function getTexasPlumbingContent(lang: Lang): Content {
  return lang === "en" ? EN : FR;
}
