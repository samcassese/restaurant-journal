"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LikeButton({
  reviewId,
  currentUserId,
  initialLiked = false,
  initialCount = 0,
}: {
  reviewId: string;
  currentUserId: string;
  initialLiked?: boolean;
  initialCount?: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  async function toggle() {
    const supabase = createClient();
    if (liked) {
      await supabase.from("review_likes").delete().match({ review_id: reviewId, user_id: currentUserId });
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("review_likes").insert({ review_id: reviewId, user_id: currentUserId });
      setLiked(true);
      setCount((c) => c + 1);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`text-xs ${liked ? "text-brand-700 font-medium" : "text-stone-500 hover:text-stone-700"}`}
    >
      {liked ? "Liked" : "Like"}{count > 0 ? ` · ${count}` : ""}
    </button>
  );
}
