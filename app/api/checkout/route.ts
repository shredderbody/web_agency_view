import { NextRequest, NextResponse } from "next/server";
import {
  stripe,
  stripeEnabled,
  PLANS,
  isPlanId,
  SUBSCRIPTION_MONTHS,
} from "@/lib/stripe";
import { ui, isLang, DEFAULT_LANG } from "@/lib/i18n";

// Crée une session Stripe Checkout en mode abonnement :
//   • un « fee » unique de mise en place (selon la formule),
//   • un abonnement mensuel de 49 €/mois, prélevé pendant 24 mois,
//     puis arrêté automatiquement (cancel_at posé par le webhook).
// Après paiement (succès ou annulation), l'utilisateur revient sur la home page.

function originOf(req: NextRequest): string {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL_LOCAL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host") ?? "localhost:3010";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  if (!stripeEnabled) {
    return NextResponse.json({ error: "stripe_disabled" }, { status: 503 });
  }

  let body: { plan?: unknown; email?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (!isPlanId(body.plan)) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const plan = PLANS[body.plan];
  const origin = originOf(req);
  const lang = isLang(body.lang) ? body.lang : DEFAULT_LANG;
  const tc = ui[lang].checkout;
  const subDesc = tc.subDesc.replace("{months}", String(SUBSCRIPTION_MONTHS));
  const email =
    typeof body.email === "string" && body.email.includes("@")
      ? body.email
      : undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      locale: lang,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      line_items: [
        // Abonnement mensuel récurrent (49 €/mois).
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: plan.monthlyEur * 100,
            recurring: { interval: "month" },
            product_data: {
              name: `${tc.subName} ${plan.label}`,
              description: subDesc,
            },
          },
        },
        // Frais de mise en place uniques, ajoutés à la première facture.
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: plan.feeEur * 100,
            product_data: {
              name: `${tc.feeName} ${plan.label}`,
              description: tc.feeDesc,
            },
          },
        },
      ],
      subscription_data: {
        description: `${tc.subName} ${plan.label}`,
        metadata: {
          plan: body.plan,
          cap_months: String(SUBSCRIPTION_MONTHS),
        },
      },
      metadata: { plan: body.plan },
      success_url: `${origin}/?paiement=succes&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?paiement=annule`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "stripe_error";
    return NextResponse.json({ error: "checkout_failed", detail: message }, { status: 502 });
  }
}
