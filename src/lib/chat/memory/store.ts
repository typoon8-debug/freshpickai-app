import { createClient } from "@/lib/supabase/server";
import { embedText } from "@/lib/ai/embedding";
import { getAiModelId, AI_MODEL_KEYS } from "@/lib/ai/model-config";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

/** 중복 기억 판단 코사인 유사도 임계값 (이 값 이상이면 중복으로 간주) */
const DUPLICATE_THRESHOLD = 0.95;

/**
 * Layer 2 + Layer 3 통합 메모리 저장 (fire-and-forget용)
 * 세션 요약 생성 → 장기 기억 항목 추출까지 한번에 처리
 * 실패해도 throw하지 않고 오류를 무시합니다.
 */
export async function saveAndExtractMemory(
  customerId: string,
  sessionId: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<void> {
  try {
    await saveSessionSummary(customerId, sessionId, messages);
    // 요약 텍스트를 다시 조회하지 않고 대화에서 직접 요약 재활용
    // — 짧게: 마지막 몇 턴을 압축 요약 텍스트로 사용
    const briefContext = messages
      .slice(-10)
      .map((m) => `${m.role === "user" ? "사용자" : "AI"}: ${m.content}`)
      .join("\n");
    await upsertMemoryItems(customerId, sessionId, briefContext);
  } catch (e) {
    console.error("[saveAndExtractMemory] 실패:", e);
  }
}

/**
 * fp_chat_message_raw에 원문 메시지를 저장합니다.
 * INSERT 실패 시 오류를 throw하지 않고 console.error로만 기록합니다.
 */
export async function saveRawMessage(
  customerId: string,
  sessionId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("fp_chat_message_raw").insert({
    customer_id: customerId,
    session_id: sessionId,
    role,
    content,
  });

  if (error) {
    console.error("[saveRawMessage] INSERT 실패:", error.message);
  }
}

/**
 * Claude Haiku로 대화를 요약하고 fp_chat_session_summary에 UPSERT합니다.
 * 메시지가 2개 미만이면 요약을 건너뜁니다.
 */
export async function saveSessionSummary(
  customerId: string,
  sessionId: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<void> {
  if (messages.length < 2) return;

  const modelId = await getAiModelId(AI_MODEL_KEYS.CLASSIFY); // Haiku 사용
  const dialogue = messages
    .map((m) => `[${m.role === "user" ? "사용자" : "AI"}] ${m.content}`)
    .join("\n");

  const result = await generateObject({
    model: anthropic(modelId),
    schema: z.object({
      summary: z.string().max(500).describe("대화 내용 3문장 이내 한국어 요약"),
      keywords: z.array(z.string().max(15)).max(10).describe("핵심 키워드 목록"),
    }),
    prompt: `다음 대화를 요약하고 핵심 키워드를 추출해주세요:\n\n${dialogue}`,
  });

  const supabase = await createClient();
  const { error } = await supabase.from("fp_chat_session_summary").upsert(
    {
      customer_id: customerId,
      session_id: sessionId,
      summary_text: result.object.summary,
      keywords: result.object.keywords,
    },
    { onConflict: "session_id" }
  );

  if (error) {
    console.error("[saveSessionSummary] UPSERT 실패:", error.message);
  }
}

/**
 * 요약 텍스트에서 장기 기억 항목을 추출하고 중복 제거 후 fp_memory_items에 INSERT합니다.
 * - 중요도 0.3 미만 항목 스킵
 * - 코사인 유사도 > 0.95인 기존 기억이 있으면 스킵 (중복 방지)
 */
export async function upsertMemoryItems(
  customerId: string,
  sessionId: string,
  summaryText: string
): Promise<void> {
  if (!summaryText.trim()) return;

  const modelId = await getAiModelId(AI_MODEL_KEYS.CLASSIFY); // Haiku 사용

  // 장기 기억할 만한 핵심 사실 추출
  const result = await generateObject({
    model: anthropic(modelId),
    schema: z.object({
      memoryItems: z
        .array(
          z.object({
            content: z
              .string()
              .max(200)
              .describe("기억할 핵심 사실 (선호, 알레르기, 가족 구성 등)"),
            importance: z.number().min(0).max(1).describe("중요도 (0~1)"),
          })
        )
        .max(3)
        .describe("장기 기억으로 저장할 항목들"),
    }),
    prompt: `다음 대화 요약에서 사용자의 장기 선호도나 중요한 정보를 최대 3개 추출해주세요:\n\n${summaryText}`,
  });

  if (result.object.memoryItems.length === 0) return;

  const supabase = await createClient();

  for (const item of result.object.memoryItems) {
    // 중요도 낮은 항목 스킵
    if (item.importance < 0.3) continue;

    const embedding = await embedText(item.content).catch(() => null);
    if (!embedding) continue;

    // 중복 체크: 코사인 유사도가 임계값(0.95) 이상인 기억이 이미 있으면 스킵
    // fp_search_memory_items의 p_threshold는 cosine_dist 상한값이므로
    // 1 - DUPLICATE_THRESHOLD(= 0.05)보다 작은 거리 = 매우 유사한 항목
    const { data: existing } = await supabase.rpc("fp_search_memory_items", {
      p_customer_id: customerId,
      p_embedding: embedding,
      p_limit: 1,
      p_threshold: 1 - DUPLICATE_THRESHOLD, // 0.05
    });

    if (existing && (existing as unknown[]).length > 0) {
      // 유사한 기억이 이미 존재 — 중복 저장 스킵
      continue;
    }

    const { error } = await supabase.from("fp_memory_items").insert({
      customer_id: customerId,
      content: item.content,
      // pgvector INSERT를 위해 number[] → 문자열 변환 없이 그대로 전달
      // (Supabase JS 클라이언트가 vector 타입으로 직렬화)
      embedding: embedding as unknown as string,
      source_session_id: sessionId,
      importance_score: item.importance,
    });

    if (error) {
      console.error("[upsertMemoryItems] INSERT 실패:", error.message);
    }
  }
}
