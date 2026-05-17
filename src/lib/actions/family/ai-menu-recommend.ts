"use server";

import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { getAiModelId, AI_MODEL_KEYS } from "@/lib/ai/model-config";

export interface RecommendedVoteCard {
  cardId: string;
  name: string;
  emoji: string;
}

export interface AIMenuRecommendResult {
  cards: RecommendedVoteCard[];
  title: string;
}

// ── 이번 주 뭐먹지? AI 메뉴 추천 ────────────────────────────────
// 가족 취향 + 공식 카드 풀 기반으로 Claude Haiku가 3가지 메뉴를 선정
export async function getAIMenuRecommendations(groupId: string): Promise<AIMenuRecommendResult> {
  const admin = createAdminClient();

  // 공식 카드 풀 조회 (다양한 카테고리, 최대 30개)
  const { data: poolCards } = await admin
    .from("fp_menu_card")
    .select("card_id, name, emoji, category, card_theme, subtitle")
    .eq("is_official", true)
    .eq("review_status", "approved")
    .limit(30);

  if (!poolCards || poolCards.length < 3) {
    // DB에 카드가 부족하면 폴백
    return buildFallback(poolCards ?? []);
  }

  // 가족이 최근 좋아요한 카드 ID (개인화 재료)
  const { data: recentLikes } = await admin
    .from("fp_family_vote")
    .select("card_id")
    .eq("group_id", groupId)
    .eq("vote_type", "like")
    .order("created_at", { ascending: false })
    .limit(15);

  const likedIds = new Set((recentLikes ?? []).map((v) => v.card_id));
  const likedNames = poolCards
    .filter((c) => likedIds.has(c.card_id))
    .map((c) => c.name)
    .join(", ");

  // 카드 목록 텍스트 구성
  const cardList = poolCards
    .map(
      (c) =>
        `ID:${c.card_id} | ${c.emoji ?? "🍽️"} ${c.name}${c.subtitle ? ` (${c.subtitle})` : ""} | 카테고리:${c.category} | 테마:${c.card_theme}`
    )
    .join("\n");

  try {
    const modelId = await getAiModelId(AI_MODEL_KEYS.RECOMMEND);

    const { object } = await generateObject({
      model: anthropic(modelId),
      schema: z.object({
        title: z
          .string()
          .describe("이번 주 투표 세션 제목 — 흥미롭고 간결하게, 15자 이하, 이모지 포함 가능"),
        selectedCardIds: z
          .array(z.string())
          .length(3)
          .describe("선택된 카드 card_id 3개. 반드시 목록에 있는 ID만 사용"),
      }),
      prompt: `당신은 가족 맞춤형 주간 메뉴 큐레이터입니다.
아래 공식 메뉴 카드 중에서 이번 주 가족 투표에 올릴 3가지를 선택해주세요.

선택 기준:
1. meal / snack / cinema 카테고리를 고루 섞어 다양성 확보
2. 가족이 최근 좋아한 메뉴 참고: ${likedNames || "데이터 없음 (첫 추천)"}
3. 서로 다른 card_theme을 선택해 테마 중복 최소화

사용 가능한 카드 목록:
${cardList}

card_id는 UUID 형식입니다. 반드시 위 목록에 실제로 존재하는 card_id만 selectedCardIds에 넣으세요.`,
    });

    // 유효한 카드만 필터 후 카드 정보 매핑
    const cardMap = new Map(poolCards.map((c) => [c.card_id, c]));
    const selected: RecommendedVoteCard[] = object.selectedCardIds
      .filter((id) => cardMap.has(id))
      .map((id) => {
        const c = cardMap.get(id)!;
        return { cardId: c.card_id, name: c.name, emoji: c.emoji ?? "🍽️" };
      });

    // 3개 미만이면 나머지 카드로 보충
    if (selected.length < 3) {
      const usedIds = new Set(selected.map((c) => c.cardId));
      const extras = poolCards
        .filter((c) => !usedIds.has(c.card_id))
        .slice(0, 3 - selected.length)
        .map((c) => ({ cardId: c.card_id, name: c.name, emoji: c.emoji ?? "🍽️" }));
      selected.push(...extras);
    }

    return { cards: selected.slice(0, 3), title: object.title };
  } catch {
    return buildFallback(poolCards);
  }
}

function buildFallback(
  poolCards: { card_id: string; name: string; emoji: string | null }[]
): AIMenuRecommendResult {
  const cards = poolCards
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((c) => ({ cardId: c.card_id, name: c.name, emoji: c.emoji ?? "🍽️" }));
  return { cards, title: "이번 주 뭐 먹지? 🗳️" };
}
