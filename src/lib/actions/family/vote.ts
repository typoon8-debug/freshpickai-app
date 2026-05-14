"use server";

import { createClient } from "@/lib/supabase/server";
import type { VoteSessionRecord, VoteResult } from "@/lib/types";

// ── 현재 활성 투표 세션 조회 ──────────────────────────────────
export async function getCurrentVoteSession(groupId: string): Promise<VoteSessionRecord | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("fp_vote_session")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "open")
    .gt("ends_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  return {
    sessionId: data.session_id,
    groupId: data.group_id,
    title: data.title,
    cardIds: (data.card_ids as string[]) ?? [],
    endsAt: data.ends_at,
    status: data.status as VoteSessionRecord["status"],
    createdAt: data.created_at,
  };
}

// ── 투표 세션 생성 (없을 때 자동 생성) ───────────────────────
export async function ensureVoteSession(
  groupId: string,
  cardIds: string[],
  title?: string
): Promise<VoteSessionRecord | null> {
  const existing = await getCurrentVoteSession(groupId);
  if (existing) return existing;

  const supabase = await createClient();
  const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("fp_vote_session")
    .insert({
      group_id: groupId,
      title: title ?? "이번 주 뭐 먹지?",
      card_ids: cardIds,
      ends_at: endsAt,
      status: "open",
    })
    .select()
    .single();

  if (error || !data) return null;

  return {
    sessionId: data.session_id,
    groupId: data.group_id,
    title: data.title,
    cardIds: (data.card_ids as string[]) ?? [],
    endsAt: data.ends_at,
    status: data.status as VoteSessionRecord["status"],
    createdAt: data.created_at,
  };
}

// ── 투표 캐스팅 (upsert) ────────────────────────────────────
export async function castVote(
  groupId: string,
  sessionId: string,
  cardId: string,
  voteType: "like" | "dislike"
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };

  const { error } = await supabase.from("fp_family_vote").upsert(
    {
      session_id: sessionId,
      group_id: groupId,
      card_id: cardId,
      user_id: user.id,
      vote_type: voteType,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "session_id,group_id,card_id,user_id",
      ignoreDuplicates: false,
    }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── 투표 취소 ─────────────────────────────────────────────
export async function removeVote(sessionId: string, cardId: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  await supabase
    .from("fp_family_vote")
    .delete()
    .eq("session_id", sessionId)
    .eq("card_id", cardId)
    .eq("user_id", user.id);

  return { ok: true };
}

// ── 현재 사용자의 투표 내역 조회 ──────────────────────────────
export async function getMyVotes(sessionId: string): Promise<Record<string, "like" | "dislike">> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("fp_family_vote")
    .select("card_id, vote_type")
    .eq("session_id", sessionId)
    .eq("user_id", user.id);

  const result: Record<string, "like" | "dislike"> = {};
  (data ?? []).forEach((row) => {
    result[row.card_id] = row.vote_type as "like" | "dislike";
  });
  return result;
}

// ── 투표 집계 결과 조회 (RPC) ──────────────────────────────
export async function getVoteResults(sessionId: string): Promise<VoteResult[]> {
  const supabase = await createClient();

  const { data } = await supabase.rpc("fp_get_vote_results", {
    p_session_id: sessionId,
  });

  const rows = (data ?? []) as Array<{
    card_id: string;
    like_count: number;
    dislike_count: number;
  }>;
  return rows.map((row) => ({
    cardId: row.card_id,
    likeCount: row.like_count,
    dislikeCount: row.dislike_count,
  }));
}

// ── 월간 인기 랭킹 조회 (RPC) ─────────────────────────────
export async function getMonthlyPopularCards(
  groupId: string,
  limit = 5
): Promise<Array<{ cardId: string; likeCount: number }>> {
  const supabase = await createClient();

  const { data } = await supabase.rpc("fp_monthly_popular_cards", {
    p_group_id: groupId,
    p_limit: limit,
  });

  const rows = (data ?? []) as Array<{ card_id: string; like_count: number }>;
  return rows.map((row) => ({
    cardId: row.card_id,
    likeCount: row.like_count,
  }));
}
