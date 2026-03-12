import "server-only";

export type PlaceResult = {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  types: string[];
};

export async function getPlaceByGoogleId(googlePlaceId: string): Promise<PlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const placeIdParam = googlePlaceId.startsWith("places/") ? googlePlaceId : `places/${googlePlaceId}`;
  const res = await fetch(
    `https://places.googleapis.com/v1/${placeIdParam}?fields=id,displayName,location,types,formattedAddress`,
    { headers: { "X-Goog-Api-Key": apiKey } }
  );

  if (!res.ok) return null;
  const p = await res.json();
  return {
    placeId: p.id?.replace("places/", "") ?? googlePlaceId,
    name: p.displayName?.text ?? "",
    latitude: p.location?.latitude ?? 0,
    longitude: p.location?.longitude ?? 0,
    address: p.formattedAddress ?? null,
    types: p.types ?? [],
  };
}
