import { createClient } from "@/lib/supabase/server";
import { embedText } from "@/lib/ai/embedding";
import type { ChatMemoryContext, RawMessage, SessionSummary, MemoryItem } from "@/lib/types";

// fp_chat_message_raw 조회 결과 행 타입
type RawMessageRow = {
  message_id: string;
  customer_id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
};

// fp_chat_session_summary 조회 결과 행 타입
type SessionSummaryRow = {
  summary_id: string;
  customer_id: string;
  session_id: string;
  summary_text: string;
  keywords: string[];
  created_at: string;
};

// fp_search_memory_items RPC 반환 행 타입
type MemoryItemRow = {
  memory_id: string;
  customer_id: string;
  content: string;
  source_session_id: string | null;
  importance_score: number;
  created_at: string;
  cosine_dist: number;
};

/**
 * 3계층 메모리 컨텍스트를 병렬로 조회합니다.
 * - Layer 1: fp_chat_message_raw (최근 10개 원문)
 * - Layer 2: fp_chat_session_summary (최근 5개 요약)
 * - Layer 3: fp_memory_items pgvector 유사도 검색 (최대 5개)
 */
export async function retrieveMemoryContext(
  customerId: string,
  currentQuery: string
): Promise<ChatMemoryContext> {
  const supabase = await createClient();

  // Layer 1, 2 병렬 조회 + Layer 3 임베딩 생성 병렬 실행
  const [layer1Result, layer2Result, queryEmbedding] = await Promise.all([
    supabase
      .from("fp_chat_message_raw")
      .select("message_id, customer_id, session_id, role, content, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("fp_chat_session_summary")
      .select("summary_id, customer_id, session_id, summary_text, keywords, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(5),
    // 임베딩 실패 시 빈 배열로 폴백 (Layer 3 스킵)
    embedText(currentQuery).catch(() => [] as number[]),
  ]);

  // Layer 3: pgvector 유사도 검색 (임베딩 생성 성공 시에만 실행)
  let memoryItemRows: MemoryItemRow[] = [];

  if (queryEmbedding.length > 0) {
    const { data } = await supabase.rpc("fp_search_memory_items", {
      p_customer_id: customerId,
      p_embedding: queryEmbedding,
      p_limit: 5,
      p_threshold: 0.4,
    });
    memoryItemRows = (data as MemoryItemRow[] | null) ?? [];
  }

  // Layer 1 변환
  const recentMessages: RawMessage[] = ((layer1Result.data as RawMessageRow[] | null) ?? []).map(
    (r) => ({
      messageId: r.message_id,
      customerId: r.customer_id,
      sessionId: r.session_id,
      role: r.role as "user" | "assistant",
      content: r.content,
      createdAt: r.created_at,
    })
  );

  // Layer 2 변환
  const sessionSummaries: SessionSummary[] = (
    (layer2Result.data as SessionSummaryRow[] | null) ?? []
  ).map((s) => ({
    summaryId: s.summary_id,
    customerId: s.customer_id,
    sessionId: s.session_id,
    summaryText: s.summary_text,
    keywords: s.keywords,
    createdAt: s.created_at,
  }));

  // Layer 3 변환
  const memoryItems: MemoryItem[] = memoryItemRows.map((m) => ({
    memoryId: m.memory_id,
    customerId: m.customer_id,
    content: m.content,
    sourceSessionId: m.source_session_id ?? undefined,
    importanceScore: m.importance_score,
    createdAt: m.created_at,
  }));

  return { recentMessages, sessionSummaries, memoryItems };
}

/**
 * 3계층 메모리 컨텍스트를 시스템 프롬프트 삽입용 문자열로 포맷합니다.
 * 빈 레이어는 섹션 제목을 포함하지 않습니다.
 */
export function formatMemoryContext(ctx: ChatMemoryContext): string {
  const parts: string[] = [];

  if (ctx.sessionSummaries.length > 0) {
    const summaries = ctx.sessionSummaries
      .map((s) => `- ${s.summaryText} [키워드: ${s.keywords.join(", ")}]`)
      .join("\n");
    parts.push(`## 이전 대화 요약\n${summaries}`);
  }

  if (ctx.memoryItems.length > 0) {
    const items = ctx.memoryItems
      .map((m) => `- ${m.content} (중요도: ${m.importanceScore.toFixed(1)})`)
      .join("\n");
    parts.push(`## 장기 기억\n${items}`);
  }

  if (ctx.recentMessages.length > 0) {
    // 최신순(내림차순)으로 조회된 메시지를 시간순(오름차순)으로 역전하여 출력
    const msgs = [...ctx.recentMessages]
      .reverse()
      .map((m) => `[${m.role === "user" ? "사용자" : "AI"}] ${m.content}`)
      .join("\n");
    parts.push(`## 최근 대화 원문\n${msgs}`);
  }

  return parts.join("\n\n");
}
