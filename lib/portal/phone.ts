/* ════════════════════════════════════════════════════════════════════════════
   Normalisation des téléphones — clé de dédoublonnage de la fiche client.

   Un client qui dicte « zéro six douze… » à l'assistant, puis « +33 6 12… » la
   fois suivante, doit retomber sur LA MÊME fiche. Sans normalisation, le suivi
   client est un tas de doublons.

   Volontairement simple et sans dépendance : les démos couvrent la France, les
   États-Unis et l'Indonésie. L'indicatif de repli vient du tenant
   (`DemoTenant.dialCode`), pas d'une constante globale — un numéro à 10 chiffres
   commençant par 0 n'est français que si le commerce l'est.
   ════════════════════════════════════════════════════════════════════════════ */

export function normalizePhone(raw: string | null | undefined, dialCode = "+33"): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  const hadPlus = trimmed.startsWith("+") || trimmed.startsWith("00");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 6) return null;

  if (hadPlus) {
    const international = digits.replace(/^00/, "");
    return `+${international}`;
  }

  const cc = dialCode.replace(/\D/g, "");
  // Numéro national commençant par un 0 de service (France, Indonésie…).
  if (digits.startsWith("0")) return `+${cc}${digits.slice(1)}`;
  // Déjà préfixé de son indicatif sans le « + ».
  if (digits.startsWith(cc) && digits.length > cc.length + 5) return `+${digits}`;
  return `+${cc}${digits}`;
}

/** Affichage lisible : groupes de 2 après l'indicatif. */
export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return "—";
  const m = /^\+(\d{1,3})(\d+)$/.exec(e164);
  if (!m) return e164;
  const [, cc, rest] = m;
  return `+${cc} ${rest.replace(/(\d{2})(?=\d)/g, "$1 ").trim()}`;
}
