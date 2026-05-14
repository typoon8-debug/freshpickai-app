-- ================================================================
-- Task 030: 우리가족 보드 실시간 투표 (fp_family_vote, fp_vote_session)
-- ================================================================

-- ── fp_vote_session: 투표 세션 ──────────────────────────────
CREATE TABLE IF NOT EXISTS fp_vote_session (
  session_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     uuid NOT NULL REFERENCES fp_family_group(group_id) ON DELETE CASCADE,
  title        text NOT NULL DEFAULT '이번 주 뭐 먹지?',
  card_ids     jsonb NOT NULL DEFAULT '[]',   -- text[] as jsonb for flexibility
  ends_at      timestamptz NOT NULL,
  status       text NOT NULL DEFAULT 'open'   -- 'open' | 'closed'
               CHECK (status IN ('open', 'closed')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fp_vote_session_group
  ON fp_vote_session (group_id, status);

-- ── fp_family_vote: 가족 투표 ─────────────────────────────
CREATE TABLE IF NOT EXISTS fp_family_vote (
  vote_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   uuid NOT NULL REFERENCES fp_vote_session(session_id) ON DELETE CASCADE,
  group_id     uuid NOT NULL REFERENCES fp_family_group(group_id) ON DELETE CASCADE,
  card_id      text NOT NULL,                 -- fp_menu_card.card_id
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type    text NOT NULL
               CHECK (vote_type IN ('like', 'dislike')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, group_id, card_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_fp_family_vote_session
  ON fp_family_vote (session_id, group_id);

CREATE INDEX IF NOT EXISTS idx_fp_family_vote_card
  ON fp_family_vote (session_id, card_id);

-- ── Realtime Publication 활성화 ───────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE fp_family_vote;

-- ── RLS 정책 ─────────────────────────────────────────────

-- fp_vote_session RLS
ALTER TABLE fp_vote_session ENABLE ROW LEVEL SECURITY;

CREATE POLICY "가족 구성원만 세션 조회"
  ON fp_vote_session FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM fp_family_member
      WHERE fp_family_member.group_id = fp_vote_session.group_id
        AND fp_family_member.user_id  = auth.uid()
    )
  );

CREATE POLICY "가족 구성원만 세션 생성"
  ON fp_vote_session FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fp_family_member
      WHERE fp_family_member.group_id = fp_vote_session.group_id
        AND fp_family_member.user_id  = auth.uid()
    )
  );

-- fp_family_vote RLS
ALTER TABLE fp_family_vote ENABLE ROW LEVEL SECURITY;

CREATE POLICY "가족 구성원만 투표 조회"
  ON fp_family_vote FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM fp_family_member
      WHERE fp_family_member.group_id = fp_family_vote.group_id
        AND fp_family_member.user_id  = auth.uid()
    )
  );

CREATE POLICY "본인 투표 작성"
  ON fp_family_vote FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM fp_family_member
      WHERE fp_family_member.group_id = fp_family_vote.group_id
        AND fp_family_member.user_id  = auth.uid()
    )
  );

CREATE POLICY "본인 투표 수정"
  ON fp_family_vote FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 투표 삭제"
  ON fp_family_vote FOR DELETE
  USING (auth.uid() = user_id);

-- ── 투표 집계 함수 ────────────────────────────────────────
CREATE OR REPLACE FUNCTION fp_get_vote_results(p_session_id uuid)
RETURNS TABLE (
  card_id      text,
  like_count   bigint,
  dislike_count bigint
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    card_id,
    COUNT(*) FILTER (WHERE vote_type = 'like')    AS like_count,
    COUNT(*) FILTER (WHERE vote_type = 'dislike') AS dislike_count
  FROM fp_family_vote
  WHERE session_id = p_session_id
  GROUP BY card_id;
$$;

-- ── 월간 인기 랭킹 함수 ───────────────────────────────────
CREATE OR REPLACE FUNCTION fp_monthly_popular_cards(p_group_id uuid, p_limit int DEFAULT 5)
RETURNS TABLE (
  card_id    text,
  like_count bigint
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    fv.card_id,
    COUNT(*) FILTER (WHERE fv.vote_type = 'like') AS like_count
  FROM fp_family_vote fv
  JOIN fp_vote_session vs ON vs.session_id = fv.session_id
  WHERE fv.group_id = p_group_id
    AND vs.created_at >= date_trunc('month', now())
  GROUP BY fv.card_id
  ORDER BY like_count DESC
  LIMIT p_limit;
$$;
