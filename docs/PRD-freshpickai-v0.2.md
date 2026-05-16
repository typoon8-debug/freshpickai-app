# FreshPickAI v0.2 PRD 아카이브

> 이 문서는 FreshPickAI MVP(v0.1~v0.2) 완료 기능의 상세 명세 아카이브입니다.
> 현행 개발 계획은 [PRD.md](./PRD.md)를 참조하세요.
>
> **📅 아카이브 기준일**: 2026-05-16
> **✅ 완료 기능**: F001~F005, F010~F013, F015~F019, F020~F022 (총 21개)
> **🔄 미완료**: F014 (키즈·청소년 모드, Task 031)

---

## 🎯 핵심 정보

**목적**: 다양한 테마 카드로 메뉴를 고르고, AI에게 변형을 요청하고, 가족과 투표한 뒤, 재료를 한꺼번에 바로바로 배송 받는 AI 큐레이팅 장보기의 의사결정 마찰을 없앰. 주문 상품 배송은 각 스토어의 배송정책에 따라 다양한 방식으로 제공됨 (sellerbox-app 정책)
**사용자**: 매일 저녁 메뉴를 고민하는 30~45세 주부(P1) 중심의 9개 페르소나 가족 전체 구성원

---

## 🚶 사용자 여정

```
1. 로그인
   ↓ 카카오/애플 소셜 로그인 → 가족 프로필·페르소나 태그 1단계 설정

2. 카드메뉴 홈 (테마 탭)
   ↓ 테마 탭 전환 (셰프스테이블·혼웰·제철한상·홈시네마 등)

   [AI 변형 원할 때]  → AI 채팅 → 9 페르소나 RAG 재추천 → 카드 3개 수신
   [키즈/청소년 탭]  → 간식팩·K-디저트·드라마 카드 필터 표시
   [내 섹션 편집]   → 내 섹션 관리 → 섹션 생성·순서 변경·AI 자동 섹션 설정
   [바로 선택할 때]  →
                       ↓
3. 카드 상세
   ↓ 재료·건강 스코어·가격 비교 확인 + "모두 담기"

   [가족 투표]     → 우리가족 보드 → 5개 섹션 (컬렉션/투표/아이선호/TOP5/미션)
                     → 최다 득표 메뉴 → 카드 상세로 복귀
   [무비나이트]    → 장르 투표 → 홈시네마 나이트 카드 자동 생성
                     → 성인 페어링 + 키즈 페어링 동시 생성
   [바로 담기]     →
                     ↓
4. 장바구니
   ↓ 재료 확인·수량 조정

5. 결제
   ↓ 토스페이먼츠 (카카오페이·네이버페이·카드·계좌이체)

6. 완료 → 배송 예약 확인 (스토어 배송정책에 따라 다양한 방식으로 배송) → 가족 무비나이트 기록 저장
```

---

## 🃏 카드메뉴 10종 구성

### 식사형 (7종)

| # | 카드명 | 핵심 컨셉 | 주요 페르소나 |
|---|-------|---------|------------|
| ① | **셰프스 테이블** | 흑백요리사 등 스타 셰프 시그니처 레시피를 동네 마트 재료로 재현, "My Chef" 등록 시 해당 셰프 어투로 AI 코칭 | P6 프리미엄 미식가, P1 가족 매니저 |
| ② | **하루한끼 One Meal** | 16:8/OMAD 단식 패턴에 맞춰 하루 필요 영양을 한 끼에 설계, 혈당 지수·포만감 지속 시간 표시 | P2 효율 1인식, P4 건강 시니어 |
| ③ | **엄마손맛 가정식** | AI 인터뷰로 가족 고유 레시피를 복원·카드화, 24절기 시리즈, 분가 자녀에게 카드 전수(선물) | P1 가족 매니저, P4 건강 시니어, P3 맞벌이 부부 |
| ④ | **드라마 한 끼** | K-드라마·예능·영화 속 음식을 동네 마트 버전으로 재현, OTT 트렌드 기반 AI 자동 카드 생성 (TMDb API 활용) | P5 가성비 대학생, P8 막내셰프, P9 트렌드 큐레이터 |
| ⑤ | **혼웰(HonWell) 라이프** | 컨디션 입력(피곤/운동 후/피부관리) → 맞춤 원 보울 설계, 저속노화 원칙 기본 적용 | P2 효율 1인식, P7 워킹맘, P5 가성비 대학생 |
| ⑥ | **제철한상** *(Hot Trend)* | 24절기·월별 제철 식재료 중심 한 상, "지금 가장 맛있는 재료" + 제철 가격 비교 표시 | P4 건강 시니어, P1 가족 매니저, P3 맞벌이 부부 |
| ⑦ | **글로벌 원플레이트** *(Hot Trend)* | 멕시코 타코·태국 팟타이·일본 규동 등 세계 각국 원플레이트를 동네 마트 재료로 재현, "12,000원 이하 세계여행" | P2 효율 1인식, P9 트렌드 큐레이터, P6 프리미엄 미식가 |

### 비식사형 (3종)

| # | 카드명 | 핵심 컨셉 | 주요 페르소나 |
|---|-------|---------|------------|
| ⑧ | **K-디저트 랩** | 약과·인절미·호떡 등 전통 디저트 현대 리메이크, 두쫀쿠·약과파이 등 트렌드 홈메이드, 카페 대비 1/3 가격 | P8 막내셰프, P9 트렌드 큐레이터, P5 가성비 대학생 |
| ⑨ | **방과후 간식팩** | 성장기 학년별(초등·중등·고등) 맞춤 건강 간식 조합, 인공감미료 제로, 하루 3,000원 이하, 엄마 설계→아이 별점 반영 | P8 막내셰프(수혜), P1 가족 매니저(설계자), P7 워킹맘 |
| ⑩ | **홈시네마 나이트** | OTT 장르(로맨스/액션/공포/다큐)에 따른 음료·안주·과자 페어링, 성인 버전 + 키즈 무알콜 버전 동시 생성 | P1 가족 매니저, P2 효율 1인식(혼술), P6 프리미엄 미식가 |

---

## 🏗️ 응용 아키텍처 — 5계층 매칭 구조

FreshPickAI의 핵심 도메인은 **섹션 → 카드 → 음식 → 레시피 → 재료/상품**의 5계층으로 매칭됩니다.

```
card_section (탭)              ← F015 사용자별 탭 구성
   └─ menu_card (카드)          ← F001/F002 다양한 테마 카드
       ├─ card_dish (카드↔음식 N:M)  ← F022 신규
       │   └─ dish (음식 마스터)      ← F022 신규
       │       └─ dish_recipe (레시피)  ← F022 신규 (RAG 임베딩 대상)
       │           └─ dish_recipe_step (조리 단계)  ← F017 BP2
       └─ card_ingredient (재료)   ← F018 BP3 확장 (prep_method·substitutes)
           └─ store_item_id → v_store_inventory_item (실제 매장 상품)
```

### 두 종류의 RAG 인프라

| 구분 | 테이블 | 책임 | 보강 대상 |
|------|--------|------|----------|
| **상품 측 RAG** | `tenant_item_ai_detail` | `tenant_item_master`의 `short_description`·이미지가 비어있는 경우 AI가 보강 — 카드 매칭·검색·재고 표시 정확도 향상 | item 정보 |
| **레시피 측 RAG** | `dish_recipe` | 음식별 N개 레시피의 본문·페르소나 태그·식이 태그 임베딩 — F003 채팅 변형 요청에 레시피 차원 매칭 | 조리법 정보 |

### F003 채팅 RAG의 5-tool 동작

```
사용자: "비건으로 바꿔줘, 10분 안에"
   ↓
1. searchItems [레시피 RAG mode] — dish_recipe 비건·간소화 레시피 후보 검색 + 매칭 카드 도출
2. getUserContext — 9 페르소나 컨텍스트 조회
3. searchItems [상품 RAG mode] — tenant_item_ai_detail 카드 재료 → 실제 매장 상품 매칭
4. getInventory — 재고 확인
5. addToCart — 사용자 동의 후 장바구니 추가
```

---

## ⚡ 기능 명세 (완료)

### 1. MVP 핵심 기능 (완료)

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|--------------|------------|
| **F001** | 다양한 테마 카드메뉴 시스템 | 식사형 7종 + 비식사형 3종(MVP 기준, 이후 확장) 카드를 3-Layer 구조로 제공 (카드메뉴 → 건강·가격 인프라 → AI Agent) | 검색 없이 30초 메뉴 결정 — 서비스 핵심 차별점 | 카드메뉴 홈 |
| **F002** | 카드 상세 + 건강·가격 인프라 | 재료·레시피·예상 가격·**건강 스코어**(저속노화·혈당·영양)·**가격 비교**(제철 vs 비수기, 홈메이드 vs 외식) 표시 | 구매 결정 정보 집약, Layer 2 인프라 핵심 | 카드 상세 |
| **F003** | AI 페르소나 채팅 추천 (RAG) | 9 페르소나 컨텍스트 + "비건으로·10분·8천원 이하" 자연어 요청 → pgvector 5-tool ToolLoopAgent (searchItems·getUserContext·getInventory·addToCart·addToMemo — searchItems는 dish_recipe 레시피 RAG 1차 + tenant_item_ai_detail 상품 RAG 2차를 `mode` 파라미터로 내부 분기) → 메뉴 카드 3개 스트리밍 반환 | 서비스 핵심 AI 가치, 취향 변형 자유도, 9 페르소나 맞춤 | AI 채팅 |
| **F004** | 재료 장바구니 담기 | 카드 한 번 클릭으로 전체 재료를 장바구니에 일괄 담기 | 장보기 마찰 제거, 핵심 구매 전환 | 카드 상세, 장바구니 |
| **F005** | 결제 | 토스페이먼츠 기반 카카오페이·네이버페이·카드·계좌이체 | 핵심 수익 전환 | 결제 |

### 1.5. 응용 아키텍처 핵심 기능 — F022 (완료)

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|--------------|------------|
| **F022** | 음식 마스터·레시피 RAG 시스템 | `dish` 음식 마스터(정규화) + `dish_recipe` 다중 레시피(전통식·간소화·비건 등) + `dish_recipe_step` 조리 단계. 레시피 본문 1536차원 임베딩으로 F003 채팅의 변형 요청에 레시피 차원 매칭 제공 | F003 RAG 정확도의 데이터 기반, 카드 ↔ 음식 N:M 표현, BP1·BP2 입력 채널 | 카드 상세, AI 채팅 |

### 2. MVP 필수 지원 기능 (완료)

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|--------------|------------|
| **F010** | 기본 인증 | 카카오·애플 소셜 회원가입·로그인·로그아웃 + 가입 시 페르소나 태그 설정 | 서비스 이용 최소 인증 및 페르소나 분류 | 로그인 |
| **F011** | 우리가족 보드 (5개 섹션) | 컬렉션·투표 보드·아이 선호·TOP5·가족 미션 + 금요 무비나이트 플로우 (장르 투표 → 자동 페어링 카드 생성) | "함께 결정"이 핵심 가치 — 가족 DAU 견인 | 우리가족 보드 |
| **F012** | 장보기 메모 | 수기 메모 자연어 4-step 파싱으로 장바구니 변환 (오타 보정·수량 추출·품목 매칭·카테고리 분류) | 기존 메모 습관 사용자 온보딩 | 장보기 메모 |
| **F013** | 카드 만들기 | 나만의 메뉴 카드 직접 생성 (재료·레시피 입력, 이미지 업로드) | 사용자 참여·콘텐츠 확장 | 카드 만들기 |
| **F015** | 카드섹션 커스터마이징 | 공식 테마 탭과 사용자 생성 탭을 자유롭게 관리. **생성**(섹션명 자유 입력) · **삭제**(공식 탭 포함, 해당 사용자에게만 숨김) · **명칭 변경** · **순서 변경**(드래그앤드롭) · **AI 자동 채움** ON/OFF | 사용자 홈 완전 개인화 — 재방문율·앱 체류 시간 향상 | 카드메뉴 홈, 내 섹션 관리 |
| **F016** | 카드 사용자 노트 3분류 (BP1) | 카드별 사용자 노트를 **팁·후기·질문** 3가지 타입으로 작성. 키워드 가이드 placeholder 제공. 사진 1장 업로드(선택). 운영자 1depth 답글. 도움이 된 팁(helpful_count ≥ 5)은 LLM Judge 통과 시 `dish_recipe.review_note`에 자동 후보 등록 | F003 RAG self-improving loop 입력 채널, 카드 신뢰도 강화 | 카드 상세 |
| **F017** | 인터랙티브 조리 UX (BP2) | 카드 상세 "이 카드로 요리하기" 진입 후 floating 4-action 바(요약·공유·북마크·노트보기) + 단계별 타이머 PWA 푸시 | 조리 완성률 향상, BP2 데이터 수집 채널 | 카드 상세 |
| **F018** | 재료 메타 확장 (BP3) | `card_ingredient`에 `prep_method`(반달썰기·다지기), `measurement_hint`(1큰술=15mL), `substitutes JSONB`(대체 재료) 추가. F003 *"비건으로 바꿔줘"* 요청 시 substitutes 우선 참조 | 의사결정 정보 밀도 향상, 알러지·식이 제약 대응 | 카드 상세, AI 채팅 |
| **F019** | 온보딩 5장 슬라이드 (BP5) | 로그인 직후 5장 슬라이드 — ① 테마 카드 미리보기 ② F003 데모 ③ F011 데모 ④ F014 데모 ⑤ 취향 설정 폼 (가구 인원·웰빙 목표·요리시간·예산). 모든 단계 [건너뛰기] 명시 | 신규 사용자 핵심 가치 전달, 페르소나 RAG 핵심 컨텍스트 수집 | 로그인 |
| **F020** | 냉장고 비우기 모드 (BP6) | F003 채팅에 "있는 재료 입력" 모드 추가. 사용자가 보유 재료 칩 선택 → AI가 매칭 카드 자동 생성. F015 "냉장고 비우기" 가상 섹션 (AI 자동 채움 활용) | 재료 낭비 방지, 기존 재료 활용 니즈 대응 | AI 채팅 |
| **F021** | 카드 외부 공유 (BP7) | 카드 상세에 [카카오톡 공유] 버튼 + 딥링크 + OG 메타(메뉴 이미지·제목·건강 스코어). 비로그인 미리보기 페이지(카드 1개) → 카카오 1초 시작 유도 | 가족 그룹 외부 입소문 채널, 신규 가입 유입 | 카드 상세 |

---

## 📱 메뉴 구조

```
📱 FreshPickAI 내비게이션

👤 인증 (비로그인)
├── 로그인 - F010
└── 온보딩 슬라이드 - F019 (BP5)

🏠 메인 메뉴 (로그인 후)
├── 🃏 카드메뉴 홈
│   ├── 기능: F001 (공식 10종 + 커스텀 카드섹션 탐색)
│   ├── 기능: F014 (키즈·청소년 탭 필터)
│   └── 기능: F015 (섹션 탭 순서 편집 진입)
├── 🤖 AI 채팅
│   ├── 기능: F003 (9 페르소나 RAG 추천)
│   └── 기능: F020 (냉장고 비우기 모드)
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
│   ├── 기능: F017 (인터랙티브 조리 UX)
│   ├── 기능: F018 (재료 메타 확장)
│   └── 기능: F021 (카카오톡 공유)
├── 🛒 장바구니
│   └── 기능: F004 (담긴 재료 관리)
└── 💳 결제
    └── 기능: F005 (토스페이먼츠 결제)
```

---

## 📄 페이지별 상세 기능

### 로그인

> **구현 기능:** `F010` | **인증:** 불필요

| 항목 | 내용 |
|------|------|
| **역할** | 서비스 진입점 — 소셜 계정으로 1초 시작, 페르소나 태그 초기 수집 |
| **진입 경로** | 앱 최초 실행 또는 로그아웃 후 자동 리디렉션 |
| **사용자 행동** | 카카오·애플 버튼으로 로그인, 신규 가입 시 가구 인원·웰빙 목표·요리시간·예산 1단계 입력 |
| **주요 기능** | • 카카오 소셜 로그인<br>• 애플 소셜 로그인<br>• **온보딩 슬라이드 5장** (F019, BP5) — 카카오/애플 로그인 직후 진입, 카드메뉴 10종·F003·F011·F014 미리보기 + 페르소나 태그 입력. 모든 단계 [건너뛰기] 노출<br>• **웰빙 목표·요리시간·예산 온보딩 폼** (5번째 슬라이드 내 통합) — 가구 인원, 웰빙 목표(저속노화·다이어트·근육강화·혈당관리 등), 선호 요리시간(10분·30분·1시간), 끼니 예산(만원 이하·2만원·3만원 이상)<br>• **로그인** 버튼 |
| **다음 이동** | 성공 → **온보딩 슬라이드 5장 (신규 사용자만)** → 카드메뉴 홈, 실패 → 에러 토스트 |

---

### 카드메뉴 홈

> **구현 기능:** `F001`, `F014`, `F015` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 서비스 핵심 허브 — 공식 10종 + 사용자 커스텀 섹션을 탭으로 펼쳐 30초 안에 후보 압축 |
| **진입 경로** | 로그인 성공 후 자동 이동, 하단 탭 홈 아이콘 |
| **사용자 행동** | 탭 전환 (공식 10종 + 내 커스텀 섹션), 카드 스와이프·탭, 섹션 편집 모드 진입 |
| **주요 기능** | • 공식 10종 탭 + 사용자 커스텀 섹션 탭 통합 표시<br>• 키즈·청소년 전용 탭 (간식팩·K-디저트·드라마 필터, F014)<br>• **섹션 편집 버튼** — 탭 순서 드래그, 공식 섹션 비활성화, 커스텀 섹션 관리로 이동 (F015)<br>• pgvector 취향 매칭 AI 추천 배지<br>• 우리가족 TOP3 강조 표시 |
| **다음 이동** | 카드 선택 → 카드 상세, AI 변형 → AI 채팅, 섹션 편집 → 내 섹션 관리 |

---

### 카드 상세

> **구현 기능:** `F002`, `F004`, `F016`, `F017`, `F018`, `F021`, `F022` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 메뉴 결정 지원 — 재료·건강 스코어·가격 비교를 한눈에 확인하고 즉시 담기 |
| **진입 경로** | 카드메뉴 홈에서 카드 탭, AI 채팅 추천 결과 카드 탭 |
| **사용자 행동** | 재료·건강 스코어·가격 비교 확인, 수량 조정, 가족 보드 공유, 전체 재료 일괄 담기 |
| **주요 기능** | • 메뉴 이미지·레시피 요약·예상 조리 시간 표시<br>• **건강 스코어** (저속노화·혈당 지수·영양 밸런스) 표시<br>• **가격 비교** (제철 vs 비수기 / 홈메이드 vs 외식·카페) 표시<br>• **음식 목록** (F022) — 카드에 묶인 1~N개 음식(메인·사이드·디저트), 각 음식의 대표 레시피 1개 미리보기 + "다른 레시피 보기" 옵션<br>• 재료 목록 + 수량 ±조정<br>• **재료 메타** (F018, BP3) — 재료별 손질법 도해, 계량 힌트(1큰술=15mL), 대체 재료 펼치기 (예: "차돌박이 대신 우삼겹")<br>• **사용자 노트 섹션** (F016, BP1) — 팁·후기·질문 3분류 탭 + 노트 카운트 + 운영자 답글, [내 노트 남기기] CTA<br>• **카카오톡 공유** (F021, BP7) — [공유] 버튼 → OG 미리보기(메뉴 이미지·제목·건강 스코어), 딥링크<br>• **이 카드로 요리하기** (F017) — floating 4-action 바(요약·공유·북마크·노트보기) + 단계별 타이머 PWA 푸시<br>• **모두 담기** 버튼 / 가족 보드 공유 버튼 |
| **다음 이동** | 모두 담기 → 장바구니, 가족 공유 → 우리가족 보드 |

---

### AI 채팅

> **구현 기능:** `F003`, `F020` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 9 페르소나 AI 변형 추천 인터페이스 — 자연어 요청 → RAG 5-tool Agent → 메뉴 카드 3개 스트리밍 |
| **진입 경로** | 카드메뉴 홈 AI 버튼, 하단 탭 AI 아이콘 |
| **사용자 행동** | "비건으로 바꿔줘", "10분 요리", "초등 간식 추천" 등 입력 → 페르소나 매칭 카드 3개 수신 |
| **주요 기능** | • 자연어 입력창 ("모아달에게 물어보세요…")<br>• 9 페르소나 컨텍스트 주입 (가구·웰빙 목표·요리시간·예산·최근 주문)<br>• pgvector 5-tool 호출 (searchItems·getUserContext·getInventory·addToCart·addToMemo — searchItems는 dish_recipe 레시피 RAG 1차 + tenant_item_ai_detail 상품 RAG 2차 내부 분기)<br>• 스트리밍 텍스트 + 구조화 메뉴 카드 3개 반환<br>• **냉장고 비우기 모드** (F020) — 보유 재료 칩 선택 → AI 매칭 카드 자동 생성<br>• **담기** 버튼 (응답 카드에서 직접 장바구니 담기) |
| **다음 이동** | 카드 탭 → 카드 상세, 담기 → 장바구니 |

---

### 우리가족 보드

> **구현 기능:** `F011`, `F014` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 가족 공동 결정 공간 — 5개 섹션으로 카드 공유·투표·아이 선호·랭킹·가족 미션 운영 |
| **진입 경로** | 카드 상세 공유 버튼, 하단 탭 가족 아이콘 |
| **사용자 행동** | 카드 공유 확인·투표, 아이 별점 확인, TOP5 랭킹 조회, 금요 무비나이트 장르 투표 참여 |
| **주요 기능** | • **컬렉션** — 공유된 10종 카드 목록 (Supabase Realtime 실시간 동기화)<br>• **이번 주 뭐 먹지?** — 좋아요·싫어요 투표 + 최다 득표 TOP3<br>• **우리 아이 선호** — P8·P9 별점·코멘트 반영 (F014), 다음 주 카드 자동 반영<br>• **이번 달 TOP5** — 전체 10종 카드 통합 랭킹<br>• **가족 미션** — 주간 미션 ("이번 주 타코 함께 만들기!"), 금요 무비나이트 장르 투표 → 홈시네마 페어링 자동 생성 |
| **다음 이동** | 메뉴 담기 → 장바구니, 카드 탭 → 카드 상세 |

---

### 장보기 메모

> **구현 기능:** `F012` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 수기 메모 디지털 전환 — 자연어 텍스트를 파싱해 장바구니로 변환 |
| **진입 경로** | 하단 탭 메모 아이콘, 카드메뉴 홈 메모 버튼 |
| **사용자 행동** | "계란2판 새우깡3봉지 저녁찬거리" 입력 → 파싱 결과 확인 → 장바구니 전송 |
| **주요 기능** | • 자유 텍스트 입력창<br>• 4-step 파싱 (오타 보정 CORRECTION_DICT → 수량 추출 → 품목 매칭 → 카테고리 분류)<br>• 파싱 결과 미리보기 + 수량 수정<br>• 매칭 안 된 항목 수동 검색<br>• **장바구니에 추가** 버튼 |
| **다음 이동** | 장바구니 추가 → 장바구니 |

---

### 장바구니

> **구현 기능:** `F004` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 주문 전 최종 확인 — 담긴 재료 조정 후 결제 진행 |
| **진입 경로** | 카드 상세 "모두 담기", AI 채팅 "담기", 장보기 메모 "장바구니에 추가", 우리가족 보드 "선택 메뉴 담기" |
| **사용자 행동** | 재료 수량 수정·삭제, 배송 시간 확인, 결제 진행 |
| **주요 기능** | • 담긴 재료 목록 + 수량 ±조정·삭제<br>• 총 금액 + 배송비 계산 표시<br>• 샛별배송 예상 도착 시간 표시<br>• 배송지 확인·변경<br>• **결제하기** 버튼 |
| **다음 이동** | 결제하기 → 결제, 계속 쇼핑 → 카드메뉴 홈 |

---

### 결제

> **구현 기능:** `F005` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 구매 완료 — 토스페이먼츠 연동으로 빠르고 안전한 결제 처리 |
| **진입 경로** | 장바구니 "결제하기" 버튼 |
| **사용자 행동** | 결제 수단 선택 → 간편결제 또는 카드 입력 → 결제 승인 |
| **주요 기능** | • 주문 요약 (품목·수량·금액·배송지) 표시<br>• 카카오페이·네이버페이·카드·계좌이체 선택<br>• 토스페이먼츠 SDK 결제창 호출<br>• 결제 성공·실패 상태 처리<br>• **결제 완료** 확인 및 주문 번호 발급 |
| **다음 이동** | 성공 → 주문 완료 화면 (샛별배송 예약 확인), 실패 → 에러 안내 후 장바구니 복귀 |

---

### 카드 만들기

> **구현 기능:** `F013` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 사용자 참여 콘텐츠 생성 — 나만의 메뉴 카드 직접 제작 |
| **진입 경로** | 하단 탭 ➕ 아이콘, 카드메뉴 홈 "만들기" 버튼 |
| **사용자 행동** | 메뉴명·설명 입력, 재료 추가, 썸네일 업로드, 카드 저장 |
| **주요 기능** | • 메뉴명·설명·조리 시간 입력 폼<br>• **가이드 키워드 placeholder** (BP4) — 메뉴명 입력 시 "○○네 김치찌개" 자동 제안, 재료 입력 시 손질법(prep_method)·대체 재료(substitutes) 함께 입력 가능<br>• 재료 목록 추가 (품목명·수량·단위·손질법·대체 재료)<br>• 썸네일 이미지 업로드 (Supabase Storage)<br>• 카드 미리보기<br>• **검수 큐** (BP4) — 부적합 카드는 본인에게만 노출. 운영자 승인 시 공식 카드섹션 노출 후보 진입<br>• **카드 저장** 버튼 (내 카드메뉴 홈에 추가) |
| **다음 이동** | 저장 완료 → 카드메뉴 홈 (내 카드 탭), 취소 → 이전 화면 |

---

### 내 섹션 관리

> **구현 기능:** `F015` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 카드메뉴 홈 탭 완전 개인화 — 공식 탭과 사용자 생성 탭을 동일한 방식으로 생성·삭제·명칭 변경·순서 변경·AI 자동 채움 설정 |
| **진입 경로** | 카드메뉴 홈 "섹션 편집" 버튼, 하단 탭 내 섹션 관리 아이콘 |
| **사용자 행동** | 탭 목록 편집 화면에서 탭 추가·삭제·이름 수정, 드래그앤드롭 순서 변경, 탭별 AI 자동 채움 ON/OFF, 저장 |
| **주요 기능** | • **탭 생성** — 섹션명 자유 입력 후 새 탭 추가<br>• **탭 삭제** — 공식 10종 탭·사용자 생성 탭 모두 삭제 가능 (공식 탭 삭제는 해당 사용자에게만 숨김)<br>• **탭 명칭 변경** — 공식 탭 이름 포함 모든 탭 이름 수정 가능<br>• **탭 순서 변경** — 드래그앤드롭으로 홈 탭 노출 순서 재배치<br>• **AI 자동 채움 토글** — ON: 페르소나 컨텍스트·섹션명 맥락 기반 AI 자동 생성/갱신, OFF: 사용자가 직접 카드 선택<br>• **저장** 버튼 → 카드메뉴 홈 탭에 즉시 반영 |
| **다음 이동** | 저장 → 카드메뉴 홈 (변경된 탭 구성 즉시 표시), 취소 → 이전 화면 |

---

## 🗄️ 데이터 모델

### customer (고객·페르소나)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| customer_id | 고유 식별자 | UUID |
| email | 이메일 | TEXT |
| household_size | 가구 인원 | INT |
| taste_tags | 취향 태그 배열 | TEXT[] |
| wellness_tags | 웰빙 목표 태그 (저속노화·다이어트·근육강화·혈당관리 등) | TEXT[] |

### customer_preference (페르소나 RAG 컨텍스트)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| preference_id | 고유 식별자 | UUID |
| customer_id | 고객 | → customer.customer_id |
| diet_tags | 식이 태그 (low_sodium·diet·omad 등) | TEXT[] |
| cooking_skill | 조리 수준 (beginner·intermediate·advanced) | TEXT |
| cook_time_pref | 선호 요리시간 (10min·30min·60min) | TEXT |
| budget_range | 끼니 예산 (under_10k·under_20k·over_30k) | TEXT |
| preferred_hour | 평소 쇼핑 시간대 | INT |
| embedding | 페르소나 텍스트 임베딩 (1536차원) | vector(1536) |

### menu_card (메뉴 카드)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| card_id | 고유 식별자 | UUID |
| card_theme | 카드메뉴 10종 코드 (chef_table·honwell·seasonal 등) | TEXT |
| title | 메뉴명 | TEXT |
| customer_id | 작성자 (사용자 카드, null = 공식) | → customer.customer_id |
| health_score | 건강 스코어 (0.0~1.0) | NUMERIC |

### cart / cart_item (장바구니)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| cart_id | 고유 식별자 | UUID |
| customer_id | 고객 | → customer.customer_id |
| store_item_id | 상품 | → v_store_inventory_item |
| qty | 수량 | INT |

> **상태 동기화 전략**: Supabase `cart` / `cart_item`이 단일 진실 소스(source of truth). Zustand `cartStore`는 UI 성능 캐시 역할 — 페이지 마운트 시 서버 데이터로 hydrate, 담기/수량 변경 시 Server Action → DB 반영 후 Zustand 동기화. 로컬 persist는 비로그인 임시 보관에만 사용.

### order / order_detail (주문)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| order_id | 고유 식별자 | UUID |
| customer_id | 주문 고객 | → customer.customer_id |
| status | 주문 상태 | TEXT |
| delivered_at | 배송 완료 시각 | TIMESTAMPTZ |

### tenant_item_master (상품 마스터)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| tenant_item_id | 고유 식별자 | UUID |
| tenant_id | 입점 테넌트 (마트·브랜드) | UUID |
| item_name | 상품명 | TEXT |
| category | 카테고리 (채소·육류·유제품 등) | TEXT |
| base_price | 기준 가격 | NUMERIC |
| unit | 단위 (g·개·팩 등) | TEXT |
| is_seasonal | 제철 상품 여부 | BOOLEAN |
| created_at | 등록 시각 | TIMESTAMPTZ |

### tenant_item_ai_detail (AI RAG 지식 베이스)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| ai_detail_id | 고유 식별자 | UUID |
| tenant_item_id | 연결 상품 | → tenant_item_master |
| chunk_type | 청크 유형 10종 (chef_recipe·nutrition_plan·family_recipe·drama_recipe·honwell_bowl·seasonal_ingredient·global_plate·k_dessert·snack_pack·cinema_pairing) | TEXT |
| content | 원문 텍스트 (500~1500자) | TEXT |
| embedding | 벡터 임베딩 (1536차원, HNSW cosine) | vector(1536) |
| persona_tags | 페르소나 태그 배열 | TEXT[] |
| status | ACTIVE·STALE·REVIEW_NEEDED | TEXT |

### family_group (가족 그룹)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| group_id | 고유 식별자 | UUID |
| group_name | 그룹명 (예: "우리가족") | TEXT |
| created_by | 그룹 생성자 | → customer.customer_id |
| created_at | 생성 시각 | TIMESTAMPTZ |

### family_member (가족 구성원)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| member_id | 고유 식별자 | UUID |
| group_id | 소속 가족 그룹 | → family_group.group_id |
| customer_id | 구성원 고객 | → customer.customer_id |
| role | 역할 (admin·member) | TEXT |
| joined_at | 참여 시각 | TIMESTAMPTZ |

### family_vote (우리가족 보드 투표)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| vote_id | 고유 식별자 | UUID |
| group_id | 투표 귀속 가족 그룹 | → family_group.group_id |
| card_id | 투표 대상 카드 | → menu_card.card_id |
| voter_id | 투표자 | → customer.customer_id |
| vote_type | 투표 결과 (like·dislike) | TEXT |

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
| parent_note_id | 운영자 답글일 때 부모 노트 (1depth) | UUID NULL → card_note.note_id |
| is_admin_reply | 운영자 답글 여부 | BOOLEAN DEFAULT FALSE |
| ai_consent | AI 학습 활용 동의 (사용자 체크) | BOOLEAN DEFAULT FALSE |
| created_at | 생성 시각 | TIMESTAMPTZ |

> **자기보강 루프**: `note_type='tip'` AND `helpful_count >= 5` AND `ai_consent=true` AND LLM Judge ≥ 4/5 → `dish_recipe`에 `source='user_note'`·`status='REVIEW_NEEDED'`로 자동 후보 등록. 운영자 검토 후 ACTIVE 승격.

### card_section (카드섹션 탭 — F015)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| section_id | 고유 식별자 | UUID |
| customer_id | 섹션 소유자 (사용자별 탭 구성) | → customer.customer_id |
| section_type | 섹션 출처 (official·custom) | TEXT |
| section_code | 공식 섹션 원본 코드 (official만, 예: chef_table) | TEXT |
| section_name | 사용자에게 보이는 탭명 (기본값=공식명, 자유 수정 가능) | TEXT |
| ai_auto_fill | AI 자동 채움 여부 | BOOLEAN |
| ai_persona_tags | AI 자동 채움 조건 태그 | TEXT[] |
| display_order | 홈 탭 표시 순서 | INT |
| is_active | 탭 표시 여부 (false = 삭제/숨김 상태) | BOOLEAN |

### card_section_item (섹션 내 카드 목록)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| item_id | 고유 식별자 | UUID |
| section_id | 소속 섹션 | → card_section.section_id |
| card_id | 추가된 카드 | → menu_card.card_id |
| display_order | 섹션 내 카드 순서 | INT |
| added_at | 추가 시각 | TIMESTAMPTZ |

### card_ingredient (카드 재료 목록 — F018 BP3 확장)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| ingredient_id | 고유 식별자 | UUID |
| card_id | 소속 메뉴 카드 | → menu_card.card_id |
| dish_id | (옵션) 특정 음식의 재료 | UUID NULL → dish.dish_id |
| item_name | 재료명 | TEXT |
| qty | 수량 | NUMERIC |
| unit | 단위 (g·개·팩 등) | TEXT |
| store_item_id | 매핑된 매장 상품 | → v_store_inventory_item |
| **prep_method** | **재료 손질법 (예: "반달썰기"·"다지기"·"채썰기") — F018 BP3** | **TEXT NULL** |
| **measurement_hint** | **계량 힌트 (예: "1큰술=15mL") — F018 BP3** | **TEXT NULL** |
| **substitutes** | **대체 재료 JSON 배열 (예: [{"name":"우삼겹","note":"더 부드러움"}]) — F018 BP3** | **JSONB NULL** |

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

### card_dish (카드 ↔ 음식 N:M 매핑 — F022)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| card_dish_id | 고유 식별자 | UUID |
| card_id | 소속 카드 | → menu_card.card_id |
| dish_id | 묶인 음식 | → dish.dish_id |
| role | 음식 역할 (main·side·dessert·drink) | TEXT |
| display_order | 카드 내 음식 표시 순서 | INT |

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

### dish_recipe_step (레시피 조리 단계 — F017, F022, BP2 입력)
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

### ai_query_cache (시맨틱 캐시)
| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| cache_id | 고유 식별자 | UUID |
| customer_id | 고객 (null = 공용 캐시) | → customer.customer_id |
| query_embedding | 프롬프트 임베딩 (1536차원) | vector(1536) |
| response_payload | generateObject 응답 결과 | JSONB |
| expires_at | 만료 시각 (7일 TTL) | TIMESTAMPTZ |

---

## 🛠️ 기술 스택

### 프론트엔드 프레임워크

- **Next.js 16** (App Router, Turbopack) — RSC + Streaming, Server Actions
- **TypeScript 5.x** strict — 도메인 타입 `types/` 분리
- **React 19.2** — 동시성 기능

### 스타일링 & UI

- **Tailwind CSS** + **shadcn/ui (new-york)** — 토큰 기반 Mocha Mousse 디자인 시스템
- **Lucide React** — 아이콘
- **next-themes** — 다크 모드
- **Framer Motion** + **@use-gesture/react** — 카드 스와이프 애니메이션 (vaul·sonner 포함)
- **@dnd-kit/core** + **@dnd-kit/sortable** — 섹션 탭 순서 변경 (F015)

### 폼 & 검증

- **React Hook Form 7.x** — 폼 상태 관리
- **Zod** — 스키마 검증 (`generateObject` RecommendationSchema 겸용)

### AI & RAG (3-Layer)

- **Layer 1**: Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`) — `streamText`·`generateObject`·`ToolLoopAgent`
- **Layer 2**: **Anthropic Claude Sonnet 4.6** — 9 페르소나 응답·Tool Calling / **Anthropic Claude Haiku 4.5** — 분류·요약·캐시 키 정규화
- **Layer 3**: **OpenAI text-embedding-3-small** (`openai`) — 1536차원 한국어 임베딩

### 백엔드 & 데이터베이스

- **Supabase** — Auth + PostgreSQL + Storage + Realtime + **pgvector 0.8.x** (HNSW cosine, 200ms 이하)
- **pg_trgm** — 벡터 검색 실패 시 유사도 폴백 → ILIKE 폴백
- **Next.js Server Actions / Route Handlers** — `lib/actions/domain/*` 패턴

### 결제

- **토스페이먼츠 SDK** (`@tosspayments/tosspayments-sdk`) — 카카오페이·네이버페이·카드·계좌이체 통합

### 상태 관리

- **Zustand** + persist — `cartStore`, `wishlistStore`, `storeStore` (StoreHydrator SSR 시드)
- **TanStack Query** — 서버 상태 동기화

### 배포 & 모니터링

- **Vercel** — Edge + Serverless, Next.js 16 최적화 배포
- **Vercel Analytics** + AI SDK OpenTelemetry — 토큰·비용·지연 추적

### 테스트

- **Playwright E2E** — CI `npm run check-all` 게이트: 핵심 5~10 시나리오. 9 페르소나 × 카드메뉴 10종 300건 골든 셋은 주간·배포 전 별도 실행

### 패키지 관리

- **npm** — 의존성 관리
