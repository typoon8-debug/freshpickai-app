import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { searchByVector } from "@/lib/ai/vector-search";
import { enqueueIfLowConfidence } from "@/lib/ai/self-reinforce";

export type SearchItemsProductResult = {
  storeItemId: string;
  itemName: string;
  effectiveSalePrice: number | null;
  salePrice: number | null;
  listPrice: number | null;
  discountPct: number | null;
  promoType: string | null;
  promoName: string | null;
  aiAdCopy: string | null;
  aiTags: string[] | null;
  aiConfidence: number | null;
  thumbnailUrl: string | null;
};

export type SearchItemsRecipeResult = {
  recipeId: string;
  title: string;
  dishId: string;
  similarity: number;
  searchSource: string;
};

/** F018: 재료별 대체 재료 + 구매 가능 여부 */
export type IngredientSubstituteInfo = {
  ingredientName: string;
  substitutes: string[];
  availableInStore: string[];
};

export type SearchItemsToolResult =
  | {
      success: true;
      mode: "item";
      query: string;
      count: number;
      results: SearchItemsProductResult[];
    }
  | {
      success: true;
      mode: "recipe";
      query: string;
      count: number;
      results: SearchItemsRecipeResult[];
      ingredientSubstitutes: IngredientSubstituteInfo[];
    }
  | { success: false; error: string };

const filtersSchema = z
  .object({
    dietTags: z.array(z.string()).optional().describe("식이 태그 필터 (예: 비건, 글루텐프리)"),
    personaTags: z.array(z.string()).optional().describe("페르소나 태그 필터"),
    aiTags: z.array(z.string()).optional().describe("AI 태그 필터 (상품 검색용)"),
  })
  .optional();

const searchItemsSchema = z.object({
  query: z.string().describe("검색어 (한국어 지원)"),
  mode: z.enum(["recipe", "item"]).describe("recipe: 레시피 검색, item: 상품 검색"),
  filters: filtersSchema,
  limit: z.number().optional().default(8).describe("최대 결과 수 (기본 8, 최대 20)"),
  /** F020 냉장고 비우기: 보유 재료 목록 — recipe 모드에서 재료 매칭 우선순위 조정 */
  availableIngredients: z
    .array(z.string())
    .optional()
    .describe("보유 재료 목록 (냉장고 비우기 모드) — recipe 모드에서 매칭 스코어 보정에 사용"),
});

/**
 * 쿼리 텍스트에서 fp_ingredient_meta와 매칭되는 재료를 찾아
 * substitutes + 구매 가능 여부를 반환합니다 (F018).
 */
async function lookupSubstitutes(
  supabase: SupabaseClient<Database>,
  query: string
): Promise<IngredientSubstituteInfo[]> {
  try {
    // 모든 재료 메타 조회 (100종 이하로 소규모 — JS 필터 적합)
    const { data: allMetas } = await supabase
      .from("fp_ingredient_meta")
      .select("name, substitutes");

    if (!allMetas || allMetas.length === 0) return [];

    // 쿼리 텍스트에 재료명이 포함된 항목만 선택
    const matched = allMetas.filter((m) => query.includes(m.name));
    if (matched.length === 0) return [];

    // 매칭된 재료들의 모든 대체 재료 목록
    const allSubstitutes = matched.flatMap((m) => m.substitutes);
    if (allSubstitutes.length === 0) {
      return matched.map((m) => ({
        ingredientName: m.name,
        substitutes: m.substitutes,
        availableInStore: [],
      }));
    }

    // v_store_inventory_item에서 대체 재료 구매 가능 여부 확인
    // item_name ILIKE 또는 ai_tags 교차 참조
    const ilikeFilters = allSubstitutes.map((s) => `item_name.ilike.%${s}%`).join(",");

    const { data: storeItems } = await supabase
      .from("v_store_inventory_item")
      .select("item_name, ai_tags, is_in_stock")
      .eq("ai_status", "ACTIVE")
      .eq("is_in_stock", true)
      .or(ilikeFilters)
      .limit(30);

    // 구매 가능한 대체 재료 이름 집합
    const availableNames = new Set<string>();
    (storeItems ?? []).forEach((item) => {
      if (item.item_name) {
        allSubstitutes.forEach((sub) => {
          if (item.item_name!.includes(sub) || (item.ai_tags ?? []).includes(sub)) {
            availableNames.add(sub);
          }
        });
      }
    });

    return matched.map((m) => ({
      ingredientName: m.name,
      substitutes: m.substitutes,
      availableInStore: m.substitutes.filter((s) => availableNames.has(s)),
    }));
  } catch {
    return [];
  }
}

export function createSearchItemsTool(supabase: SupabaseClient<Database>) {
  return tool({
    description:
      "레시피 또는 상품을 pgvector 유사도 검색으로 찾습니다. mode=recipe로 레시피를, mode=item으로 구매 가능한 상품을 검색하세요. recipe 모드는 재료 대체 정보(ingredientSubstitutes)도 함께 반환합니다.",
    inputSchema: searchItemsSchema,
    execute: async ({
      query,
      mode,
      filters,
      limit = 8,
      availableIngredients,
    }: z.infer<typeof searchItemsSchema>): Promise<SearchItemsToolResult> => {
      const clampedLimit = Math.min(limit, 20);

      try {
        if (mode === "recipe") {
          // 레시피 벡터 검색 + substitutes 병렬 조회 (F018)
          // F020: availableIngredients가 있으면 쿼리에 재료 컨텍스트 추가
          const enrichedQuery =
            availableIngredients && availableIngredients.length > 0
              ? `${query} 재료: ${availableIngredients.join(", ")}`
              : query;

          const [vectorResults, ingredientSubstitutes] = await Promise.all([
            searchByVector(enrichedQuery, {
              table: "recipe",
              limit: clampedLimit,
              filters: {
                dietTags: filters?.dietTags,
                personaTags: filters?.personaTags,
              },
            }),
            lookupSubstitutes(supabase, query),
          ]);

          return {
            success: true,
            mode: "recipe",
            query,
            count: vectorResults.length,
            results: vectorResults.map((r) => ({
              recipeId: r.id,
              title: r.name,
              dishId: r.dishId ?? "",
              similarity: r.similarity,
              searchSource: r.searchSource,
            })),
            ingredientSubstitutes,
          };
        }

        // item 모드: 벡터 검색 후 v_store_inventory_item에서 상세 정보 enrichment
        const vectorResults = await searchByVector(query, {
          table: "store_item",
          limit: clampedLimit,
          filters: { aiTags: filters?.aiTags },
        });

        if (vectorResults.length === 0) {
          return { success: true, mode: "item", query, count: 0, results: [] };
        }

        const ids = vectorResults.map((r) => r.id);

        const { data: details, error } = await supabase
          .from("v_store_inventory_item")
          .select(
            "store_item_id, item_name, effective_sale_price, sale_price, list_price, discount_pct, promo_type, promo_name, ai_ad_copy, ai_tags, ai_confidence, item_thumbnail_small, item_thumbnail_big, is_in_stock, ai_status"
          )
          .in("store_item_id", ids)
          .eq("ai_status", "ACTIVE");

        if (error) {
          return { success: false, error: `상품 상세 조회 실패: ${error.message}` };
        }

        // 벡터 검색 순서 유지
        const detailMap = new Map((details ?? []).map((d) => [d.store_item_id, d]));

        const enriched: SearchItemsProductResult[] = ids
          .map((id) => {
            const d = detailMap.get(id);
            if (!d) return null;
            const clampPrice = (v: number | null) => (v != null && v > 0 ? v : null);
            return {
              storeItemId: id,
              itemName: d.item_name ?? "",
              effectiveSalePrice: clampPrice(d.effective_sale_price),
              salePrice: clampPrice(d.sale_price),
              listPrice: clampPrice(d.list_price),
              discountPct:
                d.discount_pct != null ? Math.max(0, Math.min(100, d.discount_pct)) : null,
              promoType: d.promo_type,
              promoName: d.promo_name,
              aiAdCopy: d.ai_ad_copy,
              aiTags: d.ai_tags,
              aiConfidence: d.ai_confidence,
              thumbnailUrl: d.item_thumbnail_small ?? d.item_thumbnail_big,
            };
          })
          .filter((x): x is SearchItemsProductResult => x !== null);

        // 신뢰도 0.6 미만 상품 자기보강 큐 등록 (fire-and-forget)
        enqueueIfLowConfidence(
          enriched.map((r) => ({
            storeItemId: r.storeItemId,
            itemName: r.itemName,
            aiConfidence: r.aiConfidence ?? undefined,
          })),
          `searchItems query="${query}"`
        );

        return {
          success: true,
          mode: "item",
          query,
          count: enriched.length,
          results: enriched,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, error: `검색 오류: ${msg}` };
      }
    },
  });
}
