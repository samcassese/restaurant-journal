"use client";

import Link from "next/link";

export function CommentButton({
  reviewId,
  restaurantPlaceId,
}: {
  reviewId: string;
  restaurantPlaceId?: string;
}) {
  const href = restaurantPlaceId
    ? `/restaurant/${restaurantPlaceId}?review=${reviewId}#comments`
    : `/#comments`;
  return (
    <Link href={href} className="text-xs text-stone-500 hover:text-stone-700">
      Comment
    </Link>
  );
}
