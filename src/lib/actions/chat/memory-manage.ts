"use server";

import { createClient } from "@/lib/supabase/server";

export type MemoryItem = {
  itemId: string;
  content: string;
  importanceScore: number;
  createdAt: string;
};

/** 현재 사용자의 장기 기억 목록 조회 */
export async function getMemoryItems(): Promise<MemoryItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("fp_memory_items")
    .select("item_id, content, importance_score, created_at")
    .eq("customer_id", user.id)
    .order("importance_score", { ascending: false })
    .limit(50);

  return (data ?? []).map((row) => ({
    itemId: row.item_id,
    content: row.content,
    importanceScore: Number(row.importance_score ?? 0),
    createdAt: row.created_at,
  }));
}

/** 장기 기억 항목 단건 삭제 */
export async function deleteMemoryItem(itemId: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("fp_memory_items")
    .delete()
    .eq("item_id", itemId)
    .eq("customer_id", user.id);

  return { ok: !error };
}

/** 전체 장기 기억 초기화 */
export async function clearAllMemoryItems(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase.from("fp_memory_items").delete().eq("customer_id", user.id);

  return { ok: !error };
}
