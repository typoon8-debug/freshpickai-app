-- ================================================================
-- Task 055: FCM 푸시 알림 — 가족 참여 알림 시스템
-- fp_user_profile.fcm_token 컬럼 추가
-- fp_user_notification_settings 테이블
-- fp_poll (일반 투표 안건)
-- fp_poll_vote (투표 응답)
-- ================================================================

-- ── 1. FCM 토큰 컬럼 추가 ────────────────────────────────────
ALTER TABLE fp_user_profile
  ADD COLUMN IF NOT EXISTS fcm_token      TEXT,
  ADD COLUMN IF NOT EXISTS fcm_updated_at TIMESTAMPTZ;

-- ── 2. 알림 설정 테이블 ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_user_notification_settings (
  user_id            UUID PRIMARY KEY REFERENCES fp_user_profile(user_id) ON DELETE CASCADE,
  vote_notify        BOOLEAN NOT NULL DEFAULT true,
  movie_night_notify BOOLEAN NOT NULL DEFAULT true,
  delivery_notify    BOOLEAN NOT NULL DEFAULT true,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE fp_user_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 알림 설정 조회"
  ON fp_user_notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "본인 알림 설정 수정"
  ON fp_user_notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 알림 설정 업데이트"
  ON fp_user_notification_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. 일반 투표 안건 테이블 (fp_poll) ───────────────────────
CREATE TABLE IF NOT EXISTS fp_poll (
  poll_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID NOT NULL REFERENCES fp_family_group(group_id) ON DELETE CASCADE,
  creator_id        UUID NOT NULL REFERENCES fp_user_profile(user_id),

  -- 안건 내용
  title             TEXT NOT NULL,
  description       TEXT,
  -- options: [{id, label, emoji?}]
  options           JSONB NOT NULL DEFAULT '[]',

  -- 투표 대상 (null = 가족 전원)
  target_member_ids JSONB,

  -- 마감 및 상태
  ends_at           TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'closed', 'cancelled')),

  -- 종류: general(일반) | movie_night(무비나이트) | dinner(저녁메뉴) | activity(활동)
  poll_type         TEXT NOT NULL DEFAULT 'general'
                      CHECK (poll_type IN ('general', 'movie_night', 'dinner', 'activity')),

  -- 결과로 생성된 카드 (dinner/movie_night 완료 시)
  result_card_id    TEXT REFERENCES fp_menu_card(card_id),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_fp_poll_group
  ON fp_poll (group_id, status);

CREATE INDEX IF NOT EXISTS idx_fp_poll_ends_at
  ON fp_poll (ends_at) WHERE status = 'open';

ALTER TABLE fp_poll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "가족 구성원만 투표 안건 조회"
  ON fp_poll FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM fp_family_member
      WHERE fp_family_member.group_id = fp_poll.group_id
        AND fp_family_member.user_id  = auth.uid()
    )
  );

CREATE POLICY "가족 구성원만 투표 안건 생성"
  ON fp_poll FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    AND EXISTS (
      SELECT 1 FROM fp_family_member
      WHERE fp_family_member.group_id = fp_poll.group_id
        AND fp_family_member.user_id  = auth.uid()
    )
  );

CREATE POLICY "생성자만 투표 안건 수정"
  ON fp_poll FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- ── 4. 투표 응답 테이블 (fp_poll_vote) ───────────────────────
CREATE TABLE IF NOT EXISTS fp_poll_vote (
  vote_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id    UUID NOT NULL REFERENCES fp_poll(poll_id) ON DELETE CASCADE,
  group_id   UUID NOT NULL REFERENCES fp_family_group(group_id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES fp_user_profile(user_id) ON DELETE CASCADE,
  option_id  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)  -- 1인 1표
);

CREATE INDEX IF NOT EXISTS idx_fp_poll_vote_poll
  ON fp_poll_vote (poll_id);

CREATE INDEX IF NOT EXISTS idx_fp_poll_vote_group
  ON fp_poll_vote (group_id);

ALTER TABLE fp_poll_vote ENABLE ROW LEVEL SECURITY;

CREATE POLICY "가족 구성원만 투표 응답 조회"
  ON fp_poll_vote FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM fp_family_member
      WHERE fp_family_member.group_id = fp_poll_vote.group_id
        AND fp_family_member.user_id  = auth.uid()
    )
  );

CREATE POLICY "본인 투표 응답 작성"
  ON fp_poll_vote FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM fp_family_member
      WHERE fp_family_member.group_id = fp_poll_vote.group_id
        AND fp_family_member.user_id  = auth.uid()
    )
  );

CREATE POLICY "본인 투표 응답 수정"
  ON fp_poll_vote FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 투표 응답 삭제"
  ON fp_poll_vote FOR DELETE
  USING (auth.uid() = user_id);

-- ── 5. Realtime Publication ───────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE fp_poll;
ALTER PUBLICATION supabase_realtime ADD TABLE fp_poll_vote;

-- ── 6. 투표 결과 집계 함수 ────────────────────────────────────
CREATE OR REPLACE FUNCTION fp_get_poll_results(p_poll_id uuid)
RETURNS TABLE (
  option_id   TEXT,
  vote_count  BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    option_id,
    COUNT(*) AS vote_count
  FROM fp_poll_vote
  WHERE poll_id = p_poll_id
  GROUP BY option_id
  ORDER BY vote_count DESC;
$$;
