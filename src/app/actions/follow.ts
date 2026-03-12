"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function followUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === targetUserId) return;

  await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
  revalidatePath("/profile");
  revalidatePath(`/profile/${targetUserId}`);
}

export async function unfollowUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("follows").delete().match({ follower_id: user.id, following_id: targetUserId });
  revalidatePath("/profile");
  revalidatePath(`/profile/${targetUserId}`);
}
