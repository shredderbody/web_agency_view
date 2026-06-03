"use client";
import { motion } from "motion/react";
import Reveal from "@/components/Reveal";
import { useLang } from "@/lib/lang-context";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";

const LABELS = {
  fr: {
    kicker: "Témoignages",
    title: "Ce que disent leurs clients",
    body: "Chaque vitrine créée, c'est une boutique qui tourne mieux. Voici ce qu'en disent leurs clients.",
  },
  en: {
    kicker: "Testimonials",
    title: "What their customers say",
    body: "Every storefront we build makes a business run better. Here's what their customers say.",
  },
};

const TESTIMONIALS: Record<"fr" | "en", Testimonial[]> = {
  fr: [
    /* — Barbier — */
    {
      text: "La prise de RDV depuis le site, c'est bluffant. Je réserve en 30 secondes entre deux appels.",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      name: "Marc D.",
      role: "Client · Barbier",
    },
    {
      text: "Le site donne envie — sobre, professionnel, à l'image de la boutique. Mes amis le trouvent facilement.",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
      name: "Thomas R.",
      role: "Habitué · Maison Brutus",
    },
    {
      text: "Avant j'appelais trois fois avant d'avoir un créneau. Maintenant je réserve en ligne, c'est réglé.",
      image: "https://randomuser.me/api/portraits/men/18.jpg",
      name: "Julien M.",
      role: "Client régulier · Barbier",
    },
    {
      text: "Maison Brutus m'a converti à la boutique. Le site m'a donné envie de pousser la porte la première fois.",
      image: "https://randomuser.me/api/portraits/men/27.jpg",
      name: "Karim B.",
      role: "Nouveau client · Barbier",
    },
    {
      text: "Un site qui respire le soin et le détail — exactement comme la coupe qu'on y reçoit.",
      image: "https://randomuser.me/api/portraits/men/53.jpg",
      name: "Romain L.",
      role: "Client · Maison Brutus",
    },
    /* — Onglerie — */
    {
      text: "Le portfolio d'ongles avant de choisir mon modèle, c'est génial. J'arrive avec une idée précise.",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      name: "Sophie M.",
      role: "Cliente · Onglerie",
    },
    {
      text: "Le site est aussi soigné que l'atelier. On se sent bichonnée avant même d'être arrivée.",
      image: "https://randomuser.me/api/portraits/women/23.jpg",
      name: "Camille B.",
      role: "Cliente · L'Atelier Rosé",
    },
    {
      text: "Réserver à 23h depuis mon canapé sans appeler le lendemain — c'est exactement ce qu'il me fallait.",
      image: "https://randomuser.me/api/portraits/women/67.jpg",
      name: "Léa V.",
      role: "Cliente · Onglerie",
    },
    {
      text: "J'offre des bons cadeaux depuis le site. C'est bien présenté et mes amies adorent.",
      image: "https://randomuser.me/api/portraits/women/36.jpg",
      name: "Nathalie P.",
      role: "Cliente · L'Atelier Rosé",
    },
    {
      text: "Les photos des réalisations avant de réserver, ça change tout. On sait exactement dans quoi on s'engage.",
      image: "https://randomuser.me/api/portraits/women/81.jpg",
      name: "Emma R.",
      role: "Cliente · Onglerie",
    },
    /* — Traiteur — */
    {
      text: "40 couverts commandés en ligne en dix minutes. Sans erreur, sans téléphone. C'est rare.",
      image: "https://randomuser.me/api/portraits/women/55.jpg",
      name: "Isabelle G.",
      role: "Responsable événements · Traiteur",
    },
    {
      text: "Les tarifs sur la carte en ligne, clairs et nets — j'ai tout commandé sans décrocher le téléphone.",
      image: "https://randomuser.me/api/portraits/men/62.jpg",
      name: "Pierre M.",
      role: "Client · Maison Ferrand",
    },
    {
      text: "J'ai découvert Maison Ferrand sur le web. Le site suffit à comprendre le savoir-faire. J'ai commandé le lendemain.",
      image: "https://randomuser.me/api/portraits/women/58.jpg",
      name: "Agathe L.",
      role: "Cliente · Traiteur",
    },
    {
      text: "La commande de fêtes en ligne avec le récap détaillé par e-mail — un service aussi carré, c'est rare.",
      image: "https://randomuser.me/api/portraits/men/71.jpg",
      name: "Jean-Paul V.",
      role: "Organisateur · Maison Ferrand",
    },
    /* — Restaurant — */
    {
      text: "Un menu lisible sur téléphone, une réservation en deux clics. Le Comptoir 12 l'a bien compris.",
      image: "https://randomuser.me/api/portraits/women/12.jpg",
      name: "Julie C.",
      role: "Cliente fidèle · Restaurant",
    },
    {
      text: "La carte des vins consultable en avance, c'est un vrai plus. J'arrive préparé et je profite encore plus.",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      name: "Sébastien D.",
      role: "Client · Le Comptoir 12",
    },
    {
      text: "On a fêté notre anniversaire au Comptoir 12. La réservation depuis le site, impeccable du début à la fin.",
      image: "https://randomuser.me/api/portraits/women/78.jpg",
      name: "Valérie R.",
      role: "Cliente · Restaurant",
    },
  ],
  en: [
    /* — Barbershop — */
    {
      text: "Online booking in 30 seconds — I do it between calls. Honestly a game-changer.",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      name: "Marc D.",
      role: "Customer · Barbershop",
    },
    {
      text: "The site feels just like the shop: clean, confident, no-nonsense. My friends find it easily.",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
      name: "Thomas R.",
      role: "Regular · Maison Brutus",
    },
    {
      text: "Used to call three times before getting a slot. Now I book online and it's done.",
      image: "https://randomuser.me/api/portraits/men/18.jpg",
      name: "Julian M.",
      role: "Regular Customer · Barbershop",
    },
    {
      text: "Maison Brutus converted me to in-shop cuts. The website made me walk through the door the first time.",
      image: "https://randomuser.me/api/portraits/men/27.jpg",
      name: "Karim B.",
      role: "New Customer · Barbershop",
    },
    {
      text: "A site that breathes the same care and detail as the cut you get there.",
      image: "https://randomuser.me/api/portraits/men/53.jpg",
      name: "Romain L.",
      role: "Customer · Maison Brutus",
    },
    /* — Nail Salon — */
    {
      text: "The nail art gallery before I even choose — amazing. I arrive knowing exactly what I want.",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      name: "Sophie M.",
      role: "Customer · Nail Salon",
    },
    {
      text: "The website is as polished as the salon itself. Instantly reassuring before you even walk in.",
      image: "https://randomuser.me/api/portraits/women/23.jpg",
      name: "Camille B.",
      role: "Customer · L'Atelier Rosé",
    },
    {
      text: "Booking at 11pm from my sofa without calling the next morning — exactly what I needed.",
      image: "https://randomuser.me/api/portraits/women/67.jpg",
      name: "Léa V.",
      role: "Customer · Nail Salon",
    },
    {
      text: "I buy gift vouchers straight from the website. Well presented — my friends love them.",
      image: "https://randomuser.me/api/portraits/women/36.jpg",
      name: "Nathalie P.",
      role: "Customer · L'Atelier Rosé",
    },
    {
      text: "Seeing photos of past work before booking changes everything. You know what you're getting.",
      image: "https://randomuser.me/api/portraits/women/81.jpg",
      name: "Emma R.",
      role: "Customer · Nail Salon",
    },
    /* — Deli / Caterer — */
    {
      text: "40 guests ordered online in ten minutes. Flawless — no phone calls needed.",
      image: "https://randomuser.me/api/portraits/women/55.jpg",
      name: "Isabelle G.",
      role: "Events Manager · Deli",
    },
    {
      text: "Prices right there on the online menu, crystal clear — I ordered without picking up the phone.",
      image: "https://randomuser.me/api/portraits/men/62.jpg",
      name: "Pierre M.",
      role: "Customer · Maison Ferrand",
    },
    {
      text: "I discovered Maison Ferrand online. The site alone conveys the craft. I ordered the next day.",
      image: "https://randomuser.me/api/portraits/women/58.jpg",
      name: "Agathe L.",
      role: "Customer · Deli",
    },
    {
      text: "Party orders online with a detailed email summary — this level of organisation is rare.",
      image: "https://randomuser.me/api/portraits/men/71.jpg",
      name: "Jean-Paul V.",
      role: "Event Organiser · Maison Ferrand",
    },
    /* — Restaurant — */
    {
      text: "A readable mobile menu and a table booking in two taps. Le Comptoir 12 gets it.",
      image: "https://randomuser.me/api/portraits/women/12.jpg",
      name: "Julie C.",
      role: "Regular · Restaurant",
    },
    {
      text: "Checking the wine list in advance is a real bonus. I arrive prepared and enjoy the meal even more.",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      name: "Sébastien D.",
      role: "Customer · Le Comptoir 12",
    },
    {
      text: "We celebrated our anniversary at Le Comptoir 12. Booking through the website was seamless start to finish.",
      image: "https://randomuser.me/api/portraits/women/78.jpg",
      name: "Valérie R.",
      role: "Customer · Restaurant",
    },
  ],
};

export default function Testimonials() {
  const { lang } = useLang();
  const labels = LABELS[lang];
  const testimonials = TESTIMONIALS[lang];

  const col1 = testimonials.slice(0, 6);
  const col2 = testimonials.slice(6, 12);
  const col3 = testimonials.slice(12, 17);

  return (
    <section style={{ paddingBlock: "clamp(3.5rem, 7vw, 6rem)", background: "var(--paper)" }}>
      <div className="wrap">
        <Reveal>
          <div style={{ maxWidth: "54ch", marginBottom: "clamp(2.2rem, 5vw, 3.5rem)" }}>
            <span className="kicker" style={{ marginBottom: "1.1rem" }}>{labels.kicker}</span>
            <h2 className="d-xl" style={{ margin: "0 0 1rem" }}>{labels.title}</h2>
            <p style={{ fontSize: "1.08rem", color: "var(--ink-dim)", margin: 0 }}>{labels.body}</p>
          </div>
        </Reveal>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex justify-center gap-5"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
            maxHeight: "680px",
            overflow: "hidden",
          }}
        >
          <TestimonialsColumn testimonials={col1} duration={16} />
          <TestimonialsColumn
            testimonials={col2}
            duration={20}
            className="hidden md:block"
          />
          <TestimonialsColumn
            testimonials={col3}
            duration={18}
            className="hidden lg:block"
          />
        </motion.div>
      </div>
    </section>
  );
}
