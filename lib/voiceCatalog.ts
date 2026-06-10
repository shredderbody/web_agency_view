// Catalogue des voix vocales utilisées par les assistants Vapi (ElevenLabs,
// Cartesia, MiniMax) — compilé depuis vapi_export/assistants/*.json et
// VAPI_PLAYBOOK.md.
//
// Règle de sélection (`selectVoice`) :
// - Le client demande 1 SEULE langue   -> on prend une voix "mono" dans cette
//   langue, en priorisant Cartesia/MiniMax (moteur plus léger, latence plus
//   faible, moins cher) avant une voix ElevenLabs équivalente.
// - Le client demande PLUSIEURS langues -> on prend une voix "multilingual"
//   qui couvre toutes les langues demandées (à défaut, celle qui en couvre le
//   plus).
//
// `fallbackPlan` reflète le `fallbackPlan.voices[0]` de Vapi (bascule en cas
// d'indisponibilité du provider principal) — ce n'est PAS un mécanisme de
// sélection par langue.

export type VoiceProvider = "11labs" | "cartesia" | "minimax";

export type VoiceMode = "multilingual" | "mono";

export interface VoiceFallbackPlan {
  provider: VoiceProvider;
  model: string;
  voiceId: string;
}

export interface VoiceCatalogEntry {
  /** Identifiant interne lisible. */
  id: string;
  voiceId: string;
  provider: VoiceProvider;
  /** Modèle/moteur Vapi pour ce voiceId chez `provider`. */
  model: string;
  name: string;
  gender?: "female" | "male";
  ageGroup?: string;
  mode: VoiceMode;
  /** Codes ISO 639-1. */
  languages: string[];
  /** Bascule de résilience Vapi (provider TTS de secours), pas un critère de sélection. */
  fallbackPlan?: VoiceFallbackPlan;
  notes?: string;
}

export const VOICE_CATALOG: VoiceCatalogEntry[] = [
  {
    id: "fr-mono-minimax-journalist",
    voiceId: "French_Female Journalist",
    provider: "minimax",
    model: "speech-02-turbo",
    name: "French Female Journalist (MiniMax)",
    gender: "female",
    mode: "mono",
    languages: ["fr"],
    fallbackPlan: { provider: "cartesia", model: "sonic-2", voiceId: "65b25c5d-ff07-4687-a04c-da2f43ef6fa9" },
    notes: "Profil FR par défaut (VAPI_PLAYBOOK §2.A) — utilisé par la majorité des assistants receptionist FR.",
  },
  {
    id: "fr-mono-elevenlabs-female",
    voiceId: "YxrwjAKoUKULGd0g8K9Y",
    provider: "11labs",
    model: "eleven_flash_v2_5",
    name: "Voix féminine FR (ElevenLabs)",
    gender: "female",
    mode: "mono",
    languages: ["fr"],
    fallbackPlan: { provider: "cartesia", model: "sonic-2", voiceId: "a249eaff-1e96-4d2c-b23b-12efa4f66f41" },
    notes: "Pas encore utilisée dans un assistant. En mono-langue FR, l'entrée MiniMax ci-dessus est priorisée (moteur plus léger).",
  },
  {
    id: "fr-mono-elevenlabs-male",
    voiceId: "1EmYoP3UnnnwhlJKovEy",
    provider: "11labs",
    model: "eleven_flash_v2_5",
    name: "Voix masculine FR (ElevenLabs)",
    gender: "male",
    mode: "mono",
    languages: ["fr"],
    fallbackPlan: { provider: "cartesia", model: "sonic-2", voiceId: "a249eaff-1e96-4d2c-b23b-12efa4f66f41" },
    notes: "Pas encore utilisée dans un assistant. Pas d'équivalent Cartesia/MiniMax masculin FR identifié pour l'instant.",
  },
  {
    id: "en-es-multilingual-cartesia",
    voiceId: "57dcab65-68ac-45a6-8480-6c4c52ec1cd1",
    provider: "cartesia",
    model: "sonic-multilingual",
    name: "Cartesia Sonic Multilingual (EN/ES)",
    mode: "multilingual",
    languages: ["en", "es"],
    fallbackPlan: { provider: "cartesia", model: "sonic-2", voiceId: "a249eaff-1e96-4d2c-b23b-12efa4f66f41" },
    notes: "Profil EN par défaut (VAPI_PLAYBOOK §2.B) — ex. DEV - Receptionist - Altifluence - Cart.",
  },
  {
    id: "en-es-multilingual-elevenlabs",
    voiceId: "FUfBrNit0NNZAwb58KWH",
    provider: "11labs",
    model: "eleven_multilingual_v2",
    name: "ElevenLabs Multilingual (Altifluence)",
    mode: "multilingual",
    languages: ["en", "es"],
    fallbackPlan: { provider: "11labs", model: "eleven_multilingual_v2", voiceId: "FUfBrNit0NNZAwb58KWH" },
    notes: "Profil MULTI (VAPI_PLAYBOOK §2.C) — ex. DEV - Receptionist - Altifluence - 11Lab.",
  },
  {
    id: "multi-elevenlabs-female-middle-age",
    voiceId: "MNKK2Wl2wbbsEPQTHZGt",
    provider: "11labs",
    model: "eleven_flash_v2_5",
    name: "Voix féminine multilingue, âge moyen (ElevenLabs)",
    gender: "female",
    ageGroup: "middle-aged",
    mode: "multilingual",
    languages: ["en", "fr", "de", "es", "it", "pt", "ru"],
    fallbackPlan: { provider: "cartesia", model: "sonic-2", voiceId: "65b25c5d-ff07-4687-a04c-da2f43ef6fa9" },
    notes: "Utilisée par EN - Receptionist/Leads ZeroCall Lovable, Lead Qualifier, Riley.",
  },
  {
    id: "en-mono-elevenlabs-beaute",
    voiceId: "WQKwBV2Uzw1gSGr69N8I",
    provider: "11labs",
    model: "eleven_flash_v2_5",
    name: "Voix EN (ElevenLabs) — démos Beauté",
    mode: "mono",
    languages: ["en"],
    fallbackPlan: { provider: "cartesia", model: "sonic-2", voiceId: "a249eaff-1e96-4d2c-b23b-12efa4f66f41" },
    notes: "DEV - Receptionist - Beauté - Nailz / URSS.",
  },
  {
    id: "en-mono-elevenlabs-fallback-leadqualifier",
    voiceId: "kdmDKE6EkgrWrrykO9Qt",
    provider: "11labs",
    model: "eleven_flash_v2_5",
    name: "Voix EN (ElevenLabs) — fallback Lead Qualifier",
    mode: "mono",
    languages: ["en"],
    notes: "Référencée uniquement comme fallbackPlan de la voix multilingue ci-dessus dans 'Lead Qualifier'.",
  },
];

/**
 * Sélectionne la meilleure voix du catalogue pour les langues demandées.
 *
 * - 1 langue   -> voix mono dans cette langue, Cartesia/MiniMax priorisés sur
 *   ElevenLabs (moteur plus léger/rapide pour une langue unique).
 * - N langues  -> voix multilingue couvrant toutes les langues demandées
 *   (à défaut, celle qui en couvre le plus).
 */
export function selectVoice(
  requestedLanguages: string[],
  opts: { gender?: "female" | "male" } = {}
): VoiceCatalogEntry | null {
  const langs = [...new Set(requestedLanguages.map((l) => l.toLowerCase()))];
  const candidates = opts.gender
    ? VOICE_CATALOG.filter((v) => !v.gender || v.gender === opts.gender)
    : VOICE_CATALOG;

  if (langs.length === 1) {
    const [lang] = langs;
    const monoCandidates = candidates.filter((v) => v.mode === "mono" && v.languages.includes(lang));

    const lighter = monoCandidates.find((v) => v.provider !== "11labs");
    if (lighter) return lighter;
    if (monoCandidates[0]) return monoCandidates[0];

    return candidates.find((v) => v.mode === "multilingual" && v.languages.includes(lang)) ?? null;
  }

  // Plusieurs langues : voix multilingue couvrant tout, sinon le meilleur recouvrement.
  const multilingualVoices = candidates.filter((v) => v.mode === "multilingual");

  const fullMatch = multilingualVoices.find((v) => langs.every((l) => v.languages.includes(l)));
  if (fullMatch) return fullMatch;

  if (multilingualVoices.length === 0) return null;

  return multilingualVoices.reduce((best, v) => {
    const overlap = v.languages.filter((l) => langs.includes(l)).length;
    const bestOverlap = best.languages.filter((l) => langs.includes(l)).length;
    return overlap > bestOverlap ? v : best;
  });
}
