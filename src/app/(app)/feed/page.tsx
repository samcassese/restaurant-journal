import { createClient } from "@/lib/supabase/server";
import { FeedList } from "@/components/feed-list";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get IDs of users that current user follows (including self for own reviews)
  const { data: following } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);
  const followingIds = [...(following ?? []).map((f) => f.following_id), user.id];

  const { data: rawReviews } = await supabase
    .from("reviews")
    .select(`
      review_id,
      rating,
      review_text,
      visit_date,
      created_at,
      user:users!user_id(user_id, name, profile_photo),
      restaurant:restaurants(restaurant_id, name, google_place_id, latitude, longitude),
      review_photos(photo_id, image_url)
    `)
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .limit(50);

  // Supabase returns relations as arrays; normalize to single objects for FeedList
  type FeedReview = {
    review_id: string;
    rating: number;
    review_text: string | null;
    visit_date: string | null;
    created_at: string;
    user: { user_id: string; name: string | null; profile_photo: string | null } | null;
    restaurant: { restaurant_id: string; name: string; google_place_id: string; latitude: number; longitude: number } | null;
    review_photos: { photo_id: string; image_url: string }[];
  };
  const rows = rawReviews ?? [];
  const reviews: FeedReview[] = rows.map((r) => {
    const userRel = r.user as unknown;
    const restaurantRel = r.restaurant as unknown;
    return {
      review_id: r.review_id,
      rating: r.rating,
      review_text: r.review_text,
      visit_date: r.visit_date,
      created_at: r.created_at,
      user: Array.isArray(userRel) ? (userRel[0] ?? null) : (userRel as FeedReview["user"]),
      restaurant: Array.isArray(restaurantRel) ? (restaurantRel[0] ?? null) : (restaurantRel as FeedReview["restaurant"]),
      review_photos: (r.review_photos ?? []) as FeedReview["review_photos"],
    };
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-lg font-medium text-stone-900 mb-4">Feed</h1>
      <FeedList initialReviews={reviews} currentUserId={user.id} />
    </div>
  );
}
