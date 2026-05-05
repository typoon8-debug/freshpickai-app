# PROMPT — freshpick-app v1.0 AI장보기 RAG 본격 도입 (pgvector + 5-tool Agent + 5테마 RAG 보강)

> **작성일**: 2026-05-04 (v2 — v0.7d 변경사항 반영: FreshPick 명칭, 3탭 [AI채팅·내메모·AI추천], addToMemo tool 유지·확장, AI추천 5테마 RAG 보강)
> **대상 버전**: freshpick-app **v1.0**
> **선행 버전**: v0.7d (`PROMPT-freshpick-v0.7d-ai-shopping-v2.md`) — 3탭 구조, AI채팅 + addToMemo tool, AI추천 5테마, customer_preference 테이블, persona-context.ts 완료
> **목표 기간**: 8~10주 (4~5 sprint)
> **참조 보고서**: `AI-Shopping-RAG-Tech-Stack-Analysis.md`

---

## 0. 이 프롬프트의 사용법

이 프롬프트는 **Claude Code**에 Phase 단위로 분할 전달하여 v1.0의 RAG 기반 AI장보기 도입 Task로 실행시키는 것을 목적으로 작성되었습니다.

> **시작 명령**
>
> > 다음은 freshpick-app v1.0의 AI장보기 RAG 본격 도입 Task 명세입니다. v0.7d에서 만든 자산(3탭 구조 [AI채팅·내메모·AI추천], addToMemo tool, 5테마 AI추천, customer_preference, persona-context, FreshPick 명칭)을 **확장**하되 **삭제하지 않습니다**. Supabase pgvector + Vercel AI SDK ToolLoopAgent (5 tools) + 시맨틱 캐시 + 자기보강 루프 + 5테마 RAG 보강을 6개 Phase로 도입합니다. AI 어시스턴트 이름은 일관되게 **"FreshPick"**입니다 — 별명·캐릭터명 사용 금지. 각 Phase는 독립 PR로 분리하고 Phase 완료마다 골든 셋 평가를 통과시킨 후 다음 Phase로 넘어가세요. 비상업 라이선스 데이터의 운영 임베드는 절대 금지입니다.

---

## 1. v1.0 범위 정의

### 1.1 v1.0에서 **할 것** (7가지, v1 대비 +1)

| 항목 | 산출물 |
|------|--------|
| **A. pgvector 인프라 + RAG 데이터 모델** | `tenant_item_ai_detail` (chunk + embedding) + `ai_query_cache` + `customer_preference.embedding` 컬럼 |
| **B. 임베딩 백필 + 자동화** | 2,875 SKU × 평균 3 chunk = 약 8,500개 행 적재. 마스터 변경 시 Edge Function이 자동 재임베딩 |
| **C. ToolLoopAgent 기반 페르소나 응답 (5 tools)** | `addToMemo` (v0.7d 유지) + `searchItems` + `getUserContext` + `getInventory` + `addToCart` (신규 4개) |
| **D. AI추천 5테마 RAG 보강** | 테마 1 메뉴세트(LLM)에 RAG chunk 주입, 테마 2/4 사유에 chunk 인용, 테마 3/5 정렬에 임베딩 가중치 |
| **E. 시맨틱 캐시 + 자기보강 루프** | `ai_query_cache` HIT/MISS, LLM 결과 → `tenant_item_ai_detail` UPSERT (REVIEW_NEEDED) |
| **F. manager-app 운영 도구** | REVIEW_NEEDED 큐 / 골든 셋 평가 대시보드 / 토큰 비용 대시보드 |
| **G. 페르소나 시그니처 자동 추론** | 행동 데이터 기반 customer_preference 자동 보정 |

### 1.2 v1.0에서 **하지 않을 것** (v1.x 이후)

- ❌ 음성 입력·TTS (첨부 스크린샷 6의 마이크 / Say 버튼) — v1.x
- ❌ 멀티 매장 비교 추천 ("다른 가게에서 더 싸요") — v1.x
- ❌ 실시간 레시피 영상 / 외부 콘텐츠 임베드 — v1.x
- ❌ Anthropic Web Search Tool (외부 레시피 보강) — v1.x (운영 모니터링 후 도입)
- ❌ 영양 분석 / 칼로리 추적 — v1.x

---

## 2. 사전 조건 (v1.0 시작 전 확인)

### 2.1 v0.7d에서 완료되어야 할 것

- [ ] **AI장보기 3탭 구조** [AI채팅·내메모·AI추천] 동작
- [ ] **AI추천 5테마** (메뉴세트·지금이적기·놓치면아까워요·다시만나볼까요·새로들어왔어요)
- [ ] **`customer_preference` 테이블** + RLS + 입력 UI + Server Action
- [ ] **`lib/ai/persona-context.ts`** `buildPersonaContext()` 함수
- [ ] **`lib/ai/prompts.ts`** system prompt 빌더 3종 (chat / mealSet / reason)
- [ ] **`lib/ai/tools/add-to-memo.ts`** addToMemo tool + 인라인 확인 카드
- [ ] **`/ai-shopping?tab=chat`** 화면 (streamText + addToMemo tool)
- [ ] **F014/F015 사유 보강** (sessionStorage 24h 캐시)
- [ ] **FreshPick 명칭** 일관성 (system prompt + UI 카피)
- [ ] **`ANTHROPIC_API_KEY`** Vercel 환경 변수 설정
- [ ] 운영 데이터: `tenant_item_master` 2,875 SKU + `tenant_item_detail.short_desc` 적재율 ≥ 80%

### 2.2 v1.0에 새로 추가되는 의존성

```bash
npm install openai          # text-embedding-3-small
# Vercel AI SDK는 v0.7d에서 이미 설치됨
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
| **v0.7d AI채팅 사용 데이터** | 채팅 세션 ≥ 200건, addToMemo tool 호출 ≥ 30건 | 시맨틱 캐시 ROI 측정 곤란 → Phase 5 캐시 임계값 보수적 설정 |

---

## 3. 산출물

```
freshpick-app/
├── app/
│   ├── (mobile)/
│   │   └── ai-shopping/
│   │       └── _components/
│   │           ├── chat/
│   │           │   ├── AiChatClient.tsx              # 수정 — useChat은 그대로, 추가 tool UI
│   │           │   ├── AddToMemoConfirmCard.tsx     # 유지 — v0.7d 그대로
│   │           │   ├── ToolCallIndicator.tsx        # 신규 — searchItems/getInventory 진행 표시
│   │           │   └── ActionableProductCard.tsx   # 신규 — addToCart CTA 내장
│   │           └── recommend/
│   │               ├── theme1-meal-set/
│   │               │   └── MealSetSection.tsx       # 수정 — RAG chunk 주입
│   │               ├── theme2-due-now/
│   │               │   └── DueNowSection.tsx        # 수정 — RAG 사유 보강
│   │               ├── theme3-dont-miss/
│   │               │   └── DontMissSection.tsx      # 수정 — 임베딩 정렬 가중치
│   │               ├── theme4-rediscover/
│   │               │   └── RediscoverSection.tsx    # 수정 — RAG 사유 보강
│   │               └── theme5-new-arrivals/
│   │                   └── NewArrivalsSection.tsx   # 수정 — 임베딩 정렬 가중치
│   └── api/
│       └── ai/
│           └── shopping/
│               ├── chat/route.ts                    # 수정 — streamText + 1 tool → ToolLoopAgent + 5 tools
│               ├── meal-set/route.ts               # 수정 — RAG chunk를 system prompt에 주입
│               └── reasons/route.ts                # 수정 — RAG 기반 사유 + chunk 인용
│
├── lib/
│   ├── ai/
│   │   ├── persona-context.ts                       # 수정 — getUserContext tool로 래핑
│   │   ├── prompts.ts                              # 수정 — Agent 시스템 프롬프트로 확장
│   │   ├── embeddings.ts                           # 신규 — OpenAI text-embedding-3-small
│   │   ├── tools/
│   │   │   ├── add-to-memo.ts                     # 유지 — v0.7d 그대로
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
│       ├── recommendations.ts                      # 수정 — 테마 5 임베딩 가중치
│       ├── purchasePattern.ts                      # 수정 — 테마 2 DB 함수 활성화
│       ├── promotion.ts                            # 수정 — 테마 3 임베딩 가중치
│       └── rediscover.ts                           # 수정 — 테마 4 RAG 사유
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
│   │   ├── embed-tenant-item/                     # Edge Function
│   │   │   └── index.ts
│   │   ├── embed-preference/                      # Edge Function
│   │   │   └── index.ts
│   │   └── cache-cleanup/                         # Edge Function (cron)
│   │       └── index.ts
│   └── seed/
│       └── ai_detail_seed.ts                       # 백필 스크립트
│
├── scripts/
│   └── ai/
│       ├── 01_backfill_embeddings.ts               # 신규 — 2,875 SKU 백필
│       ├── 02_backfill_preferences.ts             # 신규
│       ├── 03_eval_golden_set.ts                  # 신규 — 평가 fixture
│       └── README.md
│
├── (manager-app/)                                   # ⚠️ 별도 리포지토리, 본 sprint와 함께 진행
│   └── app/(admin)/ai-detail-review/                # 신규 — REVIEW_NEEDED 큐 (60008)
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
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **`tenant_item_ai_detail` 테이블** (RAG 보고서의 설계 그대로)
   ```sql
   CREATE TABLE tenant_item_ai_detail (
     ai_detail_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     tenant_item_id    UUID NOT NULL REFERENCES tenant_item_master(tenant_item_id) ON DELETE CASCADE,
     chunk_type        TEXT NOT NULL CHECK (chunk_type IN (
                         'short_desc','long_desc','recipe','nutrition','pairing',
                         'storage','persona_tag','cooking_tip','origin_story','allergy_info',
                         'meal_set_keyword'  -- v1.0 추가: 테마 1 매핑용
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
   ```

3. **`ai_query_cache` 테이블** (시맨틱 캐시)
4. **`customer_preference.embedding` 컬럼 추가**
5. **RPC 함수 2종**: `match_ai_chunks`, `match_query_cache`
6. **Edge Function 골격**: `embed-tenant-item`, `embed-preference`, `cache-cleanup`
7. **`lib/ai/embeddings.ts`**: `generateEmbedding(text)` → 1536차원 배열

**DoD**:
- [ ] 모든 마이그레이션 적용
- [ ] `match_ai_chunks` RPC 호출 가능 (빈 결과 OK)
- [ ] Edge Function 3종 deployed
- [ ] `generateEmbedding("토마토")` 동작
- [ ] `npm run check-all` + `npm run build` 통과

---

### Phase 2 — 임베딩 백필 + 자동화 (2주)

**목표**: 2,875 SKU에 평균 3개 chunk = 약 8,500 embedding 적재. 마스터 변경 시 자동 재임베딩 트리거.

**작업**:

1. **백필 스크립트** — `scripts/ai/01_backfill_embeddings.ts`
   - **청킹 전략**:
     - `chunk_type='short_desc'`: `tenant_item_detail.short_desc` 그대로
     - `chunk_type='long_desc'`: 500~1500자 청크 (overlap 100자)
     - `chunk_type='persona_tag'`: 카테고리 + 표준분류명 → 자동 페르소나 태그 (예: 육류 → `['family_dinner', 'protein_rich']`)
     - **v1.0 신규** `chunk_type='meal_set_keyword'`: 메뉴 세트 매핑용 키워드 청크 (예: "김치찌개에 들어가는 김치", "갈비찜에 들어가는 무")
   - 100개 배치, 1초 sleep (OpenAI rate limit)
   - 재실행 idempotent UPSERT
   - 실패 시 `_raw/failed.jsonl` 기록

2. **Edge Function `embed-tenant-item` 활성화**
   - PostgreSQL Webhook 트리거 등록 (Supabase Dashboard)
   - `tenant_item_master` UPDATE/INSERT 시 호출 → 60초 이내 재임베딩

3. **백필 검증**
   - 행 수 ≥ 7,000
   - embedding 누락 0건
   - 샘플 5건 LLM 평가

4. **`customer_preference.embedding` 백필** — `scripts/ai/02_backfill_preferences.ts`
   - 텍스트화: `"가구 ${household_size}명, 식이 ${diet_tags}, 맛 ${taste_tags}, 알러지 ${allergy_tags}, 조리 ${cooking_skill}"`

5. **검색 정합성 측정**
   - 골든 셋 50건 (`scripts/ai/03_eval_golden_set.ts`)
   - top-1 정확도 ≥ 60%, top-5 정확도 ≥ 85%

**DoD**:
- [ ] `tenant_item_ai_detail` 행 수 ≥ 7,000
- [ ] embedding 누락 0건
- [ ] PostgreSQL Webhook 자동 재임베딩 검증
- [ ] customer_preference 백필 100%
- [ ] 골든 셋 top-5 정확도 ≥ 85%

---

### Phase 3 — RAG 검색 + AI추천 5테마 본격 통합 (2주)

**목표**: v0.7d의 5테마를 그대로 두되, 각 테마의 데이터 소스에 RAG를 본격 통합한다. **5테마 컴포넌트 자체는 변경되지 않음** (호환성).

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
       // 폴백: pg_trgm `search_items_by_similarity` (기존 R708)
       return fallbackTrgmSearch(params.query, params.storeId);
     }
     return data;
   }
   ```

2. **테마 1 (메뉴세트) RAG 보강** — `app/api/ai/shopping/meal-set/route.ts`
   - 기존: customer_preference + 카테고리 TOP3로 LLM에 system prompt만 주입
   - v1.0: 시간대·페르소나로 `match_ai_chunks(chunk_type='meal_set_keyword')` 검색 → 후보 메뉴 키워드 5~10개를 system prompt에 추가 주입
   - LLM이 "오늘 16시·자녀 1명·자녀친화 → '돼지고기 김치찌개', '갈비찜', '닭볶음탕'" 후보 중에서 1~2개 선택
   - 선택된 메뉴의 categoryKeyword를 다시 `match_ai_chunks(chunk_type='short_desc')`로 검색 → 실제 store_item_id 매핑 정확도 ↑

3. **테마 2 (지금이 적기) DB 함수 활성화** — `compute_purchase_pattern_fn.sql`
   - 6개월 DELIVERED 주문 → 평균 간격 → DB 함수
   - 런타임 on-the-fly → DB 함수 (P95 200ms → 50ms)
   - **호환성**: 두 경로 모두 지원, env 토글
   - **사유 텍스트 RAG 보강**: "우유 13일째에요 — 신선 보관 1주 권장" 같은 구체 사유 (chunk content 인용)

4. **테마 3 (놓치면 아까워요) 임베딩 정렬 가중치**
   - 기존: 할인율·임박도 정렬
   - v1.0 추가: customer_preference.embedding과의 cosine 유사도 가중치 30% 추가
   - 최종 score = 할인율(40%) + 임박도(30%) + 페르소나 매칭(30%)

5. **테마 4 (다시 만나볼까요) RAG 사유 보강**
   - 기존: "지난 봄 자주 사셨던 미나리"
   - v1.0: chunk(`origin_story`, `cooking_tip`)에서 계절성·활용법 인용 → "봄철에 가장 향이 좋아요. 무침으로 자주 드셨네요"

6. **테마 5 (새로 들어왔어요) 임베딩 정렬 가중치**
   - 기존: customer_preference.diet/taste 카테고리 매칭
   - v1.0: 신상품의 chunk와 customer_preference.embedding 유사도 정렬

7. **검색 화면(R708) RAG 옵션** — `lib/api/products.ts` `searchByCategory()` 보강
   - env 토글: `RAG_SEARCH_ENABLED=true`면 키워드 임베딩 → tenant_item_id 추출 → pg_trgm 결과와 합쳐 정렬

8. **테스트**
   - 5테마 골든 셋 50건 — 기존 결과 100% 유지 + 신규 매칭 추가
   - 사유 텍스트에 chunk content 인용 확인
   - 응답 P95 < 1.5초 (테마 1 LLM 포함)

**DoD**:
- [ ] 5테마 모두 RAG 보강 적용, UX 그대로
- [ ] 테마 1 메뉴세트 매핑 정확도 ≥ 90%
- [ ] 테마 2 DB 함수 P95 < 100ms
- [ ] 사유 텍스트에 chunk 인용
- [ ] 골든 셋 회귀 0건

---

### Phase 4 — ToolLoopAgent 채팅 (5 tools) (2주)

**목표**: v0.7d의 streamText + addToMemo (1 tool)를 **ToolLoopAgent + 5 tools**로 격상한다. **`addToMemo`는 그대로 유지** + 신규 4개 tool 추가.

**작업**:

1. **신규 4개 Tool 구현** — `lib/ai/tools/`

   `search-items.ts`
   ```typescript
   export const searchItemsTool = tool({
     description: "벡터 유사도로 상품·레시피·페어링 정보 검색. 사용자가 식재료·요리·메뉴를 물으면 사용",
     parameters: z.object({
       query: z.string().describe("검색어 (한국어)"),
       personaTags: z.array(z.string()).optional(),
       chunkType: z.enum(["short_desc","long_desc","recipe","pairing","meal_set_keyword"]).optional(),
     }),
     // execute는 Route Handler에서 storeId 컨텍스트와 바인딩
   });
   ```

   `get-user-context.ts`
   ```typescript
   export const getUserContextTool = tool({
     description: "사용자 위치·가구·최근 주문·취향 조회",
     parameters: z.object({}),
     // execute는 verifiedCustomerId 바인딩
   });
   ```

   `get-inventory.ts`
   ```typescript
   export const getInventoryTool = tool({
     description: "특정 상품의 현재 재고 확인",
     parameters: z.object({
       storeItemIds: z.array(z.string()).max(20),
     }),
   });
   ```

   `add-to-cart.ts`
   ```typescript
   export const addToCartTool = tool({
     description: "사용자가 명시적으로 동의한 상품을 장바구니에 추가. addToMemo와 달리 결제로 직결되므로 더욱 신중히",
     parameters: z.object({
       items: z.array(z.object({
         storeItemId: z.string(),
         qty: z.number().min(1).max(99),
       })).max(20),
       userConsent: z.literal(true).describe("반드시 사용자가 명시적으로 동의했는지 확인"),
     }),
     // 인라인 확인 카드 UX는 v0.7d addToMemo 패턴 그대로 재사용
   });
   ```

2. **API Route 교체** — `app/api/ai/shopping/chat/route.ts`
   ```typescript
   import { ToolLoopAgent } from "ai";
   import { anthropic } from "@ai-sdk/anthropic";
   import {
     addToMemoTool,        // v0.7d 그대로
     searchItemsTool,      // 신규
     getUserContextTool,   // 신규
     getInventoryTool,     // 신규
     addToCartTool,        // 신규
   } from "@/lib/ai/tools";

   export async function POST(req: Request) {
     const { messages, customerIdFromClient, storeId } = await req.json();
     const verifiedCustomerId = await verifyCustomerByEmail();
     const ctx = { customerId: verifiedCustomerId, storeId };

     // 1) 시맨틱 캐시 (Phase 5에서 활성화)
     // const cached = await checkSemanticCache(messages, ctx);
     // if (cached) return cached.toResponse();

     const agent = new ToolLoopAgent({
       model: anthropic("claude-sonnet-4-6"),
       system: buildAgentSystemPrompt(await buildPersonaContext(verifiedCustomerId, storeId)),
       tools: {
         addToMemo: bindContext(addToMemoTool, ctx),
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
   당신은 freshpick의 AI 장보기 도우미 "FreshPick"입니다.
   
   ${기존 페르소나 컨텍스트}
   
   사용 가능한 도구 (5개):
   - searchItems: 상품·레시피 검색
   - getUserContext: 사용자 정보 조회
   - getInventory: 재고 확인
   - addToMemo: 메모 추가 (v0.7d부터)
   - addToCart: 장바구니 추가 (v1.0 신규)
   
   응답 가이드:
   1. 사용자가 "추천해 줘", "뭐 먹지?" 같은 질문을 하면 먼저 searchItems로 후보를 찾으세요.
   2. 추천 전에 getInventory로 재고를 확인하세요. 재고 0인 상품은 추천하지 마세요.
   3. addToMemo는 사용자가 "메모해줘", "쇼핑리스트", "적어줘" 같이 명시적으로 요청할 때.
   4. addToCart는 사용자가 "담아줘", "주문해줘", "장바구니에" 같이 명시적으로 요청할 때.
      특히 addToCart는 결제로 이어지므로 더욱 신중히 — 항목·수량을 한 번 더 확인받으세요.
   5. 추천 사유는 항상 한두 문장으로 설명하세요.
   6. 알러지 정보가 있는 사용자에게 알러지 식재료를 절대 추천하지 마세요.
   7. 당신의 이름은 항상 "FreshPick"입니다. 다른 이름·별명을 사용하지 마세요.
   ```

4. **Tool 호출 진행 표시** — `_components/chat/ToolCallIndicator.tsx`
   - useChat의 `data` 스트림에서 tool_call 이벤트 감지
   - "🔍 상품 검색 중...", "📦 재고 확인 중..." 친근한 문구
   - tool_result 도착 시 페이드 아웃

5. **장바구니 액션 UX — v0.7d addToMemo 패턴 재사용**
   - `_components/chat/AddToCartConfirmCard.tsx` (신규)
   - 인라인 확인 카드 (다이얼로그 X)
   - 항목별 체크박스 (기본 전체 체크), 수량 inline edit
   - [확인] 클릭 → `addToolResult()` → cart INSERT → "[장바구니 보기]" 링크
   - addToMemoConfirmCard와 시각적 일관성 유지

6. **테스트 — 페르소나 골든 셋 90건**
   - 페르소나 A (40대 주부, 가족 저녁): 30건
   - 페르소나 B (30대 1인 다이어트): 30건
   - 페르소나 C (식재료 활용법 문의): 30건
   - LLM Judge로 자동 평가:
     - 알러지 가드 100% (필수)
     - 추천 상품 재고 보유율 ≥ 95%
     - 사용자 동의 없는 cart/memo 호출 0건 (필수)
     - "FreshPick" 명칭 일관성 ≥ 95%
     - 페르소나 일관성 LLM Judge 점수 ≥ 4.0/5.0
   - 사람 검토 30건 샘플링 → 응답 품질 ≥ 4.0/5.0

**DoD**:
- [ ] 5개 tool 동작, ToolLoopAgent 5단계 이내 응답
- [ ] addToMemo (v0.7d) 100% 회귀 통과 — 동작 변경 0건
- [ ] addToCart 인라인 확인 카드 UX (addToMemo와 일관)
- [ ] 알러지 가드 90건 100% 통과
- [ ] 사용자 동의 없는 cart/memo 호출 0건
- [ ] 응답 P95 < 5초 (스트리밍 첫 토큰 < 1.5초)
- [ ] FreshPick 명칭 일관성 ≥ 95%

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

     // ⚠️ tool 호출이 필요한 메시지는 캐싱 금지
     // 사용자가 "어제 담은 것 다시" 같은 동적 컨텍스트 요청 시 캐시 적중 X
     if (looksLikeToolRequiredMessage(lastUserMsg)) return null;

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
       await supabase.from("ai_query_cache")
         .update({ hit_count: data[0].hit_count + 1 })
         .eq("cache_id", data[0].cache_id);
       return data[0].response_payload;
     }
     return null;
   }
   ```

   **중요**: addToMemo·addToCart 호출이 발생할 가능성이 있는 메시지("메모해줘", "담아줘" 키워드)는 캐싱하지 않음 — 매번 새 메모/카트 생성을 위해 LLM 호출 필수.

2. **페르소나 시그니처** — `lib/ai/persona-signature.ts`
   - 입력: customerId
   - 출력: `"gender:F|age_range:40s|family:3|hour:16-18|diet:diet_tag_a"` 형식
   - 시그니처 일치하지 않으면 캐시 적중 안 됨

3. **`lib/ai/self-improve.ts`** — Agent onFinish 훅
   - Agent 응답에서 새로 알게 된 정보 추출 (예: 새 페어링, 레시피)
   - LLM Judge로 사실성 평가 (≥ 4/5만 통과)
   - `tenant_item_ai_detail` UPSERT:
     - source = `'llm_generated'`
     - confidence = 0.6
     - status = `'REVIEW_NEEDED'`
   - **자동 ACTIVE 승격 절대 금지**

4. **manager-app: REVIEW_NEEDED 큐 화면** (60008 신규)
   - 메뉴: 시스템관리 → AI상품상세검토
   - Panel1: REVIEW_NEEDED 페어 목록
   - Panel2: 검토 액션 (ACTIVE 승격 / REJECTED / 수정 후 승격 / confidence 조정)
   - 일괄 승인·거부

5. **TTL 정리 cron** — `cache-cleanup` Edge Function 매일 새벽 3시 (Supabase pg_cron)

6. **모니터링**
   - 시맨틱 캐시 적중률 (목표 ≥ 30% 한 달 후)
   - LLM 비용 (월 $X 한도)
   - REVIEW_NEEDED 누적 건수

**DoD**:
- [ ] 시맨틱 캐시 동작 — 임베딩 0.95 + 페르소나 시그니처 일치
- [ ] tool 호출 메시지(메모/카트) 캐시 우회 검증
- [ ] manager-app REVIEW_NEEDED 큐에 LLM 생성 chunk 적재
- [ ] 운영자 1건 ACTIVE 승격 후 다음 검색 반영
- [ ] cache-cleanup cron 동작

---

### Phase 6 — 페르소나 자동 추론 + 종합 평가 (1주)

**목표**: customer_preference 미입력 사용자도 행동 데이터로 자동 페르소나 추론. v1.0 출시 게이트 통과.

**작업**:

1. **페르소나 자동 추론** — `lib/actions/ai/persona-inference.ts`
   - 입력: customerId, 최근 90일 행동 (order_detail, item_view_log, search 키워드, **v0.7d addToMemo 호출 패턴**)
   - 출력: `Partial<CustomerPreference>` (추정 가구 인원, 식이 선호 등)
   - 명시 입력값 우선, 추론값은 보조 (별도 컬럼 `inferred=true`)

2. **자동 추론 트리거**
   - 주문 완료 시 (Plan B 결제 콜백) preference 비어있는 사용자에게 자동 추론 1회
   - 30일마다 재추론 (사용자 업데이트 안 했을 때만)

3. **종합 평가 — 골든 셋 200건**
   - 페르소나 A/B/C 각 50건 + 자동 추론 50건
   - 평가 지표:
     - 알러지 가드: **100%** (필수)
     - 사용자 동의 없는 cart/memo: **0건** (필수)
     - 추천 재고 보유율 ≥ 95%
     - 응답 품질 LLM Judge ≥ 4.2/5.0
     - 응답 P95 < 5초
     - 시맨틱 캐시 적중률 ≥ 30% (1주 운영 후)
     - **5테마 RAG 보강 회귀 0건**
     - **FreshPick 명칭 일관성 100%**

4. **A/B 테스트 (옵션)**
   - 50% 사용자: v1.0 RAG Agent (5 tools)
   - 50% 사용자: v0.7d streamText (1 tool)
   - 측정: 채팅 진입 후 장바구니 전환율, 추천 클릭률, 메모 추가율
   - 2주 운영 후 평가

5. **롤백 절차 문서화** — `docs/ai-rollback.md`
   - LLM 비용 폭주: env `AI_SHOPPING_REASONS_ENABLED=false`로 차단
   - Agent 오작동: env `AI_SHOPPING_AGENT_MODE=streamtext`로 v0.7d 모드 전환 (addToMemo만 유지)
   - 임베딩 부정확: env `RAG_VECTOR_THRESHOLD` 0.75 → 0.85로 강화
   - 시맨틱 캐시 오답: `update ai_query_cache set status='REJECTED'`

**DoD**:
- [ ] 페르소나 자동 추론 동작 (preference 미입력 사용자 ≥ 70% 추정)
- [ ] 골든 셋 200건 통과 기준 모두 충족
- [ ] 롤백 절차 dry-run 통과
- [ ] 운영 모니터링 대시보드
- [ ] PRD-freshpick-app-v1.0.md + ROADMAP-freshpick-app-v1.0.md 작성

---

## 5. v0.7d → v1.0 호환성 (반드시 지킬 약속)

| v0.7d 자산 | v1.0 변경 방식 | 호환성 |
|------------|----------------|--------|
| **AI장보기 3탭 구조** [AI채팅·내메모·AI추천] | 변경 없음 | ✅ |
| **AI추천 5테마 컴포넌트** | 데이터 소스만 RAG 보강, UX 그대로 | ✅ |
| `customer_preference` 테이블 | `ALTER TABLE ADD COLUMN embedding vector(1536)` | ✅ 데이터 100% 보존 |
| 마이프레시 취향 입력 UI | 변경 없음 | ✅ 재입력 불필요 |
| `lib/ai/persona-context.ts` | 시그니처 유지, 내부 RPC 추가 | ✅ |
| `lib/ai/prompts.ts` | 함수 추가 (Agent 전용), 기존 함수 유지 | ✅ |
| **`addToMemo` tool** | **그대로 유지**, 동작 변경 0건 | ✅ |
| **`AddToMemoConfirmCard`** | **그대로 유지** | ✅ |
| `/ai-shopping?tab=chat` | API Route 내부 교체, useChat 그대로 | ✅ UI 코드 변경 최소 |
| 테마 1 메뉴세트 | RAG chunk 주입으로 매핑 정확도 ↑ | ✅ 동작 동일·품질 ↑ |
| F014/F015 사유 보강 | RAG 인용으로 구체성 ↑ | ✅ |
| sessionStorage 24시간 캐시 | 시맨틱 캐시(7일 TTL)와 병존 | ✅ |
| 알러지 가드 system prompt | 강화 통합 | ✅ 강화 |
| FreshPick 명칭 | 변경 없음 | ✅ |
| `maxOutputTokens` / `maxSteps` 가드 | Agent 전체에 적용 (1500 / 5) | ✅ |

---

## 6. 명시적 거부 / 비목표 (v1.0 한정)

- ❌ **음성 입력 / TTS** (첨부 스크린샷 6 마이크·Say): v1.x
- ❌ **외부 웹 검색 tool** (Anthropic Web Search 등): v1.x
- ❌ **자동 ACTIVE 승격**: 자기보강 루프는 항상 REVIEW_NEEDED 거쳐야 함
- ❌ **다른 매장 비교 추천**: v1.x
- ❌ **영양 분석·칼로리 추적**: v1.x
- ❌ **프로모션 자동 매칭** (LLM이 임의로 할인 약속): 절대 금지
- ❌ **사용자 동의 없는 자동 결제 / cart 추가**: 절대 금지
- ❌ **AI 어시스턴트 명칭 변경**: "FreshPick" 고정, 별명·캐릭터명 추가 금지

---

## 7. 위험 요소 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| 임베딩 데이터 부족 → RAG 정확도 저하 | UX 저하 | Phase 2 백필 후 골든 셋 ≥ 85% 검증, 미달 시 카테고리 TOP3 폴백 비중 ↑ |
| LLM 비용 폭주 | 운영비 부담 | Phase 5 시맨틱 캐시 ≥ 30% 목표, AI Gateway 모니터링, 일일 한도 + 알림 |
| Agent 무한 루프 | 응답 지연·비용 | `maxSteps=5` 강제, P95 모니터링 |
| Tool 권한 우회 (cart/memo 무단 호출) | 사용자 신뢰 훼손 | `userConsent: literal(true)` 강제, Phase 4 골든 셋 0건 검증 |
| addToMemo (v0.7d) 회귀 | 기존 사용자 메모 작업 깨짐 | Phase 4 회귀 테스트 100% 통과 게이트 |
| 자기보강 루프 오염 | RAG 품질 저하 | 자동 ACTIVE 절대 금지, REVIEW_NEEDED 거치게, LLM Judge 사실성 평가 통과 후 큐 진입 |
| 시맨틱 캐시 오답 | 동일 오답 반복 | 사용자 thumbs down 시 즉시 REJECTED 자동, 운영자 일괄 정리 |
| tool 호출 메시지가 캐싱되어 메모/카트 누락 | 기능 깨짐 | Phase 5 `looksLikeToolRequiredMessage` 가드로 캐시 우회 |
| pgvector HNSW 빌드 시간 | 백필 부하 | Phase 2 야간 배치 분할, `m=16, ef_construction=64` 기본값 |
| customer_preference 미입력 사용자 다수 | 페르소나 일반화 | Phase 6 자동 추론 보정, 채팅 진입 시 권유 toast |
| FreshPick 명칭 일관성 깨짐 | 브랜드 혼란 | 골든 셋 평가 항목 + Phase 4 LLM Judge ≥ 95% |
| RLS 우회 | 데이터 누설 | 모든 RPC `createAdminClient()` + 클라이언트 customerId 서버 재조회 강제 |

---

## 8. 수락 기준 요약 (v1.0 출시 게이트)

- [ ] Phase 1~6 모든 DoD 통과
- [ ] 골든 셋 200건:
  - 알러지 가드 100%
  - 사용자 동의 없는 cart/memo 호출 0건
  - 추천 재고 보유율 ≥ 95%
  - 응답 품질 LLM Judge ≥ 4.2/5.0
  - 응답 P95 < 5초
  - **FreshPick 명칭 일관성 100%**
- [ ] **AI장보기 3탭 구조** + **5테마 AI추천** 회귀 0건
- [ ] **`addToMemo` (v0.7d)** 동작 회귀 0건
- [ ] 시맨틱 캐시 적중률 ≥ 30% (출시 후 2주 운영)
- [ ] LLM 비용 일일 SLO 충족
- [ ] manager-app REVIEW_NEEDED 큐 처리율 ≥ 80% (1주 적체 < 50건)
- [ ] 롤백 절차 dry-run 통과
- [ ] PRD-freshpick-app-v1.0.md + ROADMAP-freshpick-app-v1.0.md 완성

---

## 9. 실행 직전 자기검증 10문항

에이전트는 작업 시작 전에 다음 10가지를 답변·확인한 뒤 진행하세요.

1. v0.7d의 3탭 구조 [AI채팅·내메모·AI추천], `addToMemo` tool, 5테마 AI추천이 운영 환경에 배포되어 있는가?
2. 운영 데이터 게이트 (마스터 2,500개·short_desc 80%·DELIVERED 100건·preference 30명·채팅 200건·addToMemo 30건)가 충족되었는가?
3. `OPENAI_API_KEY` + `ANTHROPIC_API_KEY` Vercel 환경 변수가 설정되어 있는가?
4. 비상업 라이선스 데이터셋이 운영 빌드에 포함되지 않도록 차단 assertion이 있는가?
5. 자기보강 루프가 자동으로 ACTIVE 승격하지 않는 구조인가?
6. cart/memo 호출 시 `userConsent: true` 파라미터를 강제하는 구조인가?
7. 모든 LLM 호출에 `maxSteps` / `maxOutputTokens` 가드가 적용되어 있는가?
8. 클라이언트가 보낸 customerId를 서버에서 재조회·검증하는 구조인가?
9. v0.7d의 `addToMemo` 동작·UX가 v1.0에서 변경되지 않는가? (회귀 테스트 보유)
10. 모든 system prompt에 "FreshPick" 명칭이 명시되어 있는가? (별명·캐릭터명 사용 금지)

10개 모두 "예"가 되어야 진행하세요. 하나라도 "아니오"면 그 단계에서 멈추고 사용자에게 보고하세요.

---

> **본 프롬프트의 끝.**
> 의문이 생기면 임의 결정 대신 PR description "질문" 섹션에 기록하고 사용자 확인을 요청하세요. 특히 알러지 가드 강도, 모델 선택, 캐시 TTL, 자기보강 루프 ACTIVE 기준은 반드시 운영자 결정이 필요합니다.
