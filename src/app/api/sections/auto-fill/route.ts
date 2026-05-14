import { NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { buildPersonaContext } from "@/lib/ai/persona-context";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { MenuCard, CardTheme } from "@/lib/types";
import { mapCard } from "@/lib/actions/cards/mappers";
import { getAiModelId, AI_MODEL_KEYS } from "@/lib/ai/model-config";

type RpcCard = {
  card_id: string;
  title: string;
  card_theme: string;
  category: string;
  emoji: string | null;
  cover_image: string | null;
  health_score: number | null;
  is_official: boolean;
};

function rpcCardToMenuCard(row: RpcCard): MenuCard {
  return {
    cardId: row.card_id,
    name: row.title,
    cardTheme: row.card_theme as CardTheme,
    category: row.category as MenuCard["category"],
    emoji: row.emoji ?? undefined,
    coverImage: row.cover_image ?? undefined,
    healthScore: row.health_score ?? undefined,
    isOfficial: row.is_official,
    isNew: false,
    reviewStatus: "approved",
  };
}

// 24시간 캐시 (Vercel ISR)
export const revalidate = 86400;

const AutoFillSchema = z.object({
  cards: z
    .array(
      z.object({
        cardId: z.string().describe("카드 ID (제공된 목록에서만 선택)"),
        reason: z.string().max(60).describe("이 섹션에 추천하는 이유 (1문장, 30자 이내)"),
      })
    )
    .min(1)
    .max(3),
});

export async function GET(req: NextRequest) {
  const sectionId = req.nextUrl.searchParams.get("sectionId");
  if (!sectionId) {
    return Response.json({ error: "sectionId가 필요합니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  // 섹션 정보 조회
  const { data: section } = await supabase
    .from("fp_card_section")
    .select("name, ai_auto_fill")
    .eq("section_id", sectionId)
    .eq("user_id", user.id)
    .single();

  if (!section) {
    return Response.json({ error: "섹션을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!section.ai_auto_fill) {
    return Response.json({ cards: [] });
  }

  // fp_recommend_cards RPC로 카드 후보 조회
  const adminSupabase = createAdminClient();
  const [rpcResult, ctxResult] = await Promise.allSettled([
    adminSupabase.rpc("fp_recommend_cards", {
      p_section_name: section.name,
      p_persona_tags: [],
      p_limit: 20,
    }),
    buildPersonaContext(user.id),
  ]);

  // RPC 결과 파싱
  let candidateCards: MenuCard[] = [];
  if (rpcResult.status === "fulfilled" && !rpcResult.value.error && rpcResult.value.data) {
    // RPC 반환 shape을 MenuCard로 직접 매핑
    candidateCards = (rpcResult.value.data as RpcCard[]).map(rpcCardToMenuCard);
  } else {
    // RPC 실패 시 fp_menu_card 직접 조회로 폴백
    const { data: fallback } = await adminSupabase
      .from("fp_menu_card")
      .select("*")
      .eq("review_status", "approved")
      .eq("is_official", true)
      .order("health_score", { ascending: false })
      .limit(20);
    candidateCards = (fallback ?? []).map(mapCard);
  }

  if (candidateCards.length === 0) {
    return Response.json({ cards: [] });
  }

  // 페르소나 컨텍스트
  const ctx = ctxResult.status === "fulfilled" ? ctxResult.value : null;
  const personaDesc = ctx
    ? `페르소나: ${ctx.personaName} (${ctx.personaDescription})\n식이 태그: ${ctx.dietaryTags.join(", ") || "없음"}\n가구 인원: ${ctx.householdSize}명\n예산: ${ctx.budgetLevel}`
    : "";

  const modelId = await getAiModelId(AI_MODEL_KEYS.AUTO_FILL);

  const cardList = candidateCards
    .slice(0, 20)
    .map((c) => `- cardId: ${c.cardId} | 제목: ${c.name} | 테마: ${c.cardTheme}`)
    .join("\n");

  const { object } = await generateObject({
    model: anthropic(modelId),
    schema: AutoFillSchema,
    prompt: `섹션 "${section.name}"에 어울리는 카드를 최대 3개 선택하세요.

${personaDesc}

사용 가능한 카드 목록 (아래 cardId만 사용 가능):
${cardList}

선택 기준:
1. 섹션 이름과 주제가 잘 맞는 카드 우선
2. 사용자 페르소나·식이 태그에 맞는 카드 우선
3. 중복 테마 피하기

각 카드를 선택한 이유를 30자 이내로 작성하세요.`,
  });

  // cardId 유효성 검증 (목록에 있는 카드만 반환)
  const cardMap = new Map(candidateCards.map((c) => [c.cardId, c]));
  const result = object.cards
    .map((r) => {
      const card = cardMap.get(r.cardId);
      if (!card) return null;
      return { ...card, aiReason: r.reason };
    })
    .filter((c): c is MenuCard & { aiReason: string } => c !== null);

  return Response.json(
    { cards: result, sectionName: section.name },
    {
      headers: {
        "Cache-Control": "private, max-age=86400, stale-while-revalidate=3600",
      },
    }
  );
}
