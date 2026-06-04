import { NextRequest, NextResponse } from "next/server";

// Proxy serveur vers l'API Google Places (New) — la clé reste côté serveur.
// GET /api/places/autocomplete?q=<texte>&lang=fr
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const lang = req.nextUrl.searchParams.get("lang") === "en" ? "en" : "fr";
  // Jeton de session : regroupe ces requêtes + le Place Details final en UNE
  // session facturée (sinon chaque frappe est payée au tarif "per request").
  const sessionToken = req.nextUrl.searchParams.get("sessiontoken")?.trim() ?? "";

  if (q.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "missing_api_key", suggestions: [] }, { status: 500 });
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
      },
      body: JSON.stringify({
        input: q,
        languageCode: lang,
        // On privilégie les établissements (commerces) plutôt que les adresses pures.
        includedPrimaryTypes: ["establishment"],
        ...(sessionToken ? { sessionToken } : {}),
      }),
      // Évite la mise en cache côté Next.
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "google_error", suggestions: [] }, { status: 502 });
    }

    const data = await res.json();
    const suggestions = (data.suggestions ?? [])
      .map((s: any) => s.placePrediction)
      .filter(Boolean)
      .map((p: any) => ({
        id: p.placeId as string,
        main: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
        secondary: p.structuredFormat?.secondaryText?.text ?? "",
      }));

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: "fetch_failed", suggestions: [] }, { status: 502 });
  }
}
