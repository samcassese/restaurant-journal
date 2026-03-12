"use client";

import { useState } from "react";
import { followUser, unfollowUser } from "@/app/actions/follow";

export function FollowButton({
  targetUserId,
  initialFollowing,
}: {
  targetUserId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);

  async function handleClick() {
    if (following) {
      await unfollowUser(targetUserId);
      setFollowing(false);
    } else {
      await followUser(targetUserId);
      setFollowing(true);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-2 rounded-md px-3 py-1.5 text-sm border border-stone-300 bg-white hover:bg-stone-50"
    >
      {following ? "Unfollow" : "Follow"}
    </button>
  );
}
