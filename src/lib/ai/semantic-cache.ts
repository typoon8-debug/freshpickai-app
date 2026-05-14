import { createClient } from "@/lib/supabase/server";
import { embedText, embeddingToSql } from "./embedding";

const DEFAULT_THRESHOLD = 0.95;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일

export interface CacheHit {
  hit: true;
  responseText: string;
  cacheId: string;
  similarity: number;
}

export interface CacheMiss {
  hit: false;
}

export type CacheResult = CacheHit | CacheMiss;

/** queryText를 임베딩하고 시맨틱 캐시에서 유사 응답을 조회합니다. */
export async function checkCache(
  queryText: string,
  threshold = DEFAULT_THRESHOLD
): Promise<{ result: CacheResult; queryEmbedding: number[] }> {
  let queryEmbedding: number[];

  try {
    queryEmbedding = await embedText(queryText);
  } catch {
    return { result: { hit: false }, queryEmbedding: [] };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("fp_semantic_cache_lookup", {
      p_query_embedding: embeddingToSql(queryEmbedding),
      p_similarity_threshold: threshold,
    });

    if (error || !data || data.length === 0) {
      return { result: { hit: false }, queryEmbedding };
    }

    const row = data[0] as { cache_id: string; response_text: string; similarity: number };
    return {
      result: {
        hit: true,
        responseText: row.response_text,
        cacheId: row.cache_id,
        similarity: row.similarity,
      },
      queryEmbedding,
    };
  } catch {
    return { result: { hit: false }, queryEmbedding };
  }
}

/** LLM 응답을 시맨틱 캐시에 저장합니다 (비동기 fire-and-forget). */
export async function saveCache(
  queryText: string,
  queryEmbedding: number[],
  responseText: string
): Promise<void> {
  if (!queryEmbedding.length || !responseText.trim()) return;

  try {
    const supabase = await createClient();
    const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString();

    await supabase.from("fp_ai_semantic_cache").insert({
      query_text: queryText,
      query_embedding: embeddingToSql(queryEmbedding),
      response_text: responseText,
      expires_at: expiresAt,
    });
  } catch {
    // 캐시 저장 실패는 무시 (핵심 기능 아님)
  }
}

/**
 * 캐시 HIT 시 AI SDK UIMessage 스트림 형식으로 Response를 생성합니다.
 * x-cache: HIT 헤더와 promptTokens: 0으로 토큰 0 소비를 표시합니다.
 */
export function createCacheHitResponse(cachedText: string, cacheId: string): Response {
  const encoder = new TextEncoder();
  const messageId = `cache_${cacheId.slice(0, 8)}`;

  const lines = [
    `f${JSON.stringify({ messageId })}`,
    `0${JSON.stringify(cachedText)}`,
    `e${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0 }, isContinued: false })}`,
    `d${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0 } })}`,
  ];

  const body = lines.map((l) => `data: ${l}\n\n`).join("");

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(body));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "x-vercel-ai-ui-message-stream": "v1",
      "x-cache": "HIT",
      "x-cache-id": cacheId,
    },
  });
}
