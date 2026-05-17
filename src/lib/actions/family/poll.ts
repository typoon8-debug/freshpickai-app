"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendPollCreatedNotification, sendVoteReminderNotification } from "@/lib/actions/push/send";
import type { FpPoll, FpPollVote, PollOption, PollResult, PollType } from "@/lib/types";

// ── 타입 변환 헬퍼 ────────────────────────────────────────────
function rowToPoll(row: {
  poll_id: string;
  group_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  options: unknown;
  target_member_ids: unknown;
  ends_at: string;
  status: string;
  poll_type: string;
  result_card_id: string | null;
  created_at: string;
  closed_at: string | null;
}): FpPoll {
  return {
    pollId: row.poll_id,
    groupId: row.group_id,
    creatorId: row.creator_id,
    title: row.title,
    description: row.description ?? undefined,
    options: (row.options as PollOption[]) ?? [],
    targetMemberIds: row.target_member_ids ? (row.target_member_ids as string[]) : undefined,
    endsAt: row.ends_at,
    status: row.status as FpPoll["status"],
    pollType: row.poll_type as PollType,
    resultCardId: row.result_card_id ?? undefined,
    createdAt: row.created_at,
    closedAt: row.closed_at ?? undefined,
  };
}

// ── 투표 안건 생성 ────────────────────────────────────────────
export async function createPoll(input: {
  groupId: string;
  title: string;
  description?: string;
  options: PollOption[];
  targetMemberIds?: string[];
  endsAt: Date;
  pollType?: PollType;
}): Promise<{ ok: boolean; poll?: FpPoll; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };

  // fp_family_member SELECT RLS가 순환 정책으로 fp_poll INSERT RLS 검사 시 실패함
  // getFamilyGroup()과 동일하게 admin client로 멤버십을 직접 검증 후 INSERT
  const admin = createAdminClient();

  const { data: membership } = await admin
    .from("fp_family_member")
    .select("member_id")
    .eq("group_id", input.groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return { ok: false, error: "FAMILY_REQUIRED" };

  const { data, error } = await admin
    .from("fp_poll")
    .insert({
      group_id: input.groupId,
      creator_id: user.id,
      title: input.title,
      description: input.description,
      options: input.options,
      target_member_ids: input.targetMemberIds ?? null,
      ends_at: input.endsAt.toISOString(),
      poll_type: input.pollType ?? "general",
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[createPoll] INSERT 실패:", error?.message, error?.code);
    return { ok: false, error: error?.message };
  }

  const poll = rowToPoll(data);

  // 생성자 이름 조회
  const { data: profile } = await supabase
    .from("fp_user_profile")
    .select("display_name")
    .eq("user_id", user.id)
    .single();

  // 비동기 FCM 알림 (실패해도 응답에 영향 없음)
  sendPollCreatedNotification({
    groupId: input.groupId,
    pollId: poll.pollId,
    creatorName: profile?.display_name ?? "가족",
    pollTitle: input.title,
    targetMemberIds: input.targetMemberIds,
  }).catch(() => null);

  return { ok: true, poll };
}

// ── 활성 일반 투표 목록 조회 (movie_night 제외, 만료된 open 포함) ─
// fp_poll RLS가 fp_family_member 순환 의존으로 실패하므로 admin client 사용
export async function getActivePolls(groupId: string): Promise<FpPoll[]> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("fp_poll")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "open")
    .neq("poll_type", "movie_night")
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map(rowToPoll);
}

// ── 최근 완료된 일반 투표 목록 (movie_night 제외) ─────────────
// fp_poll RLS 순환 의존으로 admin client 사용
export async function getClosedPolls(groupId: string): Promise<FpPoll[]> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("fp_poll")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "closed")
    .neq("poll_type", "movie_night")
    .order("closed_at", { ascending: false })
    .limit(10);

  return (data ?? []).map(rowToPoll);
}

// ── 최신 무비나이트 투표 조회 (ends_at 무관, 가장 최근 1건) ──
// fp_poll RLS 순환 의존으로 admin client 사용
export async function getLatestMovieNightPoll(groupId: string): Promise<{
  poll: FpPoll;
  results: PollResult[];
  totalVoted: number;
  totalTargeted: number;
} | null> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("fp_poll")
    .select("*")
    .eq("group_id", groupId)
    .eq("poll_type", "movie_night")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const poll = rowToPoll(data);
  const { results, totalVoted, totalTargeted } = await getPollResults(poll.pollId);
  return { poll, results, totalVoted, totalTargeted };
}

// ── 투표 안건 단건 조회 ────────────────────────────────────────
export async function getPoll(pollId: string): Promise<FpPoll | null> {
  const admin = createAdminClient();
  const { data } = await admin.from("fp_poll").select("*").eq("poll_id", pollId).single();
  return data ? rowToPoll(data) : null;
}

// ── 투표 응답 등록/변경 ────────────────────────────────────────
export async function castPollVote(input: {
  pollId: string;
  groupId: string;
  optionId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };

  // fp_poll RLS 순환 의존으로 admin client로 마감 여부 확인
  const admin = createAdminClient();
  const { data: poll } = await admin
    .from("fp_poll")
    .select("status, ends_at")
    .eq("poll_id", input.pollId)
    .single();

  if (!poll || poll.status !== "open" || poll.ends_at < new Date().toISOString()) {
    return { ok: false, error: "POLL_CLOSED" };
  }

  const { error } = await supabase.from("fp_poll_vote").upsert(
    {
      poll_id: input.pollId,
      group_id: input.groupId,
      user_id: user.id,
      option_id: input.optionId,
    },
    { onConflict: "poll_id,user_id" }
  );

  return { ok: !error, error: error?.message };
}

// ── 투표 응답 취소 ─────────────────────────────────────────────
export async function cancelPollVote(pollId: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("fp_poll_vote")
    .delete()
    .eq("poll_id", pollId)
    .eq("user_id", user.id);

  return { ok: !error };
}

// ── 투표 결과 집계 ─────────────────────────────────────────────
export async function getPollResults(pollId: string): Promise<{
  poll: FpPoll | null;
  results: PollResult[];
  totalVoted: number;
  totalTargeted: number;
}> {
  const admin = createAdminClient();

  const [{ data: poll }, { data: rpcRows }, { data: votes }, { data: members }] = await Promise.all(
    [
      admin.from("fp_poll").select("*").eq("poll_id", pollId).single(),
      admin.rpc("fp_get_poll_results", { p_poll_id: pollId }),
      admin
        .from("fp_poll_vote")
        .select("user_id, option_id, fp_user_profile(display_name)")
        .eq("poll_id", pollId),
      admin.from("fp_poll").select("group_id").eq("poll_id", pollId).single(),
    ]
  );

  if (!poll) return { poll: null, results: [], totalVoted: 0, totalTargeted: 0 };

  const fpPoll = rowToPoll(poll);
  const options = fpPoll.options;

  type VoteRow = {
    user_id: string;
    option_id: string;
    fp_user_profile: { display_name: string } | null;
  };
  // option별 투표자 이름 수집
  const votersByOption: Record<string, string[]> = {};
  ((votes ?? []) as unknown as VoteRow[]).forEach((v) => {
    const name = v.fp_user_profile?.display_name ?? "";
    if (!votersByOption[v.option_id]) votersByOption[v.option_id] = [];
    votersByOption[v.option_id].push(name);
  });

  const results: PollResult[] = options.map((opt) => {
    const rpcRow = (rpcRows ?? []).find(
      (r: { option_id: string; vote_count: number }) => r.option_id === opt.id
    );
    return {
      optionId: opt.id,
      label: opt.label,
      emoji: opt.emoji,
      count: Number(rpcRow?.vote_count ?? 0),
      voterNames: votersByOption[opt.id] ?? [],
    };
  });

  // 전체 대상 인원
  let totalTargeted = 0;
  if (fpPoll.targetMemberIds) {
    totalTargeted = fpPoll.targetMemberIds.length;
  } else if (members) {
    const { data: memberCount } = await admin
      .from("fp_family_member")
      .select("member_id", { count: "exact", head: true })
      .eq("group_id", members.group_id);
    totalTargeted = (memberCount as unknown as { count: number })?.count ?? 0;
  }

  return {
    poll: fpPoll,
    results,
    totalVoted: (votes ?? []).length,
    totalTargeted,
  };
}

// ── 투표 마감 (생성자 수동 마감 또는 자동) ────────────────────
export async function closePoll(pollId: string): Promise<{
  ok: boolean;
  winnerId?: string;
  winnerLabel?: string;
}> {
  const admin = createAdminClient();

  const { results } = await getPollResults(pollId);
  const winner = results.sort((a, b) => b.count - a.count)[0];

  await admin
    .from("fp_poll")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("poll_id", pollId);

  return {
    ok: true,
    winnerId: winner?.optionId,
    winnerLabel: winner?.label,
  };
}

// ── 미투표 구성원에게 독려 알림 발송 ─────────────────────────
export async function sendPollReminder(pollId: string): Promise<{ ok: boolean }> {
  const admin = createAdminClient();

  const { data: poll } = await admin
    .from("fp_poll")
    .select("group_id, title, target_member_ids")
    .eq("poll_id", pollId)
    .single();
  if (!poll) return { ok: false };

  const { data: votedUsers } = await admin
    .from("fp_poll_vote")
    .select("user_id")
    .eq("poll_id", pollId);
  const votedIds = new Set((votedUsers ?? []).map((v) => v.user_id));

  // 대상 구성원 중 미투표자 추출
  let targetIds: string[];
  if (poll.target_member_ids) {
    targetIds = poll.target_member_ids as string[];
  } else {
    const { data: members } = await admin
      .from("fp_family_member")
      .select("user_id")
      .eq("group_id", poll.group_id);
    targetIds = (members ?? []).map((m) => m.user_id);
  }

  const pendingIds = targetIds.filter((id) => !votedIds.has(id));
  if (pendingIds.length === 0) return { ok: true };

  await sendVoteReminderNotification({
    pollId,
    pollTitle: poll.title,
    pendingMemberIds: pendingIds,
  });

  return { ok: true };
}

// ── 현재 사용자의 투표 응답 조회 ─────────────────────────────
export async function getMyPollVote(pollId: string): Promise<FpPollVote | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("fp_poll_vote")
    .select("*")
    .eq("poll_id", pollId)
    .eq("user_id", user.id)
    .single();

  if (!data) return null;
  return {
    voteId: data.vote_id,
    pollId: data.poll_id,
    groupId: data.group_id,
    userId: data.user_id,
    optionId: data.option_id,
    createdAt: data.created_at,
  };
}
