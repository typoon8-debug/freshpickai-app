"use server";

import { createClient } from "@/lib/supabase/server";

// ── 주문 이력 기반 persona_tags 추론 ─────────────────────────
async function inferPersonaTagsFromHistory(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string[]> {
  const { data: orders } = await supabase
    .from("fp_order")
    .select("subtotal, total")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!orders || orders.length === 0) return [];

  const inferred: string[] = [];
  const avgTotal = orders.reduce((s, o) => s + (o.total ?? 0), 0) / orders.length;

  if (avgTotal < 12000) inferred.push("budget_low");
  else if (avgTotal > 28000) inferred.push("budget_high");

  return inferred;
}

// ── 장바구니 이력 기반 dietary_tags 추론 ─────────────────────
async function inferDietaryTagsFromHistory(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string[]> {
  const { data: cartItems } = await supabase
    .from("fp_cart_item")
    .select("name")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!cartItems || cartItems.length === 0) return [];

  const names = cartItems.map((c) => c.name?.toLowerCase() ?? "");
  const total = names.length;
  const inferred: string[] = [];

  const countMatching = (keywords: string[]) =>
    names.filter((n) => keywords.some((k) => n.includes(k))).length;

  // 채식 패턴 — 두부·브로콜리·시금치·버섯 위주
  if (countMatching(["두부", "브로콜리", "시금치", "케일", "콩", "버섯"]) / total > 0.4)
    inferred.push("채식");

  // 저칼로리 패턴 — 닭가슴살·두부·곤약
  if (countMatching(["닭가슴살", "두부", "곤약", "채소"]) / total > 0.3) inferred.push("저칼로리");

  // 고단백 패턴 — 닭가슴살·계란·참치·연어·소고기
  if (countMatching(["닭가슴살", "계란", "참치", "연어", "소고기"]) / total > 0.3)
    inferred.push("고단백");

  return [...new Set(inferred)];
}

// ── 공개 API: 추론 결과를 DB에 반영 ─────────────────────────
export async function applyInferredTags(userId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) return { success: false };

  const [personaTagsInferred, dietaryTagsInferred] = await Promise.all([
    inferPersonaTagsFromHistory(userId, supabase),
    inferDietaryTagsFromHistory(userId, supabase),
  ]);

  if (personaTagsInferred.length === 0 && dietaryTagsInferred.length === 0) {
    return { success: true };
  }

  const { data: existing } = await supabase
    .from("fp_user_preference")
    .select("persona_tags, dietary_tags")
    .eq("user_id", userId)
    .single();

  const existingPersonaTags: string[] = existing?.persona_tags ?? [];
  const existingDietaryTags: string[] = existing?.dietary_tags ?? [];

  // 기존 태그와 병합 (중복 제거)
  const mergedPersonaTags = [...new Set([...existingPersonaTags, ...personaTagsInferred])];
  const mergedDietaryTags = [...new Set([...existingDietaryTags, ...dietaryTagsInferred])];

  const { error } = await supabase.from("fp_user_preference").upsert(
    {
      user_id: userId,
      persona_tags: mergedPersonaTags,
      dietary_tags: mergedDietaryTags,
      modified_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return { success: !error };
}

// ── 공개 API: 사용자 선호 저장 (PreferenceForm용) ─────────────
export async function saveUserPreference(values: {
  dietaryTags: string[];
  cookingSkill: "beginner" | "intermediate" | "advanced";
  preferredShoppingTime: "morning" | "afternoon" | "evening";
  householdSize?: number;
}): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false };

  const { data: existing } = await supabase
    .from("fp_user_preference")
    .select("persona_tags")
    .eq("user_id", user.id)
    .single();

  const existingTags: string[] = existing?.persona_tags ?? [];

  // 기존 인코딩 태그 제거 후 새 값 삽입
  const filteredTags = existingTags.filter(
    (t) => !t.startsWith("skill:") && !t.startsWith("shop_time:") && !t.startsWith("household:")
  );

  const newTags = [
    ...filteredTags,
    `skill:${values.cookingSkill}`,
    `shop_time:${values.preferredShoppingTime}`,
    ...(values.householdSize !== undefined ? [`household:${values.householdSize}`] : []),
  ];

  const { error } = await supabase.from("fp_user_preference").upsert(
    {
      user_id: user.id,
      dietary_tags: values.dietaryTags,
      persona_tags: newTags,
      modified_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return { success: !error };
}
