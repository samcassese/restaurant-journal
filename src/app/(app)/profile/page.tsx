import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/");

  const { data: user } = await supabase.from("users").select("*").eq("user_id", authUser.id).single();
  if (!user) return null;

  const [
    { count: reviewCount },
    { data: reviews },
    { data: wantToTry },
    { count: followingCount },
    { count: followersCount },
  ] = await Promise.all([
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", user.user_id),
    supabase.from("reviews").select("review_id, rating, created_at, restaurant:restaurants(name, google_place_id)").eq("user_id", user.user_id).order("created_at", { ascending: false }).limit(10),
    supabase.from("want_to_try").select("restaurant_id, restaurant:restaurants(name, google_place_id)").eq("user_id", user.user_id).limit(10),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.user_id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.user_id),
  ]);

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + (r as { rating: number }).rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        {user.profile_photo ? (
          <img src={user.profile_photo} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-200 text-lg font-medium text-brand-800">
            {user.name?.[0] ?? "?"}
          </span>
        )}
        <div>
          <h1 className="text-lg font-medium text-stone-900">{user.name ?? "Anonymous"}</h1>
          {user.bio && <p className="text-sm text-stone-600 mt-0.5">{user.bio}</p>}
          <p className="text-xs text-stone-500 mt-1">{reviewCount ?? 0} reviews · Avg {avgRating}/10</p>
          <p className="text-xs text-stone-500">{followingCount ?? 0} following · {followersCount ?? 0} followers</p>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-stone-900 mb-2">Recent reviews</h2>
        {reviews?.length ? (
          <ul className="space-y-1">
            {reviews.map((r: { review_id: string; rating: number; created_at: string; restaurant: { name: string; google_place_id: string } | null }) => (
              <li key={r.review_id}>
                <Link href={`/restaurant/${r.restaurant?.google_place_id}`} className="flex justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-sm hover:bg-stone-50">
                  <span>{r.restaurant?.name}</span>
                  <span className="text-brand-700 font-medium">{r.rating}/10</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone-500">No reviews yet.</p>
        )}
        <Link href="/search" className="mt-1.5 inline-block text-xs text-brand-700 hover:underline">
          Add a review
        </Link>
      </section>

      <section>
        <h2 className="text-sm font-medium text-stone-900 mb-2">Want to try</h2>
        {wantToTry?.length ? (
          <ul className="space-y-1">
            {wantToTry.map((w: { restaurant_id: string; restaurant: { name: string; google_place_id: string } | null }) => (
              <li key={w.restaurant_id}>
                <Link href={`/restaurant/${w.restaurant?.google_place_id}`} className="block rounded-md border border-stone-200 bg-white px-3 py-2 text-sm hover:bg-stone-50">
                  {w.restaurant?.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone-500">Nothing saved yet.</p>
        )}
      </section>

      <div className="mt-6">
        <Link href="/map" className="text-xs text-brand-700 hover:underline">
          View map
        </Link>
      </div>
    </div>
  );
}
