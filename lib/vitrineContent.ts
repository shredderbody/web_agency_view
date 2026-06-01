export type Service = { name: string; desc: string; price: string };
export type Review = { text: string; author: string; meta: string };

export type Vitrine = {
  slug: string;
  vit: "barber" | "onglerie" | "traiteur" | "resto";
  business: string;
  trade: string;
  kicker: string;
  heroTitle: string;
  heroLead: string;
  primaryCta: string;
  secondaryCta: string;
  cover: string;
  portrait: string;
  sheet: string;
  detail: string;
  scene: string;
  rating: string;
  ratingMeta: string;
  address: string;
  hours: string;
  phone: string;
  servicesTitle: string;
  services: Service[];
  galleryTitle: string;
  galleryLead: string;
  artisanName: string;
  artisanRole: string;
  artisanBio: string[];
  reviews: Review[];
  closingTitle: string;
  closingLead: string;
};

export const VITRINES: Record<string, Vitrine> = {
  barbershop: {
    slug: "barbershop",
    vit: "barber",
    business: "Maison Brutus",
    trade: "Barbier · Coiffeur homme",
    kicker: "Barbier depuis 2014 · Lyon 1er",
    heroTitle: "Coupe nette. Barbe taillée. Rasage à l'ancienne.",
    heroLead:
      "Un salon à l'esprit vintage où l'on prend le temps de bien faire. Lame chaude, serviette tiède, et la sortie toujours plus droite que l'entrée.",
    primaryCta: "Prendre rendez-vous",
    secondaryCta: "Voir les prestations",
    cover: "/characters/barber-scene.webp",
    portrait: "/characters/barbershop-portrait.webp",
    sheet: "/characters/barbershop-sheet.webp",
    detail: "/characters/barber-detail.webp",
    scene: "/characters/barber-scene.webp",
    rating: "4,9",
    ratingMeta: "312 avis Google",
    address: "12 rue de la Vieille, 69001 Lyon",
    hours: "Mar – Sam · 9h à 19h30",
    phone: "04 78 00 00 12",
    servicesTitle: "La carte du salon",
    services: [
      { name: "La coupe Brutus", desc: "Diagnostic, coupe aux ciseaux et tondeuse, coiffage.", price: "28 €" },
      { name: "Taille de barbe", desc: "Contours au rasoir, serviette chaude, huile de finition.", price: "19 €" },
      { name: "Coupe + barbe", desc: "Le combo signature, une heure rien que pour vous.", price: "42 €" },
      { name: "Rasage traditionnel", desc: "Au coupe-chou, mousse chaude et soin apaisant.", price: "26 €" },
      { name: "Le petit gentleman", desc: "Coupe enfant jusqu'à 12 ans, patience comprise.", price: "18 €" },
    ],
    galleryTitle: "Le salon, dans le détail",
    galleryLead: "Fauteuils de barbier, laiton patiné et lumière chaude. On vient pour la coupe, on revient pour l'ambiance.",
    artisanName: "Marco",
    artisanRole: "Maître barbier, fondateur",
    artisanBio: [
      "Dix ans de lames et de ciseaux, formé à Naples puis installé sur les pentes de la Croix-Rousse. Marco aime les coupes franches et les conversations vraies.",
      "Chez Brutus, pas de chaîne ni de minuterie : chaque client repart avec une coupe pensée pour sa tête, pas pour la moyenne.",
    ],
    reviews: [
      { text: "La meilleure taille de barbe de Lyon, sans exagérer. On se sent attendu.", author: "Karim B.", meta: "Client depuis 3 ans" },
      { text: "Ambiance au top, café offert, et une coupe qui tient deux semaines de plus que partout ailleurs.", author: "Thomas L.", meta: "Avis Google" },
      { text: "J'ai emmené mon fils pour sa première coupe, ils ont été adorables.", author: "Sophie R.", meta: "Avis Google" },
    ],
    closingTitle: "Votre fauteuil vous attend.",
    closingLead: "Réservez en ligne en deux gestes, ou passez nous voir. Le café est toujours prêt.",
  },

  onglerie: {
    slug: "onglerie",
    vit: "onglerie",
    business: "L'Atelier Rosé",
    trade: "Onglerie · Beauté des mains",
    kicker: "Nail bar & soins · Bordeaux centre",
    heroTitle: "Vos mains méritent leur moment.",
    heroLead:
      "Pose gel, nail art délicat et soins des mains dans un cocon tout en douceur. On prend le temps, vous repartez les mains parfaites et la tête légère.",
    primaryCta: "Réserver un soin",
    secondaryCta: "Découvrir la carte",
    cover: "/characters/onglerie-scene.webp",
    portrait: "/characters/onglerie-portrait.webp",
    sheet: "/characters/onglerie-sheet.webp",
    detail: "/characters/onglerie-detail.webp",
    scene: "/characters/onglerie-scene.webp",
    rating: "5,0",
    ratingMeta: "186 avis vérifiés",
    address: "8 rue du Pas-Saint-Georges, 33000 Bordeaux",
    hours: "Lun – Sam · 10h à 19h",
    phone: "05 56 00 00 08",
    servicesTitle: "La carte des soins",
    services: [
      { name: "Pose gel couleur", desc: "Préparation, pose et finition glossy longue tenue.", price: "39 €" },
      { name: "Manucure russe", desc: "Travail des cuticules précis, ongles nets et nourris.", price: "45 €" },
      { name: "Nail art sur-mesure", desc: "French inversée, chromes, dessins fins à la demande.", price: "à partir de 12 €" },
      { name: "Beauté des pieds", desc: "Gommage, soin et vernis dans un fauteuil douillet.", price: "42 €" },
      { name: "Dépose & soin", desc: "Retrait tout en douceur et soin réparateur.", price: "20 €" },
    ],
    galleryTitle: "Un écrin, pas une chaîne",
    galleryLead: "Tons poudrés, pampa séchée et lumière du jour. Chaque détail est pensé pour qu'on s'y sente bien.",
    artisanName: "Léa",
    artisanRole: "Prothésiste ongulaire, fondatrice",
    artisanBio: [
      "Formée aux techniques russes et passionnée de nail art, Léa a ouvert l'Atelier pour offrir autre chose qu'une pose à la chaîne : un vrai moment de soin.",
      "Hygiène irréprochable, produits respectueux de l'ongle et conseils sincères. Ici, on prend soin de vos mains comme des nôtres.",
    ],
    reviews: [
      { text: "Un cocon. Mes ongles n'ont jamais aussi bien tenu et le lieu est magnifique.", author: "Camille D.", meta: "Cliente fidèle" },
      { text: "Le nail art est bluffant de précision. Léa a un vrai œil d'artiste.", author: "Inès M.", meta: "Avis vérifié" },
      { text: "On déconnecte totalement. Je ressors apaisée à chaque fois.", author: "Margaux T.", meta: "Avis vérifié" },
    ],
    closingTitle: "Offrez une pause à vos mains.",
    closingLead: "Réservation en ligne 24h/24. Choisissez votre soin, votre créneau, et laissez-vous faire.",
  },

  traiteur: {
    slug: "traiteur",
    vit: "traiteur",
    business: "Maison Ferrand",
    trade: "Charcutier · Traiteur",
    kicker: "Charcuterie artisanale depuis 1978 · Annecy",
    heroTitle: "Le goût du fait-maison, depuis trois générations.",
    heroLead:
      "Terrines, pâtés en croûte, saucissons et plateaux de fête, préparés chaque matin dans notre atelier. Commandez en ligne, retirez en boutique.",
    primaryCta: "Commander un plateau",
    secondaryCta: "Voir la carte",
    cover: "/characters/traiteur-scene.webp",
    portrait: "/characters/traiteur-portrait.webp",
    sheet: "/characters/traiteur-sheet.webp",
    detail: "/characters/traiteur-detail.webp",
    scene: "/characters/traiteur-scene.webp",
    rating: "4,8",
    ratingMeta: "240 avis",
    address: "3 rue Sainte-Claire, 74000 Annecy",
    hours: "Mar – Dim · 8h à 13h, 15h à 19h",
    phone: "04 50 00 00 03",
    servicesTitle: "Nos spécialités",
    services: [
      { name: "Plateau apéritif", desc: "Sélection de charcuteries, terrines et cornichons maison.", price: "dès 24 €" },
      { name: "Pâté en croûte", desc: "Notre médaille d'or, pâte feuilletée et farce généreuse.", price: "8 € / part" },
      { name: "Terrines de campagne", desc: "Cuites au torchon, recette de la maison.", price: "4,50 € / 100g" },
      { name: "Plats traiteur du jour", desc: "Préparés le matin, à réchauffer chez vous.", price: "variable" },
      { name: "Buffet de fête", desc: "Sur commande, pour vos grandes tablées.", price: "sur devis" },
    ],
    galleryTitle: "L'atelier et le comptoir",
    galleryLead: "Jambons suspendus, terrines alignées, ardoise à la craie. Tout est fait sur place, à l'ancienne.",
    artisanName: "Bernard Ferrand",
    artisanRole: "Charcutier-traiteur, 3e génération",
    artisanBio: [
      "Bernard a grandi entre les billots et les saloirs. Il perpétue les recettes de son grand-père tout en glissant ses propres trouvailles à la carte.",
      "Cochon élevé en plein air à moins de 50 km, sel de Guérande, zéro conservateur superflu. Le bon goût n'a pas besoin de raccourcis.",
    ],
    reviews: [
      { text: "Le pâté en croûte est une institution. On en commande pour chaque réveillon.", author: "Famille Morel", meta: "Clients depuis 12 ans" },
      { text: "Commande en ligne le matin, plateau prêt à midi. Impeccable pour recevoir.", author: "Julien P.", meta: "Avis Google" },
      { text: "On sent le travail et la qualité des produits. Rien à voir avec la grande surface.", author: "Anne-Claire V.", meta: "Avis Google" },
    ],
    closingTitle: "Recevez comme un chef, sans rien préparer.",
    closingLead: "Commandez vos plateaux et plats en ligne, retirez-les frais en boutique au créneau choisi.",
  },

  restaurant: {
    slug: "restaurant",
    vit: "resto",
    business: "Le Comptoir 12",
    trade: "Restaurant · Bistrot de quartier",
    kicker: "Cuisine de saison · Paris 11e",
    heroTitle: "Un bistrot où l'on s'attable comme à la maison.",
    heroLead:
      "Produits de marché, ardoise qui change chaque semaine et une cave choisie avec soin. Le quartier a son comptoir, et il vous garde une place.",
    primaryCta: "Réserver une table",
    secondaryCta: "Voir le menu",
    cover: "/characters/restaurant-scene.webp",
    portrait: "/characters/restaurant-portrait.webp",
    sheet: "/characters/restaurant-sheet.webp",
    detail: "/characters/restaurant-detail.webp",
    scene: "/characters/restaurant-scene.webp",
    rating: "4,7",
    ratingMeta: "528 avis",
    address: "12 rue Saint-Maur, 75011 Paris",
    hours: "Mar – Sam · 12h à 14h30, 19h à 23h",
    phone: "01 43 00 00 12",
    servicesTitle: "L'ardoise du moment",
    services: [
      { name: "Entrées de saison", desc: "Velouté du marché, œuf parfait, burrata des Pouilles.", price: "9 – 14 €" },
      { name: "Plats du jour", desc: "Magret rôti, poisson de criée, risotto crémeux.", price: "19 – 26 €" },
      { name: "Le menu déjeuner", desc: "Entrée, plat, dessert, au tarif du midi en semaine.", price: "23 €" },
      { name: "Desserts maison", desc: "Tarte fine, mousse au chocolat, baba revisité.", price: "8 €" },
      { name: "Accord mets & vins", desc: "Cave de vignerons, conseils du sommelier.", price: "au verre dès 6 €" },
    ],
    galleryTitle: "L'ambiance d'un vrai bistrot",
    galleryLead: "Bois chaud, zinc, bougies et nappes blanches. Le décor d'un dîner dont on se souvient.",
    artisanName: "Camille",
    artisanRole: "Cheffe & restauratrice",
    artisanBio: [
      "Passée par de belles maisons parisiennes, Camille a voulu un lieu à taille humaine où la cuisine reste généreuse et sans chichi.",
      "Elle compose son ardoise chaque semaine selon le marché. Ce qui est bon ce jour-là finit dans votre assiette, simplement.",
    ],
    reviews: [
      { text: "Le rapport qualité-prix du midi est imbattable, et tout est fait maison.", author: "Léo F.", meta: "Habitué du quartier" },
      { text: "Service chaleureux, vins de vignerons parfaits. Notre cantine du vendredi.", author: "Nadia S.", meta: "Avis Google" },
      { text: "On réserve en deux clics et la table est toujours prête. Cuisine de saison au top.", author: "Marc D.", meta: "Avis Google" },
    ],
    closingTitle: "Gardez-nous une place ce soir.",
    closingLead: "Réservez votre table en ligne en quelques secondes, ou commandez à emporter pour ce soir.",
  },
};

export const VITRINE_SLUGS = Object.keys(VITRINES);
