import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/portal/apiGuard";
import { transcribe, VoiceError } from "@/lib/portal/voice";
import { isLang } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* POST /api/portal/voice/transcribe — un enregistrement, un texte.

   Volontairement séparée de l'analyse : quand une dictée ne donne rien, la
   première question est « m'a-t-il entendu ? ». Deux appels distincts répondent
   sans deviner, et l'écran peut afficher le texte reconnu avant de le faire
   comprendre. */

const MAX_BYTES = 24 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const g = await guard(req.nextUrl.searchParams.get("slug"));
  if (!g.ok) return g.res;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "form data invalide" }, { status: 400 });
  }

  const audio = form.get("audio");
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "audio manquant" }, { status: 400 });
  }
  if (audio.size === 0) {
    return NextResponse.json({ error: "audio vide" }, { status: 400 });
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: "audio trop long" }, { status: 413 });
  }

  const raw = form.get("lang");
  const lang = typeof raw === "string" && isLang(raw) ? raw : "fr";

  try {
    return NextResponse.json({ text: await transcribe(audio, lang) });
  } catch (err) {
    const status = err instanceof VoiceError ? err.status : 502;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Transcription impossible." },
      { status },
    );
  }
}
