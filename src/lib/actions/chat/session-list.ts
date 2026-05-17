"use server";

import { createClient } from "@/lib/supabase/server";

export type ChatSessionSummary = {
  sessionId: string;
  summaryText: string;
  keywords: string[];
  createdAt: string;
};

/** 현재 사용자의 세션 요약 목록 조회 (최근 20건) */
export async function getChatSessionSummaries(): Promise<ChatSessionSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("fp_chat_session_summary")
    .select("session_id, summary_text, keywords, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((row) => ({
    sessionId: row.session_id,
    summaryText: row.summary_text,
    keywords: (row.keywords as string[]) ?? [],
    createdAt: row.created_at,
  }));
}

export type ChatSessionMessage = {
  messageId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

/** 특정 세션의 원문 메시지 조회 */
export async function getSessionMessages(sessionId: string): Promise<ChatSessionMessage[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("fp_chat_message_raw")
    .select("message_id, role, content, created_at")
    .eq("customer_id", user.id)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(100);

  return (data ?? []).map((row) => ({
    messageId: row.message_id,
    role: row.role as "user" | "assistant",
    content: row.content,
    createdAt: row.created_at,
  }));
}
