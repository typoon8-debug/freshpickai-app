# PROMPT — freshpick-app v1.0 AI장보기 RAG 본격 도입 (pgvector + Agent + 시맨틱 캐시)

> **작성일**: 2026-05-04
> **대상 버전**: freshpick-app **v1.0**
> **선행 버전**: v0.7d (`PROMPT-freshpick-v0.7d-ai-shopping.md`) — `customer_preference` 테이블, `persona-context.ts`, 채팅 화면 골격, F014/F015 사유 보강 완료
> **목표 기간**: 8~10주 (4~5 sprint)
> **참조 보고서**: `AI-Shopping-RAG-Tech-Stack-Analysis.md`

---

## 0. 이 프롬프트의 사용법

이 프롬프트는 **Claude Code**에 Phase 단위로 분할 전달하여 v1.0의 RAG 기반 AI장보기 도입 Task로 실행시키는 것을 목적으로 작성되었습니다.

> **시작 명령**
>
> > 다음은 freshpick-app v1.0의 AI장보기 RAG 본격 도입 Task 명세입니다. v0.7d에서 만든 자산(customer_preference, persona-context, 채팅 화면 골격, F014/F015 사유 보강)을 **확장**하되 **삭제하지 않습니다**. Supabase pgvector + Vercel AI SDK ToolLoopAgent + 시맨틱 캐시 + 자기보강 루프를 6개 Phase로 도입합니다. 각 Phase는 독립 PR로 분리하고 Phase 완료마다 골든 셋 평가를 통과시킨 후 다음 Phase로 넘어가세요. 비상업 라이선스 데이터의 운영 임베드는 절대 금지입니다.

---

## 1. v1.0 범위 정의

### 1.1 v1.0에서 **할 것** (6가지)

| 항목 | 산출물 |
|------|--------|
| **A. pgvector 인프라 + RAG 데이터 모델** | `tenant_item_ai_detail` (chunk + embedding) + `ai_query_cache` + `customer_preference.embedding` 컬럼 |
| **B. 임베딩 백필 + 자동화** | 2,875 SKU × 평균 3 chunk = 약 8,500개 행 적재. 마스터 변경 시 Edge Function이 자동 재임베딩 |
| **C. ToolLoopAgent 기반 페르소나 응답** | 4개 tool (`searchItems` / `getUserContext` / `getInventory` / `addToCart`) + Claude Sonnet 4.6 |
| **D. 시맨틱 캐시 + 자기보강 루프** | `ai_query_cache` HIT/MISS, LLM 결과 → `tenant_item_ai_detail` UPSERT (REVIEW_NEEDED) |
| **E. manager-app 운영 도구** | REVIEW_NEEDED 큐 / 골든 셋 평가 대시보드 / 토큰 비용 대시보드 |
| **F. 페르소나 시그니처 자동 추론** | 행동 데이터(주문·검색·viewer log) 기반 customer_preference 자동 보정 |

### 1.2 v1.0에서 **하지 않을 것** (v1.x 이후)

- ❌ 음성 입력·TTS (첨부 스크린샷 6의 마이크 / Say 버튼) — v1.x
- ❌ 멀티 매장 비교 추천 ("다른 가게에서 더 싸요") — v1.x
- ❌ 실시간 레시피 영상 / 외부 콘텐츠 임베드 — v1.x
- ❌ Anthropic Web Search Tool (외부 레시피 보강) — v1.x (운영 모니터링 후 도입)
- ❌ 영양 분석 / 칼로리 추적 — v1.x

---

## 2. 사전 조건 (v1.0 시작 전 확인)

### 2.1 v0.7d에서 완료되어야 할 것

- [ ] `customer_preference` 테이블 (RLS 포함)
- [ ] `customer_preference` 입력 UI + Server Action
- [ ] `lib/ai/persona-context.ts` `buildPersonaContext()` 함수
- [ ] `lib/ai/prompts.ts` system prompt 빌더
- [ ] `/ai-shopping/chat` 화면 (streamText 기반)
- [ ] F014/F015 사유 보강 (sessionStorage 24h 캐시)
- [ ] `ANTHROPIC_API_KEY` Vercel 환경 변수 설정
- [ ] 운영 데이터: `tenant_item_master` 2,875 SKU + `tenant_item_detail.short_desc` 적재율 ≥ 80%

### 2.2 v1.0에 새로 추가되는 의존성

```bash
npm install openai          # text-embedding-3-small
# Vercel AI SDK는 v0.7d에서 이미 설치됨 (ai, @ai-sdk/anthropic)
```

신규 환경 변수:
- `OPENAI_API_KEY` — 임베딩 전용
- `AI_GATEWAY_URL` — (옵션) Vercel AI Gateway
- `RAG_VECTOR_THRESHOLD` — 기본 0.75 (RAG 검색 컷오프)
- `RAG_CACHE_THRESHOLD` — 기본 0.95 (시맨틱 캐시 적중)

### 2.3 운영 데이터 게이트

v1.0 Phase 2(임베딩 백필)는 **다음 데이터 게이트가 충족된 후에만 시작**합니다.

| 게이트 | 기준 | 미달 시 |
|--------|------|---------|
| 상품 마스터 적재율 | `tenant_item_master.status='ACTIVE'` ≥ 2,500개 | sellerbox-app 운영자가 마스터 보강 후 진입 |
| 상품 설명 적재율 | `tenant_item_detail.short_desc IS NOT NULL` ≥ 80% | sellerbox 이미지스크래핑(Task 081) 완료 |
| 카테고리 정합성 | `tenant_category_code` 매핑 100% | 미매핑 상품 별도 처리 |
| 사용자 행동 데이터 | DELIVERED 주문 ≥ 100건, customer_preference 입력 ≥ 30명 | 자동 추론 정확도 부족 → Phase 6 보류 |

---

## 3. 산출물

```
freshpick-app/
├── app/
│   ├── (mobile)/
│   │   └── ai-shopping/
│   │       └── chat/
│   │           ├── page.tsx                          # 수정 — Agent 라우팅으로 전환
│   │           └── _components/
│   │               ├── AiChatClient.tsx              # 수정 — tool_call 진행 표시 추가
│   │               ├── ToolCallIndicator.tsx        # 신규 — "상품 검색 중...", "재고 확인 중..."
│   │               └── ActionableCard.tsx           # 신규 — "장바구니 담기" CTA 내장 카드
│   └── api/
│       └── ai/
│           └── shopping/
│               ├── chat/route.ts                    # 수정 — streamText → ToolLoopAgent
│               └── recommend/route.ts              # 수정 — RAG 기반 사유 + 유사 상품 보강
│
├── lib/
│   ├── ai/
│   │   ├── persona-context.ts                       # 수정 — getUserContext tool로 래핑
│   │   ├── prompts.ts                              # 수정 — Agent 시스템 프롬프트로 확장
│   │   ├── embeddings.ts                           # 신규 — OpenAI text-embedding-3-small
│   │   ├── tools/
│   │   │   ├── search-items.ts                    # 신규 — 벡터 검색 tool
│   │   │   ├── get-user-context.ts                # 신규
│   │   │   ├── get-inventory.ts                   # 신규
│   │   │   └── add-to-cart.ts                     # 신규 — Server Action 래핑
│   │   ├── cache.ts                                 # 신규 — 시맨틱 캐시 미들웨어
│   │   ├── self-improve.ts                         # 신규 — onFinish 훅 → tenant_item_ai_detail UPSERT
│   │   └── persona-signature.ts                    # 신규 — 페르소나 시그니처 빌더
│   ├── actions/
│   │   ├── ai/
│   │   │   ├── rag-search.ts                       # 신규 — match_ai_chunks RPC 래퍼 + 폴백
│   │   │   ├── persona-inference.ts               # 신규 — 행동 기반 페르소나 자동 추론
│   │   │   └── ai-detail.actions.ts               # 신규 — tenant_item_ai_detail CRUD
│   │   └── domain/
│   │       └── preference.actions.ts              # 수정 — embedding 자동 갱신
│   └── api/
│       ├── recommendations.ts                      # 수정 — 벡터 검색 가중치 추가
│       └── purchasePattern.ts                      # 수정 — DB 함수 활성화
│
├── supabase/
│   ├── migrations/
│   │   ├── 20260801_pgvector_enable.sql            # 신규 — 확장 활성화
│   │   ├── 20260801_tenant_item_ai_detail.sql      # 신규 — 핵심 RAG 테이블
│   │   ├── 20260801_ai_query_cache.sql             # 신규 — 시맨틱 캐시
│   │   ├── 20260801_customer_preference_embed.sql  # 신규 — embedding 컬럼 추가
│   │   ├── 20260801_match_ai_chunks_rpc.sql        # 신규 — RAG 검색 RPC
│   │   ├── 20260801_match_query_cache_rpc.sql      # 신규 — 캐시 검색 RPC
│   │   └── 20260901_compute_purchase_pattern_fn.sql # 신규 — F015 DB 함수
│   ├── functions/
│   │   ├── embed-tenant-item/                     # Edge Function — 마스터 변경 시 재임베딩
│   │   │   └── index.ts
│   │   ├── embed-preference/                      # Edge Function — preference 변경 시 재임베딩
│   │   │   └── index.ts
│   │   └── cache-cleanup/                         # Edge Function — TTL 만료 캐시 정리 (cron)
│   │       └── index.ts
│   └── seed/
│       └── ai_detail_seed.ts                       # 백필 스크립트 (별도 환경에서 실행)
│
├── scripts/
│   └── ai/
│       ├── 01_backfill_embeddings.ts               # 신규 — 2,875 SKU 백필
│       ├── 02_backfill_preferences.ts             # 신규 — 기존 customer_preference embedding 채우기
│       ├── 03_eval_golden_set.ts                  # 신규 — 평가 fixture 실행
│       └── README.md
│
├── (manager-app/)                                   # ⚠️ 별도 리포지토리, 본 sprint와 함께 진행
│   └── app/(admin)/ai-detail-review/                # 신규 — REVIEW_NEEDED 큐
│
└── docs/
    ├── ai-shopping-v1.0.md                          # 신규 — v1.0 운영 가이드
    └── ai-rollback.md                               # 신규 — 롤백 절차
```

---

## 4. 단계별 구현 계획 (6 Phase, 약 8~10주)

### Phase 1 — 인프라 활성화 (1주)

**목표**: pgvector 확장 + 신규 테이블 + RPC + Edge Function 골격을 만든다. 이 Phase는 **데이터 적재 없음**.

**작업**:

1. **pgvector 확장 활성화**
   ```sql
   -- supabase/migrations/20260801_pgvector_enable.sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **`tenant_item_ai_detail` 테이블** (RAG 보고서의 설계 그대로)
   ```sql
   -- supabase/migrations/20260801_tenant_item_ai_detail.sql
   CREATE TABLE tenant_item_ai_detail (
     ai_detail_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     tenant_item_id    UUID NOT NULL REFERENCES tenant_item_master(tenant_item_id) ON DELETE CASCADE,
     chunk_type        TEXT NOT NULL CHECK (chunk_type IN (
                         'short_desc','long_desc','recipe','nutrition','pairing',
                         'storage','persona_tag','cooking_tip','origin_story','allergy_info'
                       )),
     chunk_seq         INT NOT NULL DEFAULT 0,
     content           TEXT NOT NULL,
     content_summary   TEXT,
     metadata          JSONB DEFAULT '{}'::JSONB,
     embedding         vector(1536),
     source            TEXT NOT NULL CHECK (source IN (
                         'manual','lottemartzetta','web_search','llm_generated'
                       )),
     source_url        TEXT,
     confidence        NUMERIC(3,2) DEFAULT 0.80,
     persona_tags      TEXT[] DEFAULT ARRAY[]::TEXT[],
     status            TEXT DEFAULT 'ACTIVE' CHECK (status IN (
                         'ACTIVE','STALE','REVIEW_NEEDED','REJECTED'
                       )),
     created_at        TIMESTAMPTZ DEFAULT NOW(),
     updated_at        TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE (tenant_item_id, chunk_type, chunk_seq)
   );

   CREATE INDEX idx_ai_detail_embedding
     ON tenant_item_ai_detail USING hnsw (embedding vector_cosine_ops)
     WITH (m = 16, ef_construction = 64);
   CREATE INDEX idx_ai_detail_item ON tenant_item_ai_detail(tenant_item_id);
   CREATE INDEX idx_ai_detail_chunk_type ON tenant_item_ai_detail(chunk_type);
   CREATE INDEX idx_ai_detail_persona_tags ON tenant_item_ai_detail USING GIN (persona_tags);
   CREATE INDEX idx_ai_detail_content_trgm ON tenant_item_ai_detail USING GIN (content gin_trgm_ops);

   ALTER TABLE tenant_item_ai_detail ENABLE ROW LEVEL SECURITY;
   -- RLS: tenant_id 기반 (sellerbox 패턴 준수)
   ```

3. **`ai_query_cache` 테이블**
   ```sql
   -- supabase/migrations/20260801_ai_query_cache.sql
   CREATE TABLE ai_query_cache (
     cache_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     customer_id       UUID,
     store_id          UUID,
     query_text        TEXT NOT NULL,
     query_embedding   vector(1536) NOT NULL,
     response_payload  JSONB NOT NULL,
     persona_signature TEXT,
     hit_count         INT DEFAULT 0,
     created_at        TIMESTAMPTZ DEFAULT NOW(),
     expires_at        TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
   );
   CREATE INDEX idx_cache_embedding ON ai_query_cache USING hnsw (query_embedding vector_cosine_ops);
   CREATE INDEX idx_cache_persona ON ai_query_cache(persona_signature);
   CREATE INDEX idx_cache_expires ON ai_query_cache(expires_at);
   ```

4. **`customer_preference` embedding 컬럼 추가**
   ```sql
   -- supabase/migrations/20260801_customer_preference_embed.sql
   ALTER TABLE customer_preference ADD COLUMN IF NOT EXISTS embedding vector(1536);
   CREATE INDEX IF NOT EXISTS idx_customer_pref_embedding
     ON customer_preference USING hnsw (embedding vector_cosine_ops);
   ```

5. **RPC 함수 2종**
   - `match_ai_chunks(query_embedding, threshold, count, persona_filter, chunk_type_filter)` — RAG 보고서의 설계 그대로
   - `match_query_cache(query_embedding, threshold, persona_signature, customer_id, store_id)` — 시맨틱 캐시

6. **Edge Function 골격** (실행 로직은 Phase 2)
   - `embed-tenant-item` — `tenant_item_master` UPDATE/INSERT 트리거 시 호출
   - `embed-preference` — `customer_preference` UPSERT 트리거 시 호출
   - `cache-cleanup` — 일 1회 cron, `expires_at < NOW()` 삭제

7. **`lib/ai/embeddings.ts`**
   ```typescript
   import { openai } from "@ai-sdk/openai";
   import { embed } from "ai";

   export async function generateEmbedding(text: string): Promise<number[]> {
     const { embedding } = await embed({
       model: openai.embedding("text-embedding-3-small"),
       value: text,
     });
     return embedding;
   }
   ```

**DoD**:
- [ ] 모든 마이그레이션 Supabase Studio에서 적용
- [ ] `match_ai_chunks` RPC 호출 가능 (빈 결과 반환 OK)
- [ ] Edge Function 3종 deployed (실행 안 해도 OK)
- [ ] `generateEmbedding("토마토")` 호출 시 1536차원 배열 반환
- [ ] `npm run check-all` + `npm run build` 통과

---

### Phase 2 — 임베딩 백필 + 자동화 (2주)

**목표**: 2,875 SKU에 평균 3개 chunk = 약 8,500 embedding을 적재한다. 마스터 변경 시 자동 재임베딩 트리거를 활성화한다.

**작업**:

1. **백필 스크립트** — `scripts/ai/01_backfill_embeddings.ts`
   - **청킹 전략**:
     - `chunk_type='short_desc'`: `tenant_item_detail.short_desc` 그대로
     - `chunk_type='long_desc'`: `tenant_item_detail.long_desc`를 500~1500자 청크로 분할 (overlap 100자)
     - `chunk_type='persona_tag'`: 카테고리 + 표준분류명을 자동 페르소나 태그로 변환 (예: "육류 → ['family_dinner', 'protein_rich']", "곡류 → ['solo_diet', 'staple']")
   - **배치 처리**:
     - 100개씩 배치, 배치 사이 1초 sleep (OpenAI rate limit 회피)
     - 진행률 stdout 표시
     - 실패 시 해당 항목만 건너뛰고 `_raw/failed.jsonl`에 기록
   - **재실행 가능**: `tenant_item_id + chunk_type + chunk_seq` 기준 idempotent UPSERT
   - **권장 실행 환경**: 로컬 또는 Supabase Function 단발 실행 (Vercel function timeout 회피)

2. **Edge Function `embed-tenant-item` 활성화**
   ```typescript
   // supabase/functions/embed-tenant-item/index.ts
   import { serve } from "https://deno.land/std/http/server.ts";
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
   import OpenAI from "https://esm.sh/openai@4";

   serve(async (req) => {
     const { record, type } = await req.json(); // PostgreSQL Webhook payload
     // tenant_item_master UPDATE/INSERT 시 호출됨
     // 1) tenant_item_detail 최신 short_desc/long_desc 조회
     // 2) 청킹 + 임베딩 생성
     // 3) tenant_item_ai_detail UPSERT (chunk_type='short_desc'/'long_desc')
     // 4) chunk_type='persona_tag'는 자동 재계산
   });
   ```
   - **PostgreSQL Webhook 트리거 등록** (Supabase Dashboard → Database → Webhooks)

3. **백필 검증**
   - 백필 후 `select count(*) from tenant_item_ai_detail` ≥ 7,000 (2,875 SKU × 평균 2.5 chunk)
   - 임베딩 누락 검증: `where embedding is null` = 0
   - 샘플 5건 LLM 평가 (사람 검토)

4. **`customer_preference.embedding` 백필** — `scripts/ai/02_backfill_preferences.ts`
   - 기존 입력된 customer_preference 모두 임베딩 생성
   - preference 텍스트화 규칙: `"가구 ${household_size}명, ${has_children ? '자녀 있음' : '자녀 없음'}, 식이 ${diet_tags}, 맛 ${taste_tags}, 알러지 ${allergy_tags}, 조리 ${cooking_skill}"`

5. **검색 정합성 측정**
   - 골든 셋 50건 (`scripts/ai/03_eval_golden_set.ts`):
     - "토마토 추천", "오징어 어떻게 요리해?", "데친 고사리 활용법", "다이어트 식단" 등
   - `match_ai_chunks` 결과의 top-1 정확도 ≥ 60%, top-5 정확도 ≥ 85%

**DoD**:
- [ ] `tenant_item_ai_detail` 행 수 ≥ 7,000
- [ ] embedding 누락 0건
- [ ] PostgreSQL Webhook 활성화 — `tenant_item_master` UPDATE 시 60초 이내 ai_detail 재임베딩 검증
- [ ] customer_preference 백필 100%
- [ ] 골든 셋 top-5 정확도 ≥ 85%

---

### Phase 3 — RAG 검색 + F014/F015 본격 통합 (1.5주)

**목표**: v0.7d의 sessionStorage 기반 사유 보강을 **RAG 기반 추천**으로 격상한다. 기존 카테고리 TOP3 폴백 로직은 그대로 두되, RAG 결과가 우선.

**작업**:

1. **RAG 검색 Server Action** — `lib/actions/ai/rag-search.ts`
   ```typescript
   "use server";
   import { createAdminClient } from "@/lib/supabase/admin";
   import { generateEmbedding } from "@/lib/ai/embeddings";

   export async function searchAiChunks(params: {
     query: string;
     storeId: string;
     personaTags?: string[];
     chunkType?: string;
     k?: number;
   }) {
     const supabase = createAdminClient();
     const queryEmbedding = await generateEmbedding(params.query);
     const { data, error } = await supabase.rpc("match_ai_chunks", {
       query_embedding: queryEmbedding,
       match_threshold: Number(process.env.RAG_VECTOR_THRESHOLD ?? 0.75),
       match_count: params.k ?? 8,
       filter_persona: params.personaTags ?? null,
       filter_chunk_type: params.chunkType ?? null,
     });
     if (error) {
       // 폴백 1: pg_trgm `search_items_by_similarity` (기존 R708)
       return fallbackTrgmSearch(params.query, params.storeId);
     }
     return data;
   }
   ```

2. **F014 RAG 통합** — `lib/api/recommendations.ts` 수정
   - 기존: 카테고리 TOP3 → 8개 추천
   - v1.0: customer_preference.embedding과 가까운 chunk → tenant_item_id 추출 → `v_store_inventory_item`에서 가용 상품 조회 → 8개 추천 (가중치 50%)
   - 가중치 50%는 카테고리 TOP3 (기존 로직, 50%) + 임베딩 유사도 (50%) 합산
   - **장점**: 운영 초기 임베딩 데이터 부족해도 폴백이 살아있음

3. **F015 DB 함수 활성화** — `supabase/migrations/20260901_compute_purchase_pattern_fn.sql`
   - 6개월 DELIVERED 주문 → 평균 간격 → DB 함수로 이전
   - 런타임 on-the-fly 계산 → DB 함수 호출 (응답 200ms → 50ms 기대)
   - **호환성**: `purchasePattern.ts`는 두 경로 모두 지원, env로 토글

4. **사유 생성 RAG 보강** — `app/api/ai/shopping/recommend/route.ts` 수정
   - 기존: items만 LLM에 전달
   - v1.0: items + RAG로 검색한 관련 chunk 2~3개를 system prompt에 주입 → 더 구체적·정확한 사유
   - 예: "당근에는 베타카로틴이 풍부해서 자녀 영양식에 좋아요" (chunk content 활용)

5. **검색 화면(Architecture C)에서도 RAG 활용** — `lib/api/products.ts` `searchByCategory()` 보강
   - 기존: pg_trgm RPC + ILIKE 폴백 (R708/R709)
   - v1.0 추가 옵션 (env 토글): 키워드 임베딩 → `match_ai_chunks(chunk_type='short_desc')` → tenant_item_id 추출 → store_item 조회 → pg_trgm 결과와 합쳐 정렬
   - **AB 테스트** 가능하게 분리

6. **테스트**
   - 골든 셋 50건 검색 회귀 — 기존 pg_trgm 결과 100% 유지 + 신규 매칭 추가
   - F014 진입 → 페르소나 임베딩 매칭 결과 확인 (Playwright)
   - F015 DB 함수 결과 = 런타임 계산 결과 (스냅샷 검증)

**DoD**:
- [ ] `searchAiChunks` Server Action 동작, 폴백 정상
- [ ] F014가 RAG 결과 + 카테고리 TOP3 합산으로 정렬
- [ ] F015 DB 함수 활성화, P95 응답 < 100ms
- [ ] 사유 생성에 chunk content 반영
- [ ] 골든 셋 top-5 회귀 0건

---

### Phase 4 — ToolLoopAgent 채팅 (2주)

**목표**: v0.7d의 stateless `streamText` 채팅을 **다단계 tool 호출 Agent**로 격상한다.

**작업**:

1. **4개 Tool 구현** — `lib/ai/tools/`

   `search-items.ts`
   ```typescript
   export const searchItemsTool = {
     description: "벡터 유사도로 상품·레시피 정보 검색. 사용자가 식재료·요리·메뉴를 물으면 사용",
     parameters: z.object({
       query: z.string().describe("검색어 (한국어, 단어 또는 짧은 문장)"),
       personaTags: z.array(z.string()).optional(),
       chunkType: z.enum(["short_desc","long_desc","recipe","pairing"]).optional(),
     }),
     execute: async ({ query, personaTags, chunkType }, { storeId }) => {
       const chunks = await searchAiChunks({ query, storeId, personaTags, chunkType });
       // 같은 tenant_item_id 묶어서 v_store_inventory_item과 JOIN하여 가용 여부 확인
       // 결과 5개 이내로 압축
       return chunks.slice(0, 5);
     },
   };
   ```

   `get-user-context.ts`
   ```typescript
   export const getUserContextTool = {
     description: "사용자 위치·가구·최근 주문·취향 조회",
     parameters: z.object({}),
     execute: async (_, { customerId, storeId }) => {
       return await buildPersonaContext(customerId, storeId);
     },
   };
   ```

   `get-inventory.ts`
   ```typescript
   export const getInventoryTool = {
     description: "특정 상품의 현재 재고 확인",
     parameters: z.object({
       storeItemIds: z.array(z.string()).max(20),
     }),
     execute: async ({ storeItemIds }, { storeId }) => {
       // v_store_inventory_item에서 재고 + 가격 조회
       return await getInventoryForStore(storeId, storeItemIds);
     },
   };
   ```

   `add-to-cart.ts`
   ```typescript
   export const addToCartTool = {
     description: "사용자가 명시적으로 동의한 상품을 장바구니에 추가",
     parameters: z.object({
       items: z.array(z.object({
         storeItemId: z.string(),
         qty: z.number().min(1).max(99),
       })).max(20),
       userConsent: z.boolean().describe("반드시 사용자가 명시적으로 동의했는지 확인"),
     }),
     execute: async ({ items, userConsent }, { customerId, storeId }) => {
       if (!userConsent) {
         return { error: "user_consent_required" };
       }
       // 기존 cart Server Action 재사용
       return await addCartItemsAction(items);
     },
   };
   ```

2. **API Route 교체** — `app/api/ai/shopping/chat/route.ts`
   ```typescript
   import { ToolLoopAgent } from "ai";
   import { anthropic } from "@ai-sdk/anthropic";

   export async function POST(req: Request) {
     const { messages, customerId, storeId } = await req.json();

     // 인증 + customer_id 재검증 (서버 측 진실)
     const verifiedCustomerId = await verifyCustomerByEmail(customerId);
     const ctx = { customerId: verifiedCustomerId, storeId };

     // 1) 시맨틱 캐시 미들웨어 (Phase 5에서 활성화)
     // const cached = await checkSemanticCache(messages, ctx);
     // if (cached) return cached.toResponse();

     const agent = new ToolLoopAgent({
       model: anthropic("claude-sonnet-4-6"),
       system: buildAgentSystemPrompt(await buildPersonaContext(verifiedCustomerId, storeId)),
       tools: {
         searchItems: bindContext(searchItemsTool, ctx),
         getUserContext: bindContext(getUserContextTool, ctx),
         getInventory: bindContext(getInventoryTool, ctx),
         addToCart: bindContext(addToCartTool, ctx),
       },
       maxSteps: 5,
       maxOutputTokens: 1500,
     });

     const result = await agent.stream({ messages });
     return result.toDataStreamResponse();
   }
   ```

3. **시스템 프롬프트 확장** — `lib/ai/prompts.ts`의 `buildAgentSystemPrompt`
   ```
   당신은 freshpick의 AI 장보기 도우미 "모아달"입니다.
   
   ${기존 페르소나 컨텍스트}
   
   사용 가능한 도구:
   - searchItems: 상품·레시피 검색
   - getInventory: 재고 확인
   - addToCart: 장바구니 추가 (사용자 동의 후)
   
   응답 가이드:
   1. 사용자가 "추천해 줘", "뭐 먹지?" 같은 질문을 하면 먼저 searchItems로 후보를 찾으세요.
   2. 추천 전에 getInventory로 재고를 확인하세요. 재고 0인 상품은 추천하지 마세요.
   3. addToCart는 사용자가 명시적으로 "담아줘", "주문해줘"라고 할 때만 사용하세요. 절대 임의로 호출하지 마세요.
   4. 추천 사유를 항상 한두 문장으로 설명하세요.
   5. 알러지 정보가 있는 사용자에게 알러지 식재료를 절대 추천하지 마세요.
   ```

4. **Tool 호출 진행 표시** — `_components/ToolCallIndicator.tsx`
   - useChat의 `data` 스트림에서 tool_call 이벤트 감지
   - "🔍 상품 검색 중...", "📦 재고 확인 중..." 등 친근한 문구
   - tool_result 도착 시 페이드 아웃

5. **장바구니 액션 통합** — `_components/ActionableCard.tsx`
   - Agent 응답에 추천 카드가 포함되면 카드 하단에 "담기" 버튼
   - 버튼 클릭 시 사용자 동의 확인 후 `addToCart` tool 재호출 (별도 user message)
   - 또는 Agent가 generateObject로 직접 카드 + 액션을 함께 출력

6. **테스트 — 페르소나 골든 셋 90건**
   - 페르소나 A (40대 주부, 가족 저녁): 30건
   - 페르소나 B (30대 1인 다이어트): 30건
   - 페르소나 C (식재료 활용법 문의): 30건
   - 각 시나리오에 대해 LLM Judge(Claude)로 자동 평가:
     - 알러지 가드 통과율 100% (필수)
     - 추천 상품 재고 보유율 ≥ 95%
     - 사용자 동의 없는 cart 호출 0건 (필수)
     - 페르소나 일관성 (LLM Judge 점수 ≥ 4.0/5.0)
   - 사람 검토 30건 샘플링 → 응답 품질 점수 ≥ 4.0/5.0

**DoD**:
- [ ] 4개 tool 동작, ToolLoopAgent 5단계 이내 응답
- [ ] 알러지 가드 90건 100% 통과
- [ ] 사용자 동의 없는 cart 호출 0건
- [ ] tool_call 진행 표시 UI 동작
- [ ] 응답 P95 < 5초 (스트리밍 첫 토큰 < 1.5초)

---

### Phase 5 — 시맨틱 캐시 + 자기보강 루프 (1.5주)

**목표**: 반복되는 페르소나 프롬프트의 LLM 호출을 절감하고, 새로 알게 된 지식을 RAG에 적재한다.

**작업**:

1. **`lib/ai/cache.ts`** — 시맨틱 캐시 미들웨어
   ```typescript
   export async function checkSemanticCache(
     messages: Message[],
     ctx: { customerId: string; storeId: string },
   ): Promise<CachedResponse | null> {
     const lastUserMsg = messages.findLast(m => m.role === "user")?.content;
     if (!lastUserMsg) return null;

     const queryEmbedding = await generateEmbedding(lastUserMsg);
     const personaSig = await buildPersonaSignature(ctx.customerId);

     const { data } = await supabase.rpc("match_query_cache", {
       query_embedding: queryEmbedding,
       match_threshold: Number(process.env.RAG_CACHE_THRESHOLD ?? 0.95),
       persona_signature: personaSig,
       customer_id: ctx.customerId,
       store_id: ctx.storeId,
     });

     if (data?.length > 0) {
       // hit_count 증가
       await supabase
         .from("ai_query_cache")
         .update({ hit_count: data[0].hit_count + 1 })
         .eq("cache_id", data[0].cache_id);
       return data[0].response_payload;
     }
     return null;
   }

   export async function upsertSemanticCache(...) { /* ... */ }
   ```

2. **페르소나 시그니처** — `lib/ai/persona-signature.ts`
   - 입력: customerId
   - 출력: `"gender:F|age_range:40s|family:3|hour:16-18|diet:diet_tag_a"` 형식
   - 시그니처 일치하지 않으면 캐시 적중 안 됨 (개인화 보호)

3. **`lib/ai/self-improve.ts`** — Agent onFinish 훅
   - Agent 응답에서 새로 알게 된 정보를 추출 (예: 새로운 페어링, 레시피)
   - LLM Judge로 사실성 평가 (사실 여부 ≥ 4/5만 통과)
   - `tenant_item_ai_detail` UPSERT:
     - source = `'llm_generated'`
     - confidence = 0.6
     - status = `'REVIEW_NEEDED'`
   - **자동 ACTIVE 승격 절대 금지** — manager-app 운영자 검토 후만

4. **manager-app: REVIEW_NEEDED 큐 화면**
   - 메뉴 위치: 시스템관리 → AI상품상세검토 (60008 신규)
   - 화면 구성:
     - Panel1: REVIEW_NEEDED 페어 목록 (item_name + chunk_type + content + source + created_at)
     - Panel2: 검토 액션 (ACTIVE 승격 / REJECTED / 수정 후 승격 / confidence 조정)
   - 일괄 승인·거부 지원

5. **TTL 정리 cron**
   - `cache-cleanup` Edge Function을 매일 새벽 3시 실행 (Supabase pg_cron)
   - `expires_at < NOW()` 삭제

6. **모니터링**
   - 시맨틱 캐시 적중률 (목표 ≥ 30% 한 달 후)
   - LLM 비용 (월 $X 한도)
   - REVIEW_NEEDED 누적 건수 (운영자 처리 속도)

**DoD**:
- [ ] 시맨틱 캐시 미들웨어 동작 — 임베딩 0.95 + 페르소나 시그니처 일치 시 적중
- [ ] 동일 페르소나 동일 질문 반복 시 LLM 호출 0회
- [ ] manager-app REVIEW_NEEDED 큐에 LLM 생성 chunk 적재 확인
- [ ] 운영자가 1건 ACTIVE 승격 후 다음 검색에 반영
- [ ] cache-cleanup cron 동작 확인

---

### Phase 6 — 페르소나 자동 추론 + 종합 평가 (1주)

**목표**: customer_preference 미입력 사용자도 행동 데이터로 자동 페르소나 추론. v1.0 출시 게이트 통과.

**작업**:

1. **페르소나 자동 추론** — `lib/actions/ai/persona-inference.ts`
   - 입력: customerId, 최근 90일 행동 데이터
     - order_detail (장바구니 빈도·시간대)
     - item_view_log (조회 패턴)
     - search 키워드 (자주 검색하는 카테고리)
   - 출력: `Partial<CustomerPreference>` (예: 추정 가구 인원, 식이 선호)
   - 사용자가 명시적으로 입력한 값이 있으면 그것을 우선, 추론 값은 보조
   - 추론 결과를 `customer_preference`에 `inferred=true` 플래그로 저장 (별도 컬럼 추가)

2. **자동 추론 트리거**
   - 주문 완료 시 (Plan B 결제 콜백) `customer_preference` 비어있는 사용자에게 자동 추론 1회 실행
   - 30일마다 재추론 (preference가 사용자 업데이트 안 했을 때만)

3. **종합 평가 — 골든 셋 200건**
   - 페르소나 A/B/C 각 50건 + 자동 추론 50건
   - 평가 지표:
     - 알러지 가드: **100%** (필수)
     - 사용자 동의 없는 cart: **0건** (필수)
     - 추천 재고 보유율 ≥ 95%
     - 응답 품질 LLM Judge 점수 ≥ 4.2/5.0
     - 응답 P95 < 5초
     - 시맨틱 캐시 적중률 ≥ 30% (1주 운영 후)

4. **A/B 테스트 (옵션)**
   - 50% 사용자: v1.0 RAG Agent
   - 50% 사용자: v0.7d streamText (control)
   - 측정: 채팅 진입 후 장바구니 전환율, 추천 클릭률
   - 2주 운영 후 평가

5. **롤백 절차 문서화** — `docs/ai-rollback.md`
   - LLM 비용 폭주 시: env `AI_SHOPPING_REASONS_ENABLED=false`로 사유 차단
   - Agent 오작동 시: env `AI_SHOPPING_AGENT_MODE=streamtext`로 v0.7d 모드 전환
   - 임베딩 부정확 시: env `RAG_VECTOR_THRESHOLD` 0.75 → 0.85로 컷오프 강화
   - 시맨틱 캐시 오답 시: `update ai_query_cache set status='REJECTED'` 일괄 업데이트

**DoD**:
- [ ] 페르소나 자동 추론 동작 (preference 미입력 사용자 ≥ 70% 추정 가능)
- [ ] 골든 셋 200건 통과 기준 모두 충족
- [ ] 롤백 절차 문서화 + 1회 dry-run 검증
- [ ] 운영 모니터링 대시보드 (LLM 비용, 캐시 적중률, REVIEW_NEEDED 적체)
- [ ] PRD-freshpick-app-v1.0.md + ROADMAP-freshpick-app-v1.0.md 작성

---

## 5. v0.7d → v1.0 호환성 (반드시 지킬 약속)

| v0.7d 자산 | v1.0 변경 방식 | 호환성 |
|------------|----------------|--------|
| `customer_preference` 테이블 | `ALTER TABLE ADD COLUMN embedding vector(1536)` | ✅ 기존 데이터 100% 보존 |
| `customer_preference` 입력 UI | 변경 없음 | ✅ 사용자 재입력 불필요 |
| `lib/ai/persona-context.ts` | 시그니처 유지, 내부 RPC 추가 | ✅ 호출 코드 변경 없음 |
| `lib/ai/prompts.ts` | 함수 추가 (Agent 전용), 기존 함수 유지 | ✅ |
| `/ai-shopping/chat` 화면 | API Route 내부 교체, useChat 그대로 | ✅ UI 코드 변경 최소 |
| F014/F015 카테고리 TOP3 폴백 | 그대로 유지, RAG 결과와 50:50 합산 | ✅ 임베딩 부족 시 폴백 |
| sessionStorage 24시간 캐시 | 시맨틱 캐시(7일 TTL) 와 병존 → 점진 전환 | ✅ 충돌 없음 |
| 알러지 가드 system prompt | Agent 시스템 프롬프트에 강화 통합 | ✅ 강화 |
| `maxOutputTokens` 가드 | Agent 단계별 + 최종 모두 적용 | ✅ |

---

## 6. 명시적 거부 / 비목표 (v1.0 한정)

- ❌ **음성 입력 / TTS** (첨부 스크린샷 6의 마이크·Say): v1.x
- ❌ **외부 웹 검색 tool** (Anthropic Web Search 등): v1.x (v1.0 운영 모니터링 후)
- ❌ **자동 ACTIVE 승격**: 자기보강 루프는 항상 REVIEW_NEEDED 거쳐야 함
- ❌ **다른 매장 비교 추천**: v1.x
- ❌ **영양 분석·칼로리 추적**: v1.x
- ❌ **프로모션 자동 매칭** (LLM이 임의로 할인 약속): 절대 금지
- ❌ **사용자 동의 없는 자동 결제 / cart 추가**: 절대 금지

---

## 7. 위험 요소 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| 임베딩 데이터 부족 → RAG 정확도 저하 | UX 저하 | Phase 2 백필 후 골든 셋 정확도 ≥ 85% 검증 게이트, 미달 시 카테고리 TOP3 폴백 비중 증가 |
| LLM 비용 폭주 | 운영비 부담 | Phase 5 시맨틱 캐시 적중률 ≥ 30% 목표, AI Gateway 모니터링, 일일 한도 + Slack 알림 |
| Agent 무한 루프 | 응답 지연·비용 | `maxSteps=5` 강제, P95 모니터링 |
| Tool 권한 우회 (cart 무단 호출) | 사용자 신뢰 훼손 | `userConsent: true` 파라미터 강제, Phase 4 골든 셋 0건 검증 |
| 자기보강 루프 오염 | RAG 품질 저하 | 자동 ACTIVE 절대 금지, REVIEW_NEEDED 거치게, LLM Judge 사실성 평가 통과해야 큐 진입 |
| 시맨틱 캐시 오답 (잘못된 응답이 캐싱됨) | 동일 오답 반복 노출 | 사용자 thumbs down 시 즉시 `status='REJECTED'` 자동, 운영자 일괄 정리 도구 |
| pgvector HNSW 빌드 시간 (8,500 행) | 백필 중 부하 | Phase 2를 야간 배치로 분할, `m=16, ef_construction=64` 기본값 유지 |
| customer_preference 미입력 사용자 다수 | 페르소나 일반화 | Phase 6 자동 추론으로 보정, 채팅 진입 시 1회 권유 toast |
| RLS 우회 가능성 | 데이터 누설 | 모든 RPC는 createAdminClient() 호출 시점에 customerId 명시 검증, **클라이언트가 보낸 customerId는 서버에서 항상 재조회** |

---

## 8. 수락 기준 요약 (v1.0 출시 게이트)

- [ ] Phase 1~6 모든 DoD 통과
- [ ] 골든 셋 200건:
  - 알러지 가드 100%
  - 사용자 동의 없는 cart 호출 0건
  - 추천 재고 보유율 ≥ 95%
  - 응답 품질 LLM Judge ≥ 4.2/5.0
  - 응답 P95 < 5초
- [ ] 시맨틱 캐시 적중률 ≥ 30% (출시 후 2주 운영)
- [ ] LLM 비용 일일 SLO 충족
- [ ] manager-app REVIEW_NEEDED 큐 처리율 ≥ 80% (1주 적체 < 50건)
- [ ] 롤백 절차 dry-run 통과
- [ ] PRD-freshpick-app-v1.0.md + ROADMAP-freshpick-app-v1.0.md 완성

---

## 9. 실행 직전 자기검증 8문항

에이전트는 작업 시작 전에 다음 8가지를 답변·확인한 뒤 진행하세요.

1. v0.7d의 `customer_preference` 테이블·입력 UI·persona-context.ts가 운영 환경에 배포되어 있는가?
2. 운영 데이터 게이트 (마스터 2,500개·short_desc 80%·DELIVERED 100건·preference 30명)가 충족되었는가?
3. `OPENAI_API_KEY` + `ANTHROPIC_API_KEY` Vercel 환경 변수가 설정되어 있는가?
4. 비상업 라이선스 데이터셋이 운영 빌드에 포함되지 않도록 차단 assertion이 있는가?
5. 자기보강 루프가 자동으로 ACTIVE 승격하지 않는 구조인가?
6. cart 호출 시 `userConsent: true` 파라미터를 강제하는 구조인가?
7. 모든 LLM 호출에 `maxSteps` / `maxOutputTokens` 가드가 적용되어 있는가?
8. 클라이언트가 보낸 customerId를 서버에서 재조회·검증하는 구조인가?

8개 모두 "예"가 되어야 진행하세요. 하나라도 "아니오"면 그 단계에서 멈추고 사용자에게 보고하세요.

---

> **본 프롬프트의 끝.**
> 의문이 생기면 임의 결정 대신, PR description "질문" 섹션에 기록하고 사용자 확인을 요청하세요. 특히 알러지 가드 강도, 모델 선택, 캐시 TTL, 자기보강 루프 ACTIVE 기준은 반드시 운영자 결정이 필요합니다.
