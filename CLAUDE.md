# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

우리가족을 위한 AI 큐레이팅 장보기 — 테마 카드(흑백요리사·제철 K-팜·홈시네마 등)로 한 끼를 고르고, AI에게 변형을 요청하고, 가족과 투표한 뒤, 재료를 한꺼번에 장바구니에 담아 새벽배송 받는 모바일 커머스.

## 주요 기술 스택

### 프론트엔드
- **프레임워크**: Next.js 16 + App Router (Turbopack) — RSC + Streaming, Server Actions
- **런타임**: React 19.2 — 동시성 기능
- **언어**: TypeScript 5.x (strict 모드, 도메인 타입 `src/lib/types.ts` 분리)
- **스타일링**: Tailwind CSS + shadcn/ui (new-york) — 토큰 기반 Mocha Mousse 디자인 시스템
- **아이콘**: Lucide React
- **테마**: next-themes (다크 모드)
- **애니메이션**: Framer Motion + @use-gesture/react — 카드 스와이프 (vaul·sonner 포함)
- **드래그앤드롭**: @dnd-kit/core + @dnd-kit/sortable — 섹션 탭 순서 변경 (F015)
- **폰트**: Bree Serif (Display/제목, `--font-display`) + Pretendard (본문)

### 상태 관리 & 폼
- **State**: Zustand + persist — `useAuthStore`(fp-auth)·`useCartStore`(fp-cart)·`useChatStore`·`useKidsStore`·`useUIStore`
- **서버 상태**: TanStack Query (`qk.cards()`, `qk.card()`, `qk.daily()`, `qk.family()`, `qk.cart()`, `qk.memos()`)
- **Form/Validation**: React Hook Form 7.x + Zod (`generateObject` RecommendationSchema 겸용)

### 🤖 AI & RAG (3-Layer + 5계층 아키텍처)
- **Layer 1 — 오케스트레이션**: Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`) — `streamText`·`generateObject`·`ToolLoopAgent`
- **Layer 2 — LLM**: Anthropic Claude Sonnet 4.6 (9 페르소나 응답·Tool Calling) / Claude Haiku 4.5 (분류·요약·AI 자동채움)
- **Layer 3 — 임베딩**: OpenAI text-embedding-3-small (`openai`) — 1536차원 한국어 임베딩
- **ToolLoopAgent 5도구**: searchItems(mode:recipe\|item)·getUserContext·getInventory·addToCart·addToMemo

### 백엔드 & 데이터베이스
- **BaaS**: Supabase (@supabase/ssr, @supabase/supabase-js) — Auth + PostgreSQL + Storage + Realtime
- **벡터 DB**: Supabase pgvector 0.8.x — HNSW cosine 인덱스 (목표 200ms) + pg_trgm 폴백 → ILIKE 폴백
- **5계층 매칭**: `card_section → menu_card → card_dish → dish → dish_recipe → dish_recipe_step`
- **서버 로직**: Next.js Server Actions (`src/app/actions/`) / Route Handlers (`src/app/api/`)
- **결제**: 토스페이먼츠 SDK (`@tosspayments/tosspayments-sdk`) — 카카오페이·네이버페이·카드·계좌이체
- **파일처리**: Supabase Storage (카드 썸네일, `card-images` 버킷)

### 배포 & 모니터링
- **호스팅**: Vercel (Edge + Serverless, Next.js 16 최적화)
- **모니터링**: Vercel Analytics + AI SDK OpenTelemetry (토큰·비용·지연 추적) + Sentry (에러) + PostHog (사용자 분석)
- **테스트**: Playwright E2E (`npm run check-all` 게이트)
- **패키지 관리**: npm

## 개발 명령어

```bash
# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 코드 검사 및 포맷팅
npm run lint           # ESLint 검사
npm run lint:fix       # ESLint 자동 수정
npm run format         # Prettier 포맷팅
npm run format:check   # Prettier 검사만
npm run typecheck      # TypeScript 타입 체크
npm run check-all      # 모든 검사 통합 실행 (권장)
```

## ⚡ 자주 사용하는 명령어

```bash
# 개발
npm run dev         # 개발 서버 실행 (Turbopack)
npm run build       # 프로덕션 빌드
npm run check-all   # 모든 검사 통합 실행 (권장)

# UI 컴포넌트
npx shadcn@latest add button    # 새 컴포넌트 추가
```

## ✅ 작업 완료 체크리스트

```bash
npm run check-all   # 모든 검사 통과 확인
npm run build       # 빌드 성공 확인
```

## 프로젝트 구조 및 아키텍처

### Supabase 클라이언트 패턴

이 프로젝트는 **세 가지 다른 Supabase 클라이언트**를 환경에 따라 사용합니다:

1. **Server Components**: `lib/supabase/server.ts`의 `createClient()`
   - Server Components와 Route Handlers에서 사용
   - 쿠키 기반 인증 처리
   - **중요**: Fluid compute 환경을 위해 함수 내에서 매번 새로 생성해야 함 (전역 변수 사용 금지)

2. **Client Components**: `lib/supabase/client.ts`의 `createClient()`
   - 브라우저 환경의 Client Components에서 사용
   - `createBrowserClient` 사용

3. **Middleware**: `lib/supabase/middleware.ts`의 `updateSession()`
   - Next.js 미들웨어에서 사용
   - 인증되지 않은 사용자를 `/auth/login`으로 리다이렉트
   - **중요**: `createServerClient`와 `supabase.auth.getClaims()` 사이에 코드를 추가하지 말 것

### 인증 흐름

- **미들웨어 보호**: `middleware.ts`는 모든 요청을 가로채서 인증 확인
- **보호된 라우트**: `/protected` 경로는 인증된 사용자만 접근 가능
- **공개 경로**: `/auth/*` (login, sign-up, forgot-password 등)는 미들웨어에서 제외
- **인증 확인 라우트**: `/auth/confirm/route.ts`에서 이메일 확인 처리

### 환경 변수

필수 환경 변수 (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=[Supabase 프로젝트 URL]
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[Supabase Anon Key]
```

**참고**: 환경 변수가 설정되지 않은 경우 미들웨어는 자동으로 건너뜁니다.

### 경로 별칭 설정

`tsconfig.json`에서 `@/*`를 프로젝트 루트로 매핑:
```typescript
// 사용 예시
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
```

### shadcn/ui 컴포넌트

- **스타일**: new-york
- **위치**: `components/ui/`
- **설정**: `components.json`에서 관리
- **추가 방법**: `npx shadcn@latest add [component-name]`

## 코드 작성 가이드라인

### Supabase 클라이언트 사용 시 주의사항

1. **Server Components/Route Handlers**:
   ```typescript
   import { createClient } from "@/lib/supabase/server";

   export default async function ServerComponent() {
     // 매번 새로 생성 (전역 변수 X)
     const supabase = await createClient();
     const { data } = await supabase.from('table').select();
   }
   ```

2. **Client Components**:
   ```typescript
   'use client';
   import { createClient } from "@/lib/supabase/client";

   export default function ClientComponent() {
     const supabase = createClient();
     // ...
   }
   ```

3. **Middleware 수정 시**:
   - `createServerClient`와 `supabase.auth.getClaims()` 사이에 코드를 추가하지 말 것
   - 새로운 Response 객체를 만들 경우 반드시 쿠키를 복사할 것

### TypeScript 타입

- Supabase 데이터베이스 타입은 `lib/supabase/database.types.ts`에 정의됨
- 타입 생성: Supabase CLI를 사용하여 자동 생성 가능

## MCP 서버 설정

프로젝트는 다음 MCP 서버를 사용합니다:
- **supabase**: Supabase 데이터베이스 연동
- **playwright**: 브라우저 자동화
- **context7**: 문서 검색
- **shadcn**: shadcn/ui 컴포넌트 관리
- **shrimp-task-manager**: 작업 관리
- **Figma Desktop**: 웹디자인 도구

## Git Hooks

프로젝트는 Husky를 사용하여 커밋 전 자동 검증을 수행합니다:
- **pre-commit**: 스테이지된 파일에 대해 ESLint + Prettier 자동 실행
- 커밋 전 자동으로 코드 품질 검사 및 포맷팅 수행

## 추가 참고사항

- **Turbopack**: 개발 서버는 Turbopack을 사용하여 더 빠른 개발 경험 제공
- **폰트**: Bree Serif (Display 제목) + Pretendard (본문) — next/font/google 로딩
- **다크 모드**: next-themes를 통해 시스템 설정 기반 자동 전환 지원
- **PWA**: next-pwa + Service Worker + offline 폴백 페이지

💡 **상세 규칙은 위 개발 가이드 문서들을 참조하세요**
- 테스트 계정: customer@gmail.com / chan1026*$*
- 관리자 테스트 계정: customer@gmail.com / chan1026*$*

## Project Context

- PRD 문서: docs/PRD.md
- 개발 로드맵: docs/ROADMAP.md