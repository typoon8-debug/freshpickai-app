-- =============================================================
-- M010: mv_store_item_slim — v_store_inventory_item 경량 Materialized View
-- 목적: FreshPickAI가 필요한 22개 컬럼만 선택 + ACTIVE 상품만 포함
--       복잡한 5-JOIN 뷰를 매 쿼리마다 재계산하지 않고 구체화된 스냅샷 사용
-- 갱신: 5분 간격 CONCURRENTLY (운영 중 락 없음)
-- =============================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_store_item_slim AS
SELECT
  store_item_id,
  store_id,
  item_name,
  item_thumbnail_small,
  item_thumbnail_big,
  ai_status,
  ai_confidence,
  description_markup,
  ai_ad_copy,
  ai_tags,
  ai_cooking_usage,
  ai_calories,
  ai_nutrition_summary,
  list_price,
  sale_price,
  effective_sale_price,
  discount_pct,
  promo_id,
  promo_name,
  promo_type,
  is_in_stock,
  available_quantity
FROM v_store_inventory_item
WHERE ai_status = 'ACTIVE';

-- 기본키 인덱스 (CONCURRENTLY 갱신에 필요)
CREATE UNIQUE INDEX IF NOT EXISTS mv_store_item_slim_pk
  ON mv_store_item_slim(store_item_id);

-- 재고 상태 인덱스 (is_in_stock 필터 빈번)
CREATE INDEX IF NOT EXISTS mv_store_item_slim_stock_idx
  ON mv_store_item_slim(is_in_stock)
  WHERE is_in_stock = true;

-- item_name 텍스트 검색 인덱스
CREATE INDEX IF NOT EXISTS mv_store_item_slim_name_trgm_idx
  ON mv_store_item_slim USING gin(item_name gin_trgm_ops);

-- 최초 데이터 로드
REFRESH MATERIALIZED VIEW mv_store_item_slim;

-- =============================================================
-- pg_cron 자동 갱신 (Supabase pg_cron 확장 활성화 필요)
-- 5분 간격 CONCURRENTLY 갱신
-- =============================================================
-- SELECT cron.schedule(
--   'refresh-store-slim',
--   '*/5 * * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_store_item_slim'
-- );

-- 권한 부여
GRANT SELECT ON mv_store_item_slim TO authenticated;
GRANT SELECT ON mv_store_item_slim TO service_role;
