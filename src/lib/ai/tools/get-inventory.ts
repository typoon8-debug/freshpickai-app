import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type InventoryItem = {
  storeItemId: string;
  itemName: string | null;
  availableQuantity: number | null;
  isInStock: boolean | null;
  effectiveSalePrice: number | null;
  aiStatus: string | null;
};

export type GetInventoryResult =
  | { success: true; items: InventoryItem[]; count: number }
  | { success: false; error: string };

const getInventorySchema = z.object({
  storeItemIds: z
    .array(z.string())
    .min(1)
    .max(20)
    .describe("재고를 확인할 상품 ID 목록 (v_store_inventory_item.store_item_id)"),
});

export function createGetInventoryTool(supabase: SupabaseClient<Database>) {
  return tool({
    description:
      "상품의 실시간 재고 및 가격 정보를 조회합니다. searchItems로 찾은 상품 ID를 전달하여 재고·품절 여부를 확인하세요.",
    inputSchema: getInventorySchema,
    execute: async ({
      storeItemIds,
    }: z.infer<typeof getInventorySchema>): Promise<GetInventoryResult> => {
      try {
        const { data, error } = await supabase
          .from("v_store_inventory_item")
          .select(
            "store_item_id, item_name, available_quantity, is_in_stock, effective_sale_price, ai_status"
          )
          .in("store_item_id", storeItemIds);

        if (error) {
          return { success: false, error: `재고 조회 실패: ${error.message}` };
        }

        const items: InventoryItem[] = (data ?? []).map((row) => ({
          storeItemId: row.store_item_id ?? "",
          itemName: row.item_name,
          availableQuantity: row.available_quantity,
          isInStock: row.is_in_stock,
          effectiveSalePrice: row.effective_sale_price,
          aiStatus: row.ai_status,
        }));

        return { success: true, items, count: items.length };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, error: `재고 조회 오류: ${msg}` };
      }
    },
  });
}
