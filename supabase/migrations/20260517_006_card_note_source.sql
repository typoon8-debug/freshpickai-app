-- Task 037: fp_dish_recipe source 컬럼 추가 (사용자 노트 자기보강 루프)
-- fp_card_note review_needed 인덱스 추가

ALTER TABLE fp_dish_recipe
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'official';

-- source 인덱스
CREATE INDEX IF NOT EXISTS fp_dish_recipe_source_idx ON fp_dish_recipe(source);

-- fp_card_note helpful_count 인덱스 (자기보강 루프 트리거 쿼리 최적화)
CREATE INDEX IF NOT EXISTS fp_card_note_helpful_count_idx ON fp_card_note(helpful_count)
  WHERE ai_consent = true AND review_needed = false;

-- RLS 정책: 노트 조회 (전체 사용자 가능)
ALTER TABLE fp_card_note ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- 조회: 모든 인증 사용자
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'fp_card_note' AND policyname = 'fp_card_note_select'
  ) THEN
    CREATE POLICY fp_card_note_select ON fp_card_note
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;

  -- 삽입: 본인만
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'fp_card_note' AND policyname = 'fp_card_note_insert'
  ) THEN
    CREATE POLICY fp_card_note_insert ON fp_card_note
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- 수정: 운영자만 (admin_reply, review_needed)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'fp_card_note' AND policyname = 'fp_card_note_update_admin'
  ) THEN
    CREATE POLICY fp_card_note_update_admin ON fp_card_note
      FOR UPDATE USING (is_admin());
  END IF;

  -- helpful_count 증가: 인증된 사용자 (본인 노트 제외 — 앱 레이어에서 체크)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'fp_card_note' AND policyname = 'fp_card_note_update_helpful'
  ) THEN
    CREATE POLICY fp_card_note_update_helpful ON fp_card_note
      FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() != user_id)
      WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() != user_id);
  END IF;
END $$;
