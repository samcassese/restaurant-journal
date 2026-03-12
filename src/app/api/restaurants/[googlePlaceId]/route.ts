import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ googlePlaceId: string }> }
) {
  const { googlePlaceId } = await params;
  if (!googlePlaceId) {
    return NextResponse.json({ error: "Missing place ID" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Places API not configured" },
      { status: 503 }
    );
  }

  try {
    const placeIdParam = googlePlaceId.startsWith("places/") ? googlePlaceId : `places/${googlePlaceId}`;
    const res = await fetch(
      `https://places.googleapis.com/v1/${placeIdParam}?fields=id,displayName,location,types,formattedAddress`,
      {
        headers: { "X-Goog-Api-Key": apiKey },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Places API error:", err);
      return NextResponse.json(
        { error: "Place not found" },
        { status: 404 }
      );
    }

    const p = await res.json();
    const place = {
      placeId: p.id?.replace("places/", "") ?? googlePlaceId,
      name: p.displayName?.text ?? "",
      latitude: p.location?.latitude ?? 0,
      longitude: p.location?.longitude ?? 0,
      address: p.formattedAddress ?? null,
      types: p.types ?? [],
    };

    return NextResponse.json(place);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch place" }, { status: 500 });
  }
}
