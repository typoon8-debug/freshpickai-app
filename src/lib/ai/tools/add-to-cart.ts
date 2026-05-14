import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type CartAddedItem = {
  name: string;
  qty: number;
  price: number;
  storeItemId: string;
};

export type AddToCartResult =
  | { success: true; addedItems: CartAddedItem[]; count: number }
  | { success: false; error: string };

const cartItemSchema = z.object({
  storeItemId: z.string().describe("상품 ID (v_store_inventory_item.store_item_id)"),
  name: z.string().describe("상품명"),
  price: z.number().describe("가격 (effectiveSalePrice 우선 사용)"),
  qty: z.number().optional().default(1).describe("수량 (기본 1)"),
});

const addToCartSchema = z.object({
  items: z.array(cartItemSchema).min(1).describe("장바구니에 추가할 상품 목록"),
});

export function createAddToCartTool(userId: string, supabase: SupabaseClient<Database>) {
  return tool({
    description:
      "상품을 사용자의 장바구니에 추가합니다. getInventory로 재고를 확인한 뒤, 재고가 있는 상품만 담으세요.",
    inputSchema: addToCartSchema,
    execute: async ({ items }: z.infer<typeof addToCartSchema>): Promise<AddToCartResult> => {
      try {
        const rows = items.map((item) => ({
          user_id: userId,
          name: item.name,
          price: item.price,
          qty: item.qty ?? 1,
          ref_store_item_id: item.storeItemId,
        }));

        const { error } = await supabase.from("fp_cart_item").insert(rows);

        if (error) {
          return { success: false, error: `장바구니 추가 실패: ${error.message}` };
        }

        return {
          success: true,
          addedItems: items.map((i) => ({
            name: i.name,
            qty: i.qty ?? 1,
            price: i.price,
            storeItemId: i.storeItemId,
          })),
          count: items.length,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, error: `장바구니 오류: ${msg}` };
      }
    },
  });
}
