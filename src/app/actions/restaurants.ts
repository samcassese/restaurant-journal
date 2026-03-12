"use server";

import { createClient } from "@/lib/supabase/server";

export type PlaceFromGoogle = {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  types?: string[];
};

export async function upsertRestaurant(place: PlaceFromGoogle) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .upsert(
      {
        google_place_id: place.placeId,
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address ?? null,
        cuisine_type: place.types?.[0] ?? null,
      },
      { onConflict: "google_place_id" }
    )
    .select("restaurant_id")
    .single();
  if (error) throw error;
  return data.restaurant_id as string;
}
