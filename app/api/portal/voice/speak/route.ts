import { NextRequest, NextResponse } from "next/server";
import { guard, readJson, str } from "@/lib/portal/apiGuard";
import { speak } from "@/lib/portal/voice";
import { isLang } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* POST /api/portal/voice/speak — la phrase de confirmation, en audio.

   Répond 404 quand aucun fournisseur n'est joignable : ce n'est PAS une erreur,
   c'est le signal convenu avec le navigateur, qui prend alors le relais avec
   `SpeechSynthesis`. Une voix de secours locale vaut mieux qu'un silence, et
   mieux qu'un message d'erreur pour une confirmation qu'on peut aussi lire. */

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const g = await guard(str(body.slug, 80) || null);
  if (!g.ok) return g.res;

  const text = str(body.text, 800);
  if (!text) return NextResponse.json({ error: "texte manquant" }, { status: 400 });

  const lang = isLang(body.lang) ? body.lang : "fr";
  const audio = await speak(text, lang);
  if (!audio) return NextResponse.json({ error: "no_provider" }, { status: 404 });

  return new NextResponse(audio, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
