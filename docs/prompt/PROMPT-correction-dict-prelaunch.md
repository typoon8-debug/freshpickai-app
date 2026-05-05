# PROMPT — `CORRECTION_DICT` 한국어 오타 데이터셋 수집·가공·통합 구현 계획 (오픈 전 버전)

> **작성일**: 2026-05-04
> **대상 앱**: freshpick-app (시스템 오픈 전, 기존 `memo-correction-dict.ts`의 30개는 샘플 데이터)
> **연계 기능**: F003 장보기 메모 자연어 4-step 파이프라인, F031 pg_trgm 검색, F032 freshpick 검색 통합, AI장보기 RAG (계획)
> **목적**: GitHub 공개 한국어 오타·맞춤법 데이터셋(JSON / CSV / TXT)에서 식재료·장보기 도메인에 적합한 1:1 보정 페어를 추출·가공하여 처음부터 깨끗한 `CORRECTION_DICT`를 구축한다.

---

## 0. 이 프롬프트의 사용법

이 프롬프트는 **Claude Code (또는 동급의 코딩 에이전트)** 에게 1회 또는 분할로 전달하여 Task로 실행시키는 것을 목적으로 작성되었습니다.

> **시작 명령** (이 한 줄 먼저 보내고 본문을 이어 붙여도 됩니다)
>
> > 다음은 freshpick-app의 오타 보정 사전(CORRECTION_DICT)을 GitHub 공개 데이터셋으로 구축하는 Task 명세입니다. 시스템은 아직 오픈 전이며 기존 30개 엔트리는 샘플입니다 — 따라서 호환 우회·회귀 보호 같은 안전장치 없이 처음부터 새 구조로 만드세요. 단, 라이선스·도메인 필터링·greedy replace 검증은 절대 생략하지 마세요. 각 Phase는 독립 PR로 분리하고 `npm run check-all` + `npm run build`를 통과시킨 후 커밋하세요.

---

## 1. 컨텍스트

### 1.1 현재 상태 (오픈 전)

- `lib/utils/memo-correction-dict.ts`의 30개 엔트리는 **Task N에서 4-step 파이프라인 동작 검증용으로 작성한 샘플**. 운영 가치가 있는 자산이 아니므로 자유롭게 삭제·재구성 가능.
- `applyCorrection()`은 longest-key-first greedy replace 알고리즘 — 이 알고리즘 자체는 그대로 채택. 사전 데이터만 새로 만든다.
- `lib/utils/memo-parser.ts` STEP4가 `applyCorrection()`을 호출하는 유일한 운영 진입점. 이후 검색·RAG에 추가 진입점이 생길 예정.
- DB 마이그레이션·운영 데이터 영향 없음. 이 Task는 **순수 클라이언트 자원**(`data/correction-dict/*.json`) + **빌드 시점 합성**으로 끝낼 수 있다.

### 1.2 새 사전이 만족해야 하는 조건 (오픈 전이라도 동일)

| 조건 | 이유 |
|------|------|
| **C1. 식재료·장보기 도메인 우선** | 마트 상품 검색·메모 파싱이 주 사용처. "은행이→은행 이체" 같은 비식품 보정은 검색을 망친다 |
| **C2. 결정론적(1:1) 매핑만 채택** | greedy replace는 동음이의어가 들어오면 잘못된 치환을 만든다. 문맥·확률 보정은 LLM 위임 |
| **C3. 라이선스 호환성 (오픈 전이라도 필수)** | 출시 후 임베드된 데이터의 라이선스가 문제되면 재구축 비용이 훨씬 크다. 처음부터 깨끗하게 |
| **C4. greedy 안정성** | 신규 페어들끼리 재귀 충돌·순환 발생 시 메모 파싱이 깨진다 |

### 1.3 외부 데이터셋 후보

> 모든 URL·라이선스는 본 작업 시작 시점에 **로컬에서 직접 재확인**하세요. GitHub 리포지토리 비공개 전환·라이선스 변경은 흔합니다.

| # | 소스 | 형태 | 라이선스 | 활용 가능 부분 | 운영 임베드 |
|---|------|------|---------|----------------|-------------|
| 1 | `spellcheck-ko/hunspell-dict-ko` | `.dic` / `.aff` | MPL 1.1 / GPL 2.0+ / LGPL 2.1+ + 데이터 CC BY-SA 4.0 | 표준 표제어 화이트리스트 | ✅ 가능 (allowlist 용도) |
| 2 | `mhagiwara/github-typo-corpus` | `.jsonl.gz` (다국어) | CC BY 4.0 | 한국어 typo edit 페어 | ✅ 가능 (한국어 필터 후) |
| 3 | `lovit/soyspacing` | 학습 샘플 | (LICENSE 직접 확인) | 띄어쓰기 패턴 | △ STEP2 보강용만, dict에는 X |
| 4 | `tjwjdgus12/ChinJiIn` | `optimized_dict.txt` + 빈도 | 명시 없음 | 천지인 인접 오타 | △ 라이선스 확인 후 옵션 |
| 5 | `songys/AwesomeKorean_Data` | 카탈로그 | MIT (카탈로그) | 신규 데이터셋 발굴용 | — (메타) |
| 6 | `soyoung97/Standard_Korean_GEC` (Kor-Lang8 / Kor-Native / Kor-Learner) | parallel txt | 코드 MIT, **데이터셋 비상업 (NIKL)** | 학습자·원어민 오류 페어 | ❌ **운영 임베드 불가**, 평가 골든 셋만 |
| 7 | AI Hub "한국어 학습자 말뭉치" | XML | 비상업 | 학습자 오류 패턴 | ❌ 평가용만 |

**결론**: 운영 사전 임베드는 **#1 (allowlist)** + **#2 (typo pair)** 2개만 사용. #6·#7은 평가 골든 셋(Phase 3)에서만 사용.

### 1.4 라이선스 결정 트리

```
MIT / Apache-2.0 / CC0          → 즉시 임베드 OK
CC BY 4.0                        → 임베드 OK + attribution
CC BY-SA 4.0                     → 임베드 OK + attribution + 파생물 동일 라이선스 공개 (회사 정책 확인)
GPL / LGPL                       → 데이터만이면 보통 OK, 법무 확인
비상업 / Non-commercial           → 운영 임베드 불가, 평가용만
명시 없음                         → All Rights Reserved 간주, 임베드 금지
```

---

## 2. 산출물

```
freshpick-app/
├── lib/
│   └── utils/
│       ├── correction-dict.ts               # 신규 — applyCorrection() 단일 진입점
│       ├── correction-dict.types.ts         # 신규 — DictEntry / DictSource / DictMeta
│       └── correction-dict.test.ts          # 신규 — Vitest 단위 테스트
│
├── data/
│   └── correction-dict/
│       ├── dict.json                        # 단일 통합 사전 (DictEntry[])
│       ├── domain-allowlist.txt             # 식재료·요리 표제어 약 3,000개
│       ├── golden-set.json                  # 평가용 (운영 임베드 X) — 비상업 데이터셋 기반
│       └── README.md                        # 출처·라이선스·attribution
│
├── scripts/
│   └── correction-dict/
│       ├── 01_fetch.ts                      # GitHub raw 다운로드
│       ├── 02_extract_pairs.ts              # 다양한 형태 → 정규화
│       ├── 03_filter_domain.ts              # 식재료 도메인 필터링
│       ├── 04_validate.ts                   # 6단계 검증
│       ├── 05_build.ts                      # 최종 dict.json 빌드
│       ├── 06_review.ts                     # 사람 검토용 markdown 리포트
│       └── README.md
│
└── docs/
    └── correction-dict.md                   # 운영 가이드·갱신 절차
```

기존 `lib/utils/memo-correction-dict.ts`는 **Phase 1에서 삭제**합니다 (샘플 데이터이므로). `lib/utils/memo-parser.ts`의 import 경로를 신규 모듈로 수정합니다.

---

## 3. 단계별 구현 계획 (3 Phase)

### Phase 1 — 새 구조 + ETL 파이프라인 (2일)

**목표**: 샘플 사전을 제거하고, 외부 데이터셋을 가져오는 재실행 가능한 스크립트를 만든다. 이 단계에서 사전 데이터는 비어있어도 된다 (구조와 파이프라인이 목표).

**작업**:

1. **샘플 제거 + 새 모듈 생성**
   - `lib/utils/memo-correction-dict.ts` 삭제
   - `lib/utils/correction-dict.types.ts` 생성:
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
   - `lib/utils/correction-dict.ts` 생성:
     ```typescript
     import dict from "@/data/correction-dict/dict.json";
     import type { DictEntry, DictMeta } from "./correction-dict.types";

     const ENTRIES: DictEntry[] = dict as DictEntry[];
     const SORTED = [...ENTRIES].sort(
       (a, b) => b.wrong.length - a.wrong.length, // longest-first
     );
     const MAP = new Map<string, string>(SORTED.map((e) => [e.wrong, e.correct]));
     const KEYS = SORTED.map((e) => e.wrong);

     export function applyCorrection(text: string): string {
       let result = text;
       for (const key of KEYS) {
         if (result.includes(key)) {
           result = result.split(key).join(MAP.get(key)!);
         }
       }
       return result;
     }

     export function getDictMeta(): DictMeta {
       const bySource = ENTRIES.reduce<Record<string, number>>((acc, e) => {
         acc[e.source] = (acc[e.source] ?? 0) + 1;
         return acc;
       }, {});
       return {
         version: process.env.DICT_VERSION ?? "0.1.0",
         totalEntries: ENTRIES.length,
         bySource: bySource as DictMeta["bySource"],
         lastBuiltAt: new Date().toISOString(),
       };
     }
     ```
   - `lib/utils/memo-parser.ts` STEP4의 import 경로 수정:
     `from "@/lib/utils/memo-correction-dict"` → `from "@/lib/utils/correction-dict"`
   - `data/correction-dict/dict.json`은 빈 배열 `[]`로 시작 (Phase 2에서 채움)

2. **도메인 화이트리스트 시드**
   - `data/correction-dict/domain-allowlist.txt`에 부록 A의 약 100개 시드 단어 작성
   - 빌드 시 `tenant_item_master.item_name` (2,875건) + `tenant_category_code` 자동 추가하는 옵션 스크립트 (`scripts/correction-dict/00_seed_allowlist.ts`)는 작성하되 실행은 시드 데이터 적재 후로 미룸

3. **ETL 스크립트 (5개)**

   `scripts/correction-dict/01_fetch.ts` — GitHub 다운로드
   - 환경 변수: `GITHUB_TOKEN`(rate limit 회피), `OUT_DIR=./scripts/correction-dict/_raw`
   - 다운로드 대상:
     - `https://raw.githubusercontent.com/spellcheck-ko/hunspell-dict-ko/master/data/words.txt` (또는 `ko.dic`)
     - GitHub Typo Corpus 공개 release (현행 URL 직접 확인 후 명시)
   - **각 다운로드와 함께 LICENSE / README도 받아 `_raw/licenses/{source}/`에 보존** (감사 추적용)
   - SHA256을 `_raw/MANIFEST.json`에 기록 (재현성)
   - 실패 시 fail-fast

   `scripts/correction-dict/02_extract_pairs.ts` — 정규화
   - **hunspell-dict-ko**: `.dic` → 표제어만 추출 → `domain-allowlist.txt`에 후보로 합치기 (페어 아님)
   - **GitHub Typo Corpus**: JSONL 라인 읽기 → `lang === "ko"` 필터 → token-level diff → 1~5글자 1:1 페어만 추출
   - 출력: `_raw/extracted/{source}.jsonl` (`{wrong, correct, source, raw_context}`)

   `scripts/correction-dict/03_filter_domain.ts` — 도메인 필터
   - `domain-allowlist.txt` 로딩 (3,000개)
   - `correct` 측이 화이트리스트에 있으면 통과
   - `correct` 길이 1글자 또는 9글자 초과 제외 (조사·어미 오류로 판단)
   - 출력: `_raw/filtered/{source}.jsonl`

   `scripts/correction-dict/04_validate.ts` — **6단계 검증**
   - **V1. 자모 거리**: `es-hangul`로 양쪽 자모 분리 후 Levenshtein 거리 ≤ 2
   - **V2. 충돌 검증**: 신규 `wrong`이 기존 dict의 `correct`와 겹치면 배제
   - **V3. 순환 검증**: A→B와 B→A 동시 존재 시 양쪽 배제
   - **V4. 재귀 안정성**: greedy replace dry-run 1회 적용 = 2회 적용 (불안정 시 배제)
   - **V5. 금칙어**: 욕설·민감 단어 차단
   - **V6. 빈도 임계값**: GitHub Typo Corpus는 같은 페어 N(=5)회 이상만 통과
   - 출력: `_raw/validated/{source}.jsonl` + `_raw/rejected/{source}.jsonl` (사유 포함)

   `scripts/correction-dict/06_review.ts` — 검토용 markdown
   - 컬럼: `wrong | correct | source | confidence_proposal | sample_context`
   - GitHub PR description에 그대로 붙이는 형식

**DoD**:
- [ ] `memo-correction-dict.ts` 삭제, `memo-parser.ts` import 수정 완료
- [ ] `dict.json`이 빈 배열 `[]`인 상태에서 `applyCorrection("test")` === `"test"` 동작
- [ ] `npm run check-all` + `npm run build` 통과
- [ ] 5개 ETL 스크립트 단독 실행 가능 (`tsx scripts/correction-dict/0X_*.ts`)
- [ ] `_raw/`, `_raw/licenses/` 100% 보존, `_raw/`는 `.gitignore`
- [ ] 첫 실행 결과 markdown 리포트 생성 확인

---

### Phase 2 — 외부 데이터셋 적용 + 1차 사전 구축 (1.5일)

**목표**: Phase 1 파이프라인의 validated 페어 + 운영자(개발자) 수동 큐레이션을 합쳐 첫 번째 운영 사전을 만든다.

**작업**:

1. **수동 큐레이션 시드 (`source: "manual"`)** — 약 50~100개를 직접 작성
   - 우선순위:
     - P1. 식재료 받침·자음 오류: `삽겹살→삼겹살`, `깻닢→깻잎`, `오짱어→오징어`
     - P2. 외래어 통일: `토마토케찹→토마토케첩`, `요커트→요거트`, `파마산→파르메산`
     - P3. 단위 오기: `100그람→100그램`, `2키로→2킬로`
     - P4. 음식명: `김치찌게→김치찌개`, `떡뽁이→떡볶이`, `짜장면→자장면` (또는 반대 — 표준어 정책 결정 필요)
   - **표준어 정책 결정 필요 항목**: `짜장면` vs `자장면`, `자장면` 표준어이지만 freshpick-app은 검색 일치를 위해 `자장면→짜장면` 채택 (이 결정을 README.md에 기록)

2. **외부 데이터셋 적용**
   - `01_fetch` → `02_extract` → `03_filter_domain` → `04_validate` → `06_review` 순서로 실행
   - 결과 markdown 리포트를 PR description에 첨부

3. **승인 흐름 (오픈 전이라도 사람 승인 필수)**
   - markdown 리포트의 각 행에 `[O] / [X] / [?]` 마킹
   - 개발자 1명 + 원어민 사용자(또는 사용자 연구원) 1명 sign-off
   - `[O]`만 `dict.json`에 INSERT
   - **이 단계에서 자동 병합 절대 금지** — greedy replace는 한 번 잘못 들어가면 검색 품질이 광범위하게 망가진다

4. **`05_build.ts`** — 최종 빌드
   - `manual` + 승인된 `github-typo` 페어를 합쳐 `data/correction-dict/dict.json` 생성
   - 빌드 직전 V2·V3·V4 재실행 (`manual`과 외부 페어 간 충돌 가능)
   - `data/correction-dict/README.md` 자동 갱신 (출처·통계·attribution)

5. **단위 테스트**
   - 각 추가 페어마다 단위 테스트 1건 (`correction-dict.test.ts`)
   - 메모 파싱 4-step 통합 테스트 5건 (Task N의 골든 셋 형식 그대로 — 단, 샘플 30개와 무관한 신규 케이스로 작성)
   - 검색 진입점 통합 테스트 3건

**DoD**:
- [ ] `dict.json`에 100~250 페어, `manual` 50~100 + `github-typo` 50~150
- [ ] 모든 페어에 source / confidence / domain 메타 존재
- [ ] V2·V3·V4 재검증 통과 (재귀 안정성)
- [ ] 단위 테스트 100% 통과
- [ ] `README.md`에 라이선스 attribution 표 작성
- [ ] PR description에 통계 요약: `{ totalEntries, bySource, manualReviewers }`

---

### Phase 3 — 검색·RAG 통합 + 평가 골든 셋 (1일)

**목표**: 사전을 메모 파싱 외 검색·RAG 진입점에 연결하고, 비상업 데이터셋(Standard_Korean_GEC 등)을 골든 셋으로 활용한 평가 체계를 만든다.

**작업**:

1. **검색 진입점 통합**

   `lib/api/products.ts` `searchByCategory()`:
   ```typescript
   import { applyCorrection } from "@/lib/utils/correction-dict";
   const normalized = applyCorrection(rawKeyword.trim());
   // 이후 normalized를 RPC search_items_by_similarity 또는 ILIKE에 전달
   ```

2. **RAG 임베딩 정규화** (AI장보기 RAG가 도입되면)
   ```typescript
   const normalized = applyCorrection(userPrompt);
   const embedding = await generateEmbedding(normalized);
   ```

3. **0건 폴백**
   ```typescript
   let results = await searchItems(normalized);
   if (results.length === 0 && normalized !== rawKeyword) {
     results = await searchItems(rawKeyword);
   }
   ```

4. **평가 골든 셋 구축 (운영 임베드 없이)**
   - `data/correction-dict/golden-set.json` 생성
   - **출처**: Standard_Korean_GEC (Kor-Native·Kor-Learner) — 비상업 라이선스이므로 운영 dict에는 임베드 X, **테스트에서만 fixture로 사용**
   - 페어 100개를 추출해 `{wrong, expected_correct, source: "korean_gec_eval", license: "non-commercial"}` 형식으로 저장
   - `golden-set.json`은 `.gitignore`에 포함하지 않고 커밋하되, README에 "이 파일은 비상업 평가 fixture이며, 운영 빌드(`dict.json`)에는 절대 포함되지 않음"을 명시
   - 또는 더 안전하게: `golden-set.json`을 `.gitignore`에 두고 별도 클로즈드 저장소·CI secret으로 관리 (회사 정책 결정)

5. **평가 지표**
   - `scripts/correction-dict/eval.ts` — golden-set 100건에 대해:
     - **정확도(accuracy)**: `applyCorrection(wrong) === expected_correct` 비율
     - **회귀 카운트**: 정답 입력에 보정이 적용되어 잘못된 결과가 나온 케이스
     - **무동작 비율**: 정답 입력이 그대로 유지된 비율
   - 목표: 정확도 ≥ 30% (식재료 도메인 한정이라 일반 GEC 골든 셋은 자연히 낮게 나옴), 회귀 0건

6. **Playwright 회귀 케이스 5건**
   - "삽겹살 검색 → 삼겹살 결과" (검색 진입점)
   - "토마토케찹2개 메모 → 토마토케첩 2개로 분리·보정" (메모 파싱)
   - "재고 0인 보정 결과 → 폴백 동작" (0건 폴백)
   - 그 외 신규 페어 2건

**DoD**:
- [ ] 검색 화면 + 메모 파싱 + (있다면) RAG 진입점 모두 `applyCorrection()` 통과
- [ ] 0건 폴백 Playwright 통과
- [ ] golden-set 평가 정확도 ≥ 30%, 회귀 0건
- [ ] `docs/correction-dict.md`에 분기별 갱신 절차 작성

---

## 4. 명시적 거부 / 비목표

이 Task는 다음을 **하지 않습니다**.

- ❌ **모델 기반 자동 교정** (BART·KoBART): RAG 보고서의 별도 Phase에서 다룬다
- ❌ **문맥 기반 동음이의어 분기**: greedy replace의 한계, LLM 위임
- ❌ **띄어쓰기 단독 보정**: STEP2 책임, dict에 추가 금지
- ❌ **외국어→한글 음역**: `tomato → 토마토`는 별도 모듈
- ❌ **존댓말·반말 변환**: 도메인 밖
- ❌ **비상업 라이선스의 운영 임베드**: Standard_Korean_GEC 본문, NIKL 학습자 말뭉치 등은 평가 골든 셋만
- ❌ **manager-app 운영 도구·DB seed**: 오픈 전 단계에서는 정적 JSON으로 충분. 출시 후 트래픽이 쌓인 뒤 별도 Task로

---

## 5. 위험 요소 및 대응

| 위험 | 발생 가능성 | 영향 | 대응 |
|------|-------------|------|------|
| GitHub raw URL 변경·리포 비공개 | 중 | ETL 멈춤 | `_raw/` 마지막 성공 다운로드 보존, MANIFEST에 SHA256 |
| 라이선스 변경 | 낮 | 법적 리스크 | 분기 갱신마다 LICENSE 재확인, 변경 시 해당 source 제거 |
| greedy 재귀 충돌 (manual + 외부 사이) | 중 | 메모 파싱 깨짐 | V2·V3·V4 재실행 (manual 추가 후, 빌드 직전) |
| 한국어 자모 라이브러리 의존성 | 낮 | 빌드 실패 | `es-hangul` (toss, MIT, 활발) 채택. `hangul-js`는 deprecated |
| 외부 데이터셋의 식재료 도메인 적합도 낮음 | 높 | github-typo 통과율 < 10% | 정상. manual 50~100개가 1차 운영 사전의 본체. 외부는 보조 |
| 비상업 데이터셋 누출 | 매우 낮 | 라이선스 위반 | Phase 3 golden-set이 운영 빌드에 포함되지 않음을 빌드 단계에서 assertion으로 강제 |

**빌드 단계 assertion 예시** (`05_build.ts`):
```typescript
const FORBIDDEN_SOURCES = ["korean_gec_eval", "nikl_learner", "ai_hub"];
const violations = entries.filter((e) =>
  FORBIDDEN_SOURCES.includes(e.source as string),
);
if (violations.length > 0) {
  throw new Error(
    `License violation: non-commercial sources in dict.json: ${violations
      .map((v) => v.source)
      .join(", ")}`,
  );
}
```

---

## 6. 수락 기준 요약 (전체 종료 시)

- [ ] `lib/utils/memo-correction-dict.ts` 삭제, 모든 import가 신규 모듈로 교체됨
- [ ] `dict.json`에 100~250 페어, source 분포 명확
- [ ] 모든 페어에 source / confidence / domain 메타
- [ ] `README.md` 라이선스 attribution 표
- [ ] V2·V3·V4 재귀 안정성 검증 통과
- [ ] `applyCorrection()` 100자 입력 < 5ms (서버·브라우저 동일)
- [ ] 검색·메모 파싱 진입점 통합 + 0건 폴백
- [ ] golden-set 평가 정확도 ≥ 30%, 회귀 0건
- [ ] 빌드 단계 비상업 source assertion 통과
- [ ] `npm run check-all` + `npm run build` 통과
- [ ] PR description에 통계 요약

---

## 부록 A — 도메인 화이트리스트 시드 (Phase 1에서 직접 작성)

`data/correction-dict/domain-allowlist.txt` 시드용 약 100개. 시드 데이터 적재 후 `tenant_item_master.item_name` 자동 추출과 합쳐 약 3,000개 구성.

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

## 부록 B — 자모 거리 검증 함수 (Phase 1 V1)

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
- (다른 결정사항 추가)

## 출처

| 소스 | 라이선스 | URL | 페어 수 | Attribution |
|------|---------|-----|---------|-------------|
| manual (수동 큐레이션) | © FreshPick | — | NN | — |
| spellcheck-ko/hunspell-dict-ko | MPL/GPL/LGPL + 데이터 CC BY-SA 4.0 | https://github.com/spellcheck-ko/hunspell-dict-ko | (allowlist만) | hunspell-dict-ko 프로젝트 / 국립국어원 |
| GitHub Typo Corpus (Hagiwara & Mita, 2019) | CC BY 4.0 | https://github.com/mhagiwara/github-typo-corpus | NN | Hagiwara, M., & Mita, M. (2019). GitHub Typo Corpus. arXiv:1911.12893 |

## 평가 골든 셋 (운영 임베드 X)
| 소스 | 라이선스 | 용도 |
|------|---------|------|
| Standard_Korean_GEC | 코드 MIT, 데이터 비상업 (NIKL) | Phase 3 평가 fixture만 |

## 갱신 절차
`docs/correction-dict.md` 참조.
```

---

## 7. 실행 직전 자기검증 4문항

에이전트는 작업 시작 전에 다음 4가지를 답변·확인한 뒤 진행하세요.

1. 외부 데이터셋의 LICENSE 파일을 다운받아 `_raw/licenses/`에 보존했는가?
2. 운영 빌드(`dict.json`)에 비상업 source가 들어가지 않도록 `05_build.ts`에 assertion이 들어 있는가?
3. validated 페어를 `dict.json`에 자동 병합하지 않고, 사람 승인 후에만 병합하는 흐름을 지키고 있는가?
4. 표준어 정책 결정사항(`짜장면` vs `자장면` 등)을 README.md에 기록했는가?

4개 모두 "예"가 되어야 진행하세요. 하나라도 "아니오"면 그 단계에서 멈추고 사용자에게 보고하세요.

---

> **본 프롬프트의 끝.**
> 진행 중 의문이 생기면 임의 결정 대신, PR description의 "질문" 섹션에 기록하고 사용자 확인을 요청하세요. 특히 라이선스 해석, 표준어 정책 결정, 동음이의어 후보, 신규 source 추가는 반드시 사람 결정이 필요합니다.
