"use server";

import { createClient } from "@/lib/supabase/server";
import type { CardBookmark } from "@/lib/types";

/** 현재 로그인 유저의 특정 카드 북마크 여부 조회 */
export async function getBookmarkStatusAction(
  cardId: string
): Promise<{ isBookmarked: boolean; bookmarkId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isBookmarked: false };

  const { data } = await supabase
    .from("fp_customer_card_bookmark")
    .select("bookmark_id")
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .maybeSingle();

  return { isBookmarked: !!data, bookmarkId: data?.bookmark_id };
}

/** 북마크 토글 (없으면 추가, 있으면 삭제) */
export async function toggleBookmarkAction(
  cardId: string
): Promise<{ isBookmarked: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isBookmarked: false, error: "로그인이 필요합니다." };

  const { data: existing } = await supabase
    .from("fp_customer_card_bookmark")
    .select("bookmark_id")
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("fp_customer_card_bookmark")
      .delete()
      .eq("bookmark_id", existing.bookmark_id);
    if (error) return { isBookmarked: true, error: error.message };
    return { isBookmarked: false };
  }

  const { error } = await supabase
    .from("fp_customer_card_bookmark")
    .insert({ user_id: user.id, card_id: cardId });
  if (error) return { isBookmarked: false, error: error.message };
  return { isBookmarked: true };
}

/** 현재 로그인 유저의 북마크 카드 목록 조회 */
export async function getBookmarkedCardsAction(): Promise<CardBookmark[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("fp_customer_card_bookmark")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    bookmarkId: row.bookmark_id,
    userId: row.user_id,
    cardId: row.card_id,
    createdAt: row.created_at,
  }));
}
