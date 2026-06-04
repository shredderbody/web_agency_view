import { NextRequest, NextResponse } from "next/server";

// Proxy serveur vers Google Place Details (New).
// GET /api/places/details?id=<placeId>&lang=fr
// Renvoie les informations TEXTUELLES utiles, prêtes pour la table business_leads.

const FIELD_MASK = [
  "id",
  "displayName",
  "primaryType",
  "primaryTypeDisplayName",
  "types",
  "formattedAddress",
  "addressComponents",
  "location",
  "internationalPhoneNumber",
  "nationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "rating",
  "userRatingCount",
  "regularOpeningHours.weekdayDescriptions",
  "businessStatus",
  "reviews.rating",
  "reviews.text",
  "reviews.authorAttribution.displayName",
  "reviews.relativePublishTimeDescription",
].join(",");

function comp(components: any[], type: string): string {
  const c = components?.find((x) => Array.isArray(x.types) && x.types.includes(type));
  return c?.longText ?? "";
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  const lang = req.nextUrl.searchParams.get("lang") === "en" ? "en" : "fr";
  // Même jeton que les requêtes autocomplete → clôt la session de facturation :
  // les frappes autocomplete deviennent gratuites, seul ce Details est facturé.
  const sessionToken = req.nextUrl.searchParams.get("sessiontoken")?.trim() ?? "";

  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=${lang}${sessionToken ? `&sessionToken=${encodeURIComponent(sessionToken)}` : ""}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "google_error" }, { status: 502 });
    }

    const p = await res.json();
    const ac = p.addressComponents ?? [];

    return NextResponse.json({
      // Identité
      id: p.id as string,
      name: p.displayName?.text ?? "",
      // Métier
      primaryType: p.primaryType ?? "",
      primaryTypeDisplay: p.primaryTypeDisplayName?.text ?? "",
      types: p.types ?? [],
      // Adresse
      address: p.formattedAddress ?? "",
      streetNumber: comp(ac, "street_number"),
      route: comp(ac, "route"),
      locality: comp(ac, "locality") || comp(ac, "postal_town"),
      postalCode: comp(ac, "postal_code"),
      adminArea: comp(ac, "administrative_area_level_1"),
      country: comp(ac, "country"),
      // Géoloc
      latitude: p.location?.latitude ?? null,
      longitude: p.location?.longitude ?? null,
      // Contact
      phoneNational: p.nationalPhoneNumber ?? "",
      phoneInternational: p.internationalPhoneNumber ?? "",
      website: p.websiteUri ?? "",
      // Lien Maps
      mapsUri: p.googleMapsUri ?? "",
      // Réputation
      rating: p.rating ?? null,
      userRatingCount: p.userRatingCount ?? null,
      // Horaires
      openingHours: p.regularOpeningHours?.weekdayDescriptions ?? [],
      // Avis
      reviews: (p.reviews ?? []).map((r: any) => ({
        rating: r.rating ?? null,
        text: r.text?.text ?? "",
        author: r.authorAttribution?.displayName ?? "",
        when: r.relativePublishTimeDescription ?? "",
      })),
      // Statut
      businessStatus: p.businessStatus ?? "",
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
