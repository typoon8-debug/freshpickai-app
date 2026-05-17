# FreshPickAI PRD

> **📅 최종 업데이트**: 2026-05-17
> **📊 진행 상황**: v0.3a 보완 완료 (신규 기능 4종 + F014 + 버그수정 3종 + v0.3a 보완 스프린트 8건)
> **📦 v0.2 완료 상세**: [PRD-freshpickai-v0.2.md](./PRD-freshpickai-v0.2.md)

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

   [AI 변형 원할 때]  → AI 채팅 (v0.3a 업그레이드) → 맥락 기억 기반 9 페르소나 RAG 재추천 → 카드 3개 수신
   [버튼 피드백]      → AI 제안 버튼 탭 → 찜추가·장바구니·결제 즉시 연동 (F033, F034)
   [음성 질의]        → 마이크 버튼 → 음성 → 텍스트 변환 → AI 처리 → 텍스트 답변 (F035)
   [키즈/청소년 탭]  → 간식팩·K-디저트·드라마 카드 필터 표시 (F014 구현)
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

**v0.3a 추가 API (AI 채팅 연동)**: `addToWishlist` · `updateCart` · `initiatePayment`

---

## ⚡ 기능 명세

### 1. v0.2 완료 기능 (요약)

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
| F015 | 카드섹션 커스터마이징 | ✅ 완료 |
| F016 | 카드 사용자 노트 3분류 (BP1) | ✅ 완료 |
| F017 | 인터랙티브 조리 UX (BP2) | ✅ 완료 |
| F018 | 재료 메타 확장 — prep_method·substitutes (BP3) | ✅ 완료 |
| F019 | 온보딩 5장 슬라이드 (BP5) | ✅ 완료 |
| F020 | 냉장고 비우기 모드 (BP6) | ✅ 완료 |
| F021 | 카드 외부 공유·카카오톡 딥링크 (BP7) | ✅ 완료 |
| F022 | 음식 마스터·레시피 RAG 시스템 | ✅ 완료 |

---

### 2. v0.3a 신규 기능

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|-------------|------------|
| **F032** | AI 채팅 3계층 맥락 메모리 | 최근대화원문(TTL 30일) + 대화별 요약 + 장기 memory_items 3계층 저장. 질문 요약 → 쿼리 생성 → memory 검색 → 관련도 점수 → 상위 기억 프롬프트 삽입 → 답변 생성 | 이전 대화 맥락 기반 정확한 추천으로 재방문 품질 향상 | AI 채팅 |
| **F033** | 인텐트 기반 버튼 피드백 채널 | AI가 intent(Enum)만 생성 → Action JSON Renderer가 버튼 UI 렌더링. 사용자 버튼 탭 → 서비스 API 호출. 타이핑 없이 손쉬운 대화 진행 | 모바일 타이핑 부담 해소, 전환율 향상의 핵심 UX | AI 채팅 |
| **F034** | AI 채팅 커머스 API 연동 | 찜추가·장바구니 추가/수량변경/삭제·바로결제 API. AI채팅에서 직접 구동 않고 API 호출 → 화면 링크 방식 적용 | 채팅에서 구매까지 이탈 없는 원스톱 쇼핑 플로우 구현 | AI 채팅, 카드 상세, 장바구니, 결제 |
| **F035** | 음성 입력 AI 채팅 Prototype | Web Speech API로 음성 질의 → 텍스트 변환 → AI 채팅 입력. AI 버튼 피드백으로 음성 답변 대체 (텍스트 출력). 장기: TTS 음성 답변 | 손이 바쁜 요리 중 질의·어르신 사용자 진입장벽 해소 | AI 채팅 |

---

### 3. v0.3a 이월 구현 기능

| ID | 기능명 | 설명 | 관련 페이지 |
|----|--------|------|------------|
| **F014** | 키즈·청소년 모드 | P8 초등(간식팩·K-디저트·드라마 카드 필터)·P9 중고생(트렌드·글로벌·홈시네마) 전용 카드 뷰, 아이 별점 → 다음 주 카드 반영 | 카드메뉴 홈, 우리가족 보드 |

**F014 구현 항목:**
- 연령 그룹 필터 (초등·중고생) per family_member
- 키즈 전용 카드 탭 — 간식팩·K-디저트·드라마 카드 필터
- 청소년 전용 탭 — 트렌드·글로벌·홈시네마 카드
- 아이 별점·코멘트 UI (우리가족 보드 "우리 아이 선호" 섹션 연동)
- 별점 누적 → 다음 주 카드 추천 자동 반영 로직

---

### 4. v0.3a 버그 수정

| ID | 버그 | 현상 | 수정 방향 |
|----|------|------|----------|
| **BUG-001** | 결제 흐름 오류 | 토스페이먼츠 결제 완료 후 에러 발생 또는 상태 미반영 | 결제 성공/실패 콜백 처리 검증, order 상태 전이 로직 수정 |
| **BUG-002** | 새로고침 Side Effect | AI채팅 새로고침 → 채팅 기록 전체 삭제. 홈화면 새로고침 → "AI가 식생활 패턴을 분석하고 있어요" 메시지 재출력. 이전 패치 이후 캐시 정책 변경 시 side effect 발생 | 페이지별 새로고침 동작 분석 → useChatStore 세션 persist 분리, 홈화면 AI 분석 중복 트리거 조건 제거 |
| **BUG-003** | -0% 할인 배지 오류 | 홈화면 AI 테마 추천 카드 오른쪽 상단에 "-0%" 빨간 배지 표시 | 할인율 0 이하 조건에서 배지 렌더링 제거 (`discount_rate > 0` 가드 추가) |

---

### 5. v0.3a 보완 스프린트 (2026-05-17)

> **v0.3a Sprint 보완** — 가족 기능 완성 + 실 데이터 연동 + 인증 흐름 개선

| ID | 항목 | 수정 내용 | 영향 파일 |
|----|------|----------|----------|
| **FIX-001** | AI 채팅 메모 저장 | streaming context에서 RLS 차단 → `createAdminClient()` 사용 | `src/lib/ai/tools/add-to-memo.ts` |
| **FIX-002** | 결제완료 배송 안내 | "배송 예약 확인" 카드 → "나의 프레시 → 주문/배송조회에서 확인하세요" 안내문으로 교체 | `src/app/(main)/checkout/success/page.tsx` |
| **FIX-003** | 가족보드 실 통계 연동 | "47끼 이번달 함께한 식사", "레벨 12" Mock 데이터 → `getFamilyStatsAction()` 실 DB 데이터 | `src/lib/actions/family/index.ts`, `src/components/family/family-banner.tsx` |
| **FIX-004** | 트렌딩카드 404 수정 | 폴백 카드가 가짜 ID(c03, c05, c06) 사용 → 실제 `fp_menu_card` 공식 카드로 교체 | `src/app/(main)/family/page.tsx` |
| **FIX-005** | 카카오 초대코드 불일치 | 클라이언트에서 랜덤 코드 생성(YT8X87) → DB 코드(XTU4MG) 불일치. 클라이언트 생성 완전 제거, DB `invite_code`만 사용 | `src/components/family/family-invite.tsx` |
| **FIX-006** | 가족그룹 생성 진입점 | 가족 그룹 없을 때 생성 UI 부재 → `CreateFamilyGroupForm` 신설 (그룹 만들기 + 코드로 합류 탭) | `src/components/family/create-family-group-form.tsx` |
| **FIX-007** | 가족 RLS 전면 우회 | `fp_family_member` RLS SELECT가 순환 참조 → 모든 가족 Server Actions를 `createAdminClient()` 사용으로 전환 | `src/lib/actions/family/index.ts`, `src/lib/actions/family/invite.ts` |
| **FIX-008** | 로그인 `next` URL 전파 | 초대 링크 수락 → 로그인 → 가족 페이지 대신 홈으로 이동. 이메일·카카오·구글·confirm 콜백 전 구간 `next` 파라미터 체인 구축 | `src/app/(auth)/login/page.tsx`, `src/components/auth/social-buttons.tsx`, `src/components/auth/email-login-form.tsx`, `src/lib/actions/auth/kakao.ts`, `src/lib/auth/oauth.ts`, `src/app/auth/confirm/route.ts` |
| **FIX-009** | Sentry 지원중단 경고 | `disableLogger`, `automaticVercelMonitors` deprecated → `withSentryConfig` 옵션 구조 수정 | `next.config.ts` |

**인증 흐름 next URL 체인 (FIX-008 상세)**:
```
초대 링크 클릭 (/family/invite/[code])
  → 로그인 페이지 (/login?next=/family/invite/[code])
  → 이메일 로그인: router.replace(nextUrl)
  → 카카오 OAuth: redirectTo = /auth/confirm?next=/family/invite/[code]
  → 구글 OAuth: redirectTo = /auth/confirm?next=/family/invite/[code]
  → /auth/confirm: OTP/OAuth 완료 → redirect(nextPath) or /onboarding?next=nextPath
```

**보안**: `next` 파라미터는 `/`로 시작하는 상대 경로만 허용 (오픈 리다이렉트 방지)

---

### 5. MVP 이후 기능 (Phase 5~6 유지)

| ID | 기능명 | Phase |
|----|--------|-------|
| F023 | FCM 푸시 알림 | Phase 5 |
| F024 | 검색 고도화 | Phase 5 |
| F025 | 영양 분석 차트 | Phase 5 |
| F026 | 운영자 검수 큐 | Phase 5 |
| F027 | OCR 장보기 메모 | Phase 5 |
| F028 | 멀티 매장 가격 비교 | Phase 5 |
| F029 | 정기 배송 구독 | Phase 6 |
| F031 | 운영자 대시보드 | Phase 6 |

---

## 📱 메뉴 구조

```
📱 FreshPickAI 내비게이션

👤 인증 (비로그인)
├── 로그인 - F010
└── 온보딩 슬라이드 - F019

🏠 메인 메뉴 (로그인 후)
├── 🃏 카드메뉴 홈 - F001, F014, F015
├── 🔍 검색 - F024 (Phase 5)
├── 🤖 AI 채팅 (v0.3a) - F003, F020, F032, F033, F034, F035
├── 👨‍👩‍👧‍👦 우리가족 보드 - F011, F014
├── 📝 장보기 메모 - F012, F027 (Phase 5)
├── ➕ 카드 만들기 - F013
└── 🗂️ 내 섹션 관리 - F015

🛒 구매 플로우
├── 📄 카드 상세 - F002, F004, F016, F017, F018, F021, F022, F025, F028
├── 🛒 장바구니 - F004, F034, F028
└── 💳 결제 - F005, F034

📊 마이페이지
├── 영양 분석 - F025 (Phase 5)
└── 정기 배송 구독 - F029 (Phase 6)

🔧 운영자 (관리자 전용)
├── 검수 큐 - F026 (Phase 5)
└── 대시보드 - F031 (Phase 6)
```

---

## 📄 페이지별 상세 기능 (v0.3a 신규·변경)

### AI 채팅 (v0.3a 업그레이드)

> **구현 기능:** `F003`, `F020`, `F032`, `F033`, `F034`, `F035` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 9 페르소나 RAG 기반 메뉴·재료 추천 + 커머스 직연동 허브. v0.3a에서 맥락 메모리·버튼 피드백·음성 입력·커머스 API 연동으로 대폭 업그레이드 |
| **진입 경로** | 하단 탭 AI 아이콘, 카드메뉴 홈 AI 채팅 버튼, 카드 상세 "AI에게 물어보기" |
| **사용자 행동** | 텍스트 또는 음성으로 질의 → AI 답변 + 버튼 피드백 탭 → 찜·장바구니·결제 즉시 실행 또는 세부 조정 |
| **주요 기능** | • **3계층 맥락 메모리** (F032): 최근대화원문 TTL 30일 보관 / 대화별 요약 압축·중복 제거 / 장기 memory_items 벡터 검색. 질문 요약 → 검색 쿼리 생성 → 관련도 점수 계산 → 상위 기억 프롬프트 삽입<br>• **인텐트 버튼 피드백** (F033): AI가 intent Enum만 생성 → Action JSON Renderer가 버튼 UI 렌더링. ADD_TO_WISHLIST / ADD_TO_CART / UPDATE_CART / REMOVE_FROM_CART / INITIATE_PAYMENT / VIEW_CARD 등 Enum 정의<br>• **커머스 API 연동** (F034): 버튼 탭 → 서비스 REST API 호출 (AI 채팅이 직접 구동 않고 API 링크 방식). 찜추가 / 장바구니 추가·수량변경·삭제 / 바로결제 버튼<br>• **음성 입력 Prototype** (F035): 마이크 버튼 → Web Speech API → 실시간 텍스트 변환 → 채팅 전송. 인식 중 파형 애니메이션 표시<br>• 냉장고 비우기 모드 연동 (F020) |
| **다음 이동** | 버튼 탭 → 찜목록·장바구니·결제 페이지 이동 또는 현재 화면 갱신. 카드 추천 → 카드 상세 |

---

### 카드메뉴 홈 (F014 키즈·청소년 모드 구현)

> **구현 기능:** `F001`, `F014`, `F015` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 테마별 카드 탐색 허브. v0.3a에서 키즈·청소년 전용 탭 활성화 |
| **진입 경로** | 하단 탭 홈, 로그인 완료 후 자동 이동 |
| **사용자 행동** | 테마 탭 전환 → 카드 스와이프 탐색 → 카드 선택 또는 키즈 탭 전환 |
| **주요 기능** | • 10종 테마 카드 탭 (F001)<br>• **키즈 탭** (F014): 초등 대상 — 간식팩·K-디저트·드라마 카드 필터. 아이 별점·코멘트 입력 UI<br>• **청소년 탭** (F014): 중고생 대상 — 트렌드·글로벌·홈시네마 카드<br>• 별점 누적 → 다음 주 카드 추천 자동 반영<br>• 할인 배지: `discount_rate > 0` 조건에서만 표시 (BUG-003 수정)<br>• 섹션 순서 커스터마이징 (F015) |
| **다음 이동** | 카드 탭 → 카드 상세. 키즈 탭 → 키즈 카드 상세 |

---

### 장바구니 (v0.3a 커머스 API 연동)

> **구현 기능:** `F004`, `F034` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 담긴 재료 확인·수정 및 결제 진입. v0.3a에서 AI 채팅 버튼 탭으로도 조작 가능 |
| **진입 경로** | 하단 탭 장바구니, 카드 상세 "모두 담기", AI 채팅 ADD_TO_CART 버튼 탭 |
| **사용자 행동** | 담긴 재료 목록 확인 → 수량 변경·삭제 → 결제 진행 |
| **주요 기능** | • 담긴 재료 목록 + 수량 조절<br>• AI 채팅 연동 API: `POST /api/cart/items`, `PATCH /api/cart/items/:id`, `DELETE /api/cart/items/:id` (F034)<br>• 매장별 소계·배송비 표시<br>• **바로결제하기** 버튼 (F034: INITIATE_PAYMENT intent 연동) |
| **다음 이동** | 결제 → 결제 페이지. AI 채팅 버튼 탭 → 수량 변경 후 현재 화면 갱신 |

---

### 결제 (BUG-001 수정)

> **구현 기능:** `F005`, `F034` | **인증:** 필요

| 항목 | 내용 |
|------|------|
| **역할** | 토스페이먼츠 연동 결제 처리. v0.3a에서 AI 채팅 바로결제 버튼 진입 지원 + 콜백 처리 수정 |
| **진입 경로** | 장바구니 결제 버튼, AI 채팅 INITIATE_PAYMENT 버튼 탭 |
| **사용자 행동** | 결제 수단 선택 → 결제 진행 → 완료·실패 확인 |
| **주요 기능** | • 카카오페이·네이버페이·카드·계좌이체 결제 (F005)<br>• 결제 성공/실패/취소 콜백 처리 수정 (BUG-001)<br>• order 상태 전이 (PENDING → PAID → SHIPPING) 로직 검증<br>• AI 채팅 INITIATE_PAYMENT intent → 결제 페이지 딥링크 (F034) |
| **다음 이동** | 성공 → 주문 완료 페이지. 실패 → 에러 메시지 + 장바구니 복귀 |

---

### 검색 (Phase 5)

> **구현 기능:** `F024` | **인증:** 필요 | **Phase 5**

| 항목 | 내용 |
|------|------|
| **역할** | 전문 검색 허브 — 메뉴명·재료·테마·페르소나를 복합 검색해 빠른 카드 발견 |
| **진입 경로** | 하단 탭 검색 아이콘, 카드메뉴 홈 상단 검색바 |
| **사용자 행동** | 검색어 입력 → 메뉴·재료·AI 추천 탭에서 결과 확인 → 카드 상세 진입 |
| **주요 기능** | • 메뉴명·재료·카드 테마·페르소나 태그 복합 검색<br>• pgvector 코사인 유사도 1차 + pg_trgm LIKE 폴백 2차<br>• 결과 3탭 분리 (메뉴·재료·AI 추천)<br>• 최근 검색어·추천 검색어 표시 |
| **구현 기능 ID** | F024 |

---

### 마이페이지 — 영양 분석 (Phase 5)

> **구현 기능:** `F025` | **인증:** 필요 | **Phase 5**

| 항목 | 내용 |
|------|------|
| **역할** | 주간 영양 섭취 현황 — 웰빙 목표 대비 달성률을 시각화 |
| **진입 경로** | 마이페이지 → 영양 분석 탭 |
| **사용자 행동** | 주간 섭취 이력 확인, 특정 카드 영양 상세 조회 |
| **주요 기능** | • 주간 영양소(단백질·탄수화물·지방·나트륨·칼로리) 도넛 차트<br>• 웰빙 목표(저속노화·다이어트·근육강화·혈당관리) 달성률<br>• 카드 상세 내 개별 카드 영양 분석 서브뷰<br>• Recharts 기반 시계열 트렌드 |
| **구현 기능 ID** | F025 |

---

### 운영자 검수 큐 (Phase 5)

> **구현 기능:** `F026` | **인증:** 운영자 전용 | **Phase 5**

| 항목 | 내용 |
|------|------|
| **역할** | UGC 품질 관리 — dish_recipe 자기보강 후보와 사용자 생성 카드를 검토·승인 |
| **진입 경로** | 운영자 어드민 → 검수 큐 메뉴 |
| **사용자 행동** | REVIEW_NEEDED 항목 목록 조회 → 본문 확인 + LLM Judge 점수 검토 → 승인/거절/수정 |
| **주요 기능** | • dish_recipe.status='REVIEW_NEEDED' 항목 목록 + 페이징<br>• F013 사용자 카드 BP4 검수 목록 통합<br>• LLM Judge 점수·helpful_count 표시<br>• 승인 → ACTIVE / 거절 → REJECTED / 수정 후 재검토<br>• 운영자 1depth 답글 (card_note.is_admin_reply) |
| **구현 기능 ID** | F026 |

---

## 🗄️ 데이터 모델

> 완전한 v0.2 스키마 → [PRD-freshpickai-v0.2.md](./PRD-freshpickai-v0.2.md#-데이터-모델)

### 기존 핵심 테이블 (요약)

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

### v0.3a 신규 테이블 (AI 채팅 맥락 메모리 — F032)

| 테이블 | 핵심 필드 | 비고 |
|--------|---------|------|
| chat_message_raw | message_id, customer_id, session_id, role, content, created_at | 최근 원문 TTL 30일 |
| chat_session_summary | summary_id, customer_id, session_id, summary_text, keywords, created_at | 대화별 요약 압축 |
| memory_items | memory_id, customer_id, content, embedding, source_session_id, importance_score, created_at | 장기 기억 벡터 저장 |

### Phase 5 신규 테이블

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
- **Action JSON Renderer** (신규 v0.3a) — AI intent Enum → 버튼 UI 렌더링 (F033)
- **Web Speech API** (신규 v0.3a) — 음성 입력 Prototype (F035, 브라우저 내장)

### 상태 관리

- **Zustand** + persist — `useAuthStore` · `useCartStore` · `useChatStore` · `useKidsStore` · `useUIStore`
- **TanStack Query** — `qk.cards()` · `qk.card()` · `qk.daily()` · `qk.family()` · `qk.cart()` · `qk.memos()`

### AI & RAG

- **Vercel AI SDK** (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`) — `streamText` · `generateObject` · `ToolLoopAgent`
- **Anthropic Claude Sonnet 4.6** — 9 페르소나 응답·Tool Calling + **intent Enum 생성** (v0.3a F033)
- **Anthropic Claude Haiku 4.5** — 분류·요약·캐시 키 정규화 + **대화 요약 압축** (v0.3a F032)
- **OpenAI text-embedding-3-small** — 1536차원 한국어 임베딩 + **memory_items 벡터 검색** (v0.3a F032)

### v0.3a AI 채팅 처리 파이프라인 (F032 + F033)

```
음성/텍스트 입력
  → Web Speech API (F035, 음성 시)
  → Chat API Route
  → [3계층 메모리 검색] raw TTL → session summary → memory_items 벡터
  → LLM (Sonnet 4.6) — 9 페르소나 + 버튼 intent Enum 규칙 프롬프트
  → Response JSON { message: string, intents: ActionEnum[] }
  → Action JSON Renderer → 버튼 UI
  → 버튼 탭 → 서비스 API (찜/장바구니/결제)
```

**Action Enum 정의 (v0.3a F033)**:

```typescript
enum ChatActionEnum {
  ADD_TO_WISHLIST = 'ADD_TO_WISHLIST',
  ADD_TO_CART     = 'ADD_TO_CART',
  UPDATE_CART     = 'UPDATE_CART',
  REMOVE_FROM_CART = 'REMOVE_FROM_CART',
  INITIATE_PAYMENT = 'INITIATE_PAYMENT',
  VIEW_CARD       = 'VIEW_CARD',
  SEARCH_MORE     = 'SEARCH_MORE',
  CONFIRM_YES     = 'CONFIRM_YES',
  CONFIRM_NO      = 'CONFIRM_NO',
}
```

### 백엔드 & 데이터베이스

- **Supabase** — Auth + PostgreSQL + Storage + Realtime + **pgvector 0.8.x** (HNSW cosine)
- **pg_trgm** — 벡터 폴백 → ILIKE 폴백
- **토스페이먼츠 SDK** — 카카오페이·네이버페이·카드·계좌이체

### 배포 & 모니터링

- **Vercel** (Edge + Serverless) + Vercel Analytics + AI SDK OpenTelemetry + Sentry + PostHog
- **Playwright E2E** — CI `npm run check-all` 게이트
- **Firebase Cloud Messaging** — F023 푸시 알림 (Phase 5)
