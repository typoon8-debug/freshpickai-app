# PROMPT — freshpickai-app 신규 프로젝트 부트스트랩
# (freshpick-app v0.8 · Phase 6 거리가드 9/11 완료 기준)

> **작성일**: 2026-05-05
> **소스 프로젝트**: `d:\freshpick-app` (PRD v0.8 · ROADMAP Phase 6 진행 중)
> **대상 프로젝트**: `d:\freshpickai-app` (신규 생성)
> **디자인 핸드오프**: `design_handoff_freshpickai/` (Claude Design 산출물 00~11)
> **목적**: freshpick-app의 검증된 공통 프레임워크 + v0.8까지 완료된 62개 Task/Hotfix 자산을 복사·재구성하고, freshpickai 고유 도메인(카드메뉴 10종·AI채팅 RAG·가족보드·키즈모드)을 위한 초기 골격을 구성한다.

---

## 0. 이 프롬프트의 사용법

> **시작 명령**
>
> > 다음은 freshpickai-app 신규 프로젝트 부트스트랩 명세입니다. freshpick-app v0.8(Phase 6 거리가드 9/11 완료)에서 공통 자산을 `d:\freshpickai-app`에 복사하고, freshpickai 고유 도메인에 맞게 재구성합니다. 각 Phase는 `npm run check-all` + `npm run build`를 통과시킨 후 다음으로 넘어가세요.

---

## 1. freshpick-app 완료 기능 전수 인벤토리 (PRD v0.8 + ROADMAP v0.8 기준)

### 1.1 MVP 핵심 기능 — 전체 완료 ✅ (13개)

| ID | 기능 | 상태 | freshpickai 재사용 |
|----|------|------|-------------------|
| F001 | 상품 탐색 (홈·세일·N+1·랭킹·검색·카테고리) | ✅ | 구조 재사용 → 카드 탐색으로 교체 |
| F002 | 상품 상세 (아코디언·이미지·리뷰) | ✅ | 패턴 재사용 → 카드 플립으로 교체 |
| F003 | 장보기 메모 (자연어 4-step 파싱 + applyCorrection) | ✅ | **그대로 재사용** |
| F004 | 장바구니 (상점별 그룹·스와이프 삭제) | ✅ | 구조 재사용 → 카드별 그룹으로 변경 |
| F005 | 찜(위시리스트) | ✅ | 패턴 참조 → 가족 투표로 교체 |
| F006 | 주문 + 토스페이먼츠 실연동 (Plan B 아키텍처) | ✅ | **그대로 재사용** |
| F007 | 주문 내역 + 배송 추적 | ✅ | **그대로 재사용** |
| F008 | 리뷰 작성/조회 | ✅ | 패턴 참조 (P2) |
| F010 | 인증 (이메일+SNS5) + 회원가입 3스텝 위저드 | ✅ | 구조 재사용 → 카카오/애플 축소 |
| F011 | 약관동의 | ✅ | **그대로 재사용** |
| F012 | 마이프레시 (프로필·포인트·쿠폰·메뉴) | ✅ | 구조 재사용 |
| F014 | AI 추천 장보기 + 내부 탭 스와이프 | ✅ | 확장 재사용 → RAG 채팅으로 격상 |
| F015 | 지난 구매 자동 리스트 | ✅ | 패턴 참조 |

### 1.2 인프라·UX·아키텍처 완료 (Hotfix AV~BI · Task 021~026 · 24개)

| 항목 | 내용 | freshpickai 재사용 |
|------|------|-------------------|
| Hotfix AV | Architecture C DB 마이그레이션 (item→v_store_item) | DB 패턴 참조 |
| Hotfix AW | Tenant별 카테고리 코드 전환 | 패턴 참조 |
| Hotfix AX | v_store_item VIEW 확장 | 패턴 참조 |
| Hotfix AY | 장바구니 담기 실패 버그 수정 (코드 ✅ / DB ⚠️) | addToCartAction 가드 패턴 재사용 |
| Hotfix AZ | 카테고리 중분류 아이콘 139개 매핑 | 카드 카테고리 아이콘에 참조 |
| Hotfix BA | AI장보기 탭순서 + 메인탭 스와이프 충돌 해소 | 탭 스와이프 패턴 재사용 |
| Hotfix BB | inventory 필터 VIEW (v_store_inventory_item) | **재고 가드 패턴 그대로 재사용** |
| Hotfix BC | 카테고리 탐색 화면 리뉴얼 (2-tier 사이드바+팝업) | UI 패턴 참조 |
| Hotfix BD | 카테고리 사이드바·팝업 대분류 아이콘 SVG 교체 | — |
| Hotfix BE | 결제 우선 아키텍처 Plan B (코드 ✅ / DB ⚠️) | **그대로 재사용** |
| Hotfix BF | PWA 설치 + 오프라인 셸 (@serwist/next v9.5) | **그대로 재사용** |
| Hotfix BG | HERO 캠페인 슬라이더 + UI 마무리 | 캠페인 배너 패턴 참조 |
| Hotfix BH | 상품 이미지 fallback + 재고 배지 오버랩 수정 | 이미지 fallback 패턴 재사용 |
| Hotfix BI | 품절 누수 근본 수정 (DB적용 + 재고가드 + dedup) | **dedup 헬퍼 + 재고가드 그대로 재사용** |
| Task 021 | 로그인 화면 브랜딩 변경 | 브랜딩 교체 패턴 참조 |
| Task 023 | BottomTab 5탭 재구성 + TopHeader 진입점 분리 | **TabBar 구조 그대로 재사용** |
| Task 024 | SwipeableTabArea 순서 동기화 | 스와이프 동기화 패턴 재사용 |
| Task 025 | 주문 배송방식 선택 UI (store_fulfillment 7종) | 배송방식 UI 재사용 |
| Task 026 | 성능 개선 (DB 인덱스·이미지·번들·SSR 최적화) | **성능 패턴 그대로 적용** |

### 1.3 Phase 6: v0.8 거리 기반 매장 가드 (Task 030~040 · 9/11 완료)

| Task | 내용 | 상태 | freshpickai 재사용 |
|------|------|------|-------------------|
| Task 030 | lib/geo SSOT + DB 타입 동기화 | ✅ | **lib/geo/* 그대로 복사** |
| Task 031 | 배송지 자동 지오코딩 | ✅ | **geocoder + geocode_log 패턴 재사용** |
| Task 032 | StoreSelectDrawer + 홈 권역 가드 | ✅ | RPC 패턴 참조 |
| Task 033 | 상품 목록 전체 권역 필터 | ✅ | 필터 패턴 참조 |
| Task 034 | 상품 상세 권역 가드 | ✅ | 가드 패턴 참조 |
| Task 035 | 장바구니 권역 가드 + 결제 차단 | ✅ | **delivery-guard.ts 그대로 재사용** |
| Task 036 | 찜 권역 표시 | ✅ | 패턴 참조 |
| Task 037 | 주문/결제 서버 측 거리 재검증 | 🔜 | 서버 가드 패턴 참조 |
| Task 038 | 주문 내역 REJECTED_BY_STORE + 환불 추적 | ✅ | **OrderRejectedBanner 재사용** |
| Task 039 | 마이프레시 배송지 관리 + MyShopDrawer | 🔄 | 배송지 관리 패턴 참조 |
| Task 040 | Feature Flag + Vercel 배포 전략 | 🔄 | **Feature Flag 패턴 그대로 재사용** |

### 1.4 Phase 5 잔여 (미완료 4개)

| Task | 내용 | 상태 |
|------|------|------|
| Task 022 | SNS 간편로그인 E2E 검증 | 🔧 코드완료/E2E미검증 |
| Task 027 | 공통 OAuth 정책 점검 (3앱) | 🔜 |
| Task 028 | 상품 검색 고도화 (trigram) | 🔜 |
| Task 029 | 카테고리 메뉴뱃지 유사성 검색 | 🔜 |

---

## 2. freshpick-app 기술 스택 완전 목록 (v0.8 기준)

| 분류 | 기술 | 버전/비고 |
|------|------|----------|
| 프레임워크 | Next.js 16 (App Router, Turbopack) | React 19, TypeScript strict |
| 스타일·UI | Tailwind CSS + shadcn/ui (new-york) + Lucide React + next-themes | Container Chunk 패턴 |
| 상태 | Zustand (cartStore·wishlistStore·storeStore) + persist | StoreHydrator SSR seed |
| 폼·검증 | React Hook Form 7.x + Zod | @hookform/resolvers |
| 애니메이션 | Framer Motion + @use-gesture/react + vaul + sonner | Fly-to-cart, 스와이프, 바텀시트, Toast |
| AI | Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`) | streamText + tool 1개 (addToMemo) |
| 백엔드 | Supabase (Auth·PostgreSQL·Storage·Realtime) + Server Actions | createClient/Admin/Browser 3패턴 |
| 결제 | 토스페이먼츠 SDK (`@tosspayments/tosspayments-sdk`) | Plan B 아키텍처 |
| PWA | @serwist/next v9.5 + serwist v9.5 | CacheFirst/StaleWhileRevalidate/NetworkFirst |
| 지오코딩 | Kakao REST API (`lib/geo/geocoder.ts`) | v0.8 신규 |
| 오타보정 | CORRECTION_DICT (`lib/utils/correction-dict.ts`) | applyCorrection() longest-key-first |
| 배포 | Vercel (icn1 리전) | vercel.json regions 설정 |
| 테스트 | Playwright E2E | `npm run check-all` 게이트 |
| 패키지 | npm | — |

---

## 3. freshpickai-app 디자인 핸드오프 요약 (Mocha Mousse Edition)

### 3.1 디자인 토큰

| 항목 | freshpick-app (현재) | freshpickai-app (교체) |
|------|---------------------|----------------------|
| Primary | #7BC11A (Green) | **#6B4A2E (mocha-700)** |
| Accent | — | **#6B7A3B (olive-500)** |
| Background | #FFFFFF | **#F7F1E6 (paper — 따뜻한 크림)** |
| Card Surface | — | #FFFFFF (종이 질감) |
| Display Font | Pretendard only | **Bree Serif** (헤드라인·브랜드) |
| Body Font | Pretendard | Pretendard (유지) |
| Corner Radius | 혼합 | **4px 고정** (마켓컬리 톤) |
| Shadow | shadow-sm/md/lg | **shadow-card: 0 1px 0 #E8DFCF** (paper-flat) |
| 톤 | 신선식품 마켓 | **마켓컬리 × Aesop × 다이소** — 따뜻한 웰니스 / 매트 표면 |

### 3.2 화면 흐름 (10 화면 · MVP)

```
로그인(01) → 홈(02) ─┬→ 카드 상세(03) → 장바구니(08) → 결제(09) → 홈
                      ├→ AI채팅(04) → 추천 카드 탭 → 카드 상세(03)
                      ├→ 카드 만들기(10) [+ 버튼]
                      └→ 가족 보드(05) → 트렌딩 탭 → 카드 상세(03)
메모(07) ──┬→ 장바구니(08)
           └→ AI채팅(04)
키즈 모드(06) → [엄마한테 보내기]

하단 탭바 (전 화면): 카드(02) / AI채팅(04) / 우리가족(05) / 메모(07) / 장바구니(08)
```

### 3.3 핵심 도메인 모델 (핸드오프 08-types.ts)

```typescript
User        → familyId → Family, role: 'parent'|'teen'|'kid'
Card        → category: 'meal'|'snack'|'cinema', Dish[]
Dish        → Ingredient[], healthScore, cookTime, kcal
CartItem    ← cardId (카드별 그룹핑)
ChatMessage ← cards?: CardRecommendation[] (AI가 카드 추천)
FamilyMember + Vote (실시간 투표)
KidsPick    → 부모에게 push
Memo        → items[] → AI 카드 변환 가능
Order       → paymentMethod: 'kakao'|'naver'|'card'|'bank'
```

### 3.4 카드메뉴 10종 (Top9 페르소나 연동)

| # | 카드메뉴 | category | 대응 페르소나 |
|---|---------|----------|-------------|
| ① | 셰프스 테이블 | meal | 엄마(메인큐레이터), 아빠(주말셰프) |
| ② | 하루한끼 One Meal | meal | 엄마, 아빠 |
| ③ | 엄마손맛 가정식 | meal | 엄마 |
| ④ | 드라마 한 끼 | meal | 서연(teen) |
| ⑤ | 혼웰 라이프 | meal | 엄마 |
| ⑥ | 제철한상 | meal | 엄마, 아빠 |
| ⑦ | 글로벌 원플레이트 | meal | 서연(teen), 아빠 |
| ⑧ | K-디저트랩 | snack | 서연(teen) |
| ⑨ | 방과후 간식팩 | snack | 하준(kid) |
| ⑩ | 홈시네마 나이트 | cinema | 가족 전체 |

---

## 4. 공통 자산 복사 계획 — 완료 기능 기반 정밀 매핑

### 4.1 그대로 복사 (코드 변경 최소)

| freshpick-app 파일/디렉토리 | freshpickai-app 위치 | 변경 사항 |
|---------------------------|---------------------|----------|
| `.claude/`, `.mcp.json` | root | 없음 |
| `.eslintrc.json`, `.prettierrc`, `.gitignore` | root | 없음 |
| `playwright.config.ts` | root | baseURL만 교체 |
| `scripts/check-all.sh` | `scripts/` | 없음 |
| `lib/supabase/server.ts, client.ts, admin.ts, middleware.ts` | `src/lib/supabase/` | import 경로만 조정 |
| `middleware.ts` (인증 게이트) | `src/middleware.ts` | 보호 라우트 경로 교체 |
| `lib/payments/toss.ts` (cancelTossPayment 포함) | `src/lib/payments/` | 없음 |
| `lib/utils/correction-dict.ts, .types.ts` | `src/lib/utils/` | 없음 |
| `lib/utils/memo-parser.ts` (4-step 파싱) | `src/lib/utils/` | import 경로만 |
| `data/correction-dict/dict.json, domain-allowlist.txt` | `src/data/correction-dict/` | 없음 |
| `scripts/correction-dict/` (ETL 5종) | `scripts/correction-dict/` | 없음 |
| `lib/geo/types.ts, haversine.ts, geocoder.ts, distance-rpc.ts` (Task 030) | `src/lib/geo/` | 없음 |
| `lib/utils/delivery-guard.ts` (Task 035) | `src/lib/utils/` | CartItem 타입만 교체 |
| `components/freshpick/order/OrderRejectedBanner.tsx` (Task 038) | `src/components/order/` | 토큰 교체 |
| `components/freshpick/empty/OutOfRangeEmpty.tsx` (Task 032) | `src/components/empty/` | 토큰 교체 |
| `public/` (PWA manifest·아이콘) — Hotfix BF | `public/` | 아이콘 교체 |
| `sw.ts` (Service Worker) — Hotfix BF | `src/sw.ts` | 없음 |
| `lib/api/_helpers/dedupeByStoreItemId.ts` (Hotfix BI) | `src/lib/api/_helpers/` | 키 필드명만 교체 |
| `app/actions/orders.ts` Plan B 아키텍처 (Hotfix BE) | `src/app/actions/` | 도메인 타입 교체 |
| `app/(mobile)/payment/success/page.tsx` (Plan B) | `src/app/(main)/checkout/success/` | 경로만 교체 |
| `app/(mobile)/payment/fail/route.ts` (Plan B) | `src/app/(main)/checkout/fail/` | 경로만 교체 |

### 4.2 구조 복사 → 토큰/도메인 교체

| freshpick-app | freshpickai-app | 교체 내용 |
|--------------|----------------|----------|
| `components/layout/BottomTabNav.tsx` (Task 023) | `components/ui/TabBar.tsx` | 5탭: 홈→카드, 세일→AI채팅, N+1→우리가족, 랭킹→메모, AI장보기→장바구니 |
| `components/layout/TopHeader.tsx` (Hotfix BG) | `components/home/BrandHeader.tsx` | 로고+알림+설정 |
| `components/freshpick/interaction/SwipeableRow.tsx` | `components/interaction/` | 색상 mocha/olive 교체 |
| `components/freshpick/interaction/PressableContainer.tsx` | `components/interaction/` | 색상 교체 |
| `components/freshpick/interaction/ToastProvider.tsx` | `components/interaction/` | 색상 교체 |
| `components/freshpick/price/PriceDisplay.tsx` | `components/price/` | terracotta(할인), ink(원가) |
| `components/freshpick/price/CartPriceSummary.tsx` | `components/price/` | mocha 톤 |
| `components/freshpick/cart/QuantitySelector.tsx` | `components/cart/` | mocha-700 accent |
| `lib/stores/cartStore.ts` | `src/lib/store.ts` (useCartStore) | 그룹핑 키: store_id→cardId |
| `app/actions/cart.ts` (addToCartAction 재고가드 — Hotfix BI) | `src/app/actions/cart.ts` | 도메인 타입 교체 |
| `lib/api/cart.ts` | `src/lib/api/cart.ts` | 도메인 타입 교체 |
| `lib/api/orders.ts` | `src/lib/api/orders.ts` | 도메인 타입 교체 |
| `lib/api/payments.ts` | `src/lib/api/payments.ts` | 도메인 타입 교체 |
| `lib/api/customer.ts` (지오코딩 — Task 031) | `src/lib/api/customer.ts` | 도메인 타입 교체 |

### 4.3 패턴만 참조 (새로 구현)

| freshpick-app 자산 | freshpickai 대응 | 비고 |
|-------------------|-----------------|------|
| 상품 탐색 (F001) 홈·세일·랭킹 | 카드메뉴 홈 + CategoryFilter | 데이터 모델 완전 교체 |
| 상품 상세 (F002) 아코디언 | 카드 상세 3D 플립 (CardFlipper) | 신규 인터랙션 |
| AI 추천 장보기 (F014) | AI 채팅 SSE 스트리밍 | 확장 (채팅 UI + RAG) |
| AI채팅 v0.7d (streamText + addToMemo) | AI 채팅 (SSE + RecCardCarousel) | 확장 (카드 추천) |
| 찜 (F005) | 가족 투표 (DinnerVote) | 완전 교체 |
| HERO 캠페인 (Hotfix BG) | DailyHero (오늘의 큐레이팅) | 컨셉 교체 |
| 카테고리 2-tier (Hotfix BC) | CategoryFilter chip group | 심플 칩으로 교체 |
| Architecture C (v_store_item VIEW) | Card → Dish → Ingredient 모델 | DB 구조 참조만 |

### 4.4 복사하지 않는 것

```
❌ app/(mobile)/ 하위 화면 전체 (freshpick 도메인)
❌ components/freshpick/product/ (ProductContainer 등)
❌ components/freshpick/search/ (SearchBar)
❌ components/freshpick/badge/ (할인·랭킹·행사 배지)
❌ components/freshpick/banner/HeroCampaignSlider.tsx
❌ components/freshpick/banner/PromoBanner.tsx
❌ components/home/StoreSelectDrawer.tsx (Task 032 — freshpickai는 단일 커머스)
❌ components/freshpick/myshop/MyShopDrawer.tsx (Task 039)
❌ lib/api/products.ts (카드 API로 교체)
❌ lib/api/categories.ts (카드 카테고리로 교체)
❌ lib/api/recommendations.ts (RAG로 교체)
❌ lib/api/promotion.ts (카드 시스템으로 교체)
❌ lib/api/purchasePattern.ts (가족 데이터로 교체)
❌ lib/api/campaign.ts (DailyHero로 교체)
❌ lib/stores/wishlistStore.ts (가족 투표로 교체)
❌ lib/stores/storeStore.ts (freshpickai는 단일 커머스)
❌ types/product.ts (Card/Dish/Ingredient로 교체)
```

---

## 5. 단계별 구현 계획 (7 Phase)

### Phase 0 — 프로젝트 생성 + 공통 골격 복사 (반나절)

**목표**: `d:\freshpickai-app` 생성, freshpick-app에서 §4.1 자산 복사, 디자인 토큰 적용.

**작업**:

1. **프로젝트 초기화**
   ```bash
   cd d:\
   npx create-next-app@latest freshpickai-app --ts --tailwind --app --src-dir --import-alias "@/*"
   cd freshpickai-app
   ```

2. **의존성 설치** (freshpick-app v0.8 검증 버전 기준)
   ```bash
   # ─── freshpick-app 검증 의존성 ───
   npm install zustand
   npm install @supabase/supabase-js @supabase/ssr
   npm install @tosspayments/tosspayments-sdk
   npm install framer-motion @use-gesture/react
   npm install sonner vaul
   npm install zod react-hook-form @hookform/resolvers
   npm install ai @ai-sdk/react @ai-sdk/anthropic
   npm install @serwist/next serwist
   
   # ─── freshpickai 핸드오프 추가 ───
   npm install @tanstack/react-query
   npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs
   npm install lucide-react clsx tailwind-merge class-variance-authority
   
   npm install -D @types/node @playwright/test tailwindcss-animate
   
   # shadcn/ui
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button input card dialog tabs badge
   ```

3. **§4.1 파일 복사** (자세한 목록은 §4.1 테이블 참조)

4. **디자인 핸드오프 적용**
   ```bash
   cp design_handoff_freshpickai/03-tailwind.config.ts tailwind.config.ts
   cp design_handoff_freshpickai/04-globals.css src/app/globals.css
   cp design_handoff_freshpickai/08-types.ts src/lib/types.ts
   cp design_handoff_freshpickai/07-state-store.ts src/lib/store.ts
   ```

5. **환경변수** (`.env.local`)
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   
   # 토스페이먼츠
   NEXT_PUBLIC_TOSS_CLIENT_KEY=
   TOSS_SECRET_KEY=
   
   # AI
   ANTHROPIC_API_KEY=
   
   # 지오코딩 (freshpick Task 030 복사)
   KAKAO_REST_KEY=
   NEXT_PUBLIC_DEFAULT_DELIVERY_RADIUS_M=1000
   NEXT_PUBLIC_DELIVERY_GUARD_MODE=OFF
   
   # OAuth
   KAKAO_CLIENT_ID=
   APPLE_CLIENT_ID=
   
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=FreshPick
   ```

6. **package.json 스크립트** (freshpick-app 동일)
   ```json
   {
     "scripts": {
       "dev": "next dev --turbopack",
       "build": "next build",
       "typecheck": "tsc --noEmit",
       "lint": "next lint",
       "format": "prettier --write .",
       "format:check": "prettier --check .",
       "check-all": "npm run typecheck && npm run lint && npm run format:check",
       "test:e2e": "playwright test"
     }
   }
   ```

**Phase 0 DoD**:
- [ ] `npm run dev` → localhost:3000 접속 (Mocha Mousse paper 배경)
- [ ] `npm run check-all` + `npm run build` 통과
- [ ] Bree Serif + Pretendard 폰트 렌더링 확인
- [ ] §4.1 전체 파일 복사 완료 + import 경로 조정 완료

---

### Phase 1 — 라우팅 + 레이아웃 + TabBar + 인증 게이트 (1일)

**목표**: 10개 화면 빈 페이지 + TabBar 5탭 + 인증 미들웨어

**작업**:

1. **App Router 구조** (핸드오프 06-routing.md 기준)
   ```
   src/app/
   ├── (auth)/login/page.tsx           # 01 로그인
   ├── (main)/
   │   ├── layout.tsx                   # TabBar 공통
   │   ├── page.tsx                     # 02 홈
   │   ├── chat/page.tsx                # 04 AI채팅
   │   ├── family/page.tsx              # 05 가족 보드
   │   ├── memo/page.tsx                # 07 메모
   │   ├── cart/page.tsx                # 08 장바구니
   │   ├── checkout/page.tsx            # 09 결제
   │   ├── cards/[id]/page.tsx          # 03 카드 상세
   │   ├── cards/new/page.tsx           # 10 카드 만들기
   │   └── kids/page.tsx                # 06 키즈 모드
   └── api/
       ├── ai/chat/route.ts             # SSE 스트리밍
       ├── cards/route.ts
       └── orders/route.ts
   ```

2. **TabBar** (freshpick-app Task 023 BottomTabNav 구조 복사 → 탭 교체)
   - 카드(`/`) / AI채팅(`/chat`) / 우리가족(`/family`) / 메모(`/memo`) / 장바구니(`/cart`)
   - 장바구니 뱃지: `useCartStore.items.length`
   - active: mocha-700, inactive: ink-500

3. **root layout** — Bree Serif + Pretendard
   ```tsx
   import { Bree_Serif } from 'next/font/google';
   const breeSerif = Bree_Serif({ subsets: ['latin'], weight: '400', variable: '--font-display' });
   ```

4. **인증 미들웨어** (freshpick-app middleware.ts 복사 → 경로 교체)

**Phase 1 DoD**:
- [ ] 10개 화면 접속 가능, TabBar 네비게이션 동작
- [ ] 미인증 → `/login` 리디렉션
- [ ] `npm run check-all` + `npm run build` 통과

---

### Phase 2 — 공통 컴포넌트 + 디자인 시스템 (1일)

**목표**: Mocha Mousse 공통 컴포넌트 구현 + freshpick-app 복사 컴포넌트 토큰 교체

**작업**:
1. Button (primary/ghost/olive) · Card (.card-paper) · Chip (.chip/.chip-on) · LabelMark (.label-mark)
2. freshpick-app 복사 컴포넌트 색상 토큰 전면 교체 (§4.2 전체)
3. cn() 유틸리티 + TanStack Query Provider + QueryKeys

**Phase 2 DoD**:
- [ ] 모든 공통 컴포넌트 Mocha Mousse 토큰 적용
- [ ] 복사 컴포넌트 빌드 에러 0건
- [ ] `npm run check-all` + `npm run build` 통과

---

### Phase 3 — 로그인 + 홈 + 카드 상세 (2일) · P0

**목표**: 핵심 탐색 흐름 구현

**작업**:
1. **01 로그인** — 카카오 1초 시작 + 소셜 + 이메일 (freshpick F010 패턴)
2. **02 홈** — BrandHeader + DailyHero + CategoryFilter + CardGrid (MenuCard[])
3. **03 카드 상세** — ★ CardFlipper (rotateY 180° + perspective 1200px)
   - DishFront (이름/설명/건강·시간·칼로리)
   - IngredientList 뒷면 (재료/가격/할인)
   - "한꺼번에 담기" → useCartStore.addBundle(cardId, ingredients)
4. 모킹 데이터 10종 카드메뉴

**Phase 3 DoD**:
- [ ] 로그인 → 홈 → 카드 → 플립 → "한꺼번에 담기" 전체 동작
- [ ] `npm run check-all` + `npm run build` 통과

---

### Phase 4 — AI 채팅 + 장바구니 + 결제 (2일) · P0

**목표**: AI 채팅 SSE + 구매 플로우

**작업**:
1. **04 AI 채팅** — freshpick v0.7d streamText 패턴 확장
   - SSE 스트리밍 + RecCardCarousel (AI 카드 추천)
   - QuickChips (비건/매운맛/10분/8천원이하)
   - useChatStore (핸드오프 store.ts)
2. **08 장바구니** — freshpick F004 패턴 (카드별 그룹으로 변경)
   - FreeShippingBar + CartGroupList + CartSummary
   - delivery-guard.ts (Task 035) 재사용
3. **09 결제** — freshpick Plan B 아키텍처 (Hotfix BE) 그대로 재사용
   - 토스페이먼츠 SDK + prepareOrderAction + confirmAndCreateOrderAction

**Phase 4 DoD**:
- [ ] AI 채팅: 입력 → 스트리밍 → 카드 추천 → 카드 상세 이동
- [ ] 장바구니: 카드별 그룹 + 수량 + 무료배송 바
- [ ] 결제: 토스 샌드박스 테스트 완료
- [ ] `npm run check-all` + `npm run build` 통과

---

### Phase 5 — 가족보드 + 메모 + 키즈 + 카드만들기 (2일) · P1/P2

**작업**:
1. **05 가족 보드** — MemberGrid + DinnerVote(Realtime) + PopularRanking + TrendingCards
2. **07 메모** — freshpick F003 그대로 재사용 + "AI 카드 변환" CTA 추가
3. **06 키즈** — MascotBubble + FoodPicker + DailyMission + BadgeGrid
4. **10 카드 만들기** — 4단계 위저드 (테마→태그→빈도/예산→미리보기)

**Phase 5 DoD**:
- [ ] 가족 투표 동작, 메모 CRUD + AI 변환, 키즈 미션, 위저드 4단계
- [ ] `npm run check-all` + `npm run build` 통과

---

### Phase 6 — 통합 테스트 + 품질 + 배포 (1일)

**작업**:
1. Playwright E2E 5 시나리오
2. Lighthouse Mobile ≥ 90 + WCAG AA + hit target ≥ 44px
3. Vercel 배포 (icn1 리전) + PWA manifest 교체

**Phase 6 DoD**:
- [ ] Playwright 5 시나리오 그린
- [ ] Lighthouse ≥ 90
- [ ] Vercel Preview 배포 성공

---

## 6. 디렉토리 구조 (최종)

```
d:\freshpickai-app/
├── .claude/                          # freshpick 복사
├── .mcp.json                         # freshpick 복사
├── .env.local
├── tailwind.config.ts                # Mocha Mousse (핸드오프 03)
├── next.config.ts
├── tsconfig.json
├── playwright.config.ts              # freshpick 복사
├── vercel.json                       # icn1 리전 (Task 040 패턴)
│
├── public/                           # PWA (freshpick Hotfix BF 복사 → 아이콘 교체)
├── src/
│   ├── app/
│   │   ├── globals.css               # Mocha Mousse (핸드오프 04)
│   │   ├── layout.tsx                # Bree Serif + Pretendard
│   │   ├── (auth)/login/page.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx            # TabBar
│   │   │   ├── page.tsx              # 홈
│   │   │   ├── chat/page.tsx
│   │   │   ├── family/page.tsx
│   │   │   ├── memo/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── success/page.tsx  # Plan B (Hotfix BE)
│   │   │   │   └── fail/route.ts     # Plan B
│   │   │   ├── cards/[id]/page.tsx
│   │   │   ├── cards/new/page.tsx
│   │   │   └── kids/page.tsx
│   │   ├── api/ai/chat/route.ts      # v0.7d streamText 확장
│   │   └── actions/
│   │       ├── orders.ts             # Plan B (Hotfix BE 복사)
│   │       ├── cart.ts               # 재고가드 (Hotfix BI 복사)
│   │       └── customer.ts           # 지오코딩 (Task 031 복사)
│   │
│   ├── components/
│   │   ├── ui/          # Atom (shadcn + Mocha 공통)
│   │   ├── interaction/ # freshpick 복사 (SwipeableRow, Pressable, Toast)
│   │   ├── price/       # freshpick 복사 (PriceDisplay, CartPriceSummary)
│   │   ├── cart/        # freshpick 복사 (QuantitySelector)
│   │   ├── order/       # freshpick 복사 (OrderRejectedBanner — Task 038)
│   │   ├── empty/       # freshpick 복사 (OutOfRangeEmpty — Task 032)
│   │   ├── home/        # 신규 (BrandHeader, DailyHero, CategoryFilter, CardGrid, MenuCard)
│   │   ├── detail/      # 신규 (CardFlipper ★, DishFront, IngredientList)
│   │   ├── chat/        # 신규 (MessageList, Message, RecCardCarousel, QuickChips, ChatInput)
│   │   ├── family/      # 신규 (FamilyBanner, MemberGrid, DinnerVote, PopularRanking)
│   │   ├── kids/        # 신규 (MascotBubble, FoodPicker, DailyMission, BadgeGrid)
│   │   ├── memo/        # freshpick F003 기반
│   │   ├── checkout/    # freshpick Plan B 기반
│   │   └── wizard/      # 신규 (WizardProgress, Step1~4)
│   │
│   ├── lib/
│   │   ├── store.ts          # Zustand (핸드오프 07 — Auth/Cart/Chat/Kids/UI)
│   │   ├── types.ts          # 타입 (핸드오프 08 — User/Card/Dish/Ingredient/...)
│   │   ├── utils.ts          # cn()
│   │   ├── api.ts            # TanStack Query 래퍼
│   │   ├── queryKeys.ts
│   │   ├── supabase/         # freshpick 복사 (4파일)
│   │   ├── payments/toss.ts  # freshpick Plan B 복사
│   │   ├── geo/              # freshpick Task 030 복사 (4파일)
│   │   ├── utils/
│   │   │   ├── correction-dict.ts      # freshpick 복사
│   │   │   ├── correction-dict.types.ts
│   │   │   ├── memo-parser.ts          # freshpick F003 복사
│   │   │   └── delivery-guard.ts       # freshpick Task 035 복사
│   │   ├── api/
│   │   │   ├── cart.ts                 # freshpick 복사 → 도메인 교체
│   │   │   ├── orders.ts              # freshpick 복사
│   │   │   ├── payments.ts            # freshpick 복사
│   │   │   ├── customer.ts            # freshpick Task 031 복사
│   │   │   └── _helpers/dedupeByStoreItemId.ts  # Hotfix BI 복사
│   │   └── ai/
│   │       ├── prompts.ts             # v0.7d persona-context 기반
│   │       └── tools/add-to-memo.ts   # v0.7d 복사
│   │
│   ├── data/correction-dict/  # freshpick 복사
│   └── mock/                  # 모킹 데이터 (카드 10종)
│
├── scripts/
│   ├── check-all.sh           # freshpick 복사
│   └── correction-dict/       # freshpick 복사
│
├── tests/e2e/                 # Playwright 5 시나리오
│
└── docs/                      # 핸드오프 문서
    ├── PRD.md, design-tokens.md, components-spec.md
    ├── routing.md, api-spec.md, sprint-plan.md
    └── freshpick-reuse-map.md  # 본 프롬프트의 §4 테이블
```

---

## 7. 디자인 절대 규칙

| # | 규칙 | 이유 |
|---|------|------|
| 1 | 새 컬러 금지 — mocha/olive/paper/ink/terracotta/honey/sage만 | Mocha Mousse 토큰 |
| 2 | 코너 4px 고정 (마켓컬리 톤) | 50%(avatar), 100px(chip) 예외만 |
| 3 | 그라디언트 금지 | 시안에 없으면 절대 안 됨 |
| 4 | 이모지 임의 추가 금지 | 시안 정의분만 |
| 5 | 헤드라인 Pretendard 금지 → Bree Serif 필수 | — |
| 6 | shadow-lg 금지 → shadow-card (1px line) | paper-flat 톤 |
| 7 | CardFlipper에 `[perspective:1200px]` 필수 | 3D 플립 깨짐 방지 |

---

## 8. 실행 전 체크리스트

1. `d:\freshpick-app` 디렉토리 존재 + v0.8 코드 (Hotfix BI까지) 있는가?
2. `design_handoff_freshpickai/` 폴더에 00~11 핸드오프 파일 있는가?
3. Node.js 20.9+ 설치되어 있는가?
4. `d:\freshpickai-app` 디렉토리가 비어있거나 없는가?
5. API 키 준비: Supabase URL/Key, 토스 테스트키, ANTHROPIC_API_KEY, KAKAO_REST_KEY

모두 확인 후 Phase 0부터 시작하세요.

---

> **본 프롬프트의 끝.**
> freshpick-app v0.8 PRD + ROADMAP 기준 62개 Task/Hotfix 완료 자산을 정밀 매핑했습니다.
> 각 Phase 완료 시 `npm run check-all` + `npm run build` 통과 필수.
