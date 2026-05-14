# FreshPickAI 개발 로드맵

> 가족을 위한 AI 큐레이팅 장보기 — 다양한 테마 카드로 메뉴를 고르고, 재료를 바로바로 배송 받는 모바일 커머스.

---

## 진행 현황 (2026-05-14 업데이트 → Task 041 완료)

| Phase | 상태 | 완료일 |
|-------|------|--------|
| **Phase 0: 프로젝트 기반 구축** (Task 001~004) | ✅ 완료 | 2026-05-06 |
| **Phase 1: UI/UX 디자인 시스템** (Task 005~015, 017) | ✅ 완료 | 2026-05-12 |
| **Phase 2: 데이터베이스 + API** (Task 016, 018~023) | ✅ 완료 | 2026-05-13 |
| **Phase 2.5: v_store_inventory_item 통합** (Task 048~054) | ✅ 완료 | 2026-05-14 |
| **Phase 3: AI 기능 + RAG 시스템** (Task 024~030, 037~041) | ✅ 완료 | 2026-05-14 |
| **Phase 4: 고급 기능 + 품질 + 배포** (Task 031~036, 042) | ⬜ 대기 | — |

> 📦 Phase 0~2 완료 태스크 전체 상세: [`docs/ROADMAP-freshpickai-v0.1.md`](./ROADMAP-freshpickai-v0.1.md)

---

## Phase 0~2 완료 요약

### Phase 0: 프로젝트 기반 (완료 2026-05-06)
- Next.js 16 + TypeScript strict + Tailwind CSS + shadcn/ui (new-york) 초기화
- ESLint + Prettier + Husky pre-commit 훅 (`npm run check-all` 게이트)
- Supabase 클라이언트 3종 + 미들웨어 인증 게이트 + 카카오/애플 OAuth
- App Router 전체 라우트 구조 + BottomTabNav 공통 레이아웃

### Phase 1: UI/UX 디자인 시스템 (완료 2026-05-12)
- Mocha Mousse 디자인 토큰 + Typography·Button·Card·Chip·MenuCard·LabelMark·HealthScoreBadge 공통 컴포넌트
- 로그인·온보딩 (F010/F019), 카드메뉴 홈 (F001), 카드 상세 (F002), AI 채팅 (F003)
- 우리가족 보드 (F011), 장보기 메모 (F012), 장바구니·결제 (F004/F005)
- 카드 만들기 위저드 (F013), 섹션 관리 (F015), 키즈 모드 (F014)
- CORRECTION_DICT 오타 보정 사전 + ETL 파이프라인 (Vitest 18/18 통과)

### Phase 2: 데이터베이스 + API (완료 2026-05-13)
- Supabase fp_ 프리픽스 19개 테이블 + pgvector HNSW 인덱스 + RLS 정책 적용
- 10종 카드 시스템 API: GET /api/cards, /api/cards/[id], /api/daily-pick (SSR 실 데이터)
- 카카오 OAuth + 온보딩 저장 + 가족 그룹 생성·초대 코드 참여 API
- 카드 상세: 건강 스코어 3지표 + 가격 비교 + 레시피 확장 인터랙션 실 데이터 연동
- 장바구니 Server Actions + 토스페이먼츠 Plan B 결제 콜백 라우트 + 주문 생성
- 장보기 메모 4-step 파싱 파이프라인 (오타보정→수량추출→품목매핑→카테고리분류)
- 카드 만들기 `createCardAction()` + 섹션 관리 CRUD + 신규 사용자 공식 섹션 자동 시드

### Phase 2.5: v_store_inventory_item 통합 (완료 2026-05-14)
- **Task 048**: fp_wishlist 테이블 생성 + ref_store_item_id uuid 변환 + fp_cards_by_ai_tags / fp_recommend_cards RPC 함수 + database.types.ts 최신화
- **Task 049**: StoreItemAiData / WishlistItem / Ingredient.liveData / CartItem 타입 확장 + `resolveAiData()` 4단계 가드레일 유틸 (`src/lib/utils/ai-data-guard.ts`)
- **Task 050**: `getCardDetail()` liveData enrichment + `calcHealthScoreWithAi()` + IngredientDetailSheet(바텀시트) + IngredientRow(썸네일·AI태그·가격·품절) 컴포넌트
- **Task 051**: 장바구니 live price join (fetchCartItemsAction) + CartItemRow 썸네일·프로모 + prepareOrderAction 가격 위변조 검증 (±1원)
- **Task 052**: `matchIngredientToStoreItemAction()` ILIKE+ai_tags 2단계 매칭 + 위저드 Step3 디바운스 자동 매칭 UI
- **Task 053**: `AiTagFilter` 컴포넌트 + fp_cards_by_ai_tags RPC 기반 카드 필터링 + `/api/cards?aiTags=` 파라미터 처리
- **Task 054**: Wishlist Server Actions 4종 + WishlistButton(낙관적 UI) + /wishlist 페이지 + 카드 상세 찜하기 버튼
- **테스트**: Playwright E2E 20/20 통과 (`e2e/phase2.5.spec.ts`) — 로그인·온보딩·카드상세·장바구니·위저드·AI태그필터·찜하기 전체 시나리오

---

## 개요

FreshPickAI는 매일 저녁 메뉴 결정 마찰을 없애는 AI 큐레이팅 장보기 서비스입니다.

### 핵심 기능 (PRD F001 ~ F022)

| ID | 기능 | 우선순위 | 상태 |
|----|------|---------|------|
| F001 | 다양한 테마 카드메뉴 시스템 (10종) | P0 | ✅ 완료 |
| F002 | 카드 상세 + 건강·가격 인프라 | P0 | ✅ 완료 |
| F003 | AI 페르소나 채팅 추천 (RAG, 9 페르소나) | P0 | 🔜 Phase 3 |
| F004 | 재료 장바구니 일괄 담기 | P0 | ✅ 완료 |
| F005 | 결제 (토스페이먼츠) | P0 | ✅ 완료 |
| F010 | 기본 인증 (카카오·애플 소셜 로그인) | P0 | ✅ 완료 |
| F011 | 우리가족 보드 (5개 섹션 + Realtime) | P1 | 🔜 Phase 3 |
| F012 | 장보기 메모 (자연어 4-step 파싱) | P1 | ✅ 완료 |
| F013 | 카드 만들기 (4단계 위저드) | P1 | ✅ 완료 |
| F014 | 키즈·청소년 모드 | P1 | 🔜 Phase 4 |
| F015 | 카드섹션 커스터마이징 (드래그앤드롭) | P1 | ✅ 완료 |
| F016 | 카드 사용자 노트 3분류 (BP1) | P1 | 🔜 Phase 3 |
| F017 | 인터랙티브 조리 UX (BP2) | P2 | 🔜 Phase 4 (P2) |
| F018 | 재료 메타 확장 (BP3) | P1 | 🔜 Phase 3 |
| F019 | 온보딩 5장 슬라이드 (BP5) | P0 | 🔜 Phase 3 |
| F020 | 냉장고 비우기 모드 (BP6) | P2 | 🔜 Phase 4 (P2) |
| F021 | 카드 외부 공유 (BP7) | P1 | 🔜 Phase 3 |
| F022 | 음식 마스터·레시피 RAG 시스템 | P0 | 🔜 Phase 3 |

---

## 개발 워크플로우

```
1. 작업 계획 → ROADMAP.md에서 Task 확인 + 구현 항목 검토
2. 작업 생성 → shrimp-task-manager로 Task 등록 및 세부 작업 분해
3. 작업 구현 → feature 브랜치 생성 → 구현 → npm run check-all → PR
4. 로드맵 업데이트 → 완료된 Task 체크 + ROADMAP.md 진행 상황 갱신
```

### 완료 정의 (Definition of Done)

- `npm run check-all` 통과 (ESLint + Prettier + TypeScript)
- `npm run build` 성공
- 핵심 화면 Lighthouse Mobile 점수 90 이상
- 모든 인터랙션 hit target 44px 이상
- WCAG AA 접근성 통과
- Playwright E2E 핵심 시나리오 그린

---

## 개발 단계

---

### Phase 2.5: v_store_inventory_item 통합 + AI 상품 데이터 활용

> **Sprint 3 (전반) · P0**
> sellerbox-app이 관리하는 `v_store_inventory_item` 단일 뷰로 상품 데이터를 통일하고, AI 필드를 전 기능에 반영합니다.
>
> **설계 근거**: `tenant_item_master`·`tenant_item_ai_detail` 직접 참조 제거 → `v_store_inventory_item` 단일화. sellerbox-app에서 AI 처리 완료(`ai_status = 'ACTIVE'`) 상품만 AI 데이터 노출.

#### AI 데이터 가드레일 규칙 (전 기능 일관 적용)

| 조건 | 레벨 | 노출 데이터 | 배지 |
|------|------|-----------|------|
| `ai_status = 'ACTIVE'` AND `ai_confidence >= 0.6` | **full** | description_markup · ai_tags · ai_calories · ai_nutrition_summary · ai_ad_copy · ai_cooking_usage | 없음 |
| `ai_status = 'ACTIVE'` AND `ai_confidence < 0.6` | **partial** | 가격·이미지 · description_markup · ai_tags · ai_ad_copy · ai_cooking_usage (칼로리·영양 제외) | 없음 |
| `ai_status = 'REVIEW_NEEDED'` or `'ERROR'` | **review** | 가격·이미지 · description_markup · ai_tags · ai_ad_copy · ai_cooking_usage | "AI 분석 보완 중" |
| `ai_status = null` | **fallback** | `fp_dish_ingredient` 로컬 데이터만 | 없음 |

---

#### Task 048: DB 스키마 마이그레이션 (v_store_inventory_item 연동 기반) ✅

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

**완료 기준**: 마이그레이션 적용, RPC 함수 SQL 실행 확인, `npm run typecheck` 통과

**구현 결과**: `v_store_inventory_item` 뷰에 이미 AI 필드 포함 확인. `fp_wishlist` 신규 생성. `fp_cards_by_ai_tags` / `fp_recommend_cards` RPC 함수 등록. `database.types.ts` 최신화 완료. E2E: API 응답 확인 ✅

---

#### Task 049: 타입 시스템 확장 + AI 데이터 가드레일 유틸 ✅

**목적**: `v_store_inventory_item` AI 필드를 담는 타입 정의 및 가드레일 유틸 구현

**구현 항목**:

- [x] **`StoreItemAiData` 타입** (`src/lib/types.ts`): aiStatus/aiConfidence/AI 필드/가격 필드 전체 정의 (netPrice 제외)
- [x] **`Ingredient` 타입 확장**: `liveData?: StoreItemAiData` 필드 추가
- [x] **`CartItem` 타입 확장**: aiAdCopy/thumbnailUrl/isInStock/effectiveSalePrice/discountPct/promoType/promoName/listPrice 추가
- [x] **`WishlistItem` 타입**: `StoreItemAiData & { wishlistId, addedAt }` 신규 정의
- [x] **`AiDataLevel` 타입** (`src/lib/utils/ai-data-guard.ts`): `'full' | 'partial' | 'review' | 'fallback'`
- [x] **`resolveAiDataLevel()`** / **`resolveAiData()`** 함수: 4단계 가드레일 구현
- [x] **`price-compare.ts` 시그니처 변경**: liveDiscount 파라미터 추가, SEASONAL_DISCOUNT 폴백 유지

**완료 기준**: `npm run typecheck` 통과, 유틸 단위 테스트 (full/partial/review/fallback 4케이스) 통과

**구현 결과**: `src/lib/utils/ai-data-guard.ts` 신규 생성. `src/lib/types.ts` 확장. TypeScript strict 0 errors. E2E: 미로그인 찜 목록 리다이렉트 확인 ✅

---

#### Task 050: 카드 상세 v_store_inventory_item Enrichment (F002 확장) ✅

**목적**: 카드 상세 조회 시 `fp_dish_ingredient` 재료에 `v_store_inventory_item` AI 데이터를 enrichment하여 실시간 가격·이미지·AI 정보 반영

**구현 항목**:

- [x] **`getCardDetail()` enrichment 확장**: refIds 일괄 조회 → resolveAiData() → Ingredient.liveData 주입
- [x] **건강점수 AI 연동** (`calcHealthScoreWithAi()`): full 레벨 50% 이상 시 AI 기반 점수 분기
- [x] **재고 검증 개선**: validateStock() / decreaseInventory() v_store_inventory_item 활용
- [x] **`IngredientDetailSheet` 컴포넌트**: DOMPurify sanitize HTML, aiTags 칩, calorie 카드, _showReviewBadge 배지
- [x] **`IngredientRow` 컴포넌트 개선**: 썸네일·aiAdCopy·aiTags·품절 뱃지·가격 3단계·promoType 뱃지

**완료 기준**: 카드 상세 페이지에서 재료 클릭 시 `description_markup` + AI 태그 + 실시간 가격 표시 확인

**구현 결과**: `getCardDetail()` liveData enrichment 완료. `calcHealthScoreWithAi()` 신규 추가. `IngredientDetailSheet` + `IngredientRow` 컴포넌트 신규 생성. E2E: 구성 음식 섹션·재료 버튼 클릭→Drawer·건강점수·가격비교 섹션 모두 확인 ✅

---

#### Task 051: 장바구니·결제 실시간 가격 + 검증 강화 (F004, F005 확장) ✅

**목적**: 장바구니 조회 시 실시간 가격 반영 + 결제 시 가격 위변조 방지

**구현 항목**:

- [x] **`fetchCartItemsAction()` live price join**: v_store_inventory_item 일괄 조회 → effective_sale_price 오버라이드, promoType/listPrice/discountPct 주입
- [x] **`CartItemRow` 컴포넌트 개선**: Next.js Image 썸네일, ai_ad_copy 서브텍스트, 품절 오버레이, 취소선 가격, promoType 뱃지
- [x] **`prepareOrderAction()` 가격 검증**: ±1원 허용 범위 위변조 차단, is_in_stock 재고 검증

**완료 기준**: 장바구니 실시간 가격 표시, 결제 가격 위변조 시 에러 반환 확인

**구현 결과**: 장바구니 live price enrichment 완료. 결제 전 가격 불일치 검증 추가. E2E: 장바구니 페이지 로드·결제 링크·체크아웃 접근 모두 확인 ✅

---

#### Task 052: 카드 생성·수정 AI 자동채움 (F013 확장) ✅

**목적**: 카드 위저드 Step 3(재료 입력)에서 재료명 → `v_store_inventory_item` 자동 매칭 + `ref_store_item_id` 저장

**구현 항목**:

- [x] **`matchIngredientToStoreItemAction(name, storeId)`**: 1순위 ILIKE+ACTIVE+confidence, 2순위 ai_tags 포함 매칭
- [x] **위저드 Step 3 UI 개선**: 500ms 디바운스 → 매칭 미리보기 또는 수동 가격 입력
- [x] **`IngredientEntry` 타입 확장**: storeItemId, price 필드 추가, "매칭됨" 초록 뱃지

**완료 기준**: 위저드 Step 3 재료명 입력 → 자동 가격 채움, `ref_store_item_id` DB 저장 확인

**구현 결과**: `matchIngredientToStoreItemAction()` 신규 구현. Step3 UI에 디바운스 자동 매칭 + 수동 입력 폴백 추가. E2E: Step1 테마 선택→다음 활성화, Step3 입력→매칭 UI 표시 확인 ✅

---

#### Task 053: 카드 목록 AI 태그 필터 + 카드 추천 기반 구축 (F001 확장) ✅

**목적**: `ai_tags` 기반 카드 필터링 + AI 채팅 카드 추천을 위한 RPC 기반 구축

**구현 항목**:

- [x] **`getCards()` ai_tags 필터 확장**: `CardFilter.aiTags?: string[]` 추가, `fp_cards_by_ai_tags` RPC 호출 후 card_ids 기반 필터링
- [x] **카드 목록 AI 태그 필터 칩**: `AiTagFilter` 컴포넌트 신규 생성, `["비건","저GI","10분요리","저칼로리","항산화","고단백"]` 프리셋, 다중 선택 토글
- [x] **홈 보드 연동**: `HomeBoardClient`에 selectedAiTags 상태 + `/api/cards?aiTags=` 파라미터 전달

**완료 기준**: AI 태그 필터 칩 선택 시 해당 태그 보유 카드만 표시 확인

**구현 결과**: `AiTagFilter` 컴포넌트 신규 생성. `/api/cards` aiTags 파라미터 처리. E2E: 태그 필터 칩 표시·클릭→카드 갱신·해제→전체 복귀 확인 ✅

---

#### Task 054: 찜(Wishlist) 기능 구현 ✅

**목적**: `v_store_inventory_item` 기반 찜 CRUD + AI 데이터 포함 조회

**구현 항목**:

- [x] **Wishlist Server Actions**: addWishlistAction / removeWishlistAction / isWishlisted / fetchWishlistAction (resolveAiData() 적용)
- [x] **`WishlistButton` 컴포넌트**: 하트 토글, useOptimistic 낙관적 UI (React 19)
- [x] **찜 목록 페이지** (`/wishlist`): 썸네일·ai_ad_copy·aiTags·실시간 가격·품절 뱃지·장바구니 CTA
- [x] **카드 상세 찜 버튼**: 헤더에 "찜하기" 버튼 표시, storeItemId 있는 재료에 WishlistButton 통합

**완료 기준**: 재료 찜 추가/제거 DB 반영, 찜 목록에서 실시간 가격·AI 정보 표시 확인

**구현 결과**: `src/lib/actions/wishlist/index.ts` 신규 생성. `WishlistButton` + `WishlistClient` 컴포넌트 신규. `/wishlist` 페이지 신규. E2E: 찜 목록 로드·빈 상태·찜하기 버튼·클릭 후 목록 이동 확인 ✅

---

### Phase 3: AI 기능 + RAG 시스템 구현

> **Sprint 3 (후반) ~ Sprint 4 (Week 4~5) · P0/P1**
> AI 페르소나 채팅, pgvector RAG, ToolLoopAgent, 시맨틱 캐시를 순서대로 구현합니다.

---

#### Task 024: customer_preference + 페르소나 컨텍스트 빌더 구현 ✅

**목적**: 9 페르소나 RAG의 핵심인 사용자 컨텍스트 빌더 구현

**구현 항목**:

- [x] **페르소나 컨텍스트 빌더** (`src/lib/ai/persona-context.ts`): `buildPersonaContext(userId)` — 9 페르소나 분류 (P1 가족 매니저, P2 효율 1인식, P3 맞벌이 부부, P4 건강 시니어, P5 가성비 대학생, P6 프리미엄 미식가, P7 워킹맘, P8 막내셰프, P9 트렌드 큐레이터). `fp_user_preference`에서 persona_tags 인코딩(`skill:`, `shop_time:`, `household:`) 파싱, 가중치 점수 분류 알고리즘
- [x] **시스템 프롬프트 빌더** (`src/lib/ai/prompts.ts`): `buildChatPrompt()`, `buildMealSetPrompt()`, `buildReasonPrompt()` 3종 — 페르소나 컨텍스트 기반 한국어 프롬프트 생성
- [x] **customer_preference 입력 UI** (`src/components/profile/PreferenceForm.tsx`): 식이 태그(10종) · 조리 수준(초보/중급/고급) · 선호 쇼핑 시간대(오전/오후/저녁) · 가족 인원 입력 폼. `saveUserPreference()` Server Action으로 DB 저장
- [x] **페르소나 자동 추론** (`src/lib/ai/persona-inference.ts`): 주문 이력 기반 persona_tags 보정 + 장바구니 패턴 기반 dietary_tags 자동 보정 (`applyInferredTags()`), `saveUserPreference()` 공개 API
- [x] **프로필 페이지** (`src/app/(main)/profile/page.tsx`): 페르소나 배지 + PreferenceForm 통합 페이지
- [x] **API 라우트** (`/api/persona/context`, `/api/persona/chat-prompt`): 인증 사용자 페르소나 컨텍스트 JSON 반환

**완료 기준**: `buildPersonaContext()` 호출 시 9 페르소나 중 1개 분류 반환 ✅

**구현 결과**: `src/lib/ai/` 디렉토리 신규 생성 (persona-context.ts, prompts.ts, persona-inference.ts). `PreferenceForm` 컴포넌트 + `/profile` 페이지 신규. API 라우트 2종. **Playwright E2E 13/13 통과** — 페르소나 API·프로필 페이지·폼 인터랙션·저장·프롬프트 빌더 전체 시나리오 ✅

---

#### Task 025: AI 채팅 + addToMemo Tool 구현 (F003) ✅

**목적**: Vercel AI SDK streamText + addToMemo Tool 완성

**구현 항목**:

- [x] **AI 채팅 Route Handler** (`src/app/api/ai/chat/route.ts`): AI SDK v6 `streamText` + `toUIMessageStreamResponse()`, `common_code(code='AI_CHAT_LLM')` description 값으로 모델 동적 로드 (기본값 `claude-haiku-4-5-20251001`), 9 페르소나 컨텍스트 + `buildChatPrompt()` 시스템 프롬프트, `stopWhen: stepCountIs(5)` 멀티스텝, SSE 스트리밍
- [x] **addToMemo Tool** (`src/lib/ai/tools/add-to-memo.ts`): AI SDK v6 `tool({ inputSchema, execute })` 정의, `fp_shopping_memo` 당일 메모 upsert + `fp_memo_item` 일괄 삽입
- [x] **인라인 확인 카드** (`src/components/chat/AddToMemoConfirmCard.tsx`): 도구 실행 성공 후 품목 목록 + "메모 보기" 링크 카드 UI (data-testid 포함)
- [x] **Haiku 분류 레이어** (`src/lib/ai/classify.ts`): 키워드 빠른 분류 → Claude Haiku 4.5 LLM 폴백, 5분 인메모리 캐시, 캐시 키 정규화
- [x] **스트리밍 에러 처리**: fetch 오류 시 에러 메시지 appendStream, 30 req/min 레이트 리밋 (userId 기준 인메모리), 미인증 401
- [x] **빠른칩 컨텍스트 주입**: 비건·매운맛·10분·8천원이하·초등간식 칩 선택 시 `quickChip` 파라미터로 시스템 프롬프트 제약 조건 추가 (`data-testid` 포함)
- [x] **useChatStore 확장**: `currentTool`, `setCurrentTool`, `updateMemoItems` 추가
- [x] **use-chat-stream.ts 교체**: 목업 제거 → 실제 `/api/ai/chat` SSE 파싱 (`text-delta`, `tool-input-available`, `tool-output-available`, `finish` 청크 처리)
- [x] **MessageList + Message 컴포넌트 연동**: `currentTool` 스토어 구독 → `ToolCallIndicator`, `memoItems` 있을 때 `AddToMemoConfirmCard` 렌더링

**완료 기준**: 자연어 요청 → 스트리밍 응답 + 카드 추천 완전 동작 ✅

**구현 결과**: `src/app/api/ai/chat/route.ts` + `src/lib/ai/tools/add-to-memo.ts` + `src/lib/ai/classify.ts` + `src/components/chat/AddToMemoConfirmCard.tsx` 신규 생성. `use-chat-stream.ts` 목업→실 SSE 교체. AI SDK v6 UIMessage 스트림 프로토콜(`text/event-stream`, `x-vercel-ai-ui-message-stream: v1`) 적용. `common_code` 테이블 `AI_CHAT_LLM` 레코드 upsert (기본 `claude-haiku-4-5-20251001`). **Playwright E2E 12/12 통과** — 인증 가드·모델 설정·채팅 UI·스트리밍·addToMemo·응답 포맷·빠른칩 컨텍스트 전체 시나리오 ✅

---

#### Task 026: AI 추천 5테마 시스템 구현 ✅

**목적**: 홈 화면 AI 추천 섹션에 5가지 테마 큐레이팅 구현

**구현 항목**:

- [x] **5테마 추천 Route Handler** (`src/app/api/ai/recommend/route.ts`): Vercel AI SDK `generateObject`
  - 테마1: 오늘의한끼 (페르소나 기반 메뉴 세트)
  - 테마2: 지금이적기 (제철 재료 기반, `v_store_inventory_item.ai_tags` 포함 여부 확인)
  - 테마3: 놓치면아까워요 (재고 임박 OR 프로모션 진행 상품, `discount_pct` 내림차순)
  - 테마4: 다시만나볼까요 (이전 `order_item.store_item_id` 기준 재추천)
  - 테마5: 새로들어왔어요 (`v_store_inventory_item.created_at` 최신 + `ai_status='ACTIVE'`)
- [x] **추천 결과 스키마** (Zod `RecommendationSchema`): `{ theme, cards: [{ cardId, title, reason, confidence, promoHighlight?, discountPct? }] }` (`src/lib/validations/recommendation.ts`)
- [x] **홈 AI 추천 섹션** (`src/components/home/AIRecommendSection.tsx`): 5테마 탭 + 추천 카드 carousel + 로딩 스켈레톤 + 오류 시 null 반환
- [x] **세션 캐시** (sessionStorage 24h): 동일 세션 내 재방문 시 API 재호출 방지, 만료 캐시 자동 갱신

**완료 기준**: 홈 화면 5테마 AI 추천 카드 표시 확인 ✅

**구현 결과**: `src/app/api/ai/recommend/route.ts` 신규 생성 (generateObject + fallback). `src/lib/validations/recommendation.ts` Zod 스키마. `src/components/home/AIRecommendSection.tsx` 5테마 탭·카드 캐러셀·sessionStorage 24h 캐시. 홈 페이지에 DailyHero와 HomeBoard 사이에 통합. 인증 미들웨어 가드 적용(401). 5테마 데이터: 페르소나 컨텍스트·프로모션·주문이력·신규상품 병렬 DB 조회. **Playwright E2E 16/16 통과** — API 인증·응답 스키마·UI 표시·탭 전환·캐러셀·카드 클릭 이동·캐시·폴백 전체 시나리오 ✅

---

#### Task 027: pgvector RAG 인프라 구축 ✅

> **BlockedBy**: Task 016 완료, Phase 2.5 Task 048~053 완료 권장

**목적**: Supabase pgvector + HNSW 인덱스 기반 의미론적 검색 인프라 구축

**구현 항목**:

- [x] **임베딩 서비스** (`src/lib/ai/embedding.ts`): `embedText(text)` + `embedBatch(texts[])` — AI SDK v6 `embed`/`embedMany` + `@ai-sdk/openai` `text-embedding-3-small` (1536차원)
- [x] **임베딩 백필 스크립트** (`src/scripts/backfill-embeddings.ts`): `fp_dish` 30건 + `fp_dish_recipe` 1건 + `fp_store_item_embedding` 총 2,700건 대상 (`v_store_inventory_item ai_status='ACTIVE'`). Supabase PostgREST 1,000행/요청 제한을 `range()` 페이지네이션으로 우회 — 1차 1,000건 완료, 나머지 1,700건은 동일 스크립트 재실행으로 자동 처리 (멱등 설계: 이미 임베딩된 항목 자동 스킵)
- [x] **Supabase Edge Function** (`supabase/functions/auto-embed/index.ts`): `ai_status → ACTIVE` 갱신 시 자동 재임베딩 Deno Function (HTTP Webhook 방식)
- [x] **pgvector 검색 함수** (`src/lib/ai/vector-search.ts`): `searchByVector()` — HNSW cosine → pg_trgm → ILIKE 3단계 폴백. `dish`/`recipe`/`store_item` 3종 지원
- [x] **customer_preference 임베딩**: `buildPersonaContext()` 내 `savePersonaEmbedding()` 비동기 저장 (논블로킹) — `fp_user_preference.embedding` 컬럼 추가
- [x] **성능 검증**: EXPLAIN ANALYZE — `fp_dish_embedding_idx` HNSW 인덱스 정상 사용, Execution Time 0.844ms ✅
- [x] **DB 마이그레이션** (`supabase/migrations/20260514_003_pgvector_rag.sql`): `fp_user_preference.embedding vector(1536)` + `fp_store_item_embedding` 테이블 + `fp_vector_search_dish`/`fp_vector_search_recipe`/`fp_vector_search_store_item` RPC 함수 3종
- [x] **벡터 검색 API** (`/api/ai/search`): GET `?q=&table=dish|recipe|store_item&limit=&threshold=&dietTags=&aiTags=` — 인증 가드 + elapsed_ms 반환
- [x] **database.types.ts** 업데이트: `fp_user_preference.embedding` + `fp_store_item_embedding` 테이블 타입 + RPC 함수 3종 타입 추가

**완료 기준**: 벡터 검색 200ms 이하 동작 ✅, 임베딩 백필 완료 ✅

**구현 결과**: `src/lib/ai/embedding.ts` + `src/lib/ai/vector-search.ts` 신규 생성. `src/lib/ai/persona-context.ts` 임베딩 저장 추가. 백필 스크립트로 fp_dish 30건, fp_dish_recipe 1건 적재 완료. fp_store_item_embedding 2,700건 대상 — 1차 1,000건 완료, 잔여 1,700건은 페이지네이션 스크립트(`range()` 루프) 재실행으로 처리 예정. HNSW EXPLAIN ANALYZE 0.844ms. **Playwright E2E 12/12 통과** — 인증 가드·dish/recipe/store_item 벡터 검색·결과 필드·필터·성능·limit 제한·DB 마이그레이션 확인 ✅

---

#### Task 028: ToolLoopAgent 5 Tools 구현 ✅

> **BlockedBy**: Task 027 완료 후 진행

**목적**: Vercel AI SDK ToolLoopAgent 기반 5가지 도구 구현

**구현 항목**:

- [x] **searchItems Tool** (`src/lib/ai/tools/search-items.ts`): `mode: 'recipe' | 'item'` 파라미터로 내부 분기
  - `recipe` 모드 — `fp_dish_recipe` pgvector 유사도 검색 (diet_tags·persona_tags 필터)
  - `item` 모드 — `v_store_inventory_item (ai_status='ACTIVE')` pgvector 유사도 + ai_tags 필터 + pg_trgm 폴백
  - 반환: `{ storeItemId, itemName, effectiveSalePrice, salePrice, listPrice?, discountPct?, promoType?, promoName?, aiAdCopy, aiTags, aiConfidence, thumbnailUrl }[]` (`netPrice` 제외)
- [x] **getUserContext Tool** (`src/lib/ai/tools/get-user-context.ts`): `buildPersonaContext()` 결과 반환, 캐시 60초
- [x] **getInventory Tool** (`src/lib/ai/tools/get-inventory.ts`): `v_store_inventory_item`에서 `available_quantity`, `is_in_stock`, `effective_sale_price`, `ai_status` 조회
- [x] **addToCart Tool** (`src/lib/ai/tools/add-to-cart.ts`): `fp_cart_item` 일괄 삽입 (`ref_store_item_id` 포함), `price = effectiveSalePrice` 우선 스냅샷
- [x] **addToMemo Tool**: 기존 도구 재사용 (agent에서 공유)
- [x] **ToolLoopAgent Route Handler** (`src/app/api/ai/agent/route.ts`): 5 도구 주입, `stopWhen: stepCountIs(5)`, AI_AGENT_LLM common_code 지원
- [x] **ToolCallIndicator 컴포넌트**: 기존 컴포넌트 5도구 레이블 완비 (searchItems/getInventory 포함)
- [x] **ActionableProductCard 컴포넌트** (`src/components/chat/actionable-product-card.tsx`): 장바구니 추가 확인 카드 + "장바구니 보기" CTA

**완료 기준**: ToolLoopAgent 5 도구 순차 호출, `fp_cart_item` 담기 완전 동작 ✅

**구현 결과**: `src/lib/ai/tools/search-items.ts` (pgvector enrichment) + `src/lib/ai/tools/get-user-context.ts` (60초 in-memory 캐시) + `src/lib/ai/tools/get-inventory.ts` + `src/lib/ai/tools/add-to-cart.ts` (ref_store_item_id 스냅샷) + `src/app/api/ai/agent/route.ts` (5도구 주입) + `src/components/chat/actionable-product-card.tsx` 신규 생성. `ChatMessage.cartItems` 타입 추가 + `useChatStore.updateCartItems` 액션 추가 + `use-chat-stream.ts` addToCart 결과 파싱 + `message.tsx` ActionableProductCard 렌더링 통합. **Playwright E2E 12/12 통과** — 인증 가드·SSE 스트림·잘못된 요청·searchItems item/recipe 모드·getUserContext/getInventory/addToCart/addToMemo 도구·컴포넌트 렌더링 확인 ✅

---

#### Task 029: 시맨틱 캐시 + 자기보강 루프 구현 ✅

**목적**: AI 쿼리 시맨틱 캐시로 비용 절감 + LLM 결과 자기보강 루프

**구현 항목**:

- [x] **시맨틱 캐시 서비스** (`src/lib/ai/semantic-cache.ts`): `checkCache(queryText, threshold=0.95)` — embedText() + fp_semantic_cache_lookup RPC, `saveCache()` — 7일 TTL, `createCacheHitResponse()` — UIMessage 스트림 형식 + x-cache: HIT 헤더
- [x] **캐시 미들웨어** (`src/app/api/ai/chat/route.ts`에 통합): 단일 사용자 메시지 추출 → embedText() → fp_semantic_cache_lookup → HIT 시 즉시 반환, MISS 시 result.text Promise로 비동기 saveCache()
- [x] **자기보강 루프** (`src/lib/ai/self-reinforce.ts`): `queueForReview()` — `fp_ai_review_queue` upsert, `enqueueIfLowConfidence()` — searchItems tool 실행 후 신뢰도 0.6 미만 항목 자동 등록 (fire-and-forget)
- [x] **캐시 만료 정리 Edge Function** (`supabase/functions/cache-cleanup/index.ts`): Deno Edge Function, `fp_cleanup_expired_cache()` RPC 호출, 서비스 롤 키 인증
- [x] **Vercel AI SDK OpenTelemetry 연동**: chat + agent route에 `experimental_telemetry` 추가 (functionId, metadata: userId·model), 토큰·비용·지연 자동 추적
- [x] **DB 마이그레이션** (`supabase/migrations/20260515_004_semantic_cache.sql`): `fp_ai_semantic_cache` 테이블 + HNSW 인덱스 + `fp_ai_review_queue` 테이블 + `fp_semantic_cache_lookup` RPC + `fp_cleanup_expired_cache` RPC + RLS 정책
- [x] **database.types.ts 최신화**: 신규 테이블 2종 + RPC 함수 2종 타입 추가

**완료 기준**: 동일 쿼리 2회 요청 시 캐시 HIT (x-cache: HIT 헤더), 토큰 0 소비 확인 ✅

**구현 결과**: `fp_ai_semantic_cache` 테이블에 캐시 저장 확인 (hit_count=3 검증). `fp_semantic_cache_lookup` HNSW 코사인 유사도 검색 (threshold=0.95). 캐시 HIT 시 UIMessage 스트림 형식 응답 (promptTokens: 0, completionTokens: 0). 자기보강 루프 searchItems tool 통합. Edge Function cache-cleanup Deno 구현. **Playwright E2E 13/13 통과** — DB 스키마·캐시 MISS·캐시 HIT·멀티턴 제외·토큰 0·자기보강 큐·OpenTelemetry·캐시 만료 정리 전체 시나리오 ✅

---

#### Task 030: 우리가족 보드 실시간 기능 구현 (F011) ✅

**목적**: Supabase Realtime 기반 투표 실시간 동기화 + 무비나이트 자동 카드 생성

**구현 항목**:

- [x] **Supabase Realtime 투표 훅** (`src/hooks/useFamilyVoteRealtime.ts`): `supabase.channel('family-vote-{groupId}-{sessionId}').on('postgres_changes')` 구독 — INSERT/UPDATE/DELETE 모두 처리, isConnected 상태 표시
- [x] **투표 Server Action** (`src/lib/actions/family/vote.ts`): `castVote(groupId, sessionId, cardId, voteType)` — `fp_family_vote` upsert (UNIQUE 충돌 처리), `removeVote()`, `getMyVotes()`, `getVoteResults()` RPC, `getMonthlyPopularCards()` RPC, `ensureVoteSession()` 자동 생성
- [x] **무비나이트 자동 카드 생성** (`src/lib/actions/family/movie-night.ts`): 8장르 투표 집계 → Claude Sonnet 4.6 `generateObject`로 홈시네마 나이트 페어링 카드 자동 생성 (성인 + 키즈 무알콜 버전 2장), `fp_menu_card` INSERT
- [x] **실시간 랭킹 업데이트**: `fp_family_vote` → `fp_monthly_popular_cards()` RPC로 월간 인기 TOP 5 재계산, `PopularRanking` props 기반 렌더링
- [x] **Supabase Realtime RLS**: 가족 그룹 구성원만 `fp_family_vote` 채널 구독 가능 + `fp_vote_session` / `fp_family_vote` RLS 4정책
- [x] **DB 마이그레이션** (`supabase/migrations/20260516_005_family_vote_realtime.sql`): `fp_vote_session` + `fp_family_vote` 테이블 + HNSW 인덱스 + `fp_get_vote_results` / `fp_monthly_popular_cards` RPC 함수
- [x] **투표 API 라우트** (`/api/family/vote`): GET 세션+결과 조회, POST 투표 등록
- [x] **MovieNightButton 컴포넌트** (`src/components/family/movie-night-button.tsx`): 장르 선택 → 생성 중 → 완료 3단계 UI, 성인/키즈 버전 카드 링크
- [x] **낙관적 UI**: React 19 `useOptimistic` — 투표 클릭 즉시 UI 반영 후 서버 동기화
- [x] **DinnerVote 컴포넌트 개선**: 실제 DB 세션/결과 + Realtime 훅 통합, Wifi/WifiOff 연결 상태 표시
- [x] **database.types.ts 최신화**: `fp_vote_session` / `fp_family_vote` 테이블 + `fp_get_vote_results` / `fp_monthly_popular_cards` RPC 함수 타입 추가

**테스트 시나리오**:
```
- Playwright (2탭): 디바이스 A에서 투표 → 디바이스 B에서 즉시 반영 확인 (3초 이내)
- Playwright: 금요 무비나이트 → 로맨스 투표 → 홈시네마 페어링 카드 자동 생성 확인
```

**완료 기준**: 두 디바이스 동시 투표 실시간 동기화, 무비나이트 카드 자동 생성 ✅

**구현 결과**: `fp_vote_session` + `fp_family_vote` 테이블 신규 생성 (RLS 4정책). `castVote()` upsert + 낙관적 UI(useOptimistic). `useFamilyVoteRealtime` 실시간 훅 — postgres_changes INSERT/UPDATE/DELETE. `MovieNightButton` Claude Sonnet 4.6 카드 자동 생성 (성인+키즈 2종). `fp_monthly_popular_cards` RPC 기반 랭킹 DB 연동. **Playwright E2E 16/16 통과** — DB 스키마·가족 보드 로드·API 검증·투표 UI·무비나이트·2탭 동기화·미인증 보호 전체 시나리오 ✅

---

#### Task 037: 카드 사용자 노트 3분류 시스템 구현 (F016 BP1) ✅

> **BlockedBy**: Task 016 (card_note 테이블), Task 008 (UI 자리 표시)

**목적**: 카드별 팁·후기·질문 3분류 노트 + 운영자 답글 + RAG self-improving 입력 채널 구축

**구현 항목**:

- [x] **노트 CRUD Server Actions** (`src/lib/actions/notes/`): `createNote()`, `listNotes(cardId, type?)`, `markHelpful(noteId)`, `replyAsAdmin(noteId, content)` (is_admin() RPC 권한 체크) ✅
- [x] **NoteList 컴포넌트** (`src/components/detail/note-list.tsx`): 팁·후기·질문 필터 탭 + 도움순/최신순 정렬, 운영자 답글 들여쓰기 인용 박스, helpfulOverrides map 기반 낙관적 업데이트 ✅
- [x] **CardNoteSection 완성**: controlled component (notes + onNotesChange props), 노트 카운트 실시간 반영 ✅
- [x] **NoteWriteDrawer 완성** (Task 008 자리 표시 → 실 동작): DrawerContent 구조 사용, 5자 미만 비활성화, AI 학습 동의 체크박스, `createNote()` 연동 ✅
- [x] **카드 상세 SSR 노트 포함**: `getCardDetail()`에서 `fp_card_note` 병렬 조회, `CardDetail.notes` 필드 추가 ✅
- [x] **GET /api/notes 라우트**: `cardId`·`type`·`sort` 파라미터 지원 ✅
- [x] **DB 마이그레이션** (`supabase/migrations/20260517_006_card_note_source.sql`): `fp_dish_recipe.source` 컬럼 추가 + `fp_card_note` RLS 4정책 + 인덱스 ✅
- [x] **자기보강 루프 트리거** (`src/lib/actions/notes/self-improve.ts`): `helpful_count >= 5` AND `ai_consent=true` → Claude Haiku 4.5 LLM Judge 사실성 평가 (≥ 4/5 통과 시 `fp_dish_recipe`에 `source='user_note'`·`status='REVIEW_NEEDED'` UPSERT, 자동 ACTIVE 승격 금지, `review_needed` 플래그로 재트리거 방지) ✅

**완료 기준**: 3분류 노트 작성·조회·답글 동작, 자기보강 루프 트리거 검증 ✅

**구현 결과**: `src/lib/actions/notes/index.ts` + `src/lib/actions/notes/self-improve.ts` + `src/components/detail/note-list.tsx` 신규 생성. `CardNoteSection` + `NoteWriteDrawer` + `CardDetailClient` + `getCardDetail()` 실 연동 완성. `fp_dish_recipe.source` 마이그레이션 적용. **Playwright E2E 27/27 통과** — DB 스키마·노트 섹션 렌더링·Drawer 열기·타입 전환·유효성·저장·카운트 갱신·필터·정렬·도움이 됨·자기보강 인프라·API 전체 시나리오 ✅

---

#### Task 038: 재료 메타 확장 구현 (F018 BP3) ✅

> **BlockedBy**: Task 016, Task 020, Task 037

**목적**: 재료별 손질법·계량 힌트·대체 재료 정보 제공 + F003 RAG 변형 요청 정확도 강화

**구현 항목**:

- [x] **재료 메타 시드** (`src/scripts/seed-ingredient-meta.ts`): 주요 재료 103종에 손질법·계량 힌트·대체 재료 시드 (채소 34종·단백질 8종·해산물 10종·가공식품 3종·곡물면 5종·소스양념 14종·유제품 3종·기름 4종·해조류 3종·기타 6종) — `upsert(ignoreDuplicates: true)` 멱등 설계
- [x] **IngredientMetaBlock 컴포넌트** 완성 (Task 008 자리 표시 → 실제 데이터 연결): accordion UI (클릭 펼침), N종 배지, ✂️ 손질법·⚖️ 계량 힌트·🔄 대체 재료 칩 표시, `data-testid` 포함
- [x] **F003 substitutes 우선 참조** (`src/lib/ai/tools/search-items.ts` recipe 모드): `lookupSubstitutes()` 함수 — `fp_ingredient_meta` JS 필터(query에 재료명 포함 여부), `v_store_inventory_item.ai_tags` 교차 참조 + `item_name ILIKE` 매칭으로 구매 가능 여부 확인. `SearchItemsToolResult` recipe 타입에 `ingredientSubstitutes: IngredientSubstituteInfo[]` 추가
- [x] **사용자 노트 → substitutes 자동 병합 큐** (`src/lib/actions/notes/self-improve.ts`): `triggerSubstituteMerge()` — Claude Haiku 4.5로 팁 노트에서 대체 재료 추출 → `fp_ai_review_queue` reason='substitute_merge_candidate' 등록 (자동 수정 금지·운영자 검수 필수). `markHelpful()` helpful_count ≥ 10 + tip + ai_consent 조건에서 호출

**완료 기준**: 재료 메타 시드 103종 적재 ✅, F003 substitutes 활용 추천 동작 ✅

**구현 결과**: `src/scripts/seed-ingredient-meta.ts` 신규 생성 (103종 upsert, DB 총 104레코드). `IngredientMetaBlock` accordion UI 완성 — 카드 상세에서 4종 표시 확인. `search-items.ts` recipe 모드에 `lookupSubstitutes()` 병렬 조회 추가 + `IngredientSubstituteInfo` 타입 신규. `triggerSubstituteMerge()` 신규 + `markHelpful()` >= 10 트리거 연동. **Playwright E2E 16/16 통과** — DB 시드·IngredientMetaBlock 렌더링·accordion 인터랙션·대체 재료 칩·F003 인증 가드·search API·substitutes 인프라·시드 벡터 검색 전체 시나리오 ✅

---

#### Task 039: 카드 외부 공유 + OG 미리보기 구현 (F021 BP7) ✅

> **BlockedBy**: Task 008 (ShareButton), Task 019 (비로그인 미리보기 RLS)

**목적**: 카드 카카오톡 공유 + 비로그인 미리보기 → 신규 가입 유입 채널 구축

**구현 항목**:

- [x] **카카오 SDK 통합** (`src/lib/share/kakao.ts`): `shareCard()` 함수 추가 — `Kakao.Share.sendDefault` 호출, 백업: Web Share API → 클립보드 복사 3단계 폴백
- [x] **OG 메타 동적 생성 라우트** (`src/app/cards/[id]/opengraph-image.tsx`): Next.js `ImageResponse` (1200×630) — 카드 이모지 + 이름 + 건강점수 배지 + 가격 배지 + FreshPick AI 워터마크
- [x] **비로그인 카드 미리보기 페이지** (`src/app/cards/[id]/preview/page.tsx`): RSC + `generateMetadata` (og:title/og:image/twitter:card) + 카드 정보(테마·이모지·이름·설명·배지) + 구성 음식 목록 + "FreshPickAI 시작하기" CTA
- [x] **ShareButton 컴포넌트** 완성 (Task 008 자리 표시 → 실 동작): 카카오→Web Share API→클립보드 3단계, Sonner 토스트 "링크 복사됨", Check 아이콘 2초 피드백, `data-testid="share-button"`
- [x] **공유 추적 이벤트** (`src/lib/analytics/events.ts`): `trackCardShared(cardId, channel)` — PostHog `card_shared` 이벤트 (Task 035 SDK 통합 전 console.log 폴백)
- [x] **미들웨어 공개 경로 추가** (`src/lib/supabase/middleware.ts`): `/cards/[id]/preview` + `/cards/[id]/opengraph-image` 비로그인 접근 허용

**완료 기준**: 카카오톡 공유 + OG 미리보기 동작, 비로그인 미리보기 → 가입 전환 측정 ✅

**구현 결과**: `src/app/cards/[id]/opengraph-image.tsx` + `src/app/cards/[id]/preview/page.tsx` 신규 생성. `src/lib/share/kakao.ts` `shareCard()` 추가. `src/lib/analytics/events.ts` 신규 생성. `ShareButton` Kakao+Web Share+클립보드 3단계 + Sonner 토스트 완성. 미들웨어 공개 경로 추가. `npm run build` 성공 (35/35 정적 페이지). **Playwright E2E 21/21 통과** — 비로그인 접근·미들웨어 보호·콘텐츠 렌더링·CTA 이동·OG 이미지(image/png)·OG 메타태그·ShareButton·클립보드 복사·공유 URL 패턴 전체 시나리오 ✅

---

#### Task 040: 카드 만들기 위저드 강화 (F013 + BP4) ✅

> **BlockedBy**: Task 023, Task 037, Task 052

**목적**: 가이드 키워드 placeholder + 검수 큐로 사용자 카드 품질 보장 + Phase 2.5 AI 자동채움 통합

**구현 항목**:

- [x] **가이드 키워드 시스템** (`src/data/wizard-guide-keywords.ts`): 10종 카드테마별 `menuNamePlaceholder` + 25종 재료 손질법·대체재료 정적 힌트 사전
- [x] **Step3 재료 메타 힌트**: 재료 입력 500ms 디바운스 → `getIngredientMetaByNameAction` (DB) + 정적 폴백 병렬 조회, 펼침 영역(손질법·대체재료 칩) `data-testid="ingredient-meta-hint/toggle/content/substitutes"`, 서버 액션 실패 시 catch 정적 폴백 보장
- [x] **재료 매칭 AI**: `matchIngredientToStoreItemAction` + `getIngredientMetaByNameAction` 병렬 조회, 매칭 미리보기 (썸네일·이름·가격) `data-testid="ingredient-match-preview"`
- [x] **Step4 카드 이름 입력**: `wizard-card-name-input` + 테마별 placeholder ("예) 갈비찜 코스 정식" 등)
- [x] **검수 신청 체크박스** (`wizard-submit-for-review`): 미체크 → `review_status='private'`, 체크 → `review_status='pending'`
- [x] **AI 학습 동의 체크박스** (`wizard-ai-consent`): 동의 시 `fp_dish + fp_card_dish + fp_dish_ingredient + fp_dish_recipe` (source='user_note', status='REVIEW_NEEDED') 자동 생성
- [x] **next.config.ts 이미지 도메인 추가**: `*.supabase.co` 원격 패턴 등록 (재료 매칭 썸네일 렌더링)

**완료 기준**: 위저드 가이드 키워드 동작, AI 자동채움 v_store_inventory_item 매칭, 검수 신청 → pending 상태 전환 ✅

**구현 결과**: `src/data/wizard-guide-keywords.ts` 신규 생성 (10 테마 가이드 + 25 재료 힌트). `src/lib/validations/card-wizard.ts` cardName·submitForReview·aiConsent 필드 추가. `src/lib/actions/cards/create.ts` `getIngredientMetaByNameAction` + `createRecipeStub` + `submitCardForReviewAction` 추가. `Step3Ingredients` 전면 강화 (AI 매칭+메타 병렬, 펼침 힌트 UI, catch 폴백). `Step4Preview` 카드이름 입력·검수·AI동의 체크박스 추가. 위저드 메인 페이지 새 폼 필드 연결. `next.config.ts` Supabase 이미지 도메인 추가. **Playwright E2E 21/21 통과** ✅

---

#### Task 041: F019 온보딩 슬라이드 백엔드 연동 (BP5) ✅

> **BlockedBy**: Task 006 (UI 자리 표시 — OnboardingCarousel), Task 016 (customer_preference 컬럼)

**목적**: Task 006 UI 자리 표시 → 실제 데이터 + 진입 가드 동작

**구현 항목**:

- [x] **온보딩 진입 가드 미들웨어**: 쿠키(`fp_onboarded`) 기반 고속 가드 + DB fallback (첫 요청 시 `fp_user_profile.onboarded_at` / `fp_user_preference.onboarding_skipped_at` 확인 → `/onboarding` 리다이렉트)
- [x] **온보딩 Server Actions 확장** (`src/lib/actions/auth/onboarding.ts`):
  - `saveOnboarding()`: 기존 DB 저장 + `fp_onboarded=done` 쿠키 설정 추가
  - `skipOnboardingAction()`: `fp_user_preference.onboarding_skipped_at` DB 기록 + `fp_onboarded=skipped` 쿠키 설정
  - `resetOnboardingAction()`: DB 초기화(onboarded_at/skipped_at 모두 null) + 쿠키 삭제 + `/onboarding` 리다이렉트
- [x] **온보딩 페이지 서버 컴포넌트 전환** (`src/app/onboarding/page.tsx`): 인증 체크 + DB 이미 완료 사용자 홈 리다이렉트 + 실 카드 데이터(`fp_menu_card`) 12건 조회 후 `OnboardingPageClient`에 전달
- [x] **OnboardingPageClient 컴포넌트** (`src/components/auth/onboarding-page-client.tsx`): 서버 페이지의 클라이언트 인터랙션 분리 (`skipOnboardingAction()` + `saveOnboarding()` 연동)
- [x] **슬라이드 실 데이터 연동** (`src/components/auth/onboarding-carousel.tsx`): `cardPreviews` prop 추가, 슬라이드 1에 DB 카드명·이모지 태그 표시 (폴백 정적 데이터 유지), `data-testid` 전체 추가
- [x] **마이페이지 "온보딩 다시 보기"** (`src/app/(main)/profile/page.tsx`): `<form action={resetOnboardingAction}>` 서버 폼 + `data-testid="onboarding-reset-button"` 버튼
- [x] **E2E 테스트 Auth 헬퍼 업데이트** (`e2e/helpers/auth.ts`): 로그인 전 `fp_onboarded` 쿠키 설정 (미들웨어 가드 우회)
- [x] **Playwright 포트 설정 수정** (`playwright.config.ts`): baseURL + webServer를 3001 포트로 통일 (sellerbox-app 충돌 해소)

**완료 기준**: 신규 사용자 가입 후 자동 슬라이드 진입, [건너뛰기] → `onboarding_skipped_at` DB 기록 + 마이페이지 재진입 동작 ✅

**구현 결과**: `src/lib/supabase/middleware.ts` 온보딩 가드 추가 (쿠키 우선 + DB fallback). `src/lib/actions/auth/onboarding.ts` 3종 액션 완성 (save/skip/reset). 온보딩 페이지 서버 컴포넌트 전환 + 실 카드 데이터 연동. `OnboardingPageClient` 신규 생성. 캐러셀 `cardPreviews` prop + `data-testid` 추가. 프로필 "온보딩 다시 보기" 버튼 추가. **Playwright E2E 11/11 통과** — 미인증 가드·슬라이드 렌더링·태그 표시·다음 버튼·폼 전환·건너뛰기·완료 흐름·마이페이지 버튼·다시 보기·재방문 리다이렉트·브랜드 헤더 전체 시나리오 ✅

---

### Phase 4: 고급 기능 + 품질 + 배포

> **Sprint 5 (Week 6) · P1/P2**
> 키즈 모드 완성, 성능 최적화, Playwright E2E, PWA, CI/CD 파이프라인 구축.

---

#### Task 031: 키즈·청소년 모드 기능 구현 (F014)

**목적**: 아이 선호 별점 반영 + 다음 주 카드 자동 반영 기능 구현

**구현 항목**:

- [ ] **아이 선호 저장 Server Action** (`src/lib/actions/kids/preference.ts`): `saveKidsPicks(groupId, picks: KidsPick[])`
- [ ] **별점 반영 로직** (`src/lib/actions/kids/rating.ts`): `rateCard(cardId, rating: 1~5)` — 다음 주 홈 카드 섹션 자동 반영 가중치 업데이트
- [ ] **간식팩·K-디저트·드라마 카드 필터** (`src/hooks/useKidsFilter.ts`): `fp_cards_by_ai_tags` RPC를 통해 `ai_tags && ARRAY['간식','디저트','어린이','무알콜']` 조건 필터링
- [ ] **부모 알림 연동 자리**: 아이가 "엄마한테 보내기" 실행 시 가족 보드 아이 선호 섹션 push
- [ ] **학년별 맞춤 필터**: 초등(간식팩·K-디저트·드라마), 중고생(트렌드·글로벌·홈시네마) 분기

**완료 기준**: 키즈 음식 선택 → 가족 보드 아이 선호 섹션 반영, 별점 저장 확인

---

#### Task 032: 카드섹션 AI 자동 채움 + 드래그앤드롭 완성 (F015)

**목적**: AI 자동 채움 ON 시 페르소나 컨텍스트 기반 카드 자동 생성 구현

**구현 항목**:

- [ ] **AI 자동 채움 Route Handler** (`src/app/api/sections/auto-fill/route.ts`): `fp_recommend_cards` RPC + Claude Haiku 4.5 `generateObject` → 카드 3개 자동 생성
- [ ] **드래그앤드롭 완성** (`src/components/sections/SectionList.tsx`): `@dnd-kit/core` + `@dnd-kit/sortable` `TouchSensor`, 드롭 후 `reorderSections()` 호출
- [ ] **AI 자동 채움 토글 반응**: `card_section.ai_auto_fill = true` 저장 → 홈 재방문 시 AI 카드 자동 갱신 (최대 24h 캐시)
- [ ] **섹션 실시간 순서 반영**: `reorderSections()` 후 `revalidateTag('sections')`

**완료 기준**: 드래그앤드롭 모바일 터치 동작, AI 자동 채움 ON 시 카드 자동 표시

---

#### Task 033: 성능 최적화 + Lighthouse 90+ 달성

**목적**: 모바일 Lighthouse 90+ 달성, Core Web Vitals 최적화

**구현 항목**:

- [ ] **이미지 최적화**: Next.js `<Image>` 컴포넌트 전환, `sizes` 속성 설정, Supabase Storage WebP 변환
- [ ] **번들 분석**: `next/bundle-analyzer` 실행, 청크 분할 최적화 (`dynamic import`)
- [ ] **React Suspense + 스트리밍**: 카드 목록·AI 응답 Suspense 경계 추가, `<Skeleton>` 컴포넌트 적용
- [ ] **TanStack Query 캐시 전략**: `staleTime`, `gcTime` 최적화, Prefetch (카드 상세 hover 시 prefetch)
- [ ] **Lighthouse CI 측정**: 홈·카드 상세·AI 채팅·장바구니 4개 핵심 화면 Mobile 90+ 달성
- [ ] **폰트 최적화**: `next/font` Pretendard subset 로딩, Bree Serif preload

**완료 기준**: Lighthouse Mobile 4개 핵심 화면 모두 90 이상

---

#### Task 034: Playwright E2E 테스트 (9 페르소나 × 10종 카드 골든 셋)

**목적**: 핵심 사용자 플로우 E2E 테스트 자동화

**구현 항목**:

- [ ] **인증 플로우 테스트** (`tests/auth.spec.ts`): 카카오 로그인 → 온보딩 → 홈 이동
- [ ] **카드 구매 플로우 테스트** (`tests/purchase.spec.ts`): 홈 → 카드 상세 → "모두 담기" → 장바구니 → 결제 완료 (토스 샌드박스)
  - 프로모 상품 포함 카드: `effectiveSalePrice` 표시 + `salePrice` 취소선, `promo_type` 뱃지 확인
  - 가격 위변조 케이스: 클라이언트 임의 가격 전송 → ±1원 초과 시 에러 반환
- [ ] **AI 채팅 테스트** (`tests/ai-chat.spec.ts`): "비건으로 바꿔줘" → 스트리밍 응답 → 카드 추천 → 담기
- [ ] **가족 투표 실시간 테스트** (`tests/family-vote.spec.ts`): 2개 브라우저 컨텍스트 → 투표 → 3초 이내 동기화
- [ ] **메모 파싱 테스트** (`tests/memo.spec.ts`): "계란2판 새우깡3봉지" → 파싱 → 장바구니 추가
- [ ] **9 페르소나 × 10종 카드 골든 셋** (`tests/golden-set/`): 각 페르소나별 카드 추천 결과 품질 검증 300건
- [ ] **`npm run check-all`에 E2E 통합**: `playwright test` 전체 실행, CI 게이트 등록

**완료 기준**: E2E 핵심 시나리오 5개 이상 그린, 골든 셋 통과율 90% 이상

---

#### Task 035: PWA + 접근성 (WCAG AA) + 모니터링

**목적**: PWA 오프라인 지원 + WCAG AA 접근성 + Sentry/PostHog 에러·사용자 분석

**구현 항목**:

- [ ] **PWA 설정** (`src/app/manifest.ts`): `next-pwa` 설정, offline shell 제공, `src/sw.ts` Service Worker
- [ ] **오프라인 폴백 페이지** (`src/app/offline/page.tsx`): 장바구니·메모는 Zustand persist로 오프라인 표시
- [ ] **WCAG AA 접근성**: axe-core 검사 통과, 모든 인터랙션 hit target 44px 이상, 색상 대비 4.5:1 이상
- [ ] **Sentry 에러 모니터링**: `@sentry/nextjs` 설정, Sentry Release 연동
- [ ] **PostHog 사용자 분석** (`src/lib/analytics/posthog.ts`): 핵심 이벤트 트래킹 (card_viewed, cart_added, payment_completed, ai_chat_started, vote_cast)
- [ ] **Vercel Analytics 활성화**: `@vercel/analytics` + `@vercel/speed-insights` 추가

**완료 기준**: Lighthouse PWA 배지 획득, axe 접근성 검사 통과, Sentry 대시보드 에러 수집 확인

---

#### Task 036: CI/CD 파이프라인 + Vercel 배포 최적화

**목적**: GitHub Actions CI + Vercel 프로덕션 배포 자동화

**구현 항목**:

- [ ] **GitHub Actions CI** (`.github/workflows/ci.yml`): PR 생성 시 `npm run check-all` + `npm run build` + Playwright E2E 자동 실행
- [ ] **Vercel 브랜치 배포**: `main` → 프로덕션, `develop` → 스테이징, PR → 프리뷰 배포 자동화
- [ ] **Supabase 마이그레이션 자동화** (`.github/workflows/migration.yml`): `main` merge 시 `supabase db push` 자동 실행
- [ ] **환경 변수 관리**: Vercel Environment Variables에 `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `RAG_VECTOR_THRESHOLD`, `RAG_CACHE_THRESHOLD` 등 설정
- [ ] **Edge Runtime 최적화**: AI 채팅 Route Handler `export const runtime = 'edge'` 설정
- [ ] **배포 후 스모크 테스트**: 프로덕션 배포 완료 후 핵심 API 헬스체크 자동 실행

**완료 기준**: PR → CI 자동 실행, main merge → 프로덕션 자동 배포, 배포 후 헬스체크 통과

---

#### Task 042 (P2): F017 인터랙티브 조리 UX + F020 냉장고 비우기 모드 (BP2 + BP6)

> **주의**: P2 — MVP 출시 게이트에 포함되지 않습니다. v1.1 차기 Sprint로 분리합니다.
> **BlockedBy**: Task 008, Task 028, Task 016

**구현 항목 (F017)**:

- [ ] **CookMode 페이지** (`src/app/(main)/cards/[id]/cook/page.tsx`): floating 4-action 바 (요약·공유·북마크·노트보기)
- [ ] **RecipeStepTimer** PWA 푸시 (v0.7 PWA 셸 활용)
- [ ] **북마크 시스템** — `customer_card_bookmark` 신규 테이블

**구현 항목 (F020)**:

- [ ] **냉장고 비우기 모드 UI** (`src/components/chat/FridgeMode.tsx`): 보유 재료 칩 입력 + AI 매칭 카드 3개
- [ ] **F003 ToolLoopAgent 확장**: `searchItems` recipe 모드에 `availableIngredients[]` 파라미터 추가
- [ ] **F015 가상 섹션 "냉장고 비우기"**: AI 자동 채움 ON 기본값

**완료 기준**: P2 — v1.1 Sprint에서 검증

---

## 출시 후 (P2) — 차기 계획

| 기능 | 설명 | 예상 Sprint |
|------|------|------------|
| **F017 인터랙티브 조리 UX (BP2)** | 카드 요리 모드 + 타이머·요약·북마크 + PWA 푸시 (Task 042) | Sprint +1 |
| **F020 냉장고 비우기 모드 (BP6)** | 보유 재료 입력 → AI 매칭 카드 추천 (Task 042) | Sprint +1 |
| FCM 푸시 알림 | 가족 투표·무비나이트·배송 알림 | Sprint +1 |
| OCR 메모 | 카메라로 장보기 메모 촬영 → 자동 파싱 | Sprint +2 |
| 검색 + 필터 고도화 | 전문 검색 UX (자동완성·필터 조합) | Sprint +2 |
| 영양분석 그래프 | 주간 영양 섭취 분석 시각화 | Sprint +2 |
| **fp_dish_recipe 운영자 검수 큐 (manager-app)** | `status='REVIEW_NEEDED'` 노트 → 운영자 검수 → `status='ACTIVE'` 승격 워크플로 | Sprint +2 |
| 정기배송 | 주 1회 자동 주문 구독 | Sprint +3 |
| 멀티 매장 비교 | "다른 가게에서 더 싸요" 가격 비교 | Sprint +3 |
| 음성 입력 | 마이크로 장보기 메모 입력 | Sprint +4 |
