# FreshPickAI 개발 로드맵

> 가족을 위한 AI 큐레이팅 장보기 — 다양한 테마 카드로 메뉴를 고르고, 재료를 바로바로 배송 받는 모바일 커머스. 배송은 스토어 배송정책에 따라 다양한 방식으로 제공됨 (sellerbox-app 정책)

---

## 진행 현황 (2026-05-12 업데이트)

| 태스크 | 상태 | 완료일 |
|--------|------|--------|
| **Task 001: 프로젝트 환경 설정 및 공통 인프라 구축** | ✅ **완료** | **2026-05-12** |
| T001-A: Husky + lint-staged pre-commit 훅 | ✅ 완료 | 2026-05-05 |
| T001-B: shadcn/ui 기본 컴포넌트 add + /api/mock/* 모킹 설정 | ✅ 완료 | 2026-05-06 |
| T002-B: 공통 유틸리티 파일 생성 (utils/env/api/query) | ✅ 완료 | 2026-05-05 |
| T002-C: TypeScript 도메인 타입 정의 (types.ts fp_ 프리픽스 확장) | ✅ 완료 | 2026-05-06 |
| T002-D: Zustand 스토어 초기화 (5종 + useSectionStore 추가) | ✅ 완료 | 2026-05-06 |
| T003-A: Supabase 클라이언트 3종 + 미들웨어 인증 게이트 | ✅ 완료 | 2026-05-06 |
| T003-B: 인증 Server Actions (kakao/apple/session) + 콜백 라우트 | ✅ 완료 | 2026-05-06 |
| T004: 라우트 구조 + 레이아웃 골격 (BottomTabNav·BrandHeader 등) | ✅ 완료 | 2026-05-06 |
| T005-A: 디자인 토큰 (@theme CSS 변수) + 컴포넌트 (Typography·Chip·HealthScoreBadge·Skeleton·MenuCard·LabelMark) | ✅ 완료 | 2026-05-06 |
| T005-B: Typography Title 추가 + Button md 사이즈 추가 | ✅ 완료 | 2026-05-06 |
| **Task 005: 디자인 시스템 + 공통 컴포넌트 구현** (Card 컴포넌트 `.card-paper` 완성) | ✅ **완료** | **2026-05-12** |
| T006-A: 인증 콜백 라우트 (auth/confirm) | ✅ 완료 | 2026-05-06 |
| T007-A: 더미 데이터 (mock-cards·mock-dishes) + MenuCard 컴포넌트 | ✅ 완료 | 2026-05-06 |
| T016: Supabase DB 스키마 SQL 작성 + DB 적용 + TS 타입 재생성 | ✅ 완료 | 2026-05-06 |
| T017: CORRECTION_DICT 오타 보정 사전 구축 (ETL 파이프라인 + 단위 테스트 완성) | ✅ 완료 | 2026-05-12 |
| Task 006: 로그인 + 온보딩 UI (LoginPage·SocialButtons·EmailLoginForm·OnboardingCarousel·OnboardingForm) | ✅ 완료 | 2026-05-06 |
| Task 007: 카드메뉴 홈 UI (DailyHero·SectionTabs·CategoryFilter·CardGrid·AIBadge) | ✅ 완료 | 2026-05-06 |
| Task 008: 카드 상세 UI (CardFlipper·HealthScore·PriceCompare·DishList·NoteSection·ShareButton·DetailFooter) | ✅ 완료 | 2026-05-06 |
| Task 009: AI 채팅 UI (ChatHeader·MessageList·Message·RecCardCarousel·QuickChips·ChatInput·useChatStream·ToolCallIndicator) | ✅ 완료 | 2026-05-06 |
| Task 010: 우리가족 보드 UI (FamilyBanner·MemberGrid·DinnerVote·PopularRanking·TrendingCards·KidsPreference·FamilyMission·FamilyInvite) | ✅ 완료 | 2026-05-06 |
| Task 011: 장보기 메모 UI (MemoInput·ParsePreview·MemoItem·MemoList·MemoFooter) | ✅ 완료 | 2026-05-06 |
| Task 012: 장바구니 + 결제 UI (FreeShippingBar·CartGroup·CartItemRow·CartSummary·AddressBlock·PaymentSelector·BenefitBlock·CheckoutFooter) | ✅ 완료 | 2026-05-06 |
| Task 013: 카드 만들기 위저드 UI (WizardProgress·Step1~4·WizardFooter) | ✅ 완료 | 2026-05-06 |
| Task 014: 내 섹션 관리 UI (SectionList·SectionItem·AddSectionButton·AIAutoFillToggle) | ✅ 완료 | 2026-05-06 |
| Task 015: 키즈·청소년 모드 UI (KidsHeader·MascotBubble·FoodPicker·DailyMission·BadgeGrid·KidsFooter) | ✅ 완료 | 2026-05-06 |
| **Task 018: 카드메뉴 API 및 10종 카드 시스템 구현 (F001)** | ✅ **완료** | **2026-05-12** |
| **Task 019: 인증 API + 가족 그룹 관리 구현 (F010, F011)** | ✅ **완료** | **2026-05-12** |
| **Task 020: 카드 상세 API 구현 (F002)** | ✅ **완료** | **2026-05-13** |
| **Task 021: 장바구니 + 결제 API 구현 (F004, F005)** | ✅ **완료** | **2026-05-13** |

---

## 개요

FreshPickAI는 매일 저녁 메뉴 결정 마찰을 없애는 AI 큐레이팅 장보기 서비스입니다.

### 핵심 기능 (PRD F001 ~ F022)

| ID | 기능 | 우선순위 |
|----|------|---------|
| F001 | 다양한 테마 카드메뉴 시스템 (MVP 기준: 식사형 7 + 비식사형 3) | P0 |
| F002 | 카드 상세 + 건강·가격 인프라 | P0 |
| F003 | AI 페르소나 채팅 추천 (RAG, 9 페르소나) | P0 |
| F004 | 재료 장바구니 일괄 담기 | P0 |
| F005 | 결제 (토스페이먼츠 — 카카오/네이버/카드/계좌) | P0 |
| F010 | 기본 인증 (카카오·애플 소셜 로그인) | P0 |
| F011 | 우리가족 보드 (5개 섹션 + Realtime) | P1 |
| F012 | 장보기 메모 (자연어 4-step 파싱) | P1 |
| F013 | 카드 만들기 (4단계 위저드 + BP4 가이드 키워드) | P1 |
| F014 | 키즈·청소년 모드 | P1 |
| F015 | 카드섹션 커스터마이징 (드래그앤드롭) | P1 |
| **F016** | **카드 사용자 노트 3분류 (BP1)** | **P1** |
| **F017** | **인터랙티브 조리 UX (BP2)** | **P2** |
| **F018** | **재료 메타 확장 (BP3)** | **P1** |
| **F019** | **온보딩 5장 슬라이드 (BP5)** | **P0** |
| **F020** | **냉장고 비우기 모드 (BP6)** | **P2** |
| **F021** | **카드 외부 공유 (BP7)** | **P1** |
| **F022** | **음식 마스터·레시피 RAG 시스템** | **P0** |

### 테마 카드메뉴 (MVP 기준 10종, 이후 확장)

- 식사형 7종: 셰프스 테이블 · 하루한끼 One Meal · 엄마손맛 가정식 · 드라마 한 끼 · 혼웰 라이프 · 제철한상 · 글로벌 원플레이트
- 비식사형 3종: K-디저트 랩 · 방과후 간식팩 · 홈시네마 나이트

> **배송 정책**: 주문 상품은 각 스토어의 배송정책에 따라 다양한 방식으로 배송됩니다 (sellerbox-app 정책).

---

## 개발 워크플로우

모든 Task는 아래 4단계 워크플로우를 따릅니다.

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

## 스프린트 계획 연계표

| Sprint | Phase | 기간 | 목표 |
|--------|-------|------|------|
| Sprint 0 | Phase 0 | Week 0 (3일) | 프로젝트 환경 + 공통 프레임워크 |
| Sprint 1 | Phase 1 | Week 1~2 | 로그인·홈·카드 상세 UI (P0 화면) |
| Sprint 2 | Phase 1~2 | Week 3 | AI 채팅 UI + 백엔드 API 기반 |
| Sprint 3 | Phase 2~3 | Week 4 | 장바구니·결제 + AI RAG 초기 |
| Sprint 4 | Phase 3 | Week 5 | 가족 보드·메모 + RAG 완성 |
| Sprint 5 | Phase 4 | Week 6 | 키즈·섹션관리 + 품질·배포 |

> **신규 기능 스프린트 배치**:
> - **Sprint 0~1**: F019 (온보딩 슬라이드) — Phase 1 로그인 UI에 통합
> - **Sprint 2~3**: F022 (음식·레시피 RAG) — Task 016 DB 스키마 + Phase 3 RAG 인프라에 통합
> - **Sprint 4**: F016 (사용자 노트) + F018 (재료 메타) + F021 (카카오톡 공유) — Phase 3 후반
> - **Sprint 5+ (출시 후)**: F017 (인터랙티브 조리 UX), F020 (냉장고 비우기) — P2 확장

---

## 개발 단계

---

### Phase 0: 프로젝트 기반 + 공통 프레임워크 구축

> **Sprint 0 — Setup (Week 0, 3일)**
> 개발 시작 전 모든 팀원이 공통으로 사용할 기반 인프라를 구축합니다.

---

#### Task 001: 프로젝트 환경 설정 및 공통 인프라 구축 ✅ 완료 (2026-05-12)

**목적**: Next.js 16 + TypeScript strict 환경, 코드 품질 자동화, Vercel 배포 파이프라인 구축

**구현 항목**:

- [x] Next.js 16 App Router + Turbopack 설정 확인 및 `tsconfig.json` strict 모드 검증 (`"strict": true`, `turbopack: {}`) ✅ 2026-05-12
- [x] Tailwind CSS 디자인 토큰 적용 (`docs/handoff/03-tailwind.config.ts` 기반 Mocha Mousse 팔레트 + Bree Serif/Pretendard 폰트, `--tracking-tightest/tighter/tight` 추가) ✅ 2026-05-12
- [x] `src/app/globals.css` CSS 변수 설정 (`--paper`, `--line`, `--mocha-*`, `--olive-*`, `--ink-*`, `--sage`, `--honey`, `--terracotta`, letterSpacing 4종) ✅ 2026-05-12
- [x] shadcn/ui (new-york 스타일) 초기화 + 기본 컴포넌트 add (`button`, `input`, `card`, `dialog`, `tabs`, `badge`, `sheet`, `drawer`, `chip`, `skeleton`, `sonner`, `typography`) ✅ 2026-05-06
- [x] ESLint + Prettier + Husky pre-commit 훅 설정 (`npm run check-all` 게이트 구성) ✅ 2026-05-05
- [x] 환경 변수 설정 (`.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) ✅ 2026-05-12
- [x] `/api/mock/*` 경로로 백엔드 API 모킹 설정 (`cards`, `cards/[id]`, `family`) ✅ 2026-05-06

**완료 기준**: `npm run check-all` ✅ + `npm run build` ✅ 정상 통과 (2026-05-12)
> Vercel 프로젝트 연결은 `npm i -g vercel && vercel link` 실행 후 진행 가능 (CLI 미설치)

---

#### Task 002: 공통 Lib 및 타입 시스템 구축 ✅ 완료 (2026-05-06)

**목적**: 전체 개발팀이 공통으로 사용할 타입 정의, 상태 스토어, API 클라이언트, 유틸리티 라이브러리 구축

**구현 항목**:

- [x] **TypeScript 도메인 타입 정의** (`src/lib/types.ts`): `FpUser`, `FpUserPreference`, `FamilyGroup`, `FamilyMember`, `MenuCard`, `Dish`, `CartItem`, `ChatMessage`, `Vote`, `KidsPick`, `Memo`, `Order`, `CardSection`, `DishRecipe`, `DishRecipeStep`, `CardDish`, `CardNote`, `IngredientSubstitute` 타입 (fp_ 프리픽스 아키텍처 기반) ✅ 2026-05-06
- [x] **Zustand 스토어 초기화** (`src/lib/store.ts`): `useAuthStore` (persist), `useCartStore` (persist), `useChatStore`, `useKidsStore`, `useUIStore`, `useSectionStore` (persist) ✅ 2026-05-06
- [x] **TanStack Query 설정** (`src/lib/query-client.ts`): `QueryClient` 기본 설정, `src/lib/query-keys.ts` 쿼리 키 컨벤션 (`qk.cards()`, `qk.card()`, `qk.daily()`, `qk.family()`, `qk.cart()`, `qk.memos()`) ✅ 2026-05-05
- [x] **API 클라이언트** (`src/lib/api.ts`): `fetch` 래퍼, 인증 헤더 자동 주입, 에러 포맷 파싱 (`{ error: { code, message } }`) ✅ 2026-05-05
- [x] **공통 유틸리티** (`src/lib/utils.ts`): `cn()` (clsx + tailwind-merge), `formatPrice()`, `formatDate()`, `formatDeliveryTime()` ✅ 2026-05-05
- [x] **환경 변수 유효성 검사** (`src/lib/env.ts`): 필수 환경 변수 미설정 시 빌드 타임 에러 ✅ 2026-05-05

**완료 기준**: 모든 타입이 strict 모드에서 오류 없이 컴파일, 스토어 persist 동작 확인

---

#### Task 003: 인증 시스템 및 미들웨어 구축 ✅ 완료 (2026-05-06)

**목적**: Supabase Auth 기반 소셜 로그인 + 미들웨어 인증 게이트 구축

**구현 항목**:

- [x] **Supabase 클라이언트 3종 설정**: `src/lib/supabase/server.ts` (Server Components용, createAdminClient 포함), `src/lib/supabase/client.ts` (Client Components용), `src/lib/supabase/middleware.ts` (updateSession) ✅ 2026-05-06
- [x] **Supabase 데이터베이스 타입** (`src/lib/supabase/database.types.ts`): 초기 타입 생성 완료 (fp_ 테이블 적용 후 재생성 필요) ✅ 2026-05-06
- [x] **미들웨어 인증 게이트** (`src/middleware.ts`): `updateSession()` 호출, 비인증 사용자 → `/login` 리다이렉트, 정적 파일·PWA 자산 제외 ✅ 2026-05-06
- [x] **카카오 소셜 로그인** Server Action (`src/lib/actions/auth/kakao.ts`): OAuth 콜백 처리 ✅ 2026-05-06
- [x] **애플 소셜 로그인** Server Action (`src/lib/actions/auth/apple.ts`): OAuth 콜백 처리 ✅ 2026-05-06
- [x] **세션 관리 유틸리티** (`src/lib/actions/auth/session.ts`): `getSession()`, `signOut()`, `refreshSession()` ✅ 2026-05-06

**완료 기준**: 비인증 상태에서 보호 라우트 접근 시 로그인 페이지로 리다이렉트 동작 확인

---

#### Task 004: 애플리케이션 라우트 구조 및 레이아웃 골격 구축 ✅ 완료 (2026-05-06)

**목적**: 전체 App Router 라우트 구조와 공통 레이아웃을 먼저 구축하여 병렬 개발 가능하게 함

**구현 항목**:

- [x] **App Router 라우트 전체 생성**: `(auth)/login`, `(main)/` (홈), `(main)/chat`, `(main)/family`, `(main)/kids`, `(main)/memo`, `(main)/cart`, `(main)/checkout`, `(main)/cards/[id]`, `(main)/cards/new`, `(main)/sections` — 껍데기 컴포넌트 전체 생성 ✅ 2026-05-06
- [x] **루트 레이아웃** (`src/app/layout.tsx`): Bree Serif 폰트 로딩, `Providers`(QueryClientProvider + ThemeProvider + Toaster) ✅ 2026-05-06
- [x] **(main) 공통 레이아웃** (`src/app/(main)/layout.tsx`): `<BottomTabNav>` 포함 ✅ 2026-05-06
- [x] **BottomTabNav 컴포넌트** (`src/components/layout/bottom-tab-nav.tsx`): 홈·AI·가족·메모·장바구니 5탭, 활성 탭 하이라이트, Lucide 아이콘 ✅ 2026-05-06
- [x] **공통 레이아웃 컴포넌트**: `<BrandHeader>`, `<PageHeader>`, `<BottomCTA>` 모두 구현 ✅ 2026-05-06
- [x] **404 / 에러 페이지**: `not-found.tsx`, `error.tsx`, `loading.tsx` (루트 + main 그룹) 구현 ✅ 2026-05-06

**완료 기준**: 모든 라우트 접근 가능, BottomTabNav 탭 전환 동작 확인

---

### Phase 1: UI/UX 디자인 시스템 + 화면별 디자인 구현 (더미 데이터)

> **Sprint 1 — Foundation + 카드 발견 (Week 1~2) · P0**
> **Sprint 2 — AI Chat (Week 3) · P0**
> 디자인 핸드오프(`docs/handoff/`) 기반 픽셀 페어리티 UI 구현. 백엔드 없이 더미 데이터로 동작.

---

#### Task 005: 디자인 시스템 + 공통 컴포넌트 구현 ✅ 완료 (2026-05-12)

**목적**: Mocha Mousse 2025→26 디자인 시스템을 코드로 구현하고 재사용 가능한 공통 컴포넌트 라이브러리 구축

**디자인 참조**: `docs/handoff/02-design-tokens.md`, `docs/handoff/05-components-spec.md`

**구현 항목**:

- [x] **디자인 토큰 구현** (`src/app/globals.css`): Tailwind v4 `@theme` 블록 — Mocha Mousse(`--color-mocha-50`~`900`), Olive, Paper/Line, Ink 4단계, Terracotta/Honey/Sage, 폰트·그림자·radius·shadcn 연동 변수 ✅ 2026-05-06
- [x] **Typography 컴포넌트** (`src/components/ui/typography.tsx`): DisplayXL(56px Bree)·DisplayL·DisplayM·Heading·Title·Body·Caption·Label 구현 ✅ 2026-05-06
- [x] **Button 컴포넌트** (`src/components/ui/button.tsx`): `variant: 'primary'(mocha-700) | 'ghost' | 'olive'`, `size: 'sm' | 'md' | 'lg'` 업데이트 ✅ 2026-05-06
- [x] **Card 컴포넌트** (`src/components/ui/card.tsx`): `.card-paper` 래퍼, `shadow-card`(0 1px 0 --line), hover 시 `shadow-hover`, 4px 코너 ✅ 2026-05-12
- [x] **Chip 컴포넌트** (`src/components/ui/chip.tsx`): 토글 가능 필터 칩, pill 라운드, olive-100 bg + olive-500 활성 ✅ 2026-05-06
- [x] **MenuCard 컴포넌트** (`src/components/cards/menu-card.tsx`): 썸네일 + 테마 뱃지 + 타이틀 + 취향 태그 + 건강 스코어 + 가격 표시 ✅ 2026-05-06
- [x] **LabelMark 컴포넌트** (`src/components/ui/label-mark.tsx`): uppercase Bree Serif caption, `letter-spacing: 2px`, olive-500 색상 ✅ 2026-05-06
- [x] **HealthScoreBadge 컴포넌트** (`src/components/ui/health-score-badge.tsx`): 0~1.0 점수 → sage 색상 게이지 시각화 ✅ 2026-05-06
- [x] **공통 스켈레톤** (`src/components/ui/skeleton.tsx`): 카드·리스트·텍스트 스켈레톤 로딩 상태 ✅ 2026-05-06

**완료 기준**: `npm run check-all` ✅ + `npm run build` ✅ 정상 통과 (2026-05-12)

---

#### Task 006: 로그인 + 온보딩 UI 구현 (F010)

**목적**: 카카오/애플 소셜 로그인 + 가족 페르소나 온보딩 화면 구현

**디자인 참조**: `docs/handoff/05-components-spec.md` - 01 Login, `docs/handoff/01-PRD.md`

**구현 항목**:

- [x] **로그인 페이지** (`src/app/(auth)/login/page.tsx`): Mocha Mousse 브랜드 헤더, 서비스 소개 카피, 서비스 통계 행 (2.4M 고객 · 180+ 카드 · 4.9 평점) ✅ 2026-05-06
- [x] **소셜 로그인 버튼** (`src/components/auth/social-buttons.tsx`): 카카오 노랑 버튼, 애플 블랙 버튼, 이메일 ghost 버튼 — 각 버튼 최소 height 52px ✅ 2026-05-06
- [x] **이메일 로그인 폼** (`src/components/auth/email-login-form.tsx`): React Hook Form + Zod 스키마 검증, 에러 메시지 인라인 표시 ✅ 2026-05-06
- [x] **온보딩 슬라이드 컴포넌트** (`src/components/auth/onboarding-carousel.tsx`, F019 BP5 신규) — 5장 슬라이드: ① 다양한 테마 카드 미리보기 ② F003 9 페르소나 데모 ③ F011 가족 투표 데모 ④ F014 키즈 모드 데모 ⑤ 페르소나 태그 입력 폼. 모든 단계 [건너뛰기] CTA 노출. 마지막 슬라이드만 [시작하기] primary, 나머지는 secondary ✅ 2026-05-06
- [x] **OnboardingForm 컴포넌트** (`src/components/auth/onboarding-form.tsx`) — 5번째 슬라이드 내부에 통합: 가구 인원 선택 (1~6+인), 웰빙 목표 태그 선택 (저속노화·다이어트·근육강화·혈당관리 등), 선호 요리시간 선택 (10분·30분·1시간), 끼니 예산 선택 (만원 이하·2만원·3만원 이상) ✅ 2026-05-06
- [x] **온보딩 진입 가드** — `useAuthStore.onboardingCompletedAt IS NULL`이면 (main) 레이아웃 진입 시 `/onboarding`으로 자동 리디렉션. `/onboarding` 독립 라우트로 마이페이지 "온보딩 다시 보기" 재진입 가능 (`resetOnboarding()`) ✅ 2026-05-06
- [ ] **DB 스키마**: `customer_preference`에 `onboarding_completed_at TIMESTAMPTZ NULL`, `onboarding_skipped_at TIMESTAMPTZ NULL` 컬럼 추가 — UI/타입 선반영 완료, SQL 마이그레이션은 Phase 2 Task 041에서 적용
- [x] **인증 콜백 라우트** (`src/app/auth/confirm/route.ts`): 이메일 확인 및 OAuth 콜백 처리 ✅ 2026-05-06
- [x] **에러 처리**: 로그인 실패 시 Sonner 토스트 에러 메시지 ✅ 2026-05-06

**완료 기준**: 로그인 버튼 클릭 → 5장 슬라이드 → 페르소나 태그 입력 → 카드메뉴 홈 리다이렉트 플로우 확인 (더미 인증). 모든 슬라이드 [건너뛰기] 동작 검증

---

#### Task 007: 카드메뉴 홈 UI 구현 (F001)

**목적**: 다양한 테마 카드 + 커스텀 섹션 탭을 포함한 카드메뉴 홈 화면 구현

**디자인 참조**: `docs/handoff/05-components-spec.md` - 02 Home, `docs/handoff/06-routing.md`

**구현 항목**:

- [x] **홈 페이지** (`src/app/(main)/page.tsx`): RSC 기반 카드 목록 패칭, 인터랙티브 필터/그리드는 `HomeBoard` Client Island로 분리 ✅ 2026-05-06
- [x] **DailyHero 컴포넌트** (`src/components/home/daily-hero.tsx`): 오늘의 AI 큐레이팅 카드 + AI 신뢰도 배지(동적 %) + CTA 버튼, Bree Serif 28px 대형 타이틀 ✅ 2026-05-06
- [x] **CategoryFilter 컴포넌트** (`src/components/home/category-filter.tsx`): 'all' | 'meal' | 'snack' | 'cinema' Chip 그룹, 선택 시 카드 그리드 필터링, `useUIStore.homeFilter` 연동 ✅ 2026-05-06
- [x] **CardGrid 컴포넌트** (`src/components/home/card-grid.tsx`): 2열 그리드, `MenuCard[]` 렌더링, TanStack Query `qk.cards(filter)` 연동 (HomeBoard 안에서 `useQuery`) ✅ 2026-05-06
- [x] **SectionTabs 컴포넌트** (`src/components/home/section-tabs.tsx`): 공식 11종 탭 + 사용자 정의 섹션(`useSectionStore`) 자동 추가 + 수평 스크롤 + 섹션 편집 버튼 ✅ 2026-05-06
- [x] **AIBadge 컴포넌트** (`src/components/home/ai-badge.tsx`): pgvector 취향 매칭 배지(`MenuCard.aiMatch %`) + 우리가족 TOP3 강조 배지(`MenuCard.topRank` 1~3, 왕관 아이콘) ✅ 2026-05-06
- [x] **더미 데이터** (`src/data/mock-cards.ts`, `src/data/mock-dishes.ts`): MVP 10종 테마 카드 더미 데이터 20개 ✅ 2026-05-06

**완료 기준**: 홈 화면 렌더링, 카테고리 필터 동작, 카드 클릭 → 상세 페이지 이동 확인

---

#### Task 008: 카드 상세 UI 구현 (F002)

**목적**: 카드 flip 애니메이션 + 건강 스코어 + 가격 비교 + 재료 목록 화면 구현

**디자인 참조**: `docs/handoff/05-components-spec.md` - 03 Card Detail

**구현 항목**:

- [x] **카드 상세 페이지** (`src/app/(main)/cards/[id]/page.tsx`): Client 컴포넌트, mock 데이터 연동, 모든 섹션 통합 ✅
- [x] **DetailHeader 컴포넌트** (`src/components/detail/detail-header.tsx`): 뒤로가기 + 카드 테마 breadcrumb + 찜하기(하트) 버튼 ✅
- [x] **CardFlipper 컴포넌트** (`src/components/detail/card-flipper.tsx`): `rotateY(180deg)` + `preserve-3d` + `transition: 0.7s` CSS flip ✅
  - **DishFront** (앞면): 음식 이름/설명 + HealthScoreBadge + 조리 시간·칼로리 메타 ✅
  - **IngredientList** (뒷면): 재료별 이모지·이름·수량·가격·할인율 + QtyAdjuster ✅
- [x] **HealthScoreSection 컴포넌트** (`src/components/detail/health-score-section.tsx`): 저속노화·혈당 지수·영양 밸런스 3개 지표, 0~10 sage 게이지 ✅
- [x] **PriceCompareSection 컴포넌트** (`src/components/detail/price-compare-section.tsx`): 홈메이드 vs 외식·배달·카페 비교 ✅
- [x] **DetailFooter 컴포넌트** (`src/components/detail/detail-footer.tsx`): AI 변형 버튼 + "모두 담기" CTA, `useCartStore.addBundle()` 연동 ✅
- [x] **수량 조정 컴포넌트** (`src/components/detail/qty-adjuster.tsx`): ±1 버튼, 최소 1 제한, CardFlipper 뒷면 재료별 적용 ✅
- [x] **DishList 컴포넌트** (`src/components/detail/dish-list.tsx`, F022) — N개 음식 표시, 레시피 확장/축소 인터랙션, `DishWithRecipe` 실 데이터 연동 완료 ✅ (Task 020 ✅ 2026-05-13)
- [x] **IngredientMetaBlock 컴포넌트** (`src/components/detail/ingredient-meta-block.tsx`, F018 BP3) — 손질법·계량·대체재료 실 데이터 표시 완료 ✅ (Task 020 ✅ 2026-05-13)
- [x] **CardNoteSection 컴포넌트** (`src/components/detail/card-note-section.tsx`, F016 BP1 신규) — 팁·후기·질문 3분류 탭 + 노트 카운트 + 운영자 답글 인용 박스 + [내 노트 남기기] CTA ✅
- [x] **NoteWriteDrawer 컴포넌트** (`src/components/detail/note-write-drawer.tsx`, F016 BP1 신규) — vaul Drawer, 3-탭(팁/후기/질문), AI 학습 동의 체크박스 (Task 037 실 저장 연동 예정) ✅
- [x] **ShareButton 컴포넌트** (`src/components/detail/share-button.tsx`, F021 BP7 신규) — Web Share API + 클립보드 복사 fallback (Task 039 카카오 SDK 연동 예정) ✅
- [x] **CookModeButton 컴포넌트** (`src/components/detail/cook-mode-button.tsx`, F017 P2 자리 표시) — "이 카드로 요리하기" 버튼 비활성 상태, MVP 이후 활성화 예정 ✅

**완료 기준**: 카드 flip 애니메이션 동작, "모두 담기" 클릭 → 장바구니 아이템 추가 확인, 음식 목록·재료 메타·사용자 노트 섹션 렌더링

---

#### Task 009: AI 채팅 UI 구현 (F003)

**목적**: SSE 스트리밍 + RAG 추천 카드 carousel 포함 AI 채팅 인터페이스 구현

**디자인 참조**: `docs/handoff/05-components-spec.md` - 04 AI Chat, `docs/handoff/09-api-spec.md` - 3. AI Chat

**구현 항목**:

- [x] **AI 채팅 페이지** (`src/app/(main)/chat/page.tsx`): `'use client'` — 전체 스트리밍 상태 관리 ✅
- [x] **ChatHeader 컴포넌트** (`src/components/chat/chat-header.tsx`): AI 상태 표시 (연결중·대기·스트리밍), RAG 인디케이터 뱃지 ✅
- [x] **MessageList 컴포넌트** (`src/components/chat/message-list.tsx`): `useChatStore.messages` 렌더링, 자동 스크롤 하단, 스트리밍 중 바운싱 도트 애니메이션 ✅
- [x] **Message 컴포넌트** (`src/components/chat/message.tsx`): AI는 white bg 그림자, 사용자는 mocha-700 bg, Pretendard 14px ✅
- [x] **RecCardCarousel 컴포넌트** (`src/components/chat/rec-card-carousel.tsx`): AI 추천 카드 수평 스크롤 carousel, 건강 점수·가격 표시, 더보기 카드 ✅
- [x] **QuickChips 컴포넌트** (`src/components/chat/quick-chips.tsx`): 비건·매운맛·10분·8천원이하·초등간식 — 탭 시 send() 자동 호출 ✅
- [x] **ChatInput 컴포넌트** (`src/components/chat/chat-input.tsx`): 자동 높이 조절 textarea + 전송 버튼, 스트리밍 중 비활성화 ✅
- [x] **SSE 스트리밍 훅** (`src/hooks/use-chat-stream.ts`): 모킹 청크 스트리밍, 키워드별 카드 추천 자동 매칭, `useChatStore` 연동 ✅
- [x] **ToolCallIndicator 컴포넌트** (`src/components/chat/tool-call-indicator.tsx`): ToolLoopAgent 5도구(searchItems·getUserContext·getInventory·addToCart·addToMemo) 호출 진행 자리표시, 스트리밍 첫 청크 도달 전 노출 ✅

**완료 기준**: 텍스트 입력 → SSE 스트리밍 텍스트 표시, 빠른칩 클릭 동작 확인 (모킹 응답)

---

#### Task 010: 우리가족 보드 UI 구현 (F011)

**목적**: 5개 섹션(컬렉션·투표·아이선호·TOP5·미션) 가족 공동 결정 공간 UI 구현

**디자인 참조**: `docs/handoff/05-components-spec.md` - 05 Family Board

**구현 항목**:

- [x] **가족 보드 페이지** (`src/app/(main)/family/page.tsx`): RSC 정적 데이터 + Client 실시간 투표 섹션 분리 (FamilyBanner·MemberGrid·DinnerVote·FamilyInvite는 `'use client'`, 나머지는 RSC) ✅
- [x] **FamilyBanner 컴포넌트** (`src/components/family/family-banner.tsx`): 가족 그룹명 + Lv 레벨 + 이번 달 끼니 카운터, `font-display` Bree Serif 타이틀 ✅
- [x] **MemberGrid 컴포넌트** (`src/components/family/member-grid.tsx`): 가족 구성원 카드 `grid-cols-2`, 이모지 아바타 + 이름 + 역할 + 온라인 dot + 오늘 활동 + Lv ✅
- [x] **DinnerVote 컴포넌트** (`src/components/family/dinner-vote.tsx`): "이번 주 뭐 먹지?" 투표, 좋아요/싫어요 토글 버튼, 득표 진행률 바, **절대 `endsAt` ISO 시각 + `useVoteCountdown` 훅 분리** (1초 차감, 일시정지/종료 상태 분기, 마감 시 투표 버튼 자동 disable) — Phase 2/3 Supabase Realtime 구독으로 session 동기화 예정 ✅
- [x] **useVoteCountdown 훅** (`src/hooks/use-vote-countdown.ts`): `VoteSession` 타입(`sessionId`/`endsAt`/`isPaused`/`pausedRemainingMs`/`status`) + 1초 setInterval 차감, `formatDuration` 일/시간/분/초 자동 포맷, `isExpired`/`formatted` 반환 ✅
- [x] **PopularRanking 컴포넌트** (`src/components/family/popular-ranking.tsx`): 이번 달 TOP5 메뉴 랭킹, 1위 `Crown` + `text-honey` 강조 ✅
- [x] **TrendingCards 컴포넌트** (`src/components/family/trending-cards.tsx`): 실시간 `+%` 트렌딩 카드, Supabase Realtime 구독 자리 표시 (Task 030 TODO 주석) ✅
- [x] **KidsPreference 컴포넌트** (`src/components/family/kids-preference.tsx`): 아이 선호 섹션, 별점 5개 + 코멘트 표시 ✅
- [x] **FamilyMission 컴포넌트** (`src/components/family/family-mission.tsx`): 주간 미션 카드, 금요 홈시네마(무비나이트) CTA Link ✅
- [x] **FamilyInvite 컴포넌트** (`src/components/family/family-invite.tsx`): 가족 그룹 초대 링크 생성 + **`qrcode.react`의 `QRCodeSVG` 렌더링** (140px, Mocha 색), 초대 링크 복사 버튼, **`nanoid` 32문자 풀 (혼동 방지: 0/O·1/I/L·B/8 제외) 6자리 코드 동적 생성**, **카카오톡 공유 버튼 (`Kakao.Share.sendDefault`)** — `NEXT_PUBLIC_KAKAO_JS_KEY` 미설정 시 graceful degradation ✅
- [x] **invite-code 생성 유틸** (`src/lib/family/invite-code.ts`): `INVITE_ALPHABET`(32문자) + `INVITE_CODE_RE` 정규식 + `generateInviteCode`/`isValidInviteCode` export ✅
- [x] **카카오 공유 모듈** (`src/lib/share/kakao.ts`): `KakaoSDK` 타입 정의 + `initKakao`/`isKakaoShareReady`/`shareFamilyInvite` (Feed 메시지 + buttons + serverCallbackArgs), Root Layout(`src/app/layout.tsx`)에서 `next/script` afterInteractive로 SDK 조건부 로드 ✅
- [x] **`joinFamilyByInvite` Server Action** (`src/lib/actions/family/invite.ts`): 코드 검증 + `JoinInviteResult` 분기 (`AUTH_REQUIRED`/`CODE_INVALID`/`CODE_EXPIRED`/`CODE_EXHAUSTED`/`JOIN_FAILED`/성공+`alreadyMember`) — Phase 1 stub, 실 Supabase 연동은 Task 019/030 ✅
- [x] **초대 수락 페이지** (`src/app/(main)/family/invite/[code]/page.tsx`): `joinFamilyByInvite` 호출 → 결과별 분기 화면 (만료/인원초과/유효하지않음/가입실패), 성공 시 `/family?welcome=new\|existing` redirect, `AUTH_REQUIRED` 시 `/login?next=...` redirect ✅

**완료 기준**: 5개 섹션 렌더링, 투표 버튼 UI 동작 확인 (더미 데이터), 초대 링크 생성·QR 표시

---

#### Task 011: 장보기 메모 UI 구현 (F012)

**목적**: 자연어 메모 입력 + 파싱 결과 미리보기 + 장바구니 전송 화면 구현

**디자인 참조**: `docs/handoff/05-components-spec.md` - 07 Memo

**구현 항목**:

- [x] **메모 페이지** (`src/app/(main)/memo/page.tsx`): 탭 구조 — 새 메모 입력 탭 + 저장된 메모 탭 ✅ 2026-05-06
- [x] **MemoInput 컴포넌트** (`src/components/memo/MemoInput.tsx`): 자유 텍스트 영역 (placeholder: "계란2판 새우깡3봉지 저녁찬거리"), 글자 수 카운터, AI 파싱 버튼 ✅ 2026-05-06
- [x] **ParsePreview 컴포넌트** (`src/components/memo/ParsePreview.tsx`): 파싱 결과 미리보기 — 품목별 이름·수량·단위·카테고리 표시, 매칭 실패 항목 빨간 표시, MemoItem 재사용 ✅ 2026-05-06
- [x] **MemoItem 컴포넌트** (`src/components/memo/MemoItem.tsx`): 체크박스 + 품목 + 수량 조정, 수동 편집 가능, ParsePreview에 통합 ✅ 2026-05-06
- [x] **MemoList 컴포넌트** (`src/components/memo/MemoList.tsx`): 저장된 메모 목록, 생성일 + 항목 수 표시, 탭으로 재선택 ✅ 2026-05-06
- [x] **MemoFooter 컴포넌트** (`src/components/memo/MemoFooter.tsx`): "장바구니에 추가" 버튼 + 선택 항목 수 표시 (체크된 항목만 카트 추가) ✅ 2026-05-06

**완료 기준**: 텍스트 입력 → 파싱 결과 표시 (더미 파싱), 장바구니 추가 버튼 동작

---

#### Task 012: 장바구니 + 결제 UI 구현 (F004, F005)

**목적**: 카드별 그룹 장바구니 + 토스페이먼츠 결제 화면 구현

**디자인 참조**: `docs/handoff/05-components-spec.md` - 08 Cart, 09 Checkout

**구현 항목**:

- [x] **장바구니 페이지** (`src/app/(main)/cart/page.tsx`): `useCartStore.items` 기반 Client 렌더링, 전체/개별 체크박스 선택, 선택 합계 연동 ✅ 2026-05-06
- [x] **FreeShippingBar 컴포넌트** (`src/components/cart/free-shipping-bar.tsx`): 무료배송까지 N원 + 진행률 바 (mocha-700 색상) ✅ 2026-05-06
- [x] **CartGroup 컴포넌트** (`src/components/cart/cart-group.tsx`): 카드 단위 그룹핑, 카드 이름 + 테마 뱃지 헤더 ✅ 2026-05-06
- [x] **CartItem 컴포넌트** (`src/components/cart/cart-item-row.tsx`): 체크박스 + 이모지 + 이름 + 수량 ±조정 + 가격, `useCartStore.setQty()` / `remove()` 연동 ✅ 2026-05-06
- [x] **CartSummary 컴포넌트** (`src/components/cart/cart-summary.tsx`): 상품 합계 + 배송비 + 쿠폰·포인트 할인 + 최종 금액 (배송은 스토어 정책 반영) ✅ 2026-05-06
- [x] **결제 페이지** (`src/app/(main)/checkout/page.tsx`): 주문 요약 + 배송지 + 결제 수단 + 최종 결제, **Toss SDK Plan B 플로우 완전 연동** (`prepareOrderAction` → sessionStorage → `requestPayment`) ✅ 2026-05-06
- [x] **AddressBlock 컴포넌트** (`src/components/checkout/address-block.tsx`): 배송지 선택·변경, 스토어 배송정책 안내 ✅ 2026-05-06
- [x] **PaymentSelector 컴포넌트** (`src/components/checkout/payment-selector.tsx`): 카카오페이·네이버페이·카드·계좌이체 선택 UI ✅ 2026-05-06
- [x] **BenefitBlock 컴포넌트** (`src/components/checkout/benefit-block.tsx`): 포인트 적용 + **쿠폰 선택** (3종 Mock, 최소 주문금액 조건 포함) ✅ 2026-05-06
- [x] **CheckoutFooter 컴포넌트** (`src/components/checkout/checkout-footer.tsx`): 최종 금액 표시 + "결제하기" CTA → 토스페이먼츠 SDK 실 연동 ✅ 2026-05-06
- [x] **결제 성공 페이지** (`src/app/(main)/checkout/success/page.tsx`): `confirmAndCreateOrderAction` 호출, 성공/에러 UI, 자동 홈 이동 ✅ 2026-05-06
- [x] **후처리 공유** (`src/lib/actions/orders.ts`, `src/lib/api/`): freshpick-app Plan B 패턴 적용, 동일 Supabase DB의 `order·order_item·payment·payment_error_log·inventory` 테이블 공유 ✅ 2026-05-06

**완료 기준**: 장바구니 수량 조정, 삭제 동작, 결제 화면 렌더링 확인

---

#### Task 013: 카드 만들기 위저드 UI 구현 (F013)

**목적**: 4단계 카드 생성 위저드 화면 구현

**디자인 참조**: `docs/handoff/05-components-spec.md` - 10 Card Wizard

**구현 항목**:

- [x] **위저드 페이지** (`src/app/(main)/cards/new/page.tsx`): `'use client'` — 4단계 스텝 상태 관리 (React Hook Form + Zod)
- [x] **WizardProgress 컴포넌트** (`src/components/wizard/wizard-progress.tsx`): 1→4 단계 진행률 바, 활성 단계 mocha-700 강조
- [x] **Step1 - 테마 선택** (`src/components/wizard/steps/step1-theme.tsx`): 10종 카드 테마 중 선택, 카드 형태 선택 UI
- [x] **Step2 - 취향 태그** (`src/components/wizard/steps/step2-tags.tsx`): 취향 태그 선택 (최소 3개 필수), `required` 검증
- [x] **Step3 - 재료 + 예산** (`src/components/wizard/steps/step3-ingredients.tsx`): 재료 목록 추가 (품목명·수량·단위), 예상 예산 입력, 이미지 업로드 (Supabase Storage 자리 표시)
- [x] **Step4 - 미리보기** (`src/components/wizard/steps/step4-preview.tsx`): 생성될 카드 미리보기, `<MenuCard>` 컴포넌트 재활용
- [x] **WizardFooter 컴포넌트** (`src/components/wizard/wizard-footer.tsx`): 이전 / 다음 / 카드 만들기 버튼, 마지막 단계에서 저장 Server Action 호출 (Task 023에서 연동)

**완료 기준**: 4단계 스텝 전환 동작, 미리보기 렌더링 확인

---

#### Task 014: 내 섹션 관리 UI 구현 (F015)

**목적**: 카드메뉴 홈 탭 드래그앤드롭 편집 화면 구현

**구현 항목**:

- [x] **섹션 관리 페이지** (`src/app/(main)/sections/page.tsx`): 현재 탭 목록 편집 인터페이스 ✅ 2026-05-06
- [x] **SectionList 컴포넌트** (`src/components/sections/section-list.tsx`): 드래그앤드롭 탭 목록 (`@use-gesture/react` PointerCapture + `framer-motion` 스프링 애니메이션) ✅ 2026-05-06
- [x] **SectionItem 컴포넌트** (`src/components/sections/section-item.tsx`): 드래그 핸들 + 탭 이름 인라인 편집 + AI 자동 채움 토글 + 삭제 버튼 ✅ 2026-05-06
- [x] **AddSectionButton 컴포넌트** (`src/components/sections/add-section-button.tsx`): 새 섹션 이름 입력 → 추가, 이름 자유 입력 (예: "내맘대로 메뉴", "주는데로 먹어") ✅ 2026-05-06
- [x] **AI 자동 채움 토글** (`src/components/sections/ai-auto-fill-toggle.tsx`): ON 시 페르소나 컨텍스트 기반 AI 자동 카드 생성, OFF 시 "수동으로 카드를 골라 채워주세요" 안내 문구 ✅ 2026-05-06
- [x] **저장 Server Action 자리** (`src/lib/actions/sections/save.ts`): `saveSections()` Phase 1 stub — 검증 로직 + 결과 타입 유니온 정의, 실 DB 연동은 Task 030/031 ✅ 2026-05-06

**완료 기준**: 드래그앤드롭 순서 변경, 탭 이름 편집, 토글 동작 확인

---

#### Task 015: 키즈·청소년 모드 UI 구현 (F014)

**목적**: P8 초등·P9 중고생 전용 카드 뷰 + 마스코트 UI 구현

**디자인 참조**: `docs/handoff/05-components-spec.md` - 06 Kids Mode

**구현 항목**:

- [x] **키즈 모드 페이지** (`src/app/(main)/kids/page.tsx`): `'use client'` — 6개 컴포넌트 조합 ✅ 2026-05-06
- [x] **KidsHeader 컴포넌트** (`src/components/kids/kids-header.tsx`): "부모 모드 복귀" 버튼, 아이 이름 표시 ✅ 2026-05-06
- [x] **MascotBubble 컴포넌트** (`src/components/kids/mascot-bubble.tsx`): 🐰 마스코트 + 말풍선, Framer Motion 반동 애니메이션 (`y: [0,-14,2,-6,0]` 스프링 키프레임) ✅ 2026-05-06
- [x] **FoodPicker 컴포넌트** (`src/components/kids/food-picker.tsx`): 3×2 그리드, 80px hit target, 이모지+이름, 선택 시 올리브 테두리 ✅ 2026-05-06
- [x] **DailyMission 컴포넌트** (`src/components/kids/daily-mission.tsx`): 채소 도전 미션 카드, 진행률 바, 완료 시 honey 트로피 🏆 ✅ 2026-05-06
- [x] **BadgeGrid 컴포넌트** (`src/components/kids/badge-grid.tsx`): 4개 뱃지 잠금/해제, 잠금 시 `grayscale opacity-40` ✅ 2026-05-06
- [x] **KidsFooter 컴포넌트** (`src/components/kids/kids-footer.tsx`): 선택 음식 수 + "엄마한테 보내기", `useKidsStore` 연동 ✅ 2026-05-06

**완료 기준**: 키즈 모드 진입, 음식 선택, 미션 진행률 표시 확인

---

### Phase 2: 데이터베이스 + API + 핵심 기능 구현

> **Sprint 2 (후반) ~ Sprint 3 (Week 3~4) · P0**
> 실제 백엔드와 연결하여 더미 데이터를 실 데이터로 대체합니다.

---

#### Task 016: Supabase 데이터베이스 스키마 및 마이그레이션 ✅ 완료 (2026-05-06)

**목적**: PRD 데이터 모델 전체를 Supabase PostgreSQL에 구현 + pgvector + RLS 정책

**구현 항목**:

- [x] **핵심 테이블 마이그레이션**: `customer`, `customer_preference`, `menu_card`, `family_group`, `family_member`, `vote` 등 15개 테이블 SQL 완성 ✅ 2026-05-05 (`supabase/migrations/20260505_001_core_schema.sql`)
- [x] **음식 마스터·레시피 RAG 테이블**: `dish`, `card_dish`, `dish_recipe`, `dish_recipe_step`, `dish_ingredient` 테이블 SQL 완성 ✅ 2026-05-05
- [x] **사용자 노트 테이블** (F016 BP1): `card_note` 테이블 SQL 완성 ✅ 2026-05-05
- [x] **재료 메타 테이블** (F018 BP3): `ingredient_meta` (prep_tips, measurement_hints, substitutes) SQL 완성 ✅ 2026-05-05
- [x] **커머스 테이블**: `cart_item`, `orders`, `shopping_memo`, `memo_item` 테이블 SQL 완성 ✅ 2026-05-05
- [x] **AI/RAG 테이블**: `semantic_cache` (embedding vector(1536), expires_at 7일 TTL) SQL 완성 ✅ 2026-05-05
- [x] **pgvector 확장 + HNSW 인덱스**: `dish.embedding`, `dish_recipe.embedding`, `semantic_cache.embedding` HNSW cosine + pg_trgm SQL 완성 ✅ 2026-05-05
- [x] **RLS 정책**: 12개 테이블 Row Level Security + 정책 SQL 완성 ✅ 2026-05-05
- [x] **Supabase DB 실제 적용**: `supabase/migrations/20260505_002_freshpickai_fp_prefix.sql` 수동 적용 완료 ✅ 2026-05-06 (fp_ 프리픽스 19개 테이블 + HNSW 인덱스 + RLS 정책 + 헬퍼 함수 2개)
- [x] **TypeScript 타입 재생성** (`src/lib/supabase/database.types.ts`): fp_ 19개 테이블 + fp_search_dish·fp_match_cache 함수 타입 수동 추가, `npm run typecheck` 통과 ✅ 2026-05-06

**테스트 시나리오**:
```
- Playwright: Supabase dashboard에서 테이블 생성 확인
- SQL: RLS 정책 — 다른 사용자 데이터 조회 차단 확인
- SQL: pgvector 쿼리 실행 시간 200ms 이하 확인
```

**완료 기준**: 모든 마이그레이션 적용, `npm run typecheck` 통과 ✅

---

#### Task 017: CORRECTION_DICT 오타 보정 사전 구축 ✅ 완료 (2026-05-12)

**목적**: 장보기 메모 4-step 파싱 파이프라인의 한국어 식재료 오타 보정 사전 구축

**참조**: `docs/prompt/PROMPT-correction-dict-prelaunch.md`

**구현 항목**:

- [x] **타입 정의** (`src/lib/utils/correction-dict.types.ts`): `DictEntry { wrong: string; correct: string; source: 'manual'|'etl'|'user_feedback' }` ✅ 2026-05-05
- [x] **통합 사전 파일** (`src/data/correction-dict/dict.json`): 100개 한국어 식재료 오타 페어 (삽겹살→삼겹살, 게란→계란 등) ✅ 2026-05-05
- [x] **도메인 allowlist** (`src/data/correction-dict/domain-allowlist.txt`): 식재료·요리 표제어 약 300종 초기 수록 (ETL로 확장 예정) ✅ 2026-05-05
- [x] **applyCorrection() 함수** (`src/lib/utils/correction-dict.ts`): longest-key-first greedy replace 알고리즘, 재귀 안정성 보장 ✅ 2026-05-05
- [x] **ETL 파이프라인** (`src/scripts/build-correction-dict.ts`): 6단계 검증(충돌·순환·자모거리·재귀안정성·금칙어·identity) + ETL 소스 병합 구조 (3,000개 목표 — `loadEtlSource()` 확장 포인트) ✅ 2026-05-12
- [x] **단위 테스트** (`src/lib/utils/correction-dict.test.ts`): 18개 테스트 케이스 (달걀→계란, 재귀안정성, 복합오타, DictEntry 형식 검증) — Vitest 18/18 통과 ✅ 2026-05-12

**완료 기준**: `applyCorrection("계란 2판")` ✅ 정상 동작, 테스트 ✅ 18/18 통과 (2026-05-12)

---

#### Task 018: 카드메뉴 API 및 10종 카드 시스템 구현 (F001) ✅ 완료 (2026-05-12)

**목적**: 10종 카드 테마 데이터 구조 + API + Supabase 연동

**구현 항목**:

- [x] **카드 목록 API** (`src/app/api/cards/route.ts`): `GET /api/cards?category=meal&theme=chef_table`, Supabase `fp_menu_card` 테이블 조회, `createAdminClient()` (서비스 롤 키로 RLS 우회), theme/category/officialOnly 필터 지원 ✅ 2026-05-12
- [x] **카드 상세 API** (`src/app/api/cards/[id]/route.ts`): `GET /api/cards/[id]`, 카드 + `fp_card_dish` + `fp_dish` + `fp_dish_ingredient` 병렬 조회 반환 ✅ 2026-05-12
- [x] **데일리 픽 API** (`src/app/api/daily-pick/route.ts`): `GET /api/daily-pick`, 날짜 기반 seed 인덱스(`(year×10000 + month×100 + day) % count`)로 매일 다른 공식 카드 노출 ✅ 2026-05-12
- [x] **10종 카드 시드 데이터** (`src/scripts/seed-cards.ts`): 공식 10종 테마 × 3장 = 30장 카드 시드, `fp_card_dish` 매핑 30건. 결정론적 UUID + `upsert(onConflict)` 멱등 설계 ✅ 2026-05-12
- [x] **음식 마스터 시드** (`src/scripts/seed-dishes.ts`): 10종 테마 × 3요리 = 30개 `fp_dish` + 118개 `fp_dish_ingredient` 시드. npm 스크립트 `seed:dishes`, `seed:cards`, `seed:all` 추가 ✅ 2026-05-12
- [x] **card_dish 매핑 시드**: 각 공식 카드에 1개 음식 매핑 (30건) ✅ 2026-05-12
- [ ] **dish_recipe_step 시드**: 주요 음식 약 30개에 평균 4단계 = 약 120개 단계 시드 — **Task 020으로 이관**
- [x] **Server Actions** (`src/lib/actions/cards/`): `getCards(filter)`, `getCard(id)`, `getDailyPick()` + 매퍼 패턴 (`mapCard`, `mapDish`, `mapIngredient`) ✅ 2026-05-12
- [x] **TanStack Query 훅** (`src/hooks/useCards.ts`): `useCards(filter)`, `useCard(id)`, `useDailyPick()` (staleTime 1시간) ✅ 2026-05-12
- [x] **홈 화면 실 데이터 연동** (`src/app/(main)/page.tsx`): `getCards({ officialOnly: true })` + `getDailyPick()` 병렬 호출, `export const dynamic = "force-dynamic"` SSR 강제 ✅ 2026-05-12
- [x] **공개 API 미들웨어 허용** (`src/lib/supabase/middleware.ts`): `/api/cards`, `/api/daily-pick` 비인증 접근 허용 ✅ 2026-05-12

**테스트 결과** (2026-05-12):
```
✅ GET /api/cards?official=true → 30개 카드 반환
✅ GET /api/cards?category=snack → 7개 비식사형 카드 반환
✅ GET /api/cards?theme=chef_table → 3개 카드 반환
✅ GET /api/cards/ca000001-0001-4000-8000-000000000001 → 카드+요리+재료 포함
✅ GET /api/daily-pick → 날짜 기반 오늘의 카드
✅ 홈 화면 실 데이터 카드 렌더링, 10종 테마 탭 전환 동작
✅ npm run check-all 통과 (0 errors), npm run build 성공 (Dynamic SSR)
```

**완료 기준**: ✅ 홈 화면에서 실 데이터로 카드 렌더링, 10종 탭 전환 동작

---

#### Task 019: 인증 API + 가족 그룹 관리 구현 (F010, F011) ✅ 완료 (2026-05-12)

**목적**: Supabase Auth 소셜 로그인 완성 + 가족 그룹 생성/참여 API

**구현 항목**:

- [x] **카카오 OAuth 연동** (`src/lib/actions/auth/kakao.ts`): `signInWithOAuth('kakao')` → `/auth/confirm` 콜백 처리, `exchangeCodeForSession` 후 홈 리다이렉트 ✅ 2026-05-12
- [x] **애플 OAuth 연동** (`src/lib/actions/auth/apple.ts`): `signInWithOAuth('apple')` 동일 패턴 ✅ 2026-05-12
- [x] **온보딩 Server Action** (`src/lib/actions/auth/onboarding.ts`): `saveOnboarding(values)` — `fp_user_profile` + `fp_user_preference` 동시 upsert. cookTime 문자열 → 분 파싱, budget 문자열 → `low/mid/high` 매핑 ✅ 2026-05-12
- [x] **가족 그룹 Server Actions** (`src/lib/actions/family/index.ts`): `createFamilyGroup(name)` (그룹 생성+멤버 등록), `getFamilyGroup()` (현재 유저 그룹 조회), `getFamilyMembers()` (멤버+프로필 JOIN) ✅ 2026-05-12
- [x] **초대 코드 실 연동** (`src/lib/actions/family/invite.ts`): 스텁 → Supabase 실 연동 교체. `fp_family_group.invite_code` 조회 → 중복 체크 → `fp_family_member` insert ✅ 2026-05-12
- [x] **useAuthStore 실 연동** (`src/components/auth/auth-sync.tsx`): `AuthSync` 클라이언트 컴포넌트, `onAuthStateChange` → `useAuthStore.login/logout()` 동기화, `Providers`에 포함 ✅ 2026-05-12
- [x] **온보딩 페이지 실 연동** (`src/app/onboarding/page.tsx`): `saveOnboarding()` 호출 후 `completeOnboarding()` + 홈 이동 ✅ 2026-05-12
- [x] **가족 API Route Handlers** (`/api/family/group`, `/api/family/join`): 테스트용 GET/POST 엔드포인트 ✅ 2026-05-12

**DB 제약조건 검증** (2026-05-12):
```
✅ fp_user_preference.user_id — UNIQUE INDEX (upsert onConflict 정상 동작)
✅ fp_user_profile.user_id    — PRIMARY KEY (upsert onConflict 정상 동작)
✅ fp_family_group.invite_code — UNIQUE INDEX (초대코드 중복 방지)
✅ fp_family_member.(group_id, user_id) — UNIQUE INDEX (중복 가입 방지)
✅ fp_user_preference → fp_user_profile FK (profile 먼저 upsert하는 순서 보장)
```

**테스트 결과** (2026-05-12):
```
✅ 카카오 OAuth: signInWithKakao() → Supabase OAuth URL 리다이렉트 → /auth/confirm 콜백 처리
✅ 온보딩 저장: fp_user_profile(display_name, onboarded_at) + fp_user_preference(wellness_goals, cook_time_min, budget_level) upsert 성공
✅ 가족 그룹 생성: fp_family_group INSERT + fp_family_member INSERT (테스트 그룹 '김씨 가족' / 코드 KIM123)
✅ 초대 코드 참여: KIM123으로 2번째 멤버 추가, fp_family_member 2건 확인
✅ 그룹 조회: 멤버+프로필 JOIN 쿼리 정상 (display_name, family_role, level 포함)
✅ npm run check-all 통과 (0 errors), npm run build 성공
```

**완료 기준**: ✅ 소셜 로그인 OAuth 플로우 동작, ✅ 온보딩 데이터 Supabase 저장, ✅ 가족 그룹 생성·초대 코드 참여 확인

---

#### Task 020: 카드 상세 + 건강·가격 인프라 API 구현 (F002) ✅ 완료 (2026-05-13)

**목적**: 건강 스코어 계산 + 제철 가격 비교 API 구현

**구현 항목**:

- [x] **건강 스코어 계산 모듈** (`src/lib/health-score.ts`): 저속노화 지수(항산화·가공도 키워드 매칭), 혈당 지수(HIGH_GI/LOW_GI 키워드 기반), 영양 밸런스(단백질·탄수화물·지방 비율 이상치 비교) — 각 0.0~1.0 반환, `overall = 0.35·slowAging + 0.35·glycemicIndex + 0.30·nutrition` ✅ 2026-05-13
- [x] **가격 비교 모듈** (`src/lib/price-compare.ts`): 월별 `SEASONAL_DISCOUNT` 맵(봄·가을 피크 25%, 겨울 5%), `isSeasonal = discount ≥ 0.2`, 홈메이드·외식·배달·카페 4행 비교표 반환 ✅ 2026-05-13
- [x] **카드 상세 통합 Server Action** (`src/lib/actions/cards/detail.ts`): `getCardDetail(id)` — `fp_menu_card` + `fp_card_dish` + `fp_dish` + `fp_dish_ingredient` + `fp_dish_recipe(status=approved)` + `fp_ingredient_meta` 병렬 조회, `CardDetail` 타입 통합 반환 ✅ 2026-05-13
- [x] **재료 메타 Server Action** (`src/lib/actions/cards/ingredient-meta.ts`, F018): `getIngredientMeta(name)` 단건, `getIngredientMetaBatch(names[])` 배치 — `fp_ingredient_meta`(손질법·계량·대체재료) 반환 ✅ 2026-05-13
- [x] **카드 상세 페이지 Server Component 전환** (`src/app/(main)/cards/[id]/page.tsx`): `"use client"` 모크 → RSC + `getCardDetail()` SSR, `CardDetailClient` Client Island 분리 ✅ 2026-05-13
- [x] **DishList 레시피 확장 인터랙션** (`src/components/detail/dish-list.tsx`): `useState` 클릭 확장/축소, `dish.recipe.body` 표시, `⏱ cookTime분` 메타 ✅ 2026-05-13
- [x] **PriceCompareSection 제철 배지** (`src/components/detail/price-compare-section.tsx`): `isSeasonal=true` → "🌿 제철 특가" 배지, `PriceCompareResult` 실 데이터 표시 ✅ 2026-05-13
- [x] **HealthScoreSection 3지표 연동** (`src/components/detail/health-score-section.tsx`): `healthScore3?: HealthScore` prop 우선, 폴백 `healthScore?: number` 유지 ✅ 2026-05-13
- [x] **IngredientMetaBlock 실 데이터 표시** (`src/components/detail/ingredient-meta-block.tsx`): `metas?: IngredientMeta[]` — 손질법·계량힌트·대체재료 목록 렌더링 ✅ 2026-05-13
- [x] **logout() 온보딩 상태 보존 버그 수정** (`src/lib/store.ts`): `logout()`이 `onboardingCompletedAt/onboardingSkippedAt` 초기화하던 버그 수정 → SSR 하이드레이션 리다이렉트 루프 해소 ✅ 2026-05-13
- [x] **테스트 API 엔드포인트** (`src/app/api/test/card-detail/route.ts`): dev-only GET — `getCardDetail(id)` JSON 반환, production 환경 404 가드 ✅ 2026-05-13

**DB 시드 데이터** (2026-05-13):
```sql
-- fp_dish_recipe: 갈비찜 대표 레시피 1건 삽입 (status='approved', ai_consent=true, 5단계 조리법)
-- fp_ingredient_meta: 소갈비/당근/무 손질법·계량힌트·대체재료 3건 삽입
```

**테스트 결과** (2026-05-13):
```
✅ 카드 상세 → 건강 스코어 3지표 표시 (저속노화 6/10·혈당 7/10·영양밸런스 1/10)
✅ 카드 상세 → 가격 비교 실 데이터 (홈메이드 13,500원 vs 외식 29,700원, 55% 절약)
✅ 카드 상세 → 제철 특가 배지 (5월 = 봄 피크 25% 할인, isSeasonal=true)
✅ 카드 상세 → 음식 목록 + 레시피 확장 클릭 인터랙션 (갈비찜 5단계 레시피)
✅ 카드 상세 → 재료 메타 표시 (소갈비 손질법, 당근 계량힌트, 무 대체재료)
✅ npm run check-all 통과 (TypeScript 0 errors, ESLint 0 errors, Prettier 완전 일치)
```

**완료 기준**: ✅ 건강 스코어 3지표 + 가격 비교 + 음식 목록 + 대표 레시피 실 데이터 렌더링 (2026-05-13)

---

#### Task 021: 장바구니 + 결제 API 구현 (F004, F005)

**목적**: 장바구니 Server Actions + 토스페이먼츠 결제 연동

**구현 항목**:

- [x] **장바구니 Server Actions** (`src/lib/actions/cart/index.ts`): `addBundleAction(cardId, ingredients)` — `fp_cart_item` 일괄 삽입, `setQtyAction`, `removeItemAction`, `clearCartAction`, `fetchCartItemsAction` ✅ 2026-05-13
- [x] **장바구니 TanStack Query 훅** (`src/hooks/useCart.ts`): `useCart()` — `fetchCartItemsAction` + `useCartStore` 초기 시드 동기화, `updateTag('cart')` (Next.js 16 호환) ✅ 2026-05-13
- [x] **주문 생성 Server Action** (`src/lib/actions/order/create.ts`): `createFpOrder()` — `fp_order` 레코드 생성, `confirmed` 상태 ✅ 2026-05-13
- [x] **토스페이먼츠 SDK 연동** (`src/lib/payments/toss.ts`): `confirmTossPayment()` · `cancelTossPayment()` — Plan B 패턴 (sessionStorage 직렬화 → 성공 페이지에서 승인) ✅ 2026-05-13
- [x] **결제 콜백 라우트** (`src/app/api/payments/confirm/route.ts`): `POST /api/payments/confirm` — Toss 승인 → 재고 검증 → `order/order_item/payment` INSERT → `fp_order` INSERT → `fp_cart_item` 비우기 → 실패 시 Toss 자동 취소 ✅ 2026-05-13
- [x] **결제 성공 페이지** (`src/app/(main)/checkout/success/page.tsx`): `confirmAndCreateOrderAction` 호출, 주문 번호 표시, 익일 06시 배송 예약 확인, 오류 시 Toss 자동 환불 안내 ✅ 2026-05-13
- [x] **배송지 관리** (`src/lib/actions/address/index.ts`): `getDefaultAddress()` · `getAddresses()` · `createAddress()` · `updateAddress()` — `public.address` 테이블 연동 ✅ 2026-05-13

**추가 수정 (버그 수정)**:
- [x] **OnboardingGuard 하이드레이션 버그 수정** (`src/components/layout/onboarding-guard.tsx`): Zustand persist 비동기 수화 완료 전 리다이렉트 루프 → `persist.onFinishHydration()` 구독으로 해소 ✅ 2026-05-13
- [x] **detail-footer addBundle DB 연동** (`src/components/detail/detail-footer.tsx`): 카드 상세 "모두 담기" → `addBundleAction` DB 저장 + 낙관적 store 업데이트 ✅ 2026-05-13

**테스트 시나리오**:
```
- Playwright: 카드 상세 "모두 담기" → 장바구니 → 결제 → 토스 샌드박스 결제 완료 확인
- Playwright: 수량 ±조정 → 총금액 실시간 업데이트 확인
- API: POST /orders → order_id 발급 + cart 비우기 확인
```

**테스트 결과** (2026-05-13):
```
✅ 장바구니 Server Actions — fp_cart_item DB 저장 확인 (Supabase SQL 직접 조회: 5 items)
✅ 결제 콜백 라우트 — POST /api/payments/confirm Toss 승인 API 호출 정상 연동
✅ 결제 성공 페이지 — 주문 번호 표시 + 익일 06시 배송 예약 문자열 렌더링 확인
✅ 온보딩 가드 하이드레이션 버그 해소 — 로그인 후 루프 없이 홈 정착 확인
✅ npm run check-all 통과 (TypeScript 0 errors, ESLint 0 errors, Prettier 완전 일치)
⚠️  Toss 샌드박스 헤드리스 팝업 제한: Playwright headless 환경에서 토스 팝업 미지원 (정상)
```

**완료 기준**: ✅ 장바구니 DB 저장, 결제 승인 라우트, 주문 레코드 생성, 성공 페이지 렌더링 확인 (2026-05-13)

---

#### Task 022: 장보기 메모 4-step 파싱 파이프라인 구현 (F012)

**목적**: 자연어 메모를 장바구니로 변환하는 4단계 파싱 파이프라인 구현

**참조**: `docs/prompt/PROMPT-correction-dict-prelaunch.md`

**구현 항목**:

- [x] **메모 파서** (`src/lib/utils/memo-parser.ts`): 4-step 파이프라인 구현 ✅
  - STEP1: `applyCorrection()` 오타 보정 (correction-dict.ts 활용)
  - STEP2: 수량 추출 (`2판`, `3봉지`, `500g` 등 단위 정규식 파싱, 공백 경계 처리 수정)
  - STEP3: 품목 매핑 (`fp_dish_ingredient` ILIKE → `fp_ingredient_meta` ILIKE → 2글자 prefix pg_trgm 폴백)
  - STEP4: 카테고리 분류 (식재료/과자 키워드 기반 자동 분류)
- [x] **메모 파싱 API** (`src/app/api/memo/parse/route.ts`): `POST /api/memo/parse { text }` → `ParsedItem[]` 반환 ✅
- [x] **메모 CRUD Server Actions** (`src/lib/actions/memo/index.ts`): `saveMemoAction()`, `getMemosAction()`, `deleteMemoAction()`, `addMemoToCartAction()` ✅
- [x] **memo-input.tsx 실제 API 연동**: 실제 `/api/memo/parse` 호출, 에러 처리 ✅
- [x] **memo-list.tsx DB 연동**: `getMemosAction()` 실 데이터, 삭제 버튼 ✅
- [x] **메모 저장 버튼**: 파싱 결과 → DB 저장 → 저장된 메모 탭으로 자동 전환 ✅

**테스트 결과** (2026-05-13):
```
✅ Playwright: "계란2판 새우깡3봉지" → {계란:2판 식재료, 새우깡:3봉지 과자} 2개 항목 정확 분리
✅ Playwright: 파싱 결과 → 장바구니 추가 → 장바구니(2) 계란·새우깡 표시 확인
✅ Playwright: "삼겹살2개 당근3개 양파1개" 3개 항목 파싱 + DB 저장 + 저장된 메모 탭 표시 확인
✅ 이메일 로그인 signInWithEmail Server Action 추가 (기존 더미 stub 교체)
✅ npm run typecheck 0 errors, npm run build 성공
```

**완료 기준**: ✅ 4-step 파싱 정상 동작, 장바구니 전송 확인 (2026-05-13)

---

#### Task 023: 카드 만들기 + 섹션 관리 API 구현 (F013, F015)

**목적**: 사용자 커스텀 카드 생성 + 섹션 탭 관리 Server Actions 구현

**구현 항목**:

- [ ] **카드 만들기 Server Action** (`src/lib/actions/cards/create.ts`): `createCard({ theme, title, description, cookTime, tags, ingredients, thumbnailUrl })` — `menu_card` + `card_ingredient` 트랜잭션 삽입
- [ ] **이미지 업로드** (`src/lib/actions/storage/upload.ts`): `uploadCardThumbnail(file)` — Supabase Storage `card-images` 버킷, 이미지 리사이즈 (1024px 최대)
- [ ] **섹션 관리 Server Actions** (`src/lib/actions/sections/`): `getSections()`, `createSection(name)`, `updateSection(id, { name, aiAutoFill, displayOrder, isActive })`, `deleteSection(id)`, `reorderSections(orderedIds)`
- [ ] **공식 탭 초기화** (`src/scripts/seed-sections.ts`): 신규 사용자용 10종 공식 섹션 기본 생성 스크립트 (`card_section` 테이블, `section_type: 'official'`)
- [ ] **섹션 내 카드 관리** (`src/lib/actions/sections/items.ts`): `addCardToSection(sectionId, cardId)`, `removeCardFromSection(sectionId, cardId)`, `reorderSectionCards(sectionId, orderedCardIds)`

**테스트 시나리오**:
```
- Playwright: 카드 만들기 4단계 완료 → menu_card 레코드 생성 + 홈 내 카드 탭 표시 확인
- Playwright: 섹션 관리 → 탭 순서 변경 → 홈 화면 탭 순서 반영 확인
- Playwright: 공식 탭 삭제 → 해당 사용자 홈에서만 숨김 확인
```

**완료 기준**: 카드 생성 저장, 섹션 CRUD 동작, 순서 변경 홈 반영

---

### Phase 3: AI 기능 + RAG 시스템 구현

> **Sprint 3 (후반) ~ Sprint 4 (Week 4~5) · P0/P1**
> AI 페르소나 채팅, pgvector RAG, ToolLoopAgent, 시맨틱 캐시를 순서대로 구현합니다.

---

#### Task 024: customer_preference + 페르소나 컨텍스트 빌더 구현

**목적**: 9 페르소나 RAG의 핵심인 사용자 컨텍스트 빌더 구현

**참조**: `docs/prompt/PROMPT-freshpick-v0.7d-ai-shopping-v3.md`

**구현 항목**:

- [ ] **페르소나 컨텍스트 빌더** (`src/lib/ai/persona-context.ts`): `buildPersonaContext(customerId)` 함수 — `customer` + `customer_preference` + 최근 주문 이력 + 가족 구성 조합 → 9 페르소나 분류 (P1 가족 매니저, P2 효율 1인식, P3 맞벌이 부부, P4 건강 시니어, P5 가성비 대학생, P6 프리미엄 미식가, P7 워킹맘, P8 막내셰프, P9 트렌드 큐레이터)
- [ ] **시스템 프롬프트 빌더** (`src/lib/ai/prompts.ts`): `buildChatPrompt(personaCtx)`, `buildMealSetPrompt(personaCtx)`, `buildReasonPrompt(personaCtx)` — 3종 프롬프트 빌더
- [ ] **customer_preference 입력 UI** (`src/components/profile/PreferenceForm.tsx`): 식이 태그(low_sodium·diet·omad·vegan 등), 조리 수준(beginner·intermediate·advanced), 선호 쇼핑 시간대 입력 폼
- [ ] **페르소나 자동 추론** (`src/lib/ai/persona-inference.ts`): `inferPersonaFromBehavior(customerId)` — 주문 이력·선택 패턴 기반 diet_tags 자동 보정

**완료 기준**: `buildPersonaContext()` 호출 시 9 페르소나 중 1개 분류 반환

---

#### Task 025: AI 채팅 + addToMemo Tool 구현 (F003)

> **BlockedBy**: Task 024 (페르소나 컨텍스트 빌더) 완료 후 진행

**목적**: Vercel AI SDK streamText + addToMemo Tool 완성

**참조**: `docs/prompt/PROMPT-freshpick-v0.7d-ai-shopping-v3.md`

**구현 항목**:

- [ ] **AI 채팅 Route Handler** (`src/app/api/ai/chat/route.ts`): Vercel AI SDK `streamText` 호출, `anthropic('claude-sonnet-4-6')` 모델, **9 페르소나 컨텍스트 + dish_recipe RAG 1차 매칭 (variant_name·diet_tags 우선) + tenant_item_ai_detail 2차 매칭 (재료 → 매장 상품)** 주입, SSE 스트리밍 응답
- [ ] **addToMemo Tool** (`src/lib/ai/tools/add-to-memo.ts`): `tool({ description, parameters: { items: z.array(z.object({name, qty, unit})) }, execute: async (args) => addMemo(args) })` — Vercel AI SDK 도구 정의
- [ ] **인라인 확인 카드** (`src/components/chat/AddToMemoConfirmCard.tsx`): addToMemo 호출 시 "메모에 추가하시겠어요?" 카드 UI, 확인/취소 버튼
- [ ] **Haiku 분류 레이어** (`src/lib/ai/classify.ts`): Claude Haiku 4.5로 빠른 질문 분류 (식재료 추천 vs 일반 대화 vs 장보기 메모), 캐시 키 정규화
- [ ] **스트리밍 에러 처리**: 네트워크 오류 시 재연결 로직, 30 req/min 레이트 리밋 처리, 에러 메시지 채팅창 표시
- [ ] **빠른칩 컨텍스트 주입**: 비건·매운맛·10분·8천원이하 칩 선택 시 시스템 프롬프트에 제약 조건 추가

**테스트 시나리오**:
```
- Playwright: "비건으로 바꿔줘" 입력 → SSE 스트리밍 텍스트 표시 → 카드 3개 추천 확인
- Playwright: "계란, 당근 사줘" 입력 → addToMemo 도구 호출 → 인라인 확인 카드 표시 확인
- 부하 테스트: 30 req/min 초과 시 에러 토스트 표시 확인
```

**완료 기준**: 자연어 요청 → 스트리밍 응답 + 카드 추천 완전 동작

---

#### Task 026: AI 추천 5테마 시스템 구현

**목적**: 홈 화면 AI 추천 섹션에 5가지 테마 큐레이팅 구현

**참조**: `docs/prompt/PROMPT-freshpick-v0.7d-ai-shopping-v3.md`

**구현 항목**:

- [ ] **5테마 추천 Route Handler** (`src/app/api/ai/recommend/route.ts`): 5테마 별 Vercel AI SDK `generateObject` 호출
  - 테마1: 오늘의한끼 (페르소나 기반 메뉴 세트, Claude Sonnet 4.6 + RAG chunk 주입)
  - 테마2: 지금이적기 (제철 재료 기반, `seasonal_ingredient` chunk 인용)
  - 테마3: 놓치면아까워요 (재고 소진 임박 상품, 임베딩 가중치 우선순위)
  - 테마4: 다시만나볼까요 (이전 주문 기반 재추천, `chunk` 사유 인용)
  - 테마5: 새로들어왔어요 (신규 상품, 임베딩 유사도 정렬)
- [ ] **추천 결과 스키마** (Zod `RecommendationSchema`): `{ theme, cards: [{ cardId, title, reason, confidence }] }`
- [ ] **홈 AI 추천 섹션** (`src/components/home/AIRecommendSection.tsx`): 5테마 탭 + 추천 카드 carousel, 신뢰도 배지 표시
- [ ] **세션 캐시** (sessionStorage 24h): 동일 세션 내 재방문 시 API 재호출 방지

**완료 기준**: 홈 화면 5테마 AI 추천 카드 표시 확인

---

#### Task 027: pgvector RAG 인프라 구축

> **BlockedBy**: Task 016 (Supabase DB 스키마 — `tenant_item_ai_detail` + `ai_query_cache` 마이그레이션) 완료 후 진행

**목적**: Supabase pgvector + HNSW 인덱스 기반 의미론적 검색 인프라 구축

**참조**: `docs/prompt/PROMPT-freshpick-v1.0-ai-rag-v2.md`

**구현 항목**:

- [ ] **임베딩 서비스** (`src/lib/ai/embedding.ts`): `embedText(text: string)` — OpenAI `text-embedding-3-small` (1536차원) 호출, 배치 처리 지원
- [ ] **임베딩 백필 스크립트** (`src/scripts/backfill-embeddings.ts`): `tenant_item_ai_detail` 전체 레코드 임베딩 생성·저장 (chunk_type 10종 × 상품 수)
- [ ] **Supabase Edge Function** (`supabase/functions/auto-embed/index.ts`): `tenant_item_master` INSERT/UPDATE 트리거 시 자동 재임베딩, `chunk_type` 10종 청크 생성 로직
- [ ] **pgvector 검색 함수** (`src/lib/ai/vector-search.ts`): `searchByVector(queryEmbedding, { topK, threshold, personaTags })` — HNSW cosine 검색 → pg_trgm 폴백 → ILIKE 폴백 3단계
- [ ] **customer_preference 임베딩** (`src/lib/ai/persona-embedding.ts`): `buildPersonaContext()` 결과 텍스트 임베딩 → `customer_preference.embedding` 저장
- [ ] **성능 검증**: pgvector 쿼리 실행 계획 분석, 200ms 이하 보장 (`EXPLAIN ANALYZE`)

**테스트 시나리오**:
```
- SQL: match_items('비건 두부 요리', limit=5) → 코사인 유사도 상위 5개 반환 확인
- 성능: 10,000 벡터 기준 검색 200ms 이하 확인
- Edge Function: tenant_item_master 신규 INSERT → auto-embed 트리거 확인
```

**완료 기준**: 벡터 검색 200ms 이하 동작, 임베딩 백필 완료

---

#### Task 028: ToolLoopAgent 5 Tools 구현

> **BlockedBy**: Task 027 (pgvector RAG 인프라 — `searchByVector()` 함수) 완료 후 진행

**목적**: Vercel AI SDK ToolLoopAgent 기반 5가지 도구 구현

**참조**: `docs/prompt/PROMPT-freshpick-v1.0-ai-rag-v2.md`

**구현 항목**:

- [ ] **searchItems Tool** (`src/lib/ai/tools/search-items.ts`): `mode: 'recipe' | 'item'` 파라미터로 내부 분기. `recipe` 모드 — dish_recipe pgvector 유사도 검색 (diet_tags·persona_tags 필터, F022 신규), `item` 모드 — tenant_item_ai_detail pgvector 유사도 검색 + pg_trgm 폴백. `{ query: string, mode: string, limit: number, personaTags: string[], dietTags?: string[] }` → 매칭 결과 반환. **5-tool 구조 유지 — searchDishRecipes는 searchItems 내부 분기로 통합**
- [ ] **getUserContext Tool** (`src/lib/ai/tools/get-user-context.ts`): `{ userId }` → `buildPersonaContext()` 결과 반환, 캐시 60초
- [ ] **getInventory Tool** (`src/lib/ai/tools/get-inventory.ts`): `{ itemIds: string[] }` → `v_store_inventory_item` 재고·가격 조회
- [ ] **addToCart Tool** (`src/lib/ai/tools/add-to-cart.ts`): `{ items: [{itemId, qty}] }` → `cart_item` 일괄 삽입, UI에서 확인 카드 표시 후 실행
- [ ] **addToMemo Tool (확장)** (`src/lib/ai/tools/add-to-memo.ts`): v0.7d 도구 → RAG 검색 결과 연동으로 품목 매핑 정확도 향상
- [ ] **ToolLoopAgent Route Handler** (`src/app/api/ai/agent/route.ts`): 5 도구 주입, `maxSteps: 5`, `stopWhen: 'done'`, 도구 호출 UI 이벤트 스트리밍
- [ ] **ToolCallIndicator 컴포넌트** (`src/components/chat/ToolCallIndicator.tsx`): searchItems/getInventory 호출 중 로딩 애니메이션 ("재고 확인 중...", "취향에 맞는 재료 검색 중...")
- [ ] **ActionableProductCard 컴포넌트** (`src/components/chat/ActionableProductCard.tsx`): addToCart CTA 내장 상품 카드

**테스트 시나리오**:
```
- Playwright: "10분 안에 만들 수 있는 비건 요리 재료 담아줘" → 5 Tool 순차 호출 → 장바구니 추가 확인
- Playwright: 도구 호출 중 ToolCallIndicator 표시 확인
- 단위 테스트: searchItems("두부") → pgvector 결과 반환 확인
```

**완료 기준**: ToolLoopAgent 5 도구 순차 호출, 장바구니 추가 완전 동작

---

#### Task 029: 시맨틱 캐시 + 자기보강 루프 구현

**목적**: AI 쿼리 시맨틱 캐시로 비용 절감 + LLM 결과 자기보강 루프

**참조**: `docs/prompt/PROMPT-freshpick-v1.0-ai-rag-v2.md`

**구현 항목**:

- [ ] **시맨틱 캐시 서비스** (`src/lib/ai/semantic-cache.ts`): `checkCache(queryEmbedding, threshold=0.95)` → `ai_query_cache` HIT 반환 / MISS 시 null, `saveCache(queryEmbedding, responsePayload, expiresAt)` — 7일 TTL
- [ ] **캐시 미들웨어** (`src/app/api/ai/chat/route.ts`에 통합): 요청 임베딩 → 캐시 조회 → HIT 시 즉시 반환, MISS 시 LLM 호출 → 결과 캐시 저장
- [ ] **자기보강 루프** (`src/lib/ai/self-reinforce.ts`): LLM 응답 결과 → `tenant_item_ai_detail` UPSERT (`status: 'REVIEW_NEEDED'`), 신뢰도 점수 0.85 미만 시 REVIEW_NEEDED 큐 등록
- [ ] **캐시 만료 정리 Edge Function** (`supabase/functions/cache-cleanup/index.ts`): 매일 03:00 KST 실행, `expires_at < NOW()` 레코드 삭제
- [ ] **Vercel AI SDK OpenTelemetry 연동** (`src/lib/ai/telemetry.ts`): 토큰 수·비용·응답 지연 추적, Vercel Analytics 대시보드 연동

**완료 기준**: 동일 쿼리 2회 요청 시 캐시 HIT, 토큰 0 소비 확인

---

#### Task 030: 우리가족 보드 실시간 기능 구현 (F011)

**목적**: Supabase Realtime 기반 투표 실시간 동기화 + 무비나이트 자동 카드 생성

**구현 항목**:

- [ ] **Supabase Realtime 투표 훅** (`src/hooks/useFamilyVoteRealtime.ts`): `supabase.channel('family-vote').on('postgres_changes', { table: 'family_vote' })` 구독, 투표 업데이트 실시간 UI 반영
- [ ] **투표 Server Action** (`src/lib/actions/family/vote.ts`): `castVote(groupId, cardId, voteType: 'like'|'dislike')` — `family_vote` upsert, 기존 투표 덮어쓰기
- [ ] **무비나이트 자동 카드 생성** (`src/lib/actions/family/movie-night.ts`): 장르 투표 집계 → Claude Sonnet 4.6으로 홈시네마 나이트 페어링 카드 자동 생성 (성인 버전 + 키즈 무알콜 버전 동시), `menu_card` 저장
- [ ] **실시간 랭킹 업데이트**: `family_vote` 변경 시 `PopularRanking` 자동 재계산, TOP5 실시간 갱신
- [ ] **Supabase Realtime RLS**: 가족 그룹 구성원만 해당 채널 구독 가능하도록 정책 설정

**테스트 시나리오**:
```
- Playwright (2탭): 디바이스 A에서 투표 → 디바이스 B에서 즉시 반영 확인 (3초 이내)
- Playwright: 금요 무비나이트 → 로맨스 투표 → 홈시네마 페어링 카드 자동 생성 확인
- 단위 테스트: castVote() 중복 투표 시 upsert (기존 덮어쓰기) 확인
```

**완료 기준**: 두 디바이스 동시 투표 실시간 동기화, 무비나이트 카드 자동 생성

---

#### Task 037: 카드 사용자 노트 3분류 시스템 구현 (F016 BP1)

> **BlockedBy**: Task 016 (DB 스키마 — card_note 테이블), Task 008 (UI 자리 표시)

**목적**: 카드별 팁·후기·질문 3분류 노트 + 운영자 답글 + RAG self-improving 입력 채널 구축

**구현 항목**:

- [ ] **노트 CRUD Server Actions** (`src/lib/actions/notes/`): `createNote()`, `listNotes(cardId, type?)`, `markHelpful(noteId)`, `replyAsAdmin(parentNoteId, content)` (운영자 권한 체크)
- [ ] **NoteList 컴포넌트** (`src/components/detail/NoteList.tsx`): 팁·후기·질문 필터 + 도움순/최신순 정렬, 운영자 답글 들여쓰기 인용 박스
- [ ] **CardNoteSection + NoteWriteDrawer 컴포넌트** 완성 (Task 008 자리 표시 → 실 동작)
- [ ] **자기보강 루프 트리거** (`src/lib/actions/notes/self-improve.ts`): `helpful_count >= 5` AND `ai_consent=true` 노트 감지 → Claude Haiku 4.5 LLM Judge 사실성 평가 → ≥ 4/5 통과 시 `dish_recipe`에 `source='user_note'`·`status='REVIEW_NEEDED'` UPSERT (자동 ACTIVE 승격 금지)

**테스트 시나리오**:
```
- Playwright: 카드 상세 → "내 노트 남기기" → 팁 작성 → 노트 목록 즉시 표시
- Playwright: 운영자 권한으로 질문 노트 답글 작성 → 인용 박스 표시
- 단위 테스트: helpful_count=5 도달 → self-improve 트리거 → dish_recipe REVIEW_NEEDED 등록
- 단위 테스트: ai_consent=false 노트 → self-improve 호출 0건
```

**완료 기준**: 3분류 노트 작성·조회·답글 동작, 자기보강 루프 트리거 검증

---

#### Task 038: 재료 메타 확장 구현 (F018 BP3)

> **BlockedBy**: Task 016 (DB 스키마 — card_ingredient 컬럼 확장), Task 020 (카드 상세 API), Task 037 (자기보강 루프 입력)

**목적**: 재료별 손질법·계량 힌트·대체 재료 정보 제공 + F003 RAG 변형 요청 정확도 강화

**구현 항목**:

- [ ] **재료 메타 시드** (`src/scripts/seed-ingredient-meta.ts`): 주요 재료 약 100종에 손질법·계량 힌트·대체 재료 시드 (예: 애호박 → 반달썰기 / 1큰술=15mL / 호박)
- [ ] **IngredientMetaBlock 컴포넌트** 완성 (Task 008 자리 표시 → 실제 데이터 연결)
- [ ] **F003 substitutes 우선 참조** (`src/lib/ai/tools/search-items.ts` recipe 모드): 사용자 알러지·식이 태그 매칭 시 `substitutes` JSONB에서 대체 재료 자동 제안
- [ ] **사용자 노트 → substitutes 자동 병합 큐**: helpful_count ≥ 10 도달 시 운영자 검수 큐 등록 → 승인 시 `card_ingredient.substitutes`에 자동 추가

**테스트 시나리오**:
```
- Playwright: 카드 상세 → 재료 펼치기 → 손질법·계량·대체 재료 표시
- Playwright: F003 채팅 "비건으로" → substitutes 기반 대체 추천 카드 반환
```

**완료 기준**: 재료 메타 시드 100종 적재, F003 substitutes 활용 추천 동작

---

#### Task 039: 카드 외부 공유 + OG 미리보기 구현 (F021 BP7)

> **BlockedBy**: Task 008 (UI 자리 표시 — ShareButton), Task 019 (인증 — 비로그인 미리보기 RLS)

**목적**: 카드 카카오톡 공유 + 비로그인 미리보기 → 신규 가입 유입 채널 구축

**구현 항목**:

- [ ] **카카오 SDK 통합** (`src/lib/share/kakao.ts`): 카카오 JavaScript SDK 동적 로드, `Kakao.Share.sendCustom` 호출. 백업: Web Share API
- [ ] **OG 메타 동적 생성 라우트** (`src/app/cards/[id]/opengraph-image.tsx`): Next.js `ImageResponse` 활용, 메뉴 이미지 + 제목 + 건강 스코어 + 브랜드 워터마크
- [ ] **비로그인 카드 미리보기 페이지** (`src/app/cards/[id]/preview/page.tsx`): 카드 1개 정보 표시 + "FreshPickAI 시작하기" CTA → F010 카카오 1초 시작 유도. 공식 카드는 공개, 사용자 커스텀 카드는 작성자 동의 시 공개
- [ ] **ShareButton 컴포넌트** 완성 (Task 008 자리 표시 → 실 동작)
- [ ] **공유 추적 이벤트** (PostHog `card_shared`): 카드 ID, 공유 채널(kakao·webshare), 신규 가입 전환 측정

**테스트 시나리오**:
```
- Playwright: 카드 상세 → 공유 버튼 → 카카오톡 미리보기 표시 (모킹)
- 수동 검증: 실제 카카오톡 앱에서 OG 미리보기 (이미지·제목·건강 스코어) 정상 노출
- Playwright: 비로그인 → 공유 링크 → 카드 미리보기 → 카카오 1초 시작 진입
```

**완료 기준**: 카카오톡 공유 + OG 미리보기 동작, 비로그인 미리보기 → 가입 전환 측정

---

#### Task 040: 카드 만들기 위저드 강화 (F013 + BP4)

> **BlockedBy**: Task 023 (카드 만들기 API), Task 037 (검수 큐 패턴 공유)

**목적**: 가이드 키워드 placeholder + 검수 큐로 사용자 카드 품질 보장

**구현 항목**:

- [ ] **가이드 키워드 시스템** (`src/data/wizard-guide-keywords.ts`): 카드테마별 추천 메뉴명 패턴, 재료별 손질법·대체 재료 자동완성
- [ ] **Step3 강화** (`src/components/wizard/steps/Step3Ingredients.tsx`): 재료 입력 시 `prep_method`·`substitutes` 함께 입력 가능한 펼침 영역 (F018 시너지)
- [ ] **카드 검수 상태 컬럼**: `menu_card`에 `review_status TEXT DEFAULT 'private'` 추가 (private·pending·approved·rejected). 사용자 카드는 기본 private (본인에게만 노출)
- [ ] **검수 신청 버튼**: 카드 만들기 완료 후 "공식 카드섹션에 신청" 버튼 → `review_status='pending'`
- [ ] **AI 학습 동의** (선택): 카드 작성자 동의 시 승인된 카드 레시피가 `dish_recipe`에 `source='user_note'`로 자동 등록

**테스트 시나리오**:
```
- Playwright: 카드 만들기 → 메뉴명 placeholder "○○네 김치찌개" 표시
- Playwright: 재료 입력 → prep_method·substitutes 펼침 영역 표시
- Playwright: 카드 저장 → review_status='private' → 본인 홈에만 노출
```

**완료 기준**: 위저드 가이드 키워드 동작, 검수 신청 → pending 상태 전환

---

#### Task 041: F019 온보딩 슬라이드 백엔드 연동 (BP5)

> **BlockedBy**: Task 006 (UI 자리 표시 — OnboardingCarousel), Task 016 (customer_preference 컬럼)

**목적**: Task 006 UI 자리 표시 → 실제 데이터 + 진입 가드 동작

**구현 항목**:

- [ ] **온보딩 진입 가드 미들웨어**: `src/middleware.ts` 또는 `(main)/layout.tsx`에서 `customer_preference.onboarding_completed_at IS NULL` 체크 → `/auth/onboarding` 리디렉션
- [ ] **마이페이지 "온보딩 다시 보기"**: 마이페이지 메뉴 항목 추가, `onboarding_skipped_at` 무시하고 재진입 가능
- [ ] **온보딩 슬라이드 콘텐츠 데이터**: 슬라이드 5장의 카드 미리보기·페르소나 데모 실 데이터 (10종 카드 시드와 연결)
- [ ] **신규 사용자 가입 후 슬라이드 → 페르소나 태그 → 카드 홈 흐름** E2E 테스트

**완료 기준**: 신규 사용자 가입 후 자동 슬라이드 진입, [건너뛰기] → `onboarding_skipped_at` 기록 + 마이페이지 재진입 동작

---

### Phase 4: 고급 기능 + 품질 + 배포

> **Sprint 5 (Week 6) · P1/P2**
> 키즈 모드 완성, 성능 최적화, Playwright E2E, PWA, CI/CD 파이프라인 구축.

---

#### Task 031: 키즈·청소년 모드 기능 구현 (F014)

**목적**: 아이 선호 별점 반영 + 다음 주 카드 자동 반영 기능 구현

**구현 항목**:

- [ ] **아이 선호 저장 Server Action** (`src/lib/actions/kids/preference.ts`): `saveKidsPicks(groupId, picks: KidsPick[])` — 가족 보드 아이 선호 섹션 업데이트
- [ ] **별점 반영 로직** (`src/lib/actions/kids/rating.ts`): `rateCard(cardId, rating: 1~5)` — `family_vote` 별점 저장, 다음 주 홈 카드 섹션 자동 반영 가중치 업데이트
- [ ] **간식팩·K-디저트·드라마 카드 필터** (`src/hooks/useKidsFilter.ts`): 키즈 모드 진입 시 `chunk_type: ['snack_pack', 'k_dessert', 'drama_recipe']` 자동 필터
- [ ] **부모 알림 연동 자리**: 아이가 "엄마한테 보내기" 실행 시 `useKidsStore.picks` → 가족 보드 아이 선호 섹션 push (FCM은 P2, 현재는 Realtime 업데이트)
- [ ] **학년별 맞춤 필터**: 초등(간식팩·K-디저트·드라마), 중고생(트렌드·글로벌·홈시네마) 분기 로직

**완료 기준**: 키즈 음식 선택 → 가족 보드 아이 선호 섹션 반영, 별점 저장 확인

---

#### Task 042 (P2): F017 인터랙티브 조리 UX + F020 냉장고 비우기 모드 (BP2 + BP6)

> **주의**: 이 Task는 P2이므로 MVP 출시 게이트에 포함되지 않습니다. v1.1 차기 Sprint로 분리합니다.
>
> **BlockedBy**: Task 008 (UI 자리 표시 — CookModeButton), Task 028 (ToolLoopAgent — searchItems 확장), Task 016 (dish_recipe_step 테이블)

**목적**:
- F017: 카드 상세 → "이 카드로 요리하기" 진입 후 단계별 타이머·요약·북마크 인터랙티브 UX
- F020: F003 채팅에 "냉장고 비우기" 모드 추가 (보유 재료 → 매칭 카드 추천)

**구현 항목 (F017)**:

- [ ] **CookMode 페이지** (`src/app/(main)/cards/[id]/cook/page.tsx`): floating 4-action 바 (요약·공유·북마크·노트보기)
- [ ] **RecipeStepTimer** PWA 푸시 (v0.7 PWA 셸 활용)
- [ ] **북마크 시스템** — `customer_card_bookmark` 신규 테이블 (단계별 북마크)
- [ ] **요약 BottomSheet** — 단계별 텍스트 + 사진 양방향 동기화

**구현 항목 (F020)**:

- [ ] **냉장고 비우기 모드 UI** (`src/components/chat/FridgeMode.tsx`): 보유 재료 칩 입력 + AI 매칭 카드 3개
- [ ] **F003 ToolLoopAgent 확장**: `searchItems` recipe 모드에 `availableIngredients[]` 파라미터 추가 → ingredient overlap 점수 가중치
- [ ] **F015 가상 섹션 "냉장고 비우기"**: AI 자동 채움 ON 기본값, 보유 재료 칩이 있으면 우선 활성화

**완료 기준**: P2 — v1.1 Sprint에서 검증

---

#### Task 032: 카드섹션 AI 자동 채움 + 드래그앤드롭 완성 (F015)

**목적**: AI 자동 채움 ON 시 페르소나 컨텍스트 기반 카드 자동 생성 구현

**구현 항목**:

- [ ] **AI 자동 채움 Route Handler** (`src/app/api/sections/auto-fill/route.ts`): `POST /api/sections/auto-fill { sectionId }` → 섹션명 + 페르소나 컨텍스트 → Claude Haiku 4.5 `generateObject` → 카드 3개 자동 생성
- [ ] **드래그앤드롭 완성** (`src/components/sections/SectionList.tsx`): `@dnd-kit/core` 기반 DnD, 터치 디바이스 지원 (`@dnd-kit/sortable` `TouchSensor`), 드롭 후 `reorderSections()` Server Action 호출
- [ ] **AI 자동 채움 토글 반응**: `card_section.ai_auto_fill = true` 저장 → 홈 재방문 시 해당 섹션 AI 카드 자동 갱신 (최대 24h 캐시)
- [ ] **섹션 실시간 순서 반영**: `reorderSections()` 후 홈 `SectionTabs` 즉시 업데이트, `revalidateTag('sections')`

**완료 기준**: 드래그앤드롭 모바일 터치 동작, AI 자동 채움 ON 시 카드 자동 표시

---

#### Task 033: 성능 최적화 + Lighthouse 90+ 달성

**목적**: 모바일 Lighthouse 90+ 달성, Core Web Vitals 최적화

**구현 항목**:

- [ ] **이미지 최적화**: Next.js `<Image>` 컴포넌트 전환, `sizes` 속성 설정, Supabase Storage WebP 변환
- [ ] **번들 분석**: `next/bundle-analyzer` 실행, 청크 분할 최적화 (`dynamic import`)
- [ ] **React Suspense + 스트리밍**: 카드 목록·AI 응답 Suspense 경계 추가, `<Skeleton>` 컴포넌트 적용
- [ ] **TanStack Query 캐시 전략**: `staleTime`, `gcTime` 최적화, Prefetch 적용 (카드 상세 hover 시 prefetch)
- [ ] **Lighthouse CI 측정**: 홈·카드 상세·AI 채팅·장바구니 4개 핵심 화면 Mobile 90+ 달성
- [ ] **폰트 최적화**: `next/font` Pretendard subset 로딩, Bree Serif preload

**완료 기준**: Lighthouse Mobile 4개 핵심 화면 모두 90 이상

---

#### Task 034: Playwright E2E 테스트 (9 페르소나 × 10종 카드 골든 셋)

**목적**: 핵심 사용자 플로우 E2E 테스트 자동화

**구현 항목**:

- [ ] **인증 플로우 테스트** (`tests/auth.spec.ts`): 카카오 로그인 → 온보딩 → 홈 이동, 로그아웃 → 보호 라우트 차단 확인
- [ ] **카드 구매 플로우 테스트** (`tests/purchase.spec.ts`): 홈 → 카드 상세 → "모두 담기" → 장바구니 → 결제 완료 (토스 샌드박스)
- [ ] **AI 채팅 테스트** (`tests/ai-chat.spec.ts`): "비건으로 바꿔줘" → 스트리밍 응답 → 카드 추천 → 담기 연결
- [ ] **가족 투표 실시간 테스트** (`tests/family-vote.spec.ts`): 2개 브라우저 컨텍스트 → 투표 → 3초 이내 동기화 확인
- [ ] **메모 파싱 테스트** (`tests/memo.spec.ts`): "계란2판 새우깡3봉지" 입력 → 파싱 결과 확인 → 장바구니 추가
- [ ] **9 페르소나 × 10종 카드 골든 셋** (`tests/golden-set/`): 각 페르소나별 카드 추천 결과 품질 검증 300건 — P1 가족 매니저 × 셰프스 테이블 조합 등
- [ ] **`npm run check-all`에 E2E 통합**: `playwright test` 전체 실행, CI 게이트 등록

**완료 기준**: E2E 핵심 시나리오 5개 이상 그린, 골든 셋 통과율 90% 이상

---

#### Task 035: PWA + 접근성 (WCAG AA) + 모니터링

**목적**: PWA 오프라인 지원 + WCAG AA 접근성 + Sentry/PostHog 에러·사용자 분석

**구현 항목**:

- [ ] **PWA 설정** (`src/app/manifest.ts`): `next-pwa` 또는 `@ducanh2912/next-pwa` 설정, offline shell 제공, `src/sw.ts` Service Worker
- [ ] **오프라인 폴백 페이지** (`src/app/offline/page.tsx`): 오프라인 상태 감지 + 안내 UI, 장바구니·메모는 Zustand persist로 오프라인 표시
- [ ] **WCAG AA 접근성**: axe-core 검사 통과, 모든 인터랙션 hit target 44px 이상, 색상 대비 4.5:1 이상, 스크린 리더 aria-label 적용
- [ ] **Sentry 에러 모니터링**: `@sentry/nextjs` 설정, 클라이언트·서버 에러 캡처, Sentry Release 연동
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
- [ ] **환경 변수 관리**: Vercel Environment Variables에 `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `RAG_VECTOR_THRESHOLD`, `RAG_CACHE_THRESHOLD` 등 프로덕션 값 설정
- [ ] **Edge Runtime 최적화**: AI 채팅 Route Handler `export const runtime = 'edge'` 설정, 전 세계 레이턴시 최소화
- [ ] **배포 후 스모크 테스트**: 프로덕션 배포 완료 후 핵심 API 헬스체크 자동 실행

**완료 기준**: PR → CI 자동 실행, main merge → 프로덕션 자동 배포, 배포 후 헬스체크 통과

---

## 출시 후 (P2) — 차기 계획

다음 기능은 베타 출시 이후 사용자 데이터와 피드백을 기반으로 우선순위를 결정합니다.

| 기능 | 설명 | 예상 Sprint |
|------|------|------------|
| **F017 인터랙티브 조리 UX (BP2)** | 카드 요리 모드 + 타이머·요약·북마크 + PWA 푸시 (Task 042) | Sprint +1 |
| **F020 냉장고 비우기 모드 (BP6)** | 보유 재료 입력 → AI 매칭 카드 추천 (Task 042) | Sprint +1 |
| FCM 푸시 알림 | 가족 투표·무비나이트·배송 알림 | Sprint +1 |
| OCR 메모 | 카메라로 장보기 메모 촬영 → 자동 파싱 | Sprint +2 |
| 검색 + 필터 고도화 | 전문 검색 UX (자동완성·필터 조합) | Sprint +2 |
| 영양분석 그래프 | 주간 영양 섭취 분석 시각화 | Sprint +2 |
| **dish_recipe 운영자 검수 큐 (manager-app)** | REVIEW_NEEDED 노트 → ACTIVE 승격 워크플로 | Sprint +2 |
| 정기배송 | 주 1회 자동 주문 구독 | Sprint +3 |
| 멀티 매장 비교 | "다른 가게에서 더 싸요" 가격 비교 | Sprint +3 |
| 음성 입력 | 마이크로 장보기 메모 입력 | Sprint +4 |
| OTT 시청 기록 연동 | 넷플릭스 Top10 자동 드라마 카드 생성 | Sprint +4 |
| 게이미피케이션 | 마스코트 레벨업·업적·리더보드 | Sprint +4 |
| 전통주 구독 연동 | 홈시네마 나이트 성인 페어링 확장 | Sprint +5 |

---

## 환경 변수 체크리스트

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # 서버 전용 (절대 클라이언트 노출 금지)

# AI
ANTHROPIC_API_KEY=                    # Claude Sonnet 4.6 / Haiku 4.5
OPENAI_API_KEY=                       # text-embedding-3-small 임베딩 전용

# RAG 설정
RAG_VECTOR_THRESHOLD=0.75             # pgvector 검색 컷오프 (기본값)
RAG_CACHE_THRESHOLD=0.95              # 시맨틱 캐시 적중 임계값 (기본값)

# 결제
TOSSPAYMENTS_SECRET_KEY=              # 토스페이먼츠 시크릿키 (서버 전용)
NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY=  # 토스페이먼츠 클라이언트 키

# 카카오 OAuth
NEXT_PUBLIC_KAKAO_APP_KEY=

# 모니터링 (선택)
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## 파일 구조 참조

```
D:\freshpickai-app\
├── src/
│   ├── app/
│   │   ├── (auth)/login/              ← Task 006
│   │   ├── (main)/
│   │   │   ├── layout.tsx             ← Task 004 (BottomTabNav)
│   │   │   ├── page.tsx               ← Task 007 (홈)
│   │   │   ├── chat/page.tsx          ← Task 009 (AI 채팅)
│   │   │   ├── family/page.tsx        ← Task 010 (가족 보드)
│   │   │   ├── kids/page.tsx          ← Task 015 (키즈 모드)
│   │   │   ├── memo/page.tsx          ← Task 011 (장보기 메모)
│   │   │   ├── cart/page.tsx          ← Task 012 (장바구니)
│   │   │   ├── checkout/page.tsx      ← Task 012 (결제)
│   │   │   ├── cards/[id]/page.tsx    ← Task 008 (카드 상세)
│   │   │   ├── cards/new/page.tsx     ← Task 013 (카드 만들기)
│   │   │   └── sections/page.tsx      ← Task 014 (섹션 관리)
│   │   └── api/
│   │       ├── ai/chat/route.ts       ← Task 025
│   │       ├── ai/agent/route.ts      ← Task 028
│   │       ├── ai/recommend/route.ts  ← Task 026
│   │       ├── cards/route.ts         ← Task 018
│   │       ├── memo/parse/route.ts    ← Task 022
│   │       ├── payments/confirm/      ← Task 021
│   │       └── sections/auto-fill/    ← Task 032
│   ├── components/
│   │   ├── ui/                        ← Task 005 (디자인 시스템)
│   │   ├── layout/                    ← Task 004
│   │   ├── auth/                      ← Task 006, 041
│   │   │   ├── OnboardingCarousel.tsx ← F019 BP5 (Task 006)
│   │   │   └── OnboardingForm.tsx
│   │   ├── home/                      ← Task 007
│   │   ├── detail/                    ← Task 008, 037~039
│   │   │   ├── DishList.tsx           ← F022 (Task 008)
│   │   │   ├── IngredientMetaBlock.tsx ← F018 BP3 (Task 008, 038)
│   │   │   ├── CardNoteSection.tsx    ← F016 BP1 (Task 008, 037)
│   │   │   ├── NoteWriteDrawer.tsx    ← F016 BP1 (Task 037)
│   │   │   ├── ShareButton.tsx        ← F021 BP7 (Task 008, 039)
│   │   │   └── CookModeButton.tsx     ← F017 BP2 자리 표시 (Task 008)
│   │   ├── chat/                      ← Task 009, 025, 028
│   │   │   └── FridgeMode.tsx         ← F020 BP6 P2 (Task 042)
│   │   ├── family/                    ← Task 010, 030
│   │   ├── memo/                      ← Task 011, 022
│   │   ├── cart/                      ← Task 012
│   │   ├── checkout/                  ← Task 012
│   │   ├── wizard/                    ← Task 013, 040
│   │   ├── sections/                  ← Task 014, 032
│   │   ├── kids/                      ← Task 015, 031
│   │   └── profile/                   ← Task 024
│   ├── lib/
│   │   ├── supabase/                  ← Task 003
│   │   ├── ai/                        ← Task 024~029
│   │   │   ├── tools/                 ← Task 025, 028
│   │   │   │   └── search-items.ts    ← F022 recipe mode 통합 (Task 028)
│   │   │   ├── persona-context.ts     ← Task 024
│   │   │   ├── embedding.ts           ← Task 027
│   │   │   ├── vector-search.ts       ← Task 027
│   │   │   ├── semantic-cache.ts      ← Task 029
│   │   │   └── prompts.ts             ← Task 024
│   │   ├── actions/                   ← Task 019~023, 030~032, 037~042
│   │   │   ├── notes/                 ← F016 BP1 (Task 037)
│   │   │   │   └── self-improve.ts
│   │   │   └── ...
│   │   ├── share/                     ← F021 BP7 (Task 039)
│   │   │   └── kakao.ts
│   │   ├── payments/                  ← Task 021
│   │   ├── utils/
│   │   │   ├── correction-dict.ts     ← Task 017
│   │   │   └── memo-parser.ts         ← Task 022
│   │   ├── store.ts                   ← Task 002
│   │   ├── types.ts                   ← Task 002 (DishRecipe 등 추가)
│   │   └── api.ts                     ← Task 002
│   ├── hooks/                         ← Task 002, 018~022, 030
│   └── data/
│       ├── correction-dict/           ← Task 017
│       ├── wizard-guide-keywords.ts   ← BP4 (Task 040)
│       └── mock-cards.ts              ← Task 007
│   └── scripts/
│       ├── seed-cards.ts              ← Task 018
│       ├── seed-dishes.ts             ← F022 (Task 018)
│       ├── seed-ingredient-meta.ts    ← F018 BP3 (Task 038)
│       └── backfill-recipe-embeddings.ts ← F022 (Task 018)
├── supabase/
│   ├── migrations/                    ← Task 016
│   └── functions/                     ← Task 027, 029
├── tests/                             ← Task 034
└── docs/
    ├── PRD.md
    ├── ROADMAP.md                     ← 이 파일
    └── handoff/                       ← 디자인 핸드오프 참조
```

---

*최종 업데이트: 2026-05-05 (F016~F022 + Task 037~042 추가 — 응용 아키텍처 5계층 + 레시피 RAG + 우리들의식탁 BP 7종 반영)*
*다음 업데이트: 각 Task 완료 시 해당 항목 체크 후 갱신*
