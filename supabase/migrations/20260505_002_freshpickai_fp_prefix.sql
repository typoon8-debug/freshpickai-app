-- ============================================================
-- Migration 002: FreshPickAI 전용 스키마 (fp_ 프리픽스)
-- ============================================================
-- ⚠️  공유 DB 주의사항
--   이 프로젝트는 freshpick-app · sellerbox-app · manager-app · rideron-app과
--   동일 Supabase DB를 공유합니다.
--
--   원칙:
--   1. 기존 public.* 테이블을 절대 수정하지 않습니다.
--   2. freshpickai 전용 테이블은 모두 fp_ 프리픽스를 사용합니다.
--   3. freshpickai 사용자 = Supabase Auth (auth.uid()) 기반 → fp_user_profile
--   4. 실구매 연동 시 public.order(order_id)를 FK로 참조합니다.
--   5. public.customer · public.cart_item · public.memo 등은 건드리지 않습니다.
--
-- 실행 방법:
--   Supabase Dashboard → SQL Editor → 이 파일 전체 붙여넣기 후 실행
--   또는: npx supabase db push (Supabase CLI)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. 필수 확장
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;    -- pgvector 1536차원 임베딩
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- 한국어 유사도 검색 폴백

-- ─────────────────────────────────────────────────────────────
-- 1. fp_user_profile  (freshpickai 앱 사용자 프로필)
-- ─────────────────────────────────────────────────────────────
-- Supabase Auth(auth.uid()) 기반. public.customer와 별개 엔티티.
-- 실구매 연동이 필요한 경우 ref_customer_id로 public.customer를 참조.
CREATE TABLE IF NOT EXISTS fp_user_profile (
  user_id        UUID PRIMARY KEY DEFAULT auth.uid(),  -- auth.uid() = PK
  ref_customer_id TEXT,                                -- public.customer.customer_id (선택, 커머스 연동용)
  display_name   TEXT NOT NULL DEFAULT '',
  avatar_url     TEXT,
  family_role    TEXT NOT NULL DEFAULT 'parent'
                   CHECK (family_role IN ('parent', 'teen', 'kid')),
  level          INT  NOT NULL DEFAULT 1,
  onboarded_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE fp_user_profile IS
  'freshpickai 앱 사용자 프로필. auth.uid() = PK. public.customer와 별개.';
COMMENT ON COLUMN fp_user_profile.ref_customer_id IS
  'public.customer.customer_id — 실구매/커머스 연동 시 연결. 선택값.';

-- ─────────────────────────────────────────────────────────────
-- 2. fp_user_preference  (9 페르소나 RAG 컨텍스트)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_user_preference (
  pref_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES fp_user_profile(user_id) ON DELETE CASCADE,
  wellness_goals     TEXT[]  NOT NULL DEFAULT '{}',
  cook_time_min      INT,
  budget_level       TEXT CHECK (budget_level IN ('low', 'mid', 'high')),
  persona_tags       TEXT[]  NOT NULL DEFAULT '{}',
  dietary_tags       TEXT[]  NOT NULL DEFAULT '{}',  -- vegan · gluten-free 등
  onboarding_skipped_at TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
COMMENT ON TABLE fp_user_preference IS
  '9 페르소나 RAG 컨텍스트 빌더 입력값. 온보딩 태그 + 행동 추론값.';

-- ─────────────────────────────────────────────────────────────
-- 3. fp_family_group / fp_family_member  (가족 그룹 F011)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_family_group (
  group_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL
                DEFAULT upper(substr(md5(random()::text), 1, 6)),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE fp_family_group IS '가족 그룹. invite_code 6자리 대문자.';

CREATE TABLE IF NOT EXISTS fp_family_member (
  member_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES fp_family_group(group_id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES fp_user_profile(user_id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- 4. fp_card_section  (섹션 탭 커스터마이징 F015)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_card_section (
  section_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES fp_user_profile(user_id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  sort_order   INT  NOT NULL DEFAULT 0,
  is_official  BOOL NOT NULL DEFAULT false,
  ai_auto_fill BOOL NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE fp_card_section IS
  '홈 탭 섹션. is_official=true는 10종 공식 탭, false는 사용자 커스텀.';

-- ─────────────────────────────────────────────────────────────
-- 5. fp_menu_card  (카드메뉴 F001)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_menu_card (
  card_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id    UUID REFERENCES fp_card_section(section_id) ON DELETE SET NULL,
  owner_user_id UUID REFERENCES fp_user_profile(user_id) ON DELETE SET NULL,
  card_theme    TEXT NOT NULL,
  name          TEXT NOT NULL,
  subtitle      TEXT,
  taste         TEXT,
  category      TEXT NOT NULL DEFAULT 'meal'
                  CHECK (category IN ('meal', 'snack', 'cinema')),
  emoji         TEXT,
  cover_image   TEXT,
  description   TEXT,
  is_official   BOOL NOT NULL DEFAULT false,
  is_new        BOOL NOT NULL DEFAULT false,
  review_status TEXT NOT NULL DEFAULT 'approved'
                  CHECK (review_status IN ('private', 'pending', 'approved')),
  health_score  NUMERIC(4,1),
  price_min     INT,
  price_max     INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE fp_menu_card IS
  '10종 공식 카드(is_official=true) + 사용자 커스텀 카드. card_theme: chef_table | one_meal | family_recipe | drama_recipe | honwell | seasonal | global_plate | k_dessert | snack_pack | cinema_night';

-- ─────────────────────────────────────────────────────────────
-- 6. fp_dish  (음식 마스터 F022 RAG)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_dish (
  dish_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  health_score NUMERIC(4,1),
  cook_time    INT,              -- 분 단위
  kcal         INT,
  price        INT,              -- 원 단위 예상 재료비
  season_start INT CHECK (season_start BETWEEN 1 AND 12),
  season_end   INT CHECK (season_end   BETWEEN 1 AND 12),
  diet_tags    TEXT[] NOT NULL DEFAULT '{}',   -- vegan · gluten-free 등
  persona_tags TEXT[] NOT NULL DEFAULT '{}',   -- 9 페르소나 매핑
  embedding    vector(1536),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE fp_dish IS
  'RAG 검색 대상 음식 마스터. embedding = OpenAI text-embedding-3-small 1536차원.';

-- ─────────────────────────────────────────────────────────────
-- 7. fp_dish_recipe  (레시피 변형 F022)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_dish_recipe (
  recipe_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id      UUID NOT NULL REFERENCES fp_dish(dish_id) ON DELETE CASCADE,
  title        TEXT NOT NULL,                    -- 예: "전통식", "간소화", "비건"
  body         TEXT,
  status       TEXT NOT NULL DEFAULT 'approved'
                 CHECK (status IN ('draft', 'approved', 'archived')),
  ai_consent   BOOL NOT NULL DEFAULT false,
  embedding    vector(1536),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 8. fp_dish_recipe_step  (조리 단계 F017 준비)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_dish_recipe_step (
  step_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id     UUID NOT NULL REFERENCES fp_dish_recipe(recipe_id) ON DELETE CASCADE,
  step_no       INT  NOT NULL,
  description   TEXT NOT NULL,
  timer_seconds INT,
  image_url     TEXT,
  UNIQUE(recipe_id, step_no)
);
COMMENT ON COLUMN fp_dish_recipe_step.timer_seconds IS
  'F017 인터랙티브 조리 UX v1.1 활성화 시 사용.';

-- ─────────────────────────────────────────────────────────────
-- 9. fp_card_dish  (카드 ↔ 음식 N:M F022)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_card_dish (
  card_dish_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id      UUID NOT NULL REFERENCES fp_menu_card(card_id) ON DELETE CASCADE,
  dish_id      UUID NOT NULL REFERENCES fp_dish(dish_id)      ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'main'
                 CHECK (role IN ('main', 'side', 'dessert')),
  sort_order   INT  NOT NULL DEFAULT 0,
  UNIQUE(card_id, dish_id)
);

-- ─────────────────────────────────────────────────────────────
-- 10. fp_dish_ingredient  (재료 목록)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_dish_ingredient (
  ingredient_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id          UUID NOT NULL REFERENCES fp_dish(dish_id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  quantity         TEXT,
  unit             TEXT,
  price            INT,
  price_was        INT,
  emoji            TEXT,
  sort_order       INT  NOT NULL DEFAULT 0,
  -- 커머스 플랫폼 상품 연동 (optional)
  ref_store_item_id TEXT  -- public.store_item.store_item_id (매칭 후 채움)
);
COMMENT ON COLUMN fp_dish_ingredient.ref_store_item_id IS
  'public.store_item.store_item_id — 장보기 메모 파싱 STEP3에서 매칭 후 채움.';

-- ─────────────────────────────────────────────────────────────
-- 11. fp_ingredient_meta  (재료 메타 F018 BP3)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_ingredient_meta (
  meta_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT UNIQUE NOT NULL,
  prep_tips         TEXT,
  measurement_hints TEXT,
  substitutes       TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE fp_ingredient_meta IS
  'F018: 재료별 손질법·계량 힌트·대체 재료. F003 RAG substitutes 우선 참조.';

-- ─────────────────────────────────────────────────────────────
-- 12. fp_card_note  (사용자 노트 3분류 F016 BP1)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_card_note (
  note_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id       UUID NOT NULL REFERENCES fp_menu_card(card_id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES fp_user_profile(user_id) ON DELETE CASCADE,
  note_type     TEXT NOT NULL DEFAULT 'tip'
                  CHECK (note_type IN ('tip', 'review', 'question')),
  body          TEXT NOT NULL,
  helpful_count INT  NOT NULL DEFAULT 0,
  ai_consent    BOOL NOT NULL DEFAULT false,
  admin_reply   TEXT,
  review_needed BOOL NOT NULL DEFAULT false,   -- 자기보강 루프 트리거
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN fp_card_note.review_needed IS
  '운영자 검수 요청. ai_consent=true 노트가 임계값 helpful_count 초과 시 자동 true.';

-- ─────────────────────────────────────────────────────────────
-- 13. fp_vote  (가족 투표 F011)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_vote (
  vote_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES fp_family_group(group_id)  ON DELETE CASCADE,
  card_id    UUID NOT NULL REFERENCES fp_menu_card(card_id)      ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES fp_user_profile(user_id)   ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, card_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- 14. fp_shopping_memo / fp_memo_item  (장보기 메모 F012)
-- ─────────────────────────────────────────────────────────────
-- public.memo · public.memo_item은 커머스 플랫폼(customer_id 기반)과 구조 상이.
-- freshpickai는 auth.uid() 기반 + AI 파싱 파이프라인 결과를 별도 저장.
CREATE TABLE IF NOT EXISTS fp_shopping_memo (
  memo_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES fp_user_profile(user_id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  raw_text    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fp_memo_item (
  memo_item_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memo_id           UUID NOT NULL REFERENCES fp_shopping_memo(memo_id) ON DELETE CASCADE,
  raw_text          TEXT NOT NULL,
  corrected_text    TEXT,           -- STEP1 오타 보정 결과
  qty_value         NUMERIC,        -- STEP2 수량 추출
  qty_unit          TEXT,           -- STEP2 단위
  matched_dish_ingredient_id UUID
    REFERENCES fp_dish_ingredient(ingredient_id) ON DELETE SET NULL,  -- STEP3 매칭
  ref_store_item_id TEXT,           -- public.store_item.store_item_id (STEP3 매칭)
  category          TEXT,           -- STEP4 카테고리 분류
  done              BOOL NOT NULL DEFAULT false,
  sort_order        INT  NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE fp_memo_item IS
  '4-step 파싱 결과: corrected_text(STEP1) → qty(STEP2) → matched_*(STEP3) → category(STEP4).';

-- ─────────────────────────────────────────────────────────────
-- 15. fp_cart_item  (freshpickai 장바구니)
-- ─────────────────────────────────────────────────────────────
-- public.cart_item은 store_item_id 기반 커머스 장바구니.
-- freshpickai는 fp_dish_ingredient 기반 + 커머스 상품 선택적 연동.
CREATE TABLE IF NOT EXISTS fp_cart_item (
  cart_item_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES fp_user_profile(user_id) ON DELETE CASCADE,
  card_id       UUID REFERENCES fp_menu_card(card_id)         ON DELETE SET NULL,
  ingredient_id UUID REFERENCES fp_dish_ingredient(ingredient_id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  qty           INT  NOT NULL DEFAULT 1,
  unit          TEXT,
  price         INT  NOT NULL DEFAULT 0,
  emoji         TEXT,
  ref_store_item_id TEXT,  -- 커머스 상품 연동 시 public.store_item.store_item_id
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN fp_cart_item.ref_store_item_id IS
  'public.store_item.store_item_id — 실결제 시 public.cart_item 생성에 사용.';

-- ─────────────────────────────────────────────────────────────
-- 16. fp_order  (freshpickai 주문 — 커머스 주문과 연동)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_order (
  fp_order_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES fp_user_profile(user_id) ON DELETE RESTRICT,
  ref_order_id    TEXT,  -- public.order.order_id (토스페이먼츠 결제 완료 후 연결)
  subtotal        INT  NOT NULL,
  shipping        INT  NOT NULL DEFAULT 0,
  discount        INT  NOT NULL DEFAULT 0,
  total           INT  NOT NULL,
  payment_method  TEXT CHECK (payment_method IN ('kakao', 'naver', 'card', 'bank')),
  payment_key     TEXT,
  address_name    TEXT,
  address_phone   TEXT,
  address_full    TEXT,
  delivery_window TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'shipping', 'delivered')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN fp_order.ref_order_id IS
  'public.order.order_id — 토스페이먼츠 결제 완료 후 커머스 주문과 연결.';

-- ─────────────────────────────────────────────────────────────
-- 17. fp_semantic_cache  (AI 쿼리 시맨틱 캐시 Task 029)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fp_semantic_cache (
  cache_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text  TEXT NOT NULL,
  embedding   vector(1536),
  response    TEXT NOT NULL,
  hit_count   INT  NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE fp_semantic_cache IS
  'AI 쿼리 시맨틱 캐시. 임계값 cosine ≥ 0.95 히트, TTL 7일.';

-- ─────────────────────────────────────────────────────────────
-- 18. 인덱스
-- ─────────────────────────────────────────────────────────────

-- pgvector HNSW (코사인 유사도, 목표 200ms 이하)
CREATE INDEX IF NOT EXISTS fp_dish_embedding_idx
  ON fp_dish USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS fp_dish_recipe_embedding_idx
  ON fp_dish_recipe USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS fp_semantic_cache_embedding_idx
  ON fp_semantic_cache USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- pg_trgm (한국어 ILIKE 폴백)
CREATE INDEX IF NOT EXISTS fp_dish_name_trgm_idx
  ON fp_dish USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS fp_dish_ingredient_name_trgm_idx
  ON fp_dish_ingredient USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS fp_ingredient_meta_name_trgm_idx
  ON fp_ingredient_meta USING gin (name gin_trgm_ops);

-- 일반 인덱스
CREATE INDEX IF NOT EXISTS fp_menu_card_theme_idx        ON fp_menu_card(card_theme);
CREATE INDEX IF NOT EXISTS fp_menu_card_category_idx     ON fp_menu_card(category);
CREATE INDEX IF NOT EXISTS fp_menu_card_official_idx     ON fp_menu_card(is_official);
CREATE INDEX IF NOT EXISTS fp_card_note_card_idx         ON fp_card_note(card_id);
CREATE INDEX IF NOT EXISTS fp_card_note_type_idx         ON fp_card_note(note_type);
CREATE INDEX IF NOT EXISTS fp_shopping_memo_user_idx     ON fp_shopping_memo(user_id);
CREATE INDEX IF NOT EXISTS fp_cart_item_user_idx         ON fp_cart_item(user_id);
CREATE INDEX IF NOT EXISTS fp_semantic_cache_expires_idx ON fp_semantic_cache(expires_at);

-- ─────────────────────────────────────────────────────────────
-- 19. RLS 활성화
-- ─────────────────────────────────────────────────────────────
ALTER TABLE fp_user_profile      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_user_preference   ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_family_group      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_family_member     ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_card_section      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_menu_card         ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_card_note         ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_vote              ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_shopping_memo     ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_memo_item         ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_cart_item         ENABLE ROW LEVEL SECURITY;
ALTER TABLE fp_order             ENABLE ROW LEVEL SECURITY;
-- 공개 참조 테이블 (RLS 없음 — 인증된 사용자 전체 읽기)
-- fp_dish, fp_dish_recipe, fp_dish_recipe_step, fp_card_dish,
-- fp_dish_ingredient, fp_ingredient_meta, fp_semantic_cache

-- ─────────────────────────────────────────────────────────────
-- 20. RLS 정책
-- ─────────────────────────────────────────────────────────────

-- fp_user_profile: 본인만 조회·수정, 가입은 자신의 auth.uid()로만
CREATE POLICY "fp_profile_select" ON fp_user_profile
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "fp_profile_insert" ON fp_user_profile
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "fp_profile_update" ON fp_user_profile
  FOR UPDATE USING (user_id = auth.uid());

-- fp_user_preference: 본인만
CREATE POLICY "fp_pref_all" ON fp_user_preference
  FOR ALL USING (user_id = auth.uid());

-- fp_card_section: 본인 섹션만
CREATE POLICY "fp_section_all" ON fp_card_section
  FOR ALL USING (user_id = auth.uid());

-- fp_menu_card: 공식(approved) 카드는 인증 사용자 전체 읽기, 본인 카드만 수정
CREATE POLICY "fp_card_public_select" ON fp_menu_card
  FOR SELECT TO authenticated
  USING (is_official = true OR review_status = 'approved'
         OR owner_user_id = auth.uid());
CREATE POLICY "fp_card_owner_insert" ON fp_menu_card
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "fp_card_owner_update" ON fp_menu_card
  FOR UPDATE USING (owner_user_id = auth.uid());
CREATE POLICY "fp_card_owner_delete" ON fp_menu_card
  FOR DELETE USING (owner_user_id = auth.uid());

-- fp_card_note: 인증 사용자 전체 읽기, 본인 노트만 쓰기·수정
CREATE POLICY "fp_note_select" ON fp_card_note
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "fp_note_insert" ON fp_card_note
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "fp_note_update" ON fp_card_note
  FOR UPDATE USING (user_id = auth.uid());

-- fp_family_group: 소속 멤버만 조회, 누구나 신규 생성
CREATE POLICY "fp_group_select" ON fp_family_group
  FOR SELECT TO authenticated USING (
    group_id IN (
      SELECT fm.group_id FROM fp_family_member fm
      WHERE fm.user_id = auth.uid()
    )
  );
CREATE POLICY "fp_group_insert" ON fp_family_group
  FOR INSERT WITH CHECK (true);

-- fp_family_member: 같은 그룹 멤버만 조회, 누구나 가입
CREATE POLICY "fp_member_select" ON fp_family_member
  FOR SELECT TO authenticated USING (
    group_id IN (
      SELECT fm2.group_id FROM fp_family_member fm2
      WHERE fm2.user_id = auth.uid()
    )
  );
CREATE POLICY "fp_member_insert" ON fp_family_member
  FOR INSERT WITH CHECK (true);

-- fp_vote: 같은 가족 그룹 멤버만
CREATE POLICY "fp_vote_all" ON fp_vote
  FOR ALL USING (
    group_id IN (
      SELECT fm.group_id FROM fp_family_member fm
      WHERE fm.user_id = auth.uid()
    )
  );

-- fp_shopping_memo: 본인 메모만
CREATE POLICY "fp_memo_all" ON fp_shopping_memo
  FOR ALL USING (user_id = auth.uid());

-- fp_memo_item: 본인 메모의 항목만
CREATE POLICY "fp_memo_item_all" ON fp_memo_item
  FOR ALL USING (
    memo_id IN (
      SELECT memo_id FROM fp_shopping_memo
      WHERE user_id = auth.uid()
    )
  );

-- fp_cart_item: 본인 장바구니만
CREATE POLICY "fp_cart_all" ON fp_cart_item
  FOR ALL USING (user_id = auth.uid());

-- fp_order: 본인 주문만
CREATE POLICY "fp_order_all" ON fp_order
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 21. 헬퍼 함수
-- ─────────────────────────────────────────────────────────────

-- 벡터 유사도 검색 (3단계 폴백: HNSW → pg_trgm → ILIKE)
CREATE OR REPLACE FUNCTION fp_search_dish(
  query_embedding vector(1536),
  similarity_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  dish_id UUID,
  name TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dish_id,
    name,
    1 - (embedding <=> query_embedding) AS similarity
  FROM fp_dish
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) >= similarity_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
COMMENT ON FUNCTION fp_search_dish IS
  'HNSW cosine 유사도 검색. 폴백은 애플리케이션 레이어에서 pg_trgm → ILIKE 순 처리.';

-- 시맨틱 캐시 히트 조회
CREATE OR REPLACE FUNCTION fp_match_cache(
  query_embedding vector(1536),
  similarity_threshold FLOAT DEFAULT 0.95
)
RETURNS TABLE (
  cache_id UUID,
  response TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    cache_id,
    response,
    1 - (embedding <=> query_embedding) AS similarity
  FROM fp_semantic_cache
  WHERE expires_at > now()
    AND embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) >= similarity_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT 1;
$$;
COMMENT ON FUNCTION fp_match_cache IS
  '임계값 0.95 이상 캐시 히트 반환. TTL 만료 항목 자동 제외.';
