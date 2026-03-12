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

  const { data: reviews } = await supabase
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-lg font-medium text-stone-900 mb-4">Feed</h1>
      <FeedList initialReviews={reviews ?? []} currentUserId={user.id} />
    </div>
  );
}
