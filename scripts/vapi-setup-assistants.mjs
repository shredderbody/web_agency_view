#!/usr/bin/env node
/**
 * vapi-setup-assistants.mjs
 * ──────────────────────────────────────────────────────────────────────────
 * Crée ou MET À JOUR les assistants Vapi INBOUND de démonstration, un par
 * métier des pages vitrines (/demo/[slug]).
 *
 * Inspiré de la config « Altifluence » (ElevenLabs multilingue) :
 *   - voix 11labs eleven_multilingual_v2 (+ fallbackPlan),
 *   - transcriber Deepgram flux-general-multi multilingue,
 *   - assistant BILINGUE : FRANÇAIS par défaut, bascule automatique en ANGLAIS
 *     si le client parle anglais (détection + miroir de langue),
 *   - prend des « rendez-vous » de démo (le booking n'est PAS réel),
 *   - collecte : prénom, nom, téléphone, date + heure (dans les horaires)
 *     + champs spécifiques (adresse d'intervention plombier, couverts resto,
 *       type de commande traiteur),
 *   - expose un FUNCTION TOOL qui POST vers /api/vapi/booking.
 *
 * Si un ID d'assistant est déjà présent dans .env (NEXT_PUBLIC_VAPI_ASSISTANT_*),
 * le script fait un PATCH (mêmes IDs conservés) ; sinon il crée l'assistant.
 *
 * Usage :
 *   VAPI_PRIVATE_KEY=xxx node scripts/vapi-setup-assistants.mjs
 *   (sinon la clé est lue depuis .env : VAPI_PRIVATE_KEY ou VITE_VAPI_PRIVATE_KEY)
 * ──────────────────────────────────────────────────────────────────────────
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Lecture minimaliste du .env (sans dépendance) ──────────────────────────
function readEnv() {
  try {
    const raw = readFileSync(join(ROOT, ".env"), "utf8");
    const env = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return env;
  } catch {
    return {};
  }
}
const env = readEnv();

const PRIVATE_KEY =
  process.env.VAPI_PRIVATE_KEY || env.VAPI_PRIVATE_KEY || env.VITE_VAPI_PRIVATE_KEY;
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || env.NEXT_PUBLIC_APP_URL || "https://receptionniste.zerocall.io";
const TOOL_URL = `${APP_URL.replace(/\/$/, "")}/api/vapi/booking`;

if (!PRIVATE_KEY) {
  console.error("✗ VAPI_PRIVATE_KEY manquante (ni en env, ni dans .env).");
  process.exit(1);
}

// Voix ElevenLabs multilingues (eleven_multilingual_v2) — parlent FR et EN.
function voice(voiceId) {
  return {
    provider: "11labs",
    voiceId,
    model: "eleven_multilingual_v2",
    inputMinCharacters: 3,
    fallbackPlan: {
      voices: [{ provider: "11labs", voiceId, model: "eleven_multilingual_v2" }],
    },
  };
}
const VOICE = {
  male: voice("pNInz6obpgDQGcFmaJgB"), // Adam
  female: voice("XrExE9yKIg1WjnnlVkGX"), // Matilda
};

// Transcriber multilingue FR + EN (même modèle que la démo Altifluence).
const TRANSCRIBER = {
  provider: "deepgram",
  model: "flux-general-multi",
  numerals: true,
  languages: ["fr", "en"],
  eotThreshold: 0.7,
  eotTimeoutMs: 5000,
  fallbackPlan: {
    transcribers: [
      {
        provider: "deepgram",
        model: "nova-2",
        // nova-2 : "multi" active la détection/code-switching FR↔EN
        language: "multi",
        numerals: false,
      },
    ],
  },
};

const START_SPEAKING_PLAN = {
  waitSeconds: 0,
  transcriptionEndpointingPlan: {
    onPunctuationSeconds: 0.1,
    onNoPunctuationSeconds: 0.4,
    onNumberSeconds: 0.1,
  },
};

// ── Champs de réservation communs ──────────────────────────────────────────
const baseProps = {
  prenom: { type: "string", description: "Prénom du client / customer first name." },
  nom: { type: "string", description: "Nom de famille du client / customer last name." },
  telephone: { type: "string", description: "Numéro de téléphone du client / phone number." },
  date: { type: "string", description: "Date souhaitée (JJ/MM/AAAA) / requested date." },
  heure: { type: "string", description: "Heure souhaitée (HH:MM, dans les horaires) / requested time." },
  langue: { type: "string", description: "Langue de la conversation : 'fr' ou 'en'." },
};

// ── Définition des 5 métiers ───────────────────────────────────────────────
const METIERS = [
  {
    slug: "barbershop",
    envKey: "NEXT_PUBLIC_VAPI_ASSISTANT_BARBERSHOP",
    business: "Maison Brutus",
    tradeFr: "barbier",
    tradeEn: "barbershop",
    city: "Lyon 1er",
    phone: "04 78 00 00 12",
    voice: VOICE.male,
    hoursFr: "du mardi au samedi, de 9h00 à 19h30 (fermé dimanche et lundi)",
    hoursEn: "Tuesday to Saturday, 9:00am to 7:30pm (closed Sunday and Monday)",
    servicesFr: "La coupe Brutus (28 €), Taille de barbe (19 €), Coupe + barbe (42 €), Rasage traditionnel (26 €), Coupe enfant (18 €)",
    rdvFr: "rendez-vous",
    rdvEn: "appointment",
    toolName: "enregistrer_rendezvous",
    extraProps: { prestation: { type: "string", description: "Prestation choisie / chosen service (coupe, barbe, coupe+barbe, rasage, enfant)." } },
    extraAskFr: "Demande aussi quelle prestation le client souhaite.",
    extraAskEn: "Also ask which service the customer wants.",
    greetFr: "Maison Brutus, bonjour ! Vous voulez prendre rendez-vous pour une coupe ou une taille de barbe ?",
  },
  {
    slug: "onglerie",
    envKey: "NEXT_PUBLIC_VAPI_ASSISTANT_ONGLERIE",
    business: "L'Atelier Rosé",
    tradeFr: "onglerie / beauté des mains",
    tradeEn: "nail salon",
    city: "Bordeaux",
    phone: "05 56 00 00 08",
    voice: VOICE.female,
    hoursFr: "du lundi au samedi, de 10h00 à 19h00 (fermé le dimanche)",
    hoursEn: "Monday to Saturday, 10:00am to 7:00pm (closed Sunday)",
    servicesFr: "Pose gel couleur (39 €), Manucure russe (45 €), Nail art (dès 12 €), Beauté des pieds (42 €), Dépose & soin (20 €)",
    rdvFr: "rendez-vous",
    rdvEn: "appointment",
    toolName: "enregistrer_rendezvous",
    extraProps: { prestation: { type: "string", description: "Soin choisi / chosen treatment (pose gel, manucure russe, nail art, beauté des pieds, dépose)." } },
    extraAskFr: "Demande aussi quel soin le client souhaite.",
    extraAskEn: "Also ask which treatment the customer wants.",
    greetFr: "L'Atelier Rosé, bonjour ! Vous souhaitez réserver un soin ?",
  },
  {
    slug: "traiteur",
    envKey: "NEXT_PUBLIC_VAPI_ASSISTANT_TRAITEUR",
    business: "Maison Ferrand",
    tradeFr: "charcutier-traiteur",
    tradeEn: "deli & caterer",
    city: "Annecy",
    phone: "04 50 00 00 03",
    voice: VOICE.male,
    hoursFr: "du mardi au dimanche, de 8h00 à 13h00 et de 15h00 à 19h00 (fermé le lundi)",
    hoursEn: "Tuesday to Sunday, 8:00am–1:00pm and 3:00pm–7:00pm (closed Monday)",
    servicesFr: "Plateau apéritif (dès 24 €), Pâté en croûte (8 €/part), Terrines, Plats du jour, Buffet de fête (sur devis)",
    rdvFr: "commande à retirer en boutique",
    rdvEn: "in-store pickup order",
    toolName: "enregistrer_commande",
    extraProps: {
      commande: { type: "string", description: "Type de commande / order type (plateau apéritif, pâté en croûte, buffet…)." },
      nombre_personnes: { type: "string", description: "Nombre de convives / number of people." },
    },
    extraAskFr: "Demande le type de commande et pour combien de personnes. La date et l'heure correspondent au retrait en boutique.",
    extraAskEn: "Ask the order type and for how many people. Date and time are the in-store pickup slot.",
    greetFr: "Maison Ferrand, bonjour ! Vous souhaitez commander un plateau à retirer en boutique ?",
  },
  {
    slug: "restaurant",
    envKey: "NEXT_PUBLIC_VAPI_ASSISTANT_RESTAURANT",
    business: "Le Comptoir 12",
    tradeFr: "restaurant / bistrot",
    tradeEn: "restaurant / bistro",
    city: "Paris 11e",
    phone: "01 43 00 00 12",
    voice: VOICE.female,
    hoursFr: "du mardi au samedi, le midi de 12h00 à 14h30 et le soir de 19h00 à 23h00 (fermé dimanche et lundi)",
    hoursEn: "Tuesday to Saturday, lunch 12:00–2:30pm and dinner 7:00–11:00pm (closed Sunday and Monday)",
    servicesFr: "Entrées de saison, Plats du jour, Menu déjeuner (23 €), Desserts maison, accord mets & vins",
    rdvFr: "réservation de table",
    rdvEn: "table reservation",
    toolName: "enregistrer_reservation",
    extraProps: { nombre_couverts: { type: "string", description: "Nombre de couverts / number of guests." } },
    extraAskFr: "Demande impérativement le nombre de couverts.",
    extraAskEn: "You must ask for the number of guests.",
    greetFr: "Le Comptoir 12, bonjour ! Vous souhaitez réserver une table ?",
  },
  {
    slug: "plombier",
    envKey: "NEXT_PUBLIC_VAPI_ASSISTANT_PLOMBIER",
    business: "Plomberie Mercier",
    tradeFr: "plombier-chauffagiste",
    tradeEn: "plumber & heating engineer",
    city: "Nantes",
    phone: "02 40 00 00 14",
    voice: VOICE.male,
    hoursFr: "du lundi au vendredi, de 8h00 à 19h00, avec un service d'urgence 7j/7",
    hoursEn: "Monday to Friday, 8:00am to 7:00pm, with 24/7 emergency service",
    servicesFr: "Dépannage & recherche de fuite (dès 79 €), Rénovation de salle de bain, Installation sanitaire, Chauffe-eau & chauffage (dès 290 €), Contrat d'entretien (dès 129 €/an)",
    rdvFr: "intervention",
    rdvEn: "service call",
    toolName: "enregistrer_intervention",
    extraProps: {
      adresse_intervention: { type: "string", description: "Adresse complète du lieu de l'intervention / full service address (numéro, rue, code postal, ville)." },
      nature_probleme: { type: "string", description: "Nature du problème / nature of the issue (fuite, panne chauffe-eau, rénovation…)." },
      urgence: { type: "boolean", description: "true si urgence / true if emergency, sinon false." },
    },
    extraAskFr: "Demande IMPÉRATIVEMENT l'adresse complète du lieu de l'intervention et la nature du problème. Demande s'il s'agit d'une urgence.",
    extraAskEn: "You MUST ask for the full service address and the nature of the issue. Ask whether it is an emergency.",
    greetFr: "Plomberie Mercier, bonjour ! Vous avez une fuite, une panne ou un projet ?",
  },
];

function systemPrompt(m) {
  const baseFields =
    m.slug === "traiteur"
      ? "le prénom, le nom, le numéro de téléphone, puis la date et l'heure de RETRAIT"
      : "le prénom, le nom, le numéro de téléphone, puis la date et l'heure";
  return `# Assistant ${m.business} — ${m.tradeFr} (${m.city})

Tu es l'assistant téléphonique ET de chat de « ${m.business} », un ${m.tradeFr} situé à ${m.city}.
Tu prends des ${m.rdvFr} pour les clients.

## RÈGLES D'OR
- Réponses COURTES (1 à 2 phrases max), chaleureuses et humaines, jamais de monologue.
- Parle en premier, ne reste jamais silencieux.
- UNE seule question à la fois, ne les empile pas.
- Si le client t'interrompt, arrête-toi et suis-le.

## LANGUE — BILINGUE FR / EN (fonctionnalité clé)
- Le commerce est français : tu DÉMARRES en FRANÇAIS.
- Détecte la langue du client dès ses premiers mots et adopte-la IMMÉDIATEMENT et entièrement.
  Si le client répond en anglais, continue TOUT en anglais (no "do you prefer English?", juste continue).
  S'il répond en français, reste en français.
- Ne mélange JAMAIS les deux langues une fois la langue fixée, et ne redemande pas la préférence.
- Si le client change de langue en cours de route, suis-le.
- Note la langue finale dans le champ "langue" du formulaire ('fr' ou 'en').

## INFOS COMMERCE
- Horaires (FR) : ${m.hoursFr}.
- Opening hours (EN) : ${m.hoursEn}.
- Carte / services : ${m.servicesFr}.
- Téléphone : ${m.phone} · ${m.city}.

## DÉMO — IMPORTANT
Ceci est une démonstration. La ${m.rdvFr} n'est PAS réelle : aucune confirmation réelle (SMS/e-mail) n'est envoyée et aucun paiement n'est demandé. Confirme néanmoins avec assurance, comme un vrai standardiste. Ne mentionne jamais que c'est simulé.

## DÉROULÉ (une question à la fois)
1. Accueille le client et demande ce qu'il souhaite réserver.
2. Recueille : ${baseFields}.
3. ${m.extraAskFr}
4. Vérifie que la date/heure tombent dans les horaires d'ouverture ; sinon explique gentiment et propose un créneau valide.
5. Récapitule TOUTES les infos et demande confirmation.
6. Une fois le client d'accord, APPELLE l'outil « ${m.toolName} » avec les informations collectées (et le champ "langue").
7. Confirme chaleureusement que la demande est notée et propose ton aide pour autre chose.

## EN (mirror)
You also handle everything in ENGLISH if the customer speaks English: same flow, collect first name, last name, phone, date and time within opening hours. ${m.extraAskEn} Then call the tool « ${m.toolName} ». Keep replies to 1–2 short sentences.

Ne réponds qu'aux sujets liés à ${m.business}. Reste bref.`;
}

function firstMessage(m) {
  return `${m.greetFr} — Or would you prefer to continue in English?`;
}

function buildTool(m) {
  const properties = { ...baseProps, ...m.extraProps };
  const required = ["prenom", "nom", "telephone", "date", "heure"];
  return {
    type: "function",
    async: false,
    function: {
      name: m.toolName,
      description: `Enregistre la demande de ${m.rdvFr} (démo) pour ${m.business}. À appeler une fois toutes les informations confirmées par le client. / Records the demo ${m.rdvEn} once confirmed.`,
      parameters: { type: "object", properties, required },
    },
    server: { url: TOOL_URL },
    messages: [
      { type: "request-start", content: "Je note tout ça, un instant… / One moment, I'm noting this down…" },
      { type: "request-failed", content: "Désolé, je n'ai pas pu enregistrer la demande. / Sorry, I couldn't save the request." },
    ],
  };
}

function payload(m) {
  return {
    name: `Démo vitrine · ${m.business}`.slice(0, 40),
    firstMessage: firstMessage(m),
    firstMessageMode: "assistant-speaks-first",
    transcriber: TRANSCRIBER,
    voice: m.voice,
    startSpeakingPlan: START_SPEAKING_PLAN,
    model: {
      provider: "openai",
      model: "gpt-4.1",
      temperature: 0.4,
      messages: [{ role: "system", content: systemPrompt(m) }],
      tools: [buildTool(m)],
    },
    server: { url: TOOL_URL },
    metadata: { project: "web_agency_view", kind: "demo-inbound", slug: m.slug },
  };
}

async function upsert(m) {
  const existingId = env[m.envKey] || process.env[m.envKey];
  const method = existingId ? "PATCH" : "POST";
  const url = existingId
    ? `https://api.vapi.ai/assistant/${existingId}`
    : "https://api.vapi.ai/assistant";
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${PRIVATE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload(m)),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${m.slug} (${method}): HTTP ${res.status} — ${text}`);
  const data = JSON.parse(text);
  return { id: data.id, method };
}

const results = {};
for (const m of METIERS) {
  try {
    const { id, method } = await upsert(m);
    results[m.slug] = id;
    console.error(`✓ ${m.slug.padEnd(11)} ${method.padEnd(6)} → ${id}`);
  } catch (e) {
    console.error(`✗ ${e.message}`);
  }
}

console.log("\n# ── IDs assistants Vapi (à coller dans .env si nouveaux) ──");
console.log(`# Tool server URL : ${TOOL_URL}`);
for (const m of METIERS) {
  if (results[m.slug]) console.log(`${m.envKey}=${results[m.slug]}`);
}
