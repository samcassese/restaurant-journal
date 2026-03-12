import { createClient } from "@/lib/supabase/server";
import { MapView } from "@/components/map-view";

export default async function MapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [visitedRes, wantRes] = await Promise.all([
    supabase.from("reviews").select("restaurant_id, restaurants(restaurant_id, name, latitude, longitude, google_place_id)").eq("user_id", user.id),
    supabase.from("want_to_try").select("restaurant_id, restaurants(restaurant_id, name, latitude, longitude, google_place_id)").eq("user_id", user.id),
  ]);

  const visited = (visitedRes.data ?? [])
    .map((r) => (r as { restaurants: { restaurant_id: string; name: string; latitude: number; longitude: number; google_place_id: string } }).restaurants)
    .filter(Boolean);
  const wantToTry = (wantRes.data ?? [])
    .map((r) => (r as { restaurants: { restaurant_id: string; name: string; latitude: number; longitude: number; google_place_id: string } }).restaurants)
    .filter(Boolean);

  const visitedIds = new Set(visited.map((r) => r.restaurant_id));
  const wantOnly = wantToTry.filter((r) => !visitedIds.has(r.restaurant_id));
  const visitedList = visited.map((r) => ({ ...r, type: "visited" as const }));
  const wantList = wantOnly.map((r) => ({ ...r, type: "want" as const }));

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      <div className="px-4 py-1.5 border-b border-stone-200 bg-white">
        <h1 className="text-sm font-medium text-stone-900">Map</h1>
        <p className="text-xs text-stone-500">Visited · Want to try (blue)</p>
      </div>
      <MapView visited={visitedList} wantToTry={wantList} />
    </div>
  );
}
