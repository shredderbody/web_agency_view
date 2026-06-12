import type { Lang } from "./i18n";

/* ════════════════════════════════════════════════════════════════════════════
   Barbershop — Courbevoie — données client (démo)
   Contenu structuré bilingue à partir des données réelles Google Places
   (place_id ChIJUT3KGwBl5kcRGN69jLgL8NU, récupérées le 2026-06-12) et de la
   carte des prix affichée en vitrine du salon (photo_04).
   Photos : public/clients/barbershop-courbevoie/photo_00..09.webp
   ════════════════════════════════════════════════════════════════════════════ */

export const IMG = "/clients/barbershop-courbevoie";

export type Service = { name: string; desc: string; price: string; img?: string; tag?: string };
export type PriceItem = { name: string; price: string };
export type PriceColumn = { title: string; icon: string; items: PriceItem[] };
export type Review = { text: string; author: string; meta: string; rating: number };

export const FACTS = {
  name: "Barbershop",
  fullName: "Barbershop · Courbevoie",
  trade: { fr: "Barbier · Coiffeur homme", en: "Barbershop · Men's grooming" },
  barber: "Montassar",
  city: "Courbevoie",
  address: "34 Av. Marceau, 92400 Courbevoie",
  phone: "06 87 12 72 22",
  rating: "4,3",
  ratingEn: "4.3",
  reviewCount: 23,
  lat: 48.8995204,
  lon: 2.2460633,
  placeId: "ChIJUT3KGwBl5kcRGN69jLgL8NU",
  mapsUri:
    "https://www.google.com/maps/dir/?api=1&destination=48.8995204,2.2460633&destination_place_id=ChIJUT3KGwBl5kcRGN69jLgL8NU",
  hours: {
    fr: [
      { d: "Lundi", h: "10h – 20h" },
      { d: "Mardi", h: "10h – 20h" },
      { d: "Mercredi", h: "10h – 20h" },
      { d: "Jeudi", h: "10h – 20h" },
      { d: "Vendredi", h: "10h – 20h" },
      { d: "Samedi", h: "10h – 20h" },
      { d: "Dimanche", h: "10h – 20h" },
    ],
    en: [
      { d: "Monday", h: "10am – 8pm" },
      { d: "Tuesday", h: "10am – 8pm" },
      { d: "Wednesday", h: "10am – 8pm" },
      { d: "Thursday", h: "10am – 8pm" },
      { d: "Friday", h: "10am – 8pm" },
      { d: "Saturday", h: "10am – 8pm" },
      { d: "Sunday", h: "10am – 8pm" },
    ],
  },
} as const;

// Bandeau défilant — vocabulaire barbier, pur effet d'immersion.
export const MARQUEE = [
  "Coupe", "Dégradé", "Barbe", "Rasage", "Contours", "Serviette chaude",
  "Soin du visage", "Black mask", "Henné", "Sans rendez-vous", "7j/7",
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
  barberKicker: string;
  barberTitle: string;
  barberBody: string[];
  barberRole: string;
  barberCaption: string;
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
  navBarber: string;
  navGallery: string;
  navReviews: string;
  navInfo: string;
};

const FR: Content = {
  heroKicker: "Barbier · Coiffeur homme · Courbevoie",
  heroTitle: "Coupe nette, barbe taillée, rasage à l'ancienne.",
  heroLead:
    "Un salon de quartier avenue Marceau, ouvert 7 jours sur 7. Dégradé au millimètre, contours au rasoir, serviette chaude — et on repart toujours plus net qu'à l'entrée. Avec ou sans rendez-vous.",
  heroPrimary: "Prendre rendez-vous",
  heroSecondary: "Voir les prestations",
  ratingMeta: "23 avis Google",
  openBadge: "Ouvert 7j/7",
  openHoursShort: "Tous les jours · 10h – 20h",
  storyKicker: "Le salon",
  storyTitle: "Le barbier du quartier, ouvert tous les jours.",
  storyBody: [
    "À deux pas du rond-point de Courbevoie, le Barbershop de l'avenue Marceau est de ces adresses où l'on entre pour une coupe et où l'on revient pour l'accueil. Bois sombre, miroirs en laiton et lumière chaude : on s'y sent bien.",
    "Ici, pas de minuterie : Montassar prend le temps de bien faire, du dégradé le plus net à la barbe sculptée à la serviette chaude. Patient avec les enfants, généreux d'un soin du visage offert — on en ressort détendu autant que rafraîchi.",
  ],
  stats: [
    { n: "4,3/5", l: "sur 23 avis Google" },
    { n: "7j/7", l: "tous les jours, 10h – 20h" },
    { n: "dès 5 €", l: "la barbe, contours compris" },
  ],
  servicesKicker: "Les prestations",
  servicesTitle: "Ce pour quoi on revient.",
  servicesLead:
    "Coupe, barbe et soins du visage, exécutés avec soin et finitions au rasoir. Tarifs relevés sur l'ardoise du salon.",
  featured: [
    { name: "Coupe tondeuse & ciseaux", desc: "Diagnostic, dégradé net et finition aux ciseaux, contours au rasoir.", price: "14 €", img: `${IMG}/photo_05.webp`, tag: "Le plus demandé" },
    { name: "Taille de barbe · vapeur", desc: "Contours dessinés au rasoir, serviette chaude et huile de finition.", price: "10 €", img: `${IMG}/photo_09.webp`, tag: "Serviette chaude" },
    { name: "Soin du visage", desc: "Gommage vapeur et black mask pour une peau nette et détendue.", price: "15 €", img: `${IMG}/photo_06.webp`, tag: "Détente" },
  ],
  menuKicker: "La carte",
  menuTitle: "Coiffure, barbe et soins.",
  menuLead:
    "Des prestations simples, à prix justes — exactement la carte affichée en vitrine du salon.",
  menuPriceNote: "Sans rendez-vous bienvenu",
  priceColumns: [
    {
      title: "Coiffure", icon: "✂️", items: [
        { name: "Coupe tondeuse & ciseaux", price: "14 €" },
        { name: "Coupe ciseaux", price: "15 €" },
        { name: "Rasage de crâne à la tondeuse", price: "10 €" },
        { name: "Défrisage", price: "10 €" },
      ],
    },
    {
      title: "Barbe & soins", icon: "🪒", items: [
        { name: "Barbe simple", price: "5 €" },
        { name: "Taille de barbe · contours", price: "7 €" },
        { name: "Taille de barbe · contours vapeur", price: "10 €" },
        { name: "Barbe au henné", price: "10 €" },
        { name: "Soin du visage · gommage vapeur & black mask", price: "15 €" },
      ],
    },
  ],
  menuBoardCaption: "La carte, telle qu'elle est affichée en vitrine du salon.",
  barberKicker: "Le barbier",
  barberTitle: "Montassar, la main sûre.",
  barberBody: [
    "« Une coupe impeccable, mais surtout de l'hospitalité, de la gentillesse et de la bienveillance » — c'est ce que disent les habitués de Montassar.",
    "Précision du geste, finitions soignées et une vraie attention à chaque client. Chez lui, on ne se contente pas d'une coupe : on vit un vrai moment de bien-être.",
  ],
  barberRole: "Maître barbier",
  barberCaption: "Montassar, au salon de l'avenue Marceau.",
  galleryKicker: "Le salon",
  galleryTitle: "Bois, laiton et lumière chaude.",
  galleryLead:
    "Quelques images du salon et des coupes du jour. On vient pour la coupe, on revient pour l'ambiance.",
  galleryCaptions: [
    "Coupe fraîche et sourire, à la sortie du fauteuil.",
    "L'ambiance du salon : bois, miroirs et lumière chaude.",
    "L'enseigne du salon, avenue Marceau.",
  ],
  reviewsKicker: "Ils en parlent",
  reviewsTitle: "Ce que disent les clients.",
  reviewsLead: "Des avis Google authentiques, récoltés au fil des coupes.",
  reviews: [
    { text: "Un immense merci à Montassar pour son travail d'exception, et surtout pour son hospitalité et sa bienveillance. On ne se contente pas d'une coupe impeccable, on vit une véritable expérience de bien-être. Cerise sur le gâteau : un soin du visage offert.", author: "Abdesslem Chebil", meta: "Avis Google · il y a 1 an", rating: 5 },
    { text: "Coupe parfaite, salon propre et coiffeur agréable, je recommande !", author: "Mohamed", meta: "Avis Google · il y a 7 mois", rating: 5 },
    { text: "Bon accueil, ce qui n'est pas toujours le cas dans les barbershops. Coiffeur sympa et attentif ; résultat : bonne coupe et belles finitions.", author: "Denis Bonneau", meta: "Avis Google · il y a 7 mois", rating: 5 },
    { text: "J'ai amené mes enfants se faire couper les cheveux. Merci au coiffeur pour sa patience, leurs coupes étaient parfaites. Le salon est très propre, on reviendra bientôt.", author: "Sandes Beltaief", meta: "Avis Google · il y a 1 an", rating: 5 },
  ],
  infoKicker: "Infos pratiques",
  infoTitle: "Venir nous voir.",
  addressLabel: "Adresse",
  hoursLabel: "Horaires",
  phoneLabel: "Téléphone",
  mapsCta: "Itinéraire Google Maps",
  closingTitle: "Votre fauteuil vous attend.",
  closingLead:
    "Réservez en ligne en deux gestes, appelez-nous, ou passez directement : c'est ouvert tous les jours jusqu'à 20h.",
  closingPrimary: "Prendre rendez-vous",
  closingSecondary: "Appeler le salon",
  navServices: "Prestations",
  navCard: "La carte",
  navBarber: "Le barbier",
  navGallery: "Le salon",
  navReviews: "Avis",
  navInfo: "Infos",
};

const EN: Content = {
  heroKicker: "Barbershop · Men's grooming · Courbevoie",
  heroTitle: "Sharp cut, tidy beard, old-school shave.",
  heroLead:
    "A neighbourhood barbershop on Avenue Marceau, open seven days a week. Millimetre-perfect fades, razor contours, hot towel — you always leave sharper than you came in. With or without an appointment.",
  heroPrimary: "Book an appointment",
  heroSecondary: "See the services",
  ratingMeta: "23 Google reviews",
  openBadge: "Open 7 days",
  openHoursShort: "Every day · 10am – 8pm",
  storyKicker: "The shop",
  storyTitle: "The neighbourhood barber, open every day.",
  storyBody: [
    "A stone's throw from Courbevoie's roundabout, the Avenue Marceau barbershop is one of those spots you walk into for a cut and come back to for the welcome. Dark wood, brass mirrors and warm light: it just feels good.",
    "No timer here: Montassar takes the time to do it right, from the cleanest fade to a beard sculpted under a hot towel. Patient with kids, generous with a complimentary face treatment — you leave as relaxed as you are fresh.",
  ],
  stats: [
    { n: "4.3/5", l: "across 23 Google reviews" },
    { n: "7 days", l: "every day, 10am – 8pm" },
    { n: "from €5", l: "the beard, contours included" },
  ],
  servicesKicker: "The services",
  servicesTitle: "What people come back for.",
  servicesLead:
    "Cuts, beards and face treatments, done with care and finished with the razor. Prices taken from the shop's board.",
  featured: [
    { name: "Clipper & scissor cut", desc: "Consultation, clean fade and scissor finish, razor contours.", price: "€14", img: `${IMG}/photo_05.webp`, tag: "Most requested" },
    { name: "Beard trim · hot towel", desc: "Razor-drawn contours, hot towel and finishing oil.", price: "€10", img: `${IMG}/photo_09.webp`, tag: "Hot towel" },
    { name: "Face treatment", desc: "Steam scrub and black mask for clean, relaxed skin.", price: "€15", img: `${IMG}/photo_06.webp`, tag: "Unwind" },
  ],
  menuKicker: "The menu",
  menuTitle: "Hair, beard and treatments.",
  menuLead: "Simple services, fairly priced — exactly the board in the shop window.",
  menuPriceNote: "Walk-ins welcome",
  priceColumns: [
    {
      title: "Hair", icon: "✂️", items: [
        { name: "Clipper & scissor cut", price: "€14" },
        { name: "Scissor cut", price: "€15" },
        { name: "Head shave with clippers", price: "€10" },
        { name: "Hair straightening", price: "€10" },
      ],
    },
    {
      title: "Beard & care", icon: "🪒", items: [
        { name: "Simple beard", price: "€5" },
        { name: "Beard trim · contours", price: "€7" },
        { name: "Beard trim · contours, hot towel", price: "€10" },
        { name: "Henna beard", price: "€10" },
        { name: "Face treatment · steam scrub & black mask", price: "€15" },
      ],
    },
  ],
  menuBoardCaption: "The price board, exactly as it hangs in the shop window.",
  barberKicker: "The barber",
  barberTitle: "Montassar, the steady hand.",
  barberBody: [
    "\"An impeccable cut, but above all hospitality, kindness and care\" — that's what Montassar's regulars say.",
    "Precise work, careful finishing and genuine attention to every client. With him, it isn't just a cut: it's a real moment of well-being.",
  ],
  barberRole: "Master barber",
  barberCaption: "Montassar, at the Avenue Marceau shop.",
  galleryKicker: "The shop",
  galleryTitle: "Wood, brass and warm light.",
  galleryLead:
    "A few shots of the shop and the day's cuts. You come for the cut, you stay for the room.",
  galleryCaptions: [
    "Fresh cut and a smile, straight out of the chair.",
    "The room: wood, mirrors and warm light.",
    "The shop sign, on Avenue Marceau.",
  ],
  reviewsKicker: "Word of mouth",
  reviewsTitle: "What clients say.",
  reviewsLead: "Genuine Google reviews, gathered cut after cut.",
  reviews: [
    { text: "A huge thank you to Montassar for his exceptional work, and above all for his hospitality and care. It's not just an impeccable cut, it's a genuine well-being experience. The cherry on top: a complimentary face treatment.", author: "Abdesslem Chebil", meta: "Google review · 1 year ago", rating: 5 },
    { text: "Perfect cut, clean shop and a lovely barber. Highly recommend!", author: "Mohamed", meta: "Google review · 7 months ago", rating: 5 },
    { text: "Warm welcome, which isn't always the case in barbershops. Friendly, attentive barber; the result: a great cut and clean finishing.", author: "Denis Bonneau", meta: "Google review · 7 months ago", rating: 5 },
    { text: "I brought my kids in for a haircut. Thank you to the barber for his patience, their cuts were perfect. The shop is spotless, we'll be back soon.", author: "Sandes Beltaief", meta: "Google review · 1 year ago", rating: 5 },
  ],
  infoKicker: "Practical info",
  infoTitle: "Come and see us.",
  addressLabel: "Address",
  hoursLabel: "Opening hours",
  phoneLabel: "Phone",
  mapsCta: "Directions on Google Maps",
  closingTitle: "Your chair is waiting.",
  closingLead:
    "Book online in two taps, give us a call, or just drop by: open every day until 8pm.",
  closingPrimary: "Book an appointment",
  closingSecondary: "Call the shop",
  navServices: "Services",
  navCard: "Menu",
  navBarber: "The barber",
  navGallery: "The shop",
  navReviews: "Reviews",
  navInfo: "Info",
};

export function getBarberContent(lang: Lang): Content {
  return lang === "en" ? EN : FR;
}
