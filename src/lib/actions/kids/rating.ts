"use server";

import { createClient } from "@/lib/supabase/server";
import type { KidsPreferredCard } from "@/lib/types";

type KidsRatingScore = 1 | 2 | 3 | 4 | 5;

/** 그룹별 키즈 별점 전용 세션 생성 또는 조회 */
async function ensureKidsRatingSession(groupId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("fp_vote_session")
    .select("session_id")
    .eq("group_id", groupId)
    .eq("title", "KIDS_RATING")
    .limit(1)
    .maybeSingle();

  if (existing) return existing.session_id;

  const farFuture = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const { data: created } = await supabase
    .from("fp_vote_session")
    .insert({
      group_id: groupId,
      title: "KIDS_RATING",
      card_ids: [],
      ends_at: farFuture,
      status: "open",
    })
    .select("session_id")
    .single();

  return created?.session_id ?? null;
}

/** 카드 별점 저장 — vote_type: KIDS_RATING_1 ~ KIDS_RATING_5 */
export async function rateCard(
  cardId: string,
  memberId: string,
  rating: KidsRatingScore
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };

  const { data: member } = await supabase
    .from("fp_family_member")
    .select("group_id")
    .eq("member_id", memberId)
    .maybeSingle();

  if (!member) return { ok: false, error: "MEMBER_NOT_FOUND" };

  const sessionId = await ensureKidsRatingSession(member.group_id);
  if (!sessionId) return { ok: false, error: "SESSION_ERROR" };

  const { error } = await supabase.from("fp_family_vote").upsert(
    {
      session_id: sessionId,
      group_id: member.group_id,
      card_id: cardId,
      user_id: user.id,
      vote_type: `KIDS_RATING_${rating}`,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id,group_id,card_id,user_id" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** 현재 사용자의 특정 카드 별점 조회 */
export async function getMyCardRating(
  groupId: string,
  cardId: string
): Promise<KidsRatingScore | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: session } = await supabase
    .from("fp_vote_session")
    .select("session_id")
    .eq("group_id", groupId)
    .eq("title", "KIDS_RATING")
    .maybeSingle();

  if (!session) return null;

  const { data: vote } = await supabase
    .from("fp_family_vote")
    .select("vote_type")
    .eq("session_id", session.session_id)
    .eq("card_id", cardId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vote) return null;

  const match = vote.vote_type.match(/^KIDS_RATING_(\d)$/);
  if (!match) return null;

  const score = parseInt(match[1], 10);
  return score >= 1 && score <= 5 ? (score as KidsRatingScore) : null;
}

/** 평균 별점 ≥ 4.0 카드 목록 조회 */
export async function getKidsPreferredCards(groupId: string): Promise<KidsPreferredCard[]> {
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("fp_vote_session")
    .select("session_id")
    .eq("group_id", groupId)
    .eq("title", "KIDS_RATING")
    .maybeSingle();

  if (!session) return [];

  const { data: votes } = await supabase
    .from("fp_family_vote")
    .select("card_id, vote_type")
    .eq("session_id", session.session_id)
    .like("vote_type", "KIDS_RATING_%");

  if (!votes || votes.length === 0) return [];

  const ratingMap: Record<string, { sum: number; count: number }> = {};
  for (const vote of votes) {
    const match = vote.vote_type.match(/^KIDS_RATING_(\d)$/);
    if (!match) continue;
    const score = parseInt(match[1], 10);
    if (!ratingMap[vote.card_id]) ratingMap[vote.card_id] = { sum: 0, count: 0 };
    ratingMap[vote.card_id].sum += score;
    ratingMap[vote.card_id].count++;
  }

  const preferredIds = Object.entries(ratingMap)
    .filter(([, { sum, count }]) => sum / count >= 4.0)
    .map(([cardId]) => cardId);

  if (preferredIds.length === 0) return [];

  const { data: cards } = await supabase
    .from("fp_menu_card")
    .select("card_id, name, emoji")
    .in("card_id", preferredIds);

  return (cards ?? []).map((c) => ({
    cardId: c.card_id,
    name: c.name,
    emoji: c.emoji ?? "🍽️",
    avgRating: ratingMap[c.card_id].sum / ratingMap[c.card_id].count,
    ratingCount: ratingMap[c.card_id].count,
  }));
}
