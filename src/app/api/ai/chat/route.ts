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
import { checkCache, saveCache, createCacheHitResponse } from "@/lib/ai/semantic-cache";
import { getAiModelId, AI_MODEL_KEYS } from "@/lib/ai/model-config";

// ── 레이트 리밋 (30 req/min per userId) — Supabase RPC 기반 ──
// 멀티인스턴스 환경에서 정확한 제한을 위해 DB 원자적 upsert 사용
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
    // RPC 실패 시 허용 (서비스 중단 방지)
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

type SimpleMessage = { role: "user" | "assistant"; content: string };

/** 단일 사용자 메시지에만 시맨틱 캐시 적용 (멀티턴 대화는 제외) */
function extractCacheableQuery(messages: SimpleMessage[], quickChip?: string): string | null {
  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length !== 1) return null; // 첫 번째 메시지만 캐시

  const text = userMessages[0].content.trim();
  if (!text || text.length < 5) return null;

  // 타임스탬프(10자리 이상 숫자) 포함 쿼리는 캐시 제외 — 프로그래밍 테스트 쿼리 방어
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

  try {
    const body = (await req.json()) as {
      messages?: SimpleMessage[];
      quickChip?: string;
    };
    messages = body.messages ?? [];
    quickChip = body.quickChip;
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

  // ── 페르소나 컨텍스트 + 시스템 프롬프트 빌드 ────────────
  const personaCtx = await buildPersonaContext(user.id);
  let systemPrompt = buildChatPrompt(personaCtx);

  if (quickChip && CHIP_CONSTRAINTS[quickChip]) {
    systemPrompt += `\n\n## 현재 제약 조건\n${CHIP_CONSTRAINTS[quickChip]}`;
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
        addToMemo: createAddToMemoTool(user.id, supabase),
      },
      stopWhen: stepCountIs(5),
      experimental_telemetry: {
        isEnabled: true,
        functionId: "ai.chat",
        metadata: {
          userId: user.id,
          model: modelId,
          hasCacheableQuery: cacheableQuery ? "true" : "false",
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

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[ai/chat] streamText error:", err);
    return new Response(JSON.stringify({ error: "AI 응답 생성에 실패했습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
