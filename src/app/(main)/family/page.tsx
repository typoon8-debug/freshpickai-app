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
import { getFamilyGroup, getFamilyMembers, getFamilyStatsAction } from "@/lib/actions/family";
import {
  getCurrentVoteSession,
  ensureVoteSession,
  getVoteResults,
  getMyVotes,
  getMonthlyPopularCards,
} from "@/lib/actions/family/vote";
import { createClient } from "@/lib/supabase/server";

// 투표용 기본 카드 목록 — DB에 실제로 없을 경우 DinnerVote에 제목만 표시
const DEFAULT_VOTE_CARDS = [
  { cardId: "c01", name: "셰프의 갈비찜 정식", emoji: "🥩" },
  { cardId: "c07", name: "제철 봄나물 비빔밥", emoji: "🌿" },
  { cardId: "c03", name: "홈시네마 나이트", emoji: "🍿" },
];

export default async function FamilyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [group, members, familyStats] = await Promise.all([
    getFamilyGroup(),
    getFamilyMembers(),
    getFamilyStatsAction(),
  ]);

  // 투표 세션 (없으면 자동 생성)
  let session = null;
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
      session = await ensureVoteSession(
        group.groupId,
        DEFAULT_VOTE_CARDS.map((c) => c.cardId)
      );
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
          voteItems={DEFAULT_VOTE_CARDS}
          initialResults={voteResults}
          initialMyVotes={myVotes}
        />
        <PopularRanking items={monthlyRanking.length > 0 ? monthlyRanking : undefined} />
        <TrendingCards items={monthlyRanking.length > 0 ? monthlyRanking : trendingFallback} />
        {group && (
          <section className="px-4">
            <h3 className="text-ink-700 mb-3 text-sm font-semibold">무비나이트 🎬</h3>
            <MovieNightButton
              groupId={group.groupId}
              currentUserId={user?.id ?? ""}
              totalFamilyMembers={members.length}
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
