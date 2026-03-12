import { NextRequest, NextResponse } from "next/server";

const DEFAULT_LOCATION = "Seattle, WA"; // Western Washington focus per PRD

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const location = searchParams.get("location") || DEFAULT_LOCATION;

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Places API not configured" },
      { status: 503 }
    );
  }

  try {
    // Text Search (New) - prefer Place ID and basic fields for MVP
    const searchRes = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify({
          textQuery: `${q} restaurant ${location}`,
          maxResultCount: 20,
        }),
      }
    );

    if (!searchRes.ok) {
      const err = await searchRes.text();
      console.error("Places API error:", err);
      return NextResponse.json(
        { error: "Search failed" },
        { status: 502 }
      );
    }

    const data = await searchRes.json();
    const places = (data.places ?? []).map((p: { id?: string; displayName?: { text?: string }; location?: { latitude?: number; longitude?: number }; types?: string[] }) => ({
      placeId: p.id?.replace("places/", "") ?? "",
      name: p.displayName?.text ?? "",
      latitude: p.location?.latitude ?? 0,
      longitude: p.location?.longitude ?? 0,
      types: p.types ?? [],
    }));

    return NextResponse.json({ places });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
