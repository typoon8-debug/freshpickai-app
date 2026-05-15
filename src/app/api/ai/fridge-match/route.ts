import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { getAiModelId, AI_MODEL_KEYS } from "@/lib/ai/model-config";

export const maxDuration = 30;

const MatchedCardSchema = z.object({
  cards: z.array(
    z.object({
      cardId: z.string(),
      name: z.string(),
      emoji: z.string().optional(),
      description: z.string().optional(),
      matchScore: z.number().min(0).max(1),
    })
  ),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await req.json()) as { ingredients?: unknown };
  if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
    return NextResponse.json({ error: "재료를 1개 이상 입력해 주세요." }, { status: 400 });
  }

  const ingredients: string[] = body.ingredients
    .filter((i): i is string => typeof i === "string" && i.trim().length > 0)
    .slice(0, 20);

  if (ingredients.length === 0) {
    return NextResponse.json({ error: "유효한 재료가 없습니다." }, { status: 400 });
  }

  // 카드 및 재료 목록 조회 (최대 50개, 공식 카드 우선 정렬)
  const { data: cards } = await supabase
    .from("fp_menu_card")
    .select("card_id, name, emoji, description, cover_image")
    .eq("review_status", "approved")
    .order("is_official", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (!cards || cards.length === 0) {
    return NextResponse.json({ cards: [] });
  }

  // 각 카드의 재료 조회
  const cardIds = cards.map((c) => c.card_id);
  const { data: cardDishes } = await supabase
    .from("fp_card_dish")
    .select("card_id, dish_id")
    .in("card_id", cardIds);

  const dishIds = [...new Set((cardDishes ?? []).map((cd) => cd.dish_id))];

  const { data: dishIngredients } =
    dishIds.length > 0
      ? await supabase.from("fp_dish_ingredient").select("dish_id, name").in("dish_id", dishIds)
      : { data: [] };

  // 카드별 재료 매핑
  const dishToCard: Record<string, string[]> = {};
  (cardDishes ?? []).forEach((cd) => {
    if (!dishToCard[cd.dish_id]) dishToCard[cd.dish_id] = [];
    dishToCard[cd.dish_id].push(cd.card_id);
  });

  const cardIngredientMap: Record<string, string[]> = {};
  (dishIngredients ?? []).forEach((di) => {
    const cids = dishToCard[di.dish_id] ?? [];
    cids.forEach((cid) => {
      if (!cardIngredientMap[cid]) cardIngredientMap[cid] = [];
      cardIngredientMap[cid].push(di.name);
    });
  });

  // 재료 정규화 함수: 공백 제거, 소문자 변환
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "");

  // 재료 매칭 함수: 정확 일치 우선, 부분 포함 보조
  const isMatch = (userIng: string, cardIng: string): boolean => {
    const u = normalize(userIng);
    const c = normalize(cardIng);
    if (u === c) return true;
    // 긴 쪽이 짧은 쪽을 포함하되, 최소 2자 이상인 경우만 허용 (단글자 오탐 방지)
    const shorter = u.length <= c.length ? u : c;
    const longer = u.length <= c.length ? c : u;
    return shorter.length >= 2 && longer.includes(shorter);
  };

  // 복합 스코어 계산 (AI 보조 전 프리-필터)
  // - 사용자 보유 커버리지(0.6): 사용자 재료 중 카드에 쓰이는 비율
  // - 카드 완성도(0.4): 카드 재료 중 사용자가 가진 비율
  const scored = cards
    .map((card) => {
      const cardIngredients = cardIngredientMap[card.card_id] ?? [];
      if (cardIngredients.length === 0) return null;

      const matchedUserIngs = ingredients.filter((ing) =>
        cardIngredients.some((ci) => isMatch(ing, ci))
      );
      const matchCount = matchedUserIngs.length;
      if (matchCount === 0) return null;

      const userCoverage = matchCount / ingredients.length;
      const cardCompleteness = matchCount / cardIngredients.length;
      const compositeScore = userCoverage * 0.6 + cardCompleteness * 0.4;

      return {
        cardId: card.card_id,
        name: card.name,
        emoji: card.emoji ?? undefined,
        description: card.description ?? undefined,
        coverImage: card.cover_image ?? undefined,
        rawScore: compositeScore,
        matchCount,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 10); // AI로 넘길 후보군

  if (scored.length === 0) {
    return NextResponse.json({ cards: [] });
  }

  // AI로 최종 3개 선별
  const candidateText = scored
    .map(
      (c, i) => `${i + 1}. [${c.cardId}] ${c.name} — 재료 일치율 ${Math.round(c.rawScore * 100)}%`
    )
    .join("\n");

  const modelId = await getAiModelId(AI_MODEL_KEYS.FRIDGE_MATCH);

  try {
    const { object } = await generateObject({
      model: anthropic(modelId),
      schema: MatchedCardSchema,
      prompt: `사용자가 가진 재료: ${ingredients.join(", ")}

다음 카드 중에서 이 재료들로 만들 수 있는 최적의 카드 3개를 선택하고, 0~1 사이의 matchScore를 부여하세요.
재료 보유량, 조리 난이도, 재료 활용도를 고려하세요.

후보 카드:
${candidateText}

응답 형식: { cards: [{ cardId, name, emoji, description, matchScore }] } (최대 3개)`,
    });

    const result = object.cards
      .map((c) => {
        const original = scored.find((s) => s.cardId === c.cardId);
        return {
          cardId: c.cardId,
          name: c.name,
          emoji: c.emoji,
          description: c.description,
          coverImage: original?.coverImage,
          matchScore: c.matchScore,
        };
      })
      .slice(0, 3);

    return NextResponse.json({ cards: result });
  } catch {
    // AI 실패 시 스코어 기반 상위 3개 반환
    const fallback = scored.slice(0, 3).map((c) => ({
      cardId: c.cardId,
      name: c.name,
      emoji: c.emoji,
      description: c.description,
      coverImage: c.coverImage,
      matchScore: c.rawScore,
    }));
    return NextResponse.json({ cards: fallback });
  }
}
