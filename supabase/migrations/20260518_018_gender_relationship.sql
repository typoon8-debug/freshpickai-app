-- =============================================================
-- M018: gender + relationship 설계 변경
--   1. fp_user_profile.gender        — 사용자 성별 (AI 페르소나·추천 활용)
--   2. fp_family_member.relationship — 가족 그룹 내 관계 (초대 수락 시 선택)
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. fp_user_profile — gender 컬럼 추가
-- ─────────────────────────────────────────────────────────────
ALTER TABLE fp_user_profile
  ADD COLUMN IF NOT EXISTS gender TEXT
    CHECK (gender IN ('male', 'female', 'other'))
    DEFAULT NULL;

COMMENT ON COLUMN fp_user_profile.gender IS
  '사용자 성별. male·female·other. NULL = 미설정. 마이페이지 선호설정에서 CRUD.';

-- ─────────────────────────────────────────────────────────────
-- 2. fp_family_member — relationship 컬럼 추가
-- ─────────────────────────────────────────────────────────────
ALTER TABLE fp_family_member
  ADD COLUMN IF NOT EXISTS relationship TEXT NOT NULL DEFAULT 'other'
    CHECK (relationship IN (
      'dad', 'mom',
      'husband', 'wife',
      'son', 'daughter',
      'elder_brother', 'elder_sister',
      'younger_brother', 'younger_sister',
      'grandfather', 'grandmother',
      'other'
    ));

COMMENT ON COLUMN fp_family_member.relationship IS
  '가족 그룹 내 본인 역할/관계. 초대 수락 시 사용자가 직접 선택.
   dad·mom·husband·wife·son·daughter·
   elder_brother·elder_sister·younger_brother·younger_sister·
   grandfather·grandmother·other';
