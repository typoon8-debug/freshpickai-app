"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { updateTag } from "next/cache";
import type { WishlistItem, StoreItemAiData, ItemCalories } from "@/lib/types";
import { resolveAiData } from "@/lib/utils/ai-data-guard";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** 찜 추가 */
export async function addWishlistAction(
  storeItemId: string,
  storeId: string
): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("fp_wishlist")
    .upsert(
      { user_id: user.id, store_item_id: storeItemId, store_id: storeId },
      { onConflict: "user_id,store_item_id", ignoreDuplicates: true }
    );

  if (error) return { error: error.message };
  updateTag("wishlist");
  return {};
}

/** 찜 제거 */
export async function removeWishlistAction(storeItemId: string): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("fp_wishlist")
    .delete()
    .eq("user_id", user.id)
    .eq("store_item_id", storeItemId);

  if (error) return { error: error.message };
  updateTag("wishlist");
  return {};
}

/** 찜 여부 확인 */
export async function isWishlisted(storeItemId: string): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;

  const supabase = await createClient();
  const { data } = await supabase
    .from("fp_wishlist")
    .select("wishlist_id")
    .eq("user_id", user.id)
    .eq("store_item_id", storeItemId)
    .maybeSingle();

  return !!data;
}

/** 찜 목록 조회 (v_store_inventory_item join + resolveAiData 적용) */
export async function fetchWishlistAction(): Promise<WishlistItem[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data: wishlistRows, error } = await supabase
    .from("fp_wishlist")
    .select("wishlist_id,store_item_id,store_id,added_at")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (error || !wishlistRows || wishlistRows.length === 0) return [];

  const storeItemIds = wishlistRows.map((r) => r.store_item_id as string);

  type VRow = {
    store_item_id: string | null;
    store_id: string | null;
    item_name: string | null;
    item_thumbnail_small: string | null;
    item_thumbnail_big: string | null;
    ai_status: string | null;
    ai_confidence: number | null;
    description_markup: string | null;
    ai_ad_copy: string | null;
    ai_tags: string[] | null;
    ai_cooking_usage: string | null;
    ai_calories: ItemCalories | null;
    ai_nutrition_summary: Record<string, number> | null;
    list_price: number | null;
    sale_price: number | null;
    effective_sale_price: number | null;
    discount_pct: number | null;
    promo_id: string | null;
    promo_name: string | null;
    promo_type: string | null;
    is_in_stock: boolean | null;
    available_quantity: number | null;
  };

  const admin = createAdminClient();
  const { data: storeItemsRaw } = await admin
    .from("v_store_inventory_item")
    .select("*")
    .in("store_item_id", storeItemIds);

  const storeItems = (storeItemsRaw ?? []) as VRow[];

  const liveMap = new Map(
    storeItems.map((row) => {
      const raw: StoreItemAiData = {
        storeItemId: row.store_item_id ?? "",
        storeId: row.store_id ?? undefined,
        itemName: row.item_name ?? undefined,
        thumbnailSmall: row.item_thumbnail_small ?? undefined,
        thumbnailBig: row.item_thumbnail_big ?? undefined,
        aiStatus: (row.ai_status as StoreItemAiData["aiStatus"]) ?? null,
        aiConfidence: row.ai_confidence ?? undefined,
        descriptionMarkup: row.description_markup ?? undefined,
        aiAdCopy: row.ai_ad_copy ?? undefined,
        aiTags: row.ai_tags ?? [],
        aiCookingUsage: row.ai_cooking_usage ?? undefined,
        aiCalories: row.ai_calories ?? undefined,
        aiNutritionSummary: row.ai_nutrition_summary ?? undefined,
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
      return [row.store_item_id ?? "", resolveAiData(raw)];
    })
  );

  return wishlistRows.map((row) => {
    const live = liveMap.get(row.store_item_id as string) ?? {
      storeItemId: row.store_item_id as string,
      aiStatus: null as StoreItemAiData["aiStatus"],
      aiTags: [],
    };
    return {
      ...live,
      wishlistId: row.wishlist_id as string,
      addedAt: row.added_at as string,
    };
  });
}
