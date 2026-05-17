"use server";

import { createClient } from "@/lib/supabase/server";

/** 클라이언트에서 받은 FCM 토큰을 fp_user_profile에 저장 */
export async function upsertFcmToken(token: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("fp_user_profile")
    .update({ fcm_token: token, fcm_updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  return { ok: !error };
}

/** 로그아웃 시 FCM 토큰 제거 */
export async function clearFcmToken(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("fp_user_profile")
    .update({ fcm_token: null, fcm_updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  return { ok: !error };
}
