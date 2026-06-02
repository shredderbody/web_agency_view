import type { Lang } from "./i18n";

export type Service = { name: string; desc: string; price: string };
export type Review = { text: string; author: string; meta: string; image: string };

export type VitBase = {
  slug: string;
  vit: "barber" | "onglerie" | "traiteur" | "resto";
  business: string;
  city: string;
  cover: string;
  portrait: string;
  sheet: string;
  detail: string;
  scene: string;
  address: string;
  phone: string;
  artisanName: string;
};

export type VitText = {
  trade: string;
  kicker: string;
  heroTitle: string;
  heroLead: string;
  primaryCta: string;
  secondaryCta: string;
  rating: string;
  ratingMeta: string;
  hours: string;
  servicesTitle: string;
  services: Service[];
  galleryTitle: string;
  galleryLead: string;
  artisanRole: string;
  artisanBio: string[];
  reviews: Review[];
  closingTitle: string;
  closingLead: string;
};

export type Vitrine = VitBase & VitText;

export const VIT_BASE: Record<string, VitBase> = {
  barbershop: {
    slug: "barbershop", vit: "barber", business: "Maison Brutus", city: "Lyon 1er",
    cover: "/characters/barber-scene.webp", portrait: "/characters/barbershop-portrait.webp",
    sheet: "/characters/barbershop-sheet.webp", detail: "/characters/barber-detail.webp", scene: "/characters/barber-scene.webp",
    address: "12 rue de la Vieille, 69001 Lyon", phone: "04 78 00 00 12", artisanName: "Marco",
  },
  onglerie: {
    slug: "onglerie", vit: "onglerie", business: "L'Atelier Rosé", city: "Bordeaux",
    cover: "/characters/onglerie-scene.webp", portrait: "/characters/onglerie-portrait.webp",
    sheet: "/characters/onglerie-sheet.webp", detail: "/characters/onglerie-detail.webp", scene: "/characters/onglerie-scene.webp",
    address: "8 rue du Pas-Saint-Georges, 33000 Bordeaux", phone: "05 56 00 00 08", artisanName: "Léa",
  },
  traiteur: {
    slug: "traiteur", vit: "traiteur", business: "Maison Ferrand", city: "Annecy",
    cover: "/characters/traiteur-scene.webp", portrait: "/characters/traiteur-portrait.webp",
    sheet: "/characters/traiteur-sheet.webp", detail: "/characters/traiteur-detail.webp", scene: "/characters/traiteur-scene.webp",
    address: "3 rue Sainte-Claire, 74000 Annecy", phone: "04 50 00 00 03", artisanName: "Bernard Ferrand",
  },
  restaurant: {
    slug: "restaurant", vit: "resto", business: "Le Comptoir 12", city: "Paris 11e",
    cover: "/characters/restaurant-scene.webp", portrait: "/characters/restaurant-portrait.webp",
    sheet: "/characters/restaurant-sheet.webp", detail: "/characters/restaurant-detail.webp", scene: "/characters/restaurant-scene.webp",
    address: "12 rue Saint-Maur, 75011 Paris", phone: "01 43 00 00 12", artisanName: "Camille",
  },
};

const TEXT: Record<Lang, Record<string, VitText>> = {
  fr: {
    barbershop: {
      trade: "Barbier · Coiffeur homme", kicker: "Barbier depuis 2014 · Lyon 1er",
      heroTitle: "Coupe nette. Barbe taillée. Rasage à l'ancienne.",
      heroLead: "Un salon à l'esprit vintage où l'on prend le temps de bien faire. Lame chaude, serviette tiède, et la sortie toujours plus droite que l'entrée.",
      primaryCta: "Prendre rendez-vous", secondaryCta: "Voir les prestations",
      rating: "4,9", ratingMeta: "312 avis Google", hours: "Mar – Sam · 9h à 19h30",
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
      artisanRole: "Maître barbier, fondateur",
      artisanBio: [
        "Dix ans de lames et de ciseaux, formé à Naples puis installé sur les pentes de la Croix-Rousse. Marco aime les coupes franches et les conversations vraies.",
        "Chez Brutus, pas de chaîne ni de minuterie : chaque client repart avec une coupe pensée pour sa tête, pas pour la moyenne.",
      ],
      reviews: [
        { text: "La meilleure taille de barbe de Lyon, sans exagérer. On se sent attendu.", author: "Karim B.", meta: "Client depuis 3 ans", image: "https://randomuser.me/api/portraits/men/32.jpg" },
        { text: "Ambiance au top, café offert, et une coupe qui tient deux semaines de plus que partout ailleurs.", author: "Thomas L.", meta: "Avis Google", image: "https://randomuser.me/api/portraits/men/76.jpg" },
        { text: "J'ai emmené mon fils pour sa première coupe, ils ont été adorables.", author: "Sophie R.", meta: "Avis Google", image: "https://randomuser.me/api/portraits/women/65.jpg" },
        { text: "Le dégradé est net au millimètre. Je ne vais plus nulle part ailleurs.", author: "Yanis M.", meta: "Avis Google", image: "https://randomuser.me/api/portraits/men/45.jpg" },
        { text: "Rasage au coupe-chou comme à l'ancienne, serviette chaude... un vrai moment.", author: "David P.", meta: "Client fidèle", image: "https://randomuser.me/api/portraits/men/22.jpg" },
        { text: "Réservation en ligne hyper pratique, jamais d'attente. Le détail qui change tout.", author: "Mehdi K.", meta: "Avis vérifié", image: "https://randomuser.me/api/portraits/men/60.jpg" },
      ],
      closingTitle: "Votre fauteuil vous attend.",
      closingLead: "Réservez en ligne en deux gestes, ou passez nous voir. Le café est toujours prêt.",
    },
    onglerie: {
      trade: "Onglerie · Beauté des mains", kicker: "Nail bar & soins · Bordeaux centre",
      heroTitle: "Vos mains méritent leur moment.",
      heroLead: "Pose gel, nail art délicat et soins des mains dans un cocon tout en douceur. On prend le temps, vous repartez les mains parfaites et la tête légère.",
      primaryCta: "Réserver un soin", secondaryCta: "Découvrir la carte",
      rating: "5,0", ratingMeta: "186 avis vérifiés", hours: "Lun – Sam · 10h à 19h",
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
      artisanRole: "Prothésiste ongulaire, fondatrice",
      artisanBio: [
        "Formée aux techniques russes et passionnée de nail art, Léa a ouvert l'Atelier pour offrir autre chose qu'une pose à la chaîne : un vrai moment de soin.",
        "Hygiène irréprochable, produits respectueux de l'ongle et conseils sincères. Ici, on prend soin de vos mains comme des nôtres.",
      ],
      reviews: [
        { text: "Un cocon. Mes ongles n'ont jamais aussi bien tenu et le lieu est magnifique.", author: "Camille D.", meta: "Cliente fidèle", image: "https://randomuser.me/api/portraits/women/44.jpg" },
        { text: "Le nail art est bluffant de précision. Léa a un vrai œil d'artiste.", author: "Inès M.", meta: "Avis vérifié", image: "https://randomuser.me/api/portraits/women/68.jpg" },
        { text: "On déconnecte totalement. Je ressors apaisée à chaque fois.", author: "Margaux T.", meta: "Avis vérifié", image: "https://randomuser.me/api/portraits/women/90.jpg" },
        { text: "Prise de rendez-vous en ligne ultra simple, et l'accueil est adorable.", author: "Sarah B.", meta: "Avis Google", image: "https://randomuser.me/api/portraits/women/12.jpg" },
        { text: "Mes ongles tiennent plus de trois semaines sans accroc. Bluffant.", author: "Chloé V.", meta: "Cliente fidèle", image: "https://randomuser.me/api/portraits/women/29.jpg" },
        { text: "Un vrai moment cocooning, on se sent choyée du début à la fin.", author: "Laura G.", meta: "Avis vérifié", image: "https://randomuser.me/api/portraits/women/57.jpg" },
      ],
      closingTitle: "Offrez une pause à vos mains.",
      closingLead: "Réservation en ligne 24h/24. Choisissez votre soin, votre créneau, et laissez-vous faire.",
    },
    traiteur: {
      trade: "Charcutier · Traiteur", kicker: "Charcuterie artisanale depuis 1978 · Annecy",
      heroTitle: "Le goût du fait-maison, depuis trois générations.",
      heroLead: "Terrines, pâtés en croûte, saucissons et plateaux de fête, préparés chaque matin dans notre atelier. Commandez en ligne, retirez en boutique.",
      primaryCta: "Commander un plateau", secondaryCta: "Voir la carte",
      rating: "4,8", ratingMeta: "240 avis", hours: "Mar – Dim · 8h à 13h, 15h à 19h",
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
      artisanRole: "Charcutier-traiteur, 3e génération",
      artisanBio: [
        "Bernard a grandi entre les billots et les saloirs. Il perpétue les recettes de son grand-père tout en glissant ses propres trouvailles à la carte.",
        "Cochon élevé en plein air à moins de 50 km, sel de Guérande, zéro conservateur superflu. Le bon goût n'a pas besoin de raccourcis.",
      ],
      reviews: [
        { text: "Le pâté en croûte est une institution. On en commande pour chaque réveillon.", author: "Famille Morel", meta: "Clients depuis 12 ans", image: "https://randomuser.me/api/portraits/women/33.jpg" },
        { text: "Commande en ligne le matin, plateau prêt à midi. Impeccable pour recevoir.", author: "Julien P.", meta: "Avis Google", image: "https://randomuser.me/api/portraits/men/52.jpg" },
        { text: "On sent le travail et la qualité des produits. Rien à voir avec la grande surface.", author: "Anne-Claire V.", meta: "Avis Google", image: "https://randomuser.me/api/portraits/women/75.jpg" },
        { text: "Les terrines maison sont exceptionnelles, on retrouve le goût d'antan.", author: "Pierre R.", meta: "Client depuis 8 ans", image: "https://randomuser.me/api/portraits/men/85.jpg" },
        { text: "J'ai commandé un plateau pour 20 personnes, tout était parfait et à l'heure.", author: "Hélène D.", meta: "Avis Google", image: "https://randomuser.me/api/portraits/women/22.jpg" },
        { text: "Un accueil chaleureux et des conseils précieux pour composer mon buffet.", author: "Bernard L.", meta: "Avis vérifié", image: "https://randomuser.me/api/portraits/men/41.jpg" },
      ],
      closingTitle: "Recevez comme un chef, sans rien préparer.",
      closingLead: "Commandez vos plateaux et plats en ligne, retirez-les frais en boutique au créneau choisi.",
    },
    restaurant: {
      trade: "Restaurant · Bistrot de quartier", kicker: "Cuisine de saison · Paris 11e",
      heroTitle: "Un bistrot où l'on s'attable comme à la maison.",
      heroLead: "Produits de marché, ardoise qui change chaque semaine et une cave choisie avec soin. Le quartier a son comptoir, et il vous garde une place.",
      primaryCta: "Réserver une table", secondaryCta: "Voir le menu",
      rating: "4,7", ratingMeta: "528 avis", hours: "Mar – Sam · 12h à 14h30, 19h à 23h",
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
      artisanRole: "Cheffe & restauratrice",
      artisanBio: [
        "Passée par de belles maisons parisiennes, Camille a voulu un lieu à taille humaine où la cuisine reste généreuse et sans chichi.",
        "Elle compose son ardoise chaque semaine selon le marché. Ce qui est bon ce jour-là finit dans votre assiette, simplement.",
      ],
      reviews: [
        { text: "Le rapport qualité-prix du midi est imbattable, et tout est fait maison.", author: "Léo F.", meta: "Habitué du quartier", image: "https://randomuser.me/api/portraits/men/36.jpg" },
        { text: "Service chaleureux, vins de vignerons parfaits. Notre cantine du vendredi.", author: "Nadia S.", meta: "Avis Google", image: "https://randomuser.me/api/portraits/women/50.jpg" },
        { text: "On réserve en deux clics et la table est toujours prête. Cuisine de saison au top.", author: "Marc D.", meta: "Avis Google", image: "https://randomuser.me/api/portraits/men/55.jpg" },
        { text: "Le menu déjeuner change chaque semaine, toujours une belle surprise.", author: "Claire T.", meta: "Habituée", image: "https://randomuser.me/api/portraits/women/9.jpg" },
        { text: "Cadre chaleureux, service aux petits soins. Parfait pour un dîner entre amis.", author: "Antoine B.", meta: "Avis Google", image: "https://randomuser.me/api/portraits/men/14.jpg" },
        { text: "On réserve en ligne en 30 secondes, et la cuisine est d'une régularité bluffante.", author: "Sophie M.", meta: "Avis vérifié", image: "https://randomuser.me/api/portraits/women/21.jpg" },
      ],
      closingTitle: "Gardez-nous une place ce soir.",
      closingLead: "Réservez votre table en ligne en quelques secondes, ou commandez à emporter pour ce soir.",
    },
  },

  en: {
    barbershop: {
      trade: "Barbershop · Men's grooming", kicker: "Barber since 2014 · Lyon",
      heroTitle: "Sharp cut. Trimmed beard. Old-school shave.",
      heroLead: "A vintage-spirited shop where we take the time to do it right. Hot blade, warm towel, and you always leave sharper than you came in.",
      primaryCta: "Book an appointment", secondaryCta: "See the services",
      rating: "4.9", ratingMeta: "312 Google reviews", hours: "Tue – Sat · 9am to 7:30pm",
      servicesTitle: "The shop menu",
      services: [
        { name: "The Brutus cut", desc: "Consultation, scissor and clipper cut, styling.", price: "€28" },
        { name: "Beard trim", desc: "Razor lines, hot towel, finishing oil.", price: "€19" },
        { name: "Cut + beard", desc: "The signature combo, a full hour just for you.", price: "€42" },
        { name: "Traditional shave", desc: "Straight razor, hot lather and soothing care.", price: "€26" },
        { name: "Little gentleman", desc: "Kids' cut up to age 12, patience included.", price: "€18" },
      ],
      galleryTitle: "The shop, in detail",
      galleryLead: "Barber chairs, aged brass and warm light. You come for the cut, you return for the atmosphere.",
      artisanRole: "Master barber, founder",
      artisanBio: [
        "Ten years of blades and scissors, trained in Naples then settled on the slopes of Croix-Rousse. Marco loves clean cuts and honest conversation.",
        "At Brutus, no chain and no timer: every client leaves with a cut shaped for their head, not for the average.",
      ],
      reviews: [
        { text: "The best beard trim in town, no exaggeration. You feel expected.", author: "Karim B.", meta: "Client for 3 years", image: "https://randomuser.me/api/portraits/men/32.jpg" },
        { text: "Great vibe, free coffee, and a cut that holds two weeks longer than anywhere else.", author: "Thomas L.", meta: "Google review", image: "https://randomuser.me/api/portraits/men/76.jpg" },
        { text: "I brought my son for his first cut, they were lovely.", author: "Sophie R.", meta: "Google review", image: "https://randomuser.me/api/portraits/women/65.jpg" },
        { text: "The fade is sharp to the millimetre. I don't go anywhere else now.", author: "Yanis M.", meta: "Google review", image: "https://randomuser.me/api/portraits/men/45.jpg" },
        { text: "Straight-razor shave, hot towel... a proper moment.", author: "David P.", meta: "Loyal client", image: "https://randomuser.me/api/portraits/men/22.jpg" },
        { text: "Online booking is so handy, never any wait. The detail that changes everything.", author: "Mehdi K.", meta: "Verified review", image: "https://randomuser.me/api/portraits/men/60.jpg" },
      ],
      closingTitle: "Your chair is waiting.",
      closingLead: "Book online in two taps, or just drop by. The coffee is always on.",
    },
    onglerie: {
      trade: "Nail salon · Hand care", kicker: "Nail bar & treatments · Central Bordeaux",
      heroTitle: "Your hands deserve their moment.",
      heroLead: "Gel application, delicate nail art and hand care in a soft cocoon. We take our time; you leave with perfect hands and a clear head.",
      primaryCta: "Book a treatment", secondaryCta: "Discover the menu",
      rating: "5.0", ratingMeta: "186 verified reviews", hours: "Mon – Sat · 10am to 7pm",
      servicesTitle: "The treatment menu",
      services: [
        { name: "Colour gel", desc: "Prep, application and long-lasting glossy finish.", price: "€39" },
        { name: "Russian manicure", desc: "Precise cuticle work, clean and nourished nails.", price: "€45" },
        { name: "Bespoke nail art", desc: "Reverse French, chromes, fine designs on request.", price: "from €12" },
        { name: "Foot care", desc: "Exfoliation, treatment and polish in a cosy chair.", price: "€42" },
        { name: "Removal & care", desc: "Gentle removal and a repairing treatment.", price: "€20" },
      ],
      galleryTitle: "A setting, not a chain",
      galleryLead: "Powdery tones, dried pampas and daylight. Every detail is designed so you feel at ease.",
      artisanRole: "Nail technician, founder",
      artisanBio: [
        "Trained in Russian techniques and passionate about nail art, Léa opened the Atelier to offer something other than a production-line set: a real moment of care.",
        "Impeccable hygiene, nail-friendly products and honest advice. Here, we treat your hands like our own.",
      ],
      reviews: [
        { text: "A cocoon. My nails have never held so well and the place is gorgeous.", author: "Camille D.", meta: "Loyal client", image: "https://randomuser.me/api/portraits/women/44.jpg" },
        { text: "The nail art is stunningly precise. Léa has a real artist's eye.", author: "Inès M.", meta: "Verified review", image: "https://randomuser.me/api/portraits/women/68.jpg" },
        { text: "You switch off completely. I leave calm every time.", author: "Margaux T.", meta: "Verified review", image: "https://randomuser.me/api/portraits/women/90.jpg" },
        { text: "Booking online is super simple, and the welcome is lovely.", author: "Sarah B.", meta: "Google review", image: "https://randomuser.me/api/portraits/women/12.jpg" },
        { text: "My nails hold for over three weeks without a chip. Stunning.", author: "Chloé V.", meta: "Loyal client", image: "https://randomuser.me/api/portraits/women/29.jpg" },
        { text: "A real cocooning moment, you feel pampered from start to finish.", author: "Laura G.", meta: "Verified review", image: "https://randomuser.me/api/portraits/women/57.jpg" },
      ],
      closingTitle: "Treat your hands to a pause.",
      closingLead: "Online booking around the clock. Choose your treatment, your slot, and let yourself be cared for.",
    },
    traiteur: {
      trade: "Deli · Caterer", kicker: "Artisan charcuterie since 1978 · Annecy",
      heroTitle: "The taste of homemade, for three generations.",
      heroLead: "Terrines, pâté en croûte, saucissons and party platters, prepared every morning in our workshop. Order online, collect in store.",
      primaryCta: "Order a platter", secondaryCta: "See the menu",
      rating: "4.8", ratingMeta: "240 reviews", hours: "Tue – Sun · 8am to 1pm, 3pm to 7pm",
      servicesTitle: "Our specialities",
      services: [
        { name: "Aperitif platter", desc: "A selection of cured meats, terrines and house pickles.", price: "from €24" },
        { name: "Pâté en croûte", desc: "Our gold-medal pie, puff pastry and generous filling.", price: "€8 / slice" },
        { name: "Country terrines", desc: "Cooked au torchon, the house recipe.", price: "€4.50 / 100g" },
        { name: "Daily deli dishes", desc: "Prepared in the morning, to reheat at home.", price: "varies" },
        { name: "Party buffet", desc: "To order, for your big gatherings.", price: "on request" },
      ],
      galleryTitle: "The workshop and the counter",
      galleryLead: "Hanging hams, lined-up terrines, a chalk board. Everything is made on site, the old way.",
      artisanRole: "Deli-caterer, 3rd generation",
      artisanBio: [
        "Bernard grew up among the blocks and salting tubs. He keeps his grandfather's recipes alive while slipping his own finds onto the menu.",
        "Free-range pork from under 50 km away, Guérande salt, zero needless preservatives. Good taste needs no shortcuts.",
      ],
      reviews: [
        { text: "The pâté en croûte is an institution. We order it every New Year's Eve.", author: "The Morel family", meta: "Clients for 12 years", image: "https://randomuser.me/api/portraits/women/33.jpg" },
        { text: "Order online in the morning, platter ready by noon. Perfect for hosting.", author: "Julien P.", meta: "Google review", image: "https://randomuser.me/api/portraits/men/52.jpg" },
        { text: "You can feel the craft and the quality. Nothing like the supermarket.", author: "Anne-Claire V.", meta: "Google review", image: "https://randomuser.me/api/portraits/women/75.jpg" },
        { text: "The house terrines are exceptional, the taste of the old days.", author: "Pierre R.", meta: "Client for 8 years", image: "https://randomuser.me/api/portraits/men/85.jpg" },
        { text: "I ordered a platter for 20, everything was perfect and on time.", author: "Hélène D.", meta: "Google review", image: "https://randomuser.me/api/portraits/women/22.jpg" },
        { text: "A warm welcome and great advice to put together my buffet.", author: "Bernard L.", meta: "Verified review", image: "https://randomuser.me/api/portraits/men/41.jpg" },
      ],
      closingTitle: "Host like a chef, with nothing to prepare.",
      closingLead: "Order your platters and dishes online, collect them fresh in store at your chosen time.",
    },
    restaurant: {
      trade: "Restaurant · Neighbourhood bistro", kicker: "Seasonal cooking · Paris",
      heroTitle: "A bistro where you sit down like at home.",
      heroLead: "Market produce, a board that changes every week and a carefully chosen cellar. The neighbourhood has its counter, and it's saving you a seat.",
      primaryCta: "Book a table", secondaryCta: "See the menu",
      rating: "4.7", ratingMeta: "528 reviews", hours: "Tue – Sat · 12pm to 2:30pm, 7pm to 11pm",
      servicesTitle: "Today's board",
      services: [
        { name: "Seasonal starters", desc: "Market velouté, perfect egg, Puglian burrata.", price: "€9 – 14" },
        { name: "Mains of the day", desc: "Roast duck, day-boat fish, creamy risotto.", price: "€19 – 26" },
        { name: "Lunch menu", desc: "Starter, main, dessert at the weekday lunch price.", price: "€23" },
        { name: "Homemade desserts", desc: "Thin tart, chocolate mousse, reimagined baba.", price: "€8" },
        { name: "Food & wine pairing", desc: "Independent growers' cellar, sommelier's tips.", price: "by the glass from €6" },
      ],
      galleryTitle: "The feel of a real bistro",
      galleryLead: "Warm wood, zinc, candles and white linen. The setting of a dinner you remember.",
      artisanRole: "Chef & owner",
      artisanBio: [
        "After fine Parisian houses, Camille wanted a human-scale place where the cooking stays generous and fuss-free.",
        "She writes her board each week from the market. Whatever is good that day ends up on your plate, simply.",
      ],
      reviews: [
        { text: "The lunch value is unbeatable, and everything is made in-house.", author: "Léo F.", meta: "Regular in the area", image: "https://randomuser.me/api/portraits/men/36.jpg" },
        { text: "Warm service, perfect grower wines. Our Friday canteen.", author: "Nadia S.", meta: "Google review", image: "https://randomuser.me/api/portraits/women/50.jpg" },
        { text: "You book in two clicks and the table is always ready. Top seasonal cooking.", author: "Marc D.", meta: "Google review", image: "https://randomuser.me/api/portraits/men/55.jpg" },
        { text: "The lunch menu changes every week, always a nice surprise.", author: "Claire T.", meta: "Regular", image: "https://randomuser.me/api/portraits/women/9.jpg" },
        { text: "Warm setting, attentive service. Perfect for dinner with friends.", author: "Antoine B.", meta: "Google review", image: "https://randomuser.me/api/portraits/men/14.jpg" },
        { text: "You book online in 30 seconds, and the kitchen is impressively consistent.", author: "Sophie M.", meta: "Verified review", image: "https://randomuser.me/api/portraits/women/21.jpg" },
      ],
      closingTitle: "Save us a seat tonight.",
      closingLead: "Book your table online in seconds, or order takeaway for tonight.",
    },
  },
};

export const VITRINE_SLUGS = Object.keys(VIT_BASE);

export function getVitrine(lang: Lang, slug: string): Vitrine | null {
  const base = VIT_BASE[slug];
  const text = TEXT[lang]?.[slug];
  if (!base || !text) return null;
  return { ...base, ...text };
}
