import type { Lang } from "./i18n";

/* ════════════════════════════════════════════════════════════════════════════
   Open House Café — Pererenan, Canggu (Bali, Indonésie) — données client (démo).
   Contenu structuré bilingue FR/EN bâti sur les données réelles Google Places
   (place_id ChIJRfVHDQA50i0R78l1hYjP2iM, récupérées le 2026-06-22) et le site
   officiel openhousecafebali.com : café tout-en-plein-air, ouvert tous les jours
   de 7h00 à 23h00, cuisine healthy « all-day » (bowls, brunch, burgers, bar).
   Quartier Pererenan, au cœur de la zone Canggu (Badung, Bali).
   Les prix sont en roupies indonésiennes (Rp), indicatifs façon café de Canggu.
   Photos : public/clients/openhouse-canggu/photo_00..09.webp
   ════════════════════════════════════════════════════════════════════════════ */

export const IMG = "/clients/openhouse-canggu";

export type Service = { name: string; desc: string; price: string; img?: string; tag?: string };
export type PriceItem = { name: string; price: string };
export type PriceColumn = { title: string; icon: string; items: PriceItem[] };
export type Review = { text: string; author: string; meta: string; rating: number };

export const FACTS = {
  name: "Open House",
  fullName: "Open House Café · Pererenan",
  trade: { fr: "Café en plein air · brunch & dîner", en: "Open-air café · all-day brunch & dinner" },
  city: "Pererenan, Canggu — Bali",
  address: "Jl. Munduk Tengah No.9, Pererenan, Kec. Mengwi, Badung, Bali 80351, Indonésie",
  phone: "+62 853-3800-7745",
  website: "https://www.openhousecafebali.com/",
  rating: "4,6",
  ratingEn: "4.6",
  reviewCount: 1053,
  lat: -8.6471466,
  lon: 115.1272155,
  placeId: "ChIJRfVHDQA50i0R78l1hYjP2iM",
  mapsUri:
    "https://www.google.com/maps/dir/?api=1&destination=-8.6471466,115.1272155&destination_place_id=ChIJRfVHDQA50i0R78l1hYjP2iM",
  hours: {
    fr: [
      { d: "Lundi", h: "07h00 – 23h00" },
      { d: "Mardi", h: "07h00 – 23h00" },
      { d: "Mercredi", h: "07h00 – 23h00" },
      { d: "Jeudi", h: "07h00 – 23h00" },
      { d: "Vendredi", h: "07h00 – 23h00" },
      { d: "Samedi", h: "07h00 – 23h00" },
      { d: "Dimanche", h: "07h00 – 23h00" },
    ],
    en: [
      { d: "Monday", h: "7:00am – 11:00pm" },
      { d: "Tuesday", h: "7:00am – 11:00pm" },
      { d: "Wednesday", h: "7:00am – 11:00pm" },
      { d: "Thursday", h: "7:00am – 11:00pm" },
      { d: "Friday", h: "7:00am – 11:00pm" },
      { d: "Saturday", h: "7:00am – 11:00pm" },
      { d: "Sunday", h: "7:00am – 11:00pm" },
    ],
  },
} as const;

// Bandeau défilant — vocabulaire café/Bali, pur effet d'immersion.
export const MARQUEE = [
  "All-day brunch", "Healthy bowls", "Smoothies", "Fresh coffee", "Open-air",
  "Cocktails", "Breakfast burritos", "Tacos", "Pererenan", "Canggu · Bali", "Open 7am–11pm",
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
  heroKicker: "Café en plein air · Pererenan · Canggu, Bali",
  heroTitle: "À Pererenan, on petit-déjeune dans la jungle et on dîne sous les guirlandes.",
  heroLead:
    "Open House, c'est la cantine tout-en-plein-air de Canggu : pas de murs, pas de clim — juste un toit de rotin, des plantes partout et la cuisine healthy qui tourne du lever du jour jusqu'à tard. Bowls, brunch all-day, burgers, smoothies et cocktails. Ouvert tous les jours, 7h–23h.",
  heroPrimary: "Réserver une table",
  heroSecondary: "Voir la carte",
  ratingMeta: "1 053 avis Google",
  openBadge: "Ouvert 7j/7",
  openHoursShort: "Tous les jours · 7h – 23h",
  storyKicker: "L'adresse",
  storyTitle: "Le repaire en plein air de Pererenan.",
  storyBody: [
    "Posé sur Jl. Munduk Tengah, à deux pas des rizières de Pererenan et des spots de surf de Canggu, Open House est l'un de ces endroits où l'on vient pour un café et où l'on finit par rester toute la journée. Sous le toit de rotin tressé, entre les manguiers et les fougères, on sert un menu healthy et généreux du matin au soir.",
    "Bowls à composer, brunch servi toute la journée, burgers et tacos, smoothies frais, café de spécialité — et quand le soleil tombe, les guirlandes s'allument, la boule à facettes tourne et la table de midi devient un bar. C'est toujours plein, c'est local et voyageur à la fois, et c'est exactement pour ça qu'on y revient.",
  ],
  stats: [
    { n: "4,6/5", l: "sur 1 053 avis Google" },
    { n: "7h – 23h", l: "ouvert tous les jours" },
    { n: "Plein air", l: "au cœur de Pererenan, Canggu" },
  ],
  servicesKicker: "Les incontournables",
  servicesTitle: "Ce qu'on commande les yeux fermés.",
  servicesLead:
    "Une cuisine fraîche et colorée, à composer selon votre faim. Voici trois assiettes signature — il y en a bien plus sur la carte.",
  featured: [
    { name: "Burger poulet croustillant", desc: "Cuisse de poulet panée et croustillante, slaw maison, cheddar fondant et frites — servi dans une assiette « OH's ». L'indétrônable.", price: "Rp 95K", img: `${IMG}/photo_04.webp`, tag: "Le chouchou" },
    { name: "Corn ribs grillés", desc: "Épis de maïs grillés taillés en « ribs », sauce crémeuse, chou mariné et herbes fraîches. À partager (ou pas).", price: "Rp 55K", img: `${IMG}/photo_01.webp`, tag: "À partager" },
    { name: "Avocado toast", desc: "Pain au levain, avocat écrasé, feta, oignons rouges marinés et grenade. Le brunch healthy servi toute la journée.", price: "Rp 75K", img: `${IMG}/photo_07.webp`, tag: "Brunch all-day" },
  ],
  menuKicker: "La carte",
  menuTitle: "Du brunch jusqu'au dîner, sans interruption.",
  menuLead:
    "Tout est servi toute la journée : commencez par un bowl healthy, finissez par un burger et un cocktail. Composez votre assiette selon vos envies.",
  menuPriceNote: "Prix en roupies (Rp)",
  priceColumns: [
    {
      title: "Brunch & bowls", icon: "🥥", items: [
        { name: "Bowl à composer (protéine + légumes)", price: "Rp 85K" },
        { name: "Greek chicken bowl", price: "Rp 90K" },
        { name: "Smoothie bowl açaí", price: "Rp 70K" },
        { name: "Avocado toast au levain", price: "Rp 75K" },
        { name: "Pancakes classiques", price: "Rp 65K" },
        { name: "Breakfast burrito", price: "Rp 70K" },
      ],
    },
    {
      title: "Mains & bar", icon: "🍔", items: [
        { name: "Burger poulet croustillant + frites", price: "Rp 95K" },
        { name: "Beef tacos (x3)", price: "Rp 85K" },
        { name: "Chicken fajitas", price: "Rp 90K" },
        { name: "Corn ribs grillés", price: "Rp 55K" },
        { name: "Smoothies & jus frais", price: "Rp 45K" },
        { name: "Café de spécialité · cocktails", price: "Rp 35K" },
      ],
    },
  ],
  menuBoardCaption: "La terrasse-jardin, à l'ombre des manguiers.",
  craftKicker: "Le lieu",
  craftTitle: "Un café sans murs, ouvert sur la jungle.",
  craftBody: [
    "« J'adore l'ambiance ici, c'est un espace ouvert, pas de clim — on a vraiment l'impression de manger au milieu de la jungle. » C'est ce que disent les habitués d'Open House.",
    "Toit de rotin tressé, ventilateurs qui brassent l'air chaud, plantes à perte de vue et une déco terrazzo : ici tout invite à s'attarder. Le midi on y travaille au calme, le soir on y dîne sous les guirlandes — et c'est toujours plein, locaux et voyageurs mélangés.",
  ],
  craftRole: "Café en plein air · Pererenan, Canggu",
  craftCaption: "Sous le toit de rotin, banquettes et tables en teck.",
  galleryKicker: "L'ambiance",
  galleryTitle: "Du vrai, pas des photos de catalogue.",
  galleryLead:
    "Quelques images d'Open House — la terrasse-jardin le jour, les guirlandes le soir, et ce qu'il y a dans l'assiette.",
  galleryCaptions: [
    "La terrasse-jardin et son deck en teck, entre les manguiers.",
    "Le soir, guirlandes et boule à facettes : la table devient bar.",
    "Poulet croustillant, chou mariné et sauce — servi à toute heure.",
  ],
  reviewsKicker: "Ils en parlent",
  reviewsTitle: "Ce que disent les clients.",
  reviewsLead: "Des avis Google authentiques, glanés table après table.",
  reviews: [
    { text: "J'adore l'ambiance ici : c'est un espace ouvert, donc pas de clim, il fait clairement chaud, mais on a l'impression de manger en pleine jungle. J'ai pris le Greek chicken bowl — poulet, légumes, tzatziki et pain plat — c'était ÉNORME, délicieux et plein de saveurs tout en restant healthy. Les frites de patate douce sont à tomber aussi. À recommander pour manger sain :)", author: "Ashley Kim", meta: "Avis Google · 5★", rating: 5 },
    { text: "On a pris un bowl très bon et nourrissant chez Open House ! Tout était frais et plein de goût. L'endroit était bien rempli, ce qui montre à quel point il est populaire auprès des locaux comme des voyageurs. Ce que j'ai particulièrement aimé, c'est qu'on peut composer son bowl selon ses envies. Une super adresse pour un repas sain et satisfaisant à Bali !", author: "Ali ÇİÇEK", meta: "Avis Google · 5★", rating: 5 },
  ],
  infoKicker: "Infos pratiques",
  infoTitle: "Nous trouver.",
  addressLabel: "Adresse",
  hoursLabel: "Horaires",
  phoneLabel: "Téléphone / WhatsApp",
  mapsCta: "Itinéraire Google Maps",
  closingTitle: "Une table pour ce soir, sous les guirlandes ?",
  closingLead:
    "Réservez votre table en quelques secondes, ou écrivez-nous sur WhatsApp. On vous garde une place à l'ombre des manguiers.",
  closingPrimary: "Réserver une table",
  closingSecondary: "WhatsApp",
  navServices: "Incontournables",
  navCard: "Carte",
  navCraft: "Le lieu",
  navGallery: "Galerie",
  navReviews: "Avis",
  navInfo: "Infos",
};

const EN: Content = {
  heroKicker: "Open-air café · Pererenan · Canggu, Bali",
  heroTitle: "In Pererenan, you brunch in the jungle and dine under the fairy lights.",
  heroLead:
    "Open House is Canggu's all-open-air canteen: no walls, no AC — just a woven rattan roof, plants everywhere and a healthy kitchen that runs from sunrise till late. Bowls, all-day brunch, burgers, smoothies and cocktails. Open every day, 7am–11pm.",
  heroPrimary: "Book a table",
  heroSecondary: "See the menu",
  ratingMeta: "1,053 Google reviews",
  openBadge: "Open 7 days",
  openHoursShort: "Every day · 7am – 11pm",
  storyKicker: "The spot",
  storyTitle: "Pererenan's open-air hangout.",
  storyBody: [
    "Tucked on Jl. Munduk Tengah, a stone's throw from Pererenan's rice fields and the Canggu surf breaks, Open House is one of those places you come to for a coffee and end up staying all day. Under the woven rattan roof, between mango trees and ferns, the kitchen serves a healthy, generous menu from morning till night.",
    "Build-your-own bowls, all-day brunch, burgers and tacos, fresh smoothies, specialty coffee — and when the sun drops, the fairy lights come on, the disco ball spins and the lunch table turns into a bar. It's always packed, equal parts local and traveller, and that's exactly why people keep coming back.",
  ],
  stats: [
    { n: "4.6/5", l: "across 1,053 Google reviews" },
    { n: "7am – 11pm", l: "open every single day" },
    { n: "Open-air", l: "in the heart of Pererenan, Canggu" },
  ],
  servicesKicker: "The must-haves",
  servicesTitle: "What we'd order with our eyes closed.",
  servicesLead:
    "Fresh, colourful food you build around your appetite. Here are three signature plates — there's plenty more on the menu.",
  featured: [
    { name: "Crispy chicken burger", desc: "Crispy fried chicken thigh, house slaw, melted cheddar and fries — served on an 'OH's' plate. The undisputed favourite.", price: "Rp 95K", img: `${IMG}/photo_04.webp`, tag: "Crowd favourite" },
    { name: "Grilled corn ribs", desc: "Charred corn cut into 'ribs', creamy sauce, pickled cabbage and fresh herbs. To share (or not).", price: "Rp 55K", img: `${IMG}/photo_01.webp`, tag: "To share" },
    { name: "Avocado toast", desc: "Sourdough, smashed avocado, feta, pickled red onion and pomegranate. Healthy brunch served all day long.", price: "Rp 75K", img: `${IMG}/photo_07.webp`, tag: "All-day brunch" },
  ],
  menuKicker: "The menu",
  menuTitle: "From brunch to dinner, no breaks.",
  menuLead:
    "Everything is served all day: start with a healthy bowl, finish with a burger and a cocktail. Build your plate however you like it.",
  menuPriceNote: "Prices in Rupiah (Rp)",
  priceColumns: [
    {
      title: "Brunch & bowls", icon: "🥥", items: [
        { name: "Build-your-own bowl (protein + veg)", price: "Rp 85K" },
        { name: "Greek chicken bowl", price: "Rp 90K" },
        { name: "Açaí smoothie bowl", price: "Rp 70K" },
        { name: "Sourdough avocado toast", price: "Rp 75K" },
        { name: "Classic pancakes", price: "Rp 65K" },
        { name: "Breakfast burrito", price: "Rp 70K" },
      ],
    },
    {
      title: "Mains & bar", icon: "🍔", items: [
        { name: "Crispy chicken burger + fries", price: "Rp 95K" },
        { name: "Beef tacos (x3)", price: "Rp 85K" },
        { name: "Chicken fajitas", price: "Rp 90K" },
        { name: "Grilled corn ribs", price: "Rp 55K" },
        { name: "Smoothies & fresh juices", price: "Rp 45K" },
        { name: "Specialty coffee · cocktails", price: "Rp 35K" },
      ],
    },
  ],
  menuBoardCaption: "The garden terrace, in the shade of the mango trees.",
  craftKicker: "The space",
  craftTitle: "A café with no walls, open onto the jungle.",
  craftBody: [
    "\"I love the vibes here, it's an open space so no AC and it's definitely hot, but it makes you feel like you're eating in the middle of the jungle.\" That's what Open House regulars say.",
    "Woven rattan roof, fans stirring the warm air, plants as far as you can see and terrazzo everywhere: this is a place built for lingering. Work quietly over lunch, dine under the fairy lights at night — and it's always full, locals and travellers side by side.",
  ],
  craftRole: "Open-air café · Pererenan, Canggu",
  craftCaption: "Under the rattan roof — banquettes and teak tables.",
  galleryKicker: "The vibe",
  galleryTitle: "The real thing, not stock photos.",
  galleryLead:
    "A few shots of Open House — the garden terrace by day, the fairy lights at night, and what ends up on the plate.",
  galleryCaptions: [
    "The garden terrace and its teak deck, between the mango trees.",
    "At night, fairy lights and a disco ball: the table turns into a bar.",
    "Crispy chicken, pickled cabbage and sauce — served at any hour.",
  ],
  reviewsKicker: "Word of mouth",
  reviewsTitle: "What guests say.",
  reviewsLead: "Genuine Google reviews, gathered table after table.",
  reviews: [
    { text: "I like the vibes here, it's an open space so no air conditioning and it's definitely hot but makes you feel like you're eating in the middle of the jungle. I got the Greek chicken bowl with chicken breast, veggies, tzatziki and flat bread and it was HUGE, delicious and flavorful while being healthy. Highly recommend for healthy food :) also tried the sweet potato fries before and they were sooo yummy.", author: "Ashley Kim", meta: "Google review · 5★", rating: 5 },
    { text: "We had a very delicious and nutritious bowl at Open House Café! Everything was fresh and full of flavor. The place was quite crowded, which shows how popular it is among locals and visitors. What I especially liked is that you can customize your bowl based on your own taste. It was our first time here, and we really liked the experience. Definitely a great spot for a healthy and satisfying meal in Bali!", author: "Ali ÇİÇEK", meta: "Google review · 5★", rating: 5 },
  ],
  infoKicker: "Practical info",
  infoTitle: "Find us.",
  addressLabel: "Address",
  hoursLabel: "Hours",
  phoneLabel: "Phone / WhatsApp",
  mapsCta: "Directions on Google Maps",
  closingTitle: "A table for tonight, under the fairy lights?",
  closingLead:
    "Book your table in seconds, or message us on WhatsApp. We'll keep a spot for you in the shade of the mango trees.",
  closingPrimary: "Book a table",
  closingSecondary: "WhatsApp",
  navServices: "Must-haves",
  navCard: "Menu",
  navCraft: "The space",
  navGallery: "Gallery",
  navReviews: "Reviews",
  navInfo: "Info",
};

export function getOpenHouseContent(lang: Lang): Content {
  return lang === "en" ? EN : FR;
}
