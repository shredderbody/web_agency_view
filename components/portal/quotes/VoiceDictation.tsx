"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square, Volume2, VolumeX } from "lucide-react";
import type { DocLine } from "@/lib/portal/documents.shared";
import { useQuotes } from "./context";

/* ════════════════════════════════════════════════════════════════════════════
   LA DICTÉE — le geste central de `devis_app`, porté ici.

   Un artisan qui sort d'un chantier ne remplit pas un tableau. Il dit « pose de
   deux radiateurs à quatre cent vingt euros pièce, plus une journée de
   main-d'œuvre », et le devis s'écrit.

   Trois temps, trois états affichés, jamais un seul « chargement » vague :
     • ENREGISTREMENT  le micro tourne, on voit qu'on est écouté
     • TRANSCRIPTION   Whisper travaille
     • ANALYSE         le modèle range la phrase en lignes chiffrées
   Quand une dictée ne donne rien, la première question est « m'a-t-il
   entendu ? ». Le texte reconnu reste donc affiché, même quand l'analyse échoue.

   ── Le micro ────────────────────────────────────────────────────────────────
   `MediaRecorder`, sans dépendance. Le flux est arrêté piste par piste à la fin :
   sans ça, le voyant du micro reste allumé après l'enregistrement, et c'est le
   genre de détail qui fait fermer un onglet.
   ════════════════════════════════════════════════════════════════════════════ */

type Phase = "idle" | "recording" | "transcribing" | "parsing";

export default function VoiceDictation({
  documentId, onLines,
}: {
  documentId: string;
  /** Reçoit les lignes reconnues. `replace` vide le devis avant d'écrire. */
  onLines: (lines: DocLine[], mode: "append" | "replace") => void;
}) {
  const { slug, lang, t } = useQuotes();
  const [phase, setPhase] = useState<Phase>("idle");
  const [heard, setHeard] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [speakBack, setSpeakBack] = useState(true);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* Le micro doit s'éteindre quoi qu'il arrive — y compris si on quitte
     l'onglet en pleine phrase. */
  useEffect(() => () => {
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    audioRef.current?.pause();
  }, []);

  const confirm = useCallback(async (text: string) => {
    if (!speakBack) return;
    try {
      const res = await fetch("/api/portal/voice/speak", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, lang, text }),
      });
      if (res.ok) {
        const url = URL.createObjectURL(await res.blob());
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play().catch(() => undefined);
        return;
      }
      // 404 = aucun fournisseur joignable. Ce n'est pas une panne : le
      // navigateur prend le relais. Une voix de secours vaut mieux qu'un silence.
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang === "en" ? "en-GB" : "fr-FR";
        window.speechSynthesis.speak(utter);
      }
    } catch {
      // Une confirmation parlée qui échoue ne doit rien casser : le résultat
      // est déjà écrit à l'écran, et c'est lui qui compte.
    }
  }, [slug, lang, speakBack]);

  const send = useCallback(async (blob: Blob) => {
    setPhase("transcribing");
    setProblem(null);
    setNote(null);
    try {
      const form = new FormData();
      form.append("audio", blob, "dictee.webm");
      form.append("lang", lang);
      const tr = await fetch(
        `/api/portal/voice/transcribe?slug=${encodeURIComponent(slug)}`,
        { method: "POST", body: form },
      );
      const trData = await tr.json().catch(() => ({}));
      if (!tr.ok) throw new Error(trData.error ?? t.voice.error);

      const transcript = String(trData.text ?? "").trim();
      setHeard(transcript || null);
      if (!transcript) {
        setProblem(t.voice.nothing);
        setPhase("idle");
        return;
      }

      setPhase("parsing");
      const pa = await fetch("/api/portal/voice/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, lang, transcript, documentId }),
      });
      const paData = await pa.json().catch(() => ({}));
      if (!pa.ok) throw new Error(paData.error ?? t.voice.error);

      const lines = (paData.lines ?? []) as DocLine[];
      if (lines.length === 0) {
        setProblem(t.voice.nothing);
        setPhase("idle");
        return;
      }

      const mode = paData.mode === "replace" ? "replace" : "append";
      onLines(lines, mode);
      const summary = mode === "replace" ? t.voice.replaced(lines.length) : t.voice.applied(lines.length);
      // Les prix que le modèle n'a pas su trouver : on les dit, on ne les cache
      // pas derrière un devis qui semble complet.
      const warnings = Array.isArray(paData.warnings) ? (paData.warnings as string[]) : [];
      setNote([summary, ...warnings].join(" "));
      setPhase("idle");
      void confirm(summary);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : t.voice.error);
      setPhase("idle");
    }
  }, [slug, lang, t, documentId, onLines, confirm]);

  async function start() {
    setProblem(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia
        || typeof MediaRecorder === "undefined") {
      setProblem(t.voice.unsupported);
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setProblem(t.voice.denied);
      return;
    }

    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      if (blob.size > 0) void send(blob);
      else setPhase("idle");
    };
    recorderRef.current = recorder;
    recorder.start();
    setPhase("recording");
  }

  function stop() {
    recorderRef.current?.stop();
    recorderRef.current = null;
  }

  const busy = phase === "transcribing" || phase === "parsing";
  const statusLabel =
    phase === "recording" ? t.voice.listening
      : phase === "transcribing" ? t.voice.transcribing
        : phase === "parsing" ? t.voice.analysing
          : null;

  return (
    <section className="esp-panel qa-voice">
      <header className="esp-panel-head">
        <h2 className="esp-h3">
          <Mic size={13} aria-hidden style={{ verticalAlign: "-2px", marginRight: "0.35rem" }} />
          {t.voice.start}
        </h2>
        <button
          type="button"
          className="esp-btn esp-btn-sm esp-btn-quiet"
          aria-pressed={speakBack}
          onClick={() => setSpeakBack((v) => !v)}
          title={t.voice.speakToggle}
        >
          {speakBack ? <Volume2 size={13} aria-hidden /> : <VolumeX size={13} aria-hidden />}
          <span className="qa-voice-toggle-label">{t.voice.speakToggle}</span>
        </button>
      </header>

      <div className="esp-panel-body">
        <div className="qa-voice-row">
          {phase === "recording" ? (
            <button type="button" className="esp-btn esp-btn-danger qa-mic is-live" onClick={stop}>
              <Square size={15} aria-hidden /> {t.voice.stop}
            </button>
          ) : (
            <button
              type="button" className="esp-btn esp-btn-primary qa-mic"
              onClick={start} disabled={busy}
            >
              {busy ? <Loader2 size={15} className="esp-spin" aria-hidden /> : <Mic size={15} aria-hidden />}
              {t.voice.start}
            </button>
          )}

          {statusLabel && (
            <span className="qa-voice-status" aria-live="polite">
              {phase === "recording" && <span className="qa-pulse" aria-hidden />}
              {statusLabel}
            </span>
          )}
        </div>

        <p className="esp-micro" style={{ marginTop: "0.6rem" }}>{t.voice.hint}</p>

        {heard && (
          <p className="qa-heard">
            <b>{t.voice.heard}</b> {heard}
          </p>
        )}
        {note && <p className="esp-note" style={{ marginTop: "0.6rem" }}>{note}</p>}
        {problem && (
          <p className="esp-note esp-note-warn" role="alert" style={{ marginTop: "0.6rem" }}>
            {problem}
          </p>
        )}

        {!heard && !problem && (
          <ul className="qa-voice-ex">
            <li className="qa-voice-ex-k">{t.voice.examples}</li>
            <li>{t.voice.ex1}</li>
            <li>{t.voice.ex2}</li>
            <li>{t.voice.ex3}</li>
          </ul>
        )}
      </div>
    </section>
  );
}
