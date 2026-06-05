import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, stripeEnabled } from "@/lib/stripe";

// Webhook Stripe. Rôle principal ici : plafonner l'abonnement à N mois.
// À la création d'un abonnement, on pose `cancel_at` = début + cap_months,
// pour que Stripe arrête de prélever automatiquement après la durée prévue.

// Next.js : le corps brut est nécessaire pour vérifier la signature.
export const runtime = "nodejs";

function addMonths(unixSeconds: number, months: number): number {
  const d = new Date(unixSeconds * 1000);
  d.setMonth(d.getMonth() + months);
  return Math.floor(d.getTime() / 1000);
}

export async function POST(req: NextRequest) {
  if (!stripeEnabled) {
    return NextResponse.json({ error: "stripe_disabled" }, { status: 503 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "bad_signature";
    return NextResponse.json({ error: "invalid_signature", detail: message }, { status: 400 });
  }

  try {
    if (event.type === "customer.subscription.created") {
      const sub = event.data.object as Stripe.Subscription;
      const cap = Number(sub.metadata?.cap_months ?? 0);
      // On ne pose le cap qu'une fois, si pas déjà programmé.
      if (cap > 0 && !sub.cancel_at) {
        const start = sub.start_date ?? Math.floor(Date.now() / 1000);
        await stripe.subscriptions.update(sub.id, {
          cancel_at: addMonths(start, cap),
        });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "handler_error";
    // On renvoie 200 quand même : l'événement est valide, on évite les retries en boucle.
    return NextResponse.json({ received: true, warning: message });
  }

  return NextResponse.json({ received: true });
}
