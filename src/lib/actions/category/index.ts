"use server";

import { createClient } from "@/lib/supabase/server";

export type LargeCategory = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

export type MediumCategory = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

export type CategoryItem = {
  storeItemId: string;
  itemName: string;
  thumbnailSmall: string | null;
  effectiveSalePrice: number | null;
  listPrice: number | null;
  discountPct: number | null;
  isInStock: boolean | null;
  stdLargeCode: string | null;
  stdMediumCode: string | null;
};

export type CategoryItemDetail = CategoryItem & {
  thumbnailBig: string | null;
  itemImage: string | null;
  descriptionMarkup: string | null;
  aiAdCopy: string | null;
  aiCookingUsage: string | null;
  aiTags: string[];
  stdLargeName: string | null;
  stdMediumName: string | null;
  stdSmallName: string | null;
  promoName: string | null;
  availableQuantity: number | null;
  storeId: string | null;
  aiConfidence: number | null;
  aiGeneratedAt: string | null;
  detailImgAdv1: string | null;
  detailImgAdv2: string | null;
  detailImgAdv3: string | null;
  supplier: string | null;
};

export type StoreInfo = {
  storeId: string;
  storeName: string | null;
  storeAddress: string | null;
  storePhone: string | null;
  minDeliveryPrice: number | null;
  deliveryTip: number | null;
  minDeliveryTime: number | null;
  maxDeliveryTime: number | null;
  ceoName: string | null;
  regNumber: string | null;
  regCode: string | null;
};

export type ItemReview = {
  reviewId: string;
  rating: number;
  content: string | null;
  createdAt: string;
};

export type SortBy = "popular" | "price_asc" | "price_desc" | "discount";

/** 로그인 사용자의 store_id 조회 */
export async function getUserStoreIdAction(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("fp_user_profile")
    .select("ref_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.ref_customer_id) return null;

  const { data: customer } = await supabase
    .from("customer")
    .select("store_id")
    .eq("customer_id", profile.ref_customer_id as string)
    .single();

  return (customer?.store_id as string | null) ?? null;
}

/** 대분류 목록 */
export async function getLargeCategoriesAction(): Promise<LargeCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenant_std_large_code")
    .select("id, code, name, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    code: r.code as string,
    name: r.name as string,
    sortOrder: r.sort_order as number,
  }));
}

/** 대분류 코드로 중분류 목록 조회 */
export async function getMediumCategoriesByLargeAction(
  largeCode: string
): Promise<MediumCategory[]> {
  const supabase = await createClient();

  // tenant_std_medium_code.large_id → tenant_std_large_code.id JOIN
  const { data, error } = await supabase
    .from("tenant_std_medium_code")
    .select("id, code, name, sort_order, tenant_std_large_code!inner(code)")
    .eq("tenant_std_large_code.code", largeCode)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return (data as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    code: r.code as string,
    name: r.name as string,
    sortOrder: r.sort_order as number,
  }));
}

/** 카테고리별 상품 조회 */
export async function getItemsByCategoryAction(params: {
  largeCode?: string;
  mediumCode?: string;
  sortBy: SortBy;
  limit?: number;
  offset?: number;
  storeId?: string;
}): Promise<{ items: CategoryItem[]; total: number }> {
  const { largeCode, mediumCode, sortBy, limit = 40, offset = 0, storeId } = params;
  const supabase = await createClient();

  let query = supabase
    .from("v_store_inventory_item")
    .select(
      "store_item_id, item_name, item_thumbnail_small, effective_sale_price, list_price, discount_pct, is_in_stock, std_large_code, std_medium_code",
      { count: "exact" }
    )
    .eq("status", "ACTIVE");

  if (storeId) query = query.eq("store_id", storeId);
  if (largeCode) query = query.eq("std_large_code", largeCode);
  if (mediumCode) query = query.eq("std_medium_code", mediumCode);

  switch (sortBy) {
    case "price_asc":
      query = query.order("effective_sale_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("effective_sale_price", { ascending: false });
      break;
    case "discount":
      query = query.order("discount_pct", { ascending: false });
      break;
    default:
      query = query.order("store_item_id", { ascending: true });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error || !data) return { items: [], total: 0 };

  const items = (data as Record<string, unknown>[]).map((r) => ({
    storeItemId: r.store_item_id as string,
    itemName: r.item_name as string,
    thumbnailSmall: (r.item_thumbnail_small as string | null) ?? null,
    effectiveSalePrice: (r.effective_sale_price as number | null) ?? null,
    listPrice: (r.list_price as number | null) ?? null,
    discountPct: (r.discount_pct as number | null) ?? null,
    isInStock: (r.is_in_stock as boolean | null) ?? null,
    stdLargeCode: (r.std_large_code as string | null) ?? null,
    stdMediumCode: (r.std_medium_code as string | null) ?? null,
  }));

  return { items, total: count ?? 0 };
}

/** 상품 단건 상세 조회 */
export async function getItemByIdAction(storeItemId: string): Promise<CategoryItemDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_store_inventory_item")
    .select(
      "store_item_id, store_id, item_name, item_thumbnail_small, item_thumbnail_big, item_image, effective_sale_price, list_price, discount_pct, is_in_stock, std_large_code, std_large_name, std_medium_code, std_medium_name, std_small_name, description_markup, ai_ad_copy, ai_cooking_usage, ai_tags, ai_confidence, ai_generated_at, promo_name, available_quantity, item_detail_img_adv1, item_detail_img_adv2, item_detail_img_adv3, supplier"
    )
    .eq("store_item_id", storeItemId)
    .single();

  if (error || !data) return null;

  const r = data as Record<string, unknown>;
  return {
    storeItemId: r.store_item_id as string,
    storeId: (r.store_id as string | null) ?? null,
    itemName: r.item_name as string,
    thumbnailSmall: (r.item_thumbnail_small as string | null) ?? null,
    thumbnailBig: (r.item_thumbnail_big as string | null) ?? null,
    itemImage: (r.item_image as string | null) ?? null,
    effectiveSalePrice: (r.effective_sale_price as number | null) ?? null,
    listPrice: (r.list_price as number | null) ?? null,
    discountPct: (r.discount_pct as number | null) ?? null,
    isInStock: (r.is_in_stock as boolean | null) ?? null,
    stdLargeCode: (r.std_large_code as string | null) ?? null,
    stdLargeName: (r.std_large_name as string | null) ?? null,
    stdMediumCode: (r.std_medium_code as string | null) ?? null,
    stdMediumName: (r.std_medium_name as string | null) ?? null,
    stdSmallName: (r.std_small_name as string | null) ?? null,
    descriptionMarkup: (r.description_markup as string | null) ?? null,
    aiAdCopy: (r.ai_ad_copy as string | null) ?? null,
    aiCookingUsage: (r.ai_cooking_usage as string | null) ?? null,
    aiTags: (r.ai_tags as string[] | null) ?? [],
    aiConfidence: (r.ai_confidence as number | null) ?? null,
    aiGeneratedAt: (r.ai_generated_at as string | null) ?? null,
    promoName: (r.promo_name as string | null) ?? null,
    availableQuantity: (r.available_quantity as number | null) ?? null,
    detailImgAdv1: (r.item_detail_img_adv1 as string | null) ?? null,
    detailImgAdv2: (r.item_detail_img_adv2 as string | null) ?? null,
    detailImgAdv3: (r.item_detail_img_adv3 as string | null) ?? null,
    supplier: (r.supplier as string | null) ?? null,
  };
}

/** 스토어 정보 조회 */
export async function getStoreInfoAction(storeId: string): Promise<StoreInfo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store")
    .select(
      "store_id, name, address, phone, min_delivery_price, delivery_tip, min_delivery_time, max_delivery_time, ceo_name, reg_number, reg_code"
    )
    .eq("store_id", storeId)
    .single();

  if (error || !data) return null;
  const r = data as Record<string, unknown>;
  return {
    storeId: r.store_id as string,
    storeName: (r.name as string | null) ?? null,
    storeAddress: (r.address as string | null) ?? null,
    storePhone: (r.phone as string | null) ?? null,
    minDeliveryPrice: (r.min_delivery_price as number | null) ?? null,
    deliveryTip: (r.delivery_tip as number | null) ?? null,
    minDeliveryTime: (r.min_delivery_time as number | null) ?? null,
    maxDeliveryTime: (r.max_delivery_time as number | null) ?? null,
    ceoName: (r.ceo_name as string | null) ?? null,
    regNumber: (r.reg_number as string | null) ?? null,
    regCode: (r.reg_code as string | null) ?? null,
  };
}

/** 상품 리뷰 조회 */
export async function getItemReviewsAction(storeItemId: string): Promise<ItemReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review")
    .select("review_id, rating, content, created_at")
    .eq("store_item_id", storeItemId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    reviewId: r.review_id as string,
    rating: (r.rating as number) ?? 0,
    content: (r.content as string | null) ?? null,
    createdAt: r.created_at as string,
  }));
}

/** 비슷한 상품 조회 (같은 중분류) */
export async function getSimilarItemsAction(params: {
  storeId: string;
  stdMediumCode: string;
  excludeItemId: string;
}): Promise<CategoryItem[]> {
  const { storeId, stdMediumCode, excludeItemId } = params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_store_inventory_item")
    .select(
      "store_item_id, item_name, item_thumbnail_small, effective_sale_price, list_price, discount_pct, is_in_stock, std_large_code, std_medium_code"
    )
    .eq("store_id", storeId)
    .eq("std_medium_code", stdMediumCode)
    .eq("status", "ACTIVE")
    .neq("store_item_id", excludeItemId)
    .limit(10);

  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    storeItemId: r.store_item_id as string,
    itemName: r.item_name as string,
    thumbnailSmall: (r.item_thumbnail_small as string | null) ?? null,
    effectiveSalePrice: (r.effective_sale_price as number | null) ?? null,
    listPrice: (r.list_price as number | null) ?? null,
    discountPct: (r.discount_pct as number | null) ?? null,
    isInStock: (r.is_in_stock as boolean | null) ?? null,
    stdLargeCode: (r.std_large_code as string | null) ?? null,
    stdMediumCode: (r.std_medium_code as string | null) ?? null,
  }));
}

/** 상품명 검색 */
export async function searchItemsAction(params: {
  query: string;
  largeCode?: string;
  mediumCode?: string;
  sortBy: SortBy;
  limit?: number;
  storeId?: string;
}): Promise<{ items: CategoryItem[]; total: number }> {
  const { query, largeCode, mediumCode, sortBy, limit = 40, storeId } = params;
  if (!query.trim()) return { items: [], total: 0 };

  const supabase = await createClient();

  const safeQuery = query.replace(/[%_]/g, "\\$&");

  let dbQuery = supabase
    .from("v_store_inventory_item")
    .select(
      "store_item_id, item_name, item_thumbnail_small, effective_sale_price, list_price, discount_pct, is_in_stock, std_large_code, std_medium_code",
      { count: "exact" }
    )
    .eq("status", "ACTIVE")
    .ilike("item_name", `%${safeQuery}%`);

  if (storeId) dbQuery = dbQuery.eq("store_id", storeId);
  if (largeCode) dbQuery = dbQuery.eq("std_large_code", largeCode);
  if (mediumCode) dbQuery = dbQuery.eq("std_medium_code", mediumCode);

  switch (sortBy) {
    case "price_asc":
      dbQuery = dbQuery.order("effective_sale_price", { ascending: true });
      break;
    case "price_desc":
      dbQuery = dbQuery.order("effective_sale_price", { ascending: false });
      break;
    case "discount":
      dbQuery = dbQuery.order("discount_pct", { ascending: false });
      break;
    default:
      dbQuery = dbQuery.order("store_item_id", { ascending: true });
  }

  const { data, error, count } = await dbQuery.limit(limit);

  if (error || !data) return { items: [], total: 0 };

  const items = (data as Record<string, unknown>[]).map((r) => ({
    storeItemId: r.store_item_id as string,
    itemName: r.item_name as string,
    thumbnailSmall: (r.item_thumbnail_small as string | null) ?? null,
    effectiveSalePrice: (r.effective_sale_price as number | null) ?? null,
    listPrice: (r.list_price as number | null) ?? null,
    discountPct: (r.discount_pct as number | null) ?? null,
    isInStock: (r.is_in_stock as boolean | null) ?? null,
    stdLargeCode: (r.std_large_code as string | null) ?? null,
    stdMediumCode: (r.std_medium_code as string | null) ?? null,
  }));

  return { items, total: count ?? 0 };
}
