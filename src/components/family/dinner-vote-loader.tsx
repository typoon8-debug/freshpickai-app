import { createAdminClient } from "@/lib/supabase/server";
import { DinnerVote } from "./dinner-vote";
import { PopularRanking } from "./popular-ranking";
import { TrendingCards } from "./trending-cards";
import {
  getCurrentVoteSession,
  ensureVoteSession,
  getVoteResults,
  getMyVotes,
  getMonthlyPopularCards,
} from "@/lib/actions/family/vote";
import { getAIMenuRecommendations } from "@/lib/actions/family/ai-menu-recommend";

type RankingItem = {
  rank: number;
  cardId: string;
  name: string;
  emoji: string;
  count: number;
};

type Props = {
  groupId: string;
  userId: string;
  trendingFallback?: RankingItem[];
};

export async function DinnerVoteLoader({ groupId, trendingFallback }: Props) {
  const admin = createAdminClient();

  let session = await getCurrentVoteSession(groupId);
  let voteItems: { cardId: string; name: string; emoji: string }[] = [];
  let voteResults: { cardId: string; likeCount: number; dislikeCount: number }[] = [];
  let myVotes: Record<string, "like" | "dislike"> = {};
  let monthlyRanking: RankingItem[] = [];

  if (!session) {
    const { cards: aiCards, title: aiTitle } = await getAIMenuRecommendations(groupId);
    if (aiCards.length > 0) {
      session = await ensureVoteSession(
        groupId,
        aiCards.map((c) => c.cardId),
        aiTitle
      );
      voteItems = aiCards;
    }
  }

  if (session && voteItems.length === 0) {
    const { data: sessionCards } = await admin
      .from("fp_menu_card")
      .select("card_id, name, emoji")
      .in("card_id", session.cardIds);

    const cardMap = new Map((sessionCards ?? []).map((c) => [c.card_id, c]));
    voteItems = session.cardIds
      .map((id) => cardMap.get(id))
      .filter((c): c is { card_id: string; name: string; emoji: string | null } => c !== undefined)
      .map((c) => ({ cardId: c.card_id, name: c.name, emoji: c.emoji ?? "🍽️" }));
  }

  if (session) {
    const [results, votes, popular] = await Promise.all([
      getVoteResults(session.sessionId),
      getMyVotes(session.sessionId),
      getMonthlyPopularCards(groupId),
    ]);
    voteResults = results;
    myVotes = votes;

    if (popular.length > 0) {
      const cardIds = popular.map((p) => p.cardId);
      const { data: cards } = await admin
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

  return (
    <>
      <DinnerVote
        session={session}
        voteItems={voteItems}
        initialResults={voteResults}
        initialMyVotes={myVotes}
      />
      <PopularRanking items={monthlyRanking.length > 0 ? monthlyRanking : undefined} />
      <TrendingCards items={monthlyRanking.length > 0 ? monthlyRanking : trendingFallback} />
    </>
  );
}
