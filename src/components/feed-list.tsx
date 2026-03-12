"use client";

import Link from "next/link";
import Image from "next/image";
import { LikeButton } from "./like-button";
import { CommentButton } from "./comment-button";
import { SaveToWantToTryButton } from "./save-want-to-try-button";

type ReviewRow = {
  review_id: string;
  rating: number;
  review_text: string | null;
  visit_date: string | null;
  created_at: string;
  user: { user_id: string; name: string | null; profile_photo: string | null } | null;
  restaurant: { restaurant_id: string; name: string; google_place_id: string; latitude: number; longitude: number } | null;
  review_photos: { photo_id: string; image_url: string }[];
};

export function FeedList({
  initialReviews,
  currentUserId,
}: {
  initialReviews: ReviewRow[];
  currentUserId: string;
}) {
  if (initialReviews.length === 0) {
    return (
      <div className="rounded-md border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
        <p>No activity yet. Follow friends or add your first review to see posts here.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {initialReviews.map((review) => (
        <li
          key={review.review_id}
          className="rounded-md border border-stone-200 bg-white overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/profile/${review.user?.user_id}`} className="flex items-center gap-2">
                {review.user?.profile_photo ? (
                  <img
                    src={review.user.profile_photo}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-200 text-brand-800 text-sm font-medium">
                    {review.user?.name?.[0] ?? "?"}
                  </span>
                )}
                <span className="text-sm font-medium text-stone-900">{review.user?.name ?? "Unknown"}</span>
              </Link>
              <span className="text-stone-400 text-xs">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <Link href={`/restaurant/${review.restaurant?.google_place_id}`}>
              <h2 className="text-sm font-medium text-stone-900 hover:text-brand-700">
                {review.restaurant?.name}
              </h2>
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-brand-700 text-sm font-medium">{review.rating}/10</span>
              {review.visit_date && (
                <span className="text-stone-500 text-xs">
                  Visited {new Date(review.visit_date).toLocaleDateString()}
                </span>
              )}
            </div>
            {review.review_text && (
              <p className="mt-2 text-sm text-stone-600">{review.review_text}</p>
            )}
            {review.review_photos?.length > 0 && (
              <div className="mt-2 flex gap-1.5 flex-wrap">
                {review.review_photos.map((p) => (
                  <div key={p.photo_id} className="relative h-20 w-20 rounded overflow-hidden bg-stone-100">
                    <Image
                      src={p.image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs">
              <LikeButton reviewId={review.review_id} currentUserId={currentUserId} />
              <CommentButton reviewId={review.review_id} restaurantPlaceId={review.restaurant?.google_place_id} />
              {review.restaurant && (
                <SaveToWantToTryButton
                  restaurantId={review.restaurant.restaurant_id}
                  currentUserId={currentUserId}
                />
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
