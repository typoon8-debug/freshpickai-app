# FreshPickAI — AI Agent 개발 규칙

## 프로젝트 개요

- **목적**: 10종 테마 카드로 AI 큐레이팅 장보기 → 가족 투표 → 새벽배송 연결하는 모바일 커머스
- **현재 Phase**: Phase 0 완료 (골격 구축) / Phase 1 진행 중 (UI 구현, 더미 데이터)
- **스택**: Next.js 16 App Router + TypeScript strict + Supabase + Zustand + Tailwind v4

---

## 태스크 관리 규칙 ⚡ 최우선 준수

### 핵심 규칙

1. **모든 태스크는 `docs/ROADMAP.md` 기준**으로 수행 — 다른 출처 금지
2. 태스크 착수 전 `mcp__shrimp-task-manager__list_tasks`로 현황 확인 후 `in_progress` 처리
3. **태스크 완료 즉시** 아래 두 곳 동시 업데이트 **필수**:
   - `docs/ROADMAP.md` 상단 **진행 현황 테이블**에 완료 행 추가:
     `| TXxx: 태스크명 | ✅ 완료 | YYYY-MM-DD |`
   - `docs/ROADMAP.md` 해당 태스크 섹션 구현 항목 체크박스 `[ ]` → `[x]` + ` ✅ YYYY-MM-DD` 추기
4. shrimp task manager에서 해당 태스크 `completed` 처리
5. `npm run check-all` + `npm run build` 통과 후 완료 선언

### 태스크 우선순위 판단

```
P0 > P1 > P2
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4
BlockedBy 있는 태스크는 선행 완료 후 착수
```

### ROADMAP.md 업데이트 형식

```markdown
<!-- 진행 현황 테이블 (파일 상단) -->
| T006: 로그인 + 온보딩 UI 구현 | ✅ 완료 | 2026-05-07 |

<!-- 태스크 섹션 내 체크박스 -->
- [x] **로그인 페이지** (`src/app/(auth)/login/page.tsx`) ✅ 2026-05-07
```

---

## 프로젝트 아키텍처

### 디렉토리 구조 및 역할

```
src/
├── app/
│   ├── (auth)/login/          ← 로그인 (F010) — 인증 불필요 라우트
│   ├── (main)/                ← 인증 필요 라우트 그룹
│   │   ├── layout.tsx         ← BottomTabNav 포함 공통 레이아웃
│   │   ├── page.tsx           ← 카드메뉴 홈 (F001)
│   │   ├── cards/[id]/        ← 카드 상세 (F002)
│   │   ├── cards/new/         ← 카드 만들기 (F013)
│   │   ├── chat/              ← AI 채팅 (F003)
│   │   ├── family/            ← 우리가족 보드 (F011)
│   │   ├── kids/              ← 키즈 모드 (F014)
│   │   ├── memo/              ← 장보기 메모 (F012)
│   │   ├── cart/              ← 장바구니 (F004)
│   │   ├── checkout/          ← 결제 (F005)
│   │   └── sections/          ← 섹션 관리 (F015)
│   ├── actions/               ← Server Actions (Phase 0 스텁 — 구현 필요)
│   │   ├── orders.ts          ← 주문 생성/확인 (NOT_IMPLEMENTED)
│   │   ├── cart.ts            ← 장바구니 추가/삭제 (NOT_IMPLEMENTED)
│   │   └── customer.ts        ← 고객 정보
│   └── globals.css            ← Tailwind v4 @theme 디자인 토큰 + 공통 클래스
├── components/
│   ├── ui/                    ← shadcn/ui 컴포넌트 (new-york 스타일)
│   ├── order/                 ← OrderRejectedBanner (배송 거부 배너)
│   └── empty/                 ← OutOfRangeEmpty (배송 범위 밖 빈 상태)
├── lib/
│   ├── supabase/
│   │   ├── server.ts          ← RSC·Route Handler용 createClient() + createAdminClient()
│   │   ├── client.ts          ← 브라우저 Client Component용 createClient()
│   │   ├── middleware.ts      ← 미들웨어용 updateSession()
│   │   └── database.types.ts  ← Supabase CLI 자동 생성 타입 (수동 편집 금지)
│   ├── geo/                   ← 배송 가능 범위 체크 유틸 (geocoder, haversine, distance-rpc)
│   ├── payments/toss.ts       ← 토스페이먼츠 서버 유틸 (confirmTossPayment, cancelTossPayment)
│   ├── utils/
│   │   ├── memo-parser.ts     ← 장보기 메모 4-step 파이프라인 (parseMemoItemText)
│   │   ├── memo-correction-dict.ts ← 오타 보정 사전 (applyCorrection)
│   │   └── delivery-guard.ts  ← 배송 가능 여부 guard
│   ├── store.ts               ← Zustand 스토어 전체 (useAuthStore, useCartStore, ...)
│   ├── types.ts               ← 도메인 타입 전체 (User, Card, Dish, CartItem, ...)
│   └── utils.ts               ← cn(), formatPrice(), formatDate()
└── middleware.ts              ← 전역 인증 게이트 (updateSession 호출)
```

---

## Next.js 16 코딩 규칙

### 동적 라우트 params

- `params`는 항상 `Promise<{ id: string }>` 타입으로 선언하고 `await`로 언패킹

```typescript
// ✅ 올바른 방법
type Props = { params: Promise<{ id: string }> };
export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;
}

// ❌ 금지 — Next.js 16에서 params가 Promise
export default async function CardDetailPage({ params }: { params: { id: string } }) {
  const { id } = params; // 에러 발생
}
```

### Server Component vs Client Component

- 데이터 패칭, DB 조회 → **Server Component** (기본값)
- `useState`, `useEffect`, Zustand, Framer Motion, 이벤트 핸들러 → **Client Component** (`'use client'` 필수)
- 큰 페이지는 RSC 껍데기 + Client Island 분리 패턴 사용

```typescript
// ✅ 올바른 분리: page.tsx = RSC, 인터랙티브 부분만 'use client'
// src/app/(main)/page.tsx (RSC)
import { CardGrid } from "@/components/home/CardGrid"; // 내부에서 'use client'

// ❌ 금지 — 불필요하게 전체 페이지를 클라이언트로
"use client";
export default function HomePage() { ... }
```

### 경로 별칭

- 항상 `@/*` 사용 (→ `src/*` 매핑)
- 상대 경로 (`../../`) 사용 금지

---

## Supabase 클라이언트 사용 규칙

### 클라이언트 선택 기준

| 환경 | 사용 함수 | 파일 |
|------|----------|------|
| Server Components, Route Handlers, Server Actions | `createClient()` | `@/lib/supabase/server.ts` |
| Client Components (브라우저) | `createClient()` | `@/lib/supabase/client.ts` |
| 미들웨어 (`src/middleware.ts`) | `updateSession()` | `@/lib/supabase/middleware.ts` |
| RLS 우회 필요 시 (Server Actions 전용) | `createAdminClient()` | `@/lib/supabase/server.ts` |

### 반드시 지켜야 할 규칙

- Server Components에서 `createClient()`를 전역 변수에 저장 금지 — 함수 호출마다 새로 생성
- `createAdminClient()`는 **서버 전용** — 클라이언트 컴포넌트에서 절대 사용 금지
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 환경 변수 — `NEXT_PUBLIC_` 접두사 금지
- `src/lib/supabase/middleware.ts`에서 `createServerClient`와 `supabase.auth.getClaims()` 사이에 코드 삽입 금지
- `database.types.ts`는 수동 편집 금지 → Supabase CLI로만 재생성

```typescript
// ✅ Server Action에서의 올바른 패턴
"use server";
import { createClient } from "@/lib/supabase/server";

export async function getCards() {
  const supabase = await createClient(); // 매번 새로 생성
  return supabase.from("menu_card").select();
}
```

---

## 타입 시스템 규칙

### 타입 정의 위치

- 도메인 타입 → `src/lib/types.ts` (User, Card, Dish, Ingredient, CartItem, ChatMessage, FamilyMember, Vote, KidsPick, Memo, Order)
- Supabase DB 타입 → `src/lib/supabase/database.types.ts` (자동 생성)
- Geo 타입 → `src/lib/geo/types.ts` (LatLng, DistanceM, GeocodeResult, StoreInRange)
- 컴포넌트 로컬 타입 → 해당 파일 내 정의

### 필수 규칙

- `any` 타입 사용 금지 — TypeScript strict 모드
- 새 도메인 엔티티 추가 시 반드시 `src/lib/types.ts`에 타입 추가
- Supabase 스키마 변경 후 반드시 `database.types.ts` 재생성 (`npx supabase gen types typescript`)

---

## Zustand 스토어 규칙

### 기존 스토어 (`src/lib/store.ts`)

| 스토어 | persist | 용도 |
|--------|---------|------|
| `useAuthStore` | ✅ `fp-auth` | 로그인 사용자 + 토큰 |
| `useCartStore` | ✅ `fp-cart` | 장바구니 아이템 (UI 캐시, 단일 진실 소스) |
| `useChatStore` | ❌ | AI 채팅 메시지 + 스트리밍 상태 |
| `useKidsStore` | ❌ | 키즈 음식 선택 picks |
| `useUIStore` | ❌ | 홈 필터 상태 |

### 장바구니 상태 동기화 규칙

- `useCartStore`가 UI 캐시 (단일 진실 소스는 Supabase `cart`/`cart_item`)
- 페이지 마운트 시 서버 데이터로 hydrate → Server Action 반영 후 Zustand 동기화
- 비로그인 임시 보관에만 persist 사용

### 스토어 사용 규칙

- `useCartStore.addBundle(cardId, items)` — 카드 전체 재료 일괄 담기
- `useCartStore.setQty(id, qty)` — 수량 변경 (최소 1)
- `useChatStore.appendStream(chunk)` — SSE 스트리밍 텍스트 누적
- 새 스토어 추가 시 `src/lib/store.ts`에만 추가 (별도 파일 금지)

---

## 디자인 시스템 규칙

### 디자인 토큰 (Tailwind v4 `@theme`)

**색상**: `mocha-50/100/300/400/500/700/900` | `olive-100/500/700` | `ink-300/500/700/900` | `paper` | `line` | `terracotta` | `honey` | `sage`

**폰트**: `font-display` = Bree Serif (제목/Display) | `font-sans` = Pretendard (본문)

**그림자**: `shadow-card` | `shadow-hover` | `shadow-cta`

**반경**: `rounded` (4px) | `rounded-md` (6px) | `rounded-lg` (8px) | `rounded-pill` (100px)

### 공통 컴포넌트 클래스 (`globals.css @layer components`)

```
.btn-primary  — mocha-700 배경 CTA 버튼 (h-13, px-6)
.btn-ghost    — 테두리 버튼 (mocha-700 border)
.card-paper   — 카드 래퍼 (shadow-card, hover:shadow-hover)
.chip         — 필터 칩 기본 상태
.chip-on      — 필터 칩 활성 상태 (ink-900 배경)
.label-mark   — 10px uppercase olive-500 레이블
```

### 디자인 적용 규칙

- 임의 색상값(`#6b4a2e`) 직접 사용 금지 → 토큰(`mocha-700`) 사용
- 새 디자인 토큰은 `globals.css`의 `@theme {}` 블록에만 추가
- 모든 인터랙션 요소 최소 hit target: **44×44px**
- 모바일 우선: `max-w-phone` (375px) 기준, 반응형 필수

---

## Server Actions 규칙

### 파일 위치

- **현재 Phase 0**: `src/app/actions/` 디렉토리
- **Phase 2+ 구현 시**: `src/lib/actions/domain/` 패턴으로 이동 (예: `src/lib/actions/cards/get.ts`)

### Phase 0 스텁 상태 처리

- `src/app/actions/orders.ts`, `src/app/actions/cart.ts`는 Phase 0 스텁
- 구현 시 `NOT_IMPLEMENTED` 반환부를 실제 로직으로 교체하고 주석 제거

```typescript
// ✅ Server Action 필수 형식
"use server";
import { createClient } from "@/lib/supabase/server";

export async function myAction(param: string): Promise<{ data?: MyType; error?: string }> {
  const supabase = await createClient();
  // ...
}
```

---

## 결제 (토스페이먼츠) 규칙

- 결제 유틸 위치: `src/lib/payments/toss.ts`
- `confirmTossPayment()`, `cancelTossPayment()` — **서버에서만 호출**
- `TOSS_SECRET_KEY` — 클라이언트 노출 절대 금지 (`NEXT_PUBLIC_` 접두사 금지)
- **보상 트랜잭션 필수**: PG 결제 성공 후 DB 처리(주문 생성·재고 차감) 실패 시 반드시 `cancelTossPayment()` 호출

```
결제 흐름:
클라이언트 SDK 결제창 → 성공 콜백 → Server Action confirmTossPayment()
→ DB 주문 생성 성공 → 완료 페이지
→ DB 처리 실패 → cancelTossPayment() 호출 → 에러 안내
```

---

## 배송 범위 체크 규칙

- 배송 가능 범위 체크 유틸: `src/lib/geo/` (geocoder, haversine, distance-rpc)
- 배송 거부 시 `OrderRejectedBanner` 컴포넌트 표시 (`src/components/order/OrderRejectedBanner.tsx`)
- 배송 범위 밖 빈 상태: `OutOfRangeEmpty` 컴포넌트 (`src/components/empty/OutOfRangeEmpty.tsx`)
- `delivery-guard.ts` — 배송 가능 여부 guard 함수

---

## 메모 파서 규칙

- 파서 위치: `src/lib/utils/memo-parser.ts`
- 진입점 함수: `parseMemoItemText(rawText: string): ParseResult`
- 오타 보정: `applyCorrection()` (`src/lib/utils/memo-correction-dict.ts`) — 파서 내부에서 자동 호출
- 새 오타 보정 케이스는 `memo-correction-dict.ts` 사전에만 추가

---

## 미들웨어 수정 규칙

- `src/middleware.ts` — `updateSession()` 단일 호출만 유지
- matcher 패턴에서 PWA 에셋 제외 규칙 유지 (`sw.js`, `workbox-*`, `manifest.webmanifest`, `icon-*`, `apple-touch-icon`, `offline`)
- `src/lib/supabase/middleware.ts` — `createServerClient`와 `getClaims()` 사이에 코드 삽입 금지
- 새 Response 생성 시 기존 쿠키 반드시 복사

---

## 다중 파일 연동 규칙

| 작업 | 수정해야 할 파일 |
|------|----------------|
| 새 도메인 타입 추가 | `src/lib/types.ts` |
| Supabase 스키마 변경 | `src/lib/supabase/database.types.ts` (CLI 재생성) |
| 새 Zustand 스토어 추가 | `src/lib/store.ts` |
| 새 디자인 토큰 추가 | `src/app/globals.css` (`@theme {}` 블록) |
| 새 Server Action 추가 (Phase 0) | `src/app/actions/*.ts` |
| 새 Server Action 추가 (Phase 2+) | `src/lib/actions/domain/*.ts` |
| shadcn/ui 컴포넌트 추가 | `npx shadcn@latest add [component]` → `src/components/ui/` |
| 새 API Route 추가 | `src/app/api/[domain]/route.ts` |

---

## AI 기능 구현 규칙 (Phase 2-3 예정)

### 5계층 데이터 아키텍처

```
card_section → menu_card → card_dish → dish → dish_recipe → dish_recipe_step
                                                     ↕
                                         tenant_item_ai_detail (상품 RAG)
```

- `dish_recipe`: 레시피 RAG 청크 (1536차원 pgvector, HNSW cosine)
- `tenant_item_ai_detail`: 상품 RAG 청크 (chunk_type 10종)

### 5-Tool ToolLoopAgent — 도구 수 고정 (6번째 도구 추가 금지)

| 도구 | 역할 |
|------|------|
| `searchItems` | `mode: 'recipe'`로 dish_recipe RAG 1차 검색, `mode: 'item'`으로 tenant_item_ai_detail 2차 검색 |
| `getUserContext` | `buildPersonaContext(customerId)` — 9 페르소나 컨텍스트 (캐시 60초) |
| `getInventory` | `v_store_inventory_item` 재고·가격 조회 |
| `addToCart` | UI 확인 카드 표시 후 `cart_item` 일괄 삽입 |
| `addToMemo` | 인라인 확인 카드 표시 후 장보기 메모 추가 |

### LLM 모델 선택 기준

| 모델 | 용도 |
|------|------|
| `claude-sonnet-4-6` | 채팅 응답, Tool Calling, 무비나이트 카드 자동 생성 |
| `claude-haiku-4-5-20251001` | 분류·요약·캐시 키 정규화·AI 자동 채움 (F015, F032) |
| `text-embedding-3-small` | 1536차원 임베딩 (dish_recipe, tenant_item_ai_detail, customer_preference) |

### 스트리밍 vs 구조화

```typescript
// 채팅 — SSE 스트리밍
streamText({ model: anthropic("claude-sonnet-4-6"), ... })

// 카드/섹션 자동채움 — Zod 스키마 검증
generateObject({ model: anthropic("claude-haiku-4-5-20251001"), schema: RecommendationSchema, ... })
```

### 시맨틱 캐시

- `ai_query_cache`: 코사인 유사도 **0.95** 이상 → 즉시 HIT 반환 (토큰 0)
- TTL 7일, 만료 정리 Edge Function (매일 03:00 KST)

### pgvector 검색 3단계 폴백

```
1. HNSW cosine 검색 (목표: 200ms 이하)
2. pg_trgm 유사도 폴백
3. ILIKE 폴백
```

### 파일 위치

- AI 채팅: `src/app/api/ai/chat/route.ts`
- ToolLoopAgent: `src/app/api/ai/agent/route.ts`
- AI 추천: `src/app/api/ai/recommend/route.ts`
- 페르소나 컨텍스트 빌더: `src/lib/ai/persona-context.ts`
- 임베딩 서비스: `src/lib/ai/embedding.ts`
- 벡터 검색: `src/lib/ai/vector-search.ts` (3단계 폴백 포함)
- 시맨틱 캐시: `src/lib/ai/semantic-cache.ts`
- AI 도구: `src/lib/ai/tools/` (searchItems, getUserContext, getInventory, addToCart, addToMemo)

---

## 환경 변수 규칙

| 변수 | 접근 | 용도 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 서버+클라이언트 | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 서버+클라이언트 | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 | RLS 우회 Admin |
| `ANTHROPIC_API_KEY` | 서버 전용 | Claude API |
| `OPENAI_API_KEY` | 서버 전용 | 임베딩 API |
| `TOSS_SECRET_KEY` | 서버 전용 | 토스페이먼츠 승인 |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 서버+클라이언트 | 토스페이먼츠 SDK |

---

## 작업 완료 게이트

모든 구현 후 반드시 실행:

```bash
npm run check-all   # ESLint + Prettier + TypeScript 통합 검사
npm run build       # 프로덕션 빌드 성공 확인
```

---

## 금지 사항

- `any` 타입 사용 금지
- `SUPABASE_SERVICE_ROLE_KEY`, `TOSS_SECRET_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`에 `NEXT_PUBLIC_` 접두사 추가 금지
- `createAdminClient()` 클라이언트 컴포넌트에서 호출 금지
- Server Actions에서 `createClient()`를 전역 변수에 저장 금지
- `src/lib/supabase/database.types.ts` 수동 편집 금지
- `globals.css`에서 `@theme {}` 블록 외부에 새 색상 변수 추가 금지
- 임의 hex 색상값 직접 사용 금지 (반드시 토큰 사용)
- 상대 경로 임포트 금지 (항상 `@/*` 사용)
- 컴포넌트에서 `console.log` 남기기 금지 (개발 중 임시 사용 후 제거)
- `--no-verify` 플래그로 Husky 훅 우회 금지
- **ROADMAP.md 업데이트 없이 태스크 완료 처리 금지** — 진행 현황 테이블 + 체크박스 동시 갱신 필수
