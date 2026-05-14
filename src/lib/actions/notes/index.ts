"use server";

import { createClient } from "@/lib/supabase/server";
import type { CardNote } from "@/lib/types";
import { triggerSelfImprove, triggerSubstituteMerge } from "./self-improve";

function mapNote(row: {
  note_id: string;
  card_id: string;
  user_id: string;
  note_type: string;
  body: string;
  helpful_count: number;
  ai_consent: boolean;
  admin_reply: string | null;
  created_at: string;
}): CardNote {
  return {
    noteId: row.note_id,
    cardId: row.card_id,
    userId: row.user_id,
    noteType: row.note_type as CardNote["noteType"],
    body: row.body,
    helpfulCount: row.helpful_count,
    aiConsent: row.ai_consent,
    adminReply: row.admin_reply ?? undefined,
    createdAt: row.created_at,
  };
}

// ── 노트 목록 조회 ──────────────────────────────────────────────
export type NoteSort = "helpful" | "latest";

export async function listNotes(
  cardId: string,
  type?: CardNote["noteType"],
  sort: NoteSort = "latest"
): Promise<CardNote[]> {
  const supabase = await createClient();

  let query = supabase
    .from("fp_card_note")
    .select("*")
    .eq("card_id", cardId)
    .order(sort === "helpful" ? "helpful_count" : "created_at", { ascending: false });

  if (type) {
    query = query.eq("note_type", type);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map(mapNote);
}

// ── 노트 생성 ───────────────────────────────────────────────────
export async function createNote(
  cardId: string,
  noteType: CardNote["noteType"],
  body: string,
  aiConsent: boolean
): Promise<{ success: boolean; note?: CardNote; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "로그인이 필요합니다." };
  if (body.trim().length < 5) return { success: false, error: "내용을 5자 이상 입력해주세요." };

  const { data, error } = await supabase
    .from("fp_card_note")
    .insert({
      card_id: cardId,
      user_id: user.id,
      note_type: noteType,
      body: body.trim(),
      ai_consent: aiConsent,
    })
    .select()
    .single();

  if (error || !data) return { success: false, error: "노트 저장에 실패했습니다." };

  return { success: true, note: mapNote(data) };
}

// ── 도움이 됨 +1 ────────────────────────────────────────────────
export async function markHelpful(
  noteId: string
): Promise<{ success: boolean; helpfulCount?: number; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "로그인이 필요합니다." };

  // 현재 노트 조회
  const { data: note, error: fetchErr } = await supabase
    .from("fp_card_note")
    .select("note_id, user_id, helpful_count, ai_consent, body, card_id, review_needed, note_type")
    .eq("note_id", noteId)
    .single();

  if (fetchErr || !note) return { success: false, error: "노트를 찾을 수 없습니다." };
  if (note.user_id === user.id)
    return { success: false, error: "본인 노트에는 도움이 됨을 표시할 수 없습니다." };

  const newCount = note.helpful_count + 1;

  const { error: updateErr } = await supabase
    .from("fp_card_note")
    .update({ helpful_count: newCount })
    .eq("note_id", noteId);

  if (updateErr) return { success: false, error: "업데이트에 실패했습니다." };

  // 자기보강 루프 트리거 (helpful_count >= 5, ai_consent=true, 아직 미처리)
  if (newCount >= 5 && note.ai_consent && !note.review_needed) {
    triggerSelfImprove(noteId, note.body, note.card_id).catch(() => {});
  }

  // substitutes 병합 큐 (F018): helpful_count >= 10, tip 노트, ai_consent=true
  if (newCount >= 10 && note.ai_consent && note.note_type === "tip") {
    triggerSubstituteMerge(noteId, note.body).catch(() => {});
  }

  return { success: true, helpfulCount: newCount };
}

// ── 운영자 답글 ─────────────────────────────────────────────────
export async function replyAsAdmin(
  noteId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "로그인이 필요합니다." };

  // 운영자 권한 체크
  const { data: adminCheck } = await supabase.rpc("is_admin");
  if (!adminCheck) return { success: false, error: "운영자 권한이 필요합니다." };

  const { error } = await supabase
    .from("fp_card_note")
    .update({ admin_reply: content.trim() })
    .eq("note_id", noteId);

  if (error) return { success: false, error: "답글 저장에 실패했습니다." };
  return { success: true };
}
