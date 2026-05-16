import { z } from "zod";
import { ChatActionEnum } from "@/lib/types";

// zod v4에서 TypeScript enum → z.enum() 변환 (nativeEnum deprecated)
const chatActionValues = Object.values(ChatActionEnum) as [string, ...string[]];

/** AI 버튼 인텐트 단일 항목 Zod 스키마 */
export const ChatActionIntentSchema = z.object({
  action: z.enum(chatActionValues),
  label: z.string().max(20),
  payload: z.record(z.string(), z.unknown()).optional(),
});

/** AI 채팅 응답 전체 Zod 스키마 */
export const ChatResponseSchema = z.object({
  message: z.string(),
  intents: z.array(ChatActionIntentSchema).max(4).optional(),
  context: z
    .object({
      itemIds: z.array(z.string()).optional(),
      cardId: z.string().optional(),
    })
    .optional(),
});

export type ChatResponseSchema = z.infer<typeof ChatResponseSchema>;
