"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { upsertRestaurant } from "@/app/actions/restaurants";
import { createReview } from "@/app/actions/reviews";
import { addToWantToTry, removeFromWantToTry } from "@/app/actions/want-to-try";
import { LikeButton } from "./like-button";
import { SaveToWantToTryButton } from "./save-want-to-try-button";

type Place = { placeId: string; name: string; latitude: number; longitude: number; address?: string | null };
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

export function RestaurantDetail({
  place,
  restaurantId,
  reviews,
  currentUserId,
  currentUserReviewIds,
  currentUserWantToTry,
}: {
  place: Place;
  restaurantId: string | null;
  reviews: ReviewRow[];
  currentUserId: string | null;
  currentUserReviewIds: string[];
  currentUserWantToTry: boolean;
}) {
  const [saving, setSaving] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [visitDate, setVisitDate] = useState("");

  async function ensureRestaurant(): Promise<string> {
    if (restaurantId) return restaurantId;
    return upsertRestaurant({
      placeId: place.placeId,
      name: place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      address: place.address,
    });
  }

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) return;
    setSaving(true);
    try {
      const rid = await ensureRestaurant();
      await createReview({
        restaurantId: rid,
        rating: reviewRating,
        reviewText: reviewText || null,
        visitDate: visitDate || null,
      });
      setReviewText("");
      setVisitDate("");
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleWantToTry() {
    if (!currentUserId) return;
    const rid = restaurantId ?? (await ensureRestaurant());
    if (currentUserWantToTry) {
      await removeFromWantToTry(rid);
    } else {
      await addToWantToTry(rid);
    }
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-semibold text-stone-900">{place.name}</h1>
      {place.address && <p className="text-stone-500 text-sm mt-0.5">{place.address}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {currentUserId && (
          <button
            type="button"
            onClick={handleToggleWantToTry}
            className={`rounded-md px-3 py-1.5 text-sm ${
              currentUserWantToTry
                ? "bg-brand-100 text-brand-800"
                : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            {currentUserWantToTry ? "Saved" : "Add to want to try"}
          </button>
        )}
      </div>

      {currentUserId && (
        <form onSubmit={handleAddReview} className="mt-6 rounded-md border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-medium text-stone-900 mb-3">Add a review</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-600">Rating (1–10)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="mt-0.5 w-16 rounded border border-stone-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600">Visit date</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="mt-0.5 rounded border border-stone-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600">Review (optional)</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                maxLength={2000}
                className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
                placeholder="What did you think?"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Post review"}
            </button>
          </div>
        </form>
      )}

      <section id="comments" className="mt-8">
        <h2 className="text-sm font-medium text-stone-900 mb-2">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-stone-500">No reviews yet. Be the first.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.review_id} className="rounded-md border border-stone-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <Link href={`/profile/${r.user?.user_id}`} className="flex items-center gap-2">
                    {r.user?.profile_photo ? (
                      <img src={r.user.profile_photo} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-200 text-xs font-medium text-brand-800">
                        {r.user?.name?.[0] ?? "?"}
                      </span>
                    )}
                    <span className="text-sm font-medium text-stone-900">{r.user?.name ?? "Unknown"}</span>
                  </Link>
                  <span className="text-brand-700 text-sm font-medium">{r.rating}/10</span>
                </div>
                {r.visit_date && (
                  <p className="text-xs text-stone-500 mt-0.5">Visited {new Date(r.visit_date).toLocaleDateString()}</p>
                )}
                {r.review_text && <p className="mt-1.5 text-sm text-stone-600">{r.review_text}</p>}
                {r.review_photos?.length > 0 && (
                  <div className="mt-1.5 flex gap-1.5">
                    {r.review_photos.map((p) => (
                      <div key={p.photo_id} className="relative h-16 w-16 rounded overflow-hidden bg-stone-100">
                        <Image src={p.image_url} alt="" fill className="object-cover" sizes="64px" />
                      </div>
                    ))}
                  </div>
                )}
                {currentUserId && (
                  <div className="mt-1.5">
                    <LikeButton reviewId={r.review_id} currentUserId={currentUserId} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
