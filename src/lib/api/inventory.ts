import { createAdminClient } from "@/lib/supabase/server";

interface StockItem {
  storeItemId: string;
  storeId: string;
  qty: number;
}

/** v_store_inventory_item 기반 재고 일괄 검증 */
export async function validateStock(
  items: StockItem[]
): Promise<{ valid: boolean; outOfStock: string[] }> {
  if (items.length === 0) return { valid: true, outOfStock: [] };

  const admin = createAdminClient();
  const storeItemIds = items.map((i) => i.storeItemId);

  const { data: stockRows } = await admin
    .from("v_store_inventory_item")
    .select("store_item_id,available_quantity,is_in_stock")
    .in("store_item_id", storeItemIds);

  const stockMap = new Map((stockRows ?? []).map((r) => [r.store_item_id, r]));

  const outOfStock: string[] = [];

  for (const item of items) {
    const row = stockMap.get(item.storeItemId);
    if (!row || row.is_in_stock === false) {
      outOfStock.push(item.storeItemId);
      continue;
    }
    const qty = row.available_quantity ?? 0;
    if (qty < item.qty) outOfStock.push(item.storeItemId);
  }

  return { valid: outOfStock.length === 0, outOfStock };
}

/** inventory_id PK 기반 재고 차감 (뷰는 쓰기 불가 → inventory 테이블 직접) */
export async function decreaseInventory(items: StockItem[]): Promise<void> {
  if (items.length === 0) return;

  const admin = createAdminClient();

  // inventory_id 조회
  const storeItemIds = items.map((i) => i.storeItemId);
  const { data: invRows } = await admin
    .from("v_store_inventory_item")
    .select("store_item_id,inventory_id,on_hand")
    .in("store_item_id", storeItemIds);

  if (!invRows) return;

  for (const item of items) {
    const inv = invRows.find((r) => r.store_item_id === item.storeItemId);
    if (!inv?.inventory_id) continue;

    const currentStock = (inv.on_hand as number | null) ?? 0;
    const newStock = Math.max(0, currentStock - item.qty);

    await admin
      .from("inventory")
      .update({ on_hand: newStock })
      .eq("inventory_id", inv.inventory_id);
  }
}
