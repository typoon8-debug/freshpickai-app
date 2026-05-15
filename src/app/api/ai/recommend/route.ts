import { NextRequest } from "next/server";
import { generateObject } from "ai";

export const maxDuration = 60;
import { anthropic } from "@ai-sdk/anthropic";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { buildPersonaContext } from "@/lib/ai/persona-context";
import { getCards } from "@/lib/actions/cards";
import { RecommendResponseSchema } from "@/lib/validations/recommendation";
import type { MenuCard } from "@/lib/types";
import { getAiModelId, AI_MODEL_KEYS } from "@/lib/ai/model-config";

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "봄";
  if (month >= 6 && month <= 8) return "여름";
  if (month >= 9 && month <= 11) return "가을";
  return "겨울";
}

async function getCardIdsFromStoreItems(
  adminClient: ReturnType<typeof createAdminClient>,
  storeItemIds: string[]
): Promise<string[]> {
  if (storeItemIds.length === 0) return [];

  const { data: ingredients } = await adminClient
    .from("fp_dish_ingredient")
    .select("dish_id")
    .in("ref_store_item_id", storeItemIds)
    .limit(50);

  if (!ingredients || ingredients.length === 0) return [];

  const dishIds = [...new Set(ingredients.map((i) => i.dish_id))];

  const { data: cardDishes } = await adminClient
    .from("fp_card_dish")
    .select("card_id")
    .in("dish_id", dishIds)
    .limit(50);

  if (!cardDishes || cardDishes.length === 0) return [];

  return [...new Set(cardDishes.map((cd) => cd.card_id))];
}

function buildFallbackRecommendations(
  allCards: MenuCard[],
  promoCardIds: string[],
  newCardIds: string[],
  repeatCardIds: string[]
) {
  const toRec = (cards: MenuCard[], reason: string, confidence: number) =>
    cards.slice(0, 3).map((c) => ({ cardId: c.cardId, title: c.name, reason, confidence }));

  const promoCards = allCards.filter((c) => promoCardIds.includes(c.cardId));
  const newCards = allCards.filter((c) => newCardIds.includes(c.cardId) || c.isNew);
  const repeatCards = allCards.filter((c) => repeatCardIds.includes(c.cardId));
  const seasonalCards = allCards.filter((c) => c.cardTheme === "seasonal");

  return {
    recommendations: [
      {
        theme: "오늘의한끼",
        cards: toRec(
          allCards.filter((c) => c.category === "meal"),
          "오늘 저녁 식사로 추천드리는 메뉴입니다.",
          0.8
        ),
      },
      {
        theme: "지금이적기",
        cards: toRec(
          seasonalCards.length > 0 ? seasonalCards : allCards,
          "제철 재료로 만든 신선한 메뉴입니다.",
          0.7
        ),
      },
      {
        theme: "놓치면아까워요",
        cards: toRec(
          promoCards.length > 0 ? promoCards : allCards,
          "지금 구매하기 좋은 특별한 혜택이 있는 메뉴입니다.",
          0.75
        ),
      },
      {
        theme: "다시만나볼까요",
        cards: toRec(
          repeatCards.length > 0 ? repeatCards : allCards.slice(0, 3),
          "이전에 좋아하셨던 스타일의 메뉴입니다.",
          0.65
        ),
      },
      {
        theme: "새로들어왔어요",
        cards: toRec(
          newCards.length > 0 ? newCards : allCards.slice(0, 3),
          "새로 추가된 신선한 메뉴입니다.",
          0.8
        ),
      },
    ],
  };
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allCards = await getCards({ officialOnly: true });
  if (allCards.length === 0) {
    return Response.json({ recommendations: [] });
  }

  const [personaCtx, promoResult, newItemResult, orderResult] = await Promise.all([
    buildPersonaContext(user.id),
    adminClient
      .from("v_store_inventory_item")
      .select("store_item_id, item_name, discount_pct, promo_type, promo_name")
      .not("discount_pct", "is", null)
      .gt("discount_pct", 0)
      .eq("is_in_stock", true)
      .order("discount_pct", { ascending: false })
      .limit(30),
    adminClient
      .from("v_store_inventory_item")
      .select("store_item_id, item_name, ai_tags, created_at")
      .eq("ai_status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(30),
    adminClient
      .from("fp_order")
      .select("ref_order_id")
      .eq("user_id", user.id)
      .not("ref_order_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const promoStoreIds = (promoResult.data ?? [])
    .map((i) => i.store_item_id)
    .filter((id): id is string => id !== null);
  const newStoreIds = (newItemResult.data ?? [])
    .map((i) => i.store_item_id)
    .filter((id): id is string => id !== null);

  const orderIds = (orderResult.data ?? [])
    .map((o) => o.ref_order_id)
    .filter((id): id is string => id !== null);

  const [promoCardIds, newCardIds, repeatCardIds] = await Promise.all([
    getCardIdsFromStoreItems(adminClient, promoStoreIds),
    getCardIdsFromStoreItems(adminClient, newStoreIds),
    (async () => {
      if (orderIds.length === 0) return [];
      const { data: orderItems } = await adminClient
        .from("order_item")
        .select("store_item_id")
        .in("order_id", orderIds)
        .limit(30);
      const storeIds = (orderItems ?? []).map((i) => i.store_item_id);
      return getCardIdsFromStoreItems(adminClient, storeIds);
    })(),
  ]);

  const cardSummary = allCards.slice(0, 25).map((c) => ({
    id: c.cardId,
    name: c.name,
    subtitle: c.subtitle ?? "",
    category: c.category,
    healthScore: c.healthScore ?? null,
    priceMin: c.priceMin ?? null,
    isNew: c.isNew,
    theme: c.cardTheme,
  }));

  const currentSeason = getCurrentSeason();
  const topDiscounts = (promoResult.data ?? [])
    .slice(0, 3)
    .map((d) => `${d.item_name ?? "상품"}: ${d.discount_pct}% 할인`)
    .join(", ");

  const budgetLabel =
    personaCtx.budgetLevel === "low"
      ? "1만원 이하"
      : personaCtx.budgetLevel === "high"
        ? "3만원 이상"
        : "2만원대";

  const systemPrompt = `당신은 FreshPickAI의 AI 큐레이터입니다. 카드 목록에서 5가지 테마에 맞게 카드를 추천합니다.

사용자 페르소나: ${personaCtx.personaName}
- 설명: ${personaCtx.personaDescription}
- 가족 인원: ${personaCtx.householdSize}명
- 조리 가능 시간: ${personaCtx.cookTimeMin}분 이내
- 예산: ${budgetLabel}
- 식이 태그: ${personaCtx.dietaryTags.join(", ") || "없음"}
- 현재 계절: ${currentSeason}`;

  const userPrompt = `다음 카드 목록에서 5가지 테마에 맞는 카드를 각 3개씩 추천해주세요.

카드 목록:
${JSON.stringify(cardSummary)}

테마별 우선 카드 ID 힌트:
- 테마3 우선: [${promoCardIds.slice(0, 5).join(", ")}] (주요 할인: ${topDiscounts || "없음"})
- 테마4 우선: [${repeatCardIds.slice(0, 5).join(", ")}]
- 테마5 우선: [${newCardIds.slice(0, 5).join(", ")}]

각 테마 기준:
1. 오늘의한끼: ${personaCtx.personaName} 페르소나에 가장 잘 맞는 식사 카드
2. 지금이적기: ${currentSeason} 계절에 어울리는 신선한 카드 (seasonal/chef_table 테마 우선)
3. 놓치면아까워요: 할인·프로모션 재료 포함 카드 (테마3 우선 목록 활용)
4. 다시만나볼까요: 이전 구매 스타일 카드 (테마4 우선 목록, 없으면 인기 카드)
5. 새로들어왔어요: 신규 상품 포함 또는 isNew 카드 (테마5 우선 목록 활용)

각 카드의 reason은 한국어 2문장, confidence는 0.0~1.0 사이.
반드시 위 카드 목록의 id 값을 cardId로 사용하세요.`;

  const modelId = await getAiModelId(AI_MODEL_KEYS.RECOMMEND);

  try {
    const result = await generateObject({
      model: anthropic(modelId),
      schema: RecommendResponseSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    // AI 추천 생성 성공 시 customer 테이블 타임스탬프 업데이트
    if (user.email) {
      await adminClient
        .from("customer")
        .update({ ai_recommend_generated_at: new Date().toISOString() })
        .eq("email", user.email);
    }

    return Response.json(result.object);
  } catch (err) {
    console.error("[ai/recommend] generateObject error:", err);
    return Response.json(
      buildFallbackRecommendations(allCards, promoCardIds, newCardIds, repeatCardIds)
    );
  }
}
