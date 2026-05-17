-- fp_notifications: 인앱 알림 수신함 테이블
CREATE TABLE IF NOT EXISTS fp_notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES fp_user_profile(user_id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('vote', 'movie_night', 'delivery', 'system')),
  title       TEXT NOT NULL,
  body        TEXT,
  link_url    TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at     TIMESTAMPTZ
);

-- 미읽음 조회 성능 인덱스
CREATE INDEX IF NOT EXISTS fp_notifications_user_unread_idx
  ON fp_notifications (user_id, is_read, created_at DESC);

-- RLS 활성화
ALTER TABLE fp_notifications ENABLE ROW LEVEL SECURITY;

-- 본인 알림만 조회
CREATE POLICY "fp_notifications_select" ON fp_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- 서버(service role)만 INSERT 허용
CREATE POLICY "fp_notifications_insert" ON fp_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- 본인 알림만 업데이트 (읽음 처리)
CREATE POLICY "fp_notifications_update" ON fp_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Realtime 구독 허용
ALTER PUBLICATION supabase_realtime ADD TABLE fp_notifications;
