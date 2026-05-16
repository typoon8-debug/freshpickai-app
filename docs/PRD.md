# FreshPickAI PRD

> **📅 최종 업데이트**: 2026-05-16
> **📊 진행 상황**: MVP v0.2 완료 (21/22 기능 완료) · Phase 5~6 기획 중
> **📦 완료 상세**: [PRD-freshpickai-v0.2.md](./PRD-freshpickai-v0.2.md)

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

4. 장바구니 → 결제 (토스페이먼츠) → 배송 예약 확인
```

---

## 🃏 카드메뉴 10종

| # | 카드명 | 핵심 컨셉 |
|---|-------|---------|
| ① | 셰프스 테이블 | 스타 셰프 레시피를 동네 마트 재료로 재현 |
| ② | 하루한끼 One Meal | 16:8/OMAD 패턴에 맞춰 하루 영양을 한 끼에 설계 |
| ③ | 엄마손맛 가정식 | AI 인터뷰로 가족 고유 레시피 복원·카드화 |
| ④ | 드라마 한 끼 | K-드라마·예능·영화 속 음식을 마트 버전으로 재현 |
| ⑤ | 혼웰(HonWell) 라이프 | 컨디션 입력 → 맞춤 원 보울, 저속노화 기본 적용 |
| ⑥ | 제철한상 | 24절기·월별 제철 식재료 중심 한 상 |
| ⑦ | 글로벌 원플레이트 | 세계 각국 원플레이트를 동네 마트 재료로 재현 |
| ⑧ | K-디저트 랩 | 전통 디저트 현대 리메이크, 카페 대비 1/3 가격 |
| ⑨ | 방과후 간식팩 | 학년별 건강 간식 조합, 인공감미료 제로 |
| ⑩ | 홈시네마 나이트 | OTT 장르 기반 음료·안주 페어링 (성인+키즈 동시 생성) |

---

## 🏗️ 5계층 아키텍처

```
card_section → menu_card → card_dish → dish → dish_recipe → dish_recipe_step
                               └→ card_ingredient → v_store_inventory_item
```

두 종류의 RAG: **상품 측** (`tenant_item_ai_detail`) + **레시피 측** (`dish_recipe`)
5-tool ToolLoopAgent: `searchItems(mode:recipe|item)` · `getUserContext` · `getInventory` · `addToCart` · `addToMemo`

---

## ⚡ 기능 명세 요약 (완료 — v0.2)

> 상세 명세 → [PRD-freshpickai-v0.2.md](./PRD-freshpickai-v0.2.md)

| ID | 기능명 | 상태 |
|----|--------|------|
| F001 | 다양한 테마 카드메뉴 시스템 | ✅ 완료 |
| F002 | 카드 상세 + 건강·가격 인프라 | ✅ 완료 |
| F003 | AI 페르소나 채팅 추천 (RAG) | ✅ 완료 |
| F004 | 재료 장바구니 담기 | ✅ 완료 |
| F005 | 결제 (토스페이먼츠) | ✅ 완료 |
| F010 | 기본 인증 (카카오·애플) | ✅ 완료 |
| F011 | 우리가족 보드 (5개 섹션) | ✅ 완료 |
| F012 | 장보기 메모 (4-step 파싱) | ✅ 완료 |
| F013 | 카드 만들기 | ✅ 완료 |
| F014 | 키즈·청소년 모드 | 🔄 Task 031 진행 예정 |
| F015 | 카드섹션 커스터마이징 | ✅ 완료 |
| F016 | 카드 사용자 노트 3분류 (BP1) | ✅ 완료 |
| F017 | 인터랙티브 조리 UX (BP2) | ✅ 완료 |
| F018 | 재료 메타 확장 — prep_method·substitutes (BP3) | ✅ 완료 |
| F019 | 온보딩 5장 슬라이드 (BP5) | ✅ 완료 |
| F020 | 냉장고 비우기 모드 (BP6) | ✅ 완료 |
| F021 | 카드 외부 공유·카카오톡 딥링크 (BP7) | ✅ 완료 |
| F022 | 음식 마스터·레시피 RAG 시스템 | ✅ 완료 |

---

## 🔄 미완료 기능

### F014 — 키즈·청소년 모드 (Task 031)

| ID | 기능명 | 설명 | 관련 페이지 |
|----|--------|------|------------|
| **F014** | 키즈·청소년 모드 | P8 초등(간식팩·K-디저트·드라마 카드 필터)·P9 중고생(트렌드·글로벌·홈시네마) 전용 카드 뷰, 아이 별점 → 다음 주 카드 반영 | 카드메뉴 홈, 우리가족 보드 |

**구현 항목:**
- 연령 그룹 필터 (초등·중고생) per family_member
- 키즈 전용 카드 탭 — 간식팩·K-디저트·드라마 카드 필터
- 청소년 전용 탭 — 트렌드·글로벌·홈시네마 카드
- 아이 별점·코멘트 UI (우리가족 보드 "우리 아이 선호" 섹션 연동)
- 별점 누적 → 다음 주 카드 추천 자동 반영 로직

---

## 🚀 Phase 5 — 커뮤니티·검색·분석 (신규 기능)

### 1. 핵심 기능

| ID | 기능명 | 설명 | 관련 페이지 |
|----|--------|------|------------|
| **F023** | FCM 푸시 알림 | 가족 투표 결과·카드 공유·조리 타이머 만료·신규 제철 카드 등록 이벤트 → Firebase Cloud Messaging 푸시. PWA `push` 이벤트 + Service Worker 핸들러 | 카드메뉴 홈, 우리가족 보드, 조리 모드 |
| **F024** | 검색 고도화 | 전문 검색창 — 메뉴명·재료·카드 테마·페르소나 태그 복합 검색. pgvector 코사인 유사도 1차 + pg_trgm LIKE 폴백 2차. 검색 결과 카드 3종(메뉴·재료·AI 추천) 탭 분리 | 검색 |
| **F025** | 영양 분석 차트 | 카드 상세 + 주간 섭취 이력 기반 영양소(단백질·탄수화물·지방·나트륨·칼로리) 도넛 차트. Recharts 기반, 웰빙 목표 달성률 표시 | 카드 상세, 마이페이지 |

### 2. 운영·확장 기능

| ID | 기능명 | 설명 | 관련 페이지 |
|----|--------|------|------------|
| **F026** | 운영자 검수 큐 | `dish_recipe.status='REVIEW_NEEDED'` 레코드 목록 조회·승인·거절·수정 UI. LLM Judge 점수 표시. 사용자 카드(F013) BP4 검수도 동일 큐에서 처리 | 운영자 검수 큐 |
| **F027** | OCR 장보기 메모 | 카메라로 손글씨 장보기 메모 촬영 → Tesseract.js OCR → F012 기존 4-step 파싱으로 연결. 이미지 업로드 + 파싱 결과 인라인 수정 | 장보기 메모 |
| **F028** | 멀티 매장 가격 비교 | 카드 재료 기준으로 등록된 복수 테넌트(마트·브랜드) 동일 상품 가격 병렬 조회. 총합 기준 최저가 테넌트 추천 + 매장별 배송 정책 비교 | 카드 상세, 장바구니 |

---

## 🔮 Phase 6 — 구독·음성·대시보드 (미래 기능)

| ID | 기능명 | 설명 | 관련 페이지 |
|----|--------|------|------------|
| **F029** | 정기 배송 구독 | 주간/격주 배송 스케줄 설정 — 선택 카드 재료를 정해진 요일에 자동 장바구니 추가·결제 예약. 배송 7일 전 카드 변경 허용 | 마이페이지, 장바구니 |
| **F030** | 음성 입력 | AI 채팅 + 장보기 메모에 Web Speech API 음성 입력 추가. "오늘 저녁 제철 음식 추천해줘" 발화 → 텍스트 변환 → 기존 입력 플로우로 연결 | AI 채팅, 장보기 메모 |
| **F031** | 운영자 대시보드 | 일별 신규 가입·주문 전환·인기 카드·RAG 검색 쿼리 분석 대시보드. Recharts 시계열 차트 + 이상 감지 알럿 | 운영자 대시보드 |

---

## 📱 메뉴 구조 (전체)

```
📱 FreshPickAI 내비게이션

👤 인증 (비로그인)
├── 로그인 - F010
└── 온보딩 슬라이드 - F019

🏠 메인 메뉴 (로그인 후)
├── 🃏 카드메뉴 홈 - F001, F014, F015
├── 🔍 검색 - F024 (Phase 5)
├── 🤖 AI 채팅 - F003, F020
├── 👨‍👩‍👧‍👦 우리가족 보드 - F011, F014
├── 📝 장보기 메모 - F012, F027 (Phase 5)
├── ➕ 카드 만들기 - F013
└── 🗂️ 내 섹션 관리 - F015

🛒 구매 플로우
├── 📄 카드 상세 - F002, F004, F016, F017, F018, F021, F022, F025, F028
├── 🛒 장바구니 - F004, F028
└── 💳 결제 - F005

📊 마이페이지
├── 영양 분석 - F025 (Phase 5)
└── 정기 배송 구독 - F029 (Phase 6)

🔧 운영자 (관리자 전용)
├── 검수 큐 - F026 (Phase 5)
└── 대시보드 - F031 (Phase 6)
```

---

## 📄 페이지별 상세 기능 (신규 · Phase 5~6)

### 검색

> **구현 기능:** `F024` | **인증:** 필요 | **Phase 5**

| 항목 | 내용 |
|------|------|
| **역할** | 전문 검색 허브 — 메뉴명·재료·테마·페르소나를 복합 검색해 빠른 카드 발견 |
| **진입 경로** | 하단 탭 검색 아이콘, 카드메뉴 홈 상단 검색바 |
| **사용자 행동** | 검색어 입력 → 메뉴·재료·AI 추천 탭에서 결과 확인 → 카드 상세 진입 |
| **주요 기능** | • 메뉴명·재료·카드 테마·페르소나 태그 복합 검색<br>• pgvector 코사인 유사도 1차 + pg_trgm LIKE 폴백 2차<br>• 결과 3탭 분리 (메뉴·재료·AI 추천)<br>• 최근 검색어·추천 검색어 표시 |
| **구현 기능 ID** | F024 |

---

### 마이페이지 — 영양 분석

> **구현 기능:** `F025` | **인증:** 필요 | **Phase 5**

| 항목 | 내용 |
|------|------|
| **역할** | 주간 영양 섭취 현황 — 웰빙 목표 대비 달성률을 시각화 |
| **진입 경로** | 마이페이지 → 영양 분석 탭 |
| **사용자 행동** | 주간 섭취 이력 확인, 특정 카드 영양 상세 조회 |
| **주요 기능** | • 주간 영양소(단백질·탄수화물·지방·나트륨·칼로리) 도넛 차트<br>• 웰빙 목표(저속노화·다이어트·근육강화·혈당관리) 달성률<br>• 카드 상세 내 개별 카드 영양 분석 서브뷰<br>• Recharts 기반 시계열 트렌드 |
| **구현 기능 ID** | F025 |

---

### 운영자 검수 큐

> **구현 기능:** `F026` | **인증:** 운영자 전용 | **Phase 5**

| 항목 | 내용 |
|------|------|
| **역할** | UGC 품질 관리 — dish_recipe 자기보강 후보와 사용자 생성 카드를 검토·승인 |
| **진입 경로** | 운영자 어드민 → 검수 큐 메뉴 |
| **사용자 행동** | REVIEW_NEEDED 항목 목록 조회 → 본문 확인 + LLM Judge 점수 검토 → 승인/거절/수정 |
| **주요 기능** | • dish_recipe.status='REVIEW_NEEDED' 항목 목록 + 페이징<br>• F013 사용자 카드 BP4 검수 목록 통합<br>• LLM Judge 점수·helpful_count 표시<br>• 승인 → ACTIVE / 거절 → REJECTED / 수정 후 재검토<br>• 운영자 1depth 답글 (card_note.is_admin_reply) |
| **구현 기능 ID** | F026 |

---

## 🗄️ 데이터 모델 요약

> 완전한 스키마 → [PRD-freshpickai-v0.2.md](./PRD-freshpickai-v0.2.md#-데이터-모델)

| 테이블 | 핵심 필드 | 비고 |
|--------|---------|------|
| customer | customer_id, email, household_size, taste_tags, wellness_tags | 페르소나 기반 |
| customer_preference | customer_id, diet_tags, cook_time_pref, budget_range, embedding | RAG 컨텍스트 |
| menu_card | card_id, card_theme, title, customer_id, health_score | 공식·사용자 카드 |
| cart / cart_item | cart_id, customer_id, store_item_id, qty | Zustand 캐시 |
| order / order_detail | order_id, customer_id, status, delivered_at | 주문 |
| tenant_item_master | tenant_item_id, item_name, category, base_price, is_seasonal | 상품 마스터 |
| tenant_item_ai_detail | ai_detail_id, chunk_type, content, embedding, persona_tags | 상품 측 RAG |
| family_group / family_member | group_id, group_name, member_id, role | 가족 그룹 |
| family_vote | vote_id, group_id, card_id, vote_type | 투표 |
| card_note | note_id, note_type, helpful_count, ai_consent | BP1 자기보강 입력 |
| card_section / card_section_item | section_id, ai_auto_fill, display_order | F015 탭 구성 |
| card_ingredient | ingredient_id, prep_method, substitutes, store_item_id | F018 BP3 |
| dish | dish_id, dish_name, persona_tags, diet_tags, embedding | F022 음식 마스터 |
| card_dish | card_dish_id, card_id, dish_id, role | F022 N:M |
| dish_recipe | recipe_id, variant_name, embedding, status, review_note | 레시피 측 RAG |
| dish_recipe_step | step_id, step_index, timer_seconds | F017 BP2 |
| ai_query_cache | cache_id, query_embedding, response_payload, expires_at | 시맨틱 캐시 |

**Phase 5 신규 테이블:**

| 테이블 | 핵심 필드 | 비고 |
|--------|---------|------|
| nutrition_log | log_id, customer_id, card_id, calories, protein, carbs, fat | F025 영양 이력 |
| search_log | log_id, customer_id, query, result_count, created_at | F024 검색 분석 |
| push_subscription | sub_id, customer_id, endpoint, keys | F023 FCM 구독 |

---

## 🛠️ 기술 스택

### 프론트엔드

- **Next.js 16** (App Router, Turbopack) + **React 19.2** + **TypeScript 5.x** strict
- **Tailwind CSS** + **shadcn/ui (new-york)** — Mocha Mousse 디자인 시스템
- **Framer Motion** + **@use-gesture/react** + **@dnd-kit** — 카드 스와이프·드래그앤드롭
- **Recharts** — 영양 분석 차트 (F025, Phase 5)

### 상태 관리

- **Zustand** + persist — `useAuthStore` · `useCartStore` · `useChatStore` · `useKidsStore` · `useUIStore`
- **TanStack Query** — `qk.cards()` · `qk.card()` · `qk.daily()` · `qk.family()` · `qk.cart()` · `qk.memos()`

### AI & RAG

- **Vercel AI SDK** (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`) — `streamText` · `generateObject` · `ToolLoopAgent`
- **Anthropic Claude Sonnet 4.6** — 9 페르소나 응답·Tool Calling
- **Anthropic Claude Haiku 4.5** — 분류·요약·캐시 키 정규화
- **OpenAI text-embedding-3-small** — 1536차원 한국어 임베딩

### 백엔드 & 데이터베이스

- **Supabase** — Auth + PostgreSQL + Storage + Realtime + **pgvector 0.8.x** (HNSW cosine)
- **pg_trgm** — 벡터 폴백 → ILIKE 폴백
- **토스페이먼츠 SDK** — 카카오페이·네이버페이·카드·계좌이체

### 배포 & 모니터링

- **Vercel** (Edge + Serverless) + Vercel Analytics + AI SDK OpenTelemetry + Sentry + PostHog
- **Playwright E2E** — CI `npm run check-all` 게이트 (69/71 TC 통과)
- **Firebase Cloud Messaging** — F023 푸시 알림 (Phase 5)
