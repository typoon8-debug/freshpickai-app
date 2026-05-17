"use server";

import { createClient } from "@/lib/supabase/server";
import type { NotificationSettings } from "@/lib/types";

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { voteNotify: true, movieNightNotify: true, deliveryNotify: true };

  const { data } = await supabase
    .from("fp_user_notification_settings")
    .select("vote_notify, movie_night_notify, delivery_notify")
    .eq("user_id", user.id)
    .single();

  return {
    voteNotify: data?.vote_notify ?? true,
    movieNightNotify: data?.movie_night_notify ?? true,
    deliveryNotify: data?.delivery_notify ?? true,
  };
}

export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase.from("fp_user_notification_settings").upsert(
    {
      user_id: user.id,
      vote_notify: settings.voteNotify ?? true,
      movie_night_notify: settings.movieNightNotify ?? true,
      delivery_notify: settings.deliveryNotify ?? true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return { ok: !error };
}
