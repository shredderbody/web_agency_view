import type { Lang } from "./i18n";

/* ════════════════════════════════════════════════════════════════════════════
   Thaï Vien Express — données client (démo)
   Contenu structuré bilingue à partir des données réelles Google Places
   (place_id ChIJX93BDLdl5kcRi4GQqMHtXaY, récupérées le 2026-06-11).
   Photos : public/clients/thai-viens-express/photo_00..09.jpg
   ════════════════════════════════════════════════════════════════════════════ */

export const IMG = "/clients/thai-viens-express";

export type Dish = {
  name: string;
  thai?: string;
  desc: string;
  price: string;
  img: string;
  tag?: string;
};

export type MenuColumn = { title: string; icon: string; items: string[] };
export type Review = { text: string; author: string; meta: string; rating: number };

export const FACTS = {
  name: "Thaï Vien Express",
  trade: { fr: "Restaurant thaïlandais", en: "Thai restaurant" },
  city: "Courbevoie",
  address: "17 rue de l'Abreuvoir, 92400 Courbevoie",
  phone: "09 86 71 32 70",
  rating: "4,7",
  ratingEn: "4.7",
  reviewCount: 424,
  lat: 48.8918163,
  lon: 2.253947,
  mapsUri: "https://www.google.com/maps/dir/?api=1&destination=48.8918163,2.253947&destination_place_id=ChIJX93BDLdl5kcRi4GQqMHtXaY",
  placeId: "ChIJX93BDLdl5kcRi4GQqMHtXaY",
  hours: {
    fr: [
      { d: "Lundi", h: "11h30 – 15h · 18h – 22h" },
      { d: "Mardi", h: "11h30 – 15h · 18h – 22h" },
      { d: "Mercredi", h: "11h30 – 15h · 18h – 22h" },
      { d: "Jeudi", h: "11h30 – 15h · 18h – 22h" },
      { d: "Vendredi", h: "11h30 – 15h · 18h – 22h" },
      { d: "Samedi", h: "Fermé" },
      { d: "Dimanche", h: "Fermé" },
    ],
    en: [
      { d: "Monday", h: "11:30am – 3pm · 6pm – 10pm" },
      { d: "Tuesday", h: "11:30am – 3pm · 6pm – 10pm" },
      { d: "Wednesday", h: "11:30am – 3pm · 6pm – 10pm" },
      { d: "Thursday", h: "11:30am – 3pm · 6pm – 10pm" },
      { d: "Friday", h: "11:30am – 3pm · 6pm – 10pm" },
      { d: "Saturday", h: "Closed" },
      { d: "Sunday", h: "Closed" },
    ],
  },
} as const;

// Bandeau défilant — noms de plats thaï, pur effet d'immersion.
export const MARQUEE = [
  "Pad Thaï", "Pad Kapao", "Massaman", "Khao Pad", "Bo Bun",
  "Kang Dang", "Lok Lak", "Satay", "Khung Kratiem", "Nems maison",
];

export type Content = {
  tagline: string;
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
  dishesKicker: string;
  dishesTitle: string;
  dishesLead: string;
  dishes: Dish[];
  menuKicker: string;
  menuTitle: string;
  menuLead: string;
  menuPriceNote: string;
  menuColumns: MenuColumn[];
  extrasTitle: string;
  extras: string[];
  dessertsTitle: string;
  desserts: string[];
  drinksTitle: string;
  drinks: string[];
  menuBoardCaption: string;
  ambianceKicker: string;
  ambianceTitle: string;
  ambianceLead: string;
  ambianceCaptions: string[];
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
  navCard: string;
  navDishes: string;
  navAmbiance: string;
  navReviews: string;
  navInfo: string;
};

const FR: Content = {
  tagline: "La cuisine thaïlandaise authentique, à deux pas de la Défense.",
  heroKicker: "Cuisine thaïlandaise authentique · Courbevoie",
  heroTitle: "Le vrai goût de la Thaïlande, au cœur de Courbevoie.",
  heroLead:
    "Wok brûlant, basilic sacré, lait de coco et cacahuètes torréfiées. Chaque plat est préparé minute, comme à Bangkok. Sur place ou à emporter, midi et soir.",
  heroPrimary: "Réserver une table",
  heroSecondary: "Voir la carte",
  ratingMeta: "424 avis Google",
  openBadge: "Service du midi & du soir",
  openHoursShort: "Lun – Ven · 11h30–15h · 18h–22h",
  storyKicker: "La maison",
  storyTitle: "Un comptoir thaï qui sent bon le wok et la citronnelle.",
  storyBody: [
    "Caché derrière son imposant voisin de la rue de l'Abreuvoir, Thaï Vien Express est l'un de ces petits trésors de quartier qu'on garde précieusement pour soi.",
    "Ici, pas de chichi : des recettes thaïlandaises franches, des produits frais sautés à la commande, et un patron au sourire devenu une institution. On vient pour le Pad Kapao, on revient pour l'accueil.",
  ],
  stats: [
    { n: "4,7/5", l: "sur 424 avis Google" },
    { n: "10,50 €", l: "le plat, protéine au choix" },
    { n: "Midi & soir", l: "du lundi au vendredi" },
  ],
  dishesKicker: "Les spécialités",
  dishesTitle: "Les plats qui font la réputation de la maison.",
  dishesLead:
    "Sautés au wok, currys crémeux et bols généreux. Tout est préparé minute, à la chaleur du feu vif.",
  dishes: [
    { name: "Pad Kapao", thai: "ผัดกะเพรา", desc: "Le sauté signature au basilic thaï, ail et piment, poêlé au wok et servi avec un riz parfumé.", price: "10,50 €", img: `${IMG}/photo_05.webp`, tag: "Le plus commandé" },
    { name: "Massaman", thai: "มัสมั่น", desc: "Curry doux et crémeux au lait de coco et cacahuètes torréfiées, mijoté longuement.", price: "10,50 €", img: `${IMG}/photo_07.webp`, tag: "Curry maison" },
    { name: "Khao Pad Crevettes", thai: "ข้าวผัด", desc: "Riz sauté au wok, crevettes croustillantes, ciboule et ail. Le classique réconfortant.", price: "10,50 €", img: `${IMG}/photo_01.webp` },
    { name: "Khao Pad Bœuf", thai: "ข้าวผัดเนื้อ", desc: "Riz sauté à l'œuf et au bœuf, légumes croquants et concombre frais.", price: "10,50 €", img: `${IMG}/photo_02.webp` },
    { name: "Bo Bun Bœuf", thai: "บุ๋นบ่อ", desc: "Vermicelles de riz frais, bœuf mariné, cacahuètes concassées et herbes fraîches.", price: "10,50 €", img: `${IMG}/photo_04.webp` },
    { name: "Nems & Poulet Crispy", thai: "ไก่กรอบ", desc: "Nems dorés et poulet croustillant, riz parfumé, crudités et sauce maison.", price: "10,50 €", img: `${IMG}/photo_03.webp` },
  ],
  menuKicker: "La carte",
  menuTitle: "Un plat, une protéine, 10,50 €.",
  menuLead:
    "Choisissez votre préparation, puis votre protéine. Simple, généreux, toujours à prix juste.",
  menuPriceNote: "Tous les plats à 10,50 €",
  menuColumns: [
    { title: "Poulet", icon: "🐓", items: ["Pad thaï", "Khao pad", "Pad kapao", "Lok lak", "Kang dang", "Bo bun", "Massaman", "Satay"] },
    { title: "Bœuf", icon: "🐄", items: ["Pad thaï", "Khao pad", "Pad kapao", "Lok lak", "Kang dang", "Bo bun", "Massaman", "Satay"] },
    { title: "Crevettes", icon: "🦐", items: ["Pad thaï", "Khao pad", "Kang dang", "Khung kratiem"] },
    { title: "Végétarien", icon: "🌱", items: ["Pad thaï", "Khao pad", "Kang dang", "Bo bun"] },
  ],
  extrasTitle: "Suppléments",
  extras: ["Œuf au plat · 1,00 €", "Supplément XL · 2,50 €", "Riz blanc · 2,50 €", "Riz rouge · 4,50 €"],
  dessertsTitle: "Desserts",
  desserts: ["Perles de coco", "Litchis au sirop", "Nougats", "Salade de fruits"],
  drinksTitle: "Boissons",
  drinks: ["Coca-Cola / Zéro", "Ice tea", "Sprite", "Orangina", "Oasis", "Évian", "San Pellegrino"],
  menuBoardCaption: "L'ardoise de la maison, telle qu'elle est affichée au comptoir.",
  ambianceKicker: "L'ambiance",
  ambianceTitle: "Bois clair, suspensions en rotin et lumière chaude.",
  ambianceLead:
    "Une petite salle accueillante où l'on s'attable comme chez soi, bercé par les effluves du wok. Idéal pour une pause déjeuner ou un dîner sans prise de tête.",
  ambianceCaptions: [
    "La salle et ses banquettes en cuir, sous les suspensions en rotin.",
    "L'enseigne Thaï Vien et ses chaises en rotin tressé.",
    "Les bouchées vapeur, tout juste sorties du panier.",
  ],
  reviewsKicker: "Ils en parlent",
  reviewsTitle: "Ce que disent les habitués.",
  reviewsLead: "Des avis Google authentiques, récoltés au fil des services.",
  reviews: [
    { text: "Depuis mon voyage en Thaïlande, je n'avais pas retrouvé une cuisine aussi authentique. De loin le meilleur thaï que j'ai testé : tout est délicieux et plein de saveurs.", author: "Farah Ragot", meta: "Avis Google · il y a 11 mois", rating: 5 },
    { text: "Super expérience ! Le repas était vraiment très bon, et le service adorable, souriant et attentionné du début à la fin. Je recommande sans hésiter pour la qualité comme pour l'ambiance chaleureuse.", author: "Phearun Pae", meta: "Avis Google · il y a 2 mois", rating: 5 },
    { text: "Très bonne surprise ! J'ai découvert le Pad Kapao et je me suis régalé. L'accueil est très chaleureux. Vivement mon prochain passage dans le quartier !", author: "Rémy Costa", meta: "Avis Google · il y a 4 mois", rating: 5 },
    { text: "Très bon choix pour le déjeuner, le goût authentique thaïlandais avec des plats variés et un prix raisonnable. Une semaine plus tard, je suis revenue prendre le même plat 😋", author: "YR H.", meta: "Avis Google · il y a 9 mois", rating: 5 },
  ],
  infoKicker: "Infos pratiques",
  infoTitle: "Venir nous voir.",
  addressLabel: "Adresse",
  hoursLabel: "Horaires",
  phoneLabel: "Téléphone",
  mapsCta: "Itinéraire Google Maps",
  closingTitle: "Une faim de Thaïlande ?",
  closingLead:
    "Passez commander au comptoir, appelez-nous, ou réservez votre table pour ce midi. Le wok est déjà chaud.",
  closingPrimary: "Réserver une table",
  closingSecondary: "Appeler le restaurant",
  navCard: "La carte",
  navDishes: "Spécialités",
  navAmbiance: "Ambiance",
  navReviews: "Avis",
  navInfo: "Infos",
};

const EN: Content = {
  tagline: "Authentic Thai cooking, a stone's throw from La Défense.",
  heroKicker: "Authentic Thai cooking · Courbevoie",
  heroTitle: "The real taste of Thailand, in the heart of Courbevoie.",
  heroLead:
    "Roaring wok, holy basil, coconut milk and roasted peanuts. Every dish is cooked to order, just like in Bangkok. Eat in or take away, lunch and dinner.",
  heroPrimary: "Book a table",
  heroSecondary: "See the menu",
  ratingMeta: "424 Google reviews",
  openBadge: "Lunch & dinner service",
  openHoursShort: "Mon – Fri · 11:30–3 · 6–10pm",
  storyKicker: "The place",
  storyTitle: "A Thai counter that smells of wok and lemongrass.",
  storyBody: [
    "Tucked behind its towering neighbour on rue de l'Abreuvoir, Thaï Vien Express is one of those little neighbourhood gems you'd rather keep to yourself.",
    "No fuss here: honest Thai recipes, fresh produce stir-fried to order, and an owner whose smile has become an institution. You come for the Pad Kapao, you return for the welcome.",
  ],
  stats: [
    { n: "4.7/5", l: "across 424 Google reviews" },
    { n: "€10.50", l: "per dish, protein of choice" },
    { n: "Lunch & dinner", l: "Monday to Friday" },
  ],
  dishesKicker: "The specialities",
  dishesTitle: "The dishes that built the house's name.",
  dishesLead:
    "Wok stir-fries, creamy curries and generous bowls. Everything is cooked to order over a live flame.",
  dishes: [
    { name: "Pad Kapao", thai: "ผัดกะเพรา", desc: "The signature stir-fry with Thai basil, garlic and chilli, tossed in the wok and served with fragrant rice.", price: "€10.50", img: `${IMG}/photo_05.webp`, tag: "Most ordered" },
    { name: "Massaman", thai: "มัสมั่น", desc: "A mild, creamy curry of coconut milk and roasted peanuts, slowly simmered.", price: "€10.50", img: `${IMG}/photo_07.webp`, tag: "House curry" },
    { name: "Prawn Khao Pad", thai: "ข้าวผัด", desc: "Wok-fried rice with crispy prawns, spring onion and garlic. The comforting classic.", price: "€10.50", img: `${IMG}/photo_01.webp` },
    { name: "Beef Khao Pad", thai: "ข้าวผัดเนื้อ", desc: "Egg-and-beef fried rice with crunchy vegetables and fresh cucumber.", price: "€10.50", img: `${IMG}/photo_02.webp` },
    { name: "Beef Bo Bun", thai: "บุ๋นบ่อ", desc: "Fresh rice vermicelli, marinated beef, crushed peanuts and fresh herbs.", price: "€10.50", img: `${IMG}/photo_04.webp` },
    { name: "Spring rolls & Crispy chicken", thai: "ไก่กรอบ", desc: "Golden spring rolls and crispy chicken, fragrant rice, crudités and house sauce.", price: "€10.50", img: `${IMG}/photo_03.webp` },
  ],
  menuKicker: "The menu",
  menuTitle: "One dish, one protein, €10.50.",
  menuLead: "Pick your preparation, then your protein. Simple, generous, always fairly priced.",
  menuPriceNote: "All dishes €10.50",
  menuColumns: [
    { title: "Chicken", icon: "🐓", items: ["Pad thai", "Khao pad", "Pad kapao", "Lok lak", "Kang dang", "Bo bun", "Massaman", "Satay"] },
    { title: "Beef", icon: "🐄", items: ["Pad thai", "Khao pad", "Pad kapao", "Lok lak", "Kang dang", "Bo bun", "Massaman", "Satay"] },
    { title: "Prawns", icon: "🦐", items: ["Pad thai", "Khao pad", "Kang dang", "Khung kratiem"] },
    { title: "Vegetarian", icon: "🌱", items: ["Pad thai", "Khao pad", "Kang dang", "Bo bun"] },
  ],
  extrasTitle: "Extras",
  extras: ["Fried egg · €1.00", "XL upgrade · €2.50", "White rice · €2.50", "Red rice · €4.50"],
  dessertsTitle: "Desserts",
  desserts: ["Coconut pearls", "Lychees in syrup", "Nougats", "Fruit salad"],
  drinksTitle: "Drinks",
  drinks: ["Coca-Cola / Zero", "Ice tea", "Sprite", "Orangina", "Oasis", "Évian", "San Pellegrino"],
  menuBoardCaption: "The house board, exactly as it hangs above the counter.",
  ambianceKicker: "The atmosphere",
  ambianceTitle: "Light wood, rattan pendants and warm light.",
  ambianceLead:
    "A small, welcoming room where you sit down like at home, carried by the scent of the wok. Perfect for a lunch break or a fuss-free dinner.",
  ambianceCaptions: [
    "The room and its leather banquettes, under rattan pendant lights.",
    "The Thaï Vien sign and its woven rattan chairs.",
    "Steamed dumplings, fresh out of the basket.",
  ],
  reviewsKicker: "Word of mouth",
  reviewsTitle: "What the regulars say.",
  reviewsLead: "Genuine Google reviews, gathered service after service.",
  reviews: [
    { text: "Since my trip to Thailand, I hadn't found cooking this authentic. By far the best Thai I've tried: everything is delicious and full of flavour.", author: "Farah Ragot", meta: "Google review · 11 months ago", rating: 5 },
    { text: "Great experience! The meal was really good, and the service lovely, smiling and attentive from start to finish. I recommend it without hesitation, for the quality and the warm atmosphere.", author: "Phearun Pae", meta: "Google review · 2 months ago", rating: 5 },
    { text: "Lovely surprise! I discovered the Pad Kapao and loved it. The welcome is so warm. Can't wait for my next time in the area!", author: "Rémy Costa", meta: "Google review · 4 months ago", rating: 5 },
    { text: "Great choice for lunch, authentic Thai taste with varied dishes at a reasonable price. A week later, I came back for the same dish 😋", author: "YR H.", meta: "Google review · 9 months ago", rating: 5 },
  ],
  infoKicker: "Practical info",
  infoTitle: "Come and see us.",
  addressLabel: "Address",
  hoursLabel: "Opening hours",
  phoneLabel: "Phone",
  mapsCta: "Directions on Google Maps",
  closingTitle: "Craving Thailand?",
  closingLead:
    "Order at the counter, give us a call, or book your table for lunch. The wok is already hot.",
  closingPrimary: "Book a table",
  closingSecondary: "Call the restaurant",
  navCard: "Menu",
  navDishes: "Specialities",
  navAmbiance: "Atmosphere",
  navReviews: "Reviews",
  navInfo: "Info",
};

export function getThaiContent(lang: Lang): Content {
  return lang === "en" ? EN : FR;
}
