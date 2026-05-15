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

// 실제 사용하는 22개 컬럼만 선택 — 59개 전체 전송 대비 63% 감소
type DbStoreItem = Pick<
  Database["public"]["Views"]["v_store_inventory_item"]["Row"],
  | "store_item_id"
  | "store_id"
  | "item_name"
  | "item_thumbnail_small"
  | "item_thumbnail_big"
  | "ai_status"
  | "ai_confidence"
  | "description_markup"
  | "ai_ad_copy"
  | "ai_tags"
  | "ai_cooking_usage"
  | "ai_calories"
  | "ai_nutrition_summary"
  | "list_price"
  | "sale_price"
  | "effective_sale_price"
  | "discount_pct"
  | "promo_id"
  | "promo_name"
  | "promo_type"
  | "is_in_stock"
  | "available_quantity"
>;

const STORE_ITEM_AI_COLS =
  "store_item_id, store_id, item_name, item_thumbnail_small, item_thumbnail_big, " +
  "ai_status, ai_confidence, description_markup, ai_ad_copy, ai_tags, " +
  "ai_cooking_usage, ai_calories, ai_nutrition_summary, list_price, sale_price, " +
  "effective_sale_price, discount_pct, promo_id, promo_name, promo_type, " +
  "is_in_stock, available_quantity";

// fp_get_card_detail RPC 반환 타입
type RpcCardDetail = {
  card: Database["public"]["Tables"]["fp_menu_card"]["Row"];
  cardDishes: { dishId: string; role: string; sortOrder: number }[];
  dishes: Database["public"]["Tables"]["fp_dish"]["Row"][];
  ingredients: Database["public"]["Tables"]["fp_dish_ingredient"]["Row"][];
  recipes: DbRecipe[];
  notes: Database["public"]["Tables"]["fp_card_note"]["Row"][];
};

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

  // ── Round-trip 1: fp_get_card_detail RPC (card + dishes + ingredients + recipes + notes 통합)
  const { data: rpcRaw, error: rpcError } = await supabase.rpc("fp_get_card_detail", {
    p_card_id: cardId,
  });

  if (rpcError || !rpcRaw) return null;

  const rpc = rpcRaw as unknown as RpcCardDetail;
  const { card: cardData, cardDishes, dishes, ingredients, recipes, notes: notesRaw } = rpc;

  if (!cardData) return null;

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
      const dish = dishMap.get(cd.dishId);
      if (!dish) return null;
      return {
        ...mapDish(dish),
        ingredients: ingredientsByDish[cd.dishId] ?? [],
        recipe: recipeByDish[cd.dishId],
      };
    })
    .filter((d): d is DishWithRecipe => d !== null);

  const allIngredients = dishesWithRecipes.flatMap((d) => d.ingredients);

  // ── Round-trip 2: v_store_inventory_item enrichment (Phase 2.5) ─────────────────
  const refIds = allIngredients.map((i) => i.refStoreItemId).filter((id): id is string => !!id);

  const storeItemMap = new Map<string, StoreItemAiData>();

  if (refIds.length > 0) {
    const { data: storeItems } = await supabase
      .from("v_store_inventory_item")
      .select(STORE_ITEM_AI_COLS)
      .in("store_item_id", refIds);

    ((storeItems ?? []) as unknown as DbStoreItem[]).forEach((row) => {
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

  // 재료 메타 일괄 조회 (F018) — 캐시된 RPC 응답에 포함되지 않아 별도 조회
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

  const liveDiscounts = enrichedIngredients
    .map((i) => i.liveData?.discountPct)
    .filter((d): d is number => d != null);
  const avgDiscount =
    liveDiscounts.length > 0
      ? liveDiscounts.reduce((a, b) => a + b, 0) / liveDiscounts.length
      : null;

  const notes: CardNote[] = (notesRaw ?? []).map((row) => ({
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
