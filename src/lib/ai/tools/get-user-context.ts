import { tool } from "ai";
import { z } from "zod";
import { buildPersonaContext } from "@/lib/ai/persona-context";
import type { PersonaContext } from "@/lib/ai/persona-context";

// 60초 in-memory 캐시 (Fluid Compute 인스턴스 재사용 환경에서 효과적)
const contextCache = new Map<string, { ctx: PersonaContext; expiresAt: number }>();

export type GetUserContextResult =
  | { success: true; cached: boolean; context: PersonaContext }
  | { success: false; error: string };

export function createGetUserContextTool(userId: string) {
  return tool({
    description:
      "현재 사용자의 페르소나 컨텍스트(취향, 예산, 식이 제한, 조리 실력 등)를 조회합니다. 맞춤 추천을 위해 첫 번째로 호출하세요.",
    inputSchema: z.object({}),
    execute: async (): Promise<GetUserContextResult> => {
      try {
        const now = Date.now();
        const cached = contextCache.get(userId);

        if (cached && now < cached.expiresAt) {
          return { success: true, cached: true, context: cached.ctx };
        }

        const ctx = await buildPersonaContext(userId);
        contextCache.set(userId, { ctx, expiresAt: now + 60_000 });

        return { success: true, cached: false, context: ctx };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, error: `컨텍스트 조회 실패: ${msg}` };
      }
    },
  });
}
