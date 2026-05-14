# FreshPickAI 개발 로드맵 v0.1 (Phase 0~2 완료 아카이브)

> 가족을 위한 AI 큐레이팅 장보기 — 2026-05-13 기준 Phase 2까지 완료된 작업 아카이브

---

## 완료 현황 요약 (2026-05-13)

| 단계 | Task 수 | 완료일 |
|------|---------|--------|
| Phase 0: 프로젝트 기반 구축 | Task 001~004 | 2026-05-06 |
| Phase 1: UI/UX 디자인 시스템 | Task 005~015, 017 | 2026-05-12 |
| Phase 2: 데이터베이스 + API | Task 016, 018~023 | 2026-05-13 |

---

## Phase 0: 프로젝트 기반 + 공통 프레임워크 구축

> **Sprint 0 — Setup (Week 0, 3일)**

---

### Task 001: 프로젝트 환경 설정 및 공통 인프라 구축 ✅ 완료 (2026-05-12)

**목적**: Next.js 16 + TypeScript strict 환경, 코드 품질 자동화, Vercel 배포 파이프라인 구축

**구현 항목**:

- [x] Next.js 16 App Router + Turbopack 설정 확인 및 `tsconfig.json` strict 모드 검증 (`"strict": true`, `turbopack: {}`) ✅ 2026-05-12
- [x] Tailwind CSS 디자인 토큰 적용 (`docs/handoff/03-tailwind.config.ts` 기반 Mocha Mousse 팔레트 + Bree Serif/Pretendard 폰트) ✅ 2026-05-12
- [x] `src/app/globals.css` CSS 변수 설정 (`--paper`, `--line`, `--mocha-*`, `--olive-*`, `--ink-*`, `--sage`, `--honey`, `--terracotta`) ✅ 2026-05-12
- [x] shadcn/ui (new-york 스타일) 초기화 + 기본 컴포넌트 add ✅ 2026-05-06
- [x] ESLint + Prettier + Husky pre-commit 훅 설정 ✅ 2026-05-05
- [x] 환경 변수 설정 (`.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) ✅ 2026-05-12
- [x] `/api/mock/*` 경로로 백엔드 API 모킹 설정 ✅ 2026-05-06

**완료 기준**: `npm run check-all` ✅ + `npm run build` ✅ 정상 통과 (2026-05-12)

---

### Task 002: 공통 Lib 및 타입 시스템 구축 ✅ 완료 (2026-05-06)

**목적**: 전체 개발팀이 공통으로 사용할 타입 정의, 상태 스토어, API 클라이언트, 유틸리티 라이브러리 구축

**구현 항목**:

- [x] **TypeScript 도메인 타입 정의** (`src/lib/types.ts`): `FpUser`, `FamilyGroup`, `MenuCard`, `Dish`, `CartItem`, `ChatMessage`, `Vote`, `KidsPick`, `Memo`, `Order`, `CardSection`, `DishRecipe`, `DishRecipeStep`, `CardDish`, `CardNote`, `IngredientSubstitute` (fp_ 프리픽스 아키텍처 기반) ✅
- [x] **Zustand 스토어 초기화** (`src/lib/store.ts`): `useAuthStore`, `useCartStore`, `useChatStore`, `useKidsStore`, `useUIStore`, `useSectionStore` (모두 persist) ✅
- [x] **TanStack Query 설정** (`src/lib/query-client.ts`): `QueryClient` 기본 설정, `src/lib/query-keys.ts` 쿼리 키 컨벤션 ✅
- [x] **API 클라이언트** (`src/lib/api.ts`): `fetch` 래퍼, 인증 헤더 자동 주입, 에러 포맷 파싱 ✅
- [x] **공통 유틸리티** (`src/lib/utils.ts`): `cn()`, `formatPrice()`, `formatDate()`, `formatDeliveryTime()` ✅
- [x] **환경 변수 유효성 검사** (`src/lib/env.ts`) ✅

**완료 기준**: 모든 타입이 strict 모드에서 오류 없이 컴파일, 스토어 persist 동작 확인

---

### Task 003: 인증 시스템 및 미들웨어 구축 ✅ 완료 (2026-05-06)

**목적**: Supabase Auth 기반 소셜 로그인 + 미들웨어 인증 게이트 구축

**구현 항목**:

- [x] **Supabase 클라이언트 3종 설정**: `server.ts` (createAdminClient 포함), `client.ts`, `middleware.ts` (updateSession) ✅
- [x] **Supabase 데이터베이스 타입** (`src/lib/supabase/database.types.ts`) ✅
- [x] **미들웨어 인증 게이트** (`src/middleware.ts`): 비인증 사용자 → `/login` 리다이렉트 ✅
- [x] **카카오 소셜 로그인** Server Action (`src/lib/actions/auth/kakao.ts`) ✅
- [x] **애플 소셜 로그인** Server Action (`src/lib/actions/auth/apple.ts`) ✅
- [x] **세션 관리 유틸리티** (`src/lib/actions/auth/session.ts`): `getSession()`, `signOut()`, `refreshSession()` ✅

**완료 기준**: 비인증 상태에서 보호 라우트 접근 시 로그인 페이지로 리다이렉트 동작 확인

---

### Task 004: 애플리케이션 라우트 구조 및 레이아웃 골격 구축 ✅ 완료 (2026-05-06)

**목적**: 전체 App Router 라우트 구조와 공통 레이아웃을 먼저 구축하여 병렬 개발 가능하게 함

**구현 항목**:

- [x] **App Router 라우트 전체 생성**: `(auth)/login`, `(main)/` (홈), `(main)/chat`, `(main)/family`, `(main)/kids`, `(main)/memo`, `(main)/cart`, `(main)/checkout`, `(main)/cards/[id]`, `(main)/cards/new`, `(main)/sections` ✅
- [x] **루트 레이아웃** (`src/app/layout.tsx`): Bree Serif 폰트 로딩, `Providers` (QueryClientProvider + ThemeProvider + Toaster) ✅
- [x] **(main) 공통 레이아웃** (`src/app/(main)/layout.tsx`): `<BottomTabNav>` 포함 ✅
- [x] **BottomTabNav 컴포넌트** (`src/components/layout/bottom-tab-nav.tsx`): 홈·AI·가족·메모·장바구니 5탭 ✅
- [x] **공통 레이아웃 컴포넌트**: `<BrandHeader>`, `<PageHeader>`, `<BottomCTA>` ✅
- [x] **404 / 에러 페이지**: `not-found.tsx`, `error.tsx`, `loading.tsx` ✅

**완료 기준**: 모든 라우트 접근 가능, BottomTabNav 탭 전환 동작 확인

---

## Phase 1: UI/UX 디자인 시스템 + 화면별 디자인 구현 (더미 데이터)

> **Sprint 1 (Week 1~2) · P0** + **Sprint 2 (Week 3) · P0**
> 디자인 핸드오프(`docs/handoff/`) 기반 픽셀 페어리티 UI 구현. 백엔드 없이 더미 데이터로 동작.

---

### Task 005: 디자인 시스템 + 공통 컴포넌트 구현 ✅ 완료 (2026-05-12)

**구현 항목**:

- [x] **디자인 토큰 구현** (`src/app/globals.css`): Tailwind v4 `@theme` 블록 — Mocha Mousse, Olive, Paper/Line, Ink 4단계, Terracotta/Honey/Sage ✅
- [x] **Typography 컴포넌트**: DisplayXL(56px Bree)·DisplayL·DisplayM·Heading·Title·Body·Caption·Label ✅
- [x] **Button 컴포넌트**: `variant: 'primary'(mocha-700) | 'ghost' | 'olive'`, `size: 'sm' | 'md' | 'lg'` ✅
- [x] **Card 컴포넌트**: `.card-paper` 래퍼, `shadow-card`, hover 시 `shadow-hover`, 4px 코너 ✅
- [x] **Chip 컴포넌트**: 토글 가능 필터 칩, olive-100 bg + olive-500 활성 ✅
- [x] **MenuCard 컴포넌트**: 썸네일 + 테마 뱃지 + 타이틀 + 취향 태그 + 건강 스코어 + 가격 ✅
- [x] **LabelMark 컴포넌트**: uppercase Bree Serif caption, `letter-spacing: 2px`, olive-500 ✅
- [x] **HealthScoreBadge 컴포넌트**: 0~1.0 점수 → sage 색상 게이지 시각화 ✅
- [x] **공통 스켈레톤** (`src/components/ui/skeleton.tsx`) ✅

---

### Task 006: 로그인 + 온보딩 UI 구현 (F010) ✅ 완료 (2026-05-06)

**구현 항목**:

- [x] **로그인 페이지** (`src/app/(auth)/login/page.tsx`): Mocha Mousse 브랜드 헤더, 서비스 통계 행 ✅
- [x] **소셜 로그인 버튼** (`src/components/auth/social-buttons.tsx`): 카카오·애플·이메일 ✅
- [x] **이메일 로그인 폼** (`src/components/auth/email-login-form.tsx`): React Hook Form + Zod ✅
- [x] **온보딩 슬라이드** (`src/components/auth/onboarding-carousel.tsx`, F019 BP5): 5장 슬라이드, 모든 단계 [건너뛰기] CTA ✅
- [x] **OnboardingForm** (`src/components/auth/onboarding-form.tsx`): 가구 인원·웰빙 목표·요리시간·끼니 예산 입력 ✅
- [x] **인증 콜백 라우트** (`src/app/auth/confirm/route.ts`) ✅

---

### Task 007: 카드메뉴 홈 UI 구현 (F001) ✅ 완료 (2026-05-06)

**구현 항목**:

- [x] **홈 페이지** (`src/app/(main)/page.tsx`): RSC 기반 + `HomeBoard` Client Island 분리 ✅
- [x] **DailyHero 컴포넌트**: 오늘의 AI 큐레이팅 카드 + AI 신뢰도 배지 ✅
- [x] **CategoryFilter 컴포넌트**: `all | meal | snack | cinema` Chip 그룹 ✅
- [x] **CardGrid 컴포넌트**: 2열 그리드, TanStack Query 연동 ✅
- [x] **SectionTabs 컴포넌트**: 공식 11종 탭 + 사용자 정의 섹션 + 수평 스크롤 ✅
- [x] **AIBadge 컴포넌트**: pgvector 취향 매칭 배지 + 우리가족 TOP3 강조 배지 ✅
- [x] **더미 데이터** (`src/data/mock-cards.ts`, `src/data/mock-dishes.ts`): MVP 10종 20개 ✅

---

### Task 008: 카드 상세 UI 구현 (F002) ✅ 완료 (2026-05-06)

**구현 항목**:

- [x] **CardFlipper 컴포넌트**: `rotateY(180deg)` CSS flip, DishFront(앞면) + IngredientList(뒷면) ✅
- [x] **HealthScoreSection 컴포넌트**: 저속노화·혈당·영양 밸런스 3지표, sage 게이지 ✅
- [x] **PriceCompareSection 컴포넌트**: 홈메이드 vs 외식·배달·카페 비교 ✅
- [x] **DetailFooter 컴포넌트**: AI 변형 버튼 + "모두 담기" CTA ✅
- [x] **DishList 컴포넌트** (F022): N개 음식 표시, 레시피 확장/축소 인터랙션 ✅
- [x] **IngredientMetaBlock 컴포넌트** (F018 BP3): 손질법·계량·대체재료 표시 ✅
- [x] **CardNoteSection 컴포넌트** (F016 BP1): 팁·후기·질문 3분류 탭 ✅
- [x] **NoteWriteDrawer 컴포넌트** (F016 BP1): vaul Drawer, AI 학습 동의 체크박스 ✅
- [x] **ShareButton 컴포넌트** (F021 BP7): Web Share API + 클립보드 복사 fallback ✅
- [x] **CookModeButton 컴포넌트** (F017 P2 자리 표시): MVP 이후 활성화 예정 ✅

---

### Task 009: AI 채팅 UI 구현 (F003) ✅ 완료 (2026-05-06)

**구현 항목**:

- [x] **ChatHeader 컴포넌트**: AI 상태 표시 (연결중·대기·스트리밍), RAG 인디케이터 뱃지 ✅
- [x] **MessageList 컴포넌트**: 자동 스크롤 하단, 스트리밍 중 바운싱 도트 애니메이션 ✅
- [x] **RecCardCarousel 컴포넌트**: AI 추천 카드 수평 스크롤 carousel ✅
- [x] **QuickChips 컴포넌트**: 비건·매운맛·10분·8천원이하·초등간식 — 탭 시 send() 자동 호출 ✅
- [x] **ChatInput 컴포넌트**: 자동 높이 조절 textarea + 전송 버튼 ✅
- [x] **SSE 스트리밍 훅** (`src/hooks/use-chat-stream.ts`): 모킹 청크 스트리밍 ✅
- [x] **ToolCallIndicator 컴포넌트**: ToolLoopAgent 5도구 호출 진행 자리 표시 ✅

---

### Task 010: 우리가족 보드 UI 구현 (F011) ✅ 완료 (2026-05-06)

**구현 항목**:

- [x] **FamilyBanner 컴포넌트**: 가족 그룹명 + Lv 레벨 + 이번 달 끼니 카운터 ✅
- [x] **MemberGrid 컴포넌트**: `grid-cols-2`, 이모지 아바타 + 이름 + 역할 + 온라인 dot ✅
- [x] **DinnerVote 컴포넌트**: 투표 + 득표 진행률 바 + `useVoteCountdown` 훅 ✅
- [x] **PopularRanking 컴포넌트**: 이번 달 TOP5 메뉴 랭킹 ✅
- [x] **FamilyInvite 컴포넌트**: `qrcode.react` QR 렌더링 + `nanoid` 6자리 코드 + 카카오톡 공유 ✅
- [x] **초대 수락 페이지** (`src/app/(main)/family/invite/[code]/page.tsx`): 결과별 분기 화면 ✅

---

### Task 011: 장보기 메모 UI 구현 (F012) ✅ 완료 (2026-05-06)

**구현 항목**:

- [x] **MemoInput 컴포넌트**: 자유 텍스트 영역, 글자 수 카운터, AI 파싱 버튼 ✅
- [x] **ParsePreview 컴포넌트**: 파싱 결과 미리보기, 매칭 실패 항목 빨간 표시 ✅
- [x] **MemoItem 컴포넌트**: 체크박스 + 품목 + 수량 조정, 수동 편집 가능 ✅
- [x] **MemoList 컴포넌트**: 저장된 메모 목록, 생성일 + 항목 수 표시 ✅
- [x] **MemoFooter 컴포넌트**: "장바구니에 추가" 버튼 + 선택 항목 수 표시 ✅

---

### Task 012: 장바구니 + 결제 UI 구현 (F004, F005) ✅ 완료 (2026-05-06)

**구현 항목**:

- [x] **FreeShippingBar 컴포넌트**: 무료배송까지 N원 + 진행률 바 ✅
- [x] **CartGroup 컴포넌트**: 카드 단위 그룹핑 ✅
- [x] **CartItem 컴포넌트**: 체크박스 + 이모지 + 이름 + 수량 ±조정 + 가격 ✅
- [x] **결제 페이지** (`src/app/(main)/checkout/page.tsx`): Toss SDK Plan B 플로우 완전 연동 ✅
- [x] **PaymentSelector 컴포넌트**: 카카오페이·네이버페이·카드·계좌이체 선택 UI ✅
- [x] **BenefitBlock 컴포넌트**: 포인트 적용 + 쿠폰 선택 (3종 Mock) ✅
- [x] **결제 성공 페이지** (`src/app/(main)/checkout/success/page.tsx`) ✅

---

### Task 013: 카드 만들기 위저드 UI 구현 (F013) ✅ 완료 (2026-05-06)

**구현 항목**:

- [x] **WizardProgress 컴포넌트**: 1→4 단계 진행률 바 ✅
- [x] **Step1 - 테마 선택**: 10종 카드 테마 중 선택 ✅
- [x] **Step2 - 취향 태그**: 취향 태그 선택 (최소 3개 필수) ✅
- [x] **Step3 - 재료 + 예산**: 재료 목록 추가, 예산 입력, 이미지 업로드 자리 ✅
- [x] **Step4 - 미리보기**: `<MenuCard>` 컴포넌트 재활용 ✅
- [x] **WizardFooter 컴포넌트**: 이전 / 다음 / 카드 만들기 버튼 ✅

---

### Task 014: 내 섹션 관리 UI 구현 (F015) ✅ 완료 (2026-05-06)

**구현 항목**:

- [x] **SectionList 컴포넌트**: 드래그앤드롭 탭 목록 (`@use-gesture/react` + `framer-motion`) ✅
- [x] **SectionItem 컴포넌트**: 드래그 핸들 + 탭 이름 인라인 편집 + AI 자동 채움 토글 ✅
- [x] **AddSectionButton 컴포넌트**: 새 섹션 이름 입력 → 추가 ✅
- [x] **AI 자동 채움 토글** (`src/components/sections/ai-auto-fill-toggle.tsx`) ✅

---

### Task 015: 키즈·청소년 모드 UI 구현 (F014) ✅ 완료 (2026-05-06)

**구현 항목**:

- [x] **KidsHeader 컴포넌트**: "부모 모드 복귀" 버튼 ✅
- [x] **MascotBubble 컴포넌트**: 🐰 마스코트 + 말풍선, Framer Motion 반동 애니메이션 ✅
- [x] **FoodPicker 컴포넌트**: 3×2 그리드, 80px hit target, 선택 시 올리브 테두리 ✅
- [x] **DailyMission 컴포넌트**: 채소 도전 미션 카드, 진행률 바, 완료 시 honey 트로피 🏆 ✅
- [x] **BadgeGrid 컴포넌트**: 4개 뱃지 잠금/해제, 잠금 시 `grayscale opacity-40` ✅
- [x] **KidsFooter 컴포넌트**: "엄마한테 보내기", `useKidsStore` 연동 ✅

---

### Task 017: CORRECTION_DICT 오타 보정 사전 구축 ✅ 완료 (2026-05-12)

**목적**: 장보기 메모 4-step 파싱 파이프라인의 한국어 식재료 오타 보정 사전 구축

**구현 항목**:

- [x] **타입 정의** (`src/lib/utils/correction-dict.types.ts`): `DictEntry { wrong, correct, source }` ✅
- [x] **통합 사전 파일** (`src/data/correction-dict/dict.json`): 100개 한국어 식재료 오타 페어 ✅
- [x] **도메인 allowlist** (`src/data/correction-dict/domain-allowlist.txt`): 식재료·요리 표제어 약 300종 ✅
- [x] **applyCorrection() 함수**: longest-key-first greedy replace 알고리즘 ✅
- [x] **ETL 파이프라인** (`src/scripts/build-correction-dict.ts`): 6단계 검증 + ETL 소스 병합 ✅
- [x] **단위 테스트**: Vitest 18/18 통과 ✅ 2026-05-12

---

## Phase 2: 데이터베이스 + API + 핵심 기능 구현

> **Sprint 2 (후반) ~ Sprint 3 (Week 3~4) · P0**
> 실제 백엔드와 연결하여 더미 데이터를 실 데이터로 대체.

---

### Task 016: Supabase 데이터베이스 스키마 및 마이그레이션 ✅ 완료 (2026-05-06)

**구현 항목**:

- [x] **핵심 테이블 마이그레이션**: `customer`, `customer_preference`, `menu_card`, `family_group`, `family_member`, `vote` 등 15개 테이블 ✅
- [x] **음식 마스터·레시피 RAG 테이블**: `dish`, `card_dish`, `dish_recipe`, `dish_recipe_step`, `dish_ingredient` ✅
- [x] **사용자 노트 테이블** (F016 BP1): `card_note` ✅
- [x] **재료 메타 테이블** (F018 BP3): `ingredient_meta` (prep_tips, measurement_hints, substitutes) ✅
- [x] **커머스 테이블**: `cart_item`, `orders`, `shopping_memo`, `memo_item` ✅
- [x] **AI/RAG 테이블**: `semantic_cache` (embedding vector(1536), expires_at 7일 TTL) ✅
- [x] **pgvector 확장 + HNSW 인덱스**: `dish.embedding`, `dish_recipe.embedding`, `semantic_cache.embedding` HNSW cosine + pg_trgm ✅
- [x] **RLS 정책**: 12개 테이블 Row Level Security ✅
- [x] **Supabase DB 실제 적용**: fp_ 프리픽스 19개 테이블 + HNSW 인덱스 + RLS 정책 + 헬퍼 함수 2개 ✅
- [x] **TypeScript 타입 재생성** (`src/lib/supabase/database.types.ts`): `npm run typecheck` 통과 ✅

---

### Task 018: 카드메뉴 API 및 10종 카드 시스템 구현 (F001) ✅ 완료 (2026-05-12)

**구현 항목**:

- [x] **카드 목록 API** (`src/app/api/cards/route.ts`): `GET /api/cards?category&theme&officialOnly` ✅
- [x] **카드 상세 API** (`src/app/api/cards/[id]/route.ts`): 카드 + `fp_card_dish` + `fp_dish` + `fp_dish_ingredient` 병렬 조회 ✅
- [x] **데일리 픽 API** (`src/app/api/daily-pick/route.ts`): 날짜 기반 seed 인덱스로 매일 다른 공식 카드 노출 ✅
- [x] **10종 카드 시드 데이터** (`src/scripts/seed-cards.ts`): 공식 10종 × 3장 = 30장 카드, 결정론적 UUID + upsert 멱등 설계 ✅
- [x] **음식 마스터 시드** (`src/scripts/seed-dishes.ts`): 10종 테마 × 3요리 = 30개 `fp_dish` + 118개 `fp_dish_ingredient` ✅
- [x] **Server Actions** (`src/lib/actions/cards/`): `getCards()`, `getCard()`, `getDailyPick()` + 매퍼 패턴 ✅
- [x] **TanStack Query 훅** (`src/hooks/useCards.ts`): staleTime 1시간 ✅
- [x] **홈 화면 실 데이터 연동**: `getCards()` + `getDailyPick()` 병렬 호출 SSR ✅

**테스트 결과** (2026-05-12):
```
✅ GET /api/cards?official=true → 30개 카드 반환
✅ GET /api/cards?category=snack → 7개 비식사형 카드 반환
✅ GET /api/daily-pick → 날짜 기반 오늘의 카드
✅ 홈 화면 실 데이터 카드 렌더링, 10종 테마 탭 전환 동작
```

---

### Task 019: 인증 API + 가족 그룹 관리 구현 (F010, F011) ✅ 완료 (2026-05-12)

**구현 항목**:

- [x] **카카오 OAuth 연동**: `signInWithOAuth('kakao')` → `/auth/confirm` 콜백 ✅
- [x] **온보딩 Server Action** (`src/lib/actions/auth/onboarding.ts`): `fp_user_profile` + `fp_user_preference` 동시 upsert ✅
- [x] **가족 그룹 Server Actions**: `createFamilyGroup()`, `getFamilyGroup()`, `getFamilyMembers()` ✅
- [x] **초대 코드 실 연동** (`src/lib/actions/family/invite.ts`): `fp_family_group.invite_code` 조회 → `fp_family_member` insert ✅
- [x] **useAuthStore 실 연동** (`src/components/auth/auth-sync.tsx`): `onAuthStateChange` 동기화 ✅

**테스트 결과** (2026-05-12):
```
✅ 카카오 OAuth → Supabase OAuth URL 리다이렉트 → /auth/confirm 콜백 처리
✅ 온보딩 저장: fp_user_profile + fp_user_preference upsert 성공
✅ 가족 그룹 생성 + 초대 코드 참여 확인
```

---

### Task 020: 카드 상세 + 건강·가격 인프라 API 구현 (F002) ✅ 완료 (2026-05-13)

**구현 항목**:

- [x] **건강 스코어 계산 모듈** (`src/lib/health-score.ts`): 저속노화·혈당·영양 밸런스 3지표, `overall = 0.35·slowAging + 0.35·glycemicIndex + 0.30·nutrition` ✅
- [x] **가격 비교 모듈** (`src/lib/price-compare.ts`): 월별 `SEASONAL_DISCOUNT` 맵, 홈메이드·외식·배달·카페 4행 비교표 ✅
- [x] **카드 상세 통합 Server Action** (`src/lib/actions/cards/detail.ts`): `fp_menu_card` + `fp_card_dish` + `fp_dish` + `fp_dish_ingredient` + `fp_dish_recipe` + `fp_ingredient_meta` 병렬 조회 ✅
- [x] **카드 상세 페이지 Server Component 전환**: RSC + `CardDetailClient` Client Island 분리 ✅

**테스트 결과** (2026-05-13):
```
✅ 카드 상세 → 건강 스코어 3지표 표시 (저속노화 6/10·혈당 7/10·영양밸런스 1/10)
✅ 카드 상세 → 가격 비교 실 데이터 (홈메이드 13,500원 vs 외식 29,700원, 55% 절약)
✅ 카드 상세 → 제철 특가 배지 (5월 = 봄 피크 25% 할인, isSeasonal=true)
✅ 카드 상세 → 음식 목록 + 레시피 확장 클릭 인터랙션 (갈비찜 5단계 레시피)
```

---

### Task 021: 장바구니 + 결제 API 구현 (F004, F005) ✅ 완료 (2026-05-13)

**구현 항목**:

- [x] **장바구니 Server Actions**: `addBundleAction()`, `setQtyAction()`, `removeItemAction()`, `clearCartAction()`, `fetchCartItemsAction()` ✅
- [x] **토스페이먼츠 SDK 연동** (`src/lib/payments/toss.ts`): `confirmTossPayment()` · `cancelTossPayment()` Plan B 패턴 ✅
- [x] **결제 콜백 라우트** (`src/app/api/payments/confirm/route.ts`): Toss 승인 → 재고 검증 → `order/order_item/payment` INSERT → cart 비우기 ✅
- [x] **배송지 관리** (`src/lib/actions/address/index.ts`): `getDefaultAddress()` · `getAddresses()` · `createAddress()` · `updateAddress()` ✅
- [x] **OnboardingGuard 하이드레이션 버그 수정**: Zustand persist 비동기 수화 → `persist.onFinishHydration()` 구독으로 해소 ✅

**테스트 결과** (2026-05-13):
```
✅ 장바구니 Server Actions — fp_cart_item DB 저장 확인 (5 items)
✅ 결제 콜백 라우트 — POST /api/payments/confirm Toss 승인 API 정상 연동
✅ 결제 성공 페이지 — 주문 번호 표시 + 익일 06시 배송 예약 렌더링 확인
```

---

### Task 022: 장보기 메모 4-step 파싱 파이프라인 구현 (F012) ✅ 완료 (2026-05-13)

**구현 항목**:

- [x] **메모 파서** (`src/lib/utils/memo-parser.ts`):
  - STEP1: `applyCorrection()` 오타 보정
  - STEP2: 수량 추출 (`2판`, `3봉지`, `500g` 등 단위 정규식)
  - STEP3: 품목 매핑 (`fp_dish_ingredient` ILIKE → `fp_ingredient_meta` ILIKE → pg_trgm 폴백)
  - STEP4: 카테고리 분류 (식재료/과자 키워드 기반)
- [x] **메모 파싱 API** (`src/app/api/memo/parse/route.ts`): `POST /api/memo/parse { text }` → `ParsedItem[]` ✅
- [x] **메모 CRUD Server Actions**: `saveMemoAction()`, `getMemosAction()`, `deleteMemoAction()`, `addMemoToCartAction()` ✅

**테스트 결과** (2026-05-13):
```
✅ Playwright: "계란2판 새우깡3봉지" → {계란:2판 식재료, 새우깡:3봉지 과자} 2개 항목 정확 분리
✅ Playwright: 파싱 결과 → 장바구니 추가 → 장바구니(2) 계란·새우깡 표시 확인
```

---

### Task 023: 카드 만들기 + 섹션 관리 API 구현 (F013, F015) ✅ 완료 (2026-05-13)

**구현 항목**:

- [x] **카드 만들기 Server Action** (`src/lib/actions/cards/create.ts`): `createCardAction(values)` — `fp_menu_card`에 저장, `review_status: 'private'` ✅
- [x] **섹션 관리 Server Actions** (`src/lib/actions/sections/index.ts`):
  - `getSectionsAction()` — 신규 사용자 10종 공식 섹션 자동 시드 포함
  - `createSectionAction()`, `updateSectionAction()`, `deleteSectionAction()`, `reorderSectionsAction()`, `toggleAiAutoFillAction()` ✅

**테스트 결과** (2026-05-13):
```
✅ Playwright: 섹션 관리 페이지 최초 방문 → 10종 공식 섹션 자동 생성 확인
✅ Playwright: 카드 만들기 위자드 4단계 → fp_menu_card 레코드 생성 확인
✅ 섹션 순서 변경 sort_order 갱신 확인, 커스텀 섹션 추가 확인
```

---

*이 문서는 Phase 0~2 완료 태스크의 아카이브입니다. Phase 2.5 이후 작업은 ROADMAP.md를 참조하세요.*
