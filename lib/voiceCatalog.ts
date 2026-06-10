// Catalogue des voix vocales (ElevenLabs en priorité, Cartesia / MiniMax en
// alternative légère pour les voix mono-langue).
//
// Règle de sélection :
// - Le client demande 1 SEULE langue   -> on prend une voix "mono" dans cette
//   langue. Si un équivalent Cartesia/MiniMax existe pour cette voix (champ
//   `fallback`), on le privilégie : moteur plus léger, latence plus faible,
//   moins cher. Sinon on reste sur ElevenLabs avec un modèle rapide
//   (eleven_flash_v2_5).
// - Le client demande PLUSIEURS langues -> on prend une voix "multilingual"
//   qui couvre toutes les langues demandées, avec un modèle multilingue
//   ElevenLabs (eleven_flash_v2_5 par défaut, eleven_multilingual_v2 si on
//   privilégie la qualité à la latence).

export type VoiceProvider = "11labs" | "cartesia" | "minimax";

export type VoiceMode = "multilingual" | "mono";

export interface VoiceFallback {
  provider: VoiceProvider;
  voiceId: string;
  model: string;
}

export interface VoiceCatalogEntry {
  /** Identifiant interne lisible. */
  id: string;
  /** ID de la voix chez le provider principal. */
  voiceId: string;
  provider: VoiceProvider;
  name: string;
  gender: "female" | "male";
  ageGroup?: string;
  mode: VoiceMode;
  /** Codes ISO 639-1. */
  languages: string[];
  /** Modèle/moteur recommandé pour ce voiceId chez `provider`. */
  model: string;
  /**
   * Alternative plus légère/rapide pour une voix mono-langue (Cartesia ou
   * MiniMax). Renseigner `voiceId` une fois la voix équivalente créée chez ce
   * provider — tant qu'il est vide, le fallback est ignoré.
   */
  fallback?: VoiceFallback;
}

export const VOICE_CATALOG: VoiceCatalogEntry[] = [
  {
    id: "elevenlabs-female-multi-middle-age",
    voiceId: "MNKK2Wl2wbbsEPQTHZGt",
    provider: "11labs",
    name: "Voix féminine multilingue (âge moyen)",
    gender: "female",
    ageGroup: "middle-aged",
    mode: "multilingual",
    languages: ["fr", "de", "es", "it", "pt", "ru"],
    model: "eleven_flash_v2_5",
  },
  {
    id: "elevenlabs-female-fr",
    voiceId: "YxrwjAKoUKULGd0g8K9Y",
    provider: "11labs",
    name: "Voix féminine FR uniquement",
    gender: "female",
    mode: "mono",
    languages: ["fr"],
    model: "eleven_flash_v2_5",
    fallback: {
      provider: "cartesia",
      voiceId: "",
      model: "sonic-2",
    },
  },
  {
    id: "elevenlabs-male-fr",
    voiceId: "1EmYoP3UnnnwhlJKovEy",
    provider: "11labs",
    name: "Voix masculine FR uniquement",
    gender: "male",
    mode: "mono",
    languages: ["fr"],
    model: "eleven_flash_v2_5",
    fallback: {
      provider: "cartesia",
      voiceId: "",
      model: "sonic-2",
    },
  },
];

export interface VoiceSelection {
  entry: VoiceCatalogEntry;
  provider: VoiceProvider;
  voiceId: string;
  model: string;
}

/**
 * Sélectionne la meilleure voix du catalogue pour les langues demandées.
 *
 * - 1 langue   -> voix mono dans cette langue (fallback Cartesia/MiniMax si
 *   renseigné), sinon voix multilingue couvrant cette langue.
 * - N langues  -> voix multilingue couvrant toutes les langues demandées
 *   (à défaut, celle qui en couvre le plus).
 */
export function selectVoice(
  requestedLanguages: string[],
  opts: { gender?: "female" | "male" } = {}
): VoiceSelection | null {
  const langs = [...new Set(requestedLanguages.map((l) => l.toLowerCase()))];
  const candidates = opts.gender
    ? VOICE_CATALOG.filter((v) => v.gender === opts.gender)
    : VOICE_CATALOG;

  if (langs.length === 1) {
    const [lang] = langs;

    const mono = candidates.find(
      (v) => v.mode === "mono" && v.languages.includes(lang)
    );
    if (mono) {
      if (mono.fallback?.voiceId) {
        return {
          entry: mono,
          provider: mono.fallback.provider,
          voiceId: mono.fallback.voiceId,
          model: mono.fallback.model,
        };
      }
      return { entry: mono, provider: mono.provider, voiceId: mono.voiceId, model: mono.model };
    }

    const multi = candidates.find(
      (v) => v.mode === "multilingual" && v.languages.includes(lang)
    );
    if (multi) {
      return { entry: multi, provider: multi.provider, voiceId: multi.voiceId, model: multi.model };
    }

    return null;
  }

  // Plusieurs langues : voix multilingue couvrant tout, sinon le meilleur recouvrement.
  const fullMatch = candidates.find(
    (v) => v.mode === "multilingual" && langs.every((l) => v.languages.includes(l))
  );
  if (fullMatch) {
    return { entry: fullMatch, provider: fullMatch.provider, voiceId: fullMatch.voiceId, model: fullMatch.model };
  }

  const multilingualVoices = candidates.filter((v) => v.mode === "multilingual");
  if (multilingualVoices.length === 0) return null;

  const best = multilingualVoices.reduce((best, v) => {
    const overlap = v.languages.filter((l) => langs.includes(l)).length;
    const bestOverlap = best.languages.filter((l) => langs.includes(l)).length;
    return overlap > bestOverlap ? v : best;
  });

  return { entry: best, provider: best.provider, voiceId: best.voiceId, model: best.model };
}
