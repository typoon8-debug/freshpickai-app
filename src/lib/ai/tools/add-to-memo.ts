import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type MemoAddedItem = {
  name: string;
  qty: number;
  unit: string;
};

export type AddToMemoResult =
  | { success: true; memoId: string; addedItems: MemoAddedItem[] }
  | { success: false; error: string };

const itemSchema = z.object({
  name: z.string().describe("품목 이름"),
  qty: z.number().optional().default(1).describe("수량"),
  unit: z.string().optional().default("개").describe("단위"),
});

const addToMemoSchema = z.object({
  items: z.array(itemSchema).min(1).describe("추가할 품목 목록"),
});

export function createAddToMemoTool(userId: string, supabase: SupabaseClient<Database>) {
  return tool({
    description:
      "사용자의 장보기 메모에 재료나 품목을 추가합니다. 사용자가 재료를 메모에 추가하거나 저장·기록하고 싶다고 할 때 사용하세요.",
    inputSchema: addToMemoSchema,
    execute: async ({ items }: z.infer<typeof addToMemoSchema>): Promise<AddToMemoResult> => {
      const today = new Date().toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      });
      const memoTitle = `AI 추천 장보기 (${today})`;

      // 오늘 메모 조회 또는 신규 생성
      const { data: existing } = await supabase
        .from("fp_shopping_memo")
        .select("memo_id")
        .eq("user_id", userId)
        .eq("title", memoTitle)
        .maybeSingle();

      let memoId: string;

      if (existing?.memo_id) {
        memoId = existing.memo_id;
      } else {
        const { data: created, error: createErr } = await supabase
          .from("fp_shopping_memo")
          .insert({ user_id: userId, title: memoTitle, raw_text: "" })
          .select("memo_id")
          .single();

        if (createErr || !created) {
          return { success: false, error: "메모 생성에 실패했습니다." };
        }
        memoId = created.memo_id;
      }

      // 기존 아이템 sort_order 최대값 조회
      const { data: existingItems } = await supabase
        .from("fp_memo_item")
        .select("sort_order")
        .eq("memo_id", memoId)
        .order("sort_order", { ascending: false })
        .limit(1);

      const baseOrder = (existingItems?.[0]?.sort_order ?? -1) + 1;

      const rows = items.map((item: z.infer<typeof itemSchema>, idx: number) => ({
        memo_id: memoId,
        raw_text: item.name,
        corrected_text: item.name,
        qty_value: item.qty ?? 1,
        qty_unit: item.unit ?? "개",
        done: false,
        sort_order: baseOrder + idx,
      }));

      const { error: insertErr } = await supabase.from("fp_memo_item").insert(rows);

      if (insertErr) {
        return { success: false, error: "품목 추가에 실패했습니다." };
      }

      return {
        success: true,
        memoId,
        addedItems: items.map((i: z.infer<typeof itemSchema>) => ({
          name: i.name,
          qty: i.qty ?? 1,
          unit: i.unit ?? "개",
        })),
      };
    },
  });
}
