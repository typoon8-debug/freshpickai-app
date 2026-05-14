"use server";

import { createClient } from "@/lib/supabase/server";
import { searchByVector } from "@/lib/ai/vector-search";

export type MatchCandidate = {
  storeItemId: string;
  itemName: string;
  score: number;
  effectiveSalePrice: number | null;
  salePrice: number | null;
  thumbnailSmall: string | null;
  isInStock: boolean | null;
};

/** 재료명으로 v_store_inventory_item 후보 최대 5개 반환 */
export async function searchMatchCandidatesAction(
  name: string,
  unit?: string
): Promise<{ candidates: MatchCandidate[]; error?: string }> {
  try {
    const query = [name, unit].filter(Boolean).join(" ");
    const results = await searchByVector(query, {
      table: "store_item",
      limit: 5,
      threshold: 0.3,
    });

    if (results.length === 0) return { candidates: [] };

    const supabase = await createClient();
    const { data: storeItems, error } = await supabase
      .from("v_store_inventory_item")
      .select(
        "store_item_id, item_name, effective_sale_price, sale_price, item_thumbnail_small, is_in_stock"
      )
      .in(
        "store_item_id",
        results.map((r) => r.id)
      )
      .eq("ai_status", "ACTIVE");

    if (error) return { candidates: [], error: error.message };

    const storeMap = new Map((storeItems ?? []).map((s) => [s.store_item_id, s]));

    return {
      candidates: results
        .map((r) => {
          const s = storeMap.get(r.id);
          if (!s) return null;
          return {
            storeItemId: r.id,
            itemName: s.item_name ?? r.name,
            score: r.similarity,
            effectiveSalePrice: s.effective_sale_price ?? null,
            salePrice: s.sale_price ?? null,
            thumbnailSmall: s.item_thumbnail_small ?? null,
            isInStock: s.is_in_stock ?? null,
          };
        })
        .filter((c): c is MatchCandidate => c !== null),
    };
  } catch (err) {
    return { candidates: [], error: err instanceof Error ? err.message : "검색 오류" };
  }
}

/** 재료에 스토어 상품 매칭 확정 — fp_dish_ingredient.ref_store_item_id 업데이트 */
export async function confirmMatchAction(
  ingredientId: string,
  storeItemId: string,
  price: number
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fp_dish_ingredient")
    .update({ ref_store_item_id: storeItemId, price })
    .eq("ingredient_id", ingredientId);

  return error ? { error: error.message } : {};
}

/** 매칭 해제 — ref_store_item_id를 null로 초기화 */
export async function clearMatchAction(ingredientId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fp_dish_ingredient")
    .update({ ref_store_item_id: null })
    .eq("ingredient_id", ingredientId);

  return error ? { error: error.message } : {};
}
