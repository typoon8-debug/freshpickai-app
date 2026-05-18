import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createAdminClient } from "@/lib/supabase/server";

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
  topic: z
    .string()
    .optional()
    .describe(
      "현재 대화의 주제 키워드 (예: '주말식사', '주중도시락', '간식', '생일파티'). " +
        "대화 맥락에서 추출하며, 명확한 주제가 없으면 생략하세요."
    ),
});

export function createAddToMemoTool(
  userId: string,
  supabase: SupabaseClient<Database>,
  sessionId?: string
) {
  return tool({
    description:
      "사용자의 장보기 메모에 재료나 품목을 추가합니다. 사용자가 재료를 메모에 추가하거나 저장·기록하고 싶다고 할 때 사용하세요.",
    inputSchema: addToMemoSchema,
    execute: async ({
      items,
      topic,
    }: z.infer<typeof addToMemoSchema>): Promise<AddToMemoResult> => {
      // RLS 우회: 스트리밍 컨텍스트에서 쿠키 기반 auth가 불안정하므로 admin client 사용
      const admin = createAdminClient();

      const today = new Date().toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      });
      const topicSuffix = topic ? ` · ${topic}` : "";
      const memoTitle = `AI 추천 장보기 (${today})${topicSuffix}`;

      // 메모 조회: 세션 기반(A) → 타이틀 폴백(기존 호환) → 신규 생성
      const memoId = await (async (): Promise<string | null> => {
        // 1) 세션 기반 조회
        if (sessionId) {
          const { data } = await admin
            .from("fp_shopping_memo")
            .select("memo_id")
            .eq("user_id", userId)
            .eq("session_id", sessionId)
            .maybeSingle();
          if (data?.memo_id) return data.memo_id;
        }

        // 2) 타이틀 기반 폴백 (동일 주제 당일 세션 없는 경우)
        const { data: byTitle } = await admin
          .from("fp_shopping_memo")
          .select("memo_id")
          .eq("user_id", userId)
          .eq("title", memoTitle)
          .maybeSingle();
        if (byTitle?.memo_id) return byTitle.memo_id;

        // 3) 신규 생성
        const rawText = items.map((i) => i.name).join(", ");
        const { data: created, error: createErr } = await admin
          .from("fp_shopping_memo")
          .insert({
            user_id: userId,
            title: memoTitle,
            raw_text: rawText,
            session_id: sessionId ?? null,
          })
          .select("memo_id")
          .single();

        if (createErr || !created) return null;
        return created.memo_id;
      })();

      if (!memoId) {
        return { success: false, error: "메모 생성에 실패했습니다." };
      }

      // 기존 아이템 sort_order 최대값 조회
      const { data: existingItems } = await admin
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
        category: null,
        done: false,
        sort_order: baseOrder + idx,
      }));

      const { error: insertErr } = await admin.from("fp_memo_item").insert(rows);

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
