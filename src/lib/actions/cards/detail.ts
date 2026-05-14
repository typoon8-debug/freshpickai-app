"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type {
  MenuCard,
  Dish,
  DishRecipe,
  Ingredient,
  IngredientMeta,
  StoreItemAiData,
  ItemCalories,
  CardNote,
} from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";
import { mapCard, mapDish, mapIngredient } from "./mappers";
import { calcHealthScore, calcHealthScoreWithAi, type HealthScore } from "@/lib/health-score";
import { calcPriceCompare, type PriceCompareResult } from "@/lib/price-compare";
import { resolveAiData } from "@/lib/utils/ai-data-guard";

type DbRecipe = Database["public"]["Tables"]["fp_dish_recipe"]["Row"];
type DbMeta = Database["public"]["Tables"]["fp_ingredient_meta"]["Row"];
type DbStoreItem = Database["public"]["Views"]["v_store_inventory_item"]["Row"];

export type DishWithRecipe = Dish & {
  ingredients: Ingredient[];
  recipe?: DishRecipe;
};

export type CardDetail = MenuCard & {
  dishes: DishWithRecipe[];
  healthScore3: HealthScore;
  priceCompare: PriceCompareResult;
  ingredientMetas: IngredientMeta[];
  notes: CardNote[];
};

function mapRecipe(row: DbRecipe): DishRecipe {
  return {
    recipeId: row.recipe_id,
    dishId: row.dish_id,
    title: row.title,
    body: row.body ?? undefined,
    status: row.status as DishRecipe["status"],
    aiConsent: row.ai_consent,
  };
}

function mapMeta(row: DbMeta): IngredientMeta {
  return {
    metaId: row.meta_id,
    name: row.name,
    prepTips: row.prep_tips ?? undefined,
    measurementHints: row.measurement_hints ?? undefined,
    substitutes: row.substitutes,
  };
}

function mapStoreItemToAiData(row: DbStoreItem): StoreItemAiData {
  return {
    storeItemId: row.store_item_id ?? "",
    storeId: row.store_id ?? undefined,
    itemName: row.item_name ?? undefined,
    thumbnailSmall: row.item_thumbnail_small ?? undefined,
    thumbnailBig: row.item_thumbnail_big ?? undefined,
    aiStatus: (row.ai_status as StoreItemAiData["aiStatus"]) ?? null,
    aiConfidence: row.ai_confidence ?? undefined,
    descriptionMarkup: row.description_markup ?? undefined,
    aiAdCopy: row.ai_ad_copy ?? undefined,
    aiTags: (row.ai_tags as string[]) ?? [],
    aiCookingUsage: row.ai_cooking_usage ?? undefined,
    aiCalories: row.ai_calories ? (row.ai_calories as ItemCalories) : undefined,
    aiNutritionSummary: row.ai_nutrition_summary
      ? (row.ai_nutrition_summary as Record<string, number>)
      : undefined,
    listPrice: row.list_price ?? undefined,
    salePrice: row.sale_price ?? undefined,
    effectiveSalePrice: row.effective_sale_price ?? undefined,
    discountPct: row.discount_pct ?? undefined,
    promoId: row.promo_id ?? undefined,
    promoName: row.promo_name ?? undefined,
    promoType: (row.promo_type as StoreItemAiData["promoType"]) ?? undefined,
    isInStock: row.is_in_stock ?? undefined,
    availableQuantity: row.available_quantity ?? undefined,
  };
}

export async function getCardDetail(cardId: string): Promise<CardDetail | null> {
  const supabase = createAdminClient();

  const { data: cardData, error: cardError } = await supabase
    .from("fp_menu_card")
    .select("*")
    .eq("card_id", cardId)
    .single();

  if (cardError || !cardData) return null;

  const { data: cardDishes } = await supabase
    .from("fp_card_dish")
    .select("dish_id, role, sort_order")
    .eq("card_id", cardId)
    .order("sort_order");

  if (!cardDishes || cardDishes.length === 0) {
    return {
      ...mapCard(cardData),
      dishes: [],
      healthScore3: calcHealthScore([]),
      priceCompare: calcPriceCompare(cardData.price_min ?? 15000),
      ingredientMetas: [],
      notes: [],
    };
  }

  const dishIds = cardDishes.map((cd) => cd.dish_id);

  const [{ data: dishes }, { data: ingredients }, { data: recipes }, { data: notesData }] =
    await Promise.all([
      supabase.from("fp_dish").select("*").in("dish_id", dishIds),
      supabase.from("fp_dish_ingredient").select("*").in("dish_id", dishIds).order("sort_order"),
      supabase
        .from("fp_dish_recipe")
        .select("*")
        .in("dish_id", dishIds)
        .eq("status", "approved")
        .order("created_at"),
      supabase
        .from("fp_card_note")
        .select("*")
        .eq("card_id", cardId)
        .order("created_at", { ascending: false }),
    ]);

  const dishMap = new Map((dishes ?? []).map((d) => [d.dish_id, d]));

  const ingredientsByDish = (ingredients ?? []).reduce<Record<string, Ingredient[]>>((acc, ing) => {
    if (!acc[ing.dish_id]) acc[ing.dish_id] = [];
    acc[ing.dish_id].push(mapIngredient(ing));
    return acc;
  }, {});

  const recipeByDish = (recipes ?? []).reduce<Record<string, DishRecipe>>((acc, rec) => {
    if (!acc[rec.dish_id]) acc[rec.dish_id] = mapRecipe(rec);
    return acc;
  }, {});

  const dishesWithRecipes: DishWithRecipe[] = cardDishes
    .map((cd): DishWithRecipe | null => {
      const dish = dishMap.get(cd.dish_id);
      if (!dish) return null;
      return {
        ...mapDish(dish),
        ingredients: ingredientsByDish[cd.dish_id] ?? [],
        recipe: recipeByDish[cd.dish_id],
      };
    })
    .filter((d): d is DishWithRecipe => d !== null);

  const allIngredients = dishesWithRecipes.flatMap((d) => d.ingredients);

  // ── v_store_inventory_item enrichment (Phase 2.5) ─────────────────
  const refIds = allIngredients.map((i) => i.refStoreItemId).filter((id): id is string => !!id);

  const storeItemMap = new Map<string, StoreItemAiData>();

  if (refIds.length > 0) {
    const { data: storeItems } = await supabase
      .from("v_store_inventory_item")
      .select("*")
      .in("store_item_id", refIds);

    ((storeItems ?? []) as DbStoreItem[]).forEach((row) => {
      if (row.store_item_id) {
        const raw = mapStoreItemToAiData(row);
        storeItemMap.set(row.store_item_id, resolveAiData(raw));
      }
    });
  }

  // liveData 주입
  const enrichedDishes = dishesWithRecipes.map((d) => ({
    ...d,
    ingredients: d.ingredients.map((ing) => ({
      ...ing,
      liveData: ing.refStoreItemId ? storeItemMap.get(ing.refStoreItemId) : undefined,
    })),
  }));

  const enrichedIngredients = enrichedDishes.flatMap((d) => d.ingredients);

  // 재료 메타 일괄 조회 (F018)
  const uniqueNames = [...new Set(allIngredients.map((i) => i.name))];
  const metaData =
    uniqueNames.length > 0
      ? await supabase
          .from("fp_ingredient_meta")
          .select("*")
          .in("name", uniqueNames)
          .then(({ data }) => (data ?? []).map(mapMeta))
      : [];

  // full 레벨 재료 50% 이상 → AI 기반 건강점수 분기
  const fullCount = enrichedIngredients.filter(
    (i) => i.liveData?.aiStatus === "ACTIVE" && (i.liveData?.aiConfidence ?? 0) >= 0.6
  ).length;
  const useAiScore =
    enrichedIngredients.length > 0 && fullCount / enrichedIngredients.length >= 0.5;

  const healthScore3 = useAiScore
    ? calcHealthScoreWithAi(enrichedIngredients)
    : calcHealthScore(allIngredients);

  // 평균 discount_pct 기반 live price compare
  const liveDiscounts = enrichedIngredients
    .map((i) => i.liveData?.discountPct)
    .filter((d): d is number => d != null);
  const avgDiscount =
    liveDiscounts.length > 0
      ? liveDiscounts.reduce((a, b) => a + b, 0) / liveDiscounts.length
      : null;

  const notes: CardNote[] = (notesData ?? []).map((row) => ({
    noteId: row.note_id,
    cardId: row.card_id,
    userId: row.user_id,
    noteType: row.note_type as CardNote["noteType"],
    body: row.body,
    helpfulCount: row.helpful_count,
    aiConsent: row.ai_consent,
    adminReply: row.admin_reply ?? undefined,
    createdAt: row.created_at,
  }));

  return {
    ...mapCard(cardData),
    dishes: enrichedDishes,
    healthScore3,
    priceCompare: calcPriceCompare(cardData.price_min ?? 15000, avgDiscount),
    ingredientMetas: metaData,
    notes,
  };
}
