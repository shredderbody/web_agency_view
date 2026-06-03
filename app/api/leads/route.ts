import { NextRequest, NextResponse } from "next/server";

// Reçoit un lead "entreprise" depuis le widget et l'insère dans la table
// Supabase business_leads via PostgREST, avec la clé service_role (côté serveur).

// Colonnes autorisées en insertion (liste blanche = sécurité).
const ALLOWED = new Set([
  "source",
  "lang",
  "place_id",
  "name",
  "primary_type",
  "primary_type_display",
  "types",
  "formatted_address",
  "street_number",
  "route",
  "locality",
  "postal_code",
  "admin_area",
  "country",
  "latitude",
  "longitude",
  "phone_national",
  "phone_international",
  "website",
  "google_maps_uri",
  "rating",
  "user_rating_count",
  "opening_hours",
  "reviews",
  "business_status",
]);

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "missing_supabase_env" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // On ne garde que les colonnes connues et non vides.
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!ALLOWED.has(k)) continue;
    if (v === "" || v === undefined || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    row[k] = v;
  }

  if (!row.name) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  if (!row.source) row.source = "google";

  try {
    const res = await fetch(`${url}/rest/v1/business_leads`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(row),
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: "supabase_error", detail }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, id: data?.[0]?.id ?? null });
  } catch {
    return NextResponse.json({ error: "insert_failed" }, { status: 502 });
  }
}
