import { NextRequest, NextResponse } from "next/server";

/* ════════════════════════════════════════════════════════════════════════════
   Endpoint des FUNCTION TOOLS des assistants Vapi de démo.
   (enregistrer_rendezvous / enregistrer_reservation / enregistrer_commande /
    enregistrer_intervention — cf. docs/VAPI_ASSISTANTS.md)

   ⚠️ DÉMO : aucune réservation réelle n'est créée. On accuse simplement
   réception au format attendu par Vapi pour que l'assistant confirme au client.
   On tente un enregistrement best-effort dans Supabase (table demo_bookings)
   si elle existe — toute erreur est silencieuse et n'empêche pas la confirmation.

   Format de réponse Vapi attendu :
     { "results": [ { "toolCallId": "<id>", "result": "<texte>" } ] }
   ════════════════════════════════════════════════════════════════════════════ */

type ToolCall = {
  id?: string;
  toolCallId?: string;
  function?: { name?: string; arguments?: unknown };
  name?: string;
  arguments?: unknown;
};

function parseArgs(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw as Record<string, unknown>;
  return {};
}

function frConfirmation(name: string, a: Record<string, unknown>): string {
  const who = [a.prenom, a.nom].filter(Boolean).join(" ").trim() || "le client";
  const when = [a.date, a.heure].filter(Boolean).join(" à ");
  const bits: string[] = [];
  if (when) bits.push(`pour le ${when}`);
  if (a.prestation) bits.push(`(${a.prestation})`);
  if (a.commande) bits.push(`(${a.commande}${a.nombre_personnes ? `, ${a.nombre_personnes} pers.` : ""})`);
  if (a.nombre_couverts) bits.push(`(${a.nombre_couverts} couverts)`);
  if (a.adresse_intervention) bits.push(`au ${a.adresse_intervention}`);
  if (a.nature_probleme) bits.push(`pour : ${a.nature_probleme}`);
  const label =
    name === "enregistrer_intervention"
      ? "Demande d'intervention"
      : name === "enregistrer_commande"
        ? "Commande"
        : name === "enregistrer_reservation"
          ? "Réservation"
          : "Rendez-vous";
  return `${label} de démonstration bien enregistré pour ${who} ${bits.join(" ")}.`.replace(/\s+/g, " ").trim();
}

async function tryStore(
  name: string,
  args: Record<string, unknown>,
  meta: Record<string, unknown>,
  domain_name: string,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/demo_bookings`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ tool: name, payload: args, meta, domain_name: domain_name || null }),
      cache: "no-store",
    });
  } catch {
    /* best-effort : la table peut ne pas exister, on ignore */
  }
}

export async function POST(req: NextRequest) {
  // Contrôle optionnel d'un secret partagé (header x-vapi-secret).
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-vapi-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const message = (body.message ?? body) as Record<string, unknown>;
  const calls = (message.toolCalls ?? message.toolCallList ?? message.tool_calls ?? []) as ToolCall[];

  if (!Array.isArray(calls) || calls.length === 0) {
    // Autres événements Vapi (status-update, end-of-call-report…) : on acquitte.
    return NextResponse.json({ received: true });
  }

  // Domaine d'origine : même convention que les leads (app/api/leads/route.ts).
  const domain_name = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  // Le slug du métier est porté par metadata de l'assistant (cf.
  // scripts/vapi-setup-assistants.mjs → metadata.slug), pas au niveau message.
  const assistant = (message.assistant ?? (message.call as Record<string, unknown>)?.assistant) as
    | Record<string, unknown>
    | undefined;
  const assistantMeta = (assistant?.metadata ?? {}) as Record<string, unknown>;
  const slug = assistantMeta.slug ?? message.slug ?? null;

  const results = [];
  for (const c of calls) {
    const id = c.toolCallId || c.id || "";
    const name = c.function?.name || c.name || "enregistrer_rendezvous";
    const args = parseArgs(c.function?.arguments ?? c.arguments);
    await tryStore(name, args, { slug, ts: new Date().toISOString() }, domain_name);
    results.push({ toolCallId: id, result: frConfirmation(name, args) });
  }

  return NextResponse.json({ results });
}
