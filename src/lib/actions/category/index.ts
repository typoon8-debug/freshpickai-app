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

  let dbQuery = supabase
    .from("v_store_inventory_item")
    .select(
      "store_item_id, item_name, item_thumbnail_small, effective_sale_price, list_price, discount_pct, is_in_stock, std_large_code, std_medium_code",
      { count: "exact" }
    )
    .eq("status", "ACTIVE")
    .ilike("item_name", `%${query}%`);

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
