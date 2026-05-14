import { NextRequest } from "next/server";
import { streamText, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { buildPersonaContext } from "@/lib/ai/persona-context";
import { buildChatPrompt } from "@/lib/ai/prompts";
import { createSearchItemsTool } from "@/lib/ai/tools/search-items";
import { createGetUserContextTool } from "@/lib/ai/tools/get-user-context";
import { createGetInventoryTool } from "@/lib/ai/tools/get-inventory";
import { createAddToCartTool } from "@/lib/ai/tools/add-to-cart";
import { createAddToMemoTool } from "@/lib/ai/tools/add-to-memo";

// ── 레이트 리밋 (30 req/min per userId) ──────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

type SimpleMessage = { role: "user" | "assistant"; content: string };

const AGENT_TOOL_GUIDE = `
## 에이전트 도구 사용 지침
도구를 순서대로 활용해 사용자 요청을 처리하세요:
1. getUserContext — 사용자 취향/페르소나 파악 (첫 번째로 호출)
2. searchItems(mode=recipe) — 조건에 맞는 레시피 검색
3. searchItems(mode=item) — 레시피 재료 기반 구매 가능한 상품 검색
4. getInventory — 검색된 상품의 실시간 재고·가격 확인
5. addToCart — 재고 있는 상품을 장바구니에 추가

재료를 메모에 저장하라는 요청에는 addToMemo를 사용하세요.
항상 getUserContext로 시작해 맞춤형 추천을 제공하세요.`.trim();

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

  if (!checkRateLimit(user.id)) {
    return new Response(
      JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: SimpleMessage[] = [];

  try {
    const body = (await req.json()) as { messages?: SimpleMessage[] };
    messages = body.messages ?? [];
  } catch {
    return new Response(JSON.stringify({ error: "잘못된 요청 형식" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // common_code 테이블에서 에이전트 모델 조회
  const { data: codeRow } = await supabase
    .from("common_code")
    .select("description")
    .eq("code", "AI_AGENT_LLM")
    .maybeSingle();

  const modelId = codeRow?.description ?? "claude-sonnet-4-6";

  // 페르소나 컨텍스트 + 시스템 프롬프트 빌드
  const personaCtx = await buildPersonaContext(user.id);
  const systemPrompt = `${buildChatPrompt(personaCtx)}\n\n${AGENT_TOOL_GUIDE}`;

  try {
    const result = streamText({
      model: anthropic(modelId),
      system: systemPrompt,
      messages,
      tools: {
        searchItems: createSearchItemsTool(supabase),
        getUserContext: createGetUserContextTool(user.id),
        getInventory: createGetInventoryTool(supabase),
        addToCart: createAddToCartTool(user.id, supabase),
        addToMemo: createAddToMemoTool(user.id, supabase),
      },
      stopWhen: stepCountIs(5),
      experimental_telemetry: {
        isEnabled: true,
        functionId: "ai.agent",
        metadata: {
          userId: user.id,
          model: modelId,
        },
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[ai/agent] streamText error:", err);
    return new Response(JSON.stringify({ error: "AI 응답 생성에 실패했습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
