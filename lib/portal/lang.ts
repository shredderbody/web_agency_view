// ⚠️ MODULE SERVEUR UNIQUEMENT (lit les cookies de la requête).

import { cookies } from "next/headers";
import { DEFAULT_LANG, isLang, LANG_COOKIE, type Lang } from "../i18n";

/* La langue du visiteur, telle que le reste du site la lit.

   C'est LE MÊME COOKIE que le site public (`av_lang`), et c'est voulu : un
   visiteur qui a mis la vitrine en anglais retrouve son espace en anglais, sans
   avoir à le régler une seconde fois. Un espace protégé n'est pas un autre site,
   c'est l'envers du même. */
export async function portalLang(): Promise<Lang> {
  const jar = await cookies();
  const raw = jar.get(LANG_COOKIE)?.value;
  return isLang(raw) ? raw : DEFAULT_LANG;
}
