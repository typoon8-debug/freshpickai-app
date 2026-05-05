# PROMPT — FreshPickAI 응용 아키텍처 정립 + RAG 데이터 모델 확장 + 우리들의식탁 BP 7종 PRD/ROADMAP 반영

> **작성일**: 2026-05-05
> **대상 프로젝트**: FreshPickAI (`d:\freshpickai-app`)
> **소스 문서**: `/mnt/project/PRD.md` (FreshPickAI MVP PRD), `/mnt/project/ROADMAP.md` (FreshPickAI 개발 로드맵)
> **참조 분석**: 우리들의식탁 앱 비교 분석 (2026-05-05 채팅 기록)

---

## 0. 이 프롬프트의 사용법

이 프롬프트는 **Claude Code**에 단일 PR 단위로 전달하여 FreshPickAI의 PRD.md와 ROADMAP.md를 갱신하는 Task로 실행시키는 것을 목적으로 작성되었습니다.

> **시작 명령**
>
> > 다음은 FreshPickAI의 PRD/ROADMAP 갱신 명세입니다. 이미 합의된 응용 아키텍처(`섹션 → 카드 → 음식 → 레시피 → item` 5계층 매칭) + 레시피 RAG 데이터 모델 + 우리들의식탁 BP 7종을 PRD.md와 ROADMAP.md에 반영하세요. 코드 구현은 하지 않고 **문서 갱신만** 수행합니다. 기존 F001~F015 기능 정의는 변경 없이 **확장**만 하며, F015의 "AI 자동 채움" 정책과 충돌하지 않게 유지합니다. 갱신 후 두 문서가 서로 일관되도록 ID 참조(F016~F022, Task 037~042)를 동기화하고, `npm run check-all`은 코드 변경이 없으므로 생략 가능하지만 마크다운 lint(있을 경우)는 통과시키세요.

---

## 1. 핵심 합의 사항 (반영 대상)

### 1.1 응용 아키텍처 — 5계층 매칭 구조

**현재 PRD의 한계**: 현재 PRD §🗄️ 데이터 모델은 `card_section → menu_card → card_ingredient → store_item`까지 4계층으로 정의되어 있으나, **레시피(조리 방법) 자체가 독립 엔티티로 분리되어 있지 않습니다**. 결과적으로 다음 시나리오가 표현되지 않습니다:

- 같은 음식(예: "김치찌개")이 여러 카드(엄마손맛·하루한끼·드라마한끼)에서 다른 레시피로 등장
- 레시피가 사용자 노트(BP1)·운영자 검수·AI 자동 보강 대상이 되어야 함
- 하나의 카드에 여러 음식(메인 + 사이드 + 디저트)이 묶일 수 있어야 함

**합의된 5계층 구조**:

```
card_section (탭)            ← F015 (사용자별 탭 구성)
   └─ menu_card (카드)        ← F001/F002 (10종 테마 + 사용자 카드)
       └─ card_dish (음식)    ← 신규: 카드 ↔ 음식 N:M 매핑 테이블
           ├─ dish (음식 마스터) ← 신규: "김치찌개"·"갈비찜" 등 표준 음식 엔티티
           │   └─ dish_recipe (레시피)  ← 신규: 음식별 N개 레시피 (RAG 임베딩 대상)
           │       └─ dish_recipe_step (조리 단계)  ← 신규: 1~N단계 + 타이머·이미지
           └─ display_order (음식 표시 순서)
       └─ card_ingredient (재료) ← 기존 + 확장 (BP3 prep_method·substitutes JSONB 추가)
           └─ store_item_id → v_store_inventory_item (실제 매장 상품)
```

**계층별 책임**:

| 계층 | 책임 | RAG 활용 |
|------|------|----------|
| **card_section** | 사용자별 탭 구성 (공식·커스텀) | 섹션명 임베딩 → AI 자동 채움 매칭 |
| **menu_card** | 10종 테마 + 메타(건강 스코어·예상 가격) | 카드 설명 임베딩 → 채팅 RAG 검색 |
| **card_dish** | 카드 ↔ 음식 N:M 매핑 (한 카드에 여러 음식) | — (관계 테이블) |
| **dish** | 표준 음식 마스터 ("김치찌개"·"갈비찜" 정규화) | 음식명·페르소나 태그 임베딩 |
| **dish_recipe** | 음식별 다중 레시피 (전통식·간소화·비건 등) | **레시피 본문 임베딩 (chunk_type='recipe_full')** |
| **dish_recipe_step** | 조리 단계 (BP2 인터랙티브 UX 입력) | 단계별 텍스트 임베딩 (옵션, v1.x) |
| **card_ingredient** | 재료 + 손질법·계량·대체 (BP3) | 재료명 임베딩 (오타·동의어 매칭) |
| **store_item** | 실제 매장 상품 (재고·가격) | `tenant_item_ai_detail` 보강 대상 |

### 1.2 레시피 RAG 테이블의 의의

**핵심 통찰**: PRD §🗄️에 정의된 `tenant_item_ai_detail`은 **상품(item) 측 RAG**입니다. 이는 다음 한계를 해결하기 위한 인프라입니다:

> "tenant_item_ai_detail은 item의 short_description, item_detail 이미지가 비어있는 경우가 많아 AI RAG 기술을 이용해서 tenant_item_ai_detail을 구성하는 것임."

즉 `tenant_item_master`의 `short_description` 누락·이미지 부재를 AI가 보강해 카드 매칭·검색·추천에 활용하는 **상품 측 데이터 보강 RAG**입니다.

**레시피 측 RAG는 별도 테이블이 필요합니다**:
- `dish_recipe`는 사용자 노트(BP1)·운영자 작성·AI 생성·기존 데이터셋 임포트 등 **다양한 출처**에서 누적
- 출처별 신뢰도(confidence)·검수 상태(status) 관리
- 9 페르소나 매칭(persona_tags) + 식이 제약(diet_tags) 임베딩
- F003 RAG 채팅이 *"비건으로 바꿔줘"* 같은 변형 요청을 받을 때 **레시피 차원**에서 검색해야 정확

따라서 `dish_recipe`에는 `tenant_item_ai_detail`과 **유사한 RAG 컬럼 구조**가 필요합니다. (하단 §3.2 데이터 모델 참조)

### 1.3 우리들의식탁 BP 7종 매핑

이전 분석에서 도출한 BP 7종을 FreshPickAI 기능 ID에 매핑합니다:

| BP | 명칭 | FreshPickAI 기능 ID | 우선순위 |
|----|------|---------------------|---------|
| BP1 | 카드별 사용자 노트 3분류 (팁·후기·질문) + 운영자 답글 | **F016** (신규) | P1 |
| BP2 | 인터랙티브 조리 UX (요약·타이머·북마크·노트보기) | **F017** (신규, F002 확장) | P2 |
| BP3 | 재료 메타 확장 (계량·손질법·대체 재료) | **F018** (신규, card_ingredient 확장) | P1 |
| BP4 | 카드 만들기 위저드 강화 (가이드 키워드·검수 큐) | **F013 확장** (신규 항목 추가) | P1 |
| BP5 | 온보딩 5장 슬라이드 + 핵심 가치 미리보기 | **F019** (신규, F010 확장) | P0 |
| BP6 | 냉장고 비우기 모드 (보유 재료 입력 → 카드 추천) | **F020** (신규, F003 확장) | P2 |
| BP7 | 카드 외부 공유 (카카오톡 OG 미리보기·딥링크) | **F021** (신규, F002 확장) | P1 |

추가로 응용 아키텍처 정립을 위한 신규 기능:

| ID | 기능 | 우선순위 |
|----|------|---------|
| **F022** | 음식 마스터·레시피 RAG 시스템 (`dish` / `dish_recipe` / `dish_recipe_step`) | P0 |

---

## 2. PRD.md 갱신 작업 명세

### 2.1 §🃏 카드메뉴 10종 구성 다음에 신규 섹션 추가

**위치**: 현재 PRD §🃏 (카드메뉴 10종 구성, line 44~64) 직후에 다음 섹션을 삽입하세요.

```markdown
---

## 🏗️ 응용 아키텍처 — 5계층 매칭 구조

FreshPickAI의 핵심 도메인은 **섹션 → 카드 → 음식 → 레시피 → 재료/상품**의 5계층으로 매칭됩니다. 이 구조는 다음 시나리오를 모두 표현합니다:

- 같은 음식("김치찌개")이 여러 카드(③엄마손맛·②하루한끼·④드라마한끼)에서 서로 다른 레시피로 등장
- 한 카드에 여러 음식(메인 + 사이드 + 디저트)이 묶이는 한 상 구성
- 레시피별 사용자 노트·운영자 검수·AI 보강이 독립적으로 누적
- F003 RAG 채팅의 "비건으로", "10분 안에" 같은 변형 요청이 레시피 차원에서 검색

### 계층 구조

```
card_section (탭)            ← F015 사용자별 탭 구성
   └─ menu_card (카드)        ← F001/F002 10종 테마 카드
       ├─ card_dish (카드↔음식 N:M)  ← F022 신규
       │   └─ dish (음식 마스터)        ← F022 신규
       │       └─ dish_recipe (레시피)   ← F022 신규 (RAG 임베딩 대상)
       │           └─ dish_recipe_step (조리 단계)  ← F017 BP2 인터랙티브 UX 입력
       └─ card_ingredient (재료)  ← F018 BP3 확장 (prep_method·substitutes)
           └─ store_item_id → v_store_inventory_item (실제 매장 상품)
```

### 두 종류의 RAG 인프라

FreshPickAI는 **두 종류의 RAG 데이터**를 운영합니다. 책임 영역이 다르므로 테이블도 분리됩니다:

| 구분 | 테이블 | 책임 | 보강 대상 |
|------|--------|------|----------|
| **상품 측 RAG** | `tenant_item_ai_detail` | `tenant_item_master`의 `short_description`·이미지가 비어있는 경우 AI가 보강 — 카드 매칭·검색·재고 표시 정확도 향상 | item 정보 |
| **레시피 측 RAG** | `dish_recipe` | 음식별 N개 레시피의 본문·페르소나 태그·식이 태그 임베딩 — F003 채팅 변형 요청에 레시피 차원 매칭 | 조리법 정보 |

### F003 채팅 RAG의 5-tool 동작 시 두 RAG 활용

```
사용자: "비건으로 바꿔줘, 10분 안에"
   ↓
1. searchDishRecipes (dish_recipe 측 RAG) — 비건·간소화 레시피 후보 검색
2. matchCardForRecipe (menu_card) — 후보 레시피를 가진 카드 찾기
3. searchItems (tenant_item_ai_detail 측 RAG) — 카드 재료의 실제 매장 상품 매칭
4. getInventory — 재고 확인
5. addToCart — 사용자 동의 후 장바구니 추가
```
```

### 2.2 §🃏 비식사형 직후, 신규 기능 ID 추가

**위치**: PRD §⚡ 기능 명세 §1. MVP 핵심 기능 직후에 새로운 §1.5 (또는 §2 앞에) 다음을 삽입하세요.

```markdown
### 1.5. 응용 아키텍처 핵심 기능 — F022 (P0)

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|--------------|------------|
| **F022** | 음식 마스터·레시피 RAG 시스템 | `dish` 음식 마스터(정규화) + `dish_recipe` 다중 레시피(전통식·간소화·비건 등) + `dish_recipe_step` 조리 단계. 레시피 본문 1536차원 임베딩으로 F003 채팅의 변형 요청에 레시피 차원 매칭 제공 | F003 RAG 정확도의 데이터 기반, 카드 ↔ 음식 N:M 표현, BP1·BP2 입력 채널 | 카드 상세, AI 채팅 |
```

### 2.3 §⚡ 기능 명세 §2. MVP 필수 지원 기능에 BP 4종 추가

**위치**: 기존 §2. MVP 필수 지원 기능 표(F010~F015) **직후**에 다음 행 추가:

```markdown
| **F016** | 카드 사용자 노트 3분류 (BP1) | 카드별 사용자 노트를 **팁·후기·질문** 3가지 타입으로 작성. 키워드 가이드(맛·난이도·소요시간·만족도 / 재료 응용·불 쎄기·익힘 정도·인분 조절 등) placeholder 제공. 사진 1장 업로드(선택). 운영자 1depth 답글. 도움이 된 팁(helpful_count ≥ 5)은 LLM Judge 통과 시 `dish_recipe.review_note`에 자동 후보 등록 | F003 RAG self-improving loop 입력 채널, 카드 신뢰도 강화 | 카드 상세 |
| **F018** | 재료 메타 확장 (BP3) | `card_ingredient`에 `prep_method`(반달썰기·다지기), `measurement_hint`(1큰술=15mL), `substitutes JSONB`(대체 재료) 추가. F003 *"비건으로 바꿔줘"* 요청 시 substitutes 우선 참조. 사용자 노트의 재료 대체 정보가 `substitutes` 후보로 누적 | 의사결정 정보 밀도 향상, 알러지·식이 제약 대응 | 카드 상세, AI 채팅 |
| **F019** | 온보딩 5장 슬라이드 (BP5) | 로그인 직후 5장 슬라이드 — ① "오늘 뭐 먹지를 30초에" (카드 10종 미리보기) ② "AI가 우리 가족에 맞춰" (F003 데모) ③ "우리가족 보드로 함께 결정" (F011 데모) ④ "키즈 모드로 아이도 참여" (F014 데모) ⑤ "내 페르소나 태그 설정" (기존 온보딩 폼). 모든 단계 [건너뛰기] 명시. 마이페이지 재진입 가능 | 신규 사용자 핵심 가치 전달, 페르소나 태그 수집 보장 | 로그인 |
| **F021** | 카드 외부 공유 (BP7) | 카드 상세에 [카카오톡 공유] 버튼 + 딥링크(`https://freshpickai.com/cards/{card_id}`) + OG 메타(메뉴 이미지·제목·건강 스코어). 비로그인 미리보기 페이지(카드 1개) → 카카오 1초 시작 유도. ⑩홈시네마 페어링 카드의 SNS 인증 가치 | 가족 그룹 외부 입소문 채널, 신규 가입 유입 | 카드 상세 |
```

### 2.4 §⚡ 기능 명세 §3. MVP 이후 기능 — 일부 항목 갱신

**위치**: §3. MVP 이후 기능 (제외) 섹션에서 다음과 같이 갱신:

```markdown
### 3. MVP 이후 기능 (P2 — MVP 직후 확장)

- **F017** 인터랙티브 조리 UX (BP2) — 카드 상세 "이 카드로 요리하기" 진입 후 floating 4-action 바(요약·공유·북마크·노트보기) + 단계별 타이머 PWA 푸시. 30초 결정 원칙 보호를 위해 *"모두 담기"* 후 옵션 진입
- **F020** 냉장고 비우기 모드 (BP6) — F003 채팅에 "있는 재료 입력" 모드 추가. 사용자가 보유 재료 칩 선택 → AI가 매칭 카드 자동 생성. F015 "냉장고 비우기" 가상 섹션 (AI 자동 채움 활용)

### 4. MVP 이후 기능 (제외)

- 마스코트·업적·레벨업 게이미피케이션 시스템
- 정기배송·분할결제
- 음성 입력
- 셰프 밀키트 외부 연동
- OTT 시청 기록 자동 연동
- 전통주 구독 서비스 연동
- 지역 농산물 직거래 연동
- 우리들의식탁 "스타일" 탭 수준 #해시태그 SNS (30초 결정 원칙과 충돌)
- 공동구매 D-day 모델 (새벽배송 + 카드 재료 일괄 담기 트랙과 별도)
```

### 2.5 §📱 메뉴 구조 갱신

**위치**: 기존 §📱 메뉴 구조 다이어그램에서 다음과 같이 갱신:

```markdown
🏠 메인 메뉴 (로그인 후)
├── 🃏 카드메뉴 홈
│   ├── 기능: F001 (공식 10종 + 커스텀 카드섹션 탐색)
│   ├── 기능: F014 (키즈·청소년 탭 필터)
│   └── 기능: F015 (섹션 탭 순서 편집 진입)
├── 🤖 AI 채팅
│   ├── 기능: F003 (9 페르소나 RAG 추천)
│   └── 기능: F020 (냉장고 비우기 모드 — P2)
├── 👨‍👩‍👧‍👦 우리가족 보드
│   ├── 기능: F011 (5개 섹션 + 가족 미션)
│   └── 기능: F014 (아이 별점·선호 반영)
├── 📝 장보기 메모
│   └── 기능: F012 (수기 메모 → 장바구니)
├── ➕ 카드 만들기
│   └── 기능: F013 (커스텀 카드 생성 + BP4 가이드 키워드)
└── 🗂️ 내 섹션 관리
    └── 기능: F015 (카드섹션 생성·편집·순서 변경)

🛒 구매 플로우
├── 📄 카드 상세
│   ├── 기능: F002, F004 (건강·가격 인프라 + 재료 담기)
│   ├── 기능: F016 (사용자 노트 3분류)
│   ├── 기능: F018 (재료 메타 확장)
│   ├── 기능: F021 (카카오톡 공유)
│   └── 기능: F017 (조리 모드 — P2)
├── 🛒 장바구니
│   └── 기능: F004 (담긴 재료 관리)
└── 💳 결제
    └── 기능: F005 (토스페이먼츠 결제)

👤 인증 (비로그인)
├── 로그인 - F010
└── 온보딩 슬라이드 - F019 (BP5)
```

### 2.6 §📄 페이지별 상세 기능 — 갱신 대상 페이지

**위치**: 기존 §📄 페이지별 상세 기능에서 다음 페이지 표를 갱신하거나 신규 추가:

#### 6-1. 로그인 페이지 갱신 (F019 추가)

기존 로그인 페이지 표의 *"주요 기능"* 행에 다음 추가:

```markdown
• **온보딩 슬라이드 5장** (F019, BP5) — 카카오/애플 로그인 직후 진입, 카드메뉴 10종·F003·F011·F014 미리보기 + 페르소나 태그 입력. 모든 단계 [건너뛰기] 노출
```

*"다음 이동"* 행 갱신:

```markdown
| **다음 이동** | 성공 → **온보딩 슬라이드 5장 (신규 사용자만)** → 카드메뉴 홈, 실패 → 에러 토스트 |
```

#### 6-2. 카드 상세 페이지 갱신 (F016·F018·F021 추가)

기존 카드 상세 페이지 표의 *"주요 기능"* 행에 다음 추가:

```markdown
• **음식 목록** (F022) — 카드에 묶인 1~N개 음식(메인·사이드·디저트), 각 음식의 대표 레시피 1개 미리보기 + "다른 레시피 보기" 옵션
• **재료 메타** (F018, BP3) — 재료별 손질법(반달썰기 등) 도해, 계량 힌트(1큰술=15mL), 대체 재료 펼치기 (예: "차돌박이 대신 우삼겹")
• **사용자 노트 섹션** (F016, BP1) — 팁·후기·질문 3분류 탭 + 노트 카운트 + 운영자 답글, [내 노트 남기기] CTA
• **카카오톡 공유** (F021, BP7) — [공유] 버튼 → 카카오톡 OG 미리보기(메뉴 이미지·제목·건강 스코어), 딥링크
• **이 카드로 요리하기** (F017, P2) — 모드 진입 시 단계별 타이머·요약·북마크 4-action 바 (MVP 이후)
```

#### 6-3. 카드 만들기 페이지 갱신 (BP4 강화)

*"주요 기능"* 행에 다음 추가:

```markdown
• **가이드 키워드 placeholder** (BP4) — 메뉴명 입력 시 "○○네 김치찌개" 자동 제안, 재료 입력 시 손질법(prep_method)·대체 재료(substitutes) 함께 입력 가능
• **검수 큐** (BP4) — 부적합 카드는 본인에게만 노출. 운영자 승인 시 공식 카드섹션에 노출 가능 후보 진입
```

### 2.7 §🗄️ 데이터 모델 — 신규 테이블 4종 추가

**위치**: 기존 PRD §🗄️ 데이터 모델 §card_ingredient 직후에 다음 신규 테이블 4종 추가:

```markdown
### dish (음식 마스터 — F022)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| dish_id | 고유 식별자 | UUID |
| dish_name | 표준 음식명 (예: "김치찌개", "갈비찜") | TEXT UNIQUE |
| category | 음식 카테고리 (한식·중식·양식·디저트·음료 등) | TEXT |
| persona_tags | 적합 페르소나 태그 배열 | TEXT[] |
| diet_tags | 식이 태그 (vegetarian·vegan·low_sodium 등) | TEXT[] |
| embedding | 음식명 + 카테고리 임베딩 (1536차원) | vector(1536) |
| created_at | 생성 시각 | TIMESTAMPTZ |

> 정규화된 음식 마스터 — 같은 "김치찌개"를 여러 카드가 참조해도 단일 엔티티로 관리. 페르소나·식이 태그로 F003 RAG 1차 필터링.

### card_dish (카드 ↔ 음식 N:M 매핑 — F022)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| card_dish_id | 고유 식별자 | UUID |
| card_id | 소속 카드 | → menu_card.card_id |
| dish_id | 묶인 음식 | → dish.dish_id |
| role | 음식 역할 (main·side·dessert·drink) | TEXT |
| display_order | 카드 내 음식 표시 순서 | INT |

> 한 카드(예: ⑥제철한상)에 메인 + 사이드 2종 + 디저트가 묶일 때 사용.

### dish_recipe (레시피 RAG — F022)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| recipe_id | 고유 식별자 | UUID |
| dish_id | 음식 | → dish.dish_id |
| variant_name | 레시피 변형명 (예: "전통식", "간소화 10분", "비건") | TEXT |
| description | 레시피 본문 텍스트 (500~2000자) | TEXT |
| servings | 기본 인분 | INT |
| estimated_minutes | 예상 조리 시간 | INT |
| difficulty | 난이도 (beginner·intermediate·advanced) | TEXT |
| persona_tags | 적합 페르소나 태그 | TEXT[] |
| diet_tags | 식이 태그 | TEXT[] |
| embedding | 본문 텍스트 임베딩 (1536차원, HNSW cosine) | vector(1536) |
| source | 출처 (curated·user_note·llm_generated·imported) | TEXT |
| confidence | 신뢰도 (0.0~1.0) | NUMERIC |
| status | ACTIVE·STALE·REVIEW_NEEDED·REJECTED | TEXT |
| review_note | 운영자 검토 메모 (BP1 자기보강 루프 입력) | TEXT NULL |
| created_by | 작성자 (사용자 노트 출처일 때) | UUID NULL → customer.customer_id |
| created_at | 생성 시각 | TIMESTAMPTZ |

> **레시피 측 RAG의 핵심 테이블**. 같은 음식에 N개 레시피 (전통식·간소화·비건 등) 보유. F003 RAG가 *"비건으로 바꿔줘"* 요청을 받으면 `diet_tags @> ARRAY['vegan']` + 임베딩 코사인 유사도로 검색. BP1 사용자 노트의 도움이 된 팁이 LLM Judge 통과 시 `source='user_note'` + `status='REVIEW_NEEDED'`로 자동 등록.

### dish_recipe_step (레시피 조리 단계 — F022, BP2 입력)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| step_id | 고유 식별자 | UUID |
| recipe_id | 소속 레시피 | → dish_recipe.recipe_id |
| step_index | 단계 순서 (1부터 시작) | INT |
| title | 단계 제목 (예: "재료 손질") | TEXT |
| content | 단계 본문 | TEXT |
| timer_seconds | 타이머 시간 (NULL이면 타이머 없음) | INT NULL |
| image_url | 단계 이미지 URL | TEXT NULL |

> F017 인터랙티브 조리 UX(BP2)의 입력 데이터. timer_seconds가 있으면 floating 타이머 + PWA 푸시 알림.
```

### 2.8 §🗄️ 데이터 모델 — 기존 테이블 확장

**위치**: 기존 §card_ingredient 테이블 정의에 다음 컬럼 3개 추가 (BP3·F018):

```markdown
### card_ingredient (카드 재료 목록) — F018 BP3 확장 컬럼 추가
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| ingredient_id | 고유 식별자 | UUID |
| card_id | 소속 메뉴 카드 | → menu_card.card_id |
| dish_id | (옵션) 특정 음식의 재료 | NULL → dish.dish_id |
| item_name | 재료명 | TEXT |
| qty | 수량 | NUMERIC |
| unit | 단위 (g·개·팩 등) | TEXT |
| store_item_id | 매핑된 매장 상품 | → v_store_inventory_item |
| **prep_method** | **재료 손질법 (예: "반달썰기"·"다지기"·"채썰기") — F018 BP3 신규** | **TEXT NULL** |
| **measurement_hint** | **계량 힌트 (예: "1큰술=15mL") — F018 BP3 신규** | **TEXT NULL** |
| **substitutes** | **대체 재료 JSON 배열 (예: [{"name":"우삼겹","note":"더 부드러움"}]) — F018 BP3 신규** | **JSONB NULL** |
```

### 2.9 §🗄️ 데이터 모델 — 사용자 노트 신규 테이블 (F016·BP1)

**위치**: §family_vote 테이블 직후에 다음 신규 테이블 추가:

```markdown
### card_note (카드 사용자 노트 — F016, BP1)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| note_id | 고유 식별자 | UUID |
| card_id | 대상 카드 | → menu_card.card_id |
| customer_id | 작성자 | → customer.customer_id |
| note_type | 노트 유형 (tip·review·question) | TEXT |
| keyword_tags | 선택 키워드 (예: ['맛','난이도'] / ['재료응용','불쎄기']) | TEXT[] |
| content | 노트 본문 | TEXT |
| photo_url | 첨부 사진 (선택, 1장) | TEXT NULL |
| helpful_count | "도움이 되었어요" 수 | INT DEFAULT 0 |
| parent_note_id | 운영자 답글일 때 부모 노트 (1depth) | NULL → card_note.note_id |
| is_admin_reply | 운영자 답글 여부 | BOOLEAN DEFAULT FALSE |
| ai_consent | AI 학습 활용 동의 (사용자 체크) | BOOLEAN DEFAULT FALSE |
| created_at | 생성 시각 | TIMESTAMPTZ |

> **자기보강 루프**: `note_type='tip'` AND `helpful_count >= 5` AND `ai_consent=true` AND LLM Judge ≥ 4/5 → `dish_recipe`에 `source='user_note'`·`status='REVIEW_NEEDED'`로 자동 후보 등록. 운영자 검토 후 ACTIVE 승격.
```

### 2.10 §🗄️ 데이터 모델 — F015 ai_persona_tags 정책 보강

**위치**: 기존 §card_section 테이블 설명 직후에 다음 노트 추가:

```markdown
> **F015 AI 자동 채움과 F022 레시피 RAG의 관계**: `ai_auto_fill=true`일 때 시스템은 `section_name` + `ai_persona_tags`를 임베딩 → `dish_recipe.embedding` 코사인 유사도 검색 → 매칭 레시피의 `dish_id` 추출 → 해당 dish가 포함된 카드 후보 추출 → 사용자 페르소나 매칭 점수로 정렬 후 상위 N개를 `card_section_item`에 자동 추가. **공식 10종 카드섹션의 AI 자동 채움이 OFF로 설정된 경우, 시스템은 해당 사용자의 `card_section_item`에 사전 정의된 공식 카드만 노출**합니다 (정책 충돌 방지).
```

---

## 3. ROADMAP.md 갱신 작업 명세

### 3.1 §개요 §핵심 기능 (PRD F001 ~ F015) 표 갱신

**위치**: ROADMAP §개요 §핵심 기능 표를 다음과 같이 확장 (F016~F022 추가):

```markdown
### 핵심 기능 (PRD F001 ~ F022)

| ID | 기능 | 우선순위 |
|----|------|---------|
| F001 | 10종 카드메뉴 시스템 (식사형 7 + 비식사형 3) | P0 |
| F002 | 카드 상세 + 건강·가격 인프라 | P0 |
| F003 | AI 페르소나 채팅 추천 (RAG, 9 페르소나) | P0 |
| F004 | 재료 장바구니 일괄 담기 | P0 |
| F005 | 결제 (토스페이먼츠 — 카카오/네이버/카드/계좌) | P0 |
| F010 | 기본 인증 (카카오·애플 소셜 로그인) | P0 |
| F011 | 우리가족 보드 (5개 섹션 + Realtime) | P1 |
| F012 | 장보기 메모 (자연어 4-step 파싱) | P1 |
| F013 | 카드 만들기 (4단계 위저드 + BP4 가이드 키워드) | P1 |
| F014 | 키즈·청소년 모드 | P1 |
| F015 | 카드섹션 커스터마이징 (드래그앤드롭) | P1 |
| **F016** | **카드 사용자 노트 3분류 (BP1)** | **P1** |
| **F017** | **인터랙티브 조리 UX (BP2)** | **P2** |
| **F018** | **재료 메타 확장 (BP3)** | **P1** |
| **F019** | **온보딩 5장 슬라이드 (BP5)** | **P0** |
| **F020** | **냉장고 비우기 모드 (BP6)** | **P2** |
| **F021** | **카드 외부 공유 (BP7)** | **P1** |
| **F022** | **음식 마스터·레시피 RAG 시스템** | **P0** |
```

### 3.2 §스프린트 계획 연계표 갱신

**위치**: ROADMAP §스프린트 계획 연계표 직후에 다음 메모 추가:

```markdown
> **신규 기능 스프린트 배치**:
> - **Sprint 0~1**: F019 (온보딩 슬라이드) — Phase 1 로그인 UI에 통합
> - **Sprint 2~3**: F022 (음식·레시피 RAG) — Task 016 DB 스키마 + Phase 3 RAG 인프라에 통합
> - **Sprint 4**: F016 (사용자 노트) + F018 (재료 메타) + F021 (카카오톡 공유) — Phase 3 후반
> - **Sprint 5+ (출시 후)**: F017 (인터랙티브 조리 UX), F020 (냉장고 비우기) — P2 확장
```

### 3.3 §Phase 0 §Task 002 공통 타입에 신규 도메인 타입 추가

**위치**: §Task 002 §구현 항목의 첫 번째 체크박스(*"TypeScript 도메인 타입 정의"*)에 다음 타입 추가:

```markdown
- [ ] **TypeScript 도메인 타입 정의** (`src/lib/types.ts`): `User`, `Card`, `Dish`, `Ingredient`, `CartItem`, `ChatMessage`, `FamilyMember`, `Vote`, `KidsPick`, `Memo`, `Order`, `CardSection`, `CustomerPreference`, **`DishRecipe`, `DishRecipeStep`, `CardDish`, `CardNote`, `IngredientSubstitute`** 타입
```

### 3.4 §Phase 1 §Task 006 (로그인 + 온보딩 UI 구현) 갱신 — F019 BP5 반영

**위치**: §Task 006 §구현 항목의 *"온보딩 폼"* 항목을 다음과 같이 갱신:

```markdown
- [ ] **온보딩 슬라이드 컴포넌트** (`src/components/auth/OnboardingCarousel.tsx`, F019 BP5 신규) — 5장 슬라이드: ① 카드메뉴 10종 미리보기 ② F003 9 페르소나 데모 ③ F011 가족 투표 데모 ④ F014 키즈 모드 데모 ⑤ 페르소나 태그 입력 폼. 모든 단계 [건너뛰기] CTA 노출. 마지막 슬라이드만 [시작하기] primary, 나머지는 secondary
- [ ] **OnboardingForm 컴포넌트** (`src/components/auth/OnboardingForm.tsx`) — 5번째 슬라이드 내부에 통합: 가구 인원 선택 (1~6+인), 식사 패턴 태그 선택, 알러지 태그 입력
- [ ] **온보딩 진입 가드** — `customer_preference.onboarding_completed_at IS NULL`이면 카드메뉴 홈 진입 시 자동 리디렉션. 마이페이지 "온보딩 다시 보기" 메뉴로 재진입 가능
- [ ] **DB 스키마**: `customer_preference`에 `onboarding_completed_at TIMESTAMPTZ NULL`, `onboarding_skipped_at TIMESTAMPTZ NULL` 컬럼 추가
```

**완료 기준 갱신**:
```markdown
**완료 기준**: 로그인 버튼 클릭 → 5장 슬라이드 → 페르소나 태그 입력 → 카드메뉴 홈 리다이렉트 플로우 확인 (더미 인증). 모든 슬라이드 [건너뛰기] 동작 검증
```

### 3.5 §Phase 1 §Task 008 (카드 상세 UI 구현) 갱신 — F016·F018·F021 반영

**위치**: §Task 008 §구현 항목 마지막에 다음 추가:

```markdown
- [ ] **DishList 컴포넌트** (`src/components/detail/DishList.tsx`, F022 신규) — 카드에 묶인 N개 음식 표시 (main → side → dessert 순), 각 음식의 대표 레시피 1개 미리보기 + "다른 레시피 보기" 펼치기
- [ ] **IngredientMetaBlock 컴포넌트** (`src/components/detail/IngredientMetaBlock.tsx`, F018 BP3 신규) — 재료별 `prep_method`·`measurement_hint`·`substitutes` 펼치기. 손질법 도해 이미지(있으면), 계량 힌트 toast, 대체 재료 칩 목록
- [ ] **CardNoteSection 컴포넌트** (`src/components/detail/CardNoteSection.tsx`, F016 BP1 신규) — 팁·후기·질문 3분류 탭 + 노트 카운트 + 운영자 답글 인용 박스 + [내 노트 남기기] CTA
- [ ] **NoteWriteDrawer 컴포넌트** (`src/components/detail/NoteWriteDrawer.tsx`, F016 BP1 신규) — vaul Drawer, 3-탭 라디오(팁/후기/질문 — 기본 후기), 키워드 가이드 placeholder 분기, 사진 1장 업로드(선택), AI 학습 동의 체크박스(선택)
- [ ] **ShareButton 컴포넌트** (`src/components/detail/ShareButton.tsx`, F021 BP7 신규) — 카카오톡 SDK 또는 Web Share API. OG 메타 라우트(`src/app/cards/[id]/opengraph-image.tsx`)에서 메뉴 이미지·제목·건강 스코어 동적 생성. 비로그인 사용자도 카드 1개 미리보기 가능
- [ ] **CookModeButton 컴포넌트** (`src/components/detail/CookModeButton.tsx`, F017 P2 자리 표시) — "이 카드로 요리하기" 버튼. MVP 이후 활성화
```

**완료 기준 갱신**:
```markdown
**완료 기준**: 카드 flip 애니메이션 동작, "모두 담기" 클릭 → 장바구니 아이템 추가 확인, 음식 목록·재료 메타·사용자 노트 섹션 렌더링, 카카오톡 공유 OG 미리보기 검증
```

### 3.6 §Phase 2 §Task 016 (Supabase DB 스키마) 갱신 — F022 RAG 테이블 추가

**위치**: §Task 016 §구현 항목 첫 번째 체크박스 직후에 다음 추가:

```markdown
- [ ] **음식 마스터·레시피 RAG 테이블 마이그레이션** (F022 신규): `dish` (1536차원 임베딩 + persona_tags + diet_tags), `card_dish` (N:M 매핑), `dish_recipe` (variant_name·description·embedding·source·confidence·status·review_note), `dish_recipe_step` (step_index·timer_seconds·image_url) 테이블 생성
- [ ] **사용자 노트 테이블** (F016 BP1 신규): `card_note` (note_type·keyword_tags·content·photo_url·helpful_count·parent_note_id·is_admin_reply·ai_consent) 테이블 생성
- [ ] **card_ingredient 컬럼 확장** (F018 BP3): `prep_method TEXT NULL`, `measurement_hint TEXT NULL`, `substitutes JSONB NULL`, `dish_id UUID NULL` 컬럼 추가
- [ ] **customer_preference 컬럼 확장** (F019 BP5): `onboarding_completed_at TIMESTAMPTZ NULL`, `onboarding_skipped_at TIMESTAMPTZ NULL` 컬럼 추가
- [ ] **dish_recipe HNSW 인덱스**: `dish_recipe.embedding` cosine HNSW 인덱스 (목표 200ms 이하 검색)
- [ ] **RLS 정책 추가**: `card_note`는 작성자 + 같은 가족 그룹원 읽기 가능, `dish_recipe`는 ACTIVE만 일반 사용자 읽기 가능, REVIEW_NEEDED는 작성자 + 운영자만
```

### 3.7 §Phase 2 §Task 018 (10종 카드 시드) 갱신 — F022 음식 시드 추가

**위치**: §Task 018 §구현 항목의 *"10종 카드 시드 데이터"* 직후에 다음 추가:

```markdown
- [ ] **음식 마스터 시드** (`src/scripts/seed-dishes.ts`, F022 신규): 10종 카드테마 × 평균 5개 음식 = 약 50개 음식 시드. 각 음식에 1~3개 레시피 변형(전통식·간소화·비건). `dish.embedding`·`dish_recipe.embedding` 백필 스크립트 (`src/scripts/backfill-recipe-embeddings.ts`)
- [ ] **card_dish 매핑 시드**: 각 공식 카드에 1~4개 음식 매핑 (예: ⑥제철한상 = 메인 1 + 사이드 2 + 디저트 1)
- [ ] **dish_recipe_step 시드**: 주요 음식 약 30개에 평균 4단계 = 약 120개 단계 시드. `timer_seconds` 메타 포함 (BP2 F017 v1.x 활성화 시 사용)
```

### 3.8 §Phase 2 §Task 020 (카드 상세 + 건강·가격 인프라) 갱신 — F018 BP3 반영

**위치**: §Task 020 §구현 항목에 다음 추가:

```markdown
- [ ] **재료 메타 Server Action** (`src/lib/actions/cards/ingredient-meta.ts`, F018 BP3 신규): `getIngredientMeta(cardId)` — `card_ingredient.prep_method/measurement_hint/substitutes` 반환. 사용자 노트(F016)에서 누적된 substitutes 후보를 운영자 검수 후 자동 병합
- [ ] **카드-음식 통합 조회**: `getCardDetail(id)` 확장 — `card_dish` JOIN `dish` JOIN `dish_recipe` (status='ACTIVE' 1차) → 카드 + 음식 목록 + 대표 레시피 통합 반환
```

### 3.9 §Phase 3 §Task 025 (AI 채팅 + addToMemo Tool) 갱신 — F022 레시피 RAG 활용

**위치**: §Task 025 §구현 항목의 *"AI 채팅 Route Handler"* 항목 갱신:

```markdown
- [ ] **AI 채팅 Route Handler** (`src/app/api/ai/chat/route.ts`): Vercel AI SDK `streamText` 호출, `anthropic('claude-sonnet-4-6')` 모델, **9 페르소나 컨텍스트 + dish_recipe RAG 1차 매칭 (variant_name·diet_tags 우선) + tenant_item_ai_detail 2차 매칭 (재료 → 매장 상품)** 주입, SSE 스트리밍 응답
```

### 3.10 §Phase 3 §Task 028 (ToolLoopAgent 5 Tools) 갱신 — searchDishRecipes 도구 추가

**위치**: §Task 028 §구현 항목의 *"searchItems Tool"* 직전에 다음 도구 추가:

```markdown
- [ ] **searchDishRecipes Tool** (`src/lib/ai/tools/search-dish-recipes.ts`, F022 신규): pgvector 유사도 검색, `{ query: string, dietTags: string[], personaTags: string[], limit: number }` → `dish_recipe` ACTIVE 매칭 N개 반환. F003 *"비건으로 바꿔줘"* 같은 변형 요청의 1차 매칭 도구. **searchItems 직전에 호출되는 새로운 Tool**로 추가됨 (도구 개수: 5 → 6)
```

> **주의**: PRD §F003에 *"5-tool ToolLoopAgent"*로 명시되어 있으므로, F022 도입으로 도구가 6개가 되는 점을 PRD §F003에도 *"6-tool ToolLoopAgent (searchDishRecipes 추가)"*로 갱신 필요. 또는 기존 5-tool의 `searchItems`를 `searchItems + searchDishRecipes` 통합 도구로 재설계 (선호: 후자 — 의존성 단순화).

### 3.11 §Phase 3 §Task 030 (우리가족 보드 실시간) 직후에 신규 Task 4종 추가

**위치**: §Task 030 직후에 다음 신규 Task 4종 삽입:

```markdown
#### Task 037: 카드 사용자 노트 3분류 시스템 구현 (F016 BP1)

**목적**: 카드별 팁·후기·질문 3분류 노트 + 운영자 답글 + RAG self-improving 입력 채널 구축

**구현 항목**:

- [ ] **노트 CRUD Server Actions** (`src/lib/actions/notes/`): `createNote()`, `listNotes(cardId, type?)`, `markHelpful(noteId)`, `replyAsAdmin(parentNoteId, content)` (운영자 권한 체크)
- [ ] **NoteList 컴포넌트** (`src/components/detail/NoteList.tsx`): 팁·후기·질문 필터 + 도움순/최신순 정렬, 운영자 답글 들여쓰기 인용 박스
- [ ] **자기보강 루프 트리거** (`src/lib/actions/notes/self-improve.ts`): `helpful_count >= 5` AND `ai_consent=true` 노트 감지 → Claude Haiku 4.5 LLM Judge 사실성 평가 → ≥ 4/5 통과 시 `dish_recipe`에 `source='user_note'`·`status='REVIEW_NEEDED'` UPSERT
- [ ] **manager-app 노트 답글 큐** (선택): 운영자 검수 큐 화면 (Phase 4 manager-app 별도 트랙)

**테스트 시나리오**:
```
- Playwright: 카드 상세 → "내 노트 남기기" → 팁 작성 → 노트 목록 즉시 표시
- Playwright: 운영자 권한으로 질문 노트 답글 작성 → 인용 박스 표시
- 단위 테스트: helpful_count=5 도달 → self-improve 트리거 → dish_recipe REVIEW_NEEDED 등록
```

**완료 기준**: 3분류 노트 작성·조회·답글 동작, 자기보강 루프 트리거 검증

---

#### Task 038: 재료 메타 확장 구현 (F018 BP3)

**목적**: 재료별 손질법·계량 힌트·대체 재료 정보 제공 + F003 RAG 변형 요청 정확도 강화

**구현 항목**:

- [ ] **DB 마이그레이션 적용**: Task 016에서 정의한 `card_ingredient` 컬럼 3종 (`prep_method`, `measurement_hint`, `substitutes`) 마이그레이션 실행
- [ ] **재료 메타 시드** (`src/scripts/seed-ingredient-meta.ts`): 주요 재료 약 100종에 손질법·계량 힌트·대체 재료 시드 (예: 애호박 → 반달썰기 / 1큰술=15mL / 호박)
- [ ] **IngredientMetaBlock 컴포넌트** 완성 (Task 008 자리 표시 → 실제 데이터 연결)
- [ ] **F003 substitutes 우선 참조** (`src/lib/ai/tools/search-dish-recipes.ts`): 사용자 알러지·식이 태그 매칭 시 `substitutes` JSONB에서 대체 재료 자동 제안
- [ ] **사용자 노트 → substitutes 자동 병합 큐**: BP1의 "차돌박이 대신 우삼겹" 같은 노트가 `helpful_count ≥ 10` 도달 시 운영자 검수 큐 등록 → 승인 시 `card_ingredient.substitutes`에 자동 추가

**테스트 시나리오**:
```
- Playwright: 카드 상세 → 재료 펼치기 → 손질법·계량·대체 재료 표시
- Playwright: F003 채팅 "비건으로" → substitutes 기반 대체 추천 카드 반환
```

**완료 기준**: 재료 메타 시드 100종 적재, F003 substitutes 활용 추천 동작

---

#### Task 039: 카드 외부 공유 + OG 미리보기 구현 (F021 BP7)

**목적**: 카드 카카오톡 공유 + 비로그인 미리보기 → 신규 가입 유입 채널 구축

**구현 항목**:

- [ ] **카카오 SDK 통합** (`src/lib/share/kakao.ts`): 카카오 JavaScript SDK 동적 로드, `Kakao.Share.sendCustom` 호출. 백업: Web Share API
- [ ] **OG 메타 동적 생성 라우트** (`src/app/cards/[id]/opengraph-image.tsx`): Next.js `ImageResponse` 활용, 메뉴 이미지 + 제목 + 건강 스코어 + 브랜드 워터마크
- [ ] **비로그인 카드 미리보기 페이지** (`src/app/cards/[id]/preview/page.tsx`): 카드 1개 정보 표시 + "FreshPickAI 시작하기" CTA → F010 카카오 1초 시작 유도. RLS 우회 (특정 카드만 공개)
- [ ] **공유 추적 이벤트** (PostHog `card_shared`): 카드 ID, 공유 채널(kakao·webshare), 신규 가입 전환 측정
- [ ] **ShareButton 컴포넌트** 완성 (Task 008 자리 표시 → 실 동작)

**테스트 시나리오**:
```
- Playwright: 카드 상세 → 공유 버튼 → 카카오톡 미리보기 표시 (모킹)
- 수동 검증: 실제 카카오톡 앱에서 OG 미리보기 (이미지·제목·건강 스코어) 정상 노출
- Playwright: 비로그인 → 공유 링크 → 카드 미리보기 → 카카오 1초 시작 진입
```

**완료 기준**: 카카오톡 공유 + OG 미리보기 동작, 비로그인 미리보기 → 가입 전환 측정

---

#### Task 040: 카드 만들기 위저드 강화 (F013 + BP4)

**목적**: 가이드 키워드 placeholder + 검수 큐로 사용자 카드 품질 보장

**구현 항목**:

- [ ] **가이드 키워드 시스템** (`src/data/wizard-guide-keywords.ts`): 카드테마별 추천 메뉴명 패턴, 재료별 손질법·대체 재료 자동완성
- [ ] **Step3 강화** (`src/components/wizard/steps/Step3Ingredients.tsx`): 재료 입력 시 `prep_method`·`substitutes` 함께 입력 가능한 펼침 영역 (F018 시너지)
- [ ] **카드 검수 상태 컬럼**: `menu_card`에 `review_status TEXT DEFAULT 'private'` 추가 (private·pending·approved·rejected). 사용자 카드는 기본 private (본인에게만 노출)
- [ ] **검수 신청 버튼**: 카드 만들기 완료 후 "공식 카드섹션에 신청" 버튼 → `review_status='pending'`. manager-app 검수 큐(Phase 4 별도 트랙)에서 운영자 승인
- [ ] **AI 학습 동의** (선택): 카드 작성자가 AI 학습 활용에 동의하면 승인된 카드의 레시피가 `dish_recipe`에 `source='user_note'`로 자동 등록

**테스트 시나리오**:
```
- Playwright: 카드 만들기 → 메뉴명 placeholder "○○네 김치찌개" 표시
- Playwright: 재료 입력 → prep_method·substitutes 펼침 영역 표시
- Playwright: 카드 저장 → review_status='private' → 본인 홈에만 노출
```

**완료 기준**: 위저드 가이드 키워드 동작, 검수 신청 → pending 상태 전환

---

#### Task 041: F019 온보딩 슬라이드 백엔드 연동 (BP5)

**목적**: Task 006 UI 자리 표시 → 실제 데이터 + 진입 가드 동작

**구현 항목**:

- [ ] **온보딩 진입 가드 미들웨어**: `src/middleware.ts` 또는 `(main)/layout.tsx`에서 `customer_preference.onboarding_completed_at IS NULL` 체크 → `/auth/onboarding` 리디렉션
- [ ] **마이페이지 "온보딩 다시 보기"**: 마이페이지 메뉴 항목 추가, `onboarding_skipped_at` 무시하고 재진입 가능
- [ ] **온보딩 슬라이드 콘텐츠 데이터**: 슬라이드 5장의 카드 미리보기·페르소나 데모 더미 데이터 (10종 카드 시드와 연결)
- [ ] **신규 사용자 가입 후 슬라이드 → 페르소나 태그 → 카드 홈 흐름** E2E 테스트

**완료 기준**: 신규 사용자 가입 후 자동 슬라이드 진입, [건너뛰기] → `onboarding_skipped_at` 기록 + 마이페이지 재진입 동작

---
```

### 3.12 §Phase 4 §Task 031 (키즈·청소년 모드) 직후에 신규 Task 추가

**위치**: §Task 031 직후에 다음 Task 추가 (P2 — MVP 출시 후 차기 Sprint):

```markdown
#### Task 042 (P2): F017 인터랙티브 조리 UX + F020 냉장고 비우기 모드 (BP2 + BP6)

> **주의**: 이 Task는 P2이므로 MVP 출시 게이트에 포함되지 않습니다. v1.1 차기 Sprint로 분리합니다.

**목적**:
- F017: 카드 상세 → "이 카드로 요리하기" 진입 후 단계별 타이머·요약·북마크 인터랙티브 UX
- F020: F003 채팅에 "냉장고 비우기" 모드 추가 (보유 재료 → 매칭 카드 추천)

**구현 항목 (F017)**:

- [ ] **CookMode 페이지** (`src/app/(main)/cards/[id]/cook/page.tsx`): floating 4-action 바 (요약·공유·북마크·노트보기)
- [ ] **RecipeStepTimer** PWA 푸시 (v0.7 PWA 셸 활용)
- [ ] **북마크 시스템** — `customer_card_bookmark` 신규 테이블 (단계별 북마크)
- [ ] **요약 BottomSheet** — 단계별 텍스트 + 사진 양방향 동기화

**구현 항목 (F020)**:

- [ ] **냉장고 비우기 모드 UI** (`src/components/chat/FridgeMode.tsx`): 보유 재료 칩 입력 + AI 매칭 카드 3개
- [ ] **F003 ToolLoopAgent 확장**: `searchDishRecipes`에 `availableIngredients[]` 파라미터 추가 → ingredient overlap 점수 가중치
- [ ] **F015 가상 섹션 "냉장고 비우기"**: AI 자동 채움 ON 기본값, 보유 재료 칩이 있으면 우선 활성화

**완료 기준**: P2 — v1.1 Sprint에서 검증
```

### 3.13 §출시 후 (P2) — 차기 계획 표 갱신

**위치**: ROADMAP §출시 후 (P2) — 차기 계획 표를 다음과 같이 갱신:

```markdown
## 출시 후 (P2) — 차기 계획

| 기능 | 설명 | 예상 Sprint |
|------|------|------------|
| **F017 인터랙티브 조리 UX (BP2)** | 카드 요리 모드 + 타이머·요약·북마크 + PWA 푸시 | Sprint +1 |
| **F020 냉장고 비우기 모드 (BP6)** | 보유 재료 입력 → AI 매칭 카드 추천 | Sprint +1 |
| FCM 푸시 알림 | 가족 투표·무비나이트·배송 알림 | Sprint +1 |
| OCR 메모 | 카메라로 장보기 메모 촬영 → 자동 파싱 | Sprint +2 |
| 검색 + 필터 고도화 | 전문 검색 UX (자동완성·필터 조합) | Sprint +2 |
| 영양분석 그래프 | 주간 영양 섭취 분석 시각화 | Sprint +2 |
| **dish_recipe 운영자 검수 큐 (manager-app)** | REVIEW_NEEDED 노트 → ACTIVE 승격 워크플로 | Sprint +2 |
| 정기배송 | 주 1회 자동 주문 구독 | Sprint +3 |
| 멀티 매장 비교 | "다른 가게에서 더 싸요" 가격 비교 | Sprint +3 |
| 음성 입력 | 마이크로 장보기 메모 입력 | Sprint +4 |
| OTT 시청 기록 연동 | 넷플릭스 Top10 자동 드라마 카드 생성 | Sprint +4 |
| 게이미피케이션 | 마스코트 레벨업·업적·리더보드 | Sprint +4 |
| 전통주 구독 연동 | 홈시네마 나이트 성인 페어링 확장 | Sprint +5 |
```

### 3.14 §파일 구조 참조 갱신

**위치**: ROADMAP §파일 구조 참조 디렉토리 트리에 다음 파일 추가:

```markdown
│   ├── components/
│   │   ├── ui/                        ← Task 005 (디자인 시스템)
│   │   ├── layout/                    ← Task 004
│   │   ├── auth/                      ← Task 006, 041
│   │   │   ├── OnboardingCarousel.tsx ← F019 BP5 (Task 006)
│   │   │   └── OnboardingForm.tsx
│   │   ├── home/                      ← Task 007
│   │   ├── detail/                    ← Task 008, 037~039
│   │   │   ├── DishList.tsx           ← F022 (Task 008)
│   │   │   ├── IngredientMetaBlock.tsx ← F018 BP3 (Task 008, 038)
│   │   │   ├── CardNoteSection.tsx    ← F016 BP1 (Task 008, 037)
│   │   │   ├── NoteWriteDrawer.tsx    ← F016 BP1 (Task 037)
│   │   │   ├── ShareButton.tsx        ← F021 BP7 (Task 008, 039)
│   │   │   └── CookModeButton.tsx     ← F017 BP2 자리 표시 (Task 008)
│   │   ├── chat/                      ← Task 009, 025, 028
│   │   │   └── FridgeMode.tsx         ← F020 BP6 P2 (Task 042)
│   │   ├── family/                    ← Task 010, 030
│   │   ├── memo/                      ← Task 011, 022
│   │   ├── cart/                      ← Task 012
│   │   ├── checkout/                  ← Task 012
│   │   ├── wizard/                    ← Task 013, 040
│   │   ├── sections/                  ← Task 014, 032
│   │   ├── kids/                      ← Task 015, 031
│   │   └── profile/                   ← Task 024
│   ├── lib/
│   │   ├── supabase/                  ← Task 003
│   │   ├── ai/                        ← Task 024~029
│   │   │   ├── tools/                 ← Task 025, 028
│   │   │   │   ├── search-dish-recipes.ts ← F022 신규 (Task 028)
│   │   │   │   └── ...
│   │   │   ├── persona-context.ts     ← Task 024
│   │   │   ├── embedding.ts           ← Task 027
│   │   │   ├── vector-search.ts       ← Task 027
│   │   │   ├── semantic-cache.ts      ← Task 029
│   │   │   └── prompts.ts             ← Task 024
│   │   ├── actions/                   ← Task 019~023, 030~032, 037~042
│   │   │   ├── notes/                 ← F016 BP1 (Task 037)
│   │   │   │   └── self-improve.ts
│   │   │   └── ...
│   │   ├── share/                     ← F021 BP7 (Task 039)
│   │   │   └── kakao.ts
│   │   ├── payments/                  ← Task 021
│   │   ├── utils/
│   │   │   ├── correction-dict.ts     ← Task 017
│   │   │   └── memo-parser.ts         ← Task 022
│   │   ├── store.ts                   ← Task 002
│   │   ├── types.ts                   ← Task 002 (DishRecipe 등 추가)
│   │   └── api.ts                     ← Task 002
│   ├── hooks/                         ← Task 002, 018~022, 030
│   ├── data/
│   │   ├── correction-dict/           ← Task 017
│   │   ├── wizard-guide-keywords.ts   ← BP4 (Task 040)
│   │   └── mock-cards.ts              ← Task 007
│   └── scripts/
│       ├── seed-cards.ts              ← Task 018
│       ├── seed-dishes.ts             ← F022 (Task 018)
│       ├── seed-ingredient-meta.ts    ← F018 BP3 (Task 038)
│       └── backfill-recipe-embeddings.ts ← F022 (Task 018)
```

---

## 4. 작업 후 정합성 검증 체크리스트

PRD/ROADMAP 갱신 작업 완료 후 다음을 확인하세요:

### 4.1 ID 정합성

- [ ] PRD §⚡ 기능 명세에 F016~F022 모두 정의됨 (이름·설명·관련 페이지·우선순위)
- [ ] ROADMAP §개요 핵심 기능 표와 PRD §⚡ 기능 명세가 동일한 ID·우선순위로 일치
- [ ] 신규 Task 037~042가 ROADMAP에 정의되고 각 Task가 어떤 F-ID를 구현하는지 명시됨
- [ ] 페이지별 상세 기능에서 참조하는 F-ID가 모두 정의된 ID에 존재함

### 4.2 데이터 모델 정합성

- [ ] PRD §🗄️에 신규 테이블 5개(`dish`, `card_dish`, `dish_recipe`, `dish_recipe_step`, `card_note`) 추가됨
- [ ] `card_ingredient` 컬럼 3종 확장 (`prep_method`, `measurement_hint`, `substitutes`) 명시됨
- [ ] `customer_preference` 컬럼 2종 확장 (`onboarding_completed_at`, `onboarding_skipped_at`) 명시됨
- [ ] ROADMAP §Task 016에 위 마이그레이션 모두 포함됨

### 4.3 RAG 인프라 명확성

- [ ] PRD §🏗️ 응용 아키텍처에서 `tenant_item_ai_detail` (상품 측 RAG)와 `dish_recipe` (레시피 측 RAG)의 책임 분리가 명확하게 표현됨
- [ ] F003 ToolLoopAgent의 도구 개수 변경 (5 → 5 통합 또는 6) 정책이 PRD와 ROADMAP에 일관되게 반영됨
- [ ] `dish_recipe.embedding` HNSW 인덱스 생성이 Task 016에 포함됨

### 4.4 의존성 그래프 정합성

다음 의존성을 ROADMAP에 BlockedBy 형태로 명시:

- [ ] Task 037 (F016) BlockedBy Task 016 (DB), Task 008 (UI 자리 표시)
- [ ] Task 038 (F018) BlockedBy Task 016 (DB), Task 020 (카드 상세 API), Task 037 (자기보강 루프 입력)
- [ ] Task 039 (F021) BlockedBy Task 008 (UI), Task 010 (인증 — 비로그인 미리보기 RLS)
- [ ] Task 040 (F013 BP4) BlockedBy Task 023 (카드 만들기 API), Task 037 (검수 큐 패턴 공유)
- [ ] Task 041 (F019) BlockedBy Task 006 (UI), Task 016 (customer_preference 컬럼)
- [ ] Task 042 (F017+F020 P2) BlockedBy Task 008 (UI), Task 028 (ToolLoopAgent), Task 016 (dish_recipe_step)

### 4.5 정책 충돌 검증

- [ ] **F015 AI 자동 채움과 F022 dish_recipe RAG의 매칭 정책**이 PRD §card_section 노트에 명시됨
- [ ] **F003 채팅의 5-tool vs 6-tool** 정책이 PRD §F003과 ROADMAP §Task 028에 일관되게 반영됨
- [ ] **30초 결정 원칙 보호**: F017 인터랙티브 조리 UX는 *"모두 담기"* 후 옵션 진입으로 분리되어 핵심 흐름 방해 안 함
- [ ] **자동 ACTIVE 승격 금지**: BP1 사용자 노트 → `dish_recipe` 자기보강 루프는 항상 `REVIEW_NEEDED` 거침
- [ ] **사용자 동의 가드**: `card_note.ai_consent=true`가 아니면 self-improve 호출 0건

### 4.6 우선순위 정합성

- [ ] P0: F019 (온보딩 — Sprint 1), F022 (음식·레시피 RAG — Sprint 2~3)
- [ ] P1: F016, F018, F021, F013 강화 (Sprint 3~4)
- [ ] P2: F017, F020 (Sprint +1 출시 후)

---

## 5. 실행 직전 자기검증 (8문항)

작업 시작 전에 다음을 답변·확인한 뒤 진행하세요:

1. PRD.md와 ROADMAP.md 두 파일 모두 갱신 가능한 상태인가?
2. 기존 F001~F015 정의는 변경하지 않고 F016~F022만 추가하는가? (기존 흐름 보호)
3. F022 (`dish` / `dish_recipe` / `dish_recipe_step` / `card_dish`) 4개 테이블이 PRD 데이터 모델 섹션에 모두 정의되었는가?
4. `tenant_item_ai_detail` (상품 측 RAG)와 `dish_recipe` (레시피 측 RAG)의 책임 분리가 명확하게 문서에 표현되었는가?
5. F015 AI 자동 채움 정책 (공식 탭 OFF 시 사전 정의 카드만 노출)과 F022 dish_recipe RAG 검색이 충돌하지 않게 명시되었는가?
6. BP 7종이 모두 F-ID에 매핑되었는가? (BP1→F016, BP2→F017, BP3→F018, BP4→F013 강화, BP5→F019, BP6→F020, BP7→F021)
7. P2 기능(F017, F020)이 MVP 출시 게이트에서 명확히 분리되었는가?
8. 자기보강 루프(노트 → dish_recipe REVIEW_NEEDED)와 사용자 동의(`ai_consent`) 가드가 PRD와 ROADMAP에 명시되었는가?

8개 모두 "예"가 되어야 진행하세요. 하나라도 "아니오"면 그 단계에서 멈추고 사용자에게 보고하세요.

---

> **본 프롬프트의 끝.**
>
> 의문이 생기면 임의 결정 대신 PR description "질문" 섹션에 기록하고 사용자 확인을 요청하세요. 특히 다음 항목은 운영자 결정이 필요합니다:
>
> - **F003 도구 개수 정책**: 5-tool 유지(searchItems 통합 모드) vs 6-tool 확장(searchDishRecipes 별도). 권장: 5-tool 유지 + searchItems 내부 분기
> - **F022 시드 데이터 우선순위**: 어느 카드테마부터 음식·레시피 시드 작성할지 (권장: ③엄마손맛·⑤혼웰·⑥제철 P0)
> - **F021 비로그인 미리보기 RLS 정책**: 모든 공식 카드 공개 vs 작성자가 명시 동의한 카드만 공개
> - **manager-app 검수 큐 도입 시점**: BP1 노트 검수 + BP4 카드 검수가 동시에 필요해지는 시점에 manager-app 트랙 분리
