# freshpick-app AI장보기 RAG 기술스택 분석 보고서

> **작성일**: 2026-05-04
> **대상**: freshpick-app (Next.js 16 / React 19 / Supabase)
> **목적**: 3가지 AI장보기 페르소나를 지원하는 RAG 기반 AI 서비스 기술스택 리서치 및 호환성 분석
> **참조 문서**: `PRD-freshpick-app-v0.7c.md`, `ROADMAP-freshpick-app-v0.7c.md`, `PRD-sellerbox-app-v0.7c.md`

---

## 1. Executive Summary (총평)

freshpick-app은 이미 **Next.js 16 + React 19 + Supabase + PostgreSQL** 위에 잘 정돈된 풀스택 구조를 가지고 있고, PRD v0.2에서 이미 **Supabase pgvector(v2.0)** 도입을 명시적으로 계획해 두었습니다. 따라서 AI장보기 RAG는 "별개 시스템 추가"가 아니라 **현재 스택에 그대로 얹히는 자연스러운 확장**으로 진행할 수 있습니다.

핵심 결론을 먼저 요약하면 다음과 같습니다.

- **벡터 DB**: 별도 솔루션(Pinecone, Weaviate 등) 도입 없이 **Supabase pgvector**로 충분합니다. 동일 PostgreSQL 안에서 `tenant_item_master` ↔ `tenant_item_ai_detail` (신규) ↔ 임베딩 컬럼을 한 트랜잭션에서 처리할 수 있고, `customer_id` / `store_id` 기반 RLS도 그대로 활용됩니다.
- **AI 오케스트레이션 SDK**: **Vercel AI SDK** 채택을 권장합니다. 현재 Vercel 배포 + Server Actions + Next.js 16 App Router 환경과 가장 맞물리고, `streamText` / `generateObject` / `tool` / `ToolLoopAgent`로 페르소나형 Agent를 구현하기 적합합니다. LangChain은 복잡 파이프라인이 필요할 때만 부분 도입을 검토합니다.
- **LLM**: **Anthropic Claude (Sonnet 4.6 / Haiku 4.5)** + **OpenAI text-embedding-3-small** 조합을 1차 권장합니다. 한국어 응답 품질, tool-calling 안정성, 비용 균형이 가장 좋습니다. AI Gateway(또는 자체 라우터)로 모델 교체가 용이하도록 설계합니다.
- **RAG 데이터 소스**: 사용자가 제안한 `tenant_item_ai_detail` 신규 테이블이 정확한 방향입니다. `tenant_item_id` FK로 `tenant_item_master` / `tenant_item_detail`과 연결하고, **레시피·영양·페어링·페르소나 태그·외부 스크래핑 텍스트**를 chunk 단위로 적재한 뒤 1536차원 벡터를 같은 행에 두는 구조가 적합합니다.
- **추가 인프라**: Supabase Edge Functions(주간 배치 임베딩 생성), Upstash Redis(세션 / 시맨틱 캐시), 토큰/비용/지연 모니터링용 OpenTelemetry. 모두 Vercel 친화적이며 기존 npm 의존성 패턴과 호환됩니다.

이 보고서는 이 결론에 도달한 근거를 (1) 현 기술스택 정리, (2) 페르소나 요구 분해, (3) RAG 아키텍처 설계, (4) 신규 기술스택 표, (5) 단계별 도입 로드맵 순으로 정리합니다.

---

## 2. 현재 freshpick-app 기술스택 정리

PRD v0.2 / v0.7c와 sellerbox-app PRD v0.7c (공유 DB 기준)에서 파악한 현행 스택입니다.

### 2.1 프론트엔드 / 런타임

| 분류 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | **Next.js 16** (App Router, Turbopack) | Node.js 20.9+ 필요, v16.2.4 보안 패치 적용 |
| 언어 | **TypeScript 5.x** strict | 도메인 타입 `types/` 디렉터리로 분리 |
| UI 라이브러리 | **React 19.2** | 동시성 기능 사용 |
| 스타일 | **Tailwind CSS** + **shadcn/ui (new-york)** + Lucide React + next-themes | Container Chunk 패턴 |
| 상태 | **Zustand** (`cartStore`, `wishlistStore`, `storeStore`) + persist | StoreHydrator로 SSR 시드 |
| 폼·검증 | **React Hook Form 7.x** + **Zod** | `@hookform/resolvers` 연결 |
| 애니메이션 | Framer Motion, @use-gesture/react, vaul, sonner | Fly to cart, 스와이프 |

### 2.2 백엔드 / 데이터

| 분류 | 기술 | 비고 |
|------|------|------|
| BaaS | **Supabase** (Auth · PostgreSQL · Storage · Realtime) | freshpick-app + sellerbox-app + manager-app 공유 |
| 서버 로직 | **Next.js Server Actions / Route Handlers** | `lib/actions/domain/*` 패턴 |
| Supabase 클라이언트 | `createClient()` / `createBrowserClient()` / `createAdminClient()` / `updateSession()` | RLS / Admin 분리 운영 |
| 결제 | 토스페이먼츠 SDK (`@tosspayments/tosspayments-sdk`) | requestBillingAuth 자동결제 |
| 배포 | **Vercel** | Edge / Serverless |
| 테스트 | Playwright E2E | `npm run check-all` 게이트 |
| 패키지 매니저 | **npm** | — |

### 2.3 핵심 데이터 모델 (Architecture C, 2026-04-23 마이그레이션 완료)

freshpick-app이 직접 CRUD 또는 READ하는 45개 테이블 중 AI장보기 RAG와 직접 관계되는 것은 다음입니다.

- `tenant_item_master` — 테넌트 공통 상품 마스터 (item_code, item_name, supplier, 가격, **8개 카테고리 컬럼: category_code/name + std_large/medium/small_code/name**, status)
- `store_item` — store별 가격·상태 오버라이드 (null = master 상속)
- `tenant_item_detail` — 상품 상세 이미지·짧은설명 (대표이미지·썸네일·광고이미지·라벨이미지)
- `v_store_item` — 위 셋을 COALESCE로 묶은 통합 VIEW (PK = `store_item_id`)
- `v_store_inventory_item` — 위에 `inventory` INNER JOIN, `(on_hand - reserved) > 0`만 노출 (Hotfix BB)
- `tenant_category_code` — 테넌트별 카테고리 코드 (Hotfix AW 이후 `common_code_value` 대체)
- `memo`, `memo_item` — 사용자 수기 메모 (qty_value/qty_unit 정규화, 자연어 4-step 파싱 적용)
- `order`, `order_detail` — 6개월 DELIVERED 주문 분석 베이스 (F015)
- `customer`, `customer_shop`, `address` — 고객 위치 / 배송지 (페르소나 컨텍스트 핵심)

### 2.4 기존 AI / 개인화 자산

PRD에서 이미 다음을 계획·구현 또는 폴백으로 운영 중입니다.

- **F014 AI 추천 장보기**: `getAiRecommendations(customerId, storeId)` — `order_detail` 기반 카테고리 TOP3 + `inventory JOIN on_hand>0` 폴백. ai_recommendation 테이블 미구현 상태로 카테고리 분석 폴백.
- **F015 지난 구매 자동 리스트**: `getPurchasePatterns(customerId)` — 6개월 DELIVERED 주문에서 avgIntervalDays 계산 (런타임 on-the-fly, `compute_purchase_pattern` DB 함수 미구현).
- **자연어 4-step 파이프라인**: `"계란2판새우깡3봉지 저녁찬거리"` → 정규화 (CORRECTION_DICT 30개 엔트리, "삽겹살→삼겹살" 등). RAG에 그대로 재활용 가능.
- **pg_trgm 검색 인프라 (R708/F031)**: Supabase에 `CREATE EXTENSION pg_trgm` + GIN 인덱스 + `search_items_by_similarity` RPC 활성화. 오타·유사도 정렬 검색 가능.
- **PRD에 명시된 미구현 항목**: `Supabase pgvector (v2.0) — 벡터 기반 유사 상품 추천` — **본 보고서가 이 항목을 본격 구현 단계로 끌어올리는 작업**입니다.

### 2.5 시사점

- pgvector 도입은 PRD에 이미 합의된 방향이라 **신규 의사결정이 아니라 우선순위 끌어올리기**에 해당합니다.
- 검색 인프라 측면에서 pg_trgm + GIN + RPC 폴백 패턴이 이미 자리잡혀 있어, 벡터 검색도 같은 RPC 폴백 철학으로 추가하면 됩니다 (벡터 실패 시 pg_trgm 폴백, 그것도 실패 시 ILIKE).
- Server Actions + RSC 구조라 **Vercel AI SDK의 streamText / Tool 패턴**과 거의 그대로 합쳐집니다.

---

## 3. AI장보기 페르소나 요구 분해

사용자가 제시한 3개 페르소나와 예시 답변을 보면, AI장보기에 요구되는 능력은 다음 5축으로 정리됩니다.

### 3.1 페르소나 요약

| # | 페르소나 | 핵심 컨텍스트 | 트리거 시점 |
|---|----------|---------------|-------------|
| A | 40대 전업주부, 구리시 인창동 거주, 10세 아들, 자영업 남편 | 가족 저녁식사 매일 직접 조리 | 매일 16:00경 저녁거리 쇼핑 |
| B | 30대 1인가구 직장인, 인창동 거주 | 깔끔한 맛 선호, 다이어트 중, 혼밥 | 토요일 17:00, "오늘 뭐 먹지? 중식이 땡기네" |
| C | (B 연장) 동일 사용자, 데친 고사리 응용법 문의 | 식재료 활용법·레시피·페어링 | "데친고사리가 먹고싶은데 뭐가 좋을까?" |

### 3.2 답변에 필요한 능력 5축

예시 답변 ("새우볶음밥+짬뽕국물 / 유산슬덮밥 / 청경채소고기볶음" 추천)을 분해하면 다음 능력이 필요합니다.

1. **사용자 컨텍스트 이해** — 위치(인창동), 가구 구성, 시간대, 최근 주문 이력, 선호(깔끔한 맛 / 다이어트), 알러지·건강 정보. 모두 `customer` + `customer_shop` + `order` + `address` + 신규 `customer_preference`에 분산.
2. **상품/메뉴 도메인 지식** — 식재료 영양·조리법·페어링·지역 특산. 이 부분이 `tenant_item_master`에 없는 정보이며, 신규 `tenant_item_ai_detail`이 채워야 할 영역입니다.
3. **유사 프롬프트 매칭 (Retrieval)** — "오늘 뭐 먹지? 중식이 땡기네" 같은 프롬프트는 **반복적**으로 들어옵니다. 같은 페르소나/시간대/계절에 대해 매번 LLM을 호출하는 대신 **임베딩 → 시맨틱 캐시 / RAG 인덱스**에서 유사 응답을 먼저 찾는 것이 핵심.
4. **부족분 LLM 보강** — 캐시 미스 / 신규 패턴이면 **Agent가 tool을 사용해 RAG·DB·웹을 조회**하고 답변을 생성한 뒤, 그 결과를 다시 `tenant_item_ai_detail` / 시맨틱 캐시에 적재 (self-improving loop).
5. **장바구니 액션 연결** — 답변 마지막에 "어떤 메뉴로 주문을 도와드릴까요?" 형태로 사용자가 메뉴를 고르면 자동으로 cart INSERT / 매장 픽업 / 배달 옵션 연결. 즉 답변은 **텍스트 + 구조화 액션 카드** 두 형태가 모두 필요합니다.

### 3.3 답변 형태에서 도출되는 기술 요건

- **Streaming UI**: 추천 메뉴 3개를 LLM이 토큰 단위로 흘려보내야 사용자 체감 지연이 줄어듭니다 → `streamText` + `useChat`
- **Structured Output**: 메뉴 카드(메뉴명·이유·주문 팁·픽업/배달 방식·예상가격·유사 상품 ID 배열)는 자유 텍스트가 아닌 **Zod 스키마 + `generateObject`**로 받아야 cart 액션과 연결 가능합니다.
- **Tool Calling**: Agent가 다음 도구를 호출할 수 있어야 합니다.
  - `search_items_vector(query, store_id, k)` — 벡터 유사도 + ILIKE 폴백
  - `get_user_context(customer_id)` — 위치·가구·최근주문·알러지
  - `get_purchase_history(customer_id, days)` — 최근 N일 주문
  - `get_inventory(store_id, item_ids)` — 재고 확인
  - `add_to_cart(store_id, items)` — Server Action 래핑
  - `web_search_recipe(query)` — 외부 레시피 보강 (옵션)
- **시맨틱 캐시**: 같은 페르소나가 같은 시간대에 비슷한 질문을 하면 LLM 호출을 피해야 비용·지연이 잡힙니다.

---

## 4. RAG 아키텍처 설계

### 4.1 전체 데이터 플로우

```
[사용자 입력 프롬프트]
       │
       ▼
[A. 임베딩 생성] ── OpenAI text-embedding-3-small (1536 dim)
       │
       ├──► [B. 시맨틱 캐시 조회] ── ai_query_cache (벡터 ≥ 0.95)
       │         │
       │   HIT ──┴──► 캐시된 응답 반환 (LLM 호출 0회)
       │
       ▼ MISS
[C. RAG 검색 — 다중 소스 병렬]
       ├──► tenant_item_ai_detail.embedding (벡터 ≥ 0.75) — 상품·레시피 도메인
       ├──► v_store_inventory_item — 현재 가게 재고 보유 상품 (정형 필터)
       ├──► customer + order_detail (최근 30일) — 사용자 컨텍스트
       └──► purchase_pattern (옵션) — 재구매 주기
       │
       ▼
[D. ToolLoopAgent (Claude Sonnet 4.6)]
   system: 페르소나 응답 가이드 + 컨텍스트 주입
   tools: search_items_vector / get_user_context / add_to_cart / web_search_recipe
       │
       ├── (필요시 도구 반복 호출, max_steps = 5)
       ▼
[E. generateObject — Zod RecommendationSchema]
       │
       ▼
[F. 응답 스트리밍 + 액션 카드 렌더링]
       │
       ▼
[G. 결과를 tenant_item_ai_detail / ai_query_cache에 적재]
   - 새로 추출한 레시피·페어링·태그 → tenant_item_ai_detail UPSERT
   - 프롬프트 임베딩 + 응답 → ai_query_cache INSERT
```

### 4.2 신규 DB 테이블 설계

기존 마이그레이션 패턴(`supabase/migrations/2026xxxx_*.sql`, IF NOT EXISTS 가드, GIN 인덱스, RLS)을 그대로 따릅니다.

#### (1) `tenant_item_ai_detail` — 사용자가 제안한 신규 테이블

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE tenant_item_ai_detail (
  ai_detail_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_item_id    UUID NOT NULL REFERENCES tenant_item_master(tenant_item_id) ON DELETE CASCADE,

  -- 분류: 같은 상품에 대해 여러 chunk 존재 가능
  chunk_type        TEXT NOT NULL,
  -- ENUM: 'short_desc', 'long_desc', 'recipe', 'nutrition', 'pairing',
  --       'storage', 'persona_tag', 'cooking_tip', 'origin_story', 'allergy_info'

  chunk_seq         INT NOT NULL DEFAULT 0,           -- 같은 type 내 순서
  content           TEXT NOT NULL,                     -- 원문 텍스트 (500~1500자 권장)
  content_summary   TEXT,                              -- 80자 이내 요약 (LLM 생성)
  metadata          JSONB DEFAULT '{}'::JSONB,         -- 자유 키-값 (source_url, persona_keys 등)

  -- 벡터 (text-embedding-3-small = 1536차원)
  embedding         vector(1536),

  -- 출처 / 신뢰도
  source            TEXT,                              -- 'manual', 'lottemartzetta', 'web_search', 'llm_generated'
  source_url        TEXT,
  confidence        NUMERIC(3,2) DEFAULT 0.80,         -- 0.00 ~ 1.00

  -- 페르소나 태그 (검색 가속)
  persona_tags      TEXT[] DEFAULT ARRAY[]::TEXT[],    -- ['family_dinner', 'solo_diet', 'kid_friendly']

  status            TEXT DEFAULT 'ACTIVE'              -- 'ACTIVE', 'STALE', 'REVIEW_NEEDED'
                    CHECK (status IN ('ACTIVE','STALE','REVIEW_NEEDED')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tenant_item_id, chunk_type, chunk_seq)
);

-- HNSW 인덱스 (cosine, indie 규모 < 1M rows에 권장)
CREATE INDEX idx_tenant_item_ai_detail_embedding
  ON tenant_item_ai_detail
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 보조 인덱스
CREATE INDEX idx_tenant_item_ai_detail_item        ON tenant_item_ai_detail(tenant_item_id);
CREATE INDEX idx_tenant_item_ai_detail_chunk_type  ON tenant_item_ai_detail(chunk_type);
CREATE INDEX idx_tenant_item_ai_detail_persona_tags ON tenant_item_ai_detail USING GIN (persona_tags);

-- pg_trgm 폴백용 (벡터 인덱스 실패 시)
CREATE INDEX idx_tenant_item_ai_detail_content_trgm
  ON tenant_item_ai_detail USING GIN (content gin_trgm_ops);

-- RLS (sellerbox 패턴 준수: tenant_id 조인 정책)
ALTER TABLE tenant_item_ai_detail ENABLE ROW LEVEL SECURITY;
-- 정책 본문은 sellerbox 기존 패턴(seller → store → tenant_id) 재사용
```

핵심 설계 포인트:

- **chunk 단위 저장**: 한 상품당 여러 행 (짧은설명·레시피·영양·페어링 …). 검색 성능과 정확도 모두 1행/상품보다 좋습니다.
- **`tenant_item_master.tenant_item_id` FK** — 사용자가 제안한 "item 키값으로 다양한 정보 저장" 요구를 직접 충족.
- **persona_tags 배열 + GIN 인덱스** — `'solo_diet'` / `'family_dinner'` 같은 페르소나별 후보를 1차 필터로 좁힌 뒤 벡터 검색 수행 시 응답 200ms 이하 유지에 유리.
- **HNSW 선택**: `lists` 튜닝이 필요한 ivfflat보다, 1M행 이하에서는 HNSW가 일관된 정확도 + 동적 INSERT 친화적입니다.
- **벡터 인덱스 실패 시 pg_trgm 폴백**: 기존 `search_items_by_similarity` 폴백 철학과 동일.

#### (2) `ai_query_cache` — 시맨틱 캐시 (반복 프롬프트 LLM 절약)

```sql
CREATE TABLE ai_query_cache (
  cache_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID,                              -- NULL이면 비개인화(공용) 캐시
  store_id          UUID,                              -- store별 격리
  query_text        TEXT NOT NULL,
  query_embedding   vector(1536) NOT NULL,
  response_payload  JSONB NOT NULL,                    -- generateObject 결과 그대로
  persona_signature TEXT,                              -- 'gender:F|age:40|family:3|hour:16' 식
  hit_count         INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  expires_at        TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX idx_ai_query_cache_embedding
  ON ai_query_cache USING hnsw (query_embedding vector_cosine_ops);

CREATE INDEX idx_ai_query_cache_persona ON ai_query_cache(persona_signature);
CREATE INDEX idx_ai_query_cache_expires ON ai_query_cache(expires_at);
```

페르소나 시그니처 + 임베딩 0.95 이상 매칭이 동시에 성립할 때만 캐시 적중 처리. 7일 TTL은 신선식품 가격·재고 변동 주기에 맞춘 보수적 값이며 운영 후 조정.

#### (3) `customer_preference` — 페르소나 보강 (신규, 옵션)

```sql
CREATE TABLE customer_preference (
  preference_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  household_size    INT,                                -- 가구 인원
  has_children      BOOLEAN DEFAULT FALSE,
  diet_tags         TEXT[] DEFAULT ARRAY[]::TEXT[],     -- ['low_sodium', 'diet', 'vegan']
  taste_tags        TEXT[] DEFAULT ARRAY[]::TEXT[],     -- ['clean', 'spicy', 'mild']
  allergy_tags      TEXT[] DEFAULT ARRAY[]::TEXT[],     -- ['peanut', 'shellfish']
  cooking_skill     TEXT,                                -- 'beginner', 'intermediate', 'advanced'
  preferred_hour    INT,                                 -- 평소 쇼핑 시간대 (16, 17 …)
  embedding         vector(1536),                       -- 위 필드들 텍스트화 후 임베딩
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (customer_id)
);

CREATE INDEX idx_customer_preference_embedding
  ON customer_preference USING hnsw (embedding vector_cosine_ops);
```

이 테이블이 페르소나 A/B를 시스템적으로 구분하게 해주는 핵심입니다. 회원가입 위저드에 1단계 추가하거나, 첫 주문 후 자동 추론으로 채울 수 있습니다.

### 4.3 RAG 검색 RPC 함수 (Supabase)

기존 `search_items_by_similarity` 패턴을 따라 RPC를 추가합니다.

```sql
CREATE OR REPLACE FUNCTION match_ai_chunks(
  query_embedding   vector(1536),
  match_threshold   float DEFAULT 0.75,
  match_count       int DEFAULT 8,
  filter_persona    text[] DEFAULT NULL,
  filter_chunk_type text DEFAULT NULL
)
RETURNS TABLE (
  ai_detail_id    uuid,
  tenant_item_id  uuid,
  chunk_type      text,
  content         text,
  similarity      float,
  metadata        jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.ai_detail_id,
    a.tenant_item_id,
    a.chunk_type,
    a.content,
    1 - (a.embedding <=> query_embedding) AS similarity,
    a.metadata
  FROM tenant_item_ai_detail a
  WHERE a.status = 'ACTIVE'
    AND (filter_chunk_type IS NULL OR a.chunk_type = filter_chunk_type)
    AND (filter_persona   IS NULL OR a.persona_tags && filter_persona)
    AND 1 - (a.embedding <=> query_embedding) >= match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

`<=>` 는 pgvector cosine distance 연산자입니다. RLS는 RPC 안에서 자동 적용됩니다.

---

## 5. 호환 가능한 신규 기술스택 (요약 표)

기존 스택과 충돌 없이 추가 가능한 항목만 골라, 역할별로 정리합니다.

| 분류 | 권장 기술 | 패키지 | 역할 | 호환성 메모 |
|------|----------|--------|------|-------------|
| **벡터 DB** | Supabase pgvector | (Supabase 확장) | 1536차원 임베딩 저장·검색 | PRD v0.2에 v2.0 도입 예정 명시. 별도 인프라 불필요 |
| **벡터 인덱스** | HNSW (cosine) | pgvector 내장 | 유사도 검색 200ms 이하 | < 1M rows에 권장. ivfflat보다 정확도 일관 |
| **임베딩 모델** | OpenAI `text-embedding-3-small` | `openai` | 1536차원, 다국어 (한국어 포함) | 비용 $0.02/1M tokens. text-embedding-3-large(3072차원)는 정확도↑·비용 5배 |
| **LLM (응답)** | Anthropic `claude-sonnet-4.6` | `@ai-sdk/anthropic` | 페르소나 응답·tool calling | 한국어 품질·tool 안정성 우수 |
| **LLM (경량)** | Anthropic `claude-haiku-4.5` | `@ai-sdk/anthropic` | 캐시 키 정규화·요약·분류 | 저비용·저지연 작업 위임 |
| **LLM (대안)** | OpenAI `gpt-5.2` 또는 `gpt-4o-mini` | `@ai-sdk/openai` | 폴백·A/B 테스트 | AI Gateway 통해 1줄 교체 |
| **AI 오케스트레이션** | **Vercel AI SDK** | `ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`, `@ai-sdk/openai` | streamText / generateObject / Tool / ToolLoopAgent | Vercel·Next.js·Server Actions 친화. 67.5kB gzipped |
| **에이전트 프레임워크** | AI SDK `ToolLoopAgent` | `ai` (내장) | 다단계 도구 호출 루프 | LangGraph 등 별도 도입 불필요 |
| **모델 라우팅** | Vercel AI Gateway (옵션) | (서비스) | 모델별 비용·지연 추적, A/B | Vercel 콘솔에서 한 줄 설정 |
| **프롬프트 검증** | Zod 4.x | `zod` (이미 보유) | `generateObject` 스키마 정의 | 기존 폼·DTO와 동일 패턴 |
| **시맨틱 캐시** | Supabase pgvector + `ai_query_cache` 테이블 | (자체 구현) | 반복 프롬프트 LLM 호출 절감 | 별도 캐시 솔루션 불필요 |
| **세션·메시지 큐** | Upstash Redis (옵션) | `@upstash/redis` | 멀티턴 대화 상태·rate limit | Vercel Edge 친화. Serverless 과금 |
| **비동기 임베딩 배치** | Supabase Edge Functions (Deno) | (Supabase) | tenant_item_master 변경 시 임베딩 재생성 | PRD v0.2에 이미 명시 |
| **외부 데이터 수집** | 기존 lottemartzetta 크롤러 (Task 081) 재사용 | (자체) | 상품 설명·이미지 수집 | 이미 운영 중인 3전략 시스템 활용 |
| **웹 검색 도구 (옵션)** | Anthropic Web Search Tool 또는 Tavily | `@anthropic-ai/sdk`, `tavily` | Agent가 모르는 신규 식재료·레시피 보강 | tool로 등록, 결과는 ai_query_cache에 적재 |
| **모니터링** | Vercel Analytics + AI SDK OpenTelemetry | `@vercel/analytics`, AI SDK 내장 | 토큰·지연·비용·에러 추적 | Vercel 통합 |
| **스트리밍 UI** | AI SDK `useChat`, `useObject` | `@ai-sdk/react` | 토큰 단위 응답·구조화 출력 스트림 | Tailwind + sonner와 자연스럽게 결합 |
| **자연어 전처리** | 기존 `CORRECTION_DICT` (30개) + Hangul-jamo (옵션) | (자체) | 오타 보정 / 토큰 정규화 | 메모 파싱 4-step 파이프라인 재사용 |
| **타입 안전 DB 호출** | 기존 `database.types.ts` + supabase-js v2 | (이미 보유) | RPC `match_ai_chunks` 자동 타입 | `supabase gen types` 재실행 |

### 5.1 채택하지 않는 기술 (의도적 배제)

| 기술 | 배제 이유 |
|------|-----------|
| Pinecone / Weaviate / Qdrant 별도 운영 | Supabase pgvector로 충분. RLS·트랜잭션·운영 단순성에서 우월 |
| LangChain.js (전면 도입) | API 변경 빈번, Vercel AI SDK와 기능 중복. 복잡 파이프라인이 필요할 때만 부분 도입 |
| LlamaIndex (전면 도입) | 위와 동일 사유. 다만 문서 청킹 유틸리티는 부분 차용 가능 |
| Hugging Face self-hosted 임베딩 | GPU·운영 부담. 응답 품질 대비 OpenAI text-embedding-3-small이 더 효율적 |
| 자체 LLM 호스팅 (vLLM 등) | MVP 단계 부적합. 상업 API 비용이 더 낮음 |

---

## 6. Server Actions 통합 패턴 (코드 스케치)

기존 `lib/actions/domain/*` 패턴에 그대로 얹는 형태입니다.

### 6.1 임베딩 생성 헬퍼

```typescript
// lib/ai/embeddings.ts
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

### 6.2 RAG 검색 (Server Action)

```typescript
// lib/actions/ai/rag-search.ts
"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateEmbedding } from "@/lib/ai/embeddings";

export async function searchAiChunks(params: {
  query: string;
  storeId: string;
  personaTags?: string[];
  k?: number;
}) {
  const supabase = createAdminClient();
  const queryEmbedding = await generateEmbedding(params.query);

  const { data, error } = await supabase.rpc("match_ai_chunks", {
    query_embedding: queryEmbedding,
    match_threshold: 0.75,
    match_count: params.k ?? 8,
    filter_persona: params.personaTags ?? null,
  });
  if (error) {
    // 폴백: pg_trgm `search_items_by_similarity` (기존 구현)
    return fallbackTrgmSearch(params.query, params.storeId);
  }
  return data;
}
```

### 6.3 페르소나 응답 Agent (Route Handler)

```typescript
// app/api/ai/shopping/route.ts
import { streamText, ToolLoopAgent } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { searchAiChunks } from "@/lib/actions/ai/rag-search";
import { getCustomerContext, addToCart } from "@/lib/actions/...";

export async function POST(req: Request) {
  const { messages, customerId, storeId } = await req.json();

  // 1) 시맨틱 캐시 조회 (선택)
  const cached = await checkSemanticCache(messages.at(-1).content, customerId, storeId);
  if (cached) return new Response(cached.stream);

  // 2) Agent 실행
  const agent = new ToolLoopAgent({
    model: anthropic("claude-sonnet-4.6"),
    system: buildPersonaSystemPrompt(customerId), // customer_preference 주입
    tools: {
      searchItems: {
        description: "벡터 유사도로 상품·레시피 정보를 검색",
        parameters: z.object({
          query: z.string(),
          personaTags: z.array(z.string()).optional(),
        }),
        execute: async ({ query, personaTags }) =>
          searchAiChunks({ query, storeId, personaTags }),
      },
      getUserContext: {
        description: "고객 위치·가구·최근 주문·선호 조회",
        parameters: z.object({}),
        execute: async () => getCustomerContext(customerId),
      },
      addToCart: {
        description: "사용자가 선택한 메뉴·상품을 장바구니에 담기",
        parameters: z.object({
          items: z.array(z.object({ storeItemId: z.string(), qty: z.number() })),
        }),
        execute: async ({ items }) => addToCart(customerId, storeId, items),
      },
      // 옵션: webSearchRecipe, getInventory, ...
    },
  });

  const result = await agent.stream({ messages });

  // 3) 캐시 적재는 응답 종료 후 비동기로
  result.onFinish(async (final) => {
    await upsertSemanticCache({ messages, response: final, customerId, storeId });
    await maybeUpsertNewKnowledge(final); // 새로 알게 된 정보를 tenant_item_ai_detail에 적재
  });

  return result.toResponse();
}
```

### 6.4 클라이언트 컴포넌트 (useChat)

```tsx
// app/(mobile)/ai-shopping/_components/AiShoppingChat.tsx
"use client";
import { useChat } from "@ai-sdk/react";
import { useStoreStore } from "@/lib/stores/storeStore";

export default function AiShoppingChat({ customerId }: { customerId: string }) {
  const storeId = useStoreStore((s) => s.activeStore?.store_id);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai/shopping",
    body: { customerId, storeId },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}
      </div>
      <ChatComposer
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        loading={isLoading}
        placeholder="모아달에게 물어보세요..."
      />
    </div>
  );
}
```

UI 측면에서 첨부 이미지(스크린샷 1·2)에 보이는 "모아달에게 물어보세요…" 입력창과 그대로 매핑됩니다.

---

## 7. 단계별 도입 로드맵

기존 ROADMAP 패턴 (Task 단위, 의존성 명시, `npm run check-all` + Playwright 게이트)에 맞춰 5단계로 제안합니다.

### Phase 1 — 인프라 활성화 (1주)
- **Task A1**: Supabase에 `CREATE EXTENSION vector` 활성화
- **Task A2**: 마이그레이션 SQL 작성 — `tenant_item_ai_detail`, `ai_query_cache`, `customer_preference` + HNSW 인덱스 + `match_ai_chunks` RPC
- **Task A3**: `npm install ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/react openai` (zod는 보유)
- **Task A4**: 환경 변수 추가 — `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` (Vercel project + `.env.local`)
- **DoD**: Supabase Studio에서 `select * from tenant_item_ai_detail limit 1` 실행 가능, AI SDK 임포트 빌드 통과

### Phase 2 — 임베딩 백필 (1~2주)
- **Task B1**: `lib/ai/embeddings.ts` + 청킹 유틸 (500~1500자, 100자 overlap)
- **Task B2**: 시드 스크립트 — `tenant_item_master` 2,875건 × `tenant_item_detail.short_desc` → chunk_type='short_desc' 임베딩 적재
- **Task B3**: Supabase Edge Function `embed-tenant-item` — `tenant_item_master` UPDATE/INSERT 트리거 시 자동 재임베딩
- **Task B4**: 기존 lottemartzetta 크롤러(Task 081) 결과를 `chunk_type='long_desc' / 'recipe'`로 적재하는 어댑터 추가
- **DoD**: 2,875건 × 평균 3 chunk = 약 8,500개 행 적재, `match_ai_chunks("토마토")` 쿼리 200ms 이하

### Phase 3 — RAG 검색 + AI추천 통합 (2주)
- **Task C1**: `searchAiChunks()` Server Action 구현 + pg_trgm 폴백
- **Task C2**: 기존 `getAiRecommendations()` 내부에 벡터 검색 가중치 추가 (카테고리 TOP3 + 페르소나 태그 매칭)
- **Task C3**: `app/(main)/ai-shopping/recommendations-client.tsx`에 "AI가 이 메뉴를 추천한 이유" 텍스트 표시 (chunk content 일부 인용)
- **DoD**: F014 AI 추천 탭에서 페르소나 태그 기반 정렬이 카테고리 단순 정렬 대비 클릭률 향상 (Playwright 회귀 통과)

### Phase 4 — 페르소나 Agent + 채팅 UI (3주)
- **Task D1**: `app/api/ai/shopping/route.ts` — `ToolLoopAgent` 구성 + 4개 tool 등록
- **Task D2**: `app/(mobile)/ai-shopping/chat/page.tsx` + `AiShoppingChat.tsx` — useChat 기반 화면 (스크린샷 1·2와 동일 구조)
- **Task D3**: `generateObject` 응답 카드 컴포넌트 — 메뉴명·이유·주문 팁·CTA(장바구니 담기 / 매장 픽업)
- **Task D4**: 페르소나 시그니처 빌더 + customer_preference 회원가입 1단계 추가 (옵션)
- **Task D5**: Anthropic Claude Sonnet 4.6 + AI Gateway 연결, 토큰·비용 모니터링 대시보드 추가
- **DoD**: 페르소나 B 입력 "오늘 뭐 먹지? 중식이 땡기네" → 메뉴 카드 3개 + 주문 액션 동작, 첨부 시나리오 답변과 95% 일치

### Phase 5 — 시맨틱 캐시 + 자기보강 루프 (1~2주)
- **Task E1**: `ai_query_cache` HIT/MISS 미들웨어 (임베딩 0.95 + 페르소나 시그니처 일치)
- **Task E2**: `result.onFinish` 훅에서 새 chunk를 `tenant_item_ai_detail`에 UPSERT (source='llm_generated', confidence 0.6, status='REVIEW_NEEDED')
- **Task E3**: manager-app에 `REVIEW_NEEDED` 큐 화면 추가 (운영자 승인 시 confidence=1.0 / status='ACTIVE')
- **Task E4**: 7일 TTL 만료 캐시 정리 cron (Supabase Edge Function)
- **DoD**: 동일 페르소나 동일 시간대 반복 프롬프트 LLM 호출 0회, 신규 패턴 발생 시 24시간 내 운영자 검토 큐 도달

### Phase 6 — 평가 / 안전장치 (지속)
- **Task F1**: 한국어 프롬프트 골든 셋(페르소나 A/B/C 각 30개) — Playwright 기반 회귀
- **Task F2**: 토큰·비용·지연 SLO 정의 (응답 P95 ≤ 3초, 캐시 적중률 ≥ 40%, 1주 LLM 비용 상한)
- **Task F3**: 가드레일 — 알러지 정보 충돌 시 답변 거부, 재고 0인 상품 추천 차단
- **DoD**: 골든 셋 통과율 90% 이상, 1주 운영 후 비용 SLO 달성

---

## 8. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 한국어 임베딩 품질 한계 | 검색 정확도 저하 | OpenAI text-embedding-3-small이 한국어 지원하지만, 중요 구간은 한·영 혼합 chunk(상품명 영문 병기)로 보강. 필요 시 text-embedding-3-large(3072차원)로 업그레이드 |
| LLM 비용 증가 | 운영비 부담 | Phase 5 시맨틱 캐시 우선 도입, Haiku로 분류·요약 위임, AI Gateway로 모델 비용 추적·예산 알림 |
| 잘못된 추천 (재고 0, 알러지 충돌) | 사용자 신뢰 훼손 | Tool 단계에서 `v_store_inventory_item` + `customer_preference.allergy_tags` 강제 필터, generateObject Zod 스키마에 `inventory_verified: true` 필수화 |
| RLS 경계 위반 | 데이터 누설 | 모든 RPC는 `createAdminClient()` 호출 시점에 customer_id 명시 검증 후 사용. 캐시 조회는 `customer_id IS NULL`(공용) / 본인 일치만 허용 |
| pgvector 인덱스 빌드 시간 | 백필 중 부하 | Phase 2를 야간 배치로 분할 실행, HNSW `ef_construction` 64 (기본) 유지. 1만 행 미만에서 1분 내 |
| 페르소나 시그니처 오분류 | 부적절한 추천 | customer_preference 명시 입력 + 최근 30일 주문 행동 보정. 재계산은 주 1회 배치 |
| 외부 웹 검색 결과 신뢰도 | 잘못된 레시피 적재 | source 필드 + confidence ≤ 0.6 + status='REVIEW_NEEDED'로 운영자 검토 후 ACTIVE 승격 |

---

## 9. 결론

요구하신 RAG 기반 AI장보기 서비스는 freshpick-app의 현행 스택과 거의 무마찰로 결합됩니다.

- **DB**: 추가 인프라 없이 Supabase pgvector + 신규 3개 테이블(`tenant_item_ai_detail`, `ai_query_cache`, `customer_preference`)
- **AI 런타임**: Vercel AI SDK + Anthropic Claude Sonnet 4.6 + OpenAI text-embedding-3-small
- **검색**: HNSW 벡터 인덱스 → pg_trgm 폴백 → ILIKE 폴백 (기존 무중단 폴백 철학 유지)
- **자기보강 루프**: Tool 호출 결과 → 신규 chunk UPSERT → 운영자 승인 → ACTIVE 승격
- **UI**: 첨부 스크린샷(모아달 채팅 인터페이스)을 useChat + streamText로 구현, 메뉴 카드는 generateObject + Zod 스키마

도입 순서는 Phase 1(인프라) → 2(임베딩 백필) → 3(검색 통합) → 4(Agent + 채팅 UI) → 5(시맨틱 캐시) → 6(평가/안전장치)로 약 8~10주가 소요됩니다.

가장 먼저 결정해두면 좋을 사항은 다음 두 가지입니다.

1. **임베딩 모델**: text-embedding-3-small(1536, 비용 우선) vs text-embedding-3-large(3072, 정확도 우선)
2. **응답 모델**: Anthropic Claude 단독 vs AI Gateway 통한 멀티 모델(Anthropic + OpenAI A/B 비교)

이 두 결정만 내리면 Phase 1 마이그레이션 SQL을 즉시 작성·시작할 수 있습니다.
