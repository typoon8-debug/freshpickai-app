import { BrandHeader } from "@/components/layout/brand-header";
import { FamilyBanner } from "@/components/family/family-banner";
import { MemberGrid } from "@/components/family/member-grid";
import { DinnerVote } from "@/components/family/dinner-vote";
import { PopularRanking } from "@/components/family/popular-ranking";
import { TrendingCards } from "@/components/family/trending-cards";
import { KidsPreference } from "@/components/family/kids-preference";
import { FamilyMission } from "@/components/family/family-mission";
import { FamilyInvite } from "@/components/family/family-invite";
import { MovieNightButton } from "@/components/family/movie-night-button";
import { getFamilyGroup, getFamilyMembers } from "@/lib/actions/family";
import {
  getCurrentVoteSession,
  ensureVoteSession,
  getVoteResults,
  getMyVotes,
  getMonthlyPopularCards,
} from "@/lib/actions/family/vote";
import { createClient } from "@/lib/supabase/server";

// 투표용 기본 카드 목록 (홈 화면 인기 카드 기반)
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

  const [group, members] = await Promise.all([getFamilyGroup(), getFamilyMembers()]);

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

      // 월간 인기 카드명 조회 (카드 ID → 이름 매핑)
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

  return (
    <>
      <BrandHeader />
      <FamilyBanner groupName={group?.name ?? "우리 가족"} level={12} mealsThisMonth={47} />
      <div className="flex flex-col gap-6 py-5">
        <MemberGrid />
        <DinnerVote
          session={session}
          voteItems={DEFAULT_VOTE_CARDS}
          initialResults={voteResults}
          initialMyVotes={myVotes}
        />
        <PopularRanking items={monthlyRanking.length > 0 ? monthlyRanking : undefined} />
        <TrendingCards />
        {group && (
          <section className="px-4">
            <h3 className="text-ink-700 mb-3 text-sm font-semibold">무비나이트 🎬</h3>
            <MovieNightButton groupId={group.groupId} />
          </section>
        )}
        <KidsPreference />
        <FamilyMission />
        <FamilyInvite />
      </div>
    </>
  );
}
