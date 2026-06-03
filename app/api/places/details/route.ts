import { NextRequest, NextResponse } from "next/server";

// Proxy serveur vers Google Place Details (New).
// GET /api/places/details?id=<placeId>&lang=fr
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  const lang = req.nextUrl.searchParams.get("lang") === "en" ? "en" : "fr";

  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=${lang}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "id,displayName,formattedAddress,googleMapsUri,internationalPhoneNumber,websiteUri",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "google_error" }, { status: 502 });
    }

    const p = await res.json();
    return NextResponse.json({
      id: p.id as string,
      name: p.displayName?.text ?? "",
      address: p.formattedAddress ?? "",
      mapsUri: p.googleMapsUri ?? "",
      phone: p.internationalPhoneNumber ?? "",
      website: p.websiteUri ?? "",
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
