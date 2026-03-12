"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SaveToWantToTryButton({
  restaurantId,
  currentUserId,
  initialSaved = false,
}: {
  restaurantId: string;
  currentUserId: string;
  initialSaved?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);

  async function toggle() {
    const supabase = createClient();
    if (saved) {
      await supabase.from("want_to_try").delete().match({ user_id: currentUserId, restaurant_id: restaurantId });
      setSaved(false);
    } else {
      await supabase.from("want_to_try").insert({ user_id: currentUserId, restaurant_id: restaurantId });
      setSaved(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`text-xs ${saved ? "text-brand-700 font-medium" : "text-stone-500 hover:text-stone-700"}`}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
