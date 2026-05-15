-- =============================================================
-- M011: fp_check_rate_limit — AI 채팅 분산 레이트 리밋
-- 목적: 인메모리 Map → DB 기반으로 이관, 멀티인스턴스 환경에서 정확한 제한
-- 동작: 분당 30회 초과 시 false 반환 (원자적 upsert)
-- =============================================================

-- 레이트 리밋 추적 테이블
CREATE TABLE IF NOT EXISTS fp_rate_limit (
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  window_key  TEXT        NOT NULL,  -- 'YYYY-MM-DD HH:MM' 형식 (1분 윈도우)
  hit_count   INT         NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, window_key)
);

-- 오래된 윈도우 자동 정리 (1시간 이상 지난 레코드)
CREATE INDEX IF NOT EXISTS fp_rate_limit_created_idx
  ON fp_rate_limit(created_at);

-- RLS: 본인 레코드만 접근
ALTER TABLE fp_rate_limit ENABLE ROW LEVEL SECURITY;

CREATE POLICY fp_rate_limit_own
  ON fp_rate_limit
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================
-- fp_check_rate_limit 함수
-- 반환: true(허용) / false(차단)
-- =============================================================
CREATE OR REPLACE FUNCTION fp_check_rate_limit(
  p_user_id       UUID,
  p_max_count     INT  DEFAULT 30,
  p_window_minutes INT DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window_key TEXT;
  v_count      INT;
BEGIN
  -- 현재 분 윈도우 키 생성 (예: '2026-05-21 14:32')
  v_window_key := to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI');

  INSERT INTO fp_rate_limit (user_id, window_key, hit_count)
  VALUES (p_user_id, v_window_key, 1)
  ON CONFLICT (user_id, window_key)
  DO UPDATE SET hit_count = fp_rate_limit.hit_count + 1
  RETURNING hit_count INTO v_count;

  RETURN v_count <= p_max_count;
END;
$$;

-- 오래된 레이트 리밋 레코드 정리 함수 (pg_cron 또는 Edge Function에서 주기적 호출)
CREATE OR REPLACE FUNCTION fp_cleanup_rate_limits()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM fp_rate_limit
  WHERE created_at < now() - INTERVAL '1 hour';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION fp_check_rate_limit(UUID, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION fp_check_rate_limit(UUID, INT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION fp_cleanup_rate_limits() TO service_role;
