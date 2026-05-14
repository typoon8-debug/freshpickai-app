"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { updateTag } from "next/cache";
import type { CardTheme, StoreItemAiData, ItemCalories, IngredientMeta } from "@/lib/types";
import type { CardWizardValues } from "@/lib/validations/card-wizard";

function deriveCategory(theme: CardTheme): "meal" | "snack" | "cinema" {
  if (theme === "snack_pack") return "snack";
  if (theme === "cinema_night") return "cinema";
  return "meal";
}

/**
 * 재료명으로 v_store_inventory_item 자동 매칭
 * 1순위: item_name ILIKE + ACTIVE + confidence >= 0.6
 * 2순위: ai_tags @> ARRAY[name]
 */
export async function matchIngredientToStoreItemAction(
  name: string,
  storeId?: string
): Promise<StoreItemAiData | null> {
  if (!name.trim()) return null;

  const admin = createAdminClient();

  let query = admin
    .from("v_store_inventory_item")
    .select("*")
    .eq("ai_status", "ACTIVE")
    .gte("ai_confidence", 0.6)
    .ilike("item_name", `%${name}%`)
    .order("ai_confidence", { ascending: false })
    .limit(1);

  if (storeId) query = query.eq("store_id", storeId);

  const { data: primaryRaw } = await query;
  const primary = (primaryRaw ?? []) as Record<string, unknown>[];

  if (primary.length > 0) {
    return mapStoreItem(primary[0]);
  }

  // 2순위: ai_tags 포함 매칭
  let tagQuery = admin
    .from("v_store_inventory_item")
    .select("*")
    .eq("ai_status", "ACTIVE")
    .contains("ai_tags", [name])
    .order("ai_confidence", { ascending: false })
    .limit(1);

  if (storeId) tagQuery = tagQuery.eq("store_id", storeId);

  const { data: secondaryRaw } = await tagQuery;
  const secondary = (secondaryRaw ?? []) as Record<string, unknown>[];

  if (secondary.length > 0) {
    return mapStoreItem(secondary[0]);
  }

  return null;
}

/**
 * 재료명으로 fp_ingredient_meta 조회 (손질법·대체재료 힌트)
 */
export async function getIngredientMetaByNameAction(name: string): Promise<IngredientMeta | null> {
  if (!name.trim()) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("fp_ingredient_meta")
    .select("*")
    .ilike("name", `%${name.trim()}%`)
    .order("name")
    .limit(1);

  if (!data || data.length === 0) return null;

  const row = data[0];
  return {
    metaId: row.meta_id,
    name: row.name,
    prepTips: row.prep_tips ?? undefined,
    measurementHints: row.measurement_hints ?? undefined,
    substitutes: (row.substitutes as string[] | null) ?? [],
  };
}

function mapStoreItem(row: Record<string, unknown>): StoreItemAiData {
  return {
    storeItemId: (row.store_item_id as string) ?? "",
    storeId: (row.store_id as string | null) ?? undefined,
    itemName: (row.item_name as string | null) ?? undefined,
    thumbnailSmall: (row.item_thumbnail_small as string | null) ?? undefined,
    thumbnailBig: (row.item_thumbnail_big as string | null) ?? undefined,
    aiStatus: (row.ai_status as StoreItemAiData["aiStatus"]) ?? null,
    aiConfidence: (row.ai_confidence as number | null) ?? undefined,
    descriptionMarkup: (row.description_markup as string | null) ?? undefined,
    aiAdCopy: (row.ai_ad_copy as string | null) ?? undefined,
    aiTags: (row.ai_tags as string[] | null) ?? [],
    aiCookingUsage: (row.ai_cooking_usage as string | null) ?? undefined,
    aiCalories: (row.ai_calories as ItemCalories | null) ?? undefined,
    aiNutritionSummary: (row.ai_nutrition_summary as Record<string, number> | null) ?? undefined,
    listPrice: (row.list_price as number | null) ?? undefined,
    salePrice: (row.sale_price as number | null) ?? undefined,
    effectiveSalePrice: (row.effective_sale_price as number | null) ?? undefined,
    discountPct: (row.discount_pct as number | null) ?? undefined,
    promoId: (row.promo_id as string | null) ?? undefined,
    promoName: (row.promo_name as string | null) ?? undefined,
    promoType: (row.promo_type as StoreItemAiData["promoType"]) ?? undefined,
    isInStock: (row.is_in_stock as boolean | null) ?? undefined,
    availableQuantity: (row.available_quantity as number | null) ?? undefined,
  };
}

/** 카드 만들기 위저드 결과를 fp_menu_card에 저장 */
export async function createCardAction(
  values: CardWizardValues
): Promise<{ cardId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const finalCardName =
    values.cardName?.trim() || values.tags.slice(0, 2).join(" · ") || values.theme;
  const category = deriveCategory(values.theme);
  const budgetLabel = Number(values.budget).toLocaleString("ko-KR");
  const description = `예산: ${budgetLabel}원 | 태그: ${values.tags.join(", ")}`;

  const { data, error } = await supabase
    .from("fp_menu_card")
    .insert({
      owner_user_id: user.id,
      card_theme: values.theme,
      name: finalCardName,
      category,
      description,
      is_official: false,
      is_new: true,
      review_status: values.submitForReview ? "pending" : "private",
    })
    .select("card_id")
    .single();

  if (error || !data) return { error: error?.message ?? "카드 생성 실패" };

  const cardId = (data as Record<string, unknown>).card_id as string;

  // AI 학습 동의 시 dish + ingredients + recipe stub 생성 (비동기, 실패해도 카드 생성 성공)
  if (values.aiConsent && cardId) {
    void createRecipeStub(cardId, finalCardName, values).catch(() => {});
  }

  updateTag("cards");
  return { cardId };
}

/**
 * AI 학습 동의 시 fp_dish + fp_card_dish + fp_dish_ingredient + fp_dish_recipe 생성
 * source='user_note', status='REVIEW_NEEDED' — 운영자 검수 후 승격 가능
 */
async function createRecipeStub(
  cardId: string,
  cardName: string,
  values: CardWizardValues
): Promise<void> {
  const admin = createAdminClient();

  // 1. fp_dish 생성
  const { data: dishData, error: dishError } = await admin
    .from("fp_dish")
    .insert({ name: cardName, description: `사용자 생성: ${values.tags.join(", ")}` })
    .select("dish_id")
    .single();

  if (dishError || !dishData) return;
  const dishId = (dishData as Record<string, unknown>).dish_id as string;

  // 2. fp_card_dish 연결
  await admin.from("fp_card_dish").insert({
    card_id: cardId,
    dish_id: dishId,
    role: "main",
    sort_order: 0,
  });

  // 3. fp_dish_ingredient 생성
  const ingredientRows = values.ingredients.map((ing, idx) => ({
    dish_id: dishId,
    name: ing.name,
    quantity: ing.qty,
    unit: ing.unit,
    price: ing.price ?? null,
    ref_store_item_id: ing.storeItemId ?? null,
    sort_order: idx,
  }));

  if (ingredientRows.length > 0) {
    await admin.from("fp_dish_ingredient").insert(ingredientRows);
  }

  // 4. fp_dish_recipe stub 생성 (source='user_note', status='REVIEW_NEEDED')
  const recipeBody = values.ingredients
    .map((ing) => `- ${ing.name} ${ing.qty}${ing.unit}`)
    .join("\n");

  await admin.from("fp_dish_recipe").insert({
    dish_id: dishId,
    title: cardName,
    body: recipeBody,
    status: "REVIEW_NEEDED",
    ai_consent: true,
    source: "user_note",
  });
}

/** 카드 검수 신청: review_status를 'pending'으로 변경 */
export async function submitCardForReviewAction(cardId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("fp_menu_card")
    .update({ review_status: "pending" })
    .eq("card_id", cardId)
    .eq("owner_user_id", user.id);

  if (error) return { error: error.message };

  updateTag("cards");
  return {};
}
