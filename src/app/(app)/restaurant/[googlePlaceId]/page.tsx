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

  type ReviewRow = {
    review_id: string;
    rating: number;
    review_text: string | null;
    visit_date: string | null;
    created_at: string;
    user_id: string;
    user: { user_id: string; name: string | null; profile_photo: string | null } | null;
    review_photos: { photo_id: string; image_url: string }[];
  };
  const toOne = <T,>(v: unknown): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v as T));

  let restaurantId = dbRestaurant?.restaurant_id ?? null;
  let reviews: ReviewRow[] = [];
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
    const raw = reviewsRes.data ?? [];
    reviews = raw.map((r: unknown) => {
      const row = r as { review_id: string; rating: number; review_text: string | null; visit_date: string | null; created_at: string; user_id: string; user?: unknown; review_photos?: unknown };
      return {
        review_id: row.review_id,
        rating: row.rating,
        review_text: row.review_text,
        visit_date: row.visit_date,
        created_at: row.created_at,
        user_id: row.user_id,
        user: toOne<ReviewRow["user"]>(row.user),
        review_photos: Array.isArray(row.review_photos) ? row.review_photos : (row.review_photos ? [row.review_photos] : []),
      } as ReviewRow;
    });
    if (user) {
      currentUserReviewIds = raw
        .filter((r: { user_id: string }) => (r as { user_id: string }).user_id === user.id)
        .map((r: { review_id: string }) => (r as { review_id: string }).review_id);
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
