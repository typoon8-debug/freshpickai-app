# PROMPT — `CORRECTION_DICT` 한국어 오타 데이터셋 수집·가공·통합 구현 계획

> **작성일**: 2026-05-04
> **대상 앱**: freshpick-app
> **대상 파일**: `lib/utils/memo-correction-dict.ts` (현재 30개 엔트리)
> **연계 기능**: F003 장보기 메모 자연어 4-step 파이프라인, F031 pg_trgm 유사성 검색 (`search_items_by_similarity` RPC), F032 freshpick 검색 통합
> **목적**: GitHub에 공개된 한국어 오타·맞춤법 교정 데이터셋(JSON / CSV / TXT)을 수집·가공하여 기존 `CORRECTION_DICT`에 안전하게 병합하고, 식재료·장보기 도메인에 특화된 사전을 구축한다.

---

## 0. 이 프롬프트의 사용법

이 프롬프트는 **Claude Code (또는 동급의 코딩 에이전트)** 에게 1회 또는 분할로 전달하여 Task로 실행시키는 것을 목적으로 작성되었습니다. 프롬프트 본문은 그대로 붙여넣어도 동작하도록 명령형으로 기술되어 있고, 마지막 부록(부록 A·B·C)은 참고용입니다.

> **시작 명령** (이 한 줄을 먼저 보내고 본문을 이어 붙여도 됩니다)
>
> > 다음은 freshpick-app의 `CORRECTION_DICT`(30개)을 GitHub 공개 데이터셋으로 확장하는 Task 명세입니다. 명세대로 단계별 PR 단위로 구현해 주세요. 각 Phase는 독립 PR로 분리하고, 모든 변경은 `npm run check-all` + `npm run build` 통과를 충족시킨 후에만 커밋하세요. 외부 데이터셋 라이선스·도메인 적합성 필터링은 절대 생략하지 마세요.

---

## 1. 컨텍스트 (반드시 먼저 읽고 시작)

### 1.1 현재 `CORRECTION_DICT` 사용 패턴

- **위치**: `lib/utils/memo-correction-dict.ts`
- **타입**: `Record<string, string>` (오타 → 정답)
- **현재 엔트리 30개 예시**: `삽겹살 → 삼겹살`, `게란 → 계란`, `달걀 → 계란`, `떡뽁이 → 떡볶이`, `김치찌게 → 김치찌개` 등
- **적용 함수**: `applyCorrection(text)` — **longest-key-first greedy replace** (긴 키 우선 매칭하여 부분 치환 충돌 방지)
- **호출 경로**:
  1. `lib/utils/memo-parser.ts` — STEP4 `qty 파싱 후 품목명에 `applyCorrection()` 적용
  2. (확장 예정) `lib/api/products.ts` `searchByCategory()` — 검색어 입력 시 1차 보정 후 RPC 전달
  3. (확장 예정) AI 장보기 RAG — 사용자 프롬프트 임베딩 직전 정규화

### 1.2 새 사전이 만족해야 하는 4가지 조건

| 조건 | 이유 |
|------|------|
| **C1. 식재료·장보기 도메인 우선** | freshpick-app은 마트 상품 검색·메모 파싱이 주 사용처. "은행이→은행 이체" 같은 비식품 보정이 들어오면 오히려 검색 품질이 떨어짐 |
| **C2. 결정론적(1:1) 매핑만 채택** | greedy replace는 동음이의어가 들어오면 잘못된 치환을 만듦. 확률·문맥 기반 보정은 LLM에 위임 |
| **C3. 라이선스 호환성** | freshpick-app은 상용 서비스. 데이터셋의 원 라이선스(MIT / CC BY / CC BY-SA / GPL / 비상업 only)에 따라 분리 관리 |
| **C4. 기존 30개와 충돌 없음** | 기존 보정이 회귀(regression)하지 않아야 함. Playwright 4-step 파이프라인 골든 셋 통과 필수 |

### 1.3 외부 데이터셋 후보 (선검증된 GitHub 소스)

> 이 목록은 1차 후보입니다. 실제 적용 시 **로컬에서 직접 확인**하고, 라이선스·내용을 다시 검증한 뒤 사용하세요. 변경된 라이선스나 비공개 전환에 항상 대비합니다.

| # | 소스 (GitHub) | 형태 | 라이선스 | 활용 가능 부분 | 주의 |
|---|---------------|------|---------|----------------|------|
| 1 | `spellcheck-ko/hunspell-dict-ko` (한글 hunspell 사전) | `.dic` / `.aff` | MPL/GPL/LGPL 3중 + 데이터 일부 CC BY-SA 4.0 | 표준 단어 화이트리스트 (오타가 아닌 "정답" 후보) | 사전 자체는 오타 페어가 아님. **표제어 검증용**으로만 사용 |
| 2 | `soyoung97/Standard_Korean_GEC` (Kor-Lang8 / Kor-Native / Kor-Learner) | parallel txt (source / reference) | Modified MIT (코드) + 데이터셋은 **비상업** (NIKL·국립국어원 출처) | 학습자·원어민 오류 페어 | **상용 freshpick-app에 직접 임베드 불가**. 패턴 학습·검증용으로만 사용. 1:1 토큰 페어 추출 후 별도 확인 |
| 3 | `tjwjdgus12/ChinJiIn` (천지인 오타 교정) | `optimized_dict.txt` + 빈도 | 명시 없음 (확인 필요) | 천지인 키보드 인접 오타 패턴 | 두벌식 사용자에는 부적합. 모바일 천지인 사용자용 별도 사전으로 분리 |
| 4 | `lovit/soyspacing` (띄어쓰기 교정) | 학습 데이터 | (저장소 LICENSE 확인) | 띄어쓰기 패턴 (예: "삼겹살1근" → "삼겹살 1근") | greedy replace에는 부적합. 4-step STEP2(구분자 분할) 보강용 |
| 5 | `songys/AwesomeKorean_Data` (메타 카탈로그) | 링크 모음 | 카탈로그 자체 MIT | 신규 데이터셋 발굴용 인덱스 | 직접 데이터 아님. 분기별 모니터링 |
| 6 | GitHub Typo Corpus (Hagiwara & Mita, 2019) | parallel JSON | CC BY 4.0 (논문 명시) | 한국어 typo edit 페어 | 한국어 비중 작음. 추출 후 식재료 필터 필수 |
| 7 | (옵션) AI Hub "한국어 학습자 말뭉치" | XML | 비상업 | 학습자 오류 패턴 | 라이선스로 운영 적용 불가. 골든 셋 평가용 |

**선택 기준 적용 결과**:
- **C1·C2·C3·C4 모두 통과**: 후보 1, 6 (직접 임베드 가능)
- **검증·추출 후 통과 가능**: 후보 4 (STEP2에만 한정)
- **운영 임베드 불가, 평가용으로만**: 후보 2, 7
- **분리 사전으로**: 후보 3

### 1.4 라이선스 결정 트리

```
데이터셋 라이선스가
├── MIT / Apache-2.0 / CC0          → 즉시 임베드 OK
├── CC BY 4.0                        → 임베드 OK + 출처 attribution
├── CC BY-SA 4.0                     → 임베드 OK + attribution + 파생 사전 동일 라이선스 공개 (회사 정책 확인)
├── GPL / LGPL                       → 코드 결합 시 전염 위험 — 데이터만 사용 시 (사전 텍스트만) 보통 OK, 회사 법무 확인
├── 비상업(Non-commercial)            → freshpick-app 상용에 임베드 불가. 평가/벤치마크 용도만
├── 명시 없음                         → "All Rights Reserved"로 간주 → 임베드 금지, 메일 동의 필요
└── 별도 약관 (e.g. NIKL)            → 약관 문구 직접 확인
```

---

## 2. 산출물

이 Task를 모두 완료하면 다음이 만들어져 있어야 합니다.

```
freshpick-app/
├── lib/
│   └── utils/
│       ├── memo-correction-dict.ts          # 기존 (30개) — 변경 금지, 폴백용 보존
│       ├── correction-dict.ts               # 신규 — 통합 dict 노출 + applyCorrection() 단일 진입점
│       ├── correction-dict.types.ts         # 신규 — DictEntry / DictSource / DictMeta 타입
│       └── correction-dict.test.ts          # 신규 — Vitest 또는 Playwright 단위 테스트
│
├── data/
│   └── correction-dict/                     # 신규 — 빌드 시점에 import되는 정적 자원
│       ├── core.json                        # 식재료 도메인 핵심 (수동 큐레이션 + 기존 30개)
│       ├── extended.json                    # 외부 데이터셋에서 추출·승인된 페어
│       ├── chunjiin.json                    # 천지인 키보드 사용자용 (옵션 분리)
│       ├── domain-allowlist.txt             # 식재료·요리 표제어 화이트리스트 (좌변·우변 검증용)
│       └── README.md                        # 사전 출처·라이선스·갱신 이력
│
├── scripts/
│   └── correction-dict/                     # 신규 — 데이터셋 수집·정제 ETL (운영 코드 아님)
│       ├── 01_fetch.ts                      # GitHub raw 다운로드
│       ├── 02_extract_pairs.ts              # 다양한 형태 → {wrong, correct, source} 정규화
│       ├── 03_filter_domain.ts              # 식재료 도메인 필터링
│       ├── 04_validate.ts                   # 자모 분리 거리·길이·충돌 검증
│       ├── 05_merge.ts                      # core.json + extended.json 병합
│       ├── 06_review.ts                     # 사람 검토용 diff 리포트 생성
│       └── README.md                        # 실행 순서·환경 변수
│
├── supabase/
│   └── seed/
│       └── correction_dict_seed.sql         # (선택) DB에 사전을 저장해 manager-app에서 편집 가능하게 함
│
└── docs/
    └── correction-dict.md                   # 운영 가이드 (갱신 주기·승인 프로세스)
```

---

## 3. 단계별 구현 계획 (5 Phase, 각 Phase = 1 PR)

### Phase 1 — 스캐폴딩 + 타입 + 기존 30개 이관 (반나절)

**목표**: 기존 `memo-correction-dict.ts`를 깨지 않으면서 새 구조의 진입점을 만들고, `applyCorrection()`을 단일화한다.

**작업**:

1. `lib/utils/correction-dict.types.ts` 신규
   ```typescript
   export type DictSource =
     | "core"           // 수동 큐레이션
     | "spellcheck-ko"  // hunspell-dict-ko
     | "github-typo"    // GitHub Typo Corpus (한국어 부분)
     | "soyspacing"     // 띄어쓰기 보강
     | "chunjiin"       // 천지인 (옵션)
     | "manual-review"; // 운영자가 추가

   export interface DictEntry {
     wrong: string;             // 오타·이형태
     correct: string;           // 정답
     source: DictSource;
     confidence: number;        // 0.00~1.00 (1.00 = 검증된 식재료 도메인)
     domain?: string[];         // ['food', 'cooking', 'general']
     addedAt: string;           // ISO date
     note?: string;
   }

   export interface DictMeta {
     version: string;           // semver: "1.0.0"
     totalEntries: number;
     bySource: Record<DictSource, number>;
     lastBuiltAt: string;
   }
   ```

2. `data/correction-dict/core.json` 신규 — 기존 30개를 `DictEntry[]` 형식으로 변환 (`source: "core"`, `confidence: 1.0`, `domain: ["food"]`)

3. `lib/utils/correction-dict.ts` 신규
   ```typescript
   import coreDict from "@/data/correction-dict/core.json";
   import extendedDict from "@/data/correction-dict/extended.json";
   import type { DictEntry } from "./correction-dict.types";

   // 빌드 시점 1회 평탄화 (런타임 비용 0)
   const ENTRIES: DictEntry[] = [...coreDict, ...extendedDict];
   const MAP: Map<string, string> = new Map(
     ENTRIES.sort((a, b) => b.wrong.length - a.wrong.length)  // longest-key-first
            .map((e) => [e.wrong, e.correct]),
   );
   const SORTED_KEYS: string[] = [...MAP.keys()];

   export function applyCorrection(text: string): string {
     let result = text;
     for (const key of SORTED_KEYS) {
       if (result.includes(key)) {
         result = result.split(key).join(MAP.get(key)!);
       }
     }
     return result;
   }

   export function getDictMeta(): DictMeta { /* ... */ }
   ```

4. `lib/utils/memo-correction-dict.ts` — `applyCorrection`을 새 모듈에서 re-export로만 변경
   ```typescript
   export { applyCorrection } from "./correction-dict";
   ```
   (기존 import 경로 무중단 유지)

5. `lib/utils/correction-dict.test.ts` — 기존 30개 페어 100% 보존 회귀 테스트

**DoD**:
- [ ] `npm run check-all` + `npm run build` 통과
- [ ] Playwright 메모 파싱 4-step 회귀 (Task N) 100% 통과
- [ ] 기존 import (`@/lib/utils/memo-correction-dict`) 그대로 동작
- [ ] `getDictMeta()` 호출 시 `totalEntries: 30, bySource: { core: 30 }` 반환

---

### Phase 2 — 외부 데이터셋 ETL 파이프라인 (1.5일)

**목표**: GitHub 공개 데이터셋을 가져와 정제·필터링하는 **재실행 가능한 스크립트**를 만든다. 이 단계는 사전을 늘리지 않는다 — 파이프라인만 만들고, 결과 JSON은 PR에서 검토 후 다음 Phase에서 병합한다.

**작업**:

1. `scripts/correction-dict/01_fetch.ts`
   - 환경 변수: `GITHUB_TOKEN`(rate limit 회피), `OUT_DIR=./scripts/correction-dict/_raw`
   - 다운로드 대상 (URL 직접 명시, 재현성 우선):
     - `https://raw.githubusercontent.com/spellcheck-ko/hunspell-dict-ko/master/data/words.txt` (또는 `ko.dic`)
     - `https://raw.githubusercontent.com/mhagiwara/github-typo-corpus/master/data/github-typo-corpus.v1.0.0.jsonl.gz` (또는 공개 release)
     - (옵션) `https://raw.githubusercontent.com/lovit/soyspacing/master/...` 의 학습 샘플
   - **각 다운로드 직전에 라이선스 파일 (`LICENSE`, `README.md`)도 함께 다운받아 `_raw/` 옆에 보존** — 향후 감사·라이선스 추적 가능
   - 다운로드 실패 시 fail-fast (다음 단계 실행 차단)

2. `scripts/correction-dict/02_extract_pairs.ts`
   - 각 소스별 어댑터:
     - **hunspell-dict-ko**: `.dic` 파싱 → 표제어만 추출 → `data/correction-dict/domain-allowlist.txt` 후보로 직접 적재 (오타 페어 아님)
     - **GitHub Typo Corpus**: JSONL 라인별 `{src, tgt, lang}` 읽기, `lang === "ko"` 필터 → token-level diff (`@msqr1/jsdiff` 또는 자체 구현) → 1글자~5글자 1:1 페어만 추출
     - **soyspacing**: 띄어쓰기 차이만 있는 페어는 STEP2 보강용으로 별도 파일 (`spacing-pairs.json`)에 저장, dict에는 포함하지 않음
   - 출력: `_raw/extracted/{source}.jsonl` (`{wrong, correct, source, raw_context}` 형식)

3. `scripts/correction-dict/03_filter_domain.ts`
   - 도메인 화이트리스트 매칭:
     - `data/correction-dict/domain-allowlist.txt`에 있는 표제어 리스트 (식재료·요리·조리법·도구·단위 약 2,000개) 로딩
     - 각 페어의 `correct` 측이 화이트리스트에 있으면 통과
     - 화이트리스트는 **Phase 2 시작 시 수동으로 시드** — 기존 freshpick-app 상품명(`tenant_item_master.item_name` 2,875건)과 카테고리명(`tenant_category_code`) 자동 추출 + 식재료 위키 100개 시드
   - **예외**: `correct` 길이가 1글자 또는 9글자 초과면 제외 (조사·어미 오류로 판단)
   - 출력: `_raw/filtered/{source}.jsonl`

4. `scripts/correction-dict/04_validate.ts` — **6단계 검증**
   - V1. **자모 거리 검증**: `hangul-js` (또는 `es-hangul`)로 양쪽 자모 분리 후 Levenshtein 거리 ≤ 2만 통과
   - V2. **충돌 검증**: 신규 `wrong`이 기존 dict의 `correct`와 겹치면 배제 (예: 신규 `계란→달걀`은 기존 `달걀→계란`과 정확히 충돌 → 배제)
   - V3. **순환 검증**: A→B와 B→A가 동시 존재하면 양쪽 다 배제
   - V4. **재귀 충돌 검증**: greedy replace를 dry-run하여 1번 적용 결과와 2번 적용 결과가 다르면 (= 불안정) 배제
   - V5. **금칙어 검증**: 욕설·민감 단어 화이트리스트 차단
   - V6. **빈도 임계값**: GitHub Typo Corpus의 경우, 같은 페어가 N(=5)회 이상 등장한 것만 통과 (오타 우연 방지)
   - 출력: `_raw/validated/{source}.jsonl` + `_raw/rejected/{source}.jsonl` (사유 포함)

5. `scripts/correction-dict/06_review.ts`
   - validated 결과를 사람이 검토하기 좋은 markdown 표로 변환
   - GitHub PR에 그대로 붙일 수 있는 형식
   - 컬럼: `wrong | correct | source | confidence_proposal | domain_match | sample_context`

**DoD**:
- [ ] 5개 스크립트 모두 `tsx scripts/correction-dict/0X_*.ts` 단독 실행 가능
- [ ] `_raw/` 디렉터리는 `.gitignore` 추가, `_raw/validated/*.jsonl`만 PR에 포함
- [ ] 라이선스 파일 100% 보존 (`_raw/licenses/`)
- [ ] 첫 실행 결과 markdown 리포트 PR description에 첨부

---

### Phase 3 — 1차 추가 (50~150 페어, 보수적) (1일)

**목표**: Phase 2의 validated 페어 중 **사람이 직접 승인**한 것만 `extended.json`에 병합한다.

**작업**:

1. **승인 워크플로**:
   - PR description에 Phase 2의 markdown 리포트를 그대로 붙이기
   - 한 줄씩 `[O] / [X] / [?]` 마킹
   - PR 리뷰어 1명 + 운영자(원어민) 1명 OR sign-off
   - `[O]`만 `data/correction-dict/extended.json`에 INSERT

2. **승인 우선순위 (1차 추가 시)**:
   - P1. 식재료 받침 오류 (예: `당근 → 당근` 동음이의 X, `상치 → 상추` 동음이의 X)
   - P2. 외래어 통일 (예: `토마토케찹 → 토마토케첩`, `파마산 → 파르메산`)
   - P3. 자주 보이는 단위 오기 (예: `한근 → 한 근`은 spacing이라 스킵, `100그람 → 100그램`은 OK)
   - P4. 음식명 (예: `김치찌게 → 김치찌개` — 이미 core에 있음)
   - **P5는 Phase 4로 미룸**: 동사·어미 보정 (애매성 위험)

3. **각 추가 페어는 단위 테스트 1건씩 동반**:
   ```typescript
   it("should correct 토마토케찹 → 토마토케첩", () => {
     expect(applyCorrection("오늘 토마토케찹 사오기")).toBe("오늘 토마토케첩 사오기");
   });
   ```

4. **Phase 3 종료 후 dict 메타 출력**:
   ```
   { version: "1.1.0", totalEntries: 80~180, bySource: { core: 30, "github-typo": 30~80, "manual-review": 20~70 } }
   ```

**DoD**:
- [ ] `getDictMeta().totalEntries`가 50~200 범위
- [ ] 모든 신규 페어에 단위 테스트 존재
- [ ] Playwright 메모 파싱 골든 셋 통과 (회귀 0건)
- [ ] `data/correction-dict/README.md`에 라이선스·출처 attribution 표 작성

---

### Phase 4 — 검색·RAG 통합 (1일)

**목표**: 사전을 메모 파싱뿐 아니라 **검색·AI장보기 진입점**에서도 사용한다.

**작업**:

1. `lib/api/products.ts` `searchByCategory()` (Task 061 참조) 진입부에서 키워드 1차 보정
   ```typescript
   import { applyCorrection } from "@/lib/utils/correction-dict";
   const normalizedKeyword = applyCorrection(rawKeyword.trim());
   // 이후 normalizedKeyword를 RPC `search_items_by_similarity` 또는 ILIKE에 전달
   ```

2. (Phase 5 보고서의 RAG가 도입될 경우) 임베딩 생성 직전에도 동일하게 보정
   ```typescript
   const normalized = applyCorrection(userPrompt);
   const embedding = await generateEmbedding(normalized);
   ```

3. **A/B 안전장치**: 보정 전·후가 다를 때 검색 결과가 0건이면 보정 전 키워드로 1회 더 검색 (폴백)
   ```typescript
   let results = await searchItems(normalizedKeyword);
   if (results.length === 0 && normalizedKeyword !== rawKeyword) {
     results = await searchItems(rawKeyword);
   }
   ```

4. **로그 적재** (옵션): `correction_log` 테이블에 `(raw, corrected, hit_count, customer_id, ts)` 기록 → manager-app에서 운영자가 어떤 보정이 효과적인지 모니터링

**DoD**:
- [ ] 검색 화면(`/search?q=삽겹살`) → 삼겹살 관련 상품 노출 (Playwright)
- [ ] 검색 0건 시 폴백 동작 확인 (Playwright)
- [ ] 4-step 메모 파이프라인 회귀 0건

---

### Phase 5 — 운영 도구 + 정기 갱신 (옵션, 0.5일)

**목표**: 사전을 코드 변경 없이 운영자가 추가·승인할 수 있게 한다. 또한 분기별 갱신 루틴을 정착시킨다.

**작업**:

1. `supabase/migrations/2026xxxx_correction_dict_seed.sql`
   ```sql
   CREATE TABLE correction_dict (
     wrong       TEXT PRIMARY KEY,
     correct     TEXT NOT NULL,
     source      TEXT NOT NULL,
     confidence  NUMERIC(3,2) DEFAULT 0.80,
     domain      TEXT[] DEFAULT ARRAY[]::TEXT[],
     status      TEXT DEFAULT 'ACTIVE'
                 CHECK (status IN ('ACTIVE','PENDING','REJECTED')),
     created_at  TIMESTAMPTZ DEFAULT NOW(),
     created_by  UUID REFERENCES auth.users(id),
     approved_at TIMESTAMPTZ,
     approved_by UUID
   );
   CREATE INDEX idx_correction_dict_status ON correction_dict(status);
   ```

2. **빌드 시점 하이드레이션**: `next build` 단계에서 `correction_dict.status='ACTIVE'`를 SELECT하여 `data/correction-dict/extended.json`을 자동 생성. 빌드 결과는 commit하지 않고, 빌드 산출물에만 포함.

3. **manager-app**에 "오타 사전 관리" 화면 추가 (system 관리 메뉴 하위, 화면번호 60008 후보):
   - 목록: `wrong | correct | source | confidence | status | actions`
   - 신규 등록: PENDING → 운영자 승인 → ACTIVE
   - PR 트리거: status 변경 시 빌드 재실행 (Vercel deploy hook)

4. **분기별 갱신 절차** (`docs/correction-dict.md`):
   - Q1 시작: `scripts/correction-dict/01~06` 재실행 → markdown 리포트 → 운영자 검토 → ACTIVE 승격
   - 갱신 시 `core.json`은 절대 건드리지 않음 (보호)
   - manager-app 운영자가 사용자 검색 로그 기반 신규 후보 발굴

**DoD**:
- [ ] 마이그레이션 적용 후 manager-app에서 1건 등록·승인 가능
- [ ] Vercel 재배포 후 새 페어가 검색 보정에 반영
- [ ] 분기별 갱신 절차가 `docs/correction-dict.md`에 문서화

---

## 4. 명시적 거부 / 비목표 (Out of Scope)

이 Task는 다음을 **하지 않습니다**. 에이전트가 임의로 확장하지 마세요.

- ❌ **모델 기반 자동 교정**: BART·KoBART·BERT 호출은 본 사전 작업의 목표가 아님. RAG 보고서의 별도 Phase에서 다룸
- ❌ **문맥 기반 동음이의어 분기**: greedy replace의 본질적 한계. LLM agent에 위임
- ❌ **띄어쓰기 단독 보정**: STEP2 구분자 분할의 책임. dict에 띄어쓰기 페어 추가 금지
- ❌ **외국어→한글 음역**: `tomato → 토마토` 같은 음역은 별도 모듈
- ❌ **존댓말·반말 변환**: 도메인 밖
- ❌ **비상업 라이선스 데이터셋의 직접 임베드**: `Standard_Korean_GEC` 본문, NIKL 학습자 말뭉치 등은 절대 임베드 금지. 평가용으로만 분리 보관

---

## 5. 위험 요소 및 대응

| 위험 | 발생 가능성 | 영향 | 대응 |
|------|-------------|------|------|
| GitHub raw URL 변경 / 리포지토리 비공개 전환 | 중 | ETL 파이프라인 멈춤 | `_raw/` 디렉터리에 마지막 성공 다운로드 보존, `MANIFEST.json`에 SHA256 기록 |
| 라이선스 변경 (CC BY-SA → 비공개) | 낮 | 법적 리스크 | 분기 갱신마다 LICENSE 재확인, 변경 발견 시 즉시 해당 source 페어 status='REJECTED' 처리 |
| greedy replace 회귀 (예: `달걀 → 계란` 추가가 기존 `계란 → 달걀` 무효화) | 중 | 메모 파싱 깨짐 | V2·V3·V4 검증 + Phase 1 회귀 테스트 30건 골든 셋 |
| 한국어 자모 분리 라이브러리 의존성 충돌 | 낮 | 빌드 실패 | `es-hangul` (toss, MIT, 활발 유지) 채택. `hangul-js`는 deprecated 안내 |
| 외부 데이터셋의 식재료 도메인 적합도 낮음 | 높 | 1차 추가 페어 0건 가능 | core.json 30개 + 운영자 수동 추가가 주, 외부는 보조. 0건이어도 Phase 1·2 인프라는 가치 있음 |
| 데이터셋 누출 (학습자 말뭉치 일부) | 매우 낮 | 라이선스 위반 | 비상업 데이터는 `_raw/non-commercial/` 별도 폴더 + `.gitignore` 명시 + Phase 2 스크립트가 해당 폴더는 ETL 대상에서 제외 |

---

## 6. 수락 기준 요약 (전체 Task 종료 시)

- [ ] `data/correction-dict/core.json` 30개 + `extended.json` 50~200개 = 총 80~230 페어
- [ ] 모든 페어에 `source` / `confidence` / `domain` 메타 존재
- [ ] `data/correction-dict/README.md`에 라이선스 출처·attribution 표 완비
- [ ] `lib/utils/correction-dict.ts` 단일 진입점, 기존 import 경로 유지
- [ ] `applyCorrection()` 성능 — 100자 입력 처리 < 5ms (브라우저·서버 동일)
- [ ] Playwright 4-step 메모 파싱 골든 셋 (Task N 기존) 100% 통과
- [ ] 신규 추가 페어 단위 테스트 100% 통과
- [ ] 검색 진입점(`searchByCategory`)에서 사전 적용 + 0건 폴백 동작
- [ ] `npm run check-all` + `npm run build` 통과
- [ ] PR description에 통계 요약: `{ before: 30, after: N, sources: {...} }`

---

## 부록 A — 식재료 도메인 화이트리스트 시드 (Phase 2-3에 직접 사용)

`data/correction-dict/domain-allowlist.txt` 시드용 약 100개. 운영 시작 시 `tenant_item_master.item_name` 2,875건 + `tenant_category_code` 자동 추출과 합쳐 약 3,000개 화이트리스트 구성.

```
# 채소·과일
배추 무 당근 양파 대파 쪽파 마늘 생강 감자 고구마 오이 호박 가지 파프리카 피망 청양고추 깻잎 상추 시금치 청경채 부추 양배추 브로콜리 콜리플라워 토마토 방울토마토 사과 배 귤 오렌지 레몬 바나나 포도 딸기 블루베리 키위 멜론 수박

# 육류·해산물
삼겹살 목살 갈비 등심 안심 차돌박이 닭가슴살 닭다리 닭날개 오리고기 양고기 새우 오징어 낙지 문어 갈치 고등어 삼치 연어 참치 광어 우럭

# 가공식품
계란 두부 콩나물 숙주 어묵 햄 소시지 베이컨 치즈 우유 버터 요구르트

# 곡류·조미료
쌀 현미 보리 콩 팥 밀가루 빵가루 설탕 소금 간장 된장 고추장 식초 들기름 참기름 올리브유 식용유 후추 깨 깨소금 미림 맛술 케첩 마요네즈 머스타드

# 요리명
김치찌개 된장찌개 부대찌개 비빔밥 떡볶이 잡채 불고기 갈비탕 설렁탕 삼계탕 미역국 콩나물국 라면 칼국수 짜장면 짬뽕 볶음밥 김밥 스파게티 카레

# 단위·도구
근 마리 통 봉지 봉 팩 박스 묶음 단 그램 킬로그램 리터 밀리리터 cc ml g kg
```

---

## 부록 B — 자모 거리 검증 함수 예시 (Phase 2 V1에서 사용)

```typescript
// scripts/correction-dict/util/jamo-distance.ts
import * as Hangul from "hangul-js"; // 또는 es-hangul

/** 두 한글 문자열의 자모 분리 후 Levenshtein 거리 */
export function jamoDistance(a: string, b: string): number {
  const ja = Hangul.disassemble(a).join("");
  const jb = Hangul.disassemble(b).join("");
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

// 사용: jamoDistance("삽겹살", "삼겹살") === 1 (ㅏ→ㅏ, ㅂ→ㅁ 한 음소 차이)
```

---

## 부록 C — `data/correction-dict/README.md` 초안 (Phase 3에서 작성)

```markdown
# Correction Dict — 출처 및 라이선스

## 통계
- 마지막 빌드: 2026-XX-XX
- 총 엔트리: NN개
- core: 30 / extended: NN

## 출처

| 소스 | 라이선스 | 출처 URL | 페어 수 | Attribution 문구 |
|------|----------|----------|---------|------------------|
| core (수동 큐레이션) | freshpick-app 자체 | — | 30 | © FreshPick |
| spellcheck-ko/hunspell-dict-ko | MPL 1.1 / GPL 2.0+ / LGPL 2.1+ + 데이터 CC BY-SA 4.0 | https://github.com/spellcheck-ko/hunspell-dict-ko | (allowlist만 사용) | hunspell-dict-ko 프로젝트 / 국립국어원 |
| GitHub Typo Corpus (Hagiwara & Mita, 2019) | CC BY 4.0 | https://github.com/mhagiwara/github-typo-corpus | NN | Hagiwara, M., & Mita, M. (2019). GitHub Typo Corpus. arXiv:1911.12893 |

## 갱신 이력
- v1.0.0 (2026-XX-XX): 초기 30개 (core)
- v1.1.0 (2026-XX-XX): GitHub Typo Corpus + 운영자 검토 NN개 추가

## 갱신 절차
`docs/correction-dict.md` 참조.
```

---

## 7. 마지막 점검 — 실행 직전 자기검증 5문항

이 프롬프트를 받은 에이전트는 작업 시작 전에 다음 5가지를 답변·확인한 뒤 진행하세요.

1. 현재 `lib/utils/memo-correction-dict.ts` 의 30개 엔트리를 모두 읽었는가? (없다면 읽고 시작)
2. Phase 1을 끝낸 시점에 기존 import 경로 (`@/lib/utils/memo-correction-dict`)가 그대로 동작하는지 확인했는가?
3. 외부 데이터셋의 LICENSE 파일을 다운받아 `_raw/licenses/`에 보존했는가?
4. validated 페어를 `extended.json`에 자동 병합하지 않고, 사람 승인 후에만 병합하는 흐름을 지키고 있는가?
5. core.json은 어떤 Phase에서도 자동으로 변경되지 않는가? (보호되어야 함)

5개 모두 "예"가 되어야 진행하세요. 하나라도 "아니오"면 그 단계에서 멈추고 사용자에게 보고하세요.

---

> **본 프롬프트의 끝.**
> 작업 진행 중 의문이 생기면 임의 결정 대신, PR description의 "질문" 섹션에 기록하고 사용자 확인을 요청하세요. 특히 라이선스 해석, 동음이의어 후보, 신규 source 추가는 반드시 사람 결정이 필요합니다.
