"use server";

import { createClient } from "@/lib/supabase/server";
import { updateTag } from "next/cache";
import type { ShoppingMemo, MemoItem } from "@/lib/types";
import type { ParsedItem } from "@/app/api/memo/parse/route";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** 파싱 결과를 fp_shopping_memo + fp_memo_item에 저장 */
export async function saveMemoAction(
  rawText: string,
  items: ParsedItem[]
): Promise<{ memoId?: string; error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();

  // 제목: rawText 첫 줄 20자 이내
  const title = rawText.split(/[\n,]/)[0].slice(0, 20) || "메모";

  const { data: memo, error: memoErr } = await supabase
    .from("fp_shopping_memo")
    .insert({ user_id: user.id, title, raw_text: rawText })
    .select("memo_id")
    .single();

  if (memoErr || !memo) return { error: memoErr?.message ?? "메모 저장 실패" };

  const memoId = memo.memo_id as string;

  if (items.length > 0) {
    const rows = items.map((item, idx) => ({
      memo_id: memoId,
      raw_text: item.name,
      corrected_text: item.name,
      qty_value: item.qty,
      qty_unit: item.unit,
      category: item.category,
      done: false,
      sort_order: idx,
    }));

    const { error: itemErr } = await supabase.from("fp_memo_item").insert(rows);
    if (itemErr) return { error: itemErr.message };
  }

  updateTag("memos");
  return { memoId };
}

/** 사용자의 저장된 메모 목록 조회 */
export async function getMemosAction(): Promise<(ShoppingMemo & { itemCount: number })[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fp_shopping_memo")
    .select("*, fp_memo_item(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as Record<string, unknown>[]).map((row) => {
    const countArr = row.fp_memo_item as { count: number }[] | null;
    return {
      memoId: row.memo_id as string,
      userId: row.user_id as string,
      title: row.title as string,
      rawText: (row.raw_text as string | null) ?? undefined,
      createdAt: row.created_at as string,
      modifiedAt: row.modified_at as string,
      itemCount: countArr?.[0]?.count ?? 0,
    };
  });
}

/** 저장된 메모의 항목 조회 */
export async function getMemoItemsAction(memoId: string): Promise<MemoItem[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fp_memo_item")
    .select("*")
    .eq("memo_id", memoId)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return (data as Record<string, unknown>[]).map((row) => ({
    memoItemId: row.memo_item_id as string,
    memoId: row.memo_id as string,
    rawText: row.raw_text as string,
    correctedText: (row.corrected_text as string | null) ?? undefined,
    qtyValue: (row.qty_value as number | null) ?? undefined,
    qtyUnit: (row.qty_unit as string | null) ?? undefined,
    matchedDishIngredientId: (row.matched_dish_ingredient_id as string | null) ?? undefined,
    refStoreItemId: (row.ref_store_item_id as string | null) ?? undefined,
    category: (row.category as string | null) ?? undefined,
    done: row.done as boolean,
    sortOrder: row.sort_order as number,
  }));
}

/** 메모 삭제 (cascade로 fp_memo_item도 삭제) */
export async function deleteMemoAction(memoId: string): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("fp_shopping_memo")
    .delete()
    .eq("memo_id", memoId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  updateTag("memos");
  return {};
}

/** 기존 메모 업데이트 (항목 전체 교체) */
export async function updateMemoAction(
  memoId: string,
  rawText: string,
  items: ParsedItem[]
): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();

  const title = rawText.split(/[\n,]/)[0].slice(0, 20) || "메모";

  const { error: memoErr } = await supabase
    .from("fp_shopping_memo")
    .update({ title, raw_text: rawText, modified_at: new Date().toISOString() })
    .eq("memo_id", memoId)
    .eq("user_id", user.id);

  if (memoErr) return { error: memoErr.message };

  const { error: delErr } = await supabase.from("fp_memo_item").delete().eq("memo_id", memoId);

  if (delErr) return { error: delErr.message };

  if (items.length > 0) {
    const rows = items.map((item, idx) => ({
      memo_id: memoId,
      raw_text: item.name,
      corrected_text: item.name,
      qty_value: item.qty,
      qty_unit: item.unit,
      category: item.category,
      done: false,
      sort_order: idx,
    }));
    const { error: itemErr } = await supabase.from("fp_memo_item").insert(rows);
    if (itemErr) return { error: itemErr.message };
  }

  updateTag("memos");
  return {};
}

/** getMemoDetailAction: 메모 + 항목 함께 조회 */
export async function getMemoDetailAction(
  memoId: string
): Promise<{ memo: ShoppingMemo; items: MemoItem[] } | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();

  const [memoRes, itemsRes] = await Promise.all([
    supabase
      .from("fp_shopping_memo")
      .select("*")
      .eq("memo_id", memoId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("fp_memo_item")
      .select("*")
      .eq("memo_id", memoId)
      .order("sort_order", { ascending: true }),
  ]);

  if (!memoRes.data) return null;

  const row = memoRes.data as Record<string, unknown>;
  const memo: ShoppingMemo = {
    memoId: row.memo_id as string,
    userId: row.user_id as string,
    title: row.title as string,
    rawText: (row.raw_text as string | null) ?? undefined,
    createdAt: row.created_at as string,
    modifiedAt: row.modified_at as string,
  };

  const items: MemoItem[] = ((itemsRes.data ?? []) as Record<string, unknown>[]).map((r) => ({
    memoItemId: r.memo_item_id as string,
    memoId: r.memo_id as string,
    rawText: r.raw_text as string,
    correctedText: (r.corrected_text as string | null) ?? undefined,
    qtyValue: (r.qty_value as number | null) ?? undefined,
    qtyUnit: (r.qty_unit as string | null) ?? undefined,
    matchedDishIngredientId: (r.matched_dish_ingredient_id as string | null) ?? undefined,
    refStoreItemId: (r.ref_store_item_id as string | null) ?? undefined,
    category: (r.category as string | null) ?? undefined,
    done: r.done as boolean,
    sortOrder: r.sort_order as number,
  }));

  return { memo, items };
}

/** 저장된 메모의 선택 항목을 fp_cart_item에 추가 */
export async function addMemoToCartAction(
  memoId: string,
  selectedItemIds: string[]
): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (selectedItemIds.length === 0) return { error: "선택된 항목이 없습니다." };

  const supabase = await createClient();

  const { data: items, error: fetchErr } = await supabase
    .from("fp_memo_item")
    .select("*")
    .eq("memo_id", memoId)
    .in("memo_item_id", selectedItemIds);

  if (fetchErr || !items) return { error: fetchErr?.message ?? "항목 조회 실패" };

  const cartRows = (items as Record<string, unknown>[]).map((item) => ({
    user_id: user.id,
    name: (item.corrected_text as string | null) ?? (item.raw_text as string),
    qty: Math.max(1, Number(item.qty_value ?? 1)),
    unit: (item.qty_unit as string | null) ?? "개",
    price: 0,
  }));

  const { error: cartErr } = await supabase.from("fp_cart_item").insert(cartRows);
  if (cartErr) return { error: cartErr.message };

  updateTag("cart");
  return {};
}
