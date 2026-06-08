export type Lang = "fr" | "en";

export const LANGS: { id: Lang; flag: string; label: string }[] = [
  { id: "fr", flag: "fr", label: "Français" },
  { id: "en", flag: "us", label: "English" },
];

export const DEFAULT_LANG: Lang = "fr";
export const LANG_COOKIE = "av_lang";
export const isLang = (v: unknown): v is Lang => v === "fr" || v === "en";

type UI = {
  htmlLang: string;
  nav: { metiers: string; methode: string; tarifs: string; faq: string; devis: string; home: string; menu: string; close: string };
  hero: {
    badge: string;
    pitch: string;
    titleLead: string;
    titleAccent: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    rating: string;
    chipDemoTitle: string;
    chipDemoSub: string;
    chipCraftTitle: string;
    chipCraftSub: string;
    heroAlt: string;
    scrollHint: string;
  };
  value: { kicker: string; title: string; body: string; figures: { n: string; l: string }[] };
  audience: { kicker: string; title: string; body: string; items: { n: string; t: string; d: string }[] };
  metiers: {
    kicker: string;
    title: string;
    body: string;
    highlight: Record<string, string>;
    example: string;
    seePage: string;
    notListed: string;
    talk: string;
    cardAlt: (trade: string, business: string) => string;
  };
  included: { kicker: string; title: string; items: { t: string; d: string }[] };
  method: { kicker: string; title: string; steps: { n: string; t: string; d: string }[] };
  pricing: {
    kicker: string;
    title: string;
    body: string;
    mostChosen: string;
    plans: { name: string; price: string; sub: string; featured: boolean; feats: string[]; cta: string }[];
  };
  addons: {
    kicker: string;
    title: string;
    body: string;
    note: string;
    items: { name: string; price: string }[];
  };
  checkout: {
    redirecting: string;
    errorMsg: string;
    successBanner: string;
    canceledBanner: string;
    subName: string;
    subDesc: string;
    feeName: string;
    feeDesc: string;
  };
  testimonials: {
    kicker: string;
    title: string;
    body: string;
    items: { text: string; image: string; name: string; role: string }[];
  };
  faq: { kicker: string; title: string; items: { q: string; a: string }[] };
  cta: { title: string; body: string; primary: string; secondary: string };
  demoSearch: {
    label: string;
    placeholder: string;
    hint: string;
    searching: string;
    noResults: string;
    foundLabel: string;
    change: string;
    submit: string;
    emailSubject: string;
    emailIntro: string;
    emailOutro: string;
    cantFind: string;
    manualTitle: string;
    manualName: string;
    manualTrade: string;
    manualCity: string;
    manualEmail: string;
    popupEmail: string;
    popupEmailLabel: string;
    popupPhoneLabel: string;
    manualPhone: string;
    backToSearch: string;
    loadedFromGoogle: string;
    fieldName: string;
    fieldSector: string;
    sectorPlaceholder: string;
    sectors: string[];
    fieldAddress: string;
    fieldWebsite: string;
    websitePlaceholder: string;
    fieldPhone: string;
    reset: string;
    sending: string;
    success: string;
    errorMsg: string;
    sent: string;
    reviewsTitle: string;
    reviewsWord: string;
    ratingLabel: string;
  };
  footer: {
    tagline: string;
    bookCall: string;
    demosLabel: string;
    studioLabel: string;
    method: string;
    pricing: string;
    faq: string;
    rights: string;
    legal: string;
    privacy: string;
  };
  notFound: { code: string; titleLead: string; titleAccent: string; body: string; home: string; demos: string };
  demoIndex: { back: string; devis: string; kicker: string; title: string; body: string; visit: string };
  demoCommon: {
    allDemos: string;
    wantMine: string;
    isDemoBanner: string;
    navCard: string;
    navPlace: string;
    navArtisan: string;
    addressLabel: string;
    hoursLabel: string;
    phoneLabel: string;
    openToday: string;
    servicesIntro: string;
    placeKicker: string;
    artisanKicker: string;
    sheetCaption: string;
    reviewsTitle: string;
    footerNote: string;
    createCta: string;
    metaSuffix: string;
    scroll: string;
  };
};

export const ui: Record<Lang, UI> = {
  fr: {
    htmlLang: "fr",
    nav: { metiers: "Métiers", methode: "Méthode", tarifs: "Tarifs", faq: "Questions", devis: "Devis gratuit", home: "accueil", menu: "Ouvrir le menu", close: "Fermer le menu" },
    hero: {
      badge: "Créateur de sites web pour commerces",
      pitch: "Un site professionnel livré en 7 jours, à partir de 490€ — pour les PME et agences qui veulent une présence web qui en impose.",
      titleLead: "Je crée le site web de votre",
      titleAccent: "commerce.",
      lead: "Conception, design et mise en ligne de vitrines web sur-mesure pour les artisans et commerces de proximité. Choisissez votre métier ci-dessous : vous verrez un site complet, déjà pensé pour vous.",
      ctaPrimary: "Choisir mon métier",
      ctaSecondary: "Demander un devis",
      rating: "Noté 4,9/5 par 60+ commerçants accompagnés",
      chipDemoTitle: "Démo en 7 jours",
      chipDemoSub: "à votre nom, gratuite",
      chipCraftTitle: "100% sur-mesure",
      chipCraftSub: "jamais un thème recyclé",
      heroAlt: "Atelier de création web : un site de commerce en cours de design sur un ordinateur portable",
      scrollHint: "Défiler",
    },
    value: {
      kicker: "Ce que je fais",
      title: "Un seul interlocuteur, du design à la mise en ligne.",
      body: "Je dessine, j'écris, je développe et j'héberge votre vitrine. Pas d'agence à étages ni de jargon : vous parlez à la personne qui fabrique votre site, et vous le voyez en ligne avant de vous engager.",
      figures: [
        { n: "75%", l: "des clients jugent un commerce crédible d'abord sur son site." },
        { n: "2,6×", l: "plus de prises de contact avec une vitrine soignée qu'une simple fiche." },
        { n: "7 j", l: "en moyenne pour voir votre démo en ligne, à votre nom." },
      ],
    },
    audience: {
      kicker: "Pour qui ?",
      title: "Conçu pour celles et ceux qui veulent passer un cap.",
      body: "Vous reconnaissez votre situation ? On est faits pour travailler ensemble. Site vieillissant, pas de site, ou refonte complète : on s'occupe de tout.",
      items: [
        { n: "1", t: "PME & TPE", d: "Vous avez une activité qui tourne, mais votre site ne reflète pas votre niveau actuel." },
        { n: "2", t: "Artisans", d: "Bouche-à-oreille au top, mais vous perdez des clients qui ne vous trouvent pas en ligne." },
        { n: "3", t: "Agences", d: "Beaucoup d'expertise, peu de demandes entrantes ? Un site qui met vos services en avant et attire les bons clients." },
        { n: "4", t: "Indépendants", d: "Vous lancez votre activité ou repartez sur de nouvelles bases avec un site qui vend." },
      ],
    },
    metiers: {
      kicker: "Choisissez votre métier",
      title: "Votre métier a son propre site. Cliquez pour le voir en entier.",
      body: "Chaque métier a ses codes, ses photos, ses moments forts. Voici un site complet et navigable conçu pour chacun. Trouvez le vôtre et projetez-vous.",
      highlight: {
        barbershop: "Prise de rendez-vous en ligne",
        onglerie: "Réservation de soins 24h/24",
        traiteur: "Commande de plateaux en ligne",
        restaurant: "Réservation de table + menu",
        plombier: "Demande de devis en ligne",
      },
      example: "Exemple :",
      seePage: "Voir la page",
      notListed: "Votre métier n'est pas listé ?",
      talk: "Parlons-en",
      cardAlt: (trade, business) => `Site web pour ${trade.toLowerCase()} (exemple : ${business})`,
    },
    included: {
      kicker: "Ce qui est inclus",
      title: "Tout pour ouvrir, rien à gérer seul.",
      items: [
        { t: "Design sur-mesure", d: "Un univers dessiné pour votre métier : couleurs, typographies, photos. Pas de thème recyclé." },
        { t: "Vitrine complète", d: "Accueil, prestations, galerie, avis, accès et contact. Tout ce qu'un client veut savoir avant de venir." },
        { t: "Réservation intégrée", d: "Rendez-vous, click & collect ou formulaire de devis, branchés sur l'outil adapté à votre activité." },
        { t: "Visibilité locale", d: "Optimisation pour la recherche de quartier et synchronisation avec votre fiche Google." },
        { t: "Suivi et retouches", d: "Horaires, prix, photos : on ajuste ensemble. Une retouche incluse chaque mois." },
        { t: "Mise en ligne rapide", d: "Hébergement, nom de domaine, sécurité et performance gérés de bout en bout." },
      ],
    },
    method: {
      kicker: "La méthode",
      title: "Quatre étapes, zéro jargon.",
      steps: [
        { n: "1", t: "On échange", d: "Un appel de 20 minutes pour comprendre votre métier, vos clients et vos envies." },
        { n: "2", t: "Je dessine la démo", d: "Je crée votre vitrine à votre nom, photos et textes compris, et je vous l'envoie en ligne." },
        { n: "3", t: "Vous ajustez", d: "Vous visitez, vous commentez. Je retouche jusqu'à ce que ce soit vraiment vous." },
        { n: "4", t: "Mise en ligne", d: "Domaine, hébergement, Google : je m'occupe de tout. Vous ouvrez votre vitrine." },
      ],
    },
    pricing: {
      kicker: "Tarifs",
      title: "Un prix clair, annoncé avant de commencer.",
      body: "Création unique, puis un abonnement simple pour l'hébergement et le suivi. Sans engagement piège.",
      mostChosen: "Le plus choisi",
      plans: [
        { name: "Essentielle", price: "490 €", sub: "+ 49 €/mois", featured: false, feats: ["Audit express de votre présence en ligne", "Vitrine une page soignée", "Photos et textes rédigés pour vous", "SEO local de base + fiche Google", "1 round de révisions", "Mobile et performance optimisés", "Livraison en 7 jours"], cta: "Démarrer" },
        { name: "Atelier", price: "990 €", sub: "+ 49 €/mois", featured: true, feats: ["Audit complet de votre activité", "Vitrine multi-pages (jusqu'à 5 pages)", "Maquette design sur-mesure", "Réservation ou click & collect intégré", "SEO local avancé + suivi des performances", "3 rounds de révisions", "1 retouche incluse / mois", "Livraison en 7 jours"], cta: "Choisir Atelier" },
        { name: "Signature", price: "Sur devis", sub: "projet dédié", featured: false, feats: ["Tout l'Atelier inclus", "Conception 100% sur-mesure, sans limite de pages", "Fonctions avancées (boutique, espace membre)", "Rounds de révisions illimités", "Accompagnement prioritaire dédié", "Livraison en 7 jours"], cta: "En parler" },
      ],
    },
    addons: {
      kicker: "Options à rajouter au forfait",
      title: "Personnalisez votre offre",
      body: "Ajoutez ce dont vous avez besoin, rien d'autre. (Ne peut être vendu seul — vient compléter un forfait.)",
      note: "* Pack Sérénité : maintenance, sauvegardes et support prioritaire pendant 6 mois.",
      items: [
        { name: "Page supplémentaire", price: "450 € / page" },
        { name: "Logo sur mesure", price: "350 €" },
        { name: "Identité visuelle complète", price: "890 €" },
        { name: "Copywriting (rédaction des textes)", price: "350 €" },
        { name: "Blog intégré + 3 articles", price: "490 €" },
        { name: "Vidéos tutoriels Webflow", price: "190 €" },
        { name: "Visuel 3D", price: "Prix sur devis" },
        { name: "Animation 3D", price: "Prix sur devis" },
        { name: "Pack Sérénité 6 mois*", price: "490 €" },
      ],
    },
    checkout: {
      redirecting: "Redirection…",
      errorMsg: "Le paiement est momentanément indisponible. Réessayez ou contactez-nous.",
      successBanner: "✓ Paiement confirmé — merci ! Nous ouvrons votre dossier et revenons vers vous très vite.",
      canceledBanner: "Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.",
      subName: "Abonnement vitrine",
      subDesc: "Maintenance, hébergement et support — {months} mois",
      feeName: "Mise en place — formule",
      feeDesc: "Installation, ouverture de dossier, infrastructure système et création du design (paiement unique)",
    },
    testimonials: {
      kicker: "Ils m'ont fait confiance",
      title: "Des commerçants qui ont enfin un site à leur image.",
      body: "Coiffeurs, restaurateurs, artisans : voici ce qu'ils disent de leur vitrine et de notre collaboration.",
      items: [
        { text: "En une semaine j'avais une démo à mon nom. Les clients réservent désormais en ligne, je passe moins de temps au téléphone.", image: "https://randomuser.me/api/portraits/men/32.jpg", name: "Karim Benali", role: "Barbier · Lyon" },
        { text: "Mon salon a enfin un site qui lui ressemble. Élégant, rapide, et les photos sont magnifiques. J'ai gagné en crédibilité.", image: "https://randomuser.me/api/portraits/women/44.jpg", name: "Léa Moreau", role: "Onglerie · Bordeaux" },
        { text: "Le click & collect a changé mon quotidien. Les commandes tombent le matin, tout est prêt à midi. Un vrai gain de temps.", image: "https://randomuser.me/api/portraits/men/52.jpg", name: "Julien Pasquier", role: "Traiteur · Nantes" },
        { text: "Un seul interlocuteur du début à la fin, zéro jargon. Je voyais le site avancer et j'ai validé en confiance.", image: "https://randomuser.me/api/portraits/women/68.jpg", name: "Nadia Séverin", role: "Restaurant · Paris" },
        { text: "Le résultat dépasse ce que j'imaginais. Mon référencement local a décollé, j'ai plus d'appels qu'avant.", image: "https://randomuser.me/api/portraits/men/76.jpg", name: "Thomas Lefèvre", role: "Garage · Toulouse" },
        { text: "Tout est clair : un prix annoncé, une démo gratuite, puis la mise en ligne. Je recommande à tous les commerçants.", image: "https://randomuser.me/api/portraits/women/90.jpg", name: "Margaux Tessier", role: "Fleuriste · Lille" },
      ],
    },
    faq: {
      kicker: "Questions fréquentes",
      title: "Ce qu'on me demande souvent.",
      items: [
        { q: "Combien de temps pour mettre ma vitrine en ligne ?", a: "Entre 7 et 15 jours pour une vitrine complète. On commence par une démo à votre nom : vous la validez, on la met en ligne. Vous n'attendez jamais des mois sans rien voir." },
        { q: "Je n'ai ni logo, ni photos, ni textes. C'est bloquant ?", a: "Non. On génère un univers visuel sur-mesure (comme les démos de ce site), on rédige vos textes et on cadre vos photos. Si vous avez déjà des éléments, on les intègre." },
        { q: "Est-ce que je pourrai modifier le site moi-même ?", a: "Oui. Vous recevez un accès simple pour changer horaires, prix, photos et actualités. Pour le reste, une retouche est incluse chaque mois dans la formule Atelier." },
        { q: "Les clients pourront-ils réserver ou commander en ligne ?", a: "Oui. Prise de rendez-vous, click & collect, formulaire de devis, carte commandable : on branche l'outil adapté à votre métier, sans commission cachée." },
        { q: "Et le référencement sur Google ?", a: "Chaque vitrine est optimisée pour la recherche locale (fiche, mots-clés de quartier, vitesse, mobile). L'objectif : qu'on vous trouve quand on cherche votre métier près de chez vous." },
        { q: "Combien ça coûte vraiment ?", a: "À partir de 499 € pour la vitrine essentielle, puis un abonnement clair pour l'hébergement et le suivi. Pas de devis surprise : le prix est annoncé avant de commencer." },
      ],
    },
    cta: {
      title: "Je vous prépare une démo. Gratuite, à votre nom.",
      body: "Dites-moi votre métier et votre ville. Sous 7 jours, vous recevez le lien d'une vitrine pensée pour vous. Vous décidez ensuite, en connaissance de cause.",
      primary: "Demander ma démo gratuite",
      secondary: "M'appeler",
    },
    demoSearch: {
      label: "Trouvez votre établissement",
      placeholder: "Nom de votre commerce, ex. « Boulangerie Martin »",
      hint: "Tapez le nom de votre commerce : on le retrouve sur Google pour préparer votre démo.",
      searching: "Recherche…",
      noResults: "Aucun établissement trouvé. Réessayez avec le nom exact.",
      foundLabel: "On a trouvé votre établissement :",
      change: "Modifier",
      submit: "Demander ma démo gratuite",
      emailSubject: "Demande de démo gratuite",
      emailIntro: "Bonjour,\n\nJe souhaite recevoir une démo gratuite pour mon établissement :",
      emailOutro: "Merci d'avance !",
      cantFind: "Je ne trouve pas mon entreprise",
      manualTitle: "Renseignez votre entreprise",
      manualName: "Nom de l'entreprise",
      manualTrade: "Métier / activité",
      manualCity: "Ville",
      manualEmail: "Adresse e-mail",
      popupEmail: "Votre e-mail pour recevoir la démo (facultatif)",
      popupEmailLabel: "E-mail (facultatif)",
      popupPhoneLabel: "Téléphone (facultatif)",
      manualPhone: "Téléphone (facultatif)",
      backToSearch: "Revenir à la recherche Google",
      loadedFromGoogle: "Informations chargées depuis Google Places",
      fieldName: "Nom de l'entreprise",
      fieldSector: "Secteur d'activité",
      sectorPlaceholder: "Choisissez un secteur",
      sectors: [
        "Restauration & traiteur",
        "Coiffure & barbier",
        "Beauté & bien-être",
        "Santé & soins",
        "Artisanat & bâtiment",
        "Commerce & boutique",
        "Hôtellerie & tourisme",
        "Sport & loisirs",
        "Services à la personne",
        "Autre",
      ],
      fieldAddress: "Adresse",
      fieldWebsite: "Site web",
      websitePlaceholder: "https://www.votre-site.fr",
      fieldPhone: "Téléphone",
      reset: "Réinitialiser",
      sending: "Envoi…",
      success: "Merci ! On prépare votre démo — vous recevez le lien sous 7 jours.",
      errorMsg: "Oups, l'envoi a échoué. Réessayez ou appelez-nous.",
      sent: "Demande envoyée",
      reviewsTitle: "Ce que disent vos clients",
      reviewsWord: "avis",
      ratingLabel: "Note Google",
    },
    footer: {
      tagline: "L'atelier qui dessine la vitrine en ligne des commerces de quartier. Une démo à votre nom, puis un site qui travaille pour vous.",
      bookCall: "Réserver un appel",
      demosLabel: "Vitrines de démo",
      studioLabel: "Atelier",
      method: "Notre méthode",
      pricing: "Tarifs",
      faq: "Questions fréquentes",
      rights: "Atelier Vitrine. Conçu à la main, à Paris.",
      legal: "Mentions légales",
      privacy: "Confidentialité",
    },
    notFound: {
      code: "Erreur 404",
      titleLead: "Cette porte ne mène",
      titleAccent: "nulle part.",
      body: "La page que vous cherchez a peut-être déménagé. Revenez à l'accueil ou visitez nos vitrines de démonstration.",
      home: "Retour à l'accueil",
      demos: "Voir les démos",
    },
    demoIndex: {
      back: "Atelier Vitrine",
      devis: "Devis gratuit",
      kicker: "Vitrines de démonstration",
      title: "Quatre portes à pousser.",
      body: "Chaque démo est un site complet, navigable, avec son propre univers. Choisissez le métier le plus proche du vôtre et projetez-vous.",
      visit: "Visiter la vitrine",
    },
    demoCommon: {
      allDemos: "Toutes les démos",
      wantMine: "Je veux la mienne",
      isDemoBanner: "Démonstration : votre vitrine pourrait ressembler à ça",
      navCard: "La carte",
      navPlace: "Le lieu",
      navArtisan: "L'artisan",
      addressLabel: "Adresse",
      hoursLabel: "Horaires",
      phoneLabel: "Téléphone",
      openToday: "Ouvert aujourd'hui",
      servicesIntro: "Ce qu'on vous propose",
      placeKicker: "Le lieu",
      artisanKicker: "L'artisan",
      sheetCaption: "Le même accueil, quel que soit l'angle. Imagerie réalisée sur-mesure pour la vitrine.",
      reviewsTitle: "Ils en parlent mieux que nous",
      footerNote: "Vitrine de démonstration. Le commerce est fictif, le savoir-faire ne l'est pas.",
      createCta: "Créer ma vitrine avec Atelier Vitrine",
      metaSuffix: "Vitrine de démonstration réalisée par Atelier Vitrine.",
      scroll: "Défiler",
    },
  },

  en: {
    htmlLang: "en",
    nav: { metiers: "Trades", methode: "Method", tarifs: "Pricing", faq: "FAQ", devis: "Free quote", home: "home", menu: "Open menu", close: "Close menu" },
    hero: {
      badge: "Website maker for local businesses",
      pitch: "A professional website delivered in 7 days, from €490 — for SMEs and agencies that want a web presence that commands attention.",
      titleLead: "I build the website for your",
      titleAccent: "business.",
      lead: "Design, build and launch of bespoke showcase websites for local artisans and shops. Pick your trade below: you'll see a complete site already designed for you.",
      ctaPrimary: "Pick my trade",
      ctaSecondary: "Request a quote",
      rating: "Rated 4.9/5 by 60+ local business owners",
      chipDemoTitle: "Demo in 7 days",
      chipDemoSub: "in your name, free",
      chipCraftTitle: "100% bespoke",
      chipCraftSub: "never a recycled theme",
      heroAlt: "Web design studio: a small-business website being designed on a laptop",
      scrollHint: "Scroll",
    },
    value: {
      kicker: "What I do",
      title: "One person, from design to launch.",
      body: "I design, write, build and host your website. No layered agency, no jargon: you talk to the person who actually makes your site, and you see it live before you commit.",
      figures: [
        { n: "75%", l: "of customers judge a business's credibility first by its website." },
        { n: "2.6×", l: "more enquiries with a polished site than with a plain listing." },
        { n: "7 d", l: "on average to see your demo live, in your own name." },
      ],
    },
    audience: {
      kicker: "Who's it for?",
      title: "Built for those ready to step up.",
      body: "Recognise your situation? We're made to work together. Ageing site, no site, or a full redesign: we handle everything.",
      items: [
        { n: "1", t: "SMEs & small businesses", d: "Your business is doing well, but your site no longer reflects where you are today." },
        { n: "2", t: "Artisans", d: "Word of mouth is great, but you lose customers who can't find you online." },
        { n: "3", t: "Agencies", d: "Plenty of expertise, few inbound leads? A site that showcases your services and attracts the right clients." },
        { n: "4", t: "Freelancers", d: "You're launching or starting fresh with a site that sells." },
      ],
    },
    metiers: {
      kicker: "Pick your trade",
      title: "Your trade has its own site. Click to see the whole thing.",
      body: "Every trade has its own codes, photos and key moments. Here is a complete, navigable site designed for each one. Find yours and picture it.",
      highlight: {
        barbershop: "Online booking",
        onglerie: "24/7 appointment booking",
        traiteur: "Order platters online",
        restaurant: "Table booking + menu",
        plombier: "Online quote requests",
      },
      example: "Example:",
      seePage: "See the page",
      notListed: "Your trade isn't listed?",
      talk: "Let's talk",
      cardAlt: (trade, business) => `Website for ${trade.toLowerCase()} (example: ${business})`,
    },
    included: {
      kicker: "What's included",
      title: "Everything to open, nothing to manage alone.",
      items: [
        { t: "Bespoke design", d: "A look crafted for your trade: colours, typography, photography. Never a recycled theme." },
        { t: "Complete showcase", d: "Home, services, gallery, reviews, directions and contact. Everything a customer wants before visiting." },
        { t: "Built-in booking", d: "Appointments, click & collect or a quote form, wired to the tool that fits your activity." },
        { t: "Local visibility", d: "Optimised for neighbourhood search and synced with your Google Business profile." },
        { t: "Care and edits", d: "Hours, prices, photos: we adjust together. One edit included every month." },
        { t: "Fast launch", d: "Hosting, domain name, security and performance handled end to end." },
      ],
    },
    method: {
      kicker: "The method",
      title: "Four steps, zero jargon.",
      steps: [
        { n: "1", t: "We talk", d: "A 20-minute call to understand your trade, your customers and what you want." },
        { n: "2", t: "I design the demo", d: "I create your site in your name, photos and copy included, and send it to you live." },
        { n: "3", t: "You adjust", d: "You visit, you comment. I refine it until it truly feels like you." },
        { n: "4", t: "Go live", d: "Domain, hosting, Google: I handle it all. You open your showcase." },
      ],
    },
    pricing: {
      kicker: "Pricing",
      title: "A clear price, stated before we start.",
      body: "A one-off build, then a simple subscription for hosting and care. No hidden lock-in.",
      mostChosen: "Most chosen",
      plans: [
        { name: "Essential", price: "€490", sub: "+ €49/mo", featured: false, feats: ["Express audit of your online presence", "Polished one-page showcase", "Photos and copy written for you", "Basic local SEO + Google listing", "1 round of revisions", "Mobile and performance optimised", "Delivered in 7 days"], cta: "Get started" },
        { name: "Studio", price: "€990", sub: "+ €49/mo", featured: true, feats: ["Full audit of your business", "Multi-page showcase (up to 5 pages)", "Bespoke design mockup", "Built-in booking or click & collect", "Advanced local SEO + performance tracking", "3 rounds of revisions", "1 edit included / month", "Delivered in 7 days"], cta: "Choose Studio" },
        { name: "Signature", price: "On request", sub: "dedicated project", featured: false, feats: ["Everything in Studio included", "Fully bespoke build, no page limit", "Advanced features (shop, member area)", "Unlimited rounds of revisions", "Dedicated priority support", "Delivered in 7 days"], cta: "Talk to me" },
      ],
    },
    addons: {
      kicker: "Add-ons for your package",
      title: "Tailor your offer",
      body: "Add only what you need, nothing else. (Cannot be sold on its own — it complements a package.)",
      note: "* Serenity Pack: maintenance, backups and priority support for 6 months.",
      items: [
        { name: "Extra page", price: "€450 / page" },
        { name: "Custom logo", price: "€350" },
        { name: "Full visual identity", price: "€890" },
        { name: "Copywriting", price: "€350" },
        { name: "Built-in blog + 3 articles", price: "€490" },
        { name: "Webflow tutorial videos", price: "€190" },
        { name: "3D visual", price: "On request" },
        { name: "3D animation", price: "On request" },
        { name: "Serenity Pack 6 months*", price: "€490" },
      ],
    },
    checkout: {
      redirecting: "Redirecting…",
      errorMsg: "Payment is temporarily unavailable. Please retry or contact us.",
      successBanner: "✓ Payment confirmed — thank you! We're opening your file and will reach out shortly.",
      canceledBanner: "Payment canceled. You can try again whenever you like.",
      subName: "Showcase subscription",
      subDesc: "Maintenance, hosting and support — {months} months",
      feeName: "Setup — plan",
      feeDesc: "Installation, file opening, system infrastructure and design creation (one-time payment)",
    },
    testimonials: {
      kicker: "They trusted me",
      title: "Local businesses that finally have a site that looks like them.",
      body: "Barbers, restaurateurs, makers: here's what they say about their showcase and working together.",
      items: [
        { text: "Within a week I had a demo in my name. Clients now book online and I spend far less time on the phone.", image: "https://randomuser.me/api/portraits/men/32.jpg", name: "Karim Benali", role: "Barber · Lyon" },
        { text: "My salon finally has a site that looks like it. Elegant, fast, and the photos are gorgeous. I gained credibility.", image: "https://randomuser.me/api/portraits/women/44.jpg", name: "Léa Moreau", role: "Nail salon · Bordeaux" },
        { text: "Click & collect changed my days. Orders come in the morning, everything's ready by noon. A real time-saver.", image: "https://randomuser.me/api/portraits/men/52.jpg", name: "Julien Pasquier", role: "Caterer · Nantes" },
        { text: "One contact from start to finish, zero jargon. I watched the site take shape and signed off with confidence.", image: "https://randomuser.me/api/portraits/women/68.jpg", name: "Nadia Séverin", role: "Restaurant · Paris" },
        { text: "The result went beyond what I imagined. My local SEO took off and I get more calls than before.", image: "https://randomuser.me/api/portraits/men/76.jpg", name: "Thomas Lefèvre", role: "Garage · Toulouse" },
        { text: "Everything is clear: a stated price, a free demo, then going live. I recommend it to every local business.", image: "https://randomuser.me/api/portraits/women/90.jpg", name: "Margaux Tessier", role: "Florist · Lille" },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "What people often ask me.",
      items: [
        { q: "How long until my site is live?", a: "Between 7 and 15 days for a complete showcase. We start with a demo in your name: you approve it, we launch it. You never wait months with nothing to see." },
        { q: "I have no logo, photos or copy. Is that a problem?", a: "No. We generate a bespoke visual world (like the demos on this site), write your copy and frame your photos. If you already have assets, we use them." },
        { q: "Will I be able to edit the site myself?", a: "Yes. You get a simple login to change hours, prices, photos and news. For the rest, one edit is included every month in the Studio plan." },
        { q: "Can customers book or order online?", a: "Yes. Appointments, click & collect, quote forms, an orderable menu: we plug in the tool that fits your trade, with no hidden commission." },
        { q: "What about Google ranking?", a: "Every site is optimised for local search (listing, neighbourhood keywords, speed, mobile). The goal: that people find you when they search your trade nearby." },
        { q: "What does it really cost?", a: "From €499 for the essential showcase, then a clear subscription for hosting and care. No surprise quote: the price is stated before we start." },
      ],
    },
    cta: {
      title: "I'll prepare a demo for you. Free, in your name.",
      body: "Tell me your trade and your city. Within 7 days you receive the link to a showcase designed for you. Then you decide, with all the facts.",
      primary: "Request my free demo",
      secondary: "Call me",
    },
    demoSearch: {
      label: "Find your business",
      placeholder: "Your business name, e.g. “Martin Bakery”",
      hint: "Type your business name: we'll find it on Google to prepare your demo.",
      searching: "Searching…",
      noResults: "No business found. Try the exact name.",
      foundLabel: "We found your business:",
      change: "Change",
      submit: "Request my free demo",
      emailSubject: "Free demo request",
      emailIntro: "Hello,\n\nI'd like to receive a free demo for my business:",
      emailOutro: "Thanks in advance!",
      cantFind: "I can't find my business",
      manualTitle: "Tell us about your business",
      manualName: "Business name",
      manualTrade: "Trade / activity",
      manualCity: "City",
      manualEmail: "Email address",
      popupEmail: "Your email to receive the demo (optional)",
      popupEmailLabel: "Email (optional)",
      popupPhoneLabel: "Phone (optional)",
      manualPhone: "Phone (optional)",
      backToSearch: "Back to Google search",
      loadedFromGoogle: "Information loaded from Google Places",
      fieldName: "Business name",
      fieldSector: "Business sector",
      sectorPlaceholder: "Choose a sector",
      sectors: [
        "Food & catering",
        "Hair & barbering",
        "Beauty & wellness",
        "Health & care",
        "Trades & construction",
        "Retail & shops",
        "Hospitality & tourism",
        "Sports & leisure",
        "Personal services",
        "Other",
      ],
      fieldAddress: "Address",
      fieldWebsite: "Website",
      websitePlaceholder: "https://www.your-site.com",
      fieldPhone: "Phone",
      reset: "Reset",
      sending: "Sending…",
      success: "Thanks! We're preparing your demo — you'll get the link within 7 days.",
      errorMsg: "Oops, sending failed. Try again or call us.",
      sent: "Request sent",
      reviewsTitle: "What your customers say",
      reviewsWord: "reviews",
      ratingLabel: "Google rating",
    },
    footer: {
      tagline: "The studio that designs the online showcase of neighbourhood businesses. A demo in your name, then a site that works for you.",
      bookCall: "Book a call",
      demosLabel: "Demo sites",
      studioLabel: "Studio",
      method: "My method",
      pricing: "Pricing",
      faq: "FAQ",
      rights: "Atelier Vitrine. Handcrafted in Paris.",
      legal: "Legal notice",
      privacy: "Privacy",
    },
    notFound: {
      code: "Error 404",
      titleLead: "This door leads",
      titleAccent: "nowhere.",
      body: "The page you're looking for may have moved. Head back home or visit our demo showcases.",
      home: "Back home",
      demos: "See the demos",
    },
    demoIndex: {
      back: "Atelier Vitrine",
      devis: "Free quote",
      kicker: "Demo showcases",
      title: "Four doors to open.",
      body: "Each demo is a complete, navigable site with its own visual world. Pick the trade closest to yours and picture it.",
      visit: "Visit the showcase",
    },
    demoCommon: {
      allDemos: "All demos",
      wantMine: "I want mine",
      isDemoBanner: "Demo: your site could look like this",
      navCard: "Menu",
      navPlace: "The place",
      navArtisan: "The artisan",
      addressLabel: "Address",
      hoursLabel: "Hours",
      phoneLabel: "Phone",
      openToday: "Open today",
      servicesIntro: "What we offer",
      placeKicker: "The place",
      artisanKicker: "The artisan",
      sheetCaption: "The same welcome, from every angle. Imagery crafted bespoke for the showcase.",
      reviewsTitle: "They say it better than we do",
      footerNote: "Demo showcase. The business is fictional, the craft is not.",
      createCta: "Build my showcase with Atelier Vitrine",
      metaSuffix: "Demo showcase made by Atelier Vitrine.",
      scroll: "Scroll",
    },
  },
};
