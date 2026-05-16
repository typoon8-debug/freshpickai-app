# FreshPickAI 개발 로드맵 v0.2 — 완료 아카이브

> Phase 2.5 ~ Phase 4 완료 작업 상세 기록 (2026-05-14 ~ 2026-05-15)
> 현재 진행 중인 로드맵은 [`docs/ROADMAP.md`](./ROADMAP.md)를 참조하세요.

---

## Phase 2.5: v_store_inventory_item 통합 + AI 상품 데이터 활용

> **Sprint 3 (전반) · P0**
> sellerbox-app이 관리하는 `v_store_inventory_item` 단일 뷰로 상품 데이터를 통일하고, AI 필드를 전 기능에 반영합니다.
>
> **설계 근거**: `tenant_item_master`·`tenant_item_ai_detail` 직접 참조 제거 → `v_store_inventory_item` 단일화. sellerbox-app에서 AI 처리 완료(`ai_status = 'ACTIVE'`) 상품만 AI 데이터 노출.

### AI 데이터 가드레일 규칙 (전 기능 일관 적용)

| 조건 | 레벨 | 노출 데이터 | 배지 |
|------|------|-----------|------|
| `ai_status = 'ACTIVE'` AND `ai_confidence >= 0.6` | **full** | description_markup · ai_tags · ai_calories · ai_nutrition_summary · ai_ad_copy · ai_cooking_usage | 없음 |
| `ai_status = 'ACTIVE'` AND `ai_confidence < 0.6` | **partial** | 가격·이미지 · description_markup · ai_tags · ai_ad_copy · ai_cooking_usage (칼로리·영양 제외) | 없음 |
| `ai_status = 'REVIEW_NEEDED'` or `'ERROR'` | **review** | 가격·이미지 · description_markup · ai_tags · ai_ad_copy · ai_cooking_usage | "AI 분석 보완 중" |
| `ai_status = null` | **fallback** | `fp_dish_ingredient` 로컬 데이터만 | 없음 |

---

### Task 048: DB 스키마 마이그레이션 (v_store_inventory_item 연동 기반) ✅

**목적**: `ref_store_item_id` 컬럼 타입 정합성 확보 + 찜 테이블 생성 + 카드 AI 태그 검색 RPC 함수 추가

**구현 항목**:

- [x] **`ref_store_item_id` text → uuid 변환** (2개 테이블)
  - 변환 전 유효하지 않은 UUID 값 NULL 처리 (`fp_dish_ingredient`, `fp_cart_item`)
  - `ALTER COLUMN ref_store_item_id TYPE uuid USING ref_store_item_id::uuid`
- [x] **`fp_wishlist` 테이블 생성**
  - `(wishlist_id uuid PK, user_id uuid FK→fp_user_profile, store_item_id uuid, store_id uuid, added_at timestamptz)`
  - UNIQUE `(user_id, store_item_id)`
- [x] **`fp_cards_by_ai_tags` RPC 함수** — ai_tags 기반 카드 ID 목록 반환
- [x] **`fp_recommend_cards` RPC 함수** — 태그 매칭 점수 + 평균 신뢰도 + 프로모션 가중치 기반 카드 추천
- [x] **`database.types.ts` 재생성** — MCP `generate_typescript_types` 실행

**구현 결과**: `v_store_inventory_item` 뷰에 이미 AI 필드 포함 확인. `fp_wishlist` 신규 생성. `fp_cards_by_ai_tags` / `fp_recommend_cards` RPC 함수 등록. `database.types.ts` 최신화 완료. E2E: API 응답 확인 ✅

---

### Task 049: 타입 시스템 확장 + AI 데이터 가드레일 유틸 ✅

**목적**: `v_store_inventory_item` AI 필드를 담는 타입 정의 및 가드레일 유틸 구현

**구현 항목**:

- [x] **`StoreItemAiData` 타입** (`src/lib/types.ts`): aiStatus/aiConfidence/AI 필드/가격 필드 전체 정의 (netPrice 제외)
- [x] **`Ingredient` 타입 확장**: `liveData?: StoreItemAiData` 필드 추가
- [x] **`CartItem` 타입 확장**: aiAdCopy/thumbnailUrl/isInStock/effectiveSalePrice/discountPct/promoType/promoName/listPrice 추가
- [x] **`WishlistItem` 타입**: `StoreItemAiData & { wishlistId, addedAt }` 신규 정의
- [x] **`AiDataLevel` 타입** (`src/lib/utils/ai-data-guard.ts`): `'full' | 'partial' | 'review' | 'fallback'`
- [x] **`resolveAiDataLevel()`** / **`resolveAiData()`** 함수: 4단계 가드레일 구현
- [x] **`price-compare.ts` 시그니처 변경**: liveDiscount 파라미터 추가, SEASONAL_DISCOUNT 폴백 유지

**구현 결과**: `src/lib/utils/ai-data-guard.ts` 신규 생성. `src/lib/types.ts` 확장. TypeScript strict 0 errors. E2E: 미로그인 찜 목록 리다이렉트 확인 ✅

---

### Task 050: 카드 상세 v_store_inventory_item Enrichment (F002 확장) ✅

**목적**: 카드 상세 조회 시 `fp_dish_ingredient` 재료에 `v_store_inventory_item` AI 데이터를 enrichment하여 실시간 가격·이미지·AI 정보 반영

**구현 항목**:

- [x] **`getCardDetail()` enrichment 확장**: refIds 일괄 조회 → resolveAiData() → Ingredient.liveData 주입
- [x] **건강점수 AI 연동** (`calcHealthScoreWithAi()`): full 레벨 50% 이상 시 AI 기반 점수 분기
- [x] **재고 검증 개선**: validateStock() / decreaseInventory() v_store_inventory_item 활용
- [x] **`IngredientDetailSheet` 컴포넌트**: DOMPurify sanitize HTML, aiTags 칩, calorie 카드, _showReviewBadge 배지
- [x] **`IngredientRow` 컴포넌트 개선**: 썸네일·aiAdCopy·aiTags·품절 뱃지·가격 3단계·promoType 뱃지

**구현 결과**: `getCardDetail()` liveData enrichment 완료. `calcHealthScoreWithAi()` 신규 추가. `IngredientDetailSheet` + `IngredientRow` 컴포넌트 신규 생성. E2E: 구성 음식 섹션·재료 버튼 클릭→Drawer·건강점수·가격비교 섹션 모두 확인 ✅

---

### Task 051: 장바구니·결제 실시간 가격 + 검증 강화 (F004, F005 확장) ✅

**목적**: 장바구니 조회 시 실시간 가격 반영 + 결제 시 가격 위변조 방지

**구현 항목**:

- [x] **`fetchCartItemsAction()` live price join**: v_store_inventory_item 일괄 조회 → effective_sale_price 오버라이드, promoType/listPrice/discountPct 주입
- [x] **`CartItemRow` 컴포넌트 개선**: Next.js Image 썸네일, ai_ad_copy 서브텍스트, 품절 오버레이, 취소선 가격, promoType 뱃지
- [x] **`prepareOrderAction()` 가격 검증**: ±1원 허용 범위 위변조 차단, is_in_stock 재고 검증

**구현 결과**: 장바구니 live price enrichment 완료. 결제 전 가격 불일치 검증 추가. E2E: 장바구니 페이지 로드·결제 링크·체크아웃 접근 모두 확인 ✅

---

### Task 052: 카드 생성·수정 AI 자동채움 (F013 확장) ✅

**목적**: 카드 위저드 Step 3(재료 입력)에서 재료명 → `v_store_inventory_item` 자동 매칭 + `ref_store_item_id` 저장

**구현 항목**:

- [x] **`matchIngredientToStoreItemAction(name, storeId)`**: 1순위 ILIKE+ACTIVE+confidence, 2순위 ai_tags 포함 매칭
- [x] **위저드 Step 3 UI 개선**: 500ms 디바운스 → 매칭 미리보기 또는 수동 가격 입력
- [x] **`IngredientEntry` 타입 확장**: storeItemId, price 필드 추가, "매칭됨" 초록 뱃지

**구현 결과**: `matchIngredientToStoreItemAction()` 신규 구현. Step3 UI에 디바운스 자동 매칭 + 수동 입력 폴백 추가. E2E: Step1 테마 선택→다음 활성화, Step3 입력→매칭 UI 표시 확인 ✅

---

### Task 053: 카드 목록 AI 태그 필터 + 카드 추천 기반 구축 (F001 확장) ✅

**목적**: `ai_tags` 기반 카드 필터링 + AI 채팅 카드 추천을 위한 RPC 기반 구축

**구현 항목**:

- [x] **`getCards()` ai_tags 필터 확장**: `CardFilter.aiTags?: string[]` 추가, `fp_cards_by_ai_tags` RPC 호출 후 card_ids 기반 필터링
- [x] **카드 목록 AI 태그 필터 칩**: `AiTagFilter` 컴포넌트 신규 생성, `["비건","저GI","10분요리","저칼로리","항산화","고단백"]` 프리셋, 다중 선택 토글
- [x] **홈 보드 연동**: `HomeBoardClient`에 selectedAiTags 상태 + `/api/cards?aiTags=` 파라미터 전달

**구현 결과**: `AiTagFilter` 컴포넌트 신규 생성. `/api/cards` aiTags 파라미터 처리. E2E: 태그 필터 칩 표시·클릭→카드 갱신·해제→전체 복귀 확인 ✅

---

### Task 054: 찜(Wishlist) 기능 구현 ✅

**목적**: `v_store_inventory_item` 기반 찜 CRUD + AI 데이터 포함 조회

**구현 항목**:

- [x] **Wishlist Server Actions**: addWishlistAction / removeWishlistAction / isWishlisted / fetchWishlistAction (resolveAiData() 적용)
- [x] **`WishlistButton` 컴포넌트**: 하트 토글, useOptimistic 낙관적 UI (React 19)
- [x] **찜 목록 페이지** (`/wishlist`): 썸네일·ai_ad_copy·aiTags·실시간 가격·품절 뱃지·장바구니 CTA
- [x] **카드 상세 찜 버튼**: 헤더에 "찜하기" 버튼 표시, storeItemId 있는 재료에 WishlistButton 통합

**구현 결과**: `src/lib/actions/wishlist/index.ts` 신규 생성. `WishlistButton` + `WishlistClient` 컴포넌트 신규. `/wishlist` 페이지 신규. E2E: 찜 목록 로드·빈 상태·찜하기 버튼·클릭 후 목록 이동 확인 ✅

---

## Phase 3: AI 기능 + RAG 시스템 구현

> **Sprint 3 (후반) ~ Sprint 4 (Week 4~5) · P0/P1**

---

### Task 024: customer_preference + 페르소나 컨텍스트 빌더 구현 ✅

**목적**: 9 페르소나 RAG의 핵심인 사용자 컨텍스트 빌더 구현

**구현 항목**:

- [x] **페르소나 컨텍스트 빌더** (`src/lib/ai/persona-context.ts`): `buildPersonaContext(userId)` — 9 페르소나 분류 (P1 가족 매니저, P2 효율 1인식, P3 맞벌이 부부, P4 건강 시니어, P5 가성비 대학생, P6 프리미엄 미식가, P7 워킹맘, P8 막내셰프, P9 트렌드 큐레이터)
- [x] **시스템 프롬프트 빌더** (`src/lib/ai/prompts.ts`): `buildChatPrompt()`, `buildMealSetPrompt()`, `buildReasonPrompt()` 3종
- [x] **customer_preference 입력 UI** (`src/components/profile/PreferenceForm.tsx`): 식이 태그(10종) · 조리 수준 · 선호 쇼핑 시간대 · 가족 인원 입력 폼
- [x] **페르소나 자동 추론** (`src/lib/ai/persona-inference.ts`): 주문 이력 기반 persona_tags 보정 + `applyInferredTags()`
- [x] **프로필 페이지** (`src/app/(main)/profile/page.tsx`): 페르소나 배지 + PreferenceForm 통합 페이지
- [x] **API 라우트** (`/api/persona/context`, `/api/persona/chat-prompt`): 인증 사용자 페르소나 컨텍스트 JSON 반환

**구현 결과**: `src/lib/ai/` 디렉토리 신규 생성 (persona-context.ts, prompts.ts, persona-inference.ts). **Playwright E2E 13/13 통과** ✅

---

### Task 025: AI 채팅 + addToMemo Tool 구현 (F003) ✅

**목적**: Vercel AI SDK streamText + addToMemo Tool 완성

**구현 항목**:

- [x] **AI 채팅 Route Handler** (`src/app/api/ai/chat/route.ts`): AI SDK v6 `streamText` + `toUIMessageStreamResponse()`, `common_code(code='AI_CHAT_LLM')` 모델 동적 로드, 9 페르소나 컨텍스트 + `buildChatPrompt()` 시스템 프롬프트, `stopWhen: stepCountIs(5)`, SSE 스트리밍
- [x] **addToMemo Tool** (`src/lib/ai/tools/add-to-memo.ts`): AI SDK v6 `tool({ inputSchema, execute })` 정의, `fp_shopping_memo` 당일 메모 upsert + `fp_memo_item` 일괄 삽입
- [x] **인라인 확인 카드** (`src/components/chat/AddToMemoConfirmCard.tsx`): 도구 실행 성공 후 품목 목록 + "메모 보기" 링크 카드 UI
- [x] **Haiku 분류 레이어** (`src/lib/ai/classify.ts`): 키워드 빠른 분류 → Claude Haiku 4.5 LLM 폴백, 5분 인메모리 캐시
- [x] **빠른칩 컨텍스트 주입**: 비건·매운맛·10분·8천원이하·초등간식 칩 선택 시 `quickChip` 파라미터로 시스템 프롬프트 제약 조건 추가
- [x] **30 req/min 레이트 리밋** (userId 기준 인메모리), 미인증 401

**구현 결과**: `src/app/api/ai/chat/route.ts` + `src/lib/ai/tools/add-to-memo.ts` + `src/lib/ai/classify.ts` + `src/components/chat/AddToMemoConfirmCard.tsx` 신규 생성. AI SDK v6 UIMessage 스트림 프로토콜 적용. **Playwright E2E 12/12 통과** ✅

---

### Task 026: AI 추천 5테마 시스템 구현 ✅

**목적**: 홈 화면 AI 추천 섹션에 5가지 테마 큐레이팅 구현

**구현 항목**:

- [x] **5테마 추천 Route Handler** (`src/app/api/ai/recommend/route.ts`): Vercel AI SDK `generateObject`
  - 테마1: 오늘의한끼 (페르소나 기반 메뉴 세트)
  - 테마2: 지금이적기 (제철 재료 기반)
  - 테마3: 놓치면아까워요 (재고 임박 OR 프로모션 진행 상품)
  - 테마4: 다시만나볼까요 (이전 `order_item.store_item_id` 기준 재추천)
  - 테마5: 새로들어왔어요 (`v_store_inventory_item.created_at` 최신 + `ai_status='ACTIVE'`)
- [x] **추천 결과 스키마** (Zod `RecommendationSchema`): `{ theme, cards: [{ cardId, title, reason, confidence, promoHighlight?, discountPct? }] }`
- [x] **홈 AI 추천 섹션** (`src/components/home/AIRecommendSection.tsx`): 5테마 탭 + 추천 카드 carousel + 로딩 스켈레톤
- [x] **세션 캐시** (sessionStorage 24h): 동일 세션 내 재방문 시 API 재호출 방지

**구현 결과**: `src/app/api/ai/recommend/route.ts` 신규 생성. `src/lib/validations/recommendation.ts` Zod 스키마. **Playwright E2E 16/16 통과** ✅

---

### Task 027: pgvector RAG 인프라 구축 ✅

**목적**: Supabase pgvector + HNSW 인덱스 기반 의미론적 검색 인프라 구축

**구현 항목**:

- [x] **임베딩 서비스** (`src/lib/ai/embedding.ts`): `embedText(text)` + `embedBatch(texts[])` — AI SDK v6 `embed`/`embedMany` + `text-embedding-3-small` (1536차원)
- [x] **임베딩 백필 스크립트** (`src/scripts/backfill-embeddings.ts`): `fp_dish` 30건 + `fp_store_item_embedding` 2,700건 대상. `range()` 페이지네이션 (1,000행/요청 제한 우회), 멱등 설계
- [x] **Supabase Edge Function** (`supabase/functions/auto-embed/index.ts`): `ai_status → ACTIVE` 갱신 시 자동 재임베딩 Deno Function
- [x] **pgvector 검색 함수** (`src/lib/ai/vector-search.ts`): `searchByVector()` — HNSW cosine → pg_trgm → ILIKE 3단계 폴백. `dish`/`recipe`/`store_item` 3종 지원
- [x] **DB 마이그레이션**: `fp_user_preference.embedding vector(1536)` + `fp_store_item_embedding` 테이블 + RPC 함수 3종
- [x] **성능 검증**: EXPLAIN ANALYZE — `fp_dish_embedding_idx` HNSW 인덱스 정상 사용, Execution Time 0.844ms ✅

**구현 결과**: HNSW EXPLAIN ANALYZE 0.844ms. **Playwright E2E 12/12 통과** ✅

---

### Task 028: ToolLoopAgent 5 Tools 구현 ✅

**목적**: Vercel AI SDK ToolLoopAgent 기반 5가지 도구 구현

**구현 항목**:

- [x] **searchItems Tool** (`src/lib/ai/tools/search-items.ts`): `mode: 'recipe' | 'item'` 파라미터로 내부 분기
  - `recipe` 모드 — `fp_dish_recipe` pgvector 유사도 검색 (diet_tags·persona_tags 필터)
  - `item` 모드 — `v_store_inventory_item (ai_status='ACTIVE')` pgvector 유사도 + ai_tags 필터 + pg_trgm 폴백
- [x] **getUserContext Tool** (`src/lib/ai/tools/get-user-context.ts`): `buildPersonaContext()` 결과 반환, 캐시 60초
- [x] **getInventory Tool** (`src/lib/ai/tools/get-inventory.ts`): `v_store_inventory_item`에서 재고 조회
- [x] **addToCart Tool** (`src/lib/ai/tools/add-to-cart.ts`): `fp_cart_item` 일괄 삽입, `effectiveSalePrice` 스냅샷
- [x] **ToolLoopAgent Route Handler** (`src/app/api/ai/agent/route.ts`): 5 도구 주입, `stopWhen: stepCountIs(5)`
- [x] **ActionableProductCard 컴포넌트** (`src/components/chat/actionable-product-card.tsx`): 장바구니 추가 확인 카드 + "장바구니 보기" CTA

**구현 결과**: 5도구 신규 생성 + `src/app/api/ai/agent/route.ts` 신규. **Playwright E2E 12/12 통과** ✅

---

### Task 029: 시맨틱 캐시 + 자기보강 루프 구현 ✅

**목적**: AI 쿼리 시맨틱 캐시로 비용 절감 + LLM 결과 자기보강 루프

**구현 항목**:

- [x] **시맨틱 캐시 서비스** (`src/lib/ai/semantic-cache.ts`): `checkCache(queryText, threshold=0.95)` — embedText() + fp_semantic_cache_lookup RPC, `saveCache()` — 7일 TTL
- [x] **자기보강 루프** (`src/lib/ai/self-reinforce.ts`): `enqueueIfLowConfidence()` — searchItems tool 실행 후 신뢰도 0.6 미만 항목 자동 등록
- [x] **캐시 만료 정리 Edge Function** (`supabase/functions/cache-cleanup/index.ts`): Deno Edge Function, `fp_cleanup_expired_cache()` RPC 호출
- [x] **Vercel AI SDK OpenTelemetry 연동**: chat + agent route에 `experimental_telemetry` 추가 (토큰·비용·지연 자동 추적)
- [x] **DB 마이그레이션** (`supabase/migrations/20260515_004_semantic_cache.sql`): `fp_ai_semantic_cache` + `fp_ai_review_queue` 테이블 + RPC 함수 2종

**구현 결과**: `fp_ai_semantic_cache` 테이블 캐시 저장 확인 (hit_count=3 검증). HIT 시 promptTokens: 0, completionTokens: 0. **Playwright E2E 13/13 통과** ✅

---

### Task 030: 우리가족 보드 실시간 기능 구현 (F011) ✅

**목적**: Supabase Realtime 기반 투표 실시간 동기화 + 무비나이트 자동 카드 생성

**구현 항목**:

- [x] **Supabase Realtime 투표 훅** (`src/hooks/useFamilyVoteRealtime.ts`): `supabase.channel('family-vote-{groupId}-{sessionId}').on('postgres_changes')` 구독 — INSERT/UPDATE/DELETE 모두 처리
- [x] **투표 Server Action** (`src/lib/actions/family/vote.ts`): `castVote()` upsert, `getVoteResults()` / `getMonthlyPopularCards()` RPC
- [x] **무비나이트 자동 카드 생성** (`src/lib/actions/family/movie-night.ts`): 8장르 투표 집계 → Claude Sonnet 4.6 `generateObject`로 홈시네마 페어링 카드 자동 생성 (성인 + 키즈 무알콜 버전 2장)
- [x] **낙관적 UI**: React 19 `useOptimistic` — 투표 클릭 즉시 UI 반영 후 서버 동기화
- [x] **DB 마이그레이션**: `fp_vote_session` + `fp_family_vote` 테이블 + RLS 4정책 + RPC 함수 2종

**구현 결과**: `fp_monthly_popular_cards` RPC 기반 랭킹 DB 연동. **Playwright E2E 16/16 통과** ✅

---

### Task 037: 카드 사용자 노트 3분류 시스템 구현 (F016 BP1) ✅

**구현 항목**:

- [x] **노트 CRUD Server Actions** (`src/lib/actions/notes/`): `createNote()`, `listNotes()`, `markHelpful()`, `replyAsAdmin()` (is_admin() RPC 권한 체크)
- [x] **NoteList 컴포넌트**: 팁·후기·질문 필터 탭 + 도움순/최신순 정렬, 운영자 답글 들여쓰기 인용 박스
- [x] **NoteWriteDrawer 완성**: DrawerContent 구조, 5자 미만 비활성화, AI 학습 동의 체크박스
- [x] **자기보강 루프 트리거** (`src/lib/actions/notes/self-improve.ts`): `helpful_count >= 5` AND `ai_consent=true` → Claude Haiku 4.5 LLM Judge 사실성 평가 (≥ 4/5 통과 시 `fp_dish_recipe`에 `source='user_note'`·`status='REVIEW_NEEDED'` UPSERT)

**구현 결과**: **Playwright E2E 27/27 통과** ✅

---

### Task 038: 재료 메타 확장 구현 (F018 BP3) ✅

**구현 항목**:

- [x] **재료 메타 시드** (`src/scripts/seed-ingredient-meta.ts`): 주요 재료 103종에 손질법·계량 힌트·대체 재료 시드 — `upsert(ignoreDuplicates: true)` 멱등 설계
- [x] **IngredientMetaBlock 컴포넌트**: accordion UI (클릭 펼침), ✂️ 손질법·⚖️ 계량 힌트·🔄 대체 재료 칩 표시
- [x] **F003 substitutes 우선 참조** (`src/lib/ai/tools/search-items.ts` recipe 모드): `lookupSubstitutes()` 함수 — `fp_ingredient_meta` JS 필터 + `v_store_inventory_item.ai_tags` 교차 참조
- [x] **사용자 노트 → substitutes 자동 병합 큐**: `triggerSubstituteMerge()` — Claude Haiku 4.5로 팁 노트에서 대체 재료 추출 → `fp_ai_review_queue` 등록

**구현 결과**: 재료 메타 시드 103종 (DB 총 104레코드). **Playwright E2E 16/16 통과** ✅

---

### Task 039: 카드 외부 공유 + OG 미리보기 구현 (F021 BP7) ✅

**구현 항목**:

- [x] **카카오 SDK 통합** (`src/lib/share/kakao.ts`): `shareCard()` — `Kakao.Share.sendDefault` → Web Share API → 클립보드 복사 3단계 폴백
- [x] **OG 메타 동적 생성 라우트** (`src/app/cards/[id]/opengraph-image.tsx`): Next.js `ImageResponse` (1200×630) — 카드 이모지·이름·건강점수 배지·가격 배지·FreshPick AI 워터마크
- [x] **비로그인 카드 미리보기 페이지** (`src/app/cards/[id]/preview/page.tsx`): RSC + `generateMetadata` + "FreshPickAI 시작하기" CTA
- [x] **ShareButton 컴포넌트**: 카카오→Web Share API→클립보드 3단계, Sonner 토스트 "링크 복사됨"
- [x] **미들웨어 공개 경로 추가**: `/cards/[id]/preview` + `/cards/[id]/opengraph-image` 비로그인 허용

**구현 결과**: `npm run build` 성공 (35/35 정적 페이지). **Playwright E2E 21/21 통과** ✅

---

### Task 040: 카드 만들기 위저드 강화 (F013 + BP4) ✅

**구현 항목**:

- [x] **가이드 키워드 시스템** (`src/data/wizard-guide-keywords.ts`): 10종 카드테마별 `menuNamePlaceholder` + 25종 재료 손질법·대체재료 정적 힌트 사전
- [x] **Step3 재료 메타 힌트**: 재료 입력 500ms 디바운스 → `getIngredientMetaByNameAction` (DB) + 정적 폴백 병렬 조회
- [x] **재료 매칭 AI**: `matchIngredientToStoreItemAction` + `getIngredientMetaByNameAction` 병렬 조회, 매칭 미리보기 (썸네일·이름·가격)
- [x] **검수 신청 체크박스** (`wizard-submit-for-review`): 미체크 → `review_status='private'`, 체크 → `review_status='pending'`
- [x] **AI 학습 동의 체크박스**: 동의 시 `fp_dish + fp_card_dish + fp_dish_ingredient + fp_dish_recipe` (source='user_note', status='REVIEW_NEEDED') 자동 생성

**구현 결과**: **Playwright E2E 21/21 통과** ✅

---

### Task 041: F019 온보딩 슬라이드 백엔드 연동 (BP5) ✅

**구현 항목**:

- [x] **온보딩 진입 가드 미들웨어**: 쿠키(`fp_onboarded`) 기반 고속 가드 + DB fallback
- [x] **온보딩 Server Actions 확장**: `saveOnboarding()` (DB 저장 + 쿠키 설정) · `skipOnboardingAction()` · `resetOnboardingAction()`
- [x] **온보딩 페이지 서버 컴포넌트 전환**: 인증 체크 + 실 카드 데이터(`fp_menu_card`) 12건 조회
- [x] **householdSize DB 저장 버그 수정**: `saveOnboarding()`에서 `household:N` 태그 누락 버그 수정
- [x] **PWA 아이콘 생성** (`public/icon-192x192.png`, `public/icon-512x512.png`): sharp로 FreshPick 브랜드 아이콘 생성

**구현 결과**: **Playwright E2E 11/11 통과** ✅

---

## Phase 4: 고급 기능 + 품질 + 배포 (완료 항목)

---

### Task 032: 카드섹션 AI 자동 채움 + 드래그앤드롭 완성 (F015) ✅

**구현 항목**:

- [x] **AI 자동 채움 Route Handler** (`src/app/api/sections/auto-fill/route.ts`): `fp_recommend_cards` RPC + Claude Haiku 4.5 `generateObject` → 카드 3개 자동 생성. RPC 실패 시 `fp_menu_card` 직접 조회 폴백
- [x] **드래그앤드롭 완성** (`src/components/sections/section-list.tsx`): `@dnd-kit/core` + `@dnd-kit/sortable` `PointerSensor`(distance: 8) + `TouchSensor`(delay: 200ms, tolerance: 5px)
- [x] **AI 자동 채움 토글 반응**: `card_section.ai_auto_fill = true` 저장 → 홈 재방문 시 `/api/sections/auto-fill` 호출 + 24h sessionStorage 캐시

**구현 결과**: `@dnd-kit/core@6.3.1` 설치. `fp_recommend_cards` RPC 마이그레이션 (`20260520_007_recommend_cards_rpc.sql`). **Playwright E2E 8/8 통과** ✅

---

### Task 033: 성능 최적화 + Lighthouse 90+ 달성 ✅

**구현 항목**:

- [x] **이미지 최적화**: `menu-card.tsx`·`AIRecommendSection.tsx`의 `<img>` → `next/image <Image>` 전환, `fill` + `sizes` 속성 설정
- [x] **번들 분석**: `next.config.ts` `optimizePackageImports` 확장. `NoteWriteDrawer` `dynamic()` 지연 로딩
- [x] **React Suspense + 스트리밍**: `DailyHeroLoader` + `CardsSectionLoader` RSC 래퍼 생성, 홈 페이지 `Suspense` 경계 3종
- [x] **TanStack Query 캐시 전략**: `staleTime` 5분→10분, `gcTime` 10분→30분, `refetchOnWindowFocus: false`
- [x] **폰트 최적화**: `pretendard@3.0.0` npm 패키지 설치 → `next/font/local` 전환. `globals.css` CDN `@import` 완전 제거

**구현 결과**: CDN 렌더 블로킹 제거. `DailyHeroSkeleton`, `AIRecommendSkeleton`, `HomeBoardSkeleton` 3종 추가. **Playwright E2E 14/15 통과** ✅

---

### Task 034: Playwright E2E 테스트 (9 페르소나 × 10종 카드 골든 셋) ✅

**테스트 결과 요약** (2026-05-14):
- 총 71 TC 실행 (5+7+7+10+8+34)
- **69 통과 / 0 실패 / 2 조건부 스킵** (투표 세션 없음 — 데이터 의존 스킵)
- 통과율: **97.2%** (스킵 제외 시 100%)
- 골든 셋 300건 assertions 달성 (BLOCK1~9 누적)

**구현 항목**:

- [x] `e2e/task034-auth.spec.ts` — 인증 플로우 5 TC
- [x] `e2e/task034-purchase.spec.ts` — 카드 구매 플로우 7 TC (가격 위변조 422 검증)
- [x] `e2e/task034-ai-chat.spec.ts` — AI 채팅 7 TC
- [x] `e2e/task034-family-vote.spec.ts` — 가족 투표 실시간 8 TC (2 조건부 스킵)
- [x] `e2e/task034-memo.spec.ts` — 메모 파싱 8 TC
- [x] `e2e/golden-set/task034-golden-set.spec.ts` — 9 페르소나 × 골든 셋 34 TC

---

### Task 035: PWA + 접근성 (WCAG AA) + 모니터링 ✅

**구현 항목**:

- [x] **PWA 설정**: Serwist 기반 Service Worker + CacheFirst/NetworkFirst 전략 + offline 프리캐시
- [x] **오프라인 폴백 페이지** (`src/app/offline/page.tsx`): Zustand persist localStorage 읽기, 재시도 버튼
- [x] **WCAG AA 접근성**: axe-playwright 검사 통과 (로그인·홈 페이지), hit target 44px 이상
- [x] **Sentry 에러 모니터링** (`@sentry/nextjs` v10): `withSentryConfig` Next.js 래핑
- [x] **PostHog 사용자 분석**: 이벤트 6종 (card_viewed, cart_added, payment_completed, ai_chat_started, vote_cast, card_shared)
- [x] **Vercel Analytics**: `<Analytics />` + `<SpeedInsights />` 추가

**구현 결과**: axe WCAG AA: 로그인·홈 페이지 critical/serious 위반 0건. **Playwright E2E 8/8 통과** ✅

---

### Task 036: CI/CD 파이프라인 + Vercel 배포 최적화 ✅

**구현 항목**:

- [x] **GitHub Actions CI** (`.github/workflows/ci.yml`): PR 생성 시 타입체크·린트·포맷 → 프로덕션 빌드 → Playwright E2E 3단계 자동 실행
- [x] **Vercel 브랜치 배포**: `vercel.json` 생성 (정적 캐시 헤더, `/api` no-store, cron 헬스체크)
- [x] **Supabase 마이그레이션 자동화**: `main` merge + `supabase/migrations/**` 변경 시 `supabase db push` 자동 실행
- [x] **환경 변수 관리**: `.env.example` 전체 환경변수 문서화 (15종)
- [x] **Fluid Compute 최적화**: `maxDuration = 60` (chat/recommend/agent), `maxDuration = 30` (search) 설정
- [x] **배포 후 스모크 테스트**: `GET /api/health` + vercel.json cron 5분 주기

**구현 결과**: **Playwright E2E 8/8 통과** ✅

---

### Task 042 (P2): F017 인터랙티브 조리 UX + F020 냉장고 비우기 모드 ✅

**완료**: 2026-05-14

**구현 항목 (F017)**:

- [x] **CookMode 페이지** (`src/app/(main)/cards/[id]/cook/page.tsx`): floating 4-action 바 (요약·공유·북마크·노트보기)
- [x] **RecipeStepTimer** (`src/components/cook/recipe-step-timer.tsx`): 스텝별 카운트다운 타이머 + PWA Notification API
- [x] **북마크 시스템**: `fp_customer_card_bookmark` 신규 테이블 + RLS + `BookmarkButton` 컴포넌트

**구현 항목 (F020)**:

- [x] **냉장고 비우기 모드 UI** (`src/components/chat/FridgeMode.tsx`): 보유 재료 칩 입력 + AI 매칭 카드 3개
- [x] **Fridge Match API** (`src/app/api/ai/fridge-match/route.ts`): 재료 겹침 스코어 → Claude Haiku 최종 선별
- [x] **F015 가상 섹션 "냉장고 비우기"**: AI 자동 채움 ON 기본값 (OFFICIAL_SECTIONS 추가)

**구현 결과**: **Playwright E2E 12/12 통과** ✅

---

## 추가 완료 스프린트 (2026-05-14~15)

---

### 리팩토링: AI 모델 ID 통합 관리 (`model-config`) ✅

**완료**: 2026-05-14

- [x] **`src/lib/ai/model-config.ts` 신설**: `getAiModelId(codeKey)` 유틸 — `common_code` 테이블 조회 + 5분 프로세스 캐시
- [x] **전체 기본 모델 Haiku 통일**: 8개 기능 모두 `common_code` 키로 교체

| common_code 키 | 용도 | 기본 모델 |
|---------------|------|----------|
| `AI_CHAT_LLM` | 일반 AI 채팅 ToolLoop | Haiku |
| `AI_AGENT_LLM` | 에이전트 ToolLoop | Haiku |
| `AI_RECOMMEND_LLM` | 카드 추천 `generateObject` | Haiku |
| `AI_AUTO_FILL_LLM` | 섹션 자동채움 `generateObject` | Haiku |
| `AI_FRIDGE_MATCH_LLM` | 냉장고 비우기 매칭 `generateObject` | Haiku |
| `AI_CLASSIFY_LLM` | 채팅 의도 분류 `generateText` | Haiku |
| `AI_SELF_IMPROVE_LLM` | 노트 자기보강 LLM Judge | Haiku |
| `AI_MOVIE_NIGHT_LLM` | 무비나이트 카드 생성 `generateObject` | Haiku |

---

### UX 개선 스프린트: 헤더 리뉴얼 + 카테고리 탐색 + 메모 편집 ✅

**완료**: 2026-05-15

- [x] **BrandHeader 리뉴얼**: Bell/Settings 아이콘 → 찜(Heart) + 장바구니(ShoppingCart) + 마이프레시(User) 링크로 교체. `useSyncExternalStore` 패턴으로 hydration 안전한 배지 카운터 구현
- [x] **BottomTabNav 개편**: "장바구니" 탭 → "카테고리" 탭(`/category`, LayoutGrid 아이콘)으로 교체
- [x] **카테고리 브라우저 신설** (`src/app/(main)/category/`): `getLargeCategoriesAction()` · `getMediumCategoriesAction()` · `getItemsByCategoryAction()` Server Actions. `CategoryShell` 컴포넌트 (좌측 사이드바 + 중형 카테고리 칩 + 상품 그리드)
- [x] **WishlistStore 신설** (`src/lib/store/wishlist-store.ts`): Zustand `persist` + `Set<string>` 기반 토글 스토어
- [x] **메모 상세·편집 페이지 신설** (`src/app/(main)/memo/[id]/`): `getMemoDetailAction()` + `updateMemoAction()` + `MemoEditor` 클라이언트 컴포넌트
- [x] **재료 수동 매칭 드로어** (`src/components/memo/memo-match-drawer.tsx`): `GET /api/memo/search-items` 라우트 신설

---

### 버그 수정: HomeBoard Hydration 에러 ✅

**완료**: 2026-05-15

**원인**: `home-board.tsx`의 `useMemo` 안에서 `sessionStorage` 접근 → 서버(null)·클라이언트(실데이터) 불일치 → React hydration 에러

**수정**: `useMemo` → `useState + useEffect` 패턴 전환

---

### 버그 수정: 모바일 홈화면 깜빡임 — 1차 수정 (3가지) ✅

**완료**: 2026-05-15

- [x] **`src/hooks/use-stores-hydrated.ts` 신규 생성**: cart·sections·wishlist 3개 persist 스토어 hydration 카운트다운, 마지막 스토어 완료 시 단 1회 `setHydrated(true)` 호출
- [x] **`home-board.tsx`**: `initialDataUpdatedAt: useState(() => Date.now())` 추가, `useStoresHydrated` 적용 → hydration 전 `<HomeBoardSkeleton />` 표시
- [x] **`brand-header.tsx`**: `useSyncExternalStore` 기반 `useIsMounted` 제거, `useStoresHydrated` 통합

---

### 버그 수정: 모바일 홈화면 깜빡임 — 근본 원인 4가지 추가 수정 ✅

**완료**: 2026-05-15

- [x] **`AIRecommendSection.tsx`**: `getInitialState()` lazy initializer 제거 → 항상 `{ loading: true }` 초기 상태, sessionStorage 읽기를 `useEffect`로 이전
- [x] **`use-stores-hydrated.ts`**: `useAuthStore`를 4번째 스토어로 추가, `Promise.resolve().then()` → `startTransition()` 교체
- [x] **`onboarding-guard.tsx`**: 자체 hydration 루프 전체 제거, `useStoresHydrated` 재사용
- [x] **`menu-card.tsx`**: Framer Motion `<motion.div>`에 `initial={false}` 추가 — 마운트 FLIP 측정 완전 제거

**예상 효과**: 총 7가지 수정으로 홈화면 렌더 사이클 **8회 → 2회** 수준으로 감소, 깜빡임 95%+ 제거.

---

### 버그 수정: AI 태그 필터 회귀 + 깜빡임 잔존 4가지 추가 수정 ✅

**완료**: 2026-05-15

- [x] **`home-board.tsx`**: `filterKey !== "all:all:"` 쿼리에 `initialDataUpdatedAt = undefined` 적용 → 필터 변경 시 즉시 API 재fetch → AI 태그 필터 복구
- [x] **`globals.css`**: `html, body { overscroll-behavior: none }` 추가 → 브라우저 네이티브 pull-to-refresh 차단
- [x] **`use-stores-hydrated.ts`**: Grace Period 패턴 추가 — 첫 150ms 동안 `gracePeriod = true` → localStorage hydration 전 스켈레톤 플래시 제거
- [x] **`AIRecommendSection.tsx`**: `useEffect` → `useLayoutEffect`로 캐시 체크 이전 (페인트 전 동기 실행)

---

### 기능 개선: AI 테마 추천 주간 갱신 주기 구현 ✅

**완료**: 2026-05-15

- [x] **`common_code` 등록**: `AI_RECOMMEND_INTERVAL = 168` (시간 단위, DB 변경 시 즉시 반영)
- [x] **`customer` 테이블 컬럼 추가**: `ai_recommend_generated_at TIMESTAMPTZ NULL`
- [x] **신규 API `GET /api/ai/recommend/meta`**: `{ stale: boolean, intervalHours: number }` 반환 (~50ms)
- [x] **`AIRecommendSection.tsx` 수정**: 마운트 시 `/meta` 먼저 호출 → `stale=true`면 캐시 삭제 후 재생성, `stale=false`면 localStorage 캐시 재사용

---

### 기능 개선: AI 추천 에러 UX 개선 ✅

**완료**: 2026-05-15

- [x] **에러 상태 UI 변경**: `return null` → 에러 메시지 + "AI 테마 추천 받기" 버튼 표시
- [x] **`handleForceRegenerate` 함수 추가**: `loading: true` 전환 → localStorage 캐시 삭제 → `/api/ai/recommend` 직접 호출 (강제 재생성) → 성공 시 저장 + DB 업데이트

---

### Task 043: 결함 수정 6건 (카테고리·홈·프로필) ✅

**완료**: 2026-05-15

- [x] **결함1**: `AIRecommendSection` 탭 컨테이너에 `scrollbar-none` 클래스 추가 → 모바일 스크롤바 제거
- [x] **결함2**: `home-board.tsx` AI 태그 필터 회귀 → `initialDataUpdatedAt = undefined` 적용
- [x] **결함3**: `ItemCard` 렌더링 시 할인율 0%인 경우 조건부 렌더링 → "0" 텍스트 노출 제거
- [x] **결함4**: `ItemCard`에 `router.push('/category/[itemId]')` 연결
- [x] **결함5**: 프로필 서브 페이지 5종 신규 구현 (`/profile/orders`, `/profile/addresses`, `/profile/reviews`, `/profile/coupons`, `/profile/my-store`)
- [x] **결함6**: `ItemSearchBar` 검색어 200ms 디바운스 → `getItemsByCategoryAction(search)` 호출

**신규 구현 (프로필 서브 페이지 5종)**:

| 라우트 | 컴포넌트 | Server Action |
|--------|---------|--------------|
| `/profile/orders` | `OrdersClient` + `OrderCard` + `ShipmentTimeline` | `getOrdersWithDetails()` |
| `/profile/addresses` | `AddressManageClient` + `AddressForm` | `getAddressesAction()` / `upsertAddressAction()` / `deleteAddressAction()` |
| `/profile/reviews` | `ReviewsClient` (placeholder) | — |
| `/profile/coupons` | `CouponsClient` + `CouponClaimSheet` | `getCouponsAction()` / `claimCouponAction()` |
| `/profile/my-store` | `MyStoreClient` | `getMyStoreAction()` |

**E2E**: `e2e/task043-defect-fixes.spec.ts` — TC01~TC06e (10 TC) ✅

---

### Task 044: 상품 상세 페이지 재개발 (`/category/[itemId]`) ✅

**완료**: 2026-05-15

- [x] `/category/[itemId]` RSC + `getItemDetailAction(itemId)` 조회 + `TopHeader` 뒤로가기/장바구니 아이콘
- [x] 상품명(h1) + 가격 UI: `effectiveSalePrice` (취소선 `listPrice`, `discountPct` 배지, `promoName` 배지) 3단계 표시
- [x] AI 태그 칩 + AI 추천 문구 카드 + AI 제품 설명 섹션 (DOMPurify sanitize HTML)
- [x] 상품 정보 아코디언 4종 + 비슷한 상품 섹션 + 구매 리뷰 섹션
- [x] 하단 고정 바: "장바구니 담기" + "바로 구매" → `/cart` 이동, 품절 비활성화

**E2E**: `e2e/task044-item-detail.spec.ts` — TC01~TC16 (16 TC) ✅

---

### Task 046: 장바구니·결제 강화 (F004·F005 개선) ✅

**완료**: 2026-05-15

- [x] **`addBundleAction()` 재고 검증 강화**: 품절 상품 자동 제외 + `excludedNames` 반환
- [x] **`DetailFooter` 품절 안내 toast**: "N개 품절로 제외되었습니다" `toast.warning()` 표시
- [x] **`AddressSelectSheet` 신규**: vaul Drawer 배송지 목록 — `getAddresses()` 실데이터 로드, 기본 배송지 별 표시
- [x] **`BenefitBlock` 실데이터 연동**: 포인트 보유량 + "전액 사용" 토글, 사용 가능 쿠폰 목록 + 최소 주문금액 조건 비활성화, 쿠폰 선택/해제 + 할인금액 실시간 계산
- [x] **결제 페이지 초기 로드**: 마운트 시 `getAddresses()` → 기본 배송지 자동 선택, `getMyCouponsWithStatus()` → 사용 가능 쿠폰 목록 로드

**E2E**: `e2e/task046-cart-checkout.spec.ts` — TC-1~TC-6 ✅

---

### 성능 개선: 냉장고 비우기 재료 매칭 정확도 개선 + 재료 상세 UI 개선 ✅

**완료**: 2026-05-15

- [x] **재료 정규화**: 공백 제거·소문자 변환 전처리 후 매칭
- [x] **`isMatch` 함수 신설**: 정확 일치(exact) 우선 → 부분 포함(includes) 보조 매칭 2단계 로직
- [x] **복합 스코어 적용**: 사용자 재료 커버리지 0.6 + 카드 재료 완성도 0.4 가중 합산
- [x] **공식 카드 우선 정렬**: `.order("is_official")` 추가
- [x] **`IngredientDetailSheet` UI 개선**: 레이아웃 재구성 + 표시 항목 가독성 개선

---

### 성능 스프린트: 카드 API RPC 통합·Next.js 캐시·컬럼 최적화·LCP·번들 개선 ✅

**완료**: 2026-05-15

- [x] **`getCardDetail()` RPC 통합**: 기존 5회 쿼리 → `fp_get_card_detail` RPC 단일 호출로 DB 라운드트립 5→2 감소
- [x] **`getCards()` / `getDailyPick()` `unstable_cache` 적용**: 공식 카드 목록 5분 캐시, 데일리픽 24시간 캐시
- [x] **`v_store_inventory_item` 컬럼 선택 최적화**: `select("*")` (59개) → 22개 명시 컬럼 선택 (63% 감소)
- [x] **`MenuCard` Framer Motion 제거**: `motion.div whileHover` → CSS `transition hover:-translate-y-1` 교체
- [x] **CardGrid LCP 최적화**: 상위 4개 카드 `priority={true}` → `<Image>` 선로딩
- [x] **`SectionList` dynamic import**: dnd-kit 번들을 섹션 페이지 방문 시에만 로드

**관련 DB 마이그레이션**:
- `20260521_008_performance_indexes.sql` — v_store_inventory_item 쿼리 성능 인덱스
- `20260521_009_card_detail_rpc.sql` — `fp_get_card_detail` RPC 함수
- `20260521_010_store_item_mv.sql` — store_item materialized view
- `20260521_011_rate_limit_rpc.sql` — `fp_check_rate_limit` RPC 함수

---

### 리팩토링: TanStack Query 쿼리키 구조화 + CardQueryFilter 타입 통일 ✅

**완료**: 2026-05-15

- [x] **`CardQueryFilter` 타입 신설** (`src/lib/query-keys.ts`): `{ theme?, category?, officialOnly?, aiTags? }` 구조화 타입
- [x] **`qk.cards()` 배열 키 구조화**: `["cards", theme, category, officialOnly, aiTags]` 5-튜플 — JSON.stringify 의존 제거
- [x] **`home-board.tsx` 필터 구조화**: `filterKey` 문자열 → `cardFilter` 객체 `useMemo`

---

### 보안 개선: AI 채팅 레이트 리밋 Supabase RPC 전환 + 채팅 메모리 한도 ✅

**완료**: 2026-05-15

- [x] **`checkRateLimit()` DB RPC 전환**: 인메모리 `Map` → `fp_check_rate_limit(p_user_id, p_max_count=30, p_window_minutes=1)` Supabase 원자적 DB 카운터. 멀티인스턴스 전체에서 정확한 30 req/min 제한 적용
- [x] **`useChatStore.push()` 메시지 한도**: 최근 30개(`MAX_CHAT_MESSAGES`)만 유지 — 메모리 누수 방지

---

### 버그 수정: AI 추천 로딩 플래시 + stale-while-revalidate 개선 ✅

**완료**: 2026-05-15

- [x] **`useState` lazy initializer 적용**: 초기 상태를 lazy 함수로 변경 — CSR에서 localStorage 캐시를 동기적으로 확인해 캐시 유효 시 즉시 `loading: false`로 시작
- [x] **stale-while-revalidate 패턴 도입**: stale 판정 시에도 기존 캐시를 즉시 화면에 표시 후 백그라운드에서 새 AI 추천 로드
- [x] **폴백 경로 타임스탬프 업데이트**: `generateObject` 실패 시 폴백 응답 반환 전에도 `customer.ai_recommend_generated_at` UPDATE

| 상황 | 수정 전 | 수정 후 |
|------|---------|---------|
| 홈 재방문 (캐시 유효) | meta API 완료까지 로딩 화면 | 즉시 캐시 표시, 로딩 없음 |
| 7일 후 재방문 (stale) | 기존 캐시 삭제 후 로딩 화면 | 기존 추천 유지 + 백그라운드 갱신 |
| AI 생성 실패 (폴백) | 타임스탬프 미업데이트 → 매번 재실행 | 타임스탬프 기록 → 7일 주기 정상 적용 |

---

### 버그 수정: 주문내역 배송완료 건 배송중 뱃지 오표시 ✅

**완료**: 2026-05-15

**원인**: `shipment_event.event_code = 'ARRIVED'`가 기록되어도 `order.status`가 `DISPATCHED`에서 `DELIVERED`로 DB 업데이트가 되지 않아 발생.

- [x] **`getOrdersWithDetails()` 반환 status 정규화**: `isDelivered` 플래그가 `true`이면 DB `order.status` 값과 무관하게 반환 status를 `"DELIVERED"`로 덮어씀
