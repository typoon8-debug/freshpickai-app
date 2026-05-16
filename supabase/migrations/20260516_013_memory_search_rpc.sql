-- ================================================================
-- Task 065 / F032: fp_memory_items pgvector 코사인 유사도 검색 RPC
-- ================================================================

-- fp_search_memory_items: customer_id 필터 + pgvector 코사인 유사도 검색
CREATE OR REPLACE FUNCTION fp_search_memory_items(
  p_customer_id uuid,
  p_embedding   vector(1536),
  p_limit       int     DEFAULT 5,
  p_threshold   float4  DEFAULT 0.4
)
RETURNS TABLE (
  memory_id         uuid,
  customer_id       uuid,
  content           text,
  source_session_id uuid,
  importance_score  float4,
  created_at        timestamptz,
  cosine_dist       float4
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.memory_id,
    m.customer_id,
    m.content,
    m.source_session_id,
    m.importance_score,
    m.created_at,
    (m.embedding <=> p_embedding)::float4 AS cosine_dist
  FROM fp_memory_items m
  WHERE m.customer_id = p_customer_id
    AND m.embedding IS NOT NULL
    AND (m.embedding <=> p_embedding) < p_threshold
  ORDER BY m.embedding <=> p_embedding ASC
  LIMIT p_limit;
$$;

-- authenticated 역할에 실행 권한 부여
GRANT EXECUTE ON FUNCTION fp_search_memory_items(uuid, vector, int, float4) TO authenticated;
