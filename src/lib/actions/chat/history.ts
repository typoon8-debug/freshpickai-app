"use server";

import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/lib/types";

export interface ChatHistoryResult {
  messages: ChatMessage[];
  hasHistory: boolean;
  latestSummary: { summaryText: string; keywords: string[] } | null;
}

// ── 최근 대화 기록 조회 (로그인 시 채팅 화면 복원용) ──────────────
export async function getRecentChatHistory(limit = 30): Promise<ChatHistoryResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { messages: [], hasHistory: false, latestSummary: null };

  // Layer 1: 최근 raw 메시지 조회
  const { data: rows } = await supabase
    .from("fp_chat_message_raw")
    .select("message_id, role, content, created_at, session_id")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  // Layer 2: 가장 최근 세션 요약 조회 (배너용)
  const { data: summaryRow } = await supabase
    .from("fp_chat_session_summary")
    .select("summary_text, keywords")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!rows || rows.length === 0) {
    return { messages: [], hasHistory: false, latestSummary: null };
  }

  // 역순으로 정렬해 오래된 메시지가 위로
  const sorted = [...rows].reverse();
  const messages: ChatMessage[] = sorted.map((row) => ({
    id: row.message_id,
    role: (row.role === "user" ? "user" : "ai") as ChatMessage["role"],
    text: row.content,
    time: new Date(row.created_at).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    // cards/intents/memoItems/cartItems는 raw table 미저장 → Phase 3에서 보완
  }));

  const latestSummary = summaryRow
    ? { summaryText: summaryRow.summary_text, keywords: summaryRow.keywords ?? [] }
    : null;

  return { messages, hasHistory: true, latestSummary };
}
