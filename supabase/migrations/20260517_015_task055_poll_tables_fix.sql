-- ================================================================
-- Task 055 보완: fp_poll / fp_poll_vote 테이블 재생성
-- (014 마이그레이션에서 result_card_id TEXT→UUID FK 오류로 실패한 부분)
-- ================================================================

-- ── fp_poll 테이블 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_poll (
  poll_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID NOT NULL REFERENCES fp_family_group(group_id) ON DELETE CASCADE,
  creator_id        UUID NOT NULL REFERENCES fp_user_profile(user_id),

  title             TEXT NOT NULL,
  description       TEXT,
  options           JSONB NOT NULL DEFAULT '[]',
  target_member_ids JSONB,

  ends_at           TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'closed', 'cancelled')),
  poll_type         TEXT NOT NULL DEFAULT 'general'
                      CHECK (poll_type IN ('general', 'movie_night', 'dinner', 'activity')),

  -- UUID 타입으로 수정 (fp_menu_card.card_id 와 타입 일치)
  result_card_id    UUID REFERENCES fp_menu_card(card_id),

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

-- ── fp_poll_vote 테이블 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_poll_vote (
  vote_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id    UUID NOT NULL REFERENCES fp_poll(poll_id) ON DELETE CASCADE,
  group_id   UUID NOT NULL REFERENCES fp_family_group(group_id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES fp_user_profile(user_id) ON DELETE CASCADE,
  option_id  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
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

-- ── Realtime 등록 ──────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE fp_poll;
ALTER PUBLICATION supabase_realtime ADD TABLE fp_poll_vote;

-- ── 투표 결과 집계 RPC ─────────────────────────────────────────
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
