"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { updateTag } from "next/cache";
import type { CartItem, StoreItemAiData } from "@/lib/types";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * 카드 재료를 fp_cart_item에 일괄 삽입
 * v_store_inventory_item으로 재고 확인 후 품절 상품 제외
 */
export async function addBundleAction(
  cardId: string,
  ingredients: Omit<CartItem, "userId">[]
): Promise<{ error?: string; excludedNames?: string[] }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();

  // 재고 확인: refStoreItemId 있는 항목만 v_store_inventory_item 조회
  const refIds = ingredients.map((i) => i.refStoreItemId).filter((id): id is string => !!id);

  const outOfStockIds = new Set<string>();

  if (refIds.length > 0) {
    const { data: stockRows } = await supabase
      .from("v_store_inventory_item")
      .select("store_item_id,is_in_stock")
      .in("store_item_id", refIds);

    const stockMap = new Map((stockRows ?? []).map((r) => [r.store_item_id, r.is_in_stock]));
    for (const id of refIds) {
      if (!stockMap.has(id) || stockMap.get(id) === false) {
        outOfStockIds.add(id);
      }
    }
  }

  const excluded = ingredients.filter(
    (i) => i.refStoreItemId && outOfStockIds.has(i.refStoreItemId)
  );
  const toInsert = ingredients.filter(
    (i) => !i.refStoreItemId || !outOfStockIds.has(i.refStoreItemId)
  );

  if (toInsert.length === 0) {
    return { excludedNames: excluded.map((i) => i.name), error: "모든 상품이 품절입니다." };
  }

  const rows = toInsert.map((i) => ({
    user_id: user.id,
    card_id: cardId || null,
    ingredient_id: i.ingredientId ?? null,
    name: i.name,
    qty: i.qty,
    unit: i.unit ?? null,
    price: i.price,
    emoji: i.emoji ?? null,
    ref_store_item_id: i.refStoreItemId ? i.refStoreItemId : null,
  }));

  const { error } = await supabase.from("fp_cart_item").insert(rows);

  if (error) {
    // FK 위반(23503): fp_user_profile 미생성 → upsert 후 재시도
    if (error.code === "23503") {
      const admin = createAdminClient();
      await admin.from("fp_user_profile").upsert(
        {
          user_id: user.id,
          display_name: user.email?.split("@")[0] ?? "사용자",
          family_role: "parent",
          level: 1,
        },
        { onConflict: "user_id" }
      );
      const { error: retryError } = await supabase.from("fp_cart_item").insert(rows);
      if (retryError) return { error: retryError.message };
    } else {
      return { error: error.message };
    }
  }

  updateTag("cart");
  return { excludedNames: excluded.length > 0 ? excluded.map((i) => i.name) : undefined };
}

/** 장바구니 항목 수량 업데이트 */
export async function setQtyAction(cartItemId: string, qty: number): Promise<{ error?: string }> {
  if (qty < 1) return { error: "수량은 1 이상이어야 합니다." };

  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("fp_cart_item")
    .update({ qty })
    .eq("cart_item_id", cartItemId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  updateTag("cart");
  return {};
}

/** 장바구니 항목 삭제 */
export async function removeItemAction(cartItemId: string): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("fp_cart_item")
    .delete()
    .eq("cart_item_id", cartItemId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  updateTag("cart");
  return {};
}

/** 장바구니 전체 비우기 */
export async function clearCartAction(): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();
  const { error } = await supabase.from("fp_cart_item").delete().eq("user_id", user.id);

  if (error) return { error: error.message };
  updateTag("cart");
  return {};
}

/** DB에서 장바구니 아이템 조회 + v_store_inventory_item live price join */
export async function fetchCartItemsAction(): Promise<CartItem[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fp_cart_item")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const baseItems = (data as Record<string, unknown>[]).map((row) => ({
    cartItemId: row.cart_item_id as string,
    userId: row.user_id as string,
    cardId: (row.card_id as string | null) ?? undefined,
    ingredientId: (row.ingredient_id as string | null) ?? undefined,
    name: row.name as string,
    qty: row.qty as number,
    unit: (row.unit as string | null) ?? undefined,
    price: row.price as number,
    emoji: (row.emoji as string | null) ?? undefined,
    refStoreItemId: (row.ref_store_item_id as string | null) ?? undefined,
  }));

  // ref_store_item_id가 있는 항목만 live price 조회
  const refIds = baseItems.map((i) => i.refStoreItemId).filter((id): id is string => !!id);

  if (refIds.length === 0) return baseItems;

  type LiveRow = {
    store_item_id: string | null;
    item_thumbnail_small: string | null;
    ai_ad_copy: string | null;
    effective_sale_price: number | null;
    sale_price: number | null;
    list_price: number | null;
    discount_pct: number | null;
    promo_type: string | null;
    promo_name: string | null;
    is_in_stock: boolean | null;
  };

  const { data: storeItemsRaw } = await supabase
    .from("v_store_inventory_item")
    .select(
      "store_item_id, item_thumbnail_small, ai_ad_copy, " +
        "effective_sale_price, sale_price, list_price, " +
        "discount_pct, promo_type, promo_name, is_in_stock"
    )
    .in("store_item_id", refIds);

  const storeItems = (storeItemsRaw ?? []) as unknown as LiveRow[];

  const liveMap = new Map<string, Partial<StoreItemAiData>>(
    storeItems.map((row) => [
      row.store_item_id ?? "",
      {
        thumbnailSmall: row.item_thumbnail_small ?? undefined,
        aiAdCopy: row.ai_ad_copy ?? undefined,
        effectiveSalePrice: row.effective_sale_price ?? undefined,
        salePrice: row.sale_price ?? undefined,
        listPrice: row.list_price ?? undefined,
        discountPct: row.discount_pct ?? undefined,
        promoType: (row.promo_type as StoreItemAiData["promoType"]) ?? undefined,
        promoName: row.promo_name ?? undefined,
        isInStock: row.is_in_stock ?? undefined,
      },
    ])
  );

  return baseItems.map((item) => {
    const live = item.refStoreItemId ? liveMap.get(item.refStoreItemId) : undefined;
    if (!live) return item;

    // 가격 오버라이드: effectiveSalePrice > salePrice 순 (음수·0 차단)
    const rawLivePrice = live.effectiveSalePrice ?? live.salePrice;
    const livePrice = rawLivePrice != null && rawLivePrice > 0 ? rawLivePrice : undefined;

    return {
      ...item,
      price: livePrice ?? item.price,
      thumbnailUrl: live.thumbnailSmall,
      aiAdCopy: live.aiAdCopy,
      effectiveSalePrice: live.effectiveSalePrice,
      listPrice: live.listPrice,
      discountPct: live.discountPct,
      promoType: live.promoType,
      promoName: live.promoName,
      isInStock: live.isInStock,
    };
  });
}
