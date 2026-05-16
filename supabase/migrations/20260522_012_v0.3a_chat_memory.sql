-- ================================================================
-- Task 064 / F032: v0.3a AI 채팅 3계층 메모리 시스템 DB 기반
-- ================================================================

-- ── fp_chat_message_raw: 원문 메시지 (Layer 1) ───────────────
CREATE TABLE IF NOT EXISTS fp_chat_message_raw (
  message_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id        uuid NOT NULL,
  role              text NOT NULL CHECK (role IN ('user', 'assistant')),
  content           text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fp_chat_message_raw_customer
  ON fp_chat_message_raw (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fp_chat_message_raw_session
  ON fp_chat_message_raw (session_id, created_at DESC);

ALTER TABLE fp_chat_message_raw ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 메시지만 조회"
  ON fp_chat_message_raw FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "본인 메시지 저장"
  ON fp_chat_message_raw FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- ── fp_chat_session_summary: 대화 요약 (Layer 2) ─────────────
CREATE TABLE IF NOT EXISTS fp_chat_session_summary (
  summary_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id        uuid NOT NULL UNIQUE,
  summary_text      text NOT NULL,
  keywords          text[] NOT NULL DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fp_chat_session_summary_customer
  ON fp_chat_session_summary (customer_id, created_at DESC);

ALTER TABLE fp_chat_session_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 요약만 조회"
  ON fp_chat_session_summary FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "본인 요약 저장"
  ON fp_chat_session_summary FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "본인 요약 갱신"
  ON fp_chat_session_summary FOR UPDATE
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- ── fp_memory_items: 장기 기억 (Layer 3, pgvector) ───────────
CREATE TABLE IF NOT EXISTS fp_memory_items (
  memory_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content           text NOT NULL,
  embedding         vector(1536),
  source_session_id uuid,
  importance_score  float4 NOT NULL DEFAULT 0.5,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- HNSW 코사인 인덱스 (pgvector 0.8+)
CREATE INDEX IF NOT EXISTS fp_memory_items_embedding_hnsw_idx
  ON fp_memory_items USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200);

CREATE INDEX IF NOT EXISTS idx_fp_memory_items_customer
  ON fp_memory_items (customer_id, importance_score DESC);

ALTER TABLE fp_memory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 기억만 조회"
  ON fp_memory_items FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "본인 기억 저장"
  ON fp_memory_items FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "본인 기억 삭제"
  ON fp_memory_items FOR DELETE
  USING (auth.uid() = customer_id);

-- ── TTL 정리: 30일 초과 원문 메시지 자동 삭제 (pg_cron 미설치 시 주석 해제) ──
-- SELECT cron.schedule(
--   'cleanup-chat-messages-30d',
--   '0 3 * * *',  -- 매일 오전 3시 (UTC)
--   $$DELETE FROM fp_chat_message_raw WHERE created_at < now() - INTERVAL '30 days'$$
-- );
