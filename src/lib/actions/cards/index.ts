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

// fp_get_card_detail RPC 반환 타입 (card/dishes/ingredients 단일 round-trip)
type RpcCardDetailResult = {
  card: import("@/lib/supabase/database.types").Database["public"]["Tables"]["fp_menu_card"]["Row"];
  cardDishes: Array<{ dishId: string; role: string; sortOrder: number }>;
  dishes: import("@/lib/supabase/database.types").Database["public"]["Tables"]["fp_dish"]["Row"][];
  ingredients: import("@/lib/supabase/database.types").Database["public"]["Tables"]["fp_dish_ingredient"]["Row"][];
};

export async function getCard(cardId: string): Promise<CardWithDishes | null> {
  const supabase = createAdminClient();

  // fp_get_card_detail RPC: card + cardDishes + dishes + ingredients를 1 round-trip으로 반환
  const { data, error } = await supabase.rpc("fp_get_card_detail", { p_card_id: cardId });

  if (error || !data) return null;

  const detail = data as unknown as RpcCardDetailResult;
  if (!detail.card) return null;

  const dishMap = new Map((detail.dishes ?? []).map((d) => [d.dish_id, d]));

  const ingredientsByDish = (detail.ingredients ?? []).reduce<Record<string, Ingredient[]>>(
    (acc, ing) => {
      if (!acc[ing.dish_id]) acc[ing.dish_id] = [];
      acc[ing.dish_id].push(mapIngredient(ing));
      return acc;
    },
    {}
  );

  const dishesWithIngredients = (detail.cardDishes ?? [])
    .map((cd) => {
      const dish = dishMap.get(cd.dishId);
      if (!dish) return null;
      return {
        ...mapDish(dish),
        ingredients: ingredientsByDish[cd.dishId] ?? [],
      };
    })
    .filter((d): d is Dish & { ingredients: Ingredient[] } => d !== null);

  return { ...mapCard(detail.card), dishes: dishesWithIngredients };
}

// 데일리픽 — 날짜 단위 캐시 (자정마다 자동 만료)
// count → 단일 행 2-round-trip이지만 24h 캐시로 하루 1회만 실행됨
const _fetchDailyPick = unstable_cache(
  async (): Promise<MenuCard | null> => {
    const supabase = createAdminClient();

    const { count, error: countError } = await supabase
      .from("fp_menu_card")
      .select("*", { count: "exact", head: true })
      .eq("is_official", true)
      .eq("review_status", "approved")
      .eq("category", "meal");

    if (countError || !count || count === 0) return null;

    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const idx = seed % count;

    const { data, error } = await supabase
      .from("fp_menu_card")
      .select("*")
      .eq("is_official", true)
      .eq("review_status", "approved")
      .eq("category", "meal")
      .range(idx, idx)
      .single();

    if (error || !data) return null;
    return mapCard(data);
  },
  ["daily-pick"],
  { revalidate: 86400, tags: ["daily-pick"] } // 24시간 캐시
);

export async function getDailyPick(): Promise<MenuCard | null> {
  return _fetchDailyPick();
}
