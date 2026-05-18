import { NextRequest } from "next/server";
import { streamText, stepCountIs } from "ai";

export const maxDuration = 60;
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { buildPersonaContext } from "@/lib/ai/persona-context";
import { buildChatPrompt } from "@/lib/ai/prompts";
import { createAddToMemoTool } from "@/lib/ai/tools/add-to-memo";
import { createSearchItemsTool } from "@/lib/ai/tools/search-items";
import { createGetInventoryTool } from "@/lib/ai/tools/get-inventory";
import { createAddToCartTool } from "@/lib/ai/tools/add-to-cart";
import { createGetUserContextTool } from "@/lib/ai/tools/get-user-context";
import { createSuggestIntentsTool } from "@/lib/ai/tools/suggest-intents";
import { checkCache, saveCache, createCacheHitResponse } from "@/lib/ai/semantic-cache";
import { getAiModelId, AI_MODEL_KEYS } from "@/lib/ai/model-config";
import { retrieveMemoryContext, formatMemoryContext } from "@/lib/chat/memory/retrieve";
import { saveRawMessage, saveAndExtractMemory } from "@/lib/chat/memory/store";

// ── 레이트 리밋 (30 req/min per userId) — Supabase RPC 기반 ──
async function checkRateLimit(
  userId: string,
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
): Promise<boolean> {
  const { data, error } = await supabase.rpc("fp_check_rate_limit", {
    p_user_id: userId,
    p_max_count: 30,
    p_window_minutes: 1,
  });
  if (error) {
    console.warn("[rate-limit] RPC error, allowing request:", error.message);
    return true;
  }
  return data === true;
}

// ── 빠른칩 제약 조건 ──────────────────────────────────────────
const CHIP_CONSTRAINTS: Record<string, string> = {
  비건: "반드시 비건(채식) 메뉴만 추천하세요. 육류·생선·계란·유제품 재료는 제외하세요.",
  매운맛:
    "매운 음식을 중심으로 추천하세요. 고추·청양고추·김치 등 매운 재료 포함 메뉴를 선호합니다.",
  "10분": "조리 시간이 10분 이내인 초간단 메뉴만 추천하세요.",
  "8천원이하": "총 재료비 8,000원 이하인 저렴한 메뉴만 추천하세요.",
  초등간식: "초등학생 아이가 좋아하는 안전하고 건강한 간식 위주로 추천하세요.",
};

// ── 인텐트 버튼 시스템 프롬프트 규칙 (F033) ─────────────────
const INTENTS_RULE = `
## 인텐트 버튼 생성 규칙 (suggestIntents 도구)
- 상품·메뉴를 추천했을 때: suggestIntents를 호출해 사용자가 바로 액션할 버튼 1~4개를 제공하세요
- ADD_TO_CART: 장바구니 담기 (payload: { storeItemId: string, name: string })
- ADD_TO_WISHLIST: 찜하기 (payload: { itemId: string })
- VIEW_CARD: 카드 보기 (payload: { cardId: string })
- INITIATE_PAYMENT: 바로 결제하기 (payload 불필요)
- CONFIRM_YES / CONFIRM_NO: 예/아니요 확인 쌍으로 제공
- SEARCH_MORE: 더 찾기 (payload: { query: string })
- 일반 질답·인사·설명만 할 때는 suggestIntents를 호출하지 않아도 됩니다
- suggestIntents 호출 후에는 추가 텍스트 없이 응답을 종료하세요`.trim();

type SimpleMessage = { role: "user" | "assistant"; content: string };

function extractCacheableQuery(messages: SimpleMessage[], quickChip?: string): string | null {
  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length !== 1) return null;

  const text = userMessages[0].content.trim();
  if (!text || text.length < 5) return null;

  if (/\d{10,}/.test(text)) return null;

  return quickChip ? `[${quickChip}] ${text}` : text;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!(await checkRateLimit(user.id, supabase))) {
    return new Response(
      JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: SimpleMessage[] = [];
  let quickChip: string | undefined;
  let sessionId: string | undefined;

  try {
    const body = (await req.json()) as {
      messages?: SimpleMessage[];
      quickChip?: string;
      sessionId?: string;
    };
    messages = body.messages ?? [];
    quickChip = body.quickChip;
    sessionId = body.sessionId;
  } catch {
    return new Response(JSON.stringify({ error: "잘못된 요청 형식" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── 시맨틱 캐시 조회 ─────────────────────────────────────
  const cacheableQuery = extractCacheableQuery(messages, quickChip);
  let queryEmbedding: number[] = [];

  if (cacheableQuery) {
    const { result, queryEmbedding: emb } = await checkCache(cacheableQuery);
    queryEmbedding = emb;

    if (result.hit) {
      return createCacheHitResponse(result.responseText, result.cacheId);
    }
  }

  const modelId = await getAiModelId(AI_MODEL_KEYS.CHAT);

  // ── 3계층 메모리 조회 (F032) + 페르소나 빌드 병렬 실행 ────
  const currentQuery = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";

  const [personaCtx, memoryCtx] = await Promise.all([
    buildPersonaContext(user.id),
    retrieveMemoryContext(user.id, currentQuery).catch(() => null),
  ]);

  let systemPrompt = buildChatPrompt(personaCtx);

  // 메모리 컨텍스트 시스템 프롬프트 삽입
  if (memoryCtx) {
    const memorySection = formatMemoryContext(memoryCtx);
    if (memorySection) {
      systemPrompt += `\n\n## 사용자 기억 (이전 대화 맥락)\n${memorySection}`;
    }
  }

  // 인텐트 버튼 규칙 추가
  systemPrompt += `\n\n${INTENTS_RULE}`;

  if (quickChip && CHIP_CONSTRAINTS[quickChip]) {
    systemPrompt += `\n\n## 현재 제약 조건\n${CHIP_CONSTRAINTS[quickChip]}`;
  }

  // 현재 사용자 메시지 저장 (fire-and-forget, F032)
  if (sessionId && currentQuery) {
    void saveRawMessage(user.id, sessionId, "user", currentQuery).catch(() => {});
  }

  try {
    const result = streamText({
      model: anthropic(modelId),
      system: systemPrompt,
      messages,
      tools: {
        searchItems: createSearchItemsTool(supabase),
        getInventory: createGetInventoryTool(supabase),
        addToCart: createAddToCartTool(user.id, supabase),
        getUserContext: createGetUserContextTool(user.id),
        addToMemo: createAddToMemoTool(user.id, supabase, sessionId),
        suggestIntents: createSuggestIntentsTool(),
      },
      stopWhen: stepCountIs(5),
      experimental_telemetry: {
        isEnabled: true,
        functionId: "ai.chat",
        metadata: {
          userId: user.id,
          model: modelId,
          hasCacheableQuery: cacheableQuery ? "true" : "false",
          hasMemoryContext: memoryCtx ? "true" : "false",
        },
      },
    });

    // 캐시 저장: 단일 쿼리이고 임베딩이 생성된 경우
    if (cacheableQuery && queryEmbedding.length > 0) {
      void Promise.resolve(result.text).then((text) => {
        if (text.trim().length > 10) {
          saveCache(cacheableQuery, queryEmbedding, text).catch(() => {});
        }
      });
    }

    // AI 응답 저장 + Layer 2/3 메모리 트리거 (fire-and-forget, F032)
    if (sessionId) {
      void Promise.resolve(result.text).then(async (text) => {
        if (text.trim().length === 0) return;
        await saveRawMessage(user.id, sessionId!, "assistant", text).catch(() => {});

        // 8턴(사용자+AI 합산)마다 세션 요약 및 장기 기억 추출 (Layer 2+3)
        const totalTurns = messages.length + 1; // +1 for this assistant reply
        if (totalTurns % 8 === 0) {
          const allMessages: { role: "user" | "assistant"; content: string }[] = [
            ...messages,
            { role: "assistant" as const, content: text },
          ];
          void saveAndExtractMemory(user.id, sessionId!, allMessages).catch(() => {});
        }
      });
    }

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[ai/chat] streamText error:", err);
    return new Response(JSON.stringify({ error: "AI 응답 생성에 실패했습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
