"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const RATING_MIN = 1;
const RATING_MAX = 10;
const REVIEW_TEXT_MAX = 2000;

export async function createReview(params: {
  restaurantId: string;
  rating: number;
  reviewText?: string | null;
  visitDate?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const rating = Math.min(RATING_MAX, Math.max(RATING_MIN, Number(params.rating)));
  const reviewText =
    params.reviewText != null && params.reviewText.length > REVIEW_TEXT_MAX
      ? params.reviewText.slice(0, REVIEW_TEXT_MAX)
      : params.reviewText ?? null;
  const visitDate = params.visitDate || null;

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      restaurant_id: params.restaurantId,
      rating,
      review_text: reviewText,
      visit_date: visitDate,
    })
    .select("review_id")
    .single();
  if (error) throw error;
  revalidatePath("/feed");
  revalidatePath("/profile");
  return data.review_id as string;
}

export async function updateReview(
  reviewId: string,
  params: { rating?: number; reviewText?: string | null; visitDate?: string | null }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const updates: { rating?: number; review_text?: string | null; visit_date?: string | null } = {};
  if (params.rating != null) updates.rating = Math.min(RATING_MAX, Math.max(RATING_MIN, Number(params.rating)));
  if (params.reviewText !== undefined) updates.review_text = params.reviewText?.slice(0, REVIEW_TEXT_MAX) ?? null;
  if (params.visitDate !== undefined) updates.visit_date = params.visitDate || null;

  const { error } = await supabase
    .from("reviews")
    .update(updates)
    .eq("review_id", reviewId)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/feed");
  revalidatePath("/profile");
}

export async function deleteReview(reviewId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("review_id", reviewId)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/feed");
  revalidatePath("/profile");
}
