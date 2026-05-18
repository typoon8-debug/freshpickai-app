import { BrandHeader } from "@/components/layout/brand-header";
import { FamilyBanner } from "@/components/family/family-banner";
import { MemberGrid } from "@/components/family/member-grid";
import { DinnerVote } from "@/components/family/dinner-vote";
import { PopularRanking } from "@/components/family/popular-ranking";
import { TrendingCards } from "@/components/family/trending-cards";
import { KidsPreferenceSection } from "@/components/family/KidsPreferenceSection";
import { FamilyMission } from "@/components/family/family-mission";
import { FamilyInvite } from "@/components/family/family-invite";
import { MovieNightButton } from "@/components/family/movie-night-button";
import { FamilyPollSection } from "@/components/family/family-poll-section";
import { getFamilyGroup, getFamilyMembers, getFamilyStatsAction } from "@/lib/actions/family";
import {
  getCurrentVoteSession,
  ensureVoteSession,
  getVoteResults,
  getMyVotes,
  getMonthlyPopularCards,
} from "@/lib/actions/family/vote";
import {
  getActivePolls,
  getClosedPolls,
  getLatestMovieNightPoll,
  getPollResults,
  getMyPollVote,
} from "@/lib/actions/family/poll";
import { getAIMenuRecommendations } from "@/lib/actions/family/ai-menu-recommend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { FpPoll, PollResult } from "@/lib/types";

export default async function FamilyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [group, members, familyStats] = await Promise.all([
    getFamilyGroup(user?.id),
    getFamilyMembers(user?.id),
    getFamilyStatsAction(user?.id),
  ]);

  // 투표 세션 (없으면 AI 추천으로 자동 생성)
  let session = null;
  let voteItems: { cardId: string; name: string; emoji: string }[] = [];
  let voteResults: { cardId: string; likeCount: number; dislikeCount: number }[] = [];
  let myVotes: Record<string, "like" | "dislike"> = {};
  let monthlyRanking: Array<{
    rank: number;
    cardId: string;
    name: string;
    emoji: string;
    count: number;
  }> = [];

  if (group) {
    session = await getCurrentVoteSession(group.groupId);

    if (!session) {
      // AI가 이번 주 메뉴 3가지를 추천 → 새 세션 생성
      const { cards: aiCards, title: aiTitle } = await getAIMenuRecommendations(group.groupId);
      if (aiCards.length > 0) {
        session = await ensureVoteSession(
          group.groupId,
          aiCards.map((c) => c.cardId),
          aiTitle
        );
        voteItems = aiCards;
      }
    }

    // 기존 세션이 있으면 실제 카드 정보를 DB에서 조회
    if (session && voteItems.length === 0) {
      const adminForCards = createAdminClient();
      const { data: sessionCards } = await adminForCards
        .from("fp_menu_card")
        .select("card_id, name, emoji")
        .in("card_id", session.cardIds);

      const cardMap = new Map((sessionCards ?? []).map((c) => [c.card_id, c]));
      voteItems = session.cardIds
        .map((id) => cardMap.get(id))
        .filter(
          (c): c is { card_id: string; name: string; emoji: string | null } => c !== undefined
        )
        .map((c) => ({ cardId: c.card_id, name: c.name, emoji: c.emoji ?? "🍽️" }));
    }

    if (session && user) {
      const [results, votes, popular] = await Promise.all([
        getVoteResults(session.sessionId),
        getMyVotes(session.sessionId),
        getMonthlyPopularCards(group.groupId),
      ]);
      voteResults = results;
      myVotes = votes;

      // 월간 인기 카드명 조회
      if (popular.length > 0) {
        const cardIds = popular.map((p) => p.cardId);
        const { data: cards } = await supabase
          .from("fp_menu_card")
          .select("card_id, name, emoji")
          .in("card_id", cardIds);

        const cardMap = new Map(
          (cards ?? []).map((c) => [c.card_id, { name: c.name, emoji: c.emoji ?? "" }])
        );

        monthlyRanking = popular.map((p, i) => ({
          rank: i + 1,
          cardId: p.cardId,
          name: cardMap.get(p.cardId)?.name ?? p.cardId,
          emoji: cardMap.get(p.cardId)?.emoji ?? "🍽️",
          count: p.likeCount,
        }));
      }
    }
  }

  // 미션 + 트렌딩 폴백용: 실제 존재하는 공식 카드 조회
  const { data: officialCards } = await supabase
    .from("fp_menu_card")
    .select("card_id, name, emoji")
    .eq("is_official", true)
    .limit(5);

  const missionCards = (officialCards ?? []).slice(0, 2);
  // 트렌딩 폴백: 실제 카드 ID를 사용해 404 방지
  const trendingFallback =
    officialCards && officialCards.length >= 3
      ? officialCards.slice(0, 3).map((c, i) => ({
          rank: i + 1,
          cardId: c.card_id,
          name: c.name,
          emoji: c.emoji ?? "🍽️",
          count: 0,
        }))
      : undefined;

  // 활성 투표 안건 + 결과 + 내 투표 조회 (일반 투표, movie_night 제외)
  let activePolls: Array<{
    poll: FpPoll;
    results: PollResult[];
    myVoteOptionId: string | null;
    totalTargeted: number;
  }> = [];

  // 최근 완료된 일반 투표
  let closedPolls: Array<{
    poll: FpPoll;
    results: PollResult[];
    myVoteOptionId: string | null;
    totalTargeted: number;
  }> = [];

  // 최신 무비나이트 투표 (가장 최근 1건, ends_at 무관)
  let movieNightPollData: {
    poll: FpPoll;
    results: PollResult[];
    totalVoted: number;
    totalTargeted: number;
  } | null = null;

  if (group && user) {
    const [rawActive, rawClosed, movieNight] = await Promise.all([
      getActivePolls(group.groupId),
      getClosedPolls(group.groupId),
      getLatestMovieNightPoll(group.groupId),
    ]);

    movieNightPollData = movieNight;

    activePolls = await Promise.all(
      rawActive.map(async (poll) => {
        const [{ results, totalTargeted }, myVote] = await Promise.all([
          getPollResults(poll.pollId),
          getMyPollVote(poll.pollId),
        ]);
        return { poll, results, myVoteOptionId: myVote?.optionId ?? null, totalTargeted };
      })
    );

    closedPolls = await Promise.all(
      rawClosed.map(async (poll) => {
        const [{ results, totalTargeted }, myVote] = await Promise.all([
          getPollResults(poll.pollId),
          getMyPollVote(poll.pollId),
        ]);
        return { poll, results, myVoteOptionId: myVote?.optionId ?? null, totalTargeted };
      })
    );
  }

  // 로그인 사용자 표시 이름 (FamilyInvite용)
  const { data: myProfile } = await supabase
    .from("fp_user_profile")
    .select("display_name")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const inviterName = myProfile?.display_name ?? "나";

  // 키즈 멤버 (실제 members에서 탐색)
  const kidsMember =
    members.find((m) => m.familyRole === "kid" || m.familyRole === "teen") ?? undefined;

  return (
    <>
      <BrandHeader />
      <FamilyBanner
        groupName={group?.name ?? "우리 가족"}
        level={familyStats.level}
        mealsThisMonth={familyStats.mealsThisMonth}
      />
      <div className="flex flex-col gap-6 py-5">
        <MemberGrid members={members} currentUserId={user?.id} hasGroup={!!group} />
        <DinnerVote
          session={session}
          voteItems={voteItems}
          initialResults={voteResults}
          initialMyVotes={myVotes}
        />
        <PopularRanking items={monthlyRanking.length > 0 ? monthlyRanking : undefined} />
        <TrendingCards items={monthlyRanking.length > 0 ? monthlyRanking : trendingFallback} />
        {group && (
          <FamilyPollSection
            groupId={group.groupId}
            currentUserId={user?.id ?? ""}
            polls={activePolls}
            closedPolls={closedPolls}
          />
        )}
        {group && (
          <section className="px-4">
            <h3 className="text-ink-700 mb-3 text-sm font-semibold">무비나이트 🎬</h3>
            <MovieNightButton
              groupId={group.groupId}
              currentUserId={user?.id ?? ""}
              totalFamilyMembers={members.length}
              initialActivePoll={movieNightPollData}
            />
          </section>
        )}
        {kidsMember && (
          <KidsPreferenceSection groupId={group?.groupId ?? ""} kidsMember={kidsMember} />
        )}
        <FamilyMission cards={missionCards ?? []} />
        <FamilyInvite
          groupName={group?.name ?? "우리가족"}
          inviterName={inviterName}
          presetCode={group?.inviteCode}
        />
      </div>
    </>
  );
}
