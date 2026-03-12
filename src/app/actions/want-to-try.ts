"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addToWantToTry(restaurantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase.from("want_to_try").insert({ user_id: user.id, restaurant_id: restaurantId });
  revalidatePath("/profile");
  revalidatePath("/map");
}

export async function removeFromWantToTry(restaurantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase.from("want_to_try").delete().match({ user_id: user.id, restaurant_id: restaurantId });
  revalidatePath("/profile");
  revalidatePath("/map");
}
