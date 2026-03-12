import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getPlaceByGoogleId } from "@/lib/places";
import { RestaurantDetail } from "@/components/restaurant-detail";

type Props = { params: Promise<{ googlePlaceId: string }> };

export default async function RestaurantPage({ params }: Props) {
  const { googlePlaceId } = await params;
  const placeId = decodeURIComponent(googlePlaceId);

  const place = await getPlaceByGoogleId(placeId);
  if (!place) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dbRestaurant } = await supabase
    .from("restaurants")
    .select("restaurant_id")
    .eq("google_place_id", placeId)
    .single();

  let restaurantId = dbRestaurant?.restaurant_id ?? null;
  let reviews: unknown[] = [];
  let currentUserReviewIds: string[] = [];
  let currentUserWantToTry = false;

  if (restaurantId) {
    const [reviewsRes, wantRes] = await Promise.all([
      supabase
        .from("reviews")
        .select(`
          review_id,
          rating,
          review_text,
          visit_date,
          created_at,
          user_id,
          user:users!user_id(user_id, name, profile_photo),
          review_photos(photo_id, image_url)
        `)
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false }),
      user ? supabase.from("want_to_try").select("restaurant_id").eq("user_id", user.id).eq("restaurant_id", restaurantId).single() : { data: null },
    ]);
    reviews = reviewsRes.data ?? [];
    if (user) {
      currentUserReviewIds = (reviewsRes.data ?? [])
        .filter((r: { user_id: string }) => r.user_id === user.id)
        .map((r: { review_id: string }) => r.review_id);
      currentUserWantToTry = !!wantRes.data;
    }
  }

  return (
    <RestaurantDetail
      place={place}
      restaurantId={restaurantId}
      reviews={reviews}
      currentUserId={user?.id ?? null}
      currentUserReviewIds={currentUserReviewIds}
      currentUserWantToTry={currentUserWantToTry}
    />
  );
}
