"use server";

import { createClient } from "@/lib/supabase/server";
import { updateTag } from "next/cache";
import type { CardSection } from "@/lib/types";

const OFFICIAL_SECTIONS = [
  { name: "흑백요리사", sortOrder: 0, aiAutoFill: true },
  { name: "오늘뭐먹지", sortOrder: 1, aiAutoFill: true },
  { name: "가족레시피", sortOrder: 2, aiAutoFill: true },
  { name: "드라마식탁", sortOrder: 3, aiAutoFill: true },
  { name: "혼웰빙", sortOrder: 4, aiAutoFill: false },
  { name: "제철한상", sortOrder: 5, aiAutoFill: true },
  { name: "세계한상", sortOrder: 6, aiAutoFill: false },
  { name: "K디저트", sortOrder: 7, aiAutoFill: false },
  { name: "간식박스", sortOrder: 8, aiAutoFill: false },
  { name: "홈시네마", sortOrder: 9, aiAutoFill: false },
  /** F020: 냉장고 비우기 — AI 자동채움 ON 기본값 */
  { name: "냉장고 비우기", sortOrder: 10, aiAutoFill: true },
];

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function mapSection(row: Record<string, unknown>): CardSection {
  return {
    sectionId: row.section_id as string,
    userId: row.user_id as string,
    name: row.name as string,
    sortOrder: row.sort_order as number,
    isOfficial: row.is_official as boolean,
    aiAutoFill: row.ai_auto_fill as boolean,
  };
}

/** 사용자 섹션 목록 조회 — 없으면 10종 공식 섹션 자동 생성 */
export async function getSectionsAction(): Promise<CardSection[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fp_card_section")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  if (error) return [];

  if (!data || data.length === 0) {
    const rows = OFFICIAL_SECTIONS.map((s) => ({
      user_id: user.id,
      name: s.name,
      sort_order: s.sortOrder,
      is_official: true,
      ai_auto_fill: s.aiAutoFill,
    }));
    const { data: seeded, error: seedErr } = await supabase
      .from("fp_card_section")
      .insert(rows)
      .select("*");
    if (seedErr || !seeded) return [];
    return (seeded as Record<string, unknown>[]).map(mapSection);
  }

  return (data as Record<string, unknown>[]).map(mapSection);
}

/** 커스텀 섹션 추가 */
export async function createSectionAction(
  name: string
): Promise<{ section?: CardSection; error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("fp_card_section")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = last ? (last.sort_order as number) + 1 : 0;

  const { data, error } = await supabase
    .from("fp_card_section")
    .insert({
      user_id: user.id,
      name: name.trim(),
      sort_order: nextOrder,
      is_official: false,
      ai_auto_fill: false,
    })
    .select("*")
    .single();

  if (error || !data) return { error: error?.message ?? "섹션 생성 실패" };

  updateTag("sections");
  return { section: mapSection(data as Record<string, unknown>) };
}

/** 섹션 이름 변경 */
export async function updateSectionAction(
  sectionId: string,
  name: string
): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("fp_card_section")
    .update({ name: name.trim() })
    .eq("section_id", sectionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  updateTag("sections");
  return {};
}

/** 섹션 삭제 */
export async function deleteSectionAction(sectionId: string): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("fp_card_section")
    .delete()
    .eq("section_id", sectionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  updateTag("sections");
  return {};
}

/** 섹션 순서 일괄 업데이트 */
export async function reorderSectionsAction(
  sections: Pick<CardSection, "sectionId" | "sortOrder">[]
): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();

  const results = await Promise.all(
    sections.map((s) =>
      supabase
        .from("fp_card_section")
        .update({ sort_order: s.sortOrder })
        .eq("section_id", s.sectionId)
        .eq("user_id", user.id)
    )
  );

  const firstErr = results.find((r) => r.error);
  if (firstErr?.error) return { error: firstErr.error.message };

  updateTag("sections");
  return {};
}

/** AI 자동채움 토글 */
export async function toggleAiAutoFillAction(
  sectionId: string,
  aiAutoFill: boolean
): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("fp_card_section")
    .update({ ai_auto_fill: aiAutoFill })
    .eq("section_id", sectionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  updateTag("sections");
  return {};
}
