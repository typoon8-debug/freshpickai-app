"use server";

import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { MenuCard, Dish, Ingredient, CardTheme } from "@/lib/types";
import { mapCard, mapDish, mapIngredient } from "./mappers";

export type CardFilter = {
  theme?: CardTheme;
  category?: "meal" | "snack" | "cinema";
  officialOnly?: boolean;
  /** AI 태그 필터 — fp_cards_by_ai_tags RPC 호출 */
  aiTags?: string[];
};

export type CardWithDishes = MenuCard & {
  dishes: (Dish & { ingredients: Ingredient[] })[];
};

// 공식 카드 전체 목록 — 5분 캐시 (관리자 승인 후 revalidate 필요 시 updateTag("official-cards"))
const _fetchOfficialCards = unstable_cache(
  async (): Promise<MenuCard[]> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("fp_menu_card")
      .select("*")
      .eq("review_status", "approved")
      .eq("is_official", true)
      .order("is_new", { ascending: false })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapCard);
  },
  ["official-cards"],
  { revalidate: 300, tags: ["official-cards"] }
);

export async function getCards(filter?: CardFilter): Promise<MenuCard[]> {
  const supabase = createAdminClient();

  // 공식 카드 필터(테마·카테고리·aiTags 없음)는 캐시 경로 사용
  if (
    filter?.officialOnly &&
    !filter.theme &&
    !filter.category &&
    (!filter.aiTags || filter.aiTags.length === 0)
  ) {
    return _fetchOfficialCards();
  }

  // AI 태그 필터: fp_cards_by_diet_tags RPC로 dish diet_tags 기반 카드 ID 조회
  if (filter?.aiTags && filter.aiTags.length > 0) {
    const { data: rpcResult, error: rpcError } = await supabase.rpc("fp_cards_by_diet_tags", {
      p_tags: filter.aiTags,
    });
    if (rpcError || !rpcResult || rpcResult.length === 0) return [];

    const cardIds = (rpcResult as { card_id: string }[]).map((r) => r.card_id);

    let query = supabase
      .from("fp_menu_card")
      .select("*")
      .in("card_id", cardIds)
      .eq("review_status", "approved");

    if (filter.theme) query = query.eq("card_theme", filter.theme);
    if (filter.category) query = query.eq("category", filter.category);
    if (filter.officialOnly) query = query.eq("is_official", true);

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapCard);
  }

  let query = supabase
    .from("fp_menu_card")
    .select("*")
    .eq("review_status", "approved")
    .order("is_new", { ascending: false })
    .order("created_at", { ascending: false });

  if (filter?.theme) {
    query = query.eq("card_theme", filter.theme);
  }
  if (filter?.category) {
    query = query.eq("category", filter.category);
  }
  if (filter?.officialOnly) {
    query = query.eq("is_official", true);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapCard);
}

export async function getCard(cardId: string): Promise<CardWithDishes | null> {
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
    return { ...mapCard(cardData), dishes: [] };
  }

  const dishIds = cardDishes.map((cd) => cd.dish_id);

  const [{ data: dishes }, { data: ingredients }] = await Promise.all([
    supabase.from("fp_dish").select("*").in("dish_id", dishIds),
    supabase.from("fp_dish_ingredient").select("*").in("dish_id", dishIds).order("sort_order"),
  ]);

  const dishMap = new Map((dishes ?? []).map((d) => [d.dish_id, d]));
  const ingredientsByDish = (ingredients ?? []).reduce<Record<string, Ingredient[]>>((acc, ing) => {
    if (!acc[ing.dish_id]) acc[ing.dish_id] = [];
    acc[ing.dish_id].push(mapIngredient(ing));
    return acc;
  }, {});

  const dishesWithIngredients = cardDishes
    .map((cd) => {
      const dish = dishMap.get(cd.dish_id);
      if (!dish) return null;
      return {
        ...mapDish(dish),
        ingredients: ingredientsByDish[cd.dish_id] ?? [],
      };
    })
    .filter((d): d is Dish & { ingredients: Ingredient[] } => d !== null);

  return { ...mapCard(cardData), dishes: dishesWithIngredients };
}

// 데일리픽 — 날짜 단위 캐시 (자정마다 자동 만료)
const _fetchDailyPick = unstable_cache(
  async (): Promise<MenuCard | null> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("fp_menu_card")
      .select("*")
      .eq("is_official", true)
      .eq("review_status", "approved")
      .eq("category", "meal");

    if (error || !data || data.length === 0) return null;

    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const idx = seed % data.length;
    return mapCard(data[idx]);
  },
  ["daily-pick"],
  { revalidate: 86400, tags: ["daily-pick"] } // 24시간 캐시
);

export async function getDailyPick(): Promise<MenuCard | null> {
  return _fetchDailyPick();
}
