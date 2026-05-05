# PROMPT — freshpick-app v0.7d AI장보기 점진 개선 (CORRECTION_DICT 확장 + 탭 재구성 + AI채팅 + 5테마 AI추천)

> **작성일**: 2026-05-04 (v3 — Phase 0 신설: CORRECTION_DICT 확장 통합. v2의 탭 재구성·자연어 메모·5테마 AI추천 유지)
> **대상 버전**: freshpick-app **v0.7d** (현행 v0.7c 다음 정식 버전)
> **선행 버전**: v0.7c — Hotfix BF (PWA) 까지 완료, Phase 5 v0.7 신규 요구사항 6/10 진행 중
> **다음 버전**: v1.0 — RAG 본격 도입 (별도 프롬프트 `PROMPT-freshpick-v1.0-ai-rag-v2.md` 참조)
> **목표 기간**: 4~5주 (단일 sprint, v2 대비 +1주 — Phase 0 CORRECTION_DICT 확장)
> **전제**: 시스템 아직 오픈 전, 기존 `lib/utils/memo-correction-dict.ts` 30개는 샘플 데이터 (오픈 전 교체 필수)

---

## 0. 이 프롬프트의 사용법

이 프롬프트는 **Claude Code**에 1회 또는 Phase 단위로 전달하여 v0.7d의 AI장보기 개선 Task로 실행시키는 것을 목적으로 작성되었습니다.

> **시작 명령**
>
> > 다음은 freshpick-app v0.7d의 AI장보기 점진 개선 Task 명세입니다. **반드시 Phase 0(CORRECTION_DICT 확장)을 먼저 완료**한 뒤 Phase 1 이후로 넘어가세요. 핵심 변경은 (0) 샘플 30개 보정 사전을 GitHub 공개 데이터셋 + 수동 큐레이션으로 100~250개 운영 사전으로 교체, (1) AI장보기 탭 구조 재편 [내메모·AI추천·자동리스트] → [AI채팅·내메모·AI추천], (2) AI채팅의 자연어 명령으로 내메모 자동 추가 (lightweight tool 1개), (3) AI추천 탭을 카테고리 TOP3 나열형 → 5개 테마 섹션 구조로 재설계 입니다. v1.0의 RAG 인프라(pgvector·ToolLoopAgent·시맨틱 캐시)는 도입하지 않습니다. 각 Phase는 독립 PR로 분리하고 `npm run check-all` + `npm run build`를 통과시킨 후 커밋하세요. AI 어시스턴트 이름은 일관되게 **"FreshPick"**입니다 — 별명·캐릭터명 사용 금지.

---

## 1. v0.7d 범위 정의 — 무엇을 하고 / 하지 않는가

### 1.1 v0.7d에서 **할 것** (7가지, v2 대비 +1)

| 항목 | 이유 |
|------|------|
| **0. CORRECTION_DICT 확장 (선행)** | 샘플 30개 → GitHub 공개 데이터셋 + 수동 큐레이션 100~250개로 교체. AI채팅 addToMemo·AI추천 검색이 모두 의존 |
| **A. AI장보기 탭 재구성** [AI채팅·내메모·AI추천] | "AI가 도와준다"는 첫 인상 강화, 자동리스트 흡수로 한 화면 한 책임 |
| **B. AI채팅 화면 + LLM streamText (+ addToMemo tool 1개)** | 채팅으로 끝나지 않고 **메모 추가 액션**까지 자연어로 연결 |
| **C. AI추천 탭 5테마 재설계** | 8개 단순 나열 → 결정 피로를 줄이는 테마형 카드 그룹 |
| **D. F014/F015 보강 (자동리스트 흡수)** | 자동리스트 탭은 제거, F015는 AI추천 "지금이 적기" 테마로 흡수 |
| **E. `customer_preference` 데이터 수집 시작** | v1.0 RAG가 활용할 데이터를 미리 모음 |
| **F. 페르소나 컨텍스트 빌더** | 채팅·5테마 모두 동일 페르소나 컨텍스트 사용 |

### 1.2 v0.7d에서 **하지 않을 것** (v1.0으로 미루는 것)

| 항목 | 미루는 이유 |
|------|------------|
| ❌ Supabase pgvector / 임베딩 인프라 | 활성화·인덱스·HNSW 빌드는 1.0의 본격 RAG에서 |
| ❌ `tenant_item_ai_detail` 테이블 + 청킹·임베딩 백필 | 데이터 적재가 본격적인 ETL 작업 |
| ❌ Vercel AI SDK `ToolLoopAgent` + 4개 tool | v0.7d는 **tool 1개(addToMemo)만** 도입, 4개 tool 전체는 v1.0 |
| ❌ 시맨틱 캐시 (`ai_query_cache`) | 사용자 데이터 누적 후 ROI 측정 가능 |
| ❌ 자기보강 루프 + manager-app 검토 큐 | 운영 가드 없이 시작하면 부정확 정보 누적 |
| ❌ AI Gateway·멀티 모델 라우팅 | 단일 모델로 비용·품질 베이스라인 확보 후 |
| ❌ 페르소나 시그니처 자동 추론 | `customer_preference` 명시 입력만으로 출발 |
| ❌ 채팅에서 장바구니 직접 추가 | v1.0의 `addToCart` tool에서. v0.7d는 "메모 추가" + "검색 화면 이동"까지만 |
| ❌ CORRECTION_DICT의 manager-app 운영 도구 | v1.0 (오픈 전이라 정적 JSON으로 충분) |

이 분리 원칙은 **"운영 가드 + 데이터 기반"이 갖춰지지 않은 단계에서 LLM을 깊게 묶지 않는다**입니다. v0.7d에서 LLM은 **stateless + lightweight tool 1개**로만 작동합니다.

---

## 2. 컨텍스트 (작업 시작 전 반드시 확인)

### 2.1 현행 freshpick-app v0.7c 상태 (확인된 사실)

- **AI장보기 진입**: 하단 탭 → `/ai-shopping`, 3개 내부탭 [내메모 · AI추천 · 자동리스트] (Hotfix BA, 기본 탭=내메모) **— v0.7d에서 재구성**
- **F014 AI 추천**: `lib/api/recommendations.ts` `getAiRecommendations(customerId, storeId)` — `order_detail` 기반 카테고리 TOP3 + `inventory` JOIN
- **F015 자동 리스트**: `lib/api/purchasePattern.ts` `getPurchasePatterns(customerId)` — 6개월 DELIVERED, 런타임 on-the-fly 계산
- **자연어 4-step 파이프라인**: `lib/utils/memo-parser.ts` (`lib/utils/memo-correction-dict.ts` CORRECTION_DICT 30개 — **샘플 데이터, Phase 0에서 교체**)
- **inventory 필터 VIEW**: `v_store_inventory_item` (Hotfix BB)
- **Architecture C**: `tenant_item_master + store_item + v_store_item + tenant_item_detail` (Hotfix AV)
- **결제 우선 (Plan B)**: orderNo 생성 → 토스 결제 완료 후 DB 쓰기 (Hotfix BE)
- **메모 시스템**: `memo` (메모 마스터) + `memo_item` (qty_value, qty_unit, item, note 컬럼) — addToMemo tool에서 활용

### 2.2 핵심 데이터 모델 (v0.7d AI장보기에서 사용)

```
v_store_inventory_item (가용재고 상품) — AI추천 5테마 모두 이 VIEW 경유
  ├─ store_item_id (PK)
  ├─ tenant_item_id, store_id
  ├─ item_name, sale_price, list_price, item_img
  └─ category_code, std_large/medium/small_code (페르소나 매칭용)

memo + memo_item (AI채팅의 addToMemo tool이 INSERT)
  └─ memo_item: { raw_text, item, qty_value, qty_unit, note, status }

customer + 최근 30일 order + (신규) customer_preference
  └─ buildPersonaContext()가 통합

promotion + promotion_item (AI추천 "놓치면 아까워요" 테마)

(신규) customer_preference — household, diet, taste, allergy, cooking_skill, preferred_hour
(신규/Phase 0) data/correction-dict/dict.json — 100~250개 운영 보정 사전
```

### 2.3 기술 스택 (v0.7c에서 그대로 + 신규)

기존: Next.js 16 / React 19 / TypeScript / Tailwind / shadcn/ui / Zustand / Supabase / Server Actions / Vercel.

신규 의존성 (v0.7d에서 추가):
- **`ai`** (Vercel AI SDK) — `streamText` + `tools` (tool 1개), `generateObject`. `ToolLoopAgent`는 v1.0
- **`@ai-sdk/anthropic`** — Claude Haiku 4.5 기본 / Sonnet 4.6 (env 토글)
- **`es-hangul`** (toss, MIT) — Phase 0 자모 거리 검증용
- **`papaparse`** (이미 sellerbox에서 사용 중) — Phase 0 CSV 파싱용
- 환경 변수: `ANTHROPIC_API_KEY`, `AI_SHOPPING_MODEL=haiku|sonnet`

> **중요한 명명 규칙**: AI 어시스턴트 이름은 일관되게 **"FreshPick"** 으로 표기합니다 (별명·캐릭터명 없음).

---

## 3. AI장보기 탭 재구성 설계 (v2와 동일)

### 3.1 새 탭 구조: [AI채팅 · 내메모 · AI추천]

```
/ai-shopping
├── ?tab=chat       (기본, BottomTabNav 진입 시)
├── ?tab=memo       (메모 상세 → 다른 메모 보기 등 직접 진입)
└── ?tab=recommend  (홈의 "AI 추천 더보기" 클릭 시 직접 진입)
```

### 3.2 진입 맥락별 기본 탭

| 진입 경로 | 기본 탭 | 근거 |
|-----------|---------|------|
| BottomTabNav "AI장보기" 클릭 | **AI채팅** | "AI가 도와준다" 첫 인상 강화 |
| 홈 화면 AI추천 섹션 "더보기" 클릭 | **AI추천** | 홈에서 본 추천을 더 깊이 |
| 홈 화면 "메모로 시작" / 메모 상세 → 다른 메모 | **내메모** | 메모 작업 흐름 보존 |

### 3.3 자동 리스트 탭 처리

자동리스트 탭은 **제거**하되 기능은 **흡수**:
- F015 `getPurchasePatterns()` 로직은 그대로 유지
- AI추천 탭의 **테마 2 "지금이 적기"** 섹션이 흡수
- 마이프레시 페이지의 "자주 사시는 상품" 섹션은 그대로 유지 (이중 노출)
- 기존 직링크 `/ai-shopping?tab=auto` → **301 → `/ai-shopping?tab=recommend`** (middleware redirect)
- Hotfix BA의 `data-no-tab-swipe` 가드 모두 유지

---

## 4. AI추천 탭 5테마 설계 (v2와 동일)

### 4.1 사용자의 숨겨진 요구사항 5축

| # | 표면적 요구 | 숨겨진 요구 | 흡수 기능 |
|---|-------------|-------------|-----------|
| 1 | 추천 상품 보여줘 | **오늘 뭘 사야 할지 모르겠어** (결정 피로 감소) | 메뉴 세트 단위 |
| 2 | 내가 좋아할 만한 거 | **한 끼·한 식단 단위로 묶어줘** | 페르소나 컨텍스트 + 카테고리 조합 |
| 3 | 재고 있는 거 | **지금 가게 가면 살 수 있는 것** | `v_store_inventory_item` |
| 4 | 할인 알려줘 | **놓치면 아까운 것** | promotion + inventory 임박 |
| 5 | 최근 본 거 다시 | **계속 사긴 했는데 까먹은 것** | order 6개월 + 미구매 90일 |

### 4.2 5테마 섹션 구조

```
┌────────────────────────────────────────────┐
│ 🍽️ 오늘의 한끼      (테마 1, LLM 1회/일 캐시) │
│ ⏰ 지금이 적기      (테마 2, F015 흡수)       │
│ 🔥 놓치면 아까워요  (테마 3, 신규)            │
│ 💭 다시 만나볼까요  (테마 4, 신규)            │
│ 🆕 새로 들어왔어요  (테마 5)                  │
└────────────────────────────────────────────┘
```

각 섹션 2~4개 카드, 빈 섹션은 자동 숨김. (자세한 데이터 소스는 v2 프롬프트와 동일 — 본 문서 Phase 4·5 참조)

---

## 5. AI채팅 → 내메모 자동 기록 설계 (`addToMemo` tool, v2와 동일)

### 5.1 동작 시나리오

**시나리오 — 명시적 요청**
```
사용자: 오늘 저녁 갈비찜 할 건데 재료 메모해줘
FreshPick: 갈비찜 재료를 메모에 추가할게요. 다음 항목이 맞을까요?
  - 소갈비 1.5kg
  - 무 1개
  - 당근 1개
  - 대파 2뿌리
  - 양파 1개
  [확인] [수정] [취소]
사용자: [확인]
FreshPick: "갈비찜 재료" 메모에 5개 항목을 추가했어요. [메모 보기]
```

### 5.2 Tool 정의 + 실행 흐름

`lib/ai/tools/add-to-memo.ts` — `userConsent: z.literal(true)` 강제, max 20 items, **`applyCorrection()` 통과 후 INSERT (Phase 0의 신규 운영 사전 사용)**.

(상세 설계는 v2 프롬프트와 동일 — 본 문서 Phase 3 참조)

---

## 6. 산출물 (Phase 0 추가)

```
freshpick-app/
├── lib/
│   └── utils/
│       ├── correction-dict.ts                       # Phase 0 신규 — applyCorrection() 단일 진입점
│       ├── correction-dict.types.ts                # Phase 0 신규
│       └── correction-dict.test.ts                 # Phase 0 신규
│
├── data/
│   └── correction-dict/                             # Phase 0 신규
│       ├── dict.json                                # 단일 통합 사전 (DictEntry[])
│       ├── domain-allowlist.txt                    # 식재료·요리 표제어 약 3,000개
│       ├── golden-set.json                         # 평가용 (운영 임베드 X)
│       └── README.md                                # 출처·라이선스·attribution
│
├── scripts/
│   └── correction-dict/                             # Phase 0 신규 (ETL)
│       ├── 01_fetch.ts                             # GitHub raw 다운로드
│       ├── 02_extract_pairs.ts                     # 정규화
│       ├── 03_filter_domain.ts                     # 도메인 필터링
│       ├── 04_validate.ts                          # 6단계 검증
│       ├── 05_build.ts                             # 최종 빌드
│       ├── 06_review.ts                            # markdown 리포트
│       └── README.md
│
├── app/
│   ├── (mobile)/
│   │   ├── ai-shopping/
│   │   │   ├── page.tsx                              # Phase 2 — searchParams.tab 분기
│   │   │   └── _components/
│   │   │       ├── AiShoppingTabs.tsx                # Phase 2 — 3탭
│   │   │       ├── chat/                             # Phase 3
│   │   │       │   ├── AiChatClient.tsx
│   │   │       │   ├── AddToMemoConfirmCard.tsx
│   │   │       │   └── ChatComposer.tsx
│   │   │       ├── memo/                             # Phase 2 — 기존 컴포넌트 이전
│   │   │       └── recommend/                        # Phase 4·5 — 5테마
│   │   │           ├── theme1-meal-set/
│   │   │           ├── theme2-due-now/
│   │   │           ├── theme3-dont-miss/
│   │   │           ├── theme4-rediscover/
│   │   │           └── theme5-new-arrivals/
│   │   └── mypage/
│   │       └── preference/                            # Phase 1
│   └── api/
│       └── ai/
│           └── shopping/
│               ├── chat/route.ts                     # Phase 3 — streamText + addToMemo
│               └── meal-set/route.ts                # Phase 5 — generateObject
│
├── lib/
│   ├── ai/
│   │   ├── prompts.ts                                # Phase 2
│   │   ├── persona-context.ts                       # Phase 2
│   │   └── tools/
│   │       └── add-to-memo.ts                       # Phase 3
│   └── actions/
│       ├── ai/
│       │   ├── chat.actions.ts                      # Phase 3
│       │   └── meal-set.actions.ts                  # Phase 5
│       └── domain/
│           └── preference.actions.ts                # Phase 1
│
├── supabase/
│   └── migrations/
│       └── 20260615_customer_preference_v07d.sql   # Phase 1
│
└── docs/
    ├── correction-dict.md                           # Phase 0 — 운영 가이드
    └── ai-shopping-v0.7d.md                         # Phase 5 — 운영 가이드
```

---

## 7. 단계별 구현 계획 (6 Phase, 약 4~5주)

### Phase 0 — CORRECTION_DICT 확장 (3~4일, 선행 필수)

> **선행 이유**: AI채팅 addToMemo tool의 INSERT 직전 단계와 AI추천 5테마의 검색이 모두 `applyCorrection()`을 호출합니다. 샘플 30개 사전을 그대로 두고 Phase 1 이후를 시작하면 출시 전에 다시 손대야 하므로 비효율적이며, 검색 품질 측정에도 노이즈가 발생합니다.

**목표**: 샘플 `lib/utils/memo-correction-dict.ts` 30개 엔트리를 제거하고, GitHub 공개 데이터셋(라이선스 호환) + 수동 큐레이션을 합쳐 100~250개의 식재료 도메인 운영 사전을 구축한다. greedy replace의 재귀 안정성·라이선스 호환성·도메인 적합도를 모두 검증한다.

**작업 (3 sub-Phase)**:

#### Phase 0.1 — 새 구조 + ETL 파이프라인 (1.5일)

1. **샘플 제거 + 새 모듈 생성**
   - `lib/utils/memo-correction-dict.ts` **삭제** (샘플)
   - `lib/utils/correction-dict.types.ts` 신규
     ```typescript
     export type DictSource =
       | "manual"          // 수동 큐레이션
       | "spellcheck-ko"   // hunspell-dict-ko (allowlist 출처)
       | "github-typo"     // GitHub Typo Corpus (한국어)
       | "manual-review";  // 운영자 추가
     export interface DictEntry {
       wrong: string;
       correct: string;
       source: DictSource;
       confidence: number;       // 0.00~1.00
       domain: string[];          // ['food', 'cooking', 'general']
       addedAt: string;
       note?: string;
     }
     export interface DictMeta {
       version: string;
       totalEntries: number;
       bySource: Record<DictSource, number>;
       lastBuiltAt: string;
     }
     ```
   - `lib/utils/correction-dict.ts` 신규 — `applyCorrection()` longest-key-first greedy replace, `getDictMeta()` 노출. `dict.json` 빈 배열로 시작
   - `lib/utils/memo-parser.ts` STEP4의 import 경로 교체: `from "@/lib/utils/memo-correction-dict"` → `from "@/lib/utils/correction-dict"`
   - `data/correction-dict/dict.json`은 빈 배열 `[]`로 시작 (Phase 0.2에서 채움)

2. **도메인 화이트리스트 시드** — `data/correction-dict/domain-allowlist.txt`
   - 부록 A의 약 100개 시드 단어를 직접 작성
   - **자동 보강 스크립트** `scripts/correction-dict/00_seed_allowlist.ts`:
     - `tenant_item_master.item_name` (약 2,875건)에서 명사 추출
     - `tenant_category_code` 라벨 추출
     - 중복·1글자 제외 후 시드 100개와 합쳐 약 3,000개 화이트리스트 구성

3. **ETL 스크립트 5종 생성** — `scripts/correction-dict/`

   `01_fetch.ts` — GitHub raw 다운로드
   - 환경 변수: `GITHUB_TOKEN`, `OUT_DIR=./scripts/correction-dict/_raw`
   - 다운로드 대상 (실행 직전 URL·라이선스 재확인 필수):
     - `spellcheck-ko/hunspell-dict-ko`의 `data/words.txt` (또는 `ko.dic`) — MPL/GPL/LGPL + 데이터 CC BY-SA 4.0
     - GitHub Typo Corpus 공개 release JSONL — CC BY 4.0
   - **각 다운로드와 함께 LICENSE/README도 받아 `_raw/licenses/{source}/`에 보존** — 감사 추적
   - SHA256을 `_raw/MANIFEST.json`에 기록 (재현성)
   - 실패 시 fail-fast

   `02_extract_pairs.ts` — 정규화
   - hunspell-dict-ko: `.dic` 파싱 → 표제어만 → `domain-allowlist.txt`에 후보로 합치기 (페어 아님)
   - GitHub Typo Corpus: JSONL 라인 읽기 → `lang === "ko"` 필터 → token-level diff → 1~5글자 1:1 페어만 추출
   - 출력: `_raw/extracted/{source}.jsonl`

   `03_filter_domain.ts` — 도메인 필터
   - `domain-allowlist.txt` 로딩
   - `correct` 측이 화이트리스트에 있으면 통과
   - `correct` 길이 1글자 또는 9글자 초과 제외 (조사·어미 오류로 판단)

   `04_validate.ts` — **6단계 검증**
   - **V1. 자모 거리**: `es-hangul`로 양쪽 자모 분리 후 Levenshtein 거리 ≤ 2
   - **V2. 충돌**: 신규 `wrong`이 기존 dict의 `correct`와 겹치면 배제
   - **V3. 순환**: A→B와 B→A 동시 존재 시 양쪽 배제
   - **V4. 재귀 안정성**: greedy replace dry-run 1회 적용 = 2회 적용 (불안정 시 배제)
   - **V5. 금칙어**: 욕설·민감 단어 차단
   - **V6. 빈도 임계값**: GitHub Typo Corpus는 같은 페어 N(=5)회 이상만

   `06_review.ts` — markdown 리포트
   - 컬럼: `wrong | correct | source | confidence_proposal | sample_context`
   - PR description에 그대로 붙이는 형식

**Phase 0.1 DoD**:
- [ ] `memo-correction-dict.ts` 삭제, `memo-parser.ts` import 교체
- [ ] `dict.json = []` 상태에서 `applyCorrection("test")` === `"test"`
- [ ] `npm run check-all` + `npm run build` 통과
- [ ] 5개 ETL 스크립트 단독 실행 가능
- [ ] `_raw/licenses/` 100% 보존, `_raw/`는 `.gitignore`

#### Phase 0.2 — 외부 데이터셋 적용 + 1차 사전 구축 (1.5일)

1. **수동 큐레이션 시드 (`source: "manual"`)** — 50~100개 직접 작성
   - P1. 식재료 받침·자음 오류: `삽겹살→삼겹살`, `깻닢→깻잎`, `오짱어→오징어`
   - P2. 외래어 통일: `토마토케찹→토마토케첩`, `요커트→요거트`, `파마산→파르메산`
   - P3. 단위 오기: `100그람→100그램`, `2키로→2킬로`
   - P4. 음식명: `김치찌게→김치찌개`, `떡뽁이→떡볶이`
   - **표준어 정책 결정 필요**: `짜장면` vs `자장면` (검색 일치를 위해 `자장면→짜장면` 채택, README에 기록)

2. **외부 데이터셋 적용**
   - `01_fetch` → `02_extract` → `03_filter_domain` → `04_validate` → `06_review` 순서 실행
   - markdown 리포트를 PR description에 첨부

3. **승인 흐름 (오픈 전이라도 사람 승인 필수)**
   - 각 행에 `[O]/[X]/[?]` 마킹
   - 개발자 1명 + 원어민 사용자 1명 sign-off
   - `[O]`만 INSERT
   - **이 단계에서 자동 병합 절대 금지**

4. **`05_build.ts`** — 최종 빌드
   - `manual` + 승인된 `github-typo`를 합쳐 `dict.json` 생성
   - 빌드 직전 V2·V3·V4 재실행 (manual과 외부 페어 간 충돌 가능)
   - `data/correction-dict/README.md` 자동 갱신 (출처·통계·attribution)
   - **빌드 단계 assertion** — `FORBIDDEN_SOURCES = ['korean_gec_eval', 'nikl_learner']` 포함 시 throw

5. **단위 테스트**
   - 각 추가 페어마다 단위 테스트 1건 (`correction-dict.test.ts`)
   - 메모 파싱 4-step 통합 테스트 5건 (Task N의 골든 셋 형식)

**Phase 0.2 DoD**:
- [ ] `dict.json` 100~250 페어 (manual 50~100 + github-typo 50~150)
- [ ] 모든 페어에 source/confidence/domain 메타
- [ ] V2·V3·V4 재검증 통과
- [ ] 단위 테스트 100% 통과
- [ ] `README.md` 라이선스 attribution 표
- [ ] 빌드 assertion 동작 (비상업 source 차단)

#### Phase 0.3 — 검색 진입점 통합 + 평가 fixture (1일)

1. **검색 진입점 통합** — `lib/api/products.ts` `searchByCategory()`
   ```typescript
   import { applyCorrection } from "@/lib/utils/correction-dict";
   const normalized = applyCorrection(rawKeyword.trim());
   // 0건 폴백
   let results = await searchItems(normalized);
   if (results.length === 0 && normalized !== rawKeyword) {
     results = await searchItems(rawKeyword);
   }
   ```

2. **평가 골든 셋 (운영 임베드 없이)** — `data/correction-dict/golden-set.json`
   - **출처**: Standard_Korean_GEC (Kor-Native·Kor-Learner) — 비상업, **운영 dict X, 테스트 fixture만**
   - 페어 100개를 `{wrong, expected_correct, source: "korean_gec_eval", license: "non-commercial"}` 형식으로
   - README에 "이 파일은 비상업 평가 fixture이며, 운영 빌드(`dict.json`)에는 절대 포함되지 않음" 명시

3. **평가 스크립트** — `scripts/correction-dict/eval.ts`
   - golden-set 100건에 대해 `applyCorrection(wrong) === expected_correct` 비율 측정
   - 회귀 카운트 (정답 입력에 보정 적용되어 잘못 변경된 경우)
   - 무동작 비율
   - **목표**: 정확도 ≥ 30%, 회귀 0건

4. **Playwright 회귀 5건**
   - "삽겹살 검색 → 삼겹살 결과"
   - "토마토케찹2개 메모 → 토마토케첩 2개로 분리·보정"
   - 검색 0건 시 폴백 동작
   - 신규 페어 2건

**Phase 0.3 DoD**:
- [ ] 검색 화면에서 `applyCorrection()` 통과
- [ ] 0건 폴백 동작 (Playwright)
- [ ] golden-set 평가 정확도 ≥ 30%, 회귀 0건
- [ ] `docs/correction-dict.md` 운영 가이드 + 분기별 갱신 절차

**Phase 0 종합 DoD**:
- [ ] `getDictMeta().totalEntries` 100~250
- [ ] `getDictMeta().bySource.manual` ≥ 50
- [ ] `applyCorrection()` 100자 입력 < 5ms
- [ ] golden-set 회귀 0건
- [ ] 빌드 assertion으로 비상업 source 차단
- [ ] `npm run check-all` + `npm run build` 통과

---

### Phase 1 — 페르소나 데이터 수집 인프라 (3~4일)

> v2 변경 없음. (작업 내용은 v2 프롬프트의 Phase 1 그대로)

**작업 요약**:
- 마이그레이션 `20260615_customer_preference_v07d.sql` (RLS 본인만)
- `types/preference.ts`, `lib/schemas/domain/preference.schema.ts`
- `lib/actions/domain/preference.actions.ts` (`getMyPreference`, `upsertMyPreferenceAction`)
- `app/(mobile)/mypage/preference/page.tsx` + form client
- 마이프레시에 "내 취향 설정" 메뉴 추가
- Playwright 3 시나리오

**DoD**: 마이프레시 → 내 취향 설정 진입·저장·재조회, RLS 검증, `npm run check-all` 통과

---

### Phase 2 — 페르소나 컨텍스트 빌더 + LLM 헬퍼 + 탭 재구성 (3일)

> v2 변경 없음. 단, system prompt에서 `applyCorrection()`이 Phase 0의 신규 사전을 사용함을 확인.

**작업 요약**:
1. `lib/ai/persona-context.ts` — `buildPersonaContext()`
2. `lib/ai/prompts.ts` — system prompt 빌더 3종:
   - `buildShoppingChatSystemPrompt(ctx)` — 채팅용 (FreshPick, 알러지, addToMemo guide)
   - `buildMealSetSystemPrompt(ctx)` — 테마 1
   - `buildReasonSystemPrompt(ctx)` — F014/F015 사유
   - **공통**: 명칭 "FreshPick", 알러지 가드, addToMemo tool 사용 가이드
3. AI장보기 탭 재구성 — `app/(mobile)/ai-shopping/page.tsx`
   - `searchParams.tab` 분기
   - 자동리스트 컴포넌트 → `auto-list-deprecated/`로 이동 (Phase 5에서 제거)
   - middleware redirect `?tab=auto` → `?tab=recommend`
   - Hotfix BA의 `data-no-tab-swipe` 가드 유지
4. 빈 셸 컴포넌트 (chat·recommend는 placeholder, memo 탭은 기존 컴포넌트 이전)
5. 단위 테스트 — preference 있음/없음 등 5건, "FreshPick" 문자열·알러지 가드 검증

**DoD**: 새 3탭 구조 동작, `?tab=auto` 리다이렉트, 단위 테스트 5건 통과

---

### Phase 3 — AI채팅 화면 + addToMemo tool (6~7일)

> v2 변경 없음 + **Phase 0의 신규 CORRECTION_DICT 사용 명시**.

**작업 요약**:
1. API Route `app/api/ai/shopping/chat/route.ts` — `streamText` + `tools: { addToMemo }` + `maxSteps: 2` + `maxOutputTokens: 1200`
2. `lib/ai/tools/add-to-memo.ts` — `userConsent: literal(true)` 강제, max 20 items
3. `lib/actions/ai/chat.actions.ts`
   - `createOrGetMemo(customerId, title)` — 같은 제목 활성 메모 재사용
   - `addMemoItems` 재사용
   - **`applyCorrection()` 통과 후 INSERT** — Phase 0의 100~250개 운영 사전 사용
4. `chat/AiChatClient.tsx` — useChat + tool_call UI
5. `chat/AddToMemoConfirmCard.tsx` — 인라인 확인 카드 (다이얼로그 X)
6. 빈 상태: 이모지 가이드 + 추천 chip 3개, placeholder "FreshPick에게 물어보세요..."
7. Playwright 7 시나리오

**DoD** (v2 + Phase 0 통합):
- [ ] addToMemo tool 호출 → 인라인 확인 카드 → 사용자 확인 후만 INSERT
- [ ] **INSERT 직전 `applyCorrection()` 적용 — Phase 0 신규 사전이 동작 (예: "삽겹살" → "삼겹살" 메모에 저장)**
- [ ] 동일 제목 메모 재사용
- [ ] 알러지 가드 통과
- [ ] FreshPick 명칭 일관

---

### Phase 4 — AI추천 5테마 단순 테마 (테마 2·3·4·5) (5~6일)

> v2 변경 없음. (작업 내용은 v2 프롬프트의 Phase 4 그대로)

**작업 요약**:
- `lib/api/promotion.ts` 확장 — `getDontMissItems` (테마 3)
- `lib/api/rediscover.ts` 신규 — `getRediscoverItems` (테마 4, 6개월 within + 90일 미구매)
- `lib/api/recommendations.ts` 수정 — `getNewArrivals` (테마 5, 14일 신상품 + preference 매칭)
- `purchasePattern.ts` 기존 유지 (테마 2)
- `recommend/RecommendTabClient.tsx` — 5섹션 vertical stack 오케스트레이터, `Promise.all` 병렬, 빈 섹션 자동 숨김
- `ThemeSection.tsx` 공통 셸
- 각 카드에 [담기] + [메모로 추가] 두 CTA
  - [메모로 추가]는 채팅을 거치지 않는 직접 INSERT (Server Action) — **여기서도 `applyCorrection()` 통과**
- Playwright 6 시나리오

**DoD**: 4개 테마 동작, 빈 상태 자동 숨김, [담기]·[메모로 추가] CTA 동작, P95 < 1초

---

### Phase 5 — AI추천 테마 1 (메뉴세트 LLM) + F014/F015 사유 보강 + 자동리스트 제거 (4~5일)

> v2 변경 없음. (작업 내용은 v2 프롬프트의 Phase 5 그대로)

**작업 요약**:
1. 테마 1 메뉴세트 — `app/api/ai/shopping/meal-set/route.ts`, `generateObject` + Zod schema, sessionStorage 24h 캐시
2. F014/F015 사유 보강 — 24h sessionStorage 캐시
3. 자동리스트 탭 완전 제거 (`auto-list-deprecated/` 삭제)
4. 비용 가드 (env 토글, maxOutputTokens, 캐시)
5. Playwright 6 시나리오

**비용 합계 (1 사용자/일)**:
| 호출 | 횟수 |
|---|---|
| AI채팅 (사용자 능동) | 무제한 (자체 토큰 가드) |
| 테마 1 meal-set | 1회/일 (캐시) |
| 테마 2·4 사유 보강 | 1회/일 (캐시) |
| 합계 | 2~3회 + 채팅 |

**DoD**: 5테마 모두 동작, LLM 차단 토글 동작, AI추천 P95 < 2초

---

## 8. v1.0 마이그레이션 노트 (Phase 0 추가)

| v0.7d 자산 | v1.0에서의 변화 |
|------------|----------------|
| **Phase 0: `correction-dict.ts` + `dict.json`** | **그대로 유지**, 분기별 신규 페어 추가 (manager-app 운영 도구 v1.0 도입) |
| **Phase 0: `domain-allowlist.txt`** | tenant_item_master 변경 시 자동 갱신 (Edge Function) |
| **Phase 0: `golden-set.json`** | RAG 평가 골든 셋(200건)에 통합 |
| `customer_preference` 테이블 | `embedding vector(1536)` 추가 + HNSW 인덱스 |
| `lib/ai/persona-context.ts` | `getUserContext` tool로 래핑 |
| `lib/ai/prompts.ts` | tool 사용 가이드 추가, 모듈화 |
| `lib/ai/tools/add-to-memo.ts` | **그대로 유지** + 신규 tool 4개 추가 |
| `app/api/ai/shopping/chat/route.ts` | `streamText` + 1 tool → `ToolLoopAgent` + 5 tools |
| AI추천 5테마 컴포넌트 | **구조 그대로**, 데이터 소스 RAG 보강 |
| sessionStorage 24h 캐시 | `ai_query_cache`와 병존 → 점진 전환 |
| 인라인 메모 확인 카드 | 그대로 유지, addToCart에서 동일 패턴 재사용 |
| FreshPick 명칭 | 변경 없음 |

**호환성 약속**: v0.7d의 모든 컴포넌트·테이블·tool·사전은 v1.0에서 **확장**되지만 **삭제되지 않습니다**.

---

## 9. 명시적 거부 / 비목표 (v0.7d 한정)

- ❌ pgvector·임베딩 인프라: v1.0
- ❌ `tenant_item_ai_detail` 테이블: v1.0
- ❌ ToolLoopAgent / 다단계 tool: v1.0 (v0.7d는 tool 1개 + maxSteps 2)
- ❌ 시맨틱 캐시 (DB): v1.0 (sessionStorage만)
- ❌ 자기보강 루프: v1.0
- ❌ manager-app 운영 도구 (CORRECTION_DICT 편집·AI상품상세검토): v1.0
- ❌ AI Gateway / 멀티 모델 라우팅: v1.0
- ❌ 페르소나 시그니처 자동 추론: v1.0
- ❌ 채팅에서 장바구니 직접 추가: v1.0
- ❌ 외부 웹 검색: v1.0
- ❌ 음성 입력 / TTS: v1.x
- ❌ **CORRECTION_DICT 모델 기반 자동 교정** (BART·KoBART 등): v1.x (greedy replace 한계는 LLM에 위임)
- ❌ **CORRECTION_DICT 띄어쓰기 단독 보정**: STEP2 책임
- ❌ **CORRECTION_DICT 비상업 라이선스 운영 임베드**: 절대 금지

---

## 10. 위험 요소 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| **Phase 0 외부 데이터셋 식재료 적합도 낮음** | 외부 source 통과율 < 10% | 정상. manual 50~100개가 1차 사전의 본체. github-typo는 보조 |
| **Phase 0 greedy 재귀 충돌** | 메모 파싱 깨짐 | V2·V3·V4 재실행, 빌드 직전 + 단위 테스트 100% |
| **Phase 0 라이선스 변경/리포 비공개** | ETL 멈춤 | `_raw/` 마지막 다운로드 보존, MANIFEST에 SHA256 |
| **Phase 0 비상업 데이터 운영 임베드** | 라이선스 위반 | `05_build.ts`에서 `FORBIDDEN_SOURCES` assertion |
| 모델이 addToMemo 임의 호출 | 사용자 의도 무시 | system prompt 가이드 + `userConsent: literal(true)` 강제 + 인라인 확인 카드 |
| 같은 제목 메모 중복 | UX 혼란 | `createOrGetMemo` 활성 메모 재사용 |
| 테마 1 가게 미보유 상품 추천 | 사용자 실망 | `categoryKeyword` 매핑 후 매핑 실패 항목 표시 제외 |
| 5테마 빈 화면 | UX 저하 | EmptyStateGuide + 취향 입력 CTA, 신상품 테마는 항상 시도 |
| LLM 응답 한국어 품질 | 이탈 | Haiku → Sonnet env 토글, 골든 셋 5건 PR 점검 |
| 비용 폭주 | 운영비 부담 | maxOutputTokens 1200 / 환경변수 차단 / sessionStorage 캐시 / Haiku 기본값 |
| FreshPick 명칭 일관성 | 브랜드 혼란 | system prompt 명시 + Phase 2 단위 테스트 + UI 카피 grep |
| 알러지 가드 우회 | 안전 사고 | system prompt 항상 포함 + 골든 셋 알러지 검증 |
| RLS 우회 (다른 customer 메모 조작) | 프라이버시 | 서버 customerId 재조회 강제 |

---

## 11. 수락 기준 요약 (v0.7d 종료 시)

- [ ] **Phase 0**: `dict.json` 100~250 페어, source 메타, golden-set 정확도 ≥ 30%, 회귀 0건, 비상업 차단 assertion
- [ ] **Phase 0**: `applyCorrection()` 100자 < 5ms
- [ ] **Phase 0**: `memo-correction-dict.ts` 삭제, `memo-parser.ts` import 교체
- [ ] AI장보기 탭 [AI채팅·내메모·AI추천] 동작, `?tab=auto` 리다이렉트
- [ ] `customer_preference` 테이블 + RLS + UI + Action 동작
- [ ] AI채팅 화면 + addToMemo tool 동작 (인라인 확인 카드 → 메모 INSERT, **applyCorrection 적용 검증**)
- [ ] AI추천 5테마 동작, 빈 상태 자동 숨김
- [ ] 테마 1 meal-set LLM + 24h 캐시
- [ ] 알러지 가드 모든 LLM 응답 통과
- [ ] 비용 가드 동작
- [ ] **FreshPick 명칭 일관성** (system prompt + UI 카피)
- [ ] Playwright E2E **30건** (Phase 0: 5 / Phase 1: 3 / Phase 2: 2 / Phase 3: 7 / Phase 4: 6 / Phase 5: 6 / 회귀: 1) 통과
- [ ] `npm run check-all` + `npm run build` 통과
- [ ] `docs/correction-dict.md` + `docs/ai-shopping-v0.7d.md` 작성
- [ ] ROADMAP-freshpick-app-v0.7d.md에 Phase 0~5 등록·완료

---

## 12. 실행 직전 자기검증 12문항

에이전트는 작업 시작 전에 다음 12가지를 답변·확인한 뒤 진행하세요.

### Phase 0 전용 (4문항)
1. **외부 데이터셋의 LICENSE 파일을 다운받아 `_raw/licenses/`에 보존했는가?**
2. **운영 빌드(`dict.json`)에 비상업 source가 들어가지 않도록 `05_build.ts`에 assertion이 들어 있는가?**
3. **validated 페어를 `dict.json`에 자동 병합하지 않고, 사람 승인 후에만 병합하는 흐름을 지키고 있는가?**
4. **표준어 정책 결정사항(`짜장면` vs `자장면` 등)을 README.md에 기록했는가?**

### 공통 (8문항)
5. v0.7c 현행 코드의 `getAiRecommendations` 시그니처와 메모 INSERT 흐름(`addMemoItems`)을 확인했는가?
6. `customer_id` 조회 패턴(`.eq("email", user.email)`)을 모든 신규 코드에 적용했는가?
7. `ANTHROPIC_API_KEY`를 클라이언트 번들에 노출하지 않는 구조인가?
8. `maxOutputTokens` + `maxSteps: 2` 가드를 모든 LLM 호출에 적용했는가?
9. system prompt에 알러지 가드와 FreshPick 명칭이 항상 포함되는가?
10. addToMemo tool이 `userConsent: true` 없이 실행되지 않는 구조인가?
11. **addToMemo tool의 INSERT 직전 단계에서 `applyCorrection()`이 호출되어 Phase 0의 신규 사전이 적용되는가?**
12. v0.7d의 모든 신규 테이블·컴포넌트·tool·사전이 v1.0에서 삭제되지 않고 확장만 되도록 설계되었는가?

12개 모두 "예"가 되어야 진행하세요. 하나라도 "아니오"면 그 단계에서 멈추고 사용자에게 보고하세요.

---

## 부록 A — 도메인 화이트리스트 시드 (Phase 0.1에서 직접 작성)

`data/correction-dict/domain-allowlist.txt` 시드용 약 100개. `tenant_item_master.item_name` 자동 추출과 합쳐 약 3,000개 구성.

```
# 채소·과일
배추 무 당근 양파 대파 쪽파 마늘 생강 감자 고구마 오이 호박 가지 파프리카 피망 청양고추 깻잎 상추 시금치 청경채 부추 양배추 브로콜리 콜리플라워 토마토 방울토마토 사과 배 귤 오렌지 레몬 바나나 포도 딸기 블루베리 키위 멜론 수박

# 육류·해산물
삼겹살 목살 갈비 등심 안심 차돌박이 닭가슴살 닭다리 닭날개 오리고기 양고기 새우 오징어 낙지 문어 갈치 고등어 삼치 연어 참치 광어 우럭

# 가공식품
계란 두부 콩나물 숙주 어묵 햄 소시지 베이컨 치즈 우유 버터 요거트

# 곡류·조미료
쌀 현미 보리 콩 팥 밀가루 빵가루 설탕 소금 간장 된장 고추장 식초 들기름 참기름 올리브유 식용유 후추 깨 깨소금 미림 맛술 케첩 마요네즈 머스타드

# 요리명
김치찌개 된장찌개 부대찌개 비빔밥 떡볶이 잡채 불고기 갈비탕 설렁탕 삼계탕 미역국 콩나물국 라면 칼국수 짜장면 짬뽕 볶음밥 김밥 스파게티 카레

# 단위·도구
근 마리 통 봉지 봉 팩 박스 묶음 단 그램 킬로그램 리터 밀리리터 cc ml g kg
```

---

## 부록 B — 자모 거리 검증 함수 (Phase 0.1 V1)

```typescript
// scripts/correction-dict/util/jamo-distance.ts
import { disassemble } from "es-hangul";

export function jamoDistance(a: string, b: string): number {
  const ja = disassemble(a);
  const jb = disassemble(b);
  return levenshtein(ja, jb);
}

function levenshtein(s: string, t: string): number {
  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const dp = Array.from({ length: s.length + 1 }, () =>
    new Array(t.length + 1).fill(0),
  );
  for (let i = 0; i <= s.length; i++) dp[i][0] = i;
  for (let j = 0; j <= t.length; j++) dp[0][j] = j;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[s.length][t.length];
}

// 사용: jamoDistance("삽겹살", "삼겹살") === 1
```

---

## 부록 C — `data/correction-dict/README.md` 초안

```markdown
# Correction Dict — 출처 및 라이선스

## 통계
- 마지막 빌드: 2026-XX-XX
- 총 엔트리: NN개
- manual: NN / spellcheck-ko (allowlist): NN / github-typo: NN

## 표준어 정책 결정
- `짜장면` vs `자장면`: freshpick-app은 검색 일치를 위해 `자장면→짜장면` 채택

## 출처

| 소스 | 라이선스 | URL | 페어 수 | Attribution |
|------|---------|-----|---------|-------------|
| manual (수동 큐레이션) | © FreshPick | — | NN | — |
| spellcheck-ko/hunspell-dict-ko | MPL/GPL/LGPL + CC BY-SA 4.0 | https://github.com/spellcheck-ko/hunspell-dict-ko | (allowlist만) | hunspell-dict-ko / 국립국어원 |
| GitHub Typo Corpus (Hagiwara & Mita, 2019) | CC BY 4.0 | https://github.com/mhagiwara/github-typo-corpus | NN | Hagiwara, M., & Mita, M. (2019). arXiv:1911.12893 |

## 평가 골든 셋 (운영 임베드 X)
| 소스 | 라이선스 | 용도 |
|------|---------|------|
| Standard_Korean_GEC | 코드 MIT, 데이터 비상업 | Phase 0.3 평가 fixture만 |
```

---

> **본 프롬프트의 끝.**
> v0.7d 완료 후 v1.0은 별도 프롬프트(`PROMPT-freshpick-v1.0-ai-rag-v2.md`)로 진행합니다.
> 의문이 생기면 임의 결정 대신 PR description에 기록하고 사용자 확인을 요청하세요. 특히 Phase 0의 표준어 정책 결정, 모델 선택(Haiku/Sonnet), 알러지 가드 강도, 캐시 TTL, 5테마의 카드 개수·순서는 운영자 결정이 필요합니다.
