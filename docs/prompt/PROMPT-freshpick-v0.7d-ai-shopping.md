# PROMPT — freshpick-app v0.7d AI장보기 점진 개선 (RAG 인프라 없이 LLM 채팅 + 보강 추천)

> **작성일**: 2026-05-04
> **대상 버전**: freshpick-app **v0.7d** (현행 v0.7c 다음 정식 버전)
> **선행 버전**: v0.7c — Hotfix BF (PWA) 까지 완료, Phase 5 v0.7 신규 요구사항 6/10 진행 중
> **다음 버전**: v1.0 — RAG 본격 도입 (별도 프롬프트 `PROMPT-freshpick-v1.0-ai-rag.md` 참조)
> **목표 기간**: 2~3주 (단일 sprint)
> **전제**: 시스템 아직 오픈 전, 기존 30개 보정 사전은 샘플

---

## 0. 이 프롬프트의 사용법

이 프롬프트는 **Claude Code**에 1회 또는 Phase 단위로 전달하여 v0.7d의 AI장보기 개선 Task로 실행시키는 것을 목적으로 작성되었습니다.

> **시작 명령**
>
> > 다음은 freshpick-app v0.7d의 AI장보기 점진 개선 Task 명세입니다. v1.0의 RAG 인프라(pgvector·ToolLoopAgent·시맨틱 캐시)는 도입하지 않습니다. 대신 현재의 F014/F015 폴백을 강화하고, LLM 1회 호출로 끝나는 가벼운 페르소나 채팅을 추가하며, v1.0의 데이터 기반(`customer_preference` 수집)을 미리 시작합니다. 각 Phase는 독립 PR로 분리하고 `npm run check-all` + `npm run build`를 통과시킨 후 커밋하세요.

---

## 1. v0.7d 범위 정의 — 무엇을 하고 / 하지 않는가

### 1.1 v0.7d에서 **할 것** (4가지)

| 항목 | 이유 |
|------|------|
| **A. AI장보기 채팅 기본 화면** (`/ai-shopping/chat`) | 첨부 스크린샷의 "모아달에게 물어보세요…" 입력창. 사용자 첫 인상 확보 |
| **B. LLM 1회 호출 페르소나 응답** | tool calling·RAG 없이도 페르소나 예시 답변 80% 수준 도달 가능 (시간대·위치·가구·최근 주문을 system prompt에 주입) |
| **C. F014/F015 보강** | 현행 폴백(카테고리 TOP3·런타임 on-the-fly)을 그대로 두되, 응답에 "왜 추천하는가" 한 줄 사유 추가 + 페르소나 컨텍스트 반영 |
| **D. `customer_preference` 데이터 수집 시작** (테이블만, RAG 없이) | v1.0 RAG가 활용할 데이터를 미리 모음. v0.7d에서는 단순 CRUD UI만 |

### 1.2 v0.7d에서 **하지 않을 것** (v1.0으로 미루는 것)

| 항목 | 미루는 이유 |
|------|------------|
| ❌ Supabase pgvector / 임베딩 인프라 | 활성화·인덱스·HNSW 빌드는 1.0의 본격 RAG에서 한 번에 |
| ❌ `tenant_item_ai_detail` 테이블 + 청킹·임베딩 백필 | 데이터 적재가 본격적인 ETL 작업. 별도 sprint 필요 |
| ❌ Vercel AI SDK `ToolLoopAgent` + 4개 tool | 도구 호출 루프는 디버깅·모니터링 비용이 큼. 단일 호출로 충분한 가치 확인 후 도입 |
| ❌ 시맨틱 캐시 (`ai_query_cache`) | 사용자 데이터가 충분히 쌓인 후에야 ROI 측정 가능 |
| ❌ 자기보강 루프 (LLM 결과를 RAG에 적재) + manager-app 검토 큐 | 운영 가드 없이 시작하면 부정확한 정보가 누적됨 |
| ❌ AI Gateway·멀티 모델 라우팅 | 먼저 단일 모델로 비용·품질 베이스라인 확보 |
| ❌ 페르소나 시그니처 자동 추론 | `customer_preference` 명시 입력만으로 출발, 자동 추론은 데이터 쌓인 후 |

이 분리 원칙은 **"운영 가드 + 데이터 기반"이 갖춰지지 않은 단계에서 LLM을 깊게 묶지 않는다**입니다. v0.7d에서 LLM은 **stateless 단일 호출**로만 작동합니다.

---

## 2. 컨텍스트 (작업 시작 전 반드시 확인)

### 2.1 현행 freshpick-app v0.7c 상태 (확인된 사실)

- **AI장보기 진입**: 하단 탭 → `/ai-shopping`, 3개 내부탭 [내메모 · AI추천 · 자동리스트] (Hotfix BA, 기본 탭=내메모)
- **F014 AI 추천**: `lib/api/recommendations.ts` `getAiRecommendations(customerId, storeId)` — `order_detail` 기반 카테고리 TOP3 + `inventory` JOIN. `ai_recommendation` 테이블 미구현으로 폴백 동작 중
- **F015 자동 리스트**: `lib/api/purchasePattern.ts` `getPurchasePatterns(customerId)` — 6개월 DELIVERED 주문 분석, `compute_purchase_pattern` DB 함수 미구현으로 런타임 on-the-fly 계산
- **자연어 4-step 파이프라인**: `lib/utils/memo-parser.ts` (CORRECTION_DICT 30개 — 별도 프롬프트로 확장 예정)
- **inventory 필터 VIEW**: `v_store_inventory_item` (Hotfix BB) — `(on_hand - reserved) > 0` 상품만 노출. 모든 상품 조회는 이 VIEW 경유
- **Architecture C**: `tenant_item_master + store_item + v_store_item + tenant_item_detail` (Hotfix AV)
- **결제 우선 (Plan B)**: 주문 버튼 → orderNo 생성 → 토스 결제 완료 후 DB 쓰기 (Hotfix BE)

### 2.2 핵심 데이터 모델 (v0.7d AI장보기에서 사용)

```
v_store_inventory_item (가용재고 상품)
  ├─ store_item_id (PK)
  ├─ tenant_item_id, store_id
  ├─ item_name, sale_price, list_price, item_img
  └─ category_code, std_large/medium/small_code (페르소나 매칭용)

customer
  ├─ customer_id, email
  ├─ store_id, eupmyeondong (위치 기반)
  └─ (신규) preference_id → customer_preference

order + order_detail
  └─ 최근 30일 주문 분석 (system prompt 주입)

(신규) customer_preference
  ├─ customer_id (UNIQUE)
  ├─ household_size, has_children
  ├─ diet_tags[], taste_tags[], allergy_tags[]
  ├─ cooking_skill, preferred_hour
  └─ (v0.7d에서는 embedding 컬럼 없음 — v1.0에서 추가)
```

### 2.3 기술 스택 (v0.7c에서 그대로 가져감 + 신규 1개)

기존: Next.js 16 / React 19 / TypeScript / Tailwind / shadcn/ui / Zustand / Supabase / Server Actions / Vercel.

신규 의존성 (v0.7d에서 추가):
- **`ai`** (Vercel AI SDK) — `streamText` / `generateObject`만 사용. `ToolLoopAgent`는 v1.0
- **`@ai-sdk/anthropic`** — Claude Sonnet 4.6 또는 Haiku 4.5
- 환경 변수: `ANTHROPIC_API_KEY`

> 모델 선택 결정: v0.7d는 비용 우선으로 **Haiku 4.5 (`claude-haiku-4-5-20251001`)**를 기본으로 하고, A/B용으로 Sonnet 4.6을 환경 변수 토글 (`AI_SHOPPING_MODEL=haiku|sonnet`)로 둡니다. v1.0에서 AI Gateway로 정식 라우팅.

---

## 3. 산출물

```
freshpick-app/
├── app/
│   ├── (mobile)/
│   │   └── ai-shopping/
│   │       ├── chat/
│   │       │   ├── page.tsx                          # 신규 — Server Component (customer/store 주입)
│   │       │   └── _components/
│   │       │       ├── AiChatClient.tsx              # 신규 — useChat 기반 화면
│   │       │       ├── ChatMessage.tsx               # 신규 — 메시지 버블
│   │       │       ├── RecommendationCard.tsx       # 신규 — generateObject 결과 카드
│   │       │       └── ChatComposer.tsx             # 신규 — 입력창
│   │       ├── recommendations-client.tsx           # 수정 — "추천 사유" 표시
│   │       └── automatic-list-client.tsx            # 수정 — "재구매 사유" 표시
│   │   └── mypage/
│   │       └── preference/
│   │           ├── page.tsx                          # 신규 — 페르소나 입력 화면
│   │           └── preference-form-client.tsx       # 신규 — RHF + Zod
│   └── api/
│       └── ai/
│           └── shopping/
│               ├── chat/route.ts                    # 신규 — streamText (1회 호출, no tools)
│               └── recommend/route.ts               # 신규 — generateObject (메뉴 카드 3개)
│
├── lib/
│   ├── ai/
│   │   ├── prompts.ts                               # 신규 — system prompt 빌더
│   │   ├── persona-context.ts                      # 신규 — customer + order + preference 주입
│   │   └── recommendation-schema.ts                # 신규 — Zod schema (메뉴 카드)
│   ├── actions/
│   │   └── domain/
│   │       └── preference.actions.ts               # 신규 — customer_preference CRUD
│   └── api/
│       ├── recommendations.ts                      # 수정 — reasonText 필드 추가
│       └── purchasePattern.ts                      # 수정 — reasonText 필드 추가
│
├── types/
│   └── preference.ts                                # 신규 — CustomerPreference 타입
│
├── supabase/
│   └── migrations/
│       └── 20260615_customer_preference_v07d.sql   # 신규 (테이블만, embedding 없음)
│
└── docs/
    └── ai-shopping-v0.7d.md                        # 신규 — 운영 가이드 + v1.0 마이그레이션 노트
```

---

## 4. 단계별 구현 계획 (4 Phase, 약 2~3주)

### Phase 1 — 페르소나 데이터 수집 인프라 (3~4일)

**목표**: v1.0 RAG가 활용할 사용자 컨텍스트 수집을 v0.7d에서 미리 시작한다. **이 Phase는 LLM 호출 없음** — 순수 CRUD.

**작업**:

1. **DB 마이그레이션** — `supabase/migrations/20260615_customer_preference_v07d.sql`
   ```sql
   CREATE TABLE IF NOT EXISTS customer_preference (
     preference_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     customer_id       UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
     household_size    INT,
     has_children      BOOLEAN DEFAULT FALSE,
     diet_tags         TEXT[] DEFAULT ARRAY[]::TEXT[],
     taste_tags        TEXT[] DEFAULT ARRAY[]::TEXT[],
     allergy_tags      TEXT[] DEFAULT ARRAY[]::TEXT[],
     cooking_skill     TEXT,
     preferred_hour    INT,
     -- v1.0 RAG에서 embedding vector(1536) 컬럼 추가 예정
     created_at        TIMESTAMPTZ DEFAULT NOW(),
     updated_at        TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE (customer_id)
   );

   CREATE INDEX idx_customer_preference_customer ON customer_preference(customer_id);

   -- RLS: 본인만 읽기·수정
   ALTER TABLE customer_preference ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "own_pref_select" ON customer_preference
     FOR SELECT USING (
       customer_id IN (SELECT customer_id FROM customer WHERE email = auth.jwt() ->> 'email')
     );
   CREATE POLICY "own_pref_upsert" ON customer_preference
     FOR ALL USING (
       customer_id IN (SELECT customer_id FROM customer WHERE email = auth.jwt() ->> 'email')
     );
   ```
   > ⚠️ 다른 마이그레이션과 동일하게 **수동 실행 필요**, ROADMAP "미적용 DB 마이그레이션" 섹션에 추가

2. **타입** — `types/preference.ts` (`CustomerPreference`, `PreferenceFormValues`)

3. **Server Actions** — `lib/actions/domain/preference.actions.ts`
   - `getMyPreference()` — 본인 preference 조회 (없으면 null)
   - `upsertMyPreferenceAction(values)` — RHF에서 호출
   - `customer_id`는 **반드시 `customer` 테이블 `.eq("email", user.email)` 패턴** (Hotfix Q에서 확립된 패턴 준수)

4. **UI — 마이프레시 진입점** — `app/(mobile)/mypage/preference/`
   - 마이프레시 페이지에 메뉴 항목 1개 추가: "내 취향 설정"
   - 화면 구성:
     - 가구 인원 (라디오 1·2·3·4·5+)
     - 자녀 유무 (스위치)
     - 식이 태그 멀티셀렉트: `diet_tags` ∈ `[저염식, 다이어트, 채식, 비건, 글루텐프리, 케토, 무지방]`
     - 맛 선호 멀티셀렉트: `taste_tags` ∈ `[깔끔한맛, 매운맛, 단맛, 짠맛, 담백한맛, 진한맛]`
     - 알러지 멀티셀렉트: `allergy_tags` ∈ `[땅콩, 갑각류, 우유, 계란, 메밀, 대두, 밀, 복숭아, 토마토]`
     - 조리 숙련도 (라디오 초급·중급·고급)
     - 평소 쇼핑 시간대 (시간 선택 0~23, 옵션)
   - 모든 필드 optional, 부분 입력 허용, 언제든 수정 가능

5. **Zod 스키마** — `lib/schemas/domain/preference.schema.ts` 표준 패턴 (`z.preprocess`로 빈문자→undefined)

6. **테스트** — Playwright 시나리오 3건
   - 신규 회원이 빈 폼으로 진입 → 부분 입력 → 저장 → 재진입 시 값 유지
   - 알러지 태그 선택·해제 동작
   - RLS 검증 (다른 customer의 preference_id 직접 조회 차단)

**DoD**:
- [ ] DB 마이그레이션 적용 완료, RLS 본인만 동작
- [ ] 마이프레시 → 내 취향 설정 진입·저장·재조회
- [ ] Playwright 3 시나리오 통과
- [ ] `npm run check-all` + `npm run build` 통과

---

### Phase 2 — 페르소나 컨텍스트 빌더 + LLM 헬퍼 (2일)

**목표**: customer / order / preference / store / 시간을 LLM system prompt로 변환하는 단일 함수를 만든다. Phase 3·4가 이 함수 위에서 동작.

**작업**:

1. **`lib/ai/persona-context.ts`** — 페르소나 컨텍스트 빌더
   ```typescript
   export interface PersonaContext {
     // 정적
     customerId: string;
     storeId: string;
     storeName: string;
     locationLabel: string;       // 예: "구리시 인창동"
     // 시간
     localHour: number;            // KST 기준 0~23
     dayOfWeek: number;            // 0(일)~6(토)
     // preference (있으면)
     householdSize?: number;
     hasChildren?: boolean;
     dietTags?: string[];
     tasteTags?: string[];
     allergyTags?: string[];
     cookingSkill?: string;
     // 최근 주문
     recentOrderItems?: Array<{ itemName: string; orderedAt: string }>;
   }

   export async function buildPersonaContext(
     customerId: string,
     storeId: string,
   ): Promise<PersonaContext> { /* ... */ }
   ```
   - customer + customer_preference + 최근 30일 order_detail (최대 20건) + store.delivery_address + KST 시간을 한 번에 조회
   - **N+1 방지**: `Promise.all`로 병렬 조회
   - 결과는 그대로 system prompt에 주입할 수 있는 모양

2. **`lib/ai/prompts.ts`** — system prompt 빌더
   ```typescript
   export function buildShoppingChatSystemPrompt(ctx: PersonaContext): string {
     return `당신은 동네 신선식품 마트 freshpick의 AI 장보기 도우미 "모아달"입니다.
   
   사용자 정보:
   - 위치: ${ctx.locationLabel}
   - 가구 인원: ${ctx.householdSize ?? "미입력"}명${ctx.hasChildren ? " (자녀 있음)" : ""}
   - 식이 선호: ${ctx.dietTags?.join(", ") || "미입력"}
   - 맛 선호: ${ctx.tasteTags?.join(", ") || "미입력"}
   - 알러지: ${ctx.allergyTags?.join(", ") || "없음"}
   - 조리 숙련도: ${ctx.cookingSkill ?? "미입력"}
   - 현재 시각: ${ctx.localHour}시 (${["일","월","화","수","목","금","토"][ctx.dayOfWeek]}요일)
   - 최근 30일 주문: ${ctx.recentOrderItems?.map(o => o.itemName).join(", ") || "없음"}
   
   응답 가이드:
   1. 알러지가 있는 식재료는 절대 추천하지 마세요.
   2. 시간대(아침/점심/저녁)와 가구 구성에 맞는 메뉴를 우선 제안하세요.
   3. 메뉴를 추천할 때는 "왜 이 메뉴인지" 한두 문장으로 설명하세요.
   4. 마트에서 바로 살 수 있는 식재료 위주로 안내하세요.
   5. 한국어로 친근하게 답변하세요. 이모지는 절제해서 사용하세요.
   `;
   }

   export function buildRecommendCardSystemPrompt(ctx: PersonaContext): string { /* ... */ }
   ```
   - **알러지 가드는 system prompt에 항상 포함** (모델이 잊지 않도록)
   - 한국어 / 친근 / 이모지 절제 / 마트 즉시 구매 가능 — 4가지 톤 가이드 명시

3. **단위 테스트** — `lib/ai/prompts.test.ts`
   - preference가 비어있어도 빌드 가능
   - 알러지 가이드가 항상 포함되는지 검증
   - locationLabel이 "주소 미설정"인 경우에도 동작

**DoD**:
- [ ] `buildPersonaContext` 단위 테스트 5건 통과 (preference 있음/없음/order 있음/없음/시간대)
- [ ] system prompt 빌더가 항상 알러지 가이드를 포함
- [ ] 100ms 이내 컨텍스트 조회 (Vercel Postgres pooling 가정)

---

### Phase 3 — 채팅 화면 + LLM 1회 호출 (5~6일)

**목표**: 첨부 스크린샷의 "모아달에게 물어보세요…" 화면을 만들고, 사용자 입력 → LLM 1회 호출 → 스트리밍 답변.

**작업**:

1. **API Route** — `app/api/ai/shopping/chat/route.ts`
   ```typescript
   import { streamText } from "ai";
   import { anthropic } from "@ai-sdk/anthropic";
   import { buildPersonaContext } from "@/lib/ai/persona-context";
   import { buildShoppingChatSystemPrompt } from "@/lib/ai/prompts";

   export async function POST(req: Request) {
     const { messages, customerId, storeId } = await req.json();
     // 1) 사용자 인증 검증 (auth() + customer.email 매칭)
     const ctx = await buildPersonaContext(customerId, storeId);
     const system = buildShoppingChatSystemPrompt(ctx);
     const model = process.env.AI_SHOPPING_MODEL === "sonnet"
       ? anthropic("claude-sonnet-4-6")
       : anthropic("claude-haiku-4-5-20251001");

     const result = streamText({
       model,
       system,
       messages,
       maxOutputTokens: 800,    // 비용 가드
       temperature: 0.7,
     });
     return result.toDataStreamResponse();
   }
   ```
   - **tools 미사용** — v0.7d는 stateless 단일 호출
   - **maxOutputTokens 가드** 800 (비용 폭주 방지)
   - **에러 핸들링**: API 키 누락·rate limit·timeout 시 fallback 문구 ("일시적으로 모아달이 답할 수 없어요. 잠시 후 다시 시도해 주세요")

2. **페이지 + 컴포넌트** — `app/(mobile)/ai-shopping/chat/`
   - `page.tsx` (Server Component)
     - 사용자 인증 확인, customerId/storeId 추출
     - 비로그인 시 `/auth/login?next=/ai-shopping/chat` 리다이렉트
     - `<AiChatClient customerId={...} storeId={...} />` 렌더
   - `_components/AiChatClient.tsx`
     ```typescript
     "use client";
     import { useChat } from "@ai-sdk/react";

     export default function AiChatClient({ customerId, storeId }: Props) {
       const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
         useChat({
           api: "/api/ai/shopping/chat",
           body: { customerId, storeId },
         });
       // ...
     }
     ```
   - **첨부 스크린샷 매칭**:
     - 빈 상태(메시지 0개): 중앙에 이모지 가이드(🥗🍅🥬🥦🐟🍗🍚🎁🍊) + 하단 입력창 placeholder "모아달에게 물어보세요..."
     - 메시지 표시: 사용자 우측 정렬 / 모아달 좌측 정렬 + 작은 아바타
     - 스트리밍 중: 좌측 메시지에 점멸 커서
     - 에러: sonner toast로 알림

3. **AI장보기 진입점에 채팅 탭 추가**
   - 현행 3탭 [내메모 · AI추천 · 자동리스트]에 **채팅 탭 추가는 하지 않음** (스와이프 충돌 위험)
   - 대신 AI장보기 화면 상단에 "모아달에게 물어보기" 플로팅 버튼 (60×60 둥근 + 챗 아이콘)
   - 버튼 클릭 → `/ai-shopping/chat` 이동

4. **채팅 → 검색·메모 연결** (얕은 통합)
   - 채팅 응답에 상품명이 들어가면, 응답 메시지 하단에 "검색해보기" 버튼 표시 (정규식·LLM 요청 모두 사용 가능, v0.7d는 정규식만)
   - 클릭 → `/search?q=상품명` 이동
   - **본격적인 cart 액션 통합은 v1.0**

5. **테스트** — Playwright 시나리오 4건
   - 비로그인 → 로그인 리다이렉트
   - "오늘 뭐 먹지?" 입력 → 응답 스트리밍 시작 (3초 이내)
   - 알러지 입력자가 알러지 식재료 질문 → 답변에 해당 식재료 미포함
   - API 에러 시 fallback 문구 표시

**DoD**:
- [ ] 채팅 화면 진입·메시지 송수신·스트리밍 표시 정상
- [ ] 페르소나 컨텍스트가 system prompt에 정확히 주입 (Playwright + 모델 응답 검증)
- [ ] 알러지 가드 검증 통과
- [ ] 비용 가드 (maxOutputTokens 800) 적용
- [ ] 환경 변수 토글로 Haiku ↔ Sonnet 전환 동작

---

### Phase 4 — F014/F015 추천 사유 보강 (2~3일)

**목표**: 기존 AI추천·자동리스트 폴백 로직은 그대로 두되, 각 항목에 LLM 1회 호출로 한 줄 사유를 붙여 사용자 가치를 높인다. (LLM 호출 빈도가 사용자 진입 시 1회로 제한되도록 설계)

**작업**:

1. **추천 사유 생성 API** — `app/api/ai/shopping/recommend/route.ts`
   ```typescript
   import { generateObject } from "ai";
   import { anthropic } from "@ai-sdk/anthropic";
   import { z } from "zod";

   const ReasonsSchema = z.object({
     reasons: z.array(
       z.object({
         storeItemId: z.string(),
         reasonText: z.string().max(60), // 한 줄 60자 이내
       })
     ),
   });

   export async function POST(req: Request) {
     const { items, customerId, storeId } = await req.json();
     // items: [{ storeItemId, itemName, categoryName }]
     const ctx = await buildPersonaContext(customerId, storeId);
     const system = buildRecommendCardSystemPrompt(ctx);
     const result = await generateObject({
       model: anthropic("claude-haiku-4-5-20251001"), // 사유 생성은 Haiku 고정
       schema: ReasonsSchema,
       system,
       prompt: `다음 상품들에 대해 ${ctx.locationLabel} 거주 사용자에게 왜 추천하는지 한 줄(60자 이내)로 작성하세요.\n\n${items.map(i => `- ${i.storeItemId}: ${i.itemName} (${i.categoryName})`).join("\n")}`,
       maxOutputTokens: 600,
     });
     return Response.json(result.object);
   }
   ```

2. **F014 보강** — `app/(mobile)/ai-shopping/recommendations-client.tsx` 수정
   - 기존 `getAiRecommendations` 결과 8개를 받은 직후, `/api/ai/shopping/recommend`에 한 번 호출
   - 결과의 `reasonText`를 `RecommendationCard`에 전달
   - **로딩 처리**: 사유 생성 중에도 카드 자체는 즉시 표시 (점진적 hydration), 사유는 들어오는 대로 fade-in
   - **실패 처리**: 사유 생성 실패 시 카드만 표시 (사유 빈 상태)
   - **캐싱**: `sessionStorage`에 `customerId + storeId + 날짜(YYYY-MM-DD)` 키로 24시간 캐시 → 같은 날 재진입 시 LLM 재호출 안 함

3. **F015 보강** — `app/(mobile)/ai-shopping/automatic-list-client.tsx` 수정
   - F014와 동일 패턴, 단 system prompt가 다름 ("재구매 주기 관점에서" 강조)
   - sessionStorage 캐싱 동일

4. **레이아웃 변경** — `RecommendationCard.tsx` (또는 동등 컴포넌트)
   - 기존: 이미지 + 상품명 + 가격
   - 추가: 가격 아래 1줄 회색 텍스트 (`text-xs text-muted-foreground`) — `reasonText`
   - 글자 수 60자 초과 시 `truncate` + 탭 시 다이얼로그 풀텍스트

5. **비용 가드**
   - 한 사용자 당 하루 최대 LLM 호출:
     - 채팅: 무제한 (사용자 능동, 자체 토큰 가드만)
     - F014/F015 사유: 진입 1회 × 화면 2개 = 2회/일
   - 환경 변수 `AI_SHOPPING_REASONS_ENABLED=true|false` 토글로 긴급 차단 가능

6. **테스트**
   - F014 진입 → 8개 카드 즉시 표시 → 사유 fade-in (Playwright)
   - sessionStorage 캐시 적중 시 API 미호출 (Network 모킹)
   - 사유 생성 실패 시 카드만 표시 (Graceful degrade)

**DoD**:
- [ ] F014/F015 진입 시 카드별 사유 표시
- [ ] 24시간 sessionStorage 캐시 동작
- [ ] 사유 생성 실패 시 graceful degrade
- [ ] 비용 토글 동작

---

## 5. v1.0 마이그레이션 노트

v0.7d에서 만들어 두는 자산이 v1.0에서 어떻게 활용되는지 명시합니다.

| v0.7d 자산 | v1.0에서의 변화 |
|------------|----------------|
| `customer_preference` 테이블 | `embedding vector(1536)` 컬럼 추가 + HNSW 인덱스, 페르소나 시그니처 자동 추론 |
| `lib/ai/persona-context.ts` | `getUserContext` tool로 래핑되어 `ToolLoopAgent`에서 사용 |
| `lib/ai/prompts.ts` | tool 사용 가이드·자기보강 지침 추가, 모듈화 |
| `app/api/ai/shopping/chat/route.ts` | `streamText` → `ToolLoopAgent` 교체, tools 4종 등록, 시맨틱 캐시 미들웨어 추가 |
| `RecommendationCard` | tool 결과 + 벡터 검색 결과를 합쳐 렌더링하도록 확장 |
| sessionStorage 캐시 | `ai_query_cache` 테이블 + 임베딩 0.95 매칭으로 진화 |

**호환성 약속**: v0.7d의 모든 컴포넌트·테이블은 v1.0에서 **확장**되지만 **삭제되지 않습니다**. v1.0 마이그레이션 시 v0.7d 데이터(`customer_preference` 입력값 등) 100% 보존.

---

## 6. 명시적 거부 / 비목표 (v0.7d 한정)

이 sprint에서는 다음을 **하지 않습니다**.

- ❌ **pgvector·임베딩 인프라**: v1.0
- ❌ **`tenant_item_ai_detail` 테이블**: v1.0
- ❌ **Tool calling / ToolLoopAgent**: v1.0
- ❌ **시맨틱 캐시 (DB)**: v1.0 (sessionStorage만)
- ❌ **자기보강 루프**: v1.0
- ❌ **manager-app 운영 도구 (REVIEW_NEEDED 큐 등)**: v1.0
- ❌ **AI Gateway / 멀티 모델 라우팅**: v1.0
- ❌ **페르소나 시그니처 자동 추론**: v1.0
- ❌ **채팅 → 장바구니 직접 추가 액션**: v1.0 (검색 화면 이동까지만)
- ❌ **외부 웹 검색 (레시피 보강)**: v1.0
- ❌ **음성 입력 / TTS** (첨부 스크린샷 6의 "Say"·녹음 UI): v1.0 이후 별도 검토

---

## 7. 위험 요소 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| LLM 응답 한국어 품질 미달 | 사용자 이탈 | Haiku → Sonnet 환경 변수 토글로 즉시 업그레이드 가능. PR 리뷰 시 골든 셋 5개 응답 점검 |
| 알러지 가드 우회 (모델이 무시) | 안전 사고 | system prompt에 매번 포함 + Phase 3 테스트에 알러지 검증 1건 필수 |
| 비용 폭주 | 운영비 부담 | maxOutputTokens 800 / 환경변수 차단 토글 / sessionStorage 캐시 / Haiku 기본값 |
| customer_preference 빈 사용자 | 답변 일반화·가치 저하 | system prompt에 "미입력" 명시 → 모델이 일반 안내로 답변. 채팅 화면 진입 시 1회 "취향 설정하면 더 정확해져요" toast |
| API 인증 토큰 노출 | 보안 사고 | 절대 클라이언트 번들에 포함 금지, 모든 LLM 호출은 Route Handler 서버 측 |
| 모델 응답 지연 (P95 > 5s) | UX 저하 | useChat 스트리밍으로 즉시 첫 토큰 표시. 네트워크 끊김 시 "재시도" 버튼 |
| RLS 우회 (다른 customer 데이터 노출) | 프라이버시 | `buildPersonaContext` 첫 줄에 `auth.users` ↔ `customer.email` 검증 강제. customer_id 클라이언트 직접 전달 금지(서버에서 재조회) |

> **중요한 보안 결정**: API 호출 시 클라이언트가 `customerId`를 body에 보내더라도, 서버는 이 값을 신뢰하지 않고 `auth().email` → `customer.email` → 본인 `customer_id`로 다시 조회한 값만 사용합니다. (Hotfix Q에서 확립된 패턴)

---

## 8. 수락 기준 요약 (v0.7d 종료 시)

- [ ] `customer_preference` 테이블 + RLS + UI + Server Action 동작
- [ ] `/ai-shopping/chat` 화면 진입·스트리밍 응답 동작
- [ ] F014/F015에 추천 사유 표시 (24시간 캐시)
- [ ] 알러지 가드 모든 LLM 응답에서 동작 (테스트 통과)
- [ ] 비용 가드 (maxOutputTokens, 환경변수 차단) 동작
- [ ] Playwright E2E 시나리오 12건 (Phase 1: 3 / Phase 3: 4 / Phase 4: 3 / 추가 회귀: 2) 통과
- [ ] `npm run check-all` + `npm run build` 통과
- [ ] `docs/ai-shopping-v0.7d.md`에 운영 가이드 + v1.0 마이그레이션 노트 작성
- [ ] ROADMAP-freshpick-app-v0.7d.md에 본 sprint Task 등록·완료 표시

---

## 9. 실행 직전 자기검증 6문항

에이전트는 작업 시작 전에 다음 6가지를 답변·확인한 뒤 진행하세요.

1. v0.7c 현행 코드의 `getAiRecommendations` 시그니처와 반환 타입을 확인했는가?
2. `customer_id` 조회 패턴(`.eq("email", user.email)`)을 모든 신규 코드에 적용했는가?
3. `ANTHROPIC_API_KEY`를 클라이언트 번들에 노출하지 않는 구조인가? (Route Handler 서버 측 호출만)
4. `maxOutputTokens` 가드를 모든 LLM 호출에 적용했는가?
5. system prompt에 알러지 가드가 항상 포함되는가?
6. v0.7d의 모든 신규 테이블·컴포넌트가 v1.0에서 삭제되지 않고 확장만 되도록 설계되었는가?

6개 모두 "예"가 되어야 진행하세요. 하나라도 "아니오"면 그 단계에서 멈추고 사용자에게 보고하세요.

---

> **본 프롬프트의 끝.**
> v0.7d 완료 후 v1.0은 별도 프롬프트(`PROMPT-freshpick-v1.0-ai-rag.md`)로 진행합니다.
> 의문이 생기면 임의 결정 대신 PR description에 기록하고 사용자 확인을 요청하세요. 특히 모델 선택(Haiku/Sonnet), 알러지 가드 강도, 캐시 TTL은 운영자 결정이 필요합니다.
