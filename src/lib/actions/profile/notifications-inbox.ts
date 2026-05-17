"use server";

import { createClient } from "@/lib/supabase/server";

export type NotificationItem = {
  id: string;
  type: "vote" | "movie_night" | "delivery" | "system";
  title: string;
  body: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

/** 최근 알림 20개 조회 (최신순) */
export async function getInboxNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("fp_notifications")
    .select("id, type, title, body, link_url, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type as NotificationItem["type"],
    title: row.title,
    body: row.body,
    linkUrl: row.link_url,
    isRead: row.is_read,
    createdAt: row.created_at,
  }));
}

/** 읽지 않은 알림 수 */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("fp_notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return count ?? 0;
}

/** 단일 알림 읽음 처리 */
export async function markNotificationRead(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("fp_notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
}

/** 전체 알림 읽음 처리 */
export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("fp_notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_read", false);
}
