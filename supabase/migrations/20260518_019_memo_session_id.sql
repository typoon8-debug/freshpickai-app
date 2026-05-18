-- fp_shopping_memo: 채팅 세션 기반 메모 연결
-- 세션 ID를 메모에 연결하여 세션 단위 Append 및 주제 분리를 지원

ALTER TABLE fp_shopping_memo
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- 세션 기반 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_fp_shopping_memo_session_id
  ON fp_shopping_memo (session_id)
  WHERE session_id IS NOT NULL;

-- 세션+사용자 복합 조회 인덱스 (addToMemo 조회 경로 최적화)
CREATE INDEX IF NOT EXISTS idx_fp_shopping_memo_user_session
  ON fp_shopping_memo (user_id, session_id)
  WHERE session_id IS NOT NULL;
