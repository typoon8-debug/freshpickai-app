-- =============================================================
-- M008: FreshPickAI 성능 튜닝 — 누락 인덱스 추가
-- CONCURRENTLY 옵션으로 운영 중 락 없이 생성
-- =============================================================

-- 1. fp_family_member(group_id, user_id) 복합 인덱스
--    RLS 정책에서 매 요청마다 서브쿼리로 멤버십 확인 → 30~50% 조회 속도 개선
CREATE INDEX CONCURRENTLY IF NOT EXISTS fp_family_member_group_user_idx
  ON fp_family_member(group_id, user_id);

-- 2. fp_card_note(user_id) B-tree 인덱스
--    사용자별 노트 조회 및 RLS SELECT 정책 평가 시 Full Scan 방지
CREATE INDEX CONCURRENTLY IF NOT EXISTS fp_card_note_user_idx
  ON fp_card_note(user_id);

-- 3. fp_dish_ingredient(dish_id) B-tree 인덱스
--    getCardDetail() 내 .in("dish_id", dishIds) 배치 조회 성능 개선
CREATE INDEX CONCURRENTLY IF NOT EXISTS fp_dish_ingredient_dish_idx
  ON fp_dish_ingredient(dish_id);

-- 4. fp_cart_item(user_id, created_at DESC) 복합 인덱스
--    fetchCartItemsAction() — ORDER BY created_at 포함 쿼리 커버링 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS fp_cart_item_user_created_idx
  ON fp_cart_item(user_id, created_at DESC);

-- 5. fp_menu_card(section_id, is_official) 부분 인덱스
--    섹션별 카드 조회 + is_official 필터 복합 조회 최적화
--    section_id IS NOT NULL 조건으로 null 섹션 제외 (인덱스 크기 감소)
CREATE INDEX CONCURRENTLY IF NOT EXISTS fp_menu_card_section_official_idx
  ON fp_menu_card(section_id, is_official)
  WHERE section_id IS NOT NULL;
