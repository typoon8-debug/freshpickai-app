# FreshPickAI 개발 로드맵

> 가족을 위한 AI 큐레이팅 장보기 — 다양한 테마 카드로 메뉴를 고르고, 재료를 바로바로 배송 받는 모바일 커머스.

---

## 진행 현황 (2026-05-18 업데이트 → M018 gender·relationship DB 설계 + 페르소나 컨텍스트 보강 + 초대 수락 관계 선택 UX + PreferenceForm gender/familyRole 추가 + HOT-004 RAG 상태 표시 폴링 제거 + FIX-011 ChatBottomPanel 드래그 UX 통합 + MEMO-001 addToMemo 세션 기반 분리 + M019 fp_shopping_memo.session_id + UX-013 핸들바 클릭 토글 + FIX-012 svh 뷰포트 호환성)

| Phase | 상태 | 완료일 |
|-------|------|--------|
| **Phase 0: 프로젝트 기반 구축** (Task 001~004) | ✅ 완료 | 2026-05-06 |
| **Phase 1: UI/UX 디자인 시스템** (Task 005~015, 017) | ✅ 완료 | 2026-05-12 |
| **Phase 2: 데이터베이스 + API** (Task 016, 018~023) | ✅ 완료 | 2026-05-13 |
| **Phase 2.5: v_store_inventory_item 통합** (Task 048~054) | ✅ 완료 | 2026-05-14 |
| **Phase 3: AI 기능 + RAG 시스템** (Task 024~030, 037~041) | ✅ 완료 | 2026-05-14 |
| **Phase 4: 고급 기능 + 품질 + 배포** (Task 032~036, 042~044, 046) | ✅ 완료 (MVP) | 2026-05-15 |
| **Phase 4 잔여: 키즈 모드** (Task 031 → Task 069 통합) | ✅ 완료 (Task 069) | 2026-05-16 |
| **Phase 4.5: v0.3a AI 채팅 업그레이드** (Task 064~069) | ✅ 완료 (6/6) | 2026-05-16 |
| **Phase 4.5 보완: v0.3a 가족 기능 + 인증 개선** (FIX-001~009) | ✅ 완료 | 2026-05-17 |
| **PERF: 모바일 성능 최적화** (1~3단계 완료 / 4단계 대기) | 🚧 운영테스트 후 4단계 적용 예정 | 2026-05-17 (1~3단계) |
| **Phase 5: 서비스 성장 + 운영 인프라** (Task 055~060) | 🚧 Sprint 6 진행 중 (4/6 완료) | — |
| **FIX-010: gender·relationship 설계** (M018) | ✅ 완료 | 2026-05-18 |
| **HOT-004: RAG 상태 표시 개선** (폴링 제거) | ✅ 완료 | 2026-05-18 |
| **FIX-011: ChatBottomPanel 드래그 UX 통합** | ✅ 완료 | 2026-05-18 |
| **MEMO-001: addToMemo 세션 기반 분리 + M019** | ✅ 완료 | 2026-05-18 |
| **UX-013: 핸들바 클릭 토글 + ChevronUp/Down 레이블** | ✅ 완료 | 2026-05-18 |
| **FIX-012: dvh → svh 뷰포트 단위 iOS 호환성 수정** | ✅ 완료 | 2026-05-18 |
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

### v0.3a 결함 수정 (2026-05-16)
- **카테고리 장바구니 담기 FK 위반 수정**: `fp_cart_item.ingredient_id`에 `store_item_id`를 잘못 설정 → `fp_dish_ingredient` FK 제약 위반(23503) 발생. 3개 버튼 컴포넌트(`add-to-cart-button`, `item-detail-bottom-bar`, `quick-add-button`) 모두 `ingredientId: undefined`로 수정. 서버 액션 실패 시 Zustand 낙관적 업데이트 롤백(`remove`) 추가
- **상품 상세 헤더 장바구니 뱃지 추가**: 정적 Server Component 헤더를 `ItemDetailHeader` 클라이언트 컴포넌트로 교체 → Zustand 구독 기반 카운트 뱃지 표시

### v0.3a 보완 스프린트 (2026-05-17)

> 가족 기능 완성 + 실 데이터 연동 + 인증 흐름 end-to-end 개선

- **FIX-001 AI 채팅 메모 저장 RLS 우회**: streaming context에서 `createClient()` RLS 차단 → `createAdminClient()` 전환 (`add-to-memo.ts`). `fp_shopping_memo` / `fp_memo_item` INSERT 정상화
- **FIX-002 결제완료 배송 안내 수정**: 결제 성공 화면 "배송 예약 확인" 섹션 → "나의 프레시 → 주문/배송조회에서 확인하세요" 안내 UI로 교체 (`checkout/success/page.tsx`)
- **FIX-003 가족보드 실 통계 연동**: "47끼", "레벨 12" Mock 데이터 제거 → `getFamilyStatsAction()` 신설 (당월 `fp_order` COUNT + 평균 멤버 레벨). `FamilyBanner` props `mealsThisMonth={0}`, `level={1}` 기본값으로 교체
- **FIX-004 트렌딩카드 404 수정**: 폴백 카드 가짜 ID(c03, c05, c06) → 공식 `fp_menu_card` 5개 조회 후 상위 3개를 트렌딩 폴백으로 사용 (`family/page.tsx`)
- **FIX-005 카카오 초대코드 불일치 제거**: `FamilyInvite` 클라이언트 `useEffect`에서 랜덤 코드 생성 → DB 실코드(`invite_code`)만 표시. 코드 없을 때 비활성 메시지 → `CreateFamilyGroupForm`으로 교체
- **FIX-006 가족그룹 생성 진입점 신설**: `CreateFamilyGroupForm` 클라이언트 컴포넌트 신설 — "그룹 만들기" / "코드로 합류" 2탭. 그룹 생성 성공 후 `router.push('/family')` (refresh 대신 full navigation)
- **FIX-007 가족 전체 RLS 우회**: `fp_family_member` SELECT 정책이 순환 참조(자신을 멤버로 읽으려면 멤버여야 함) → `getFamilyGroup`, `getFamilyMembers`, `getFamilyStatsAction`, `removeFamilyMember`, `joinFamilyByInvite` 전부 `createAdminClient()`로 전환. `createFamilyGroup` INSERT + 멤버 INSERT 실패 시 그룹 롤백 처리 추가
- **FIX-008 로그인 `next` URL end-to-end 전파**: 초대 링크 → 로그인 → OAuth/이메일 → `/auth/confirm` → 초대 페이지 리다이렉트 전 구간 연결
  - `login/page.tsx`: `useSearchParams` → `next` 읽기 + 상대 경로 검증 → `SocialButtons` / `EmailLoginForm`으로 전달
  - `email-login-form.tsx`: `nextUrl` prop → `router.replace(nextUrl || "/")`
  - `social-buttons.tsx`: `nextUrl` → `signInWithKakao(nextUrl)` / `signInWithGoogle(nextUrl)` 전달
  - `kakao.ts`, `oauth.ts`: `redirectTo = /auth/confirm?next=<nextUrl>` 로 OAuth 콜백 URL 구성
  - `auth/confirm/route.ts`: `next` 쿼리 파라미터 읽기 → OTP/OAuth 성공 시 `nextPath` 리다이렉트, 온보딩 필요 시 `/onboarding?next=nextPath` 체인 보존
- **FIX-009 Sentry 지원중단 경고 수정**: `disableLogger` / `automaticVercelMonitors` deprecated 옵션 → `withSentryConfig` 내 `webpack` 옵션 구조로 이전 (`next.config.ts`)

### 채팅 UX + 메모 세션 분리 (2026-05-18)

- **FIX-011 ChatBottomPanel 드래그 UX 통합**: `ChatShell` 내 인라인 냉장고 버튼·`QuickChips`·`ChatInput`을 `ChatBottomPanel` 단일 컴포넌트로 통합. `@use-gesture/react` 드래그 핸들바(위↑ 펼침 / 아래↓ 50px 임계 접힘) + Framer Motion spring 애니메이션. AI 스트리밍 시작·메시지 전송 시 자동 접힘(`startTransition` 적용)
- **MEMO-001 addToMemo 세션 기반 분리**: `fp_shopping_memo`에 `session_id TEXT` 컬럼 추가 (M019 마이그레이션). 메모 조회 전략: ①세션 ID 일치 → ②타이틀 폴백 → ③신규 생성. `topic` 파라미터로 AI가 대화 맥락에서 주제 키워드 자동 추출 → 메모 제목 `AI 추천 장보기 (날짜) · 주제` 형태로 주제 분리
- **UX-013 핸들바 클릭 토글**: `ChatBottomPanel` 드래그 핸들바에 `onClick` 토글 추가. `ChevronDown/Up` 아이콘 + "접기/펼치기" 텍스트 레이블로 UI 상태 명시. 핸들바 높이 확장(`h-5 → h-8`)으로 탭 영역 확대
- **FIX-012 svh 뷰포트 호환성**: `ChatShell` 컨테이너 `100dvh → 100svh` 교체. iOS Safari에서 주소창 변화에 따른 레이아웃 흔들림 방지

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
| F014 | 키즈·청소년 모드 | P1 | ✅ 완료 (Task 069) |
| F015 | 카드섹션 커스터마이징 (드래그앤드롭) | P1 | ✅ 완료 |
| F016 | 카드 사용자 노트 3분류 (BP1) | P1 | ✅ 완료 |
| F017 | 인터랙티브 조리 UX (BP2) | P2 | ✅ 완료 (Task 042) |
| F018 | 재료 메타 확장 (BP3) | P1 | ✅ 완료 |
| F019 | 온보딩 5장 슬라이드 (BP5) | P0 | ✅ 완료 |
| F020 | 냉장고 비우기 모드 (BP6) | P2 | ✅ 완료 (Task 042) |
| F021 | 카드 외부 공유 (BP7) | P1 | ✅ 완료 |
| F022 | 음식 마스터·레시피 RAG 시스템 | P0 | ✅ 완료 |
| F032 | AI 채팅 3계층 맥락 메모리 | P0 | ✅ 완료 (Task 065) |
| F033 | 인텐트 기반 버튼 피드백 채널 | P0 | ✅ 완료 (Task 066) |
| F034 | AI 채팅 커머스 API 연동 | P0 | ✅ 완료 (Task 067) |
| F035 | 음성 입력 AI 채팅 Prototype | P1 | ✅ 완료 (Task 068) |

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

### Phase 4.5: v0.3a AI 채팅 업그레이드 (Sprint 5) ✅

> **Sprint 5 · P0 — 완료 2026-05-16**
> AI 채팅 맥락 이해 정확도 향상 + 버튼 피드백 + 커머스 API 연동 + 음성 입력 Prototype + 키즈 모드.
> **구현 순서**: 버그 수정 → 공통 기반(DB/타입) → F032 메모리 → F033 버튼 → F034 커머스 → F035 음성 → F014 키즈

---

#### Task 064: v0.3a 버그 수정 3종 + 공통 DB 마이그레이션 — 기반 준비

**목적**: 출시 버그 3종(결제·새로고침·배지)을 즉시 수정하고 v0.3a 신규 기능에 필요한 DB 테이블과 타입 기반을 먼저 구축

> **의존성**: 없음 — 최우선 실행

**구현 항목**:

- [x] **BUG-001 결제 콜백 수정** (`src/lib/actions/orders.ts`):
  - 토스페이먼츠 `paymentKey` 기반 멱등성 체크 추가 — `fp_order.payment_key` 중복 조회 후 이미 처리된 주문 즉시 반환
  - `checkout/success` 페이지: paymentKey + orderId + amount 3중 파라미터 검증 + rawPayload null 처리(이미 완료 취급)
  - `fp_cart_item` DELETE 확인 (기존 구현 유지, `confirmAndCreateOrderAction` Step 7)
- [x] **BUG-002 새로고침 Side Effect 수정**:
  - `src/lib/store.ts`: `useChatStore`에 `persist + createJSONStorage(sessionStorage)` + `partialize(messages만)` 추가 — 새로고침 후 채팅 기록 유지 (탭 닫기 시 초기화)
  - `src/components/home/AIRecommendSection.tsx`: 기존 `hasFetchedRef` 중복 방어 코드 확인 (이미 구현됨)
  - hydration 완료 전 AI 분석 트리거 차단 — `hasFetchedRef` + localStorage 캐시 조합으로 확인 완료
- [x] **BUG-003 할인 배지 -0% 오류 수정** (`src/components/home/AIRecommendSection.tsx`):
  - `rec.discountPct !== undefined && rec.discountPct > 0` 조건 가드 추가 — 0 이하 값 시 배지 렌더링 차단
- [x] **F032 DB 마이그레이션** (`supabase/migrations/20260522_012_v0.3a_chat_memory.sql`):
  - `fp_chat_message_raw` 테이블: message_id, customer_id, session_id, role CHECK('user'|'assistant'), content, created_at + TTL 주석
  - `fp_chat_session_summary` 테이블: summary_id, customer_id, session_id UNIQUE, summary_text, keywords text[], created_at
  - `fp_memory_items` 테이블: memory_id, customer_id, content, embedding vector(1536), source_session_id, importance_score float4, created_at + HNSW 코사인 인덱스
  - RLS 정책 3테이블 전체 적용 (SELECT/INSERT/UPDATE/DELETE)
- [x] **공통 타입 정의** (`src/lib/types.ts` 확장):
  - `ChatActionEnum` (9종: ADD_TO_WISHLIST, ADD_TO_CART, UPDATE_CART, REMOVE_FROM_CART, INITIATE_PAYMENT, VIEW_CARD, SEARCH_MORE, CONFIRM_YES, CONFIRM_NO)
  - `ChatActionIntent`: `{ action: ChatActionEnum; label: string; payload?: Record<string, unknown> }`
  - `RawMessage`, `SessionSummary`, `MemoryItem` 서브타입
  - `ChatMemoryContext`: `{ recentMessages; sessionSummaries; memoryItems }`

**완료 기준**: ✅ **Task 064 완료 (2026-05-22)**
- ✅ 결제 paymentKey 멱등성 체크 추가 → 새로고침 이중 결제 방지
- ✅ AI 채팅 sessionStorage persist → 새로고침 후 대화 기록 유지
- ✅ 할인율 0인 카드 `-0%` 배지 미표시 (discountPct > 0 가드)
- ✅ Supabase 마이그레이션 파일 생성 (`20260522_012_v0.3a_chat_memory.sql`) + 3테이블 정의
- ✅ Playwright E2E **10/10 TC** 통과
- ✅ `npm run build` 성공 + TypeScript 0 errors

---

#### Task 065: AI 채팅 3계층 맥락 메모리 시스템 백엔드 (F032)

**목적**: 단발성 채팅을 이전 대화 맥락을 기억하는 지속형 채팅으로 전환. 최근원문·대화요약·장기기억 3계층으로 정확도 향상

> **의존성**: Task 064 완료 (DB 테이블 신설)

**구현 항목**:

- [x] **메모리 조회 유틸리티** (`src/lib/chat/memory/retrieve.ts`):
  - `retrieveMemoryContext(customerId, currentQuery)`: 3계층 병렬 조회
    - Layer 1: `fp_chat_message_raw` 최근 10개 메시지 (최신순)
    - Layer 2: `fp_chat_session_summary` 최근 5개 세션 요약 (session_id 기준)
    - Layer 3: `fp_memory_items` pgvector 코사인 유사도 상위 5개 (`embedding <=> query_embedding < 0.4`)
  - 관련도 점수 계산: `importanceScore * (1 - cosineDist)` 합산 → 상위 N개 선택
  - 반환 타입: `ChatMemoryContext`
- [x] **메모리 저장 유틸리티** (`src/lib/chat/memory/store.ts`):
  - `saveRawMessage(customerId, sessionId, role, content)`: `fp_chat_message_raw` INSERT
  - `saveSessionSummary(customerId, sessionId, messages[])`: Claude Haiku 4.5로 대화 요약 + 키워드 추출 → `fp_chat_session_summary` UPSERT
  - `upsertMemoryItems(customerId, sessionId, summary)`: 요약에서 장기 기억 추출 + `embedText()` → `fp_memory_items` INSERT (중복 코사인 유사도 > 0.95 시 스킵)
  - 세션 종료 조건: 마지막 메시지로부터 30분 경과 또는 명시적 대화 종료
- [x] **Chat Route Handler 수정** (`src/app/api/ai/chat/route.ts`):
  - 요청 수신 → `retrieveMemoryContext()` 호출 → 메모리 컨텍스트를 시스템 프롬프트에 삽입
  - 메모리 컨텍스트 프롬프트 포맷: `[기억 요약] ... [최근 대화] ... [현재 질문]`
  - 응답 완료 후 `saveRawMessage()` user + assistant 양쪽 저장 (fire-and-forget)
  - `sessionId` 브라우저 세션당 UUID → `useChatStream`에서 생성·전송
- [x] **메모리 TTL 정리 Cron** (`src/app/api/cron/cleanup-chat-memory/route.ts`):
  - `DELETE FROM fp_chat_message_raw WHERE created_at < 30일 전`
  - `vercel.json` cron 등록: 매일 오전 3시 (KST, UTC 18:00)
- [x] **메모리 컨텍스트 디버그 UI** (개발 모드 전용, `src/components/chat/MemoryDebugPanel.tsx`):
  - `process.env.NODE_ENV === 'development'` 시에만 렌더링
  - 현재 요청에 삽입된 메모리 컨텍스트 3계층 확인 패널 (접힘 기본)
- [x] **pgvector RPC 마이그레이션** (`supabase/migrations/20260516_013_memory_search_rpc.sql`):
  - `fp_search_memory_items` 함수 생성 (SECURITY DEFINER, authenticated GRANT)

**테스트 체크리스트**:
- [x] 메모리 조회/저장 유틸 파일 구조 확인 (Playwright TC01~02)
- [x] pgvector RPC 마이그레이션 파일 존재 확인 (Playwright TC03)
- [x] Chat Route 메모리 통합 확인 (Playwright TC04)
- [x] cleanup-chat-memory cron route 존재 확인 (Playwright TC05~06)
- [x] useChatStream sessionId + updateIntents 연결 확인 (Playwright TC07~08)
- [x] vercel.json cron 등록 확인 (Playwright TC09)

**완료 기준**: ✅ **Task 065 완료 (2026-05-16)**
- ✅ 3계층 메모리 조회·저장 유틸리티 생성 (`retrieve.ts`, `store.ts`)
- ✅ Chat Route Handler 메모리 통합 (sessionId + formatMemoryContext 삽입)
- ✅ Haiku 기반 세션 요약 + 장기 기억 추출 파이프라인
- ✅ cleanup-chat-memory cron + vercel.json 등록
- ✅ Playwright E2E **9/9 TC** 통과 (TC01~09)
- ✅ `npm run build` 성공 + TypeScript 0 errors

---

#### Task 066: 인텐트 기반 버튼 피드백 채널 (F033)

**목적**: AI가 intent Enum만 생성하고, Action JSON Renderer가 버튼 UI를 렌더링. 모바일 타이핑 부담 최소화

> **의존성**: Task 064 완료 (ChatActionEnum 타입 정의)

**구현 항목**:

- [x] **LLM 응답 스키마** (`src/lib/chat/schema.ts`):
  - `ChatResponseSchema` (Zod): `{ message, intents, context }` — Zod v4 호환 방식
  - `ChatActionIntentSchema`: `{ action, label.max(20), payload.optional() }`
- [x] **suggestIntents AI 도구** (`src/lib/ai/tools/suggest-intents.ts`):
  - `streamText` 아키텍처 유지 — `tool()` 함수로 `suggestIntents` 도구 정의
  - `execute()` → `{ intents, success: true }` 반환 → SSE `tool-output-available` 이벤트로 클라이언트 수신
- [x] **Chat Route Handler 수정** (`src/app/api/ai/chat/route.ts`):
  - `suggestIntents` 도구 추가 + `INTENTS_RULE` 시스템 프롬프트 (상품 추천 → ADD_TO_CART/VIEW_CARD 등)
  - 9종 ChatActionEnum 생성 규칙 삽입
- [x] **Action JSON Renderer** (`src/components/chat/ActionButtonRenderer.tsx`):
  - `intents: ChatActionIntent[]` props → 9종 enum 아이콘·스타일 분기
  - `ADD_TO_CART` (Mocha Mousse), `ADD_TO_WISHLIST` (아웃라인), `INITIATE_PAYMENT` (그린), `CONFIRM_YES/NO` (그린/레드 쌍)
  - `min-h-[44px]` 모바일 터치 타겟, `aria-label` 접근성 적용
- [x] **AI 채팅 컴포넌트 통합** (`src/components/chat/message.tsx`):
  - assistant 메시지 하단에 `ActionButtonRenderer` 배치
  - intents 없을 때 렌더링 스킵
- [x] **버튼 탭 핸들러** (`src/app/(main)/chat/page.tsx`):
  - `handleActionSelect(intent)` → VIEW_CARD, ADD_TO_CART, ADD_TO_WISHLIST, INITIATE_PAYMENT, CONFIRM_YES/NO, SEARCH_MORE 분기 처리
- [x] **useChatStream 파서 확장** (`src/hooks/use-chat-stream.ts`):
  - `tool-output-available`에서 `output.intents` 파싱 → `updateIntents(aiId, intents)` 호출
- [x] **useChatStore updateIntents 액션** (`src/lib/store.ts`):
  - `updateIntents(msgId, intents)` → 메시지 intents 필드 갱신
- [x] **ChatMessage 타입 확장** (`src/lib/types.ts`):
  - `intents?: ChatActionIntent[]` 필드 추가

**테스트 체크리스트**:
- [x] ActionButtonRenderer 9종 enum 매핑 + 44px 타겟 확인 (Playwright TC10)
- [x] suggestIntents 도구 구조 확인 (Playwright TC11)
- [x] Chat Route suggestIntents 통합 확인 (Playwright TC12)
- [x] message.tsx ActionButtonRenderer 렌더링 통합 (Playwright TC13)
- [x] ChatPage handleActionSelect 분기 처리 (Playwright TC14)
- [x] schema.ts Zod 스키마 확인 (Playwright TC15)
- [x] ChatMessage intents 필드 확인 (Playwright TC16)
- [x] 채팅 페이지 로드 + UI 요소 브라우저 확인 (Playwright TC17)

**완료 기준**: ✅ **Task 066 완료 (2026-05-16)**
- ✅ suggestIntents 도구 + INTENTS_RULE 시스템 프롬프트 추가 (`streamText` 아키텍처 유지)
- ✅ ActionButtonRenderer 9종 enum 매핑 + Mocha Mousse 디자인 시스템 적용
- ✅ SSE 파서 `suggestIntents` 결과 → `updateIntents` 연결
- ✅ ChatPage `handleActionSelect` 6종 action 분기 처리
- ✅ Playwright E2E **8/8 TC** 통과 (TC10~17)
- ✅ `npm run build` 성공 + TypeScript 0 errors

---

#### Task 067: AI 채팅 커머스 API 연동 (F034)

**목적**: AI 채팅 버튼 탭 → 서비스 REST API 호출 → 찜/장바구니/결제 즉시 실행. 채팅 이탈 없이 구매까지 원스톱 처리

> **의존성**: Task 066 완료 (버튼 탭 핸들러)

**구현 항목**:

- [x] **찜 추가 API** (`src/app/api/wishlist/route.ts`):
  - `POST /api/wishlist` `{ itemId }` → `addWishlistAction` 호출 + 낙관적 UI 갱신용 응답
  - `DELETE /api/wishlist/[itemId]` → 찜 취소 (`removeWishlistAction`)
- [x] **장바구니 API** (`src/app/api/cart/route.ts`, `src/app/api/cart/[itemId]/route.ts`):
  - `POST /api/cart` `{ storeItemId, qty, name? }` → `v_store_inventory_item` 가격 조회 + `addBundleAction` 호출
  - `PATCH /api/cart/[itemId]` `{ qty }` → 수량 변경 (`setQtyAction`)
  - `DELETE /api/cart/[itemId]` → 개별 항목 삭제 (`removeItemAction`)
  - 품절 상품 `409 Conflict` 반환
- [x] **결제 준비 API** (`src/app/api/payment/initiate/route.ts`):
  - `POST /api/payment/initiate` → 장바구니 비어있으면 `409`, 있으면 `{ checkoutUrl: "/cart" }` 반환
- [x] **채팅 버튼 핸들러 API 연결** (`src/app/(main)/chat/page.tsx`):
  - `ADD_TO_CART` → Zustand 낙관적 업데이트 → `POST /api/cart` → 성공 시 `qk.cart()` TanStack Query 무효화, 실패 시 롤백
  - `ADD_TO_WISHLIST` → `POST /api/wishlist` + 성공/에러 토스트
  - `INITIATE_PAYMENT` → `POST /api/payment/initiate` → `checkoutUrl`로 라우팅
- [x] **버튼 로딩 스피너** (`src/components/chat/ActionButtonRenderer.tsx`):
  - `pendingKey` state로 버튼별 독립 로딩 상태 관리
  - 로딩 중 `Loader2` 스피너, 전체 버튼 `disabled` 처리 + `aria-busy`

**테스트 체크리스트**:
- [x] POST /api/cart — storeItemId 누락 시 400 반환 (Playwright TC01)
- [x] POST /api/cart — 존재하지 않는 storeItemId 409 반환 (Playwright TC02)
- [x] PATCH /api/cart/:id — qty 0 이하 400 반환 (Playwright TC03)
- [x] PATCH /api/cart/:id — 미존재 ID 200/422 반환 (Playwright TC04)
- [x] DELETE /api/cart/:id — 미존재 항목 삭제 (Playwright TC05)
- [x] POST /api/wishlist — itemId 없이 400 반환 (Playwright TC06)
- [x] POST /api/wishlist — 잘못된 itemId 응답 확인 (Playwright TC07)
- [x] DELETE /api/wishlist/:id — 찜 제거 요청 (Playwright TC08)
- [x] POST /api/payment/initiate — JSON 응답 확인 (Playwright TC09)
- [x] 채팅 페이지 정상 로드 + 입력창 표시 (Playwright TC10)
- [x] 미인증 API 요청 처리 (Playwright TC11)

**완료 기준**: ✅ **Task 067 완료 (2026-05-16)**
- ✅ 5개 REST API Route Handler 신설 (`/api/cart`, `/api/cart/[id]`, `/api/wishlist`, `/api/wishlist/[id]`, `/api/payment/initiate`)
- ✅ ActionButtonRenderer 버튼별 로딩 스피너 (`pendingKey` 상태 관리)
- ✅ chat/page.tsx Zustand 낙관적 업데이트 + TanStack Query 무효화 + 실패 롤백
- ✅ Playwright E2E **11/11 TC** 통과
- ✅ `npm run build` 성공 + TypeScript 0 errors

---

#### Task 068: 음성 입력 AI 채팅 Prototype (F035)

**목적**: Web Speech API 기반 음성 질의 → AI 채팅 전송 Prototype. 요리 중 핸즈프리 사용·어르신 진입 장벽 해소

> **의존성**: Task 066 완료 (채팅 UI 통합)

**구현 항목**:

- [x] **음성 인식 훅** (`src/hooks/useSpeechRecognition.ts`):
  - `SpeechRecognition` / `webkitSpeechRecognition` API 래핑 (lang: `'ko-KR'`, continuous: false, interimResults: true)
  - 상태: `idle | listening | processing | error`
  - 반환: `{ transcript, interimTranscript, isListening, startListening, stopListening, isSupported }`
  - 미지원 브라우저 폴백: `isSupported: false` → 마이크 버튼 비활성화 + 툴팁 표시
- [x] **음성 입력 버튼** (`src/components/chat/VoiceChatButton.tsx`):
  - 마이크 아이콘 FAB (Floating Action Button) — 채팅 입력창 오른쪽 배치
  - 상태별 UI:
    - `idle`: 마이크 아이콘 (회색)
    - `listening`: 빨간 점 + 파형 애니메이션 (Framer Motion) + "듣고 있어요..." 레이블
    - `processing`: 스피너
  - 탭 → `startListening()` / 재탭(listening 중) → `stopListening()`
  - 음성 인식 완료 → `transcript`를 채팅 입력창에 자동 삽입 후 자동 전송
- [x] **파형 애니메이션** (`src/components/chat/SoundWaveAnimation.tsx`):
  - Framer Motion 4개 바 높이 bounce 애니메이션 (stagger 0.1s)
  - 인식 중에만 표시
- [x] **채팅 입력 컴포넌트 통합** (`src/components/chat/chat-input.tsx`):
  - `VoiceChatButton` 배치, `useSpeechRecognition` 훅 연결
  - `interimTranscript` → 입력창 플레이스홀더에 실시간 표시 (회색 텍스트)
  - `transcript` 확정 → 자동 제출 (`onSend(transcript)`)
- [x] **접근성 처리**:
  - `aria-label="음성으로 입력하기"` 마이크 버튼
  - `role="status"` 실시간 인식 텍스트 영역

**테스트 체크리스트**:
- [x] 마이크 버튼 탭 → Mock Speech API "오늘 저녁 뭐 먹을까" 발화 → AI 채팅 자동 전송 확인 (Playwright TC06)
- [x] Web Speech API 미지원 환경에서 마이크 버튼 비활성화 + 툴팁 표시 확인 (Playwright TC02)
- [x] `npm run check-all` 통과 확인

**완료 기준**: ✅ **Task 068 완료 (2026-05-16)**
- ✅ `useSpeechRecognition` 훅 신설 — Web Speech API 래핑, ko-KR, idle/listening/processing/error 상태
- ✅ `VoiceChatButton` 신설 — FAB, 상태별 UI(파형/스피너/Mic/MicOff), "듣고 있어요..." 레이블
- ✅ `SoundWaveAnimation` 신설 — Framer Motion 4바 bounce 애니메이션 (stagger 0.1s)
- ✅ `chat-input.tsx` 통합 — VoiceChatButton 배치, interimTranscript placeholder, transcript 자동 전송
- ✅ 접근성: `aria-label="음성으로 입력하기"`, `aria-pressed`, `role="status"`
- ✅ 미지원 브라우저 graceful degradation (disabled + title 툴팁 + MicOff 아이콘)
- ✅ Playwright E2E **6/6 TC** 통과 (TC01~06)
- ✅ `npm run check-all` 통과 + TypeScript 0 errors + ESLint 0 errors

---

#### Task 069: 키즈·청소년 모드 구현 (F014) — Task 031 이월

**목적**: P8 초등·P9 청소년 전용 카드 필터 + 아이 별점 반영으로 가족 구성원 전체 커버리지 완성

> **의존성**: Task 064 완료 (공통 기반)
> **참고**: 기존 Task 031과 동일 목적. Phase 4.5에 통합하여 v0.3a에서 구현 완료

**구현 항목**:

- [x] **연령 그룹 필터 훅** (`src/hooks/useKidsFilter.ts`):
  - `fp_cards_by_ai_tags` RPC 호출 — 초등: `ai_tags && ARRAY['간식','디저트','어린이','무알콜']`, 청소년: `ai_tags && ARRAY['트렌디','글로벌','홈시네마']`
  - `AgeGroup` (ELEMENTARY | TEEN) 기반 필터 분기 — `familyRole("kid"→ELEMENTARY, "teen"→TEEN)` 매핑
  - `useKidsStore` 연동 — 선택된 아이 프로필 기준 자동 필터 적용
- [x] **키즈 탭 UI** (`src/components/home/KidsTabView.tsx`):
  - 초등 탭: 간식·디저트·어린이·무알콜 AI 태그 카드 필터 그리드
  - 청소년 탭: 트렌디·글로벌·홈시네마 AI 태그 카드 필터 그리드
  - 아이 프로필 선택 버튼 그룹 (가족 구성원 중 kid/teen 타입만)
- [x] **아이 별점 UI** (`src/components/family/KidsRating.tsx`):
  - 별 1~5개 탭 인터랙션 (터치 최적화, 44px hit target, `min-h/w-[44px]`)
  - `rateCard(cardId, memberId, rating)` Server Action 호출 + `useTransition` 비동기 처리
- [x] **별점 저장 Server Action** (`src/lib/actions/kids/rating.ts`):
  - `ensureKidsRatingSession(groupId)` — 그룹별 KIDS_RATING 전용 세션 생성/조회
  - `rateCard(cardId, memberId, rating)` → `fp_family_vote` UPSERT (vote_type: `KIDS_RATING_1`~`KIDS_RATING_5`)
  - `getKidsPreferredCards(groupId)` → 평균 별점 ≥ 4.0 카드 목록 반환
  - `getMyCardRating(groupId, cardId)` → 현재 사용자 별점 조회
- [x] **우리가족 보드 "우리 아이 선호" 섹션 연동** (`src/components/family/KidsPreferenceSection.tsx`):
  - TanStack Query `["kids-preferred", groupId]` 캐시로 선호 카드 목록 렌더링
  - 별점 저장 후 `queryClient.invalidateQueries` 호출로 실시간 갱신
  - `KidsPreferredCard` 타입 `src/lib/types.ts` 추가 + `qk.kidsPreferred()` 쿼리키 등록

**완료 기준**: ✅ **Task 069 완료 (2026-05-16)**
- ✅ 키즈 탭 카드 필터 동작 — 초등/청소년 탭 전환, fp_cards_by_ai_tags RPC 연동
- ✅ `KidsRating` 별점 컴포넌트 (44px hit target, 터치 최적화, useTransition)
- ✅ `rateCard` Server Action — fp_family_vote UPSERT (vote_type: KIDS_RATING_N 인코딩)
- ✅ `KidsPreferenceSection` — 가족 보드 "하준 선호 ⭐" 섹션, TanStack Query 실시간 갱신
- ✅ `"use server"` 타입 export 제거 → KidsPreferredCard를 types.ts로 이동
- ✅ Playwright E2E **6/6 TC** 통과 (TC01~06)
- ✅ `npm run typecheck` 0 errors + `npm run build` 성공

---

### Phase 5: 서비스 성장 + 운영 인프라 (Sprint 6)

> **Sprint 6 (Week 7~8) · P1/P2**
> MVP 출시 후 사용자 재방문율 향상, 운영자 콘텐츠 관리, 고급 탐색 UX를 순서대로 구현합니다.

---

#### Task 055: FCM 푸시 알림 — 가족 참여 알림 시스템 ✅

**목적**: 가족 투표·무비나이트·배송 상태 변경을 실시간 푸시로 전달하여 가족 DAU 향상

**구현 항목**:

- ✅ **Firebase 프로젝트 연동**: `firebase-admin` SDK 서버 초기화 (`src/lib/actions/push/firebase.ts`), `FIREBASE_SERVICE_ACCOUNT` 환경변수 설정
- ✅ **FCM 토큰 수집** (`src/lib/actions/push/fcm.ts`): `upsertFcmToken` / `clearFcmToken` Server Action, `useFcmToken` 훅으로 포그라운드·백그라운드 핸들러 분기, `FcmInitializer` 클라이언트 컴포넌트로 레이아웃 자동 등록
- ✅ **푸시 발송 Server Actions** (`src/lib/actions/push/send.ts`):
  - `sendPollCreatedNotification(groupId, pollId, creatorName, pollTitle)` — 투표 안건 생성 시 가족 전원 알림
  - `sendMovieNightNotification(groupId, cardTitle, cardId)` — 무비나이트 카드 생성 완료 알림
  - `sendDeliveryNotification(token, title, body, fpOrderId)` — 배송 상태 변경 알림 (단일 사용자)
  - `sendVoteReminderNotification(pollId, pollTitle, pendingMemberIds)` — 미투표 독려 알림
- ✅ **일반 투표 안건 시스템** (`src/lib/actions/family/poll.ts`): `fp_poll` + `fp_poll_vote` 테이블 기반, `createPoll` / `castPollVote` / `closePoll` / `getPollResults` / `sendPollReminder` Server Actions
- ✅ **투표 UI 컴포넌트**: `PollCreateSheet` (투표 안건 생성 폼), `PollCard` (실시간 진행 현황·결과·독려 버튼), `usePollRealtime` 훅 (Supabase Realtime postgres_changes 구독)
- ✅ **무비나이트 투표 연동**: `movie-night-button.tsx`에 "가족 투표 모드" 추가 — `createPoll(pollType: "movie_night")` → 투표 완료 → `closePoll()` → `triggerMovieNight(winner)` → FCM 알림 발송
- ✅ **배송 이벤트 Webhook** (`src/app/api/webhooks/shipment-event/route.ts`): sellerbox-app `shipment_event` INSERT → `fp_order.ref_order_id` 역추적 → `fp_order` 상태 동기화 → FCM 발송 (ASSIGNED/OUT/ARRIVED/FAILED 매핑)
- ✅ **알림 설정 페이지** (`src/app/(main)/profile/notifications/page.tsx`): 투표·무비나이트·배송 알림 ON/OFF 토글, `fp_user_notification_settings` upsert
- ✅ **DB 마이그레이션** (`supabase/migrations/20260517_014_task055_fcm_push.sql`): `fp_user_profile.fcm_token` 컬럼, `fp_user_notification_settings`, `fp_poll`, `fp_poll_vote` 테이블, `fp_get_poll_results` RPC, Realtime Publication 설정
- ✅ **Service Worker 확장** (`src/sw.ts`): `push` / `notificationclick` 이벤트 핸들러 추가 (백그라운드 FCM 수신)

**완료 기준**: 가족 투표 발생 시 구성원 모바일 푸시 수신, 알림 설정 ON/OFF 정상 동작
- ✅ `npm run check-all` 에러 0개 통과
- ✅ `npm run build` 빌드 성공
- ⚠️ **환경 설정 필요**: Supabase 대시보드에서 `20260517_014_task055_fcm_push.sql` 실행, Firebase 프로젝트 생성 후 `FIREBASE_SERVICE_ACCOUNT` / `NEXT_PUBLIC_FIREBASE_*` / `DELIVERY_WEBHOOK_SECRET` 환경변수 등록 필요

---

#### Task 056: 검색 + 필터 고도화 — 전문 검색 UX ✅

**목적**: 카드 및 상품 통합 검색 자동완성 + 복합 필터 조합 UX 구현

**구현 항목**:

- [x] **통합 검색 Route Handler** (`src/app/api/search/route.ts`):
  - `GET /api/search?q=&type=card|item|all` — 카드명·메뉴명 pg_trgm 유사도 + pgvector 의미 검색 병렬 실행
  - 결과 타입별 섹션 분리 반환 (`{ cards: [], items: [], total }`) — 공개 경로(미들웨어 isPublicPath 추가)
- [x] **검색 자동완성 컴포넌트** (`src/components/search/SearchAutoComplete.tsx`):
  - 200ms 디바운스 → `/api/search?q=` 호출
  - 최근 검색어 localStorage 저장 (최대 10개) — lazy initializer 패턴
  - 검색어 하이라이팅 (텍스트 매칭 볼드 처리)
- [x] **복합 필터 패널** (`src/components/search/FilterPanel.tsx`):
  - 카드 유형 멀티셀렉트 (식사형·간식형·홈시네마), 건강 태그 (비건·저GI·고단백 등), 조리 시간 필터
  - 필터 상태 URL query params 동기화 → 공유 가능한 필터 URL
- [x] **검색 결과 페이지** (`src/app/(main)/search/page.tsx`): 카드·상품 탭 분리, 필터 패널 토글

**완료 기준**: ✅ **Task 056 완료 (2026-05-17)**
- ✅ `/api/search` Route Handler — pg_trgm + pgvector 병렬 검색, 공개 경로 등록
- ✅ `SearchAutoComplete` — 200ms 디바운스, localStorage 최근 검색어, 하이라이팅
- ✅ `FilterPanel` — 유형·태그·조리시간 URL params 동기화
- ✅ `/search` 결과 페이지 — 전체/카드/상품 탭 + 필터 토글
- ✅ Playwright E2E **7/7 TC** 통과 (TC01~07)

---

#### Task 057: 영양분석 그래프 — 주간 섭취 시각화 ✅

**목적**: 주간 주문 이력 기반 영양 섭취 분석 시각화로 건강 페르소나(P2·P4·P7) 재방문율 향상

**구현 항목**:

- [x] **영양 집계 Server Action** (`src/lib/actions/nutrition/weekly.ts`):
  - `getWeeklyNutritionSummary(weekOffset?)` — `fp_order` → `fp_order_item` → `fp_dish_ingredient` → `v_store_inventory_item.ai_calories` JOIN 집계
  - 영양소 7종 (칼로리·단백질·탄수화물·지방·식이섬유·나트륨·당류) 일별 합산
  - AI 칼로리 없는 재료는 `estimated_calories` 폴백, 전주 대비 delta 계산
  - `fp_user_preference` 기반 일일 목표 (다이어트/근육증가 분기)
- [x] **주간 영양 차트 컴포넌트** (`src/components/nutrition/WeeklyNutritionChart.tsx`):
  - Recharts `BarChart` 7일 칼로리 막대 + 목표 기준선 + `RadarChart` 영양소 균형 레이더
  - 전주 대비 증감 배지 (칼로리·단백질·탄수화물·지방)
  - 칼로리 기여 Top3 카드 목록
- [x] **마이페이지 영양 섹션** (`src/app/(main)/profile/nutrition/page.tsx`): ← → 주차 탐색, `useTransition` 비동기 로딩
- [x] **프로필 메뉴 링크 추가** (`/profile/page.tsx`): MENU_ITEMS에 "영양 분석" href="/profile/nutrition" 추가
- [x] **recharts 설치**: `npm install recharts`

**완료 기준**: ✅ **Task 057 완료 (2026-05-17)**
- ✅ `getWeeklyNutritionSummary` Server Action — 7종 영양소 집계, 전주 delta, 목표 계산
- ✅ `WeeklyNutritionChart` — Recharts BarChart + RadarChart + Top3 카드
- ✅ `/profile/nutrition` 페이지 — 주차 탐색, 빈 상태 처리
- ✅ Playwright E2E **5/5 TC** 통과 (TC08~12)

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

#### Task 059: OCR 메모 — 카메라 촬영 자동 파싱 ✅

**목적**: 종이 메모·마트 영수증을 카메라로 촬영해 장보기 메모로 자동 변환, 기존 메모 습관 사용자 온보딩 강화

**구현 항목**:

- [x] **이미지 업로드 Route Handler** (`src/app/api/memo/ocr/route.ts`):
  - `POST /api/memo/ocr` (multipart/form-data) — Claude Haiku 4.5 Vision(`generateText` + `type:"image"`) 이미지 텍스트 추출
  - 추출 JSON 항목을 기존 `ParsedItem[]` 형태로 반환 → 메모 페이지 `handleParsed`에 직접 투입
  - Supabase Storage `memo-ocr-images` 버킷 원본 저장 (5MB 제한, JPEG/PNG/WEBP)
  - 인증 체크(401), 파일 없음(400), 항목 인식 실패(422) 에러 처리
- [x] **카메라 입력 컴포넌트** (`src/components/memo/OCRCaptureButton.tsx`):
  - `<input type="file" accept="image/*" capture="environment">` — 모바일 후면 카메라 직접 실행
  - 촬영 후 Image 미리보기 → 분석 중 스피너 오버레이 → `ParsePreview`로 전달
  - 갤러리 업로드 폴백 (파일 선택), 취소 버튼
- [x] **메모 페이지 OCR 버튼 추가** (`src/app/(main)/memo/page.tsx`): `OCRCaptureButton` 임포트·렌더링

**완료 기준**: ✅ **Task 059 완료 (2026-05-17)**
- ✅ Claude Haiku 4.5 Vision OCR — `generateText` + `mediaType` 이미지 파트
- ✅ `OCRCaptureButton` — 카메라 캡처, 미리보기, 스피너, aria-label
- ✅ `/memo` 페이지 통합 — `handleParsed` 콜백 재사용
- ✅ Playwright E2E **5/5 TC** 통과 (TC13~17)

---

#### Sprint 6 인앱 알림함 + 핫픽스 (2026-05-17)

> Task 055 보강 — in-app 알림 수신함 신설 + 가족 기능 런타임 버그 2건 수정

**인앱 알림 수신함 (`fp_notifications`)**
- DB 마이그레이션 `supabase/migrations/20260518_016_notifications_inbox.sql`:
  - `fp_notifications` 테이블 (type, `vote·movie_night·delivery·system`, title, body, link_url, is_read, read_at)
  - 미읽음 조회 인덱스 `fp_notifications_user_unread_idx` + RLS 정책 4종 (SELECT·INSERT·UPDATE + service_role INSERT)
  - Realtime Publication 등록 (`supabase_realtime ADD TABLE fp_notifications`)
- `getUnreadCount()` Server Action (`src/lib/actions/profile/notifications-inbox.ts`): 초기 미읽음 수 조회
- `useNotificationStore` (Zustand, `src/lib/store/notification-store.ts`): `unreadCount · setUnreadCount · increment · reset`
- `NotificationProvider` (`src/components/push/NotificationProvider.tsx`): Supabase Realtime postgres_changes 구독 → 신규 알림 INSERT 시 배지 카운트 자동 증가 · 로그아웃 시 배지 초기화

**핫픽스**
- **NotificationProvider 이중 구독 수정** (`src/components/push/NotificationProvider.tsx`): `onAuthStateChange`가 마운트 즉시 `SIGNED_IN` 발화 → `setup()` 2회 동시 호출 → 동일 채널명 이중 `.on()` 에러 발생. `subscribedUserId` 중복 가드 도입 + 명시적 `init()` 제거 후 `onAuthStateChange` 단일 진입점으로 재설계
- **PollCreateSheet Hydration 에러 수정** (`src/components/family/poll-create-sheet.tsx`): `SheetTrigger`(`@base-ui/react/dialog`)에 Radix UI 전용 `asChild` prop 사용 → `<button>` 내 `<button>` 중첩 Hydration 에러. Base UI `render` prop 패턴으로 교체 + `trigger` prop 타입 `ReactNode → ReactElement`
- **AI RAG 와이파이 아이콘 색상 미반영 수정** (`src/components/chat/chat-header.tsx`): `useRagStatus` 마운트 시 1회만 체크 + `currentTool` 미연동 → RAG 검색 중에도 와이파이 녹색 미반영. 30초 폴링 재확인 + `currentTool !== null` 조건으로 RAG 툴 활성화 시 `text-green-500 animate-pulse` 적용

---

#### F032 AI 채팅 메모리 시스템 보강 (2026-05-17)

> 서버 컴포넌트 전환 + 3계층 메모리 자동화 + 이전 세션 요약 UI

- **ChatPage 서버 컴포넌트 전환** (`src/app/(main)/chat/page.tsx`): 전체 클라이언트 로직을 `ChatShell` 클라이언트 컴포넌트로 분리. `getRecentChatHistory(30)` Server Action으로 DB 최근 기록 + `latestSummary` SSR 로드 → 탭 재진입·새로고침 시 최신 DB 기록 복원
- **Layer 2+3 자동 트리거** (`src/app/api/ai/chat/route.ts`): 대화 8턴(사용자+AI 합산)마다 `saveAndExtractMemory()` fire-and-forget 호출 → 세션 요약(Layer 2) + 장기 기억 추출(Layer 3) 자동화
- **`saveAndExtractMemory()` 통합 함수** (`src/lib/chat/memory/store.ts`): `saveSessionSummary()` + `upsertMemoryItems()` 두 단계를 단일 함수로 래핑. 오류 무시(non-throwing)
- **이전 세션 요약 배너** (`src/components/chat/message-list.tsx`): `latestSummary` props 추가 → DB 복원 대화가 있을 때 Mocha Mousse 배너 + 키워드 칩 표시
- **페이지 이탈 메모리 플러시** (`src/hooks/use-chat-stream.ts`): `beforeunload` 이벤트 → `navigator.sendBeacon("/api/ai/memory/flush")` 미저장 대화 자동 플러시
- **`initMessages()` 스토어 액션** (`src/lib/store.ts`): DB 기록을 sessionStorage보다 우선 복원하는 액션 추가

---

#### PWA 설치 배너 UX 개선 (2026-05-17)

> 모바일 사용자 홈 화면 설치 유도 — Android 네이티브 프롬프트 + iOS Safari 가이드 모달

- **`usePwaInstall` 훅** (`src/hooks/usePwaInstall.ts`): `BeforeInstallPromptEvent` 캡처(Android Chrome), iOS Safari UA 감지, `display-mode: standalone` 설치 완료 감지, localStorage 7일 닫기 기억(`pwa-install-dismissed` 키)
- **`InstallBanner` 컴포넌트** (`src/components/pwa/install-banner.tsx`): 모바일 하단 고정 배너 (z-50, safe-area-pb). Android → 네이티브 `prompt()` 설치 플로우. iOS → "Safari 공유 → 홈 화면에 추가 → 추가" 3단계 가이드 Bottom Sheet 모달. 닫기 시 7일 재노출 억제
- **레이아웃 전역 배치** (`src/app/layout.tsx`): `<InstallBanner />` 삽입 → 전체 페이지에서 설치 배너 활성화
- **프로필 AI 메뉴 추가** (`src/app/(main)/profile/page.tsx`): "AI 기억 관리" (`/profile/ai-memory`) + "대화 히스토리" (`/profile/chat-history`) 링크 추가

---

#### FIX-010: gender·relationship 설계 변경 + 페르소나 컨텍스트 보강 (2026-05-18) ✅

> **목적**: AI 페르소나 추천 정확도 향상 + 초대 수락 시 가족 관계 선택 UX 구현

**M018 DB 마이그레이션** (`supabase/migrations/20260518_018_gender_relationship.sql`)

- `fp_user_profile.gender` 컬럼 추가 (`male|female|other`, NULL 허용) — 마이페이지 선호설정에서 CRUD, AI 페르소나 분류에 반영
- `fp_family_member.relationship` 컬럼 추가 (`NOT NULL DEFAULT 'other'`, 13종 Enum 체크) — 초대 수락 시 사용자 직접 선택

**공통 상수 모듈 신설** (`src/lib/constants/relationship.ts`)

- `RelationshipType` 13종: `dad·mom·husband·wife·son·daughter·elder_brother·elder_sister·younger_brother·younger_sister·grandfather·grandmother·other`
- `GenderType`: `male·female·other`
- `FamilyRoleType`: `parent·teen·kid`
- `RELATIONSHIP_CONFIG` / `GENDER_CONFIG` / `FAMILY_ROLE_CONFIG` — 레이블+이모지 맵
- `buildRoleLabel(familyRole, gender)` — `gender + familyRole` 조합 → AI 페르소나 설명 (예: "아빠", "엄마", "10대 남학생")

**초대 수락 관계 선택 UX**

- `RelationshipSelector` 컴포넌트 (`src/components/family/relationship-selector.tsx`): 13종 관계 2열 그리드, 이모지+레이블, 선택 시 Mocha Mousse 하이라이트
- `InviteAcceptClient` 컴포넌트 (`src/app/(main)/family/invite/[code]/_components/invite-accept-client.tsx`): 관계 선택 → `joinFamilyByInvite(code, relationship)` 호출 → 가족 보드 이동 (`?welcome=new|existing`)
- `joinFamilyByInvite` Server Action 업데이트 (`src/lib/actions/family/invite.ts`): `relationship` 파라미터 → `fp_family_member.relationship` 저장

**AI 페르소나 컨텍스트 보강**

- `PersonaContext` 타입 확장 (`src/lib/ai/persona-context.ts`): `familyRole: FamilyRoleType`, `gender: GenderType | null`, `familyRoleLabel: string` 추가
- `buildPersonaContext()` 수정: `fp_user_profile.gender` + `fp_user_profile.family_role` 조회 → `buildRoleLabel()` 호출 → 컨텍스트 삽입
- `get-user-context.ts` 업데이트: AI 도구 응답에 `gender`, `familyRole` 포함
- AI 시스템 프롬프트 업데이트 (`src/lib/ai/prompts.ts`): `familyRoleLabel` (예: "아빠") 기반 페르소나 정확도 강화

**프로필 선호설정 업데이트**

- `PreferenceForm` (`src/components/profile/PreferenceForm.tsx`): gender(남성/여성/기타) + familyRole(부모/10대/아이) 선택 UI 추가 — `GENDER_CONFIG` / `FAMILY_ROLE_CONFIG` 상수 활용
- `updateUserProfile` Server Action 업데이트 (`src/lib/actions/profile/index.ts`): `gender` + `family_role` 필드 저장

**가족 보드 관계 표시**

- `MemberGrid` 컴포넌트 (`src/components/family/member-grid.tsx`): 멤버 아바타 하단에 `RELATIONSHIP_CONFIG[relationship].label` + 이모지 표시

**AI 추천 라우트 업데이트** (`src/app/api/ai/recommend/route.ts`): `familyRoleLabel` 활용 → 페르소나별 추천 정확도 향상

**완료 기준**: ✅ **FIX-010 완료 (2026-05-18)**
- ✅ M018 마이그레이션 파일 생성 (`fp_user_profile.gender` + `fp_family_member.relationship`)
- ✅ `RELATIONSHIP_CONFIG` / `GENDER_CONFIG` / `FAMILY_ROLE_CONFIG` 공통 상수 모듈 신설
- ✅ `RelationshipSelector` 컴포넌트 — 13종 관계 그리드 UI
- ✅ `InviteAcceptClient` — 관계 선택 후 `joinFamilyByInvite(code, relationship)` 연결
- ✅ `PersonaContext` — `gender` / `familyRole` / `familyRoleLabel` 필드 추가
- ✅ `PreferenceForm` — gender / familyRole 선택 UI 추가 + `updateUserProfile` 저장 연결
- ✅ `MemberGrid` — 관계 이모지+레이블 표시

---

#### HOT-004: RAG 와이파이 상태 표시 개선 — 폴링 제거 + Zustand 직접 구독 (2026-05-18) ✅

> **HOT-003 후속 보완** — `/api/health` 30초 폴링 방식을 Zustand `ragError` 상태 직접 구독으로 교체하여 불필요한 API 호출 제거 및 정확도 향상

**변경 내용**

| 파일 | 내용 |
|------|------|
| `src/lib/store.ts` | `ChatState`에 `ragError: boolean` 필드 + `setRagError(hasError)` 액션 추가. `reset()` 시 `ragError: false` 초기화. persist `partialize`는 메시지만 유지 (에러 상태 새로고침 시 초기화) |
| `src/components/chat/chat-header.tsx` | `useRagStatus()` 훅(30초 `/api/health` 폴링) 완전 제거. `useChatStore`에서 `ragError` 직접 구독. RAG 아이콘: `isRagActive(currentTool !== null)` → 녹색 pulse / `ragError` → 회색 / 정상 → 녹색 |
| `src/hooks/use-chat-stream.ts` | 스트림 `"error"` 이벤트 및 `catch` 블록에서 `setRagError(true)` 호출. 새 채팅 시작(`send()`) 진입 시 `setRagError(false)` 리셋 |

**개선 효과**
- 불필요한 `/api/health` 폴링 제거 → 30초마다 발생하던 API 요청 0건으로 감소
- 실제 스트림 오류 발생 시에만 와이파이 아이콘 회색 전환 → 오탐(false negative) 제거
- 새 채팅 시작 시 자동 리셋 → 이전 오류 잔류 없음

**완료 기준**: ✅ **HOT-004 완료 (2026-05-18)**
- ✅ `useRagStatus()` 훅 및 `/api/health` 폴링 코드 제거
- ✅ `ragError` Zustand 상태 — `useChatStream` error 시 `true`, 새 send 시 `false` 리셋
- ✅ ChatHeader 와이파이 아이콘 — `ragError` 상태 기반 정확한 색상 표시

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

## 출시 후 — 업데이트된 차기 계획

### Phase 4.5 (Sprint 5) — v0.3a AI 채팅 업그레이드

| Task | 기능 | 설명 | 우선순위 |
|------|------|------|---------|
| ~~**Task 064**~~ ✅ | 버그 수정 + 공통 기반 | BUG-001~003 수정 + F032 DB 마이그레이션 + ChatActionEnum 타입 (2026-05-22 완료) | P0 — 완료 |
| ~~**Task 065**~~ ✅ | AI 채팅 3계층 메모리 백엔드 | F032: 원문 TTL·요약·memory_items 파이프라인 (2026-05-16 완료) | P0 — 완료 |
| ~~**Task 066**~~ ✅ | 인텐트 버튼 피드백 채널 | F033: suggestIntents 도구 + INTENTS_RULE + ActionButtonRenderer (2026-05-16 완료) | P0 — 완료 |
| ~~**Task 067**~~ ✅ | AI 채팅 커머스 API 연동 | F034: 찜/장바구니/결제 API + 버튼 핸들러 연결 (2026-05-16 완료) | P0 — 완료 |
| ~~**Task 068**~~ ✅ | 음성 입력 AI 채팅 Prototype | F035: Web Speech API + 파형 애니메이션 (2026-05-16 완료) | P1 — 완료 |
| ~~**Task 069**~~ ✅ | 키즈·청소년 모드 구현 | F014: useKidsFilter + KidsTabView + KidsRating + KidsPreferenceSection (2026-05-16 완료) | P1 — 완료 |

### Phase 5 (Sprint 6) — 서비스 성장 + 운영 인프라

| Task | 기능 | 설명 | Sprint |
|------|------|------|--------|
| ~~**Task 055**~~ ✅ | FCM 푸시 알림 | 가족 투표·무비나이트·배송 알림 (2026-05-17 완료) | Sprint 6 |
| ~~**Task 056**~~ ✅ | 검색 + 필터 고도화 | 통합 검색 자동완성·복합 필터 조합 (2026-05-17 완료) | Sprint 6 |
| ~~**Task 057**~~ ✅ | 영양분석 그래프 | 주간 영양 섭취 Recharts 시각화 (2026-05-17 완료) | Sprint 6 |
| **Task 058** | 운영자 검수 큐 | REVIEW_NEEDED 레시피 승인·반려 워크플로 | Sprint 6 |
| ~~**Task 059**~~ ✅ | OCR 메모 | 카메라 촬영 → Claude Vision 자동 파싱 (2026-05-17 완료) | Sprint 6 |
| **Task 060** | 멀티 매장 가격 비교 | "다른 가게에서 더 싸요" 비교 배지 | Sprint 6 |

**Sprint 6 보강 (2026-05-17 완료)**

| 항목 | 설명 |
|------|------|
| F032 메모리 시스템 보강 | ChatPage 서버 컴포넌트 전환 + 8턴 자동 Layer 2/3 트리거 + 이전 세션 요약 배너 + beforeunload 플러시 |
| 핫픽스 HOT-003 | AI RAG 와이파이 아이콘 — `currentTool` 연동 + 30초 폴링 재확인 |
| 프로필 AI 메뉴 | AI 기억 관리 + 대화 히스토리 링크 추가 (`/profile/ai-memory`, `/profile/chat-history`) |

### PERF: 모바일 성능 최적화 (ver0.3a)

> 모바일 로딩 속도 저하 대응 — 소스 구조·캐시·API·DB 인덱싱 전방위 개선

#### ✅ 1단계 — 즉시 적용 완료 (2026-05-17)

| 포인트 | 파일 | 변경 내용 | 예상 효과 |
|--------|------|-----------|-----------|
| **P1 DailyPick 쿼리 최적화** | `src/lib/actions/cards/index.ts` | 전체 N행 로딩 → count + `.range(idx,idx)` 단일 행 반환 | 서버 응답 40~60% 단축 |
| **P2 이미지 CDN TTL** | `next.config.ts` | `minimumCacheTTL: 60` → `86400` (24시간) | 재방문 LCP 25~35% 향상 |
| **P3 Pretendard preload** | `src/app/layout.tsx` | `preload: false` → `true` | CLS 0 수렴, 텍스트 렌더 20~30% |
| **P7 번들 트리셰이킹** | `next.config.ts` | `optimizePackageImports`에 radix-ui 3종·recharts·date-fns 추가 | JS 파싱 5~10% 감소 |

#### ✅ 2단계 — 단기 적용 완료 (2026-05-17)

| 포인트 | 파일 | 변경 내용 | 예상 효과 |
|--------|------|-----------|-----------|
| **P5 Firebase 동적 임포트** | `src/components/layout/client-providers.tsx` (신설) | `ClientProviders` Client Component 분리 → `FcmInitializer`·`NotificationProvider` `dynamic({ ssr: false })` 래핑 (Next.js 16 Server Component 내 ssr:false 금지 대응) | 초기 JS 15~25% 감소 |
| **P5 Firebase 모듈 지연** | `src/hooks/useFcmToken.ts` | `firebase/app`·`firebase/messaging` static → 함수 내 `await import()` | Firebase ~150KB 초기 번들 제외 |
| **P6 recharts 동적 임포트** | `src/app/(main)/profile/nutrition/page.tsx` | `WeeklyNutritionChart` → `dynamic({ ssr: false })` | 홈/카드 번들 10~15% 감소 |
| **P9 카드 목록 API CDN 캐시** | `src/app/api/cards/route.ts` | 공식 카드 `s-maxage=300 SWR=60`, AI태그 `s-maxage=120`, 기타 `no-store` | 캐시 히트 시 10~30ms 응답 |
| **P9 카드 상세 API CDN 캐시** | `src/app/api/cards/[id]/route.ts` | `s-maxage=300, stale-while-revalidate=60` | Vercel Edge CDN 서빙 |
| **P9 데일리픽 API CDN 캐시** | `src/app/api/daily-pick/route.ts` | `s-maxage=3600, stale-while-revalidate=600` | 하루 단위 CDN 캐시 |

#### ✅ 3단계 — DB + 서버 로직 완료 (2026-05-17)

**DB 마이그레이션 3개 적용**

| 마이그레이션 | 인덱스 | 대상 쿼리 |
|---|---|---|
| `perf_fp_menu_card_composite_filter_idx` | `(review_status, is_official, is_new DESC, created_at DESC)` | 홈 카드 목록 필터 |
| `perf_fp_menu_card_trgm_search_idx` | `name gin_trgm_ops`, `subtitle gin_trgm_ops` | 카드 검색 ILIKE → GIN |
| `perf_fp_memory_items_customer_idx` | `(customer_id, importance_score DESC)` | RAG 3계층 메모리 조회 |

**코드 변경 3개**

| 포인트 | 파일 | 변경 내용 | 예상 효과 |
|--------|------|-----------|-----------|
| **P4 getCard RPC** | `src/lib/actions/cards/index.ts` | 3 round-trip → `fp_get_card_detail` RPC 1 round-trip | 카드 상세 35~50% 단축 |
| **P10 임베딩 캐시** | `src/lib/ai/vector-search.ts` | `unstable_cache` 1시간 — 동일 검색어 OpenAI 호출 생략 | 반복 검색 30~40% 단축 |
| **P8 검색 MV 전환** | `src/app/api/search/route.ts` | `v_store_inventory_item(VIEW)` → `mv_store_item_slim(GIN trgm 보유)` | 상품 검색 50~80% 단축 |
| **P12 LCP 이미지 priority** | `src/components/home/AIRecommendSection.tsx` | AI 추천 캐러셀 첫 번째 카드 `priority={true}` → `<link rel="preload">` + `fetchpriority="high"` 자동 적용 | LCP Core Web Vitals 개선 |

**실측 성능 (개발 서버 기준 — 2026-05-17 측정)**

| 지표 | 캐시 전 (cold) | 캐시 후 (warm) | 개선율 |
|------|---------------|---------------|--------|
| 홈 페이지 로드 (GET /) | 1,422ms | 338ms | **76% ↓** |
| AI 추천 메타 API (`/api/ai/recommend/meta`) | 620ms | 120ms | **80% ↓** |
| 알림 미읽음 수 조회 (`getUnreadCount`) | 486ms | 126ms | **74% ↓** |

#### 🔜 4단계 — 운영테스트 완료 후 적용 예정

| 포인트 | 파일 | 변경 내용 | 예상 효과 | 주의사항 |
|--------|------|-----------|-----------|----------|
| **P11 PWA SW 이미지 전략** | `src/sw.ts` | `/_next/image` → `NetworkFirst` → `StaleWhileRevalidate` (7일) | 재방문/오프라인 이미지 즉시 표시 | 이미지 변경 시 최대 7일 구버전 노출 가능 |

**4단계 사이드 이펙트 검토 사항**
- 카드 썸네일 교체 시 PWA 캐시 만료 전까지 구버전 이미지가 기기에 남을 수 있음
- 운영테스트에서 이미지 변경 빈도 확인 후 `maxAgeSeconds` 조정 (7일 → 1일로 단축 가능)
- 적용 시 기존 설치된 PWA 앱의 서비스 워커 업데이트 필요 (배포 후 자동 갱신)

---

### Phase 6 (Sprint 7+) — 서비스 확장

| Task | 기능 | 설명 | Sprint |
|------|------|------|--------|
| **Task 061** | 정기배송 | 주 1회 자동 주문 구독 모델 | Sprint 7 |
| **Task 062** | 음성 입력 (메모) | 마이크로 장보기 메모 입력 | Sprint 7 |
| **Task 063** | 운영자 대시보드 | 지표·콘텐츠·사용자 관리 어드민 UI | Sprint 7 |
