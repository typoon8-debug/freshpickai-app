import { createAdminClient } from "@/lib/supabase/server";

/** 모든 AI 기능의 common_code 키 상수 */
export const AI_MODEL_KEYS = {
  CHAT: "AI_CHAT_LLM",
  AGENT: "AI_AGENT_LLM",
  RECOMMEND: "AI_RECOMMEND_LLM",
  AUTO_FILL: "AI_AUTO_FILL_LLM",
  FRIDGE_MATCH: "AI_FRIDGE_MATCH_LLM",
  CLASSIFY: "AI_CLASSIFY_LLM",
  SELF_IMPROVE: "AI_SELF_IMPROVE_LLM",
  MOVIE_NIGHT: "AI_MOVIE_NIGHT_LLM",
  EMBEDDING: "AI_EMBEDDING_MODEL",
} as const;

export type AiModelKey = (typeof AI_MODEL_KEYS)[keyof typeof AI_MODEL_KEYS];

/** 키별 폴백 모델 (common_code 미등록 또는 DB 오류 시 사용) */
const FALLBACK_MODELS: Record<AiModelKey, string> = {
  AI_CHAT_LLM: "claude-haiku-4-5-20251001",
  AI_AGENT_LLM: "claude-haiku-4-5-20251001",
  AI_RECOMMEND_LLM: "claude-haiku-4-5-20251001",
  AI_AUTO_FILL_LLM: "claude-haiku-4-5-20251001",
  AI_FRIDGE_MATCH_LLM: "claude-haiku-4-5-20251001",
  AI_CLASSIFY_LLM: "claude-haiku-4-5-20251001",
  AI_SELF_IMPROVE_LLM: "claude-haiku-4-5-20251001",
  AI_MOVIE_NIGHT_LLM: "claude-haiku-4-5-20251001",
  AI_EMBEDDING_MODEL: "text-embedding-3-small",
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

/** 프로세스 레벨 캐시 — DB 조회 최소화 */
const modelCache = new Map<string, { modelId: string; expiresAt: number }>();

/**
 * common_code 테이블에서 AI 모델 ID를 조회합니다.
 * 캐시 TTL 5분, 미등록/오류 시 키별 폴백 모델을 사용합니다.
 */
export async function getAiModelId(codeKey: AiModelKey): Promise<string> {
  const cached = modelCache.get(codeKey);
  if (cached && Date.now() < cached.expiresAt) return cached.modelId;

  const fallback = FALLBACK_MODELS[codeKey];

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("common_code")
      .select("description")
      .eq("code", codeKey)
      .maybeSingle();

    const modelId = data?.description?.trim() || fallback;
    modelCache.set(codeKey, { modelId, expiresAt: Date.now() + CACHE_TTL_MS });
    return modelId;
  } catch {
    return fallback;
  }
}
