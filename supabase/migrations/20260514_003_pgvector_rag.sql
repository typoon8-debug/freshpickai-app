-- Task 027: pgvector RAG 인프라 구축
-- fp_user_preference embedding 컬럼 + fp_store_item_embedding 테이블 + 3단계 검색 RPC

-- 1. fp_user_preference에 embedding 컬럼 추가
ALTER TABLE fp_user_preference ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 2. fp_user_preference HNSW 인덱스
CREATE INDEX IF NOT EXISTS fp_user_preference_embedding_hnsw_idx
  ON fp_user_preference USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200);

-- 3. fp_store_item_embedding 테이블 (v_store_inventory_item용 임베딩 저장소)
CREATE TABLE IF NOT EXISTS fp_store_item_embedding (
  store_item_id  uuid        PRIMARY KEY,
  item_name      text,
  embedding      vector(1536) NOT NULL,
  embedded_at    timestamptz  DEFAULT now()
);

-- 4. fp_store_item_embedding HNSW 인덱스
CREATE INDEX IF NOT EXISTS fp_store_item_embedding_hnsw_idx
  ON fp_store_item_embedding USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200);

-- 5. fp_store_item_embedding RLS (공개 읽기, service_role만 쓰기)
ALTER TABLE fp_store_item_embedding ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'fp_store_item_embedding'
      AND policyname = 'fp_store_item_embedding_select'
  ) THEN
    CREATE POLICY fp_store_item_embedding_select
      ON fp_store_item_embedding FOR SELECT
      TO authenticated USING (true);
  END IF;
END $$;

-- 6. fp_vector_search_dish: 음식 3단계 벡터 검색 (HNSW → pg_trgm → ILIKE)
CREATE OR REPLACE FUNCTION fp_vector_search_dish(
  query_text          text,
  query_embedding     vector(1536) DEFAULT NULL,
  similarity_threshold float        DEFAULT 0.5,
  match_count         int          DEFAULT 10,
  filter_diet_tags    text[]       DEFAULT NULL,
  filter_persona_tags text[]       DEFAULT NULL
)
RETURNS TABLE (
  dish_id       uuid,
  name          text,
  similarity    float,
  search_source text
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_count int := 0;
BEGIN
  -- Tier 1: HNSW cosine 유사도 검색
  IF query_embedding IS NOT NULL THEN
    RETURN QUERY
    SELECT
      d.dish_id,
      d.name,
      (1 - (d.embedding <=> query_embedding))::float  AS similarity,
      'vector'::text                                   AS search_source
    FROM fp_dish d
    WHERE d.embedding IS NOT NULL
      AND (1 - (d.embedding <=> query_embedding)) > similarity_threshold
      AND (filter_diet_tags    IS NULL OR d.diet_tags    && filter_diet_tags)
      AND (filter_persona_tags IS NULL OR d.persona_tags && filter_persona_tags)
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;

    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;

  -- Tier 2: pg_trgm 유사도 폴백
  IF v_count = 0 THEN
    RETURN QUERY
    SELECT
      d.dish_id,
      d.name,
      similarity(d.name, query_text)::float AS similarity,
      'trgm'::text                          AS search_source
    FROM fp_dish d
    WHERE similarity(d.name, query_text) > 0.2
      AND (filter_diet_tags IS NULL OR d.diet_tags && filter_diet_tags)
    ORDER BY similarity(d.name, query_text) DESC
    LIMIT match_count;

    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;

  -- Tier 3: ILIKE 폴백
  IF v_count = 0 THEN
    RETURN QUERY
    SELECT
      d.dish_id,
      d.name,
      0.1::float   AS similarity,
      'ilike'::text AS search_source
    FROM fp_dish d
    WHERE d.name ILIKE '%' || query_text || '%'
      AND (filter_diet_tags IS NULL OR d.diet_tags && filter_diet_tags)
    ORDER BY d.name
    LIMIT match_count;
  END IF;
END;
$$;

-- 7. fp_vector_search_recipe: 레시피 3단계 벡터 검색
CREATE OR REPLACE FUNCTION fp_vector_search_recipe(
  query_text           text,
  query_embedding      vector(1536) DEFAULT NULL,
  similarity_threshold float        DEFAULT 0.5,
  match_count          int          DEFAULT 10
)
RETURNS TABLE (
  recipe_id     uuid,
  title         text,
  dish_id       uuid,
  similarity    float,
  search_source text
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_count int := 0;
BEGIN
  -- Tier 1: HNSW cosine 검색
  IF query_embedding IS NOT NULL THEN
    RETURN QUERY
    SELECT
      r.recipe_id,
      r.title,
      r.dish_id,
      (1 - (r.embedding <=> query_embedding))::float AS similarity,
      'vector'::text                                  AS search_source
    FROM fp_dish_recipe r
    WHERE r.embedding IS NOT NULL
      AND r.status = 'approved'
      AND (1 - (r.embedding <=> query_embedding)) > similarity_threshold
    ORDER BY r.embedding <=> query_embedding
    LIMIT match_count;

    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;

  -- Tier 2: pg_trgm 폴백
  IF v_count = 0 THEN
    RETURN QUERY
    SELECT
      r.recipe_id,
      r.title,
      r.dish_id,
      similarity(r.title, query_text)::float AS similarity,
      'trgm'::text                           AS search_source
    FROM fp_dish_recipe r
    WHERE r.status = 'approved'
      AND similarity(r.title, query_text) > 0.2
    ORDER BY similarity(r.title, query_text) DESC
    LIMIT match_count;

    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;

  -- Tier 3: ILIKE 폴백
  IF v_count = 0 THEN
    RETURN QUERY
    SELECT
      r.recipe_id,
      r.title,
      r.dish_id,
      0.1::float    AS similarity,
      'ilike'::text AS search_source
    FROM fp_dish_recipe r
    WHERE r.status = 'approved'
      AND (r.title ILIKE '%' || query_text || '%'
        OR r.body  ILIKE '%' || query_text || '%')
    ORDER BY r.title
    LIMIT match_count;
  END IF;
END;
$$;

-- 8. fp_vector_search_store_item: 상품 3단계 벡터 검색
CREATE OR REPLACE FUNCTION fp_vector_search_store_item(
  query_text           text,
  query_embedding      vector(1536) DEFAULT NULL,
  similarity_threshold float        DEFAULT 0.5,
  match_count          int          DEFAULT 10,
  filter_ai_tags       text[]       DEFAULT NULL
)
RETURNS TABLE (
  store_item_id uuid,
  item_name     text,
  similarity    float,
  search_source text
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_count int := 0;
BEGIN
  -- Tier 1: HNSW cosine (fp_store_item_embedding)
  IF query_embedding IS NOT NULL THEN
    RETURN QUERY
    SELECT
      e.store_item_id,
      e.item_name,
      (1 - (e.embedding <=> query_embedding))::float AS similarity,
      'vector'::text                                  AS search_source
    FROM fp_store_item_embedding e
    WHERE (1 - (e.embedding <=> query_embedding)) > similarity_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;

    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;

  -- Tier 2: pg_trgm (v_store_inventory_item)
  IF v_count = 0 THEN
    RETURN QUERY
    SELECT
      v.store_item_id,
      v.item_name,
      similarity(v.item_name, query_text)::float AS similarity,
      'trgm'::text                               AS search_source
    FROM v_store_inventory_item v
    WHERE v.ai_status = 'ACTIVE'
      AND v.item_name IS NOT NULL
      AND similarity(v.item_name, query_text) > 0.2
      AND (filter_ai_tags IS NULL OR v.ai_tags && filter_ai_tags)
    ORDER BY similarity(v.item_name, query_text) DESC
    LIMIT match_count;

    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;

  -- Tier 3: ILIKE 폴백
  IF v_count = 0 THEN
    RETURN QUERY
    SELECT
      v.store_item_id,
      v.item_name,
      0.1::float    AS similarity,
      'ilike'::text AS search_source
    FROM v_store_inventory_item v
    WHERE v.ai_status = 'ACTIVE'
      AND v.item_name ILIKE '%' || query_text || '%'
      AND (filter_ai_tags IS NULL OR v.ai_tags && filter_ai_tags)
    ORDER BY v.item_name
    LIMIT match_count;
  END IF;
END;
$$;
