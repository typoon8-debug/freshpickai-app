import { z } from "zod";
import { tool } from "ai";
import { ChatActionEnum } from "@/lib/types";

// zod v4에서 TypeScript enum → z.enum() 변환 (nativeEnum deprecated)
const chatActionValues = Object.values(ChatActionEnum) as [string, ...string[]];

/** 인텐트 파라미터 스키마 */
const suggestIntentsSchema = z.object({
  intents: z
    .array(
      z.object({
        action: z.enum(chatActionValues),
        label: z.string().max(20).describe("버튼 표시 텍스트"),
        payload: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("action 실행에 필요한 데이터"),
      })
    )
    .max(4)
    .describe("사용자에게 표시할 액션 버튼 목록 (최대 4개)"),
});

type SuggestIntentsInput = z.infer<typeof suggestIntentsSchema>;

/** AI가 응답 후 액션 버튼을 제안하는 도구 */
export const createSuggestIntentsTool = () =>
  tool({
    description:
      "AI 응답 후 사용자에게 표시할 액션 버튼을 제안합니다. 상품 추천, 장바구니 추가, 결제 등 후속 행동을 버튼으로 안내합니다.",
    inputSchema: suggestIntentsSchema,
    execute: async ({ intents }: SuggestIntentsInput) => ({
      intents,
      success: true,
    }),
  });
