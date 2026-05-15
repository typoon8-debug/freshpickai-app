-- =============================================================
-- M009: fp_get_card_detail RPC — 카드 상세 단일 왕복 조회
-- 기존 getCardDetail()의 6회 개별 쿼리를 1회 RPC로 통합
-- (네트워크 왕복: 8회 → 2회 — RPC + v_store_inventory_item enrichment)
-- =============================================================

CREATE OR REPLACE FUNCTION fp_get_card_detail(p_card_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_card        RECORD;
  v_result      JSON;
BEGIN
  -- 카드 존재 여부 확인
  SELECT * INTO v_card
  FROM fp_menu_card
  WHERE card_id = p_card_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT json_build_object(
    'card', row_to_json(v_card),

    'cardDishes', COALESCE((
      SELECT json_agg(
        json_build_object(
          'dishId',    cd.dish_id,
          'role',      cd.role,
          'sortOrder', cd.sort_order
        )
        ORDER BY cd.sort_order
      )
      FROM fp_card_dish cd
      WHERE cd.card_id = p_card_id
    ), '[]'::json),

    'dishes', COALESCE((
      SELECT json_agg(row_to_json(d))
      FROM fp_dish d
      WHERE d.dish_id IN (
        SELECT dish_id FROM fp_card_dish WHERE card_id = p_card_id
      )
    ), '[]'::json),

    'ingredients', COALESCE((
      SELECT json_agg(row_to_json(i) ORDER BY i.sort_order)
      FROM fp_dish_ingredient i
      WHERE i.dish_id IN (
        SELECT dish_id FROM fp_card_dish WHERE card_id = p_card_id
      )
    ), '[]'::json),

    'recipes', COALESCE((
      SELECT json_agg(row_to_json(r) ORDER BY r.created_at)
      FROM fp_dish_recipe r
      WHERE r.dish_id IN (
        SELECT dish_id FROM fp_card_dish WHERE card_id = p_card_id
      )
      AND r.status = 'approved'
    ), '[]'::json),

    'notes', COALESCE((
      SELECT json_agg(row_to_json(n) ORDER BY n.created_at DESC)
      FROM fp_card_note n
      WHERE n.card_id = p_card_id
    ), '[]'::json)
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

-- 인증된 사용자만 실행 가능
REVOKE ALL ON FUNCTION fp_get_card_detail(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fp_get_card_detail(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION fp_get_card_detail(UUID) TO service_role;
