# FreshPickAI 개발 로드맵

> 가족을 위한 AI 큐레이팅 장보기 — 다양한 테마 카드로 메뉴를 고르고, 재료를 바로바로 배송 받는 모바일 커머스.

---

## 진행 현황 (2026-05-16 업데이트 → Phase 0~4 MVP 완료 · Phase 5 서비스 성장 스프린트 시작)

| Phase | 상태 | 완료일 |
|-------|------|--------|
| **Phase 0: 프로젝트 기반 구축** (Task 001~004) | ✅ 완료 | 2026-05-06 |
| **Phase 1: UI/UX 디자인 시스템** (Task 005~015, 017) | ✅ 완료 | 2026-05-12 |
| **Phase 2: 데이터베이스 + API** (Task 016, 018~023) | ✅ 완료 | 2026-05-13 |
| **Phase 2.5: v_store_inventory_item 통합** (Task 048~054) | ✅ 완료 | 2026-05-14 |
| **Phase 3: AI 기능 + RAG 시스템** (Task 024~030, 037~041) | ✅ 완료 | 2026-05-14 |
| **Phase 4: 고급 기능 + 품질 + 배포** (Task 032~036, 042~044, 046) | ✅ 완료 (MVP) | 2026-05-15 |
| **Phase 4 잔여: 키즈 모드** (Task 031) | 🔜 진행 예정 | — |
| **Phase 5: 서비스 성장 + 운영 인프라** (Task 055~060) | 🔜 Sprint 6 | — |
| **Phase 6: 서비스 확장** (Task 061~063) | 🔜 Sprint 7+ | — |

> 📦 Phase 0~2 완료 태스크 전체 상세: [`docs/ROADMAP-freshpickai-v0.1.md`](./ROADMAP-freshpickai-v0.1.md)
> 📦 Phase 2.5~4 완료 태스크 전체 상세: [`docs/ROADMAP-freshpickai-v0.2.md`](./ROADMAP-freshpickai-v0.2.md)

---

## Phase 0~4 완료 요약

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
- 장바구니 Server Actions + 토스페이먼츠 Plan B 결제 콜백 라우트 + 주문 생성
- 카드 만들기 `createCardAction()` + 섹션 관리 CRUD + 신규 사용자 공식 섹션 자동 시드

### Phase 2.5: v_store_inventory_item 통합 (완료 2026-05-14)
- fp_wishlist 테이블 + ref_store_item_id uuid 변환 + fp_cards_by_ai_tags / fp_recommend_cards RPC
- StoreItemAiData / WishlistItem / resolveAiData() 4단계 가드레일 (full/partial/review/fallback)
- getCardDetail() liveData enrichment + calcHealthScoreWithAi() + IngredientDetailSheet
- 장바구니 live price join (fetchCartItemsAction) + prepareOrderAction 가격 위변조 검증 (±1원)
- matchIngredientToStoreItemAction() ILIKE+ai_tags 2단계 매칭 + 위저드 Step3 자동매칭
- AiTagFilter 컴포넌트 + fp_cards_by_ai_tags RPC 기반 카드 필터링
- Wishlist Server Actions 4종 + WishlistButton(낙관적 UI) + /wishlist 페이지

### Phase 3: AI 기능 + RAG 시스템 (완료 2026-05-14)
- 9 페르소나 컨텍스트 빌더 (buildPersonaContext) + 시스템 프롬프트 3종 + PreferenceForm
- AI 채팅 Route Handler (streamText, SSE) + addToMemo Tool + Haiku 분류 레이어 + 빠른칩
- AI 추천 5테마 generateObject (오늘의한끼·제철·프로모·재주문·신상) + sessionStorage 24h 캐시
- pgvector HNSW 인덱스 + embedText/embedBatch + backfill 스크립트 + 벡터 검색 3단계 폴백
- ToolLoopAgent 5도구 (searchItems·getUserContext·getInventory·addToCart·addToMemo)
- 시맨틱 캐시 (임베딩 유사도 0.95, 7일 TTL) + 자기보강 루프 + OpenTelemetry 연동
- 가족보드 Realtime 투표 (Supabase Postgres Changes) + 무비나이트 카드 자동 생성
- 카드 노트 3분류 (팁·후기·질문) + LLM Judge 자기보강 + 운영자 답글
- 재료 메타 103종 시드 + IngredientMetaBlock accordion + searchItems substitutes 연동
- 카드 외부 공유 (카카오 SDK + Web Share API) + OG 이미지 1200×630 + 비로그인 미리보기
- 카드 위저드 가이드 키워드 + AI 자동채움 병렬 + 검수 신청 체크박스
- 온보딩 진입 가드 (쿠키+DB fallback) + 실 카드 데이터 연동 + householdSize 버그 수정 + PWA 아이콘

### Phase 4: 고급 기능 + 품질 + 배포 MVP (완료 2026-05-14~15)
- 드래그앤드롭 완성 (@dnd-kit) + AI 자동채움 섹션 24h 캐시 (Task 032)
- 이미지 최적화 + React Suspense 스트리밍 + 폰트 로컬 서빙 + Lighthouse 90+ (Task 033)
- Playwright E2E 골든 셋 69/71 TC + 9페르소나×10종 카드 300 assertions (Task 034)
- PWA Serwist Service Worker + WCAG AA + Sentry v10 + PostHog 6종 이벤트 (Task 035)
- GitHub Actions CI 3단계 + Vercel vercel.json + Supabase 마이그레이션 자동화 (Task 036)
- CookMode 타이머 + 북마크 시스템 + 냉장고 비우기 FridgeMode + ToolLoopAgent 확장 (Task 042)
- 결함 수정 6건 + 프로필 서브 페이지 5종 (Task 043)
- 상품 상세 페이지 재개발 — /category/[itemId] AI 데이터 풀 활용 (Task 044)
- 장바구니·결제 강화 — 품절 차단·배송지·쿠폰·포인트 실데이터 (Task 046)

### 추가 완료 스프린트 (2026-05-14~15)
- AI 모델 ID common_code 통합 관리 (8개 기능, 재배포 없이 DB 변경 적용)
- BrandHeader 리뉴얼 + BottomTabNav 카테고리 탭 + CategoryBrowser 신설 + 메모 편집 페이지
- HomeBoard Hydration 에러 수정 (useMemo → useState+useEffect)
- 모바일 홈화면 깜빡임 7가지 근본 수정 (useStoresHydrated + AIRecommendSection lazy init + Framer Motion initial={false})
- AI 태그 필터 회귀 수정 + Pull-to-Refresh 차단 + Grace Period 패턴 + useLayoutEffect 캐시 체크
- AI 테마 추천 주간 갱신 주기 (common_code AI_RECOMMEND_INTERVAL=168h, DB 타임스탬프 기반)
- AI 추천 에러 UX → 재시도 버튼 + handleForceRegenerate
- 냉장고 비우기 매칭 정확도 개선 (isMatch 2단계 + 복합 스코어 0.6/0.4 가중합산)
- 카드 API 성능 스프린트 (fp_get_card_detail RPC, unstable_cache, 컬럼 63% 축소, LCP 4장 priority)
- TanStack Query 쿼리키 구조화 (CardQueryFilter 5-튜플 배열 키)
- AI 채팅 레이트 리밋 fp_check_rate_limit RPC 전환 (멀티인스턴스 정확한 제한)
- AI 추천 로딩 플래시 수정 (lazy initializer + stale-while-revalidate + 폴백 타임스탬프)
- 주문내역 배송완료 뱃지 오표시 수정 (isDelivered 파생값 → status 정규화)

---

## 개요

FreshPickAI는 매일 저녁 메뉴 결정 마찰을 없애는 AI 큐레이팅 장보기 서비스입니다.

### 핵심 기능 (PRD F001 ~ F022)

| ID | 기능 | 우선순위 | 상태 |
|----|------|---------|------|
| F001 | 다양한 테마 카드메뉴 시스템 (10종) | P0 | ✅ 완료 |
| F002 | 카드 상세 + 건강·가격 인프라 | P0 | ✅ 완료 |
| F003 | AI 페르소나 채팅 추천 (RAG, 9 페르소나) | P0 | ✅ 완료 |
| F004 | 재료 장바구니 일괄 담기 | P0 | ✅ 완료 |
| F005 | 결제 (토스페이먼츠) | P0 | ✅ 완료 |
| F010 | 기본 인증 (카카오·애플 소셜 로그인) | P0 | ✅ 완료 |
| F011 | 우리가족 보드 (5개 섹션 + Realtime) | P1 | ✅ 완료 |
| F012 | 장보기 메모 (자연어 4-step 파싱) | P1 | ✅ 완료 |
| F013 | 카드 만들기 (4단계 위저드) | P1 | ✅ 완료 |
| F014 | 키즈·청소년 모드 | P1 | 🔜 Task 031 |
| F015 | 카드섹션 커스터마이징 (드래그앤드롭) | P1 | ✅ 완료 |
| F016 | 카드 사용자 노트 3분류 (BP1) | P1 | ✅ 완료 |
| F017 | 인터랙티브 조리 UX (BP2) | P2 | ✅ 완료 (Task 042) |
| F018 | 재료 메타 확장 (BP3) | P1 | ✅ 완료 |
| F019 | 온보딩 5장 슬라이드 (BP5) | P0 | ✅ 완료 |
| F020 | 냉장고 비우기 모드 (BP6) | P2 | ✅ 완료 (Task 042) |
| F021 | 카드 외부 공유 (BP7) | P1 | ✅ 완료 |
| F022 | 음식 마스터·레시피 RAG 시스템 | P0 | ✅ 완료 |

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

### Phase 4 잔여: 키즈 모드

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

### Phase 5: 서비스 성장 + 운영 인프라 (Sprint 6)

> **Sprint 6 (Week 7~8) · P1/P2**
> MVP 출시 후 사용자 재방문율 향상, 운영자 콘텐츠 관리, 고급 탐색 UX를 순서대로 구현합니다.

---

#### Task 055: FCM 푸시 알림 — 가족 참여 알림 시스템

**목적**: 가족 투표·무비나이트·배송 상태 변경을 실시간 푸시로 전달하여 가족 DAU 향상

**구현 항목**:

- [ ] **Firebase 프로젝트 연동**: `firebase-admin` SDK 서버 초기화, `FIREBASE_SERVICE_ACCOUNT` 환경변수 설정, Vercel 환경변수 등록
- [ ] **FCM 토큰 수집** (`src/lib/actions/push/fcm.ts`): 클라이언트 측 `getToken()` → `fp_user_profile.fcm_token` upsert, 앱 포그라운드·백그라운드 핸들러 분기
- [ ] **푸시 발송 Server Actions** (`src/lib/actions/push/send.ts`):
  - `sendFamilyVoteNotification(groupId, voterName, cardTitle)` — 가족 구성원에게 투표 독려 알림
  - `sendMovieNightNotification(groupId, cardTitle)` — 무비나이트 카드 생성 완료 알림
  - `sendDeliveryStatusNotification(userId, status, orderNumber)` — 배송 상태 변경 알림
- [ ] **알림 설정 페이지** (`src/app/(main)/profile/notifications/page.tsx`): 알림 타입별 ON/OFF 토글, `fp_user_notification_settings` 테이블 upsert
- [ ] **DB 마이그레이션**: `fp_user_profile.fcm_token TEXT` 컬럼 추가, `fp_user_notification_settings` 테이블 생성

**완료 기준**: 가족 투표 발생 시 구성원 모바일 푸시 수신, 알림 설정 ON/OFF 정상 동작

---

#### Task 056: 검색 + 필터 고도화 — 전문 검색 UX

**목적**: 카드 및 상품 통합 검색 자동완성 + 복합 필터 조합 UX 구현

**구현 항목**:

- [ ] **통합 검색 Route Handler** (`src/app/api/search/route.ts`):
  - `GET /api/search?q=&type=card|item|all` — 카드명·메뉴명 pg_trgm 유사도 + pgvector 의미 검색 병렬 실행
  - 결과 타입별 섹션 분리 반환 (`{ cards: [], items: [], total }`)
- [ ] **검색 자동완성 컴포넌트** (`src/components/search/SearchAutoComplete.tsx`):
  - 200ms 디바운스 → `/api/search?q=` 호출
  - 최근 검색어 localStorage 저장 (최대 10개)
  - 검색어 하이라이팅 (텍스트 매칭 볼드 처리)
- [ ] **복합 필터 패널** (`src/components/search/FilterPanel.tsx`):
  - 카드 타입 멀티셀렉트 (식사형·비식사형), 건강 태그 (비건·저GI·고단백 등), 예산 범위 슬라이더, 조리 시간 필터
  - 필터 상태 URL query params 동기화 → 공유 가능한 필터 URL
- [ ] **검색 결과 페이지** (`src/app/(main)/search/page.tsx`): 카드·상품 탭 분리, 무한 스크롤 페이지네이션

**완료 기준**: 검색어 입력 후 300ms 이내 자동완성 결과 표시, 복합 필터 조합 카드 정상 반환

---

#### Task 057: 영양분석 그래프 — 주간 섭취 시각화

**목적**: 주간 주문 이력 기반 영양 섭취 분석 시각화로 건강 페르소나(P2·P4·P7) 재방문율 향상

**구현 항목**:

- [ ] **영양 집계 Server Action** (`src/lib/actions/nutrition/weekly.ts`):
  - `getWeeklyNutritionSummary(userId, weekOffset?)` — `fp_order` → `fp_order_item` → `fp_dish_ingredient` → `v_store_inventory_item.ai_calories` JOIN 집계
  - 영양소 7종 (칼로리·단백질·탄수화물·지방·식이섬유·나트륨·당류) 일별 합산
  - AI 칼로리 데이터 없는 재료는 `fp_dish_ingredient.estimated_calories` 폴백
- [ ] **주간 영양 차트 컴포넌트** (`src/components/nutrition/WeeklyNutritionChart.tsx`):
  - Recharts `BarChart` 7일 칼로리 막대 그래프 + `RadarChart` 영양소 균형 레이더
  - 권장 섭취량 기준선 표시 (성별·나이 기반 `fp_user_preference` 조회)
  - 전주 대비 증감 배지 (예: "지난 주보다 탄수화물 12% 감소 🥗")
- [ ] **마이페이지 영양 섹션 추가** (`src/app/(main)/profile/nutrition/page.tsx`): 주차 탐색 (← →), 카드별 영양 기여도 Top3 표시

**완료 기준**: 주문 이력 있는 사용자 마이페이지에서 주간 영양 차트 정상 렌더링

---

#### Task 058: fp_dish_recipe 운영자 검수 큐 (manager-app 연동)

**목적**: `status='REVIEW_NEEDED'` 레시피·노트를 운영자가 검수 후 `ACTIVE` 승격하는 워크플로 구축

**구현 항목**:

- [ ] **검수 큐 조회 API** (`src/app/api/admin/review-queue/route.ts`):
  - `GET /api/admin/review-queue?type=recipe|note|substitute` — `fp_dish_recipe` / `fp_ai_review_queue` `status='REVIEW_NEEDED'` 목록 반환
  - `is_admin()` RPC 권한 체크 (관리자만 접근)
- [ ] **검수 액션 Server Actions** (`src/lib/actions/admin/review.ts`):
  - `approveRecipe(recipeId)` — `fp_dish_recipe.status = 'ACTIVE'` + `embedding` 재생성 큐 등록
  - `rejectRecipe(recipeId, reason)` — `status = 'REJECTED'` + `reject_reason` 기록
  - `approveSubstitute(queueId)` — `fp_ingredient_meta.substitutes` JSONB 업데이트
- [ ] **검수 UI** (`src/components/admin/ReviewQueuePanel.tsx`):
  - 카드별 레시피 원문 + 사용자 노트 + AI 신뢰도 점수 표시
  - [승인] / [반려] 버튼 + 반려 사유 입력 모달
  - 검수 완료 시 `fp_ai_review_queue.status = 'DONE'` 업데이트
- [ ] **어드민 라우트 보호**: `src/app/(admin)/` 레이아웃에 `is_admin()` 서버 체크 → 비관리자 403 리다이렉트

**완료 기준**: 관리자 계정으로 REVIEW_NEEDED 레시피 목록 조회 → 승인 시 ACTIVE 전환 확인

---

#### Task 059: OCR 메모 — 카메라 촬영 자동 파싱

**목적**: 종이 메모·마트 영수증을 카메라로 촬영해 장보기 메모로 자동 변환, 기존 메모 습관 사용자 온보딩 강화

**구현 항목**:

- [ ] **이미지 업로드 Route Handler** (`src/app/api/memo/ocr/route.ts`):
  - `POST /api/memo/ocr` (multipart/form-data) — Claude Haiku 4.5 Vision으로 이미지 내 텍스트 추출 (`extractTextFromImage`)
  - 추출 텍스트를 기존 `파싱 파이프라인 4-step`에 투입 → `fp_memo_item` 생성
  - Supabase Storage `memo-ocr-images` 버킷에 원본 이미지 저장 (30일 TTL)
- [ ] **카메라 입력 컴포넌트** (`src/components/memo/OCRCaptureButton.tsx`):
  - `<input type="file" accept="image/*" capture="environment">` — 모바일 후면 카메라 직접 실행
  - 촬영 후 미리보기 → 파싱 중 스켈레톤 → 파싱 결과 `ParsePreview`로 전달
  - 갤러리 업로드 폴백 (파일 선택)
- [ ] **메모 페이지 OCR 버튼 추가** (`src/app/(main)/memo/page.tsx`): 카메라 아이콘 버튼 → `OCRCaptureButton` 렌더

**완료 기준**: 사진 촬영 후 10초 이내 파싱 결과 표시, 일반 텍스트 메모와 동일한 장바구니 변환 동작

---

#### Task 060: 멀티 매장 가격 비교 — "다른 가게에서 더 싸요"

**목적**: 동일 재료의 타 매장 가격을 실시간 비교해 구매 전환율 및 사용자 신뢰도 향상

**구현 항목**:

- [ ] **매장 간 가격 비교 Server Action** (`src/lib/actions/store/price-compare.ts`):
  - `compareItemPriceAcrossStores(itemName, currentStoreId)` — `v_store_inventory_item` WHERE `item_name ILIKE` AND `store_id != currentStoreId` AND `is_in_stock = true` 조회
  - 동일 상품 판단 기준: `ai_tags` 교집합 ≥ 2개 + `item_name` pg_trgm 유사도 ≥ 0.7
  - 결과: `{ storeId, storeName, effectiveSalePrice, discountPct, thumbnailUrl }[]` (최대 3개 매장)
- [ ] **가격 비교 배지 컴포넌트** (`src/components/detail/PriceCompareBadge.tsx`):
  - 현재 매장보다 낮은 가격 매장 존재 시 "다른 가게에서 N원 더 싸요" 배지 표시
  - 클릭 시 비교 드로어 (`PriceCompareDrawer`) 오픈 — 매장별 가격 목록 + "이 가게로 담기" CTA
- [ ] **카드 상세 재료 행 통합** (`src/components/detail/IngredientRow.tsx`): `PriceCompareBadge` 연동
- [ ] **상품 상세 페이지 통합** (`/category/[itemId]`): 하단 가격 비교 섹션 추가

**완료 기준**: 재료 클릭 시 타 매장 가격 비교 드로어 표시, "이 가게로 담기" 클릭 시 기존 장바구니 항목 교체

---

### Phase 6: 서비스 확장 (Sprint 7+)

> **Sprint 7 이후 · P2**
> 구독형 수익 모델 및 고급 사용자 편의 기능을 구현합니다.

---

#### Task 061: 정기배송 — 주 1회 자동 주문 구독

**목적**: 주간 정기 메뉴 구독으로 예측 가능한 반복 수익 창출

**구현 항목**:

- [ ] **정기배송 구독 모델** (`fp_subscription` 테이블): `{ subscription_id, user_id, card_id, store_id, frequency, next_delivery_date, status }`
- [ ] **구독 Server Actions** (`src/lib/actions/subscription/index.ts`): `createSubscription()`, `pauseSubscription()`, `cancelSubscription()`, `getMySubscriptions()`
- [ ] **자동 주문 생성 Cron** (`src/app/api/cron/subscription/route.ts`): vercel.json 매일 오전 9시 실행 → 당일 배송 예정 구독 조회 → `createOrderFromSubscription()` 자동 실행
- [ ] **구독 관리 페이지** (`src/app/(main)/profile/subscriptions/page.tsx`): 구독 목록·다음 배송일·일시정지·취소 UI

**완료 기준**: 구독 생성 → 지정일 자동 주문 생성 + 결제 확인

---

#### Task 062: 음성 입력 — 마이크로 장보기 메모 입력

**목적**: "계란 두 판, 우유 하나" 음성 발화 → 장보기 메모 자동 생성

**구현 항목**:

- [ ] **Web Speech API 통합** (`src/components/memo/VoiceInputButton.tsx`): `SpeechRecognition` API (lang: 'ko-KR'), 음성 인식 중 실시간 텍스트 표시, 인식 완료 후 기존 4-step 파싱 파이프라인 투입
- [ ] **음성 인식 폴백** (`src/app/api/memo/speech/route.ts`): Web Speech API 미지원 브라우저 → `@anthropic-ai/sdk` Audio 트랜스크립션 폴백
- [ ] **메모 페이지 마이크 버튼 추가**: OCR 버튼 옆 마이크 아이콘 배치

**완료 기준**: 한국어 음성 인식 → 3초 이내 파싱 결과 표시

---

#### Task 063: 운영자 콘텐츠 관리 대시보드

**목적**: 카드 콘텐츠 품질 관리 및 사용자 이상 행동 모니터링 어드민 UI

**구현 항목**:

- [ ] **어드민 대시보드** (`src/app/(admin)/dashboard/page.tsx`): 일별 활성 사용자·주문 수·AI 비용 차트 (Recharts)
- [ ] **카드 콘텐츠 관리** (`src/app/(admin)/cards/page.tsx`): 카드 검수 큐 (Task 058 연동), 카드 활성화·비활성화 토글, 카드 태그 수동 편집
- [ ] **사용자 관리** (`src/app/(admin)/users/page.tsx`): 가입·탈퇴 현황, 페르소나별 분포 차트, 이상 행동 (레이트리밋 초과) 사용자 플래그

**완료 기준**: 관리자 계정 접속 시 대시보드 전체 지표 렌더링

---

## 출시 후 (P2) — 업데이트된 차기 계획

| 기능 | 설명 | Sprint |
|------|------|--------|
| **Task 031: 키즈 모드** | F014 아이 별점·학년별 필터 완성 | 4 잔여 |
| **Task 055: FCM 푸시 알림** | 가족 투표·무비나이트·배송 알림 | Sprint 6 |
| **Task 056: 검색 + 필터 고도화** | 통합 검색 자동완성·복합 필터 조합 | Sprint 6 |
| **Task 057: 영양분석 그래프** | 주간 영양 섭취 Recharts 시각화 | Sprint 6 |
| **Task 058: 운영자 검수 큐** | REVIEW_NEEDED 레시피 승인·반려 워크플로 | Sprint 6 |
| **Task 059: OCR 메모** | 카메라 촬영 → Claude Vision 자동 파싱 | Sprint 6 |
| **Task 060: 멀티 매장 가격 비교** | "다른 가게에서 더 싸요" 비교 배지 | Sprint 6 |
| **Task 061: 정기배송** | 주 1회 자동 주문 구독 모델 | Sprint 7 |
| **Task 062: 음성 입력** | 마이크로 장보기 메모 입력 | Sprint 7 |
| **Task 063: 운영자 대시보드** | 지표·콘텐츠·사용자 관리 어드민 UI | Sprint 7 |
