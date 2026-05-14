-- ═══════════════════════════════════════════════════════════
-- Task 029: 시맨틱 캐시 + 자기보강 루프 DB 스키마
-- ═══════════════════════════════════════════════════════════

-- ── 1. 시맨틱 캐시 테이블 ─────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_ai_semantic_cache (
  cache_id     uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query_text   text        NOT NULL,
  query_embedding vector(1536) NOT NULL,
  response_text text       NOT NULL,
  hit_count    int         NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL
);

-- HNSW 코사인 인덱스
CREATE INDEX IF NOT EXISTS fp_ai_semantic_cache_embedding_idx
  ON fp_ai_semantic_cache
  USING hnsw (query_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 만료 시간 인덱스 (캐시 정리용)
CREATE INDEX IF NOT EXISTS fp_ai_semantic_cache_expires_idx
  ON fp_ai_semantic_cache (expires_at);

-- ── 2. 자기보강 검토 큐 테이블 ────────────────────────────
CREATE TABLE IF NOT EXISTS fp_ai_review_queue (
  review_id     uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_item_id uuid,
  item_name     text        NOT NULL,
  ai_confidence float,
  reason        text        NOT NULL DEFAULT 'ai_confidence_below_threshold',
  context       text,
  status        text        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'done', 'dismissed')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fp_ai_review_queue_status_idx
  ON fp_ai_review_queue (status, created_at DESC);

-- ── 3. 시맨틱 캐시 조회 RPC 함수 ──────────────────────────
CREATE OR REPLACE FUNCTION fp_semantic_cache_lookup(
  p_query_embedding vector(1536),
  p_similarity_threshold float DEFAULT 0.95
)
RETURNS TABLE(cache_id uuid, response_text text, similarity float)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cache_id    uuid;
  v_response    text;
  v_similarity  float;
BEGIN
  SELECT
    c.cache_id,
    c.response_text,
    1 - (c.query_embedding <=> p_query_embedding)
  INTO v_cache_id, v_response, v_similarity
  FROM fp_ai_semantic_cache c
  WHERE
    c.expires_at > now()
    AND (1 - (c.query_embedding <=> p_query_embedding)) >= p_similarity_threshold
  ORDER BY c.query_embedding <=> p_query_embedding
  LIMIT 1;

  IF v_cache_id IS NOT NULL THEN
    -- 히트 카운트 증가
    UPDATE fp_ai_semantic_cache
       SET hit_count = hit_count + 1
     WHERE fp_ai_semantic_cache.cache_id = v_cache_id;

    RETURN QUERY SELECT v_cache_id, v_response, v_similarity;
  END IF;
END;
$$;

-- ── 4. RLS 정책 ────────────────────────────────────────────
ALTER TABLE fp_ai_semantic_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_ai_review_queue   ENABLE ROW LEVEL SECURITY;

-- 캐시: 인증 사용자 읽기/쓰기 허용
CREATE POLICY "캐시 읽기" ON fp_ai_semantic_cache
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "캐시 쓰기" ON fp_ai_semantic_cache
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "캐시 카운트 업데이트" ON fp_ai_semantic_cache
  FOR UPDATE TO authenticated USING (true);

-- 검토 큐: 인증 사용자 삽입 허용
CREATE POLICY "검토큐 삽입" ON fp_ai_review_queue
  FOR INSERT TO authenticated WITH CHECK (true);

-- ── 5. 만료 캐시 정리 함수 ────────────────────────────────
CREATE OR REPLACE FUNCTION fp_cleanup_expired_cache()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted int;
BEGIN
  DELETE FROM fp_ai_semantic_cache WHERE expires_at < now();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
