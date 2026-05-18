# FreshPickAI PRD

> **📅 최종 업데이트**: 2026-05-18
> **📊 진행 상황**: Sprint 6 진행 중 — Task 055/056/057/059 완료 (F023/F024/F025/F027) + 인앱 알림함 + 핫픽스 3건 + F032 메모리 시스템 보강 + 모바일 성능 최적화 PERF 1~3단계 완료 + LCP 보강 + PWA 설치 배너 UX 개선 + FIX-010 gender·relationship 설계 변경 + 페르소나 컨텍스트 보강 + HOT-004 RAG 상태 표시 폴링 제거 + FIX-011 ChatBottomPanel 드래그 UX + MEMO-001 addToMemo 세션 기반 분리 + UX-013 핸들바 클릭 토글 + FIX-012 svh 뷰포트 호환성 + FIX-013 채팅 pull-to-refresh 차단 + PERF-캐시 unstable_cache + DB 쿼리 감소 + FIX-014~016 + PERF 가족보드 Suspense·투표 배치·AI RPC + FIX-017 상품 상세 detailImgLabel 표시
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

### 6. Sprint 6 구현 완료 기능 및 핫픽스 (2026-05-17)

> Task 055/056/057/059 완료 + 인앱 알림함(Task 055 보강) + 런타임 버그 2건 수정

**Sprint 6 완료 기능**

| ID | 기능명 | 완료 Task | 주요 구현 |
|----|--------|----------|----------|
| **F023** | FCM 푸시 알림 | Task 055 | firebase-admin, upsertFcmToken, sendPollCreatedNotification/sendMovieNightNotification/sendDeliveryNotification, Service Worker push 핸들러 |
| **F023b** | 인앱 알림 수신함 | Sprint 6 보강 | `fp_notifications` 테이블 · Realtime 배지 · `useNotificationStore` · `getUnreadCount()` Server Action |
| **F024** | 검색 고도화 | Task 056 | `/api/search` pg_trgm+pgvector 병렬 검색 · `SearchAutoComplete` 200ms 디바운스 · `FilterPanel` URL params 동기화 |
| **F025** | 영양 분석 차트 | Task 057 | `getWeeklyNutritionSummary` 7종 집계 · Recharts BarChart+RadarChart · `/profile/nutrition` 주차 탐색 |
| **F027** | OCR 장보기 메모 | Task 059 | Claude Haiku 4.5 Vision · `OCRCaptureButton` 카메라 캡처·미리보기 · `/memo` 페이지 통합 |

**Sprint 6 핫픽스**

| 항목 | 현상 | 수정 내용 | 영향 파일 |
|------|------|----------|----------|
| **HOT-001** NotificationProvider 이중 구독 | `onAuthStateChange` 마운트 즉시 `SIGNED_IN` 발화 → `setup()` 동시 2회 호출 → 채널명 충돌 `.on()` 에러 | `subscribedUserId` 중복 가드 도입 + `onAuthStateChange` 단일 진입점 재설계 | `src/components/push/NotificationProvider.tsx` |
| **HOT-002** PollCreateSheet `<button>` 중첩 | `SheetTrigger`(`@base-ui/react`) + `<Button>` 중첩 → Hydration 에러 | Base UI `render` prop 패턴 교체 + `trigger` 타입 `ReactNode → ReactElement` | `src/components/family/poll-create-sheet.tsx` |
| **HOT-003** AI RAG 와이파이 아이콘 미반영 | `useRagStatus` 마운트 시 1회만 체크 + `currentTool` 미연동 → RAG 검색 중에도 와이파이 아이콘이 녹색으로 바뀌지 않음 | 30초 폴링 재확인 추가 + `currentTool !== null` 조건으로 RAG 툴 활성화 시 `text-green-500 animate-pulse` 적용 | `src/components/chat/chat-header.tsx` |
| **HOT-004** RAG 상태 표시 폴링 제거 | HOT-003에서 도입한 30초 `/api/health` 폴링이 불필요한 API 요청 유발. 실제 스트림 오류와 무관한 연결 상태 체크 방식의 한계 | `useRagStatus()` 훅 완전 제거 → Zustand `ragError` 상태 직접 구독으로 교체. `useChatStream` 스트림 오류 시 `setRagError(true)`, 새 전송 시 자동 리셋 | `src/lib/store.ts`, `src/components/chat/chat-header.tsx`, `src/hooks/use-chat-stream.ts` |

---

### 7. F032 AI 채팅 메모리 시스템 보강 (2026-05-17)

> AI 채팅 서버 컴포넌트 전환 + 3계층 메모리 자동화 + 이전 세션 요약 UI

| ID | 항목 | 내용 | 영향 파일 |
|----|------|------|----------|
| **MEM-001** | ChatPage 서버 컴포넌트 전환 | `chat/page.tsx`를 서버 컴포넌트로 전환. `getRecentChatHistory(30)` SSR 로드 → `ChatShell` 클라이언트 컴포넌트에 `messages` + `latestSummary` 전달. 탭 재진입·새로고침 시 DB 최신 기록 표시 | `src/app/(main)/chat/page.tsx`, `src/components/chat/chat-shell.tsx` |
| **MEM-002** | Layer 2+3 자동 트리거 (8턴 주기) | `ai/chat/route.ts`에서 대화 8턴마다 `saveAndExtractMemory()` fire-and-forget 호출 → 세션 요약(Layer 2) + 장기 기억 추출(Layer 3) 자동화 | `src/app/api/ai/chat/route.ts`, `src/lib/chat/memory/store.ts` |
| **MEM-003** | `saveAndExtractMemory()` 통합 함수 | `saveSessionSummary()` + `upsertMemoryItems()` 두 단계를 단일 함수로 래핑. 오류 발생 시 throw하지 않고 `console.error`만 기록 | `src/lib/chat/memory/store.ts` |
| **MEM-004** | 이전 세션 요약 배너 | `MessageList`에 `latestSummary` props 추가. DB에서 복원된 대화가 있고 요약이 존재할 때 Mocha Mousse 배너 표시 + 키워드 칩 렌더링 | `src/components/chat/message-list.tsx` |
| **MEM-005** | 페이지 이탈 메모리 플러시 | `useChatStream`에 `beforeunload` 이벤트 리스너 추가 → `navigator.sendBeacon("/api/ai/memory/flush")` 호출. 탭 닫기·새로고침 시 미저장 대화 자동 플러시 | `src/hooks/use-chat-stream.ts` |
| **MEM-006** | `initMessages()` 스토어 액션 | `useChatStore`에 `initMessages(messages)` 추가. DB 기록을 sessionStorage보다 우선 복원 (탭 재진입 시 최신 DB 기록 표시) | `src/lib/store.ts` |
| **MEM-007** | 프로필 AI 메뉴 추가 | 프로필 페이지에 "AI 기억 관리" (`/profile/ai-memory`) + "대화 히스토리" (`/profile/chat-history`) 메뉴 항목 추가 | `src/app/(main)/profile/page.tsx` |

---

### 11. gender·relationship 설계 변경 (FIX-010 — 2026-05-18)

> AI 페르소나 추천 정확도 향상 + 초대 수락 시 가족 관계 선택 UX

| ID | 항목 | 내용 | 영향 파일 |
|----|------|------|----------|
| **DB-001** | `fp_user_profile.gender` 추가 | `male·female·other` TEXT, NULL 허용. 마이페이지 선호설정에서 CRUD, AI 페르소나 분류에 반영 | `supabase/migrations/20260518_018_gender_relationship.sql` |
| **DB-002** | `fp_family_member.relationship` 추가 | 13종 관계 Enum (`dad·mom·husband·wife·son·daughter·elder_brother·elder_sister·younger_brother·younger_sister·grandfather·grandmother·other`). 초대 수락 시 사용자 직접 선택. `NOT NULL DEFAULT 'other'` | `supabase/migrations/20260518_018_gender_relationship.sql` |
| **CONST-001** | 공통 상수 모듈 신설 | `RelationshipType`(13종), `GenderType`(3종), `FamilyRoleType`(3종), `RELATIONSHIP_CONFIG·GENDER_CONFIG·FAMILY_ROLE_CONFIG` 레이블+이모지 맵, `buildRoleLabel(familyRole, gender)` 조합 함수 | `src/lib/constants/relationship.ts` |
| **UX-001** | `RelationshipSelector` 컴포넌트 | 13종 관계 2열 그리드 UI. 선택 시 Mocha Mousse 하이라이트. 이모지+레이블 표시 | `src/components/family/relationship-selector.tsx` |
| **UX-002** | 초대 수락 관계 선택 | `InviteAcceptClient`: 관계 선택 → `joinFamilyByInvite(code, relationship)` → `/family?welcome=new|existing` 이동 | `src/app/(main)/family/invite/[code]/_components/invite-accept-client.tsx` |
| **UX-003** | 가족 보드 관계 표시 | `MemberGrid`: 멤버 아바타 하단에 관계 이모지+레이블 표시 | `src/components/family/member-grid.tsx` |
| **AI-001** | `PersonaContext` 보강 | `familyRole: FamilyRoleType`, `gender: GenderType \| null`, `familyRoleLabel: string` 추가. `buildPersonaContext()`에서 `buildRoleLabel()` 호출하여 "아빠", "엄마", "10대 남학생" 등 레이블 생성 | `src/lib/ai/persona-context.ts` |
| **AI-002** | AI 프롬프트·도구 업데이트 | 시스템 프롬프트에 `familyRoleLabel` 삽입. `get-user-context` 도구 응답에 `gender·familyRole` 포함. `recommend` 라우트에서 페르소나 정확도 강화 | `src/lib/ai/prompts.ts`, `src/lib/ai/tools/get-user-context.ts`, `src/app/api/ai/recommend/route.ts` |
| **PREF-001** | `PreferenceForm` gender/familyRole 추가 | 선호설정 폼에 성별(남성/여성/기타) + 가족 역할(부모/10대/아이) 선택 UI 추가. `updateUserProfile` Server Action에서 `gender·family_role` 저장 | `src/components/profile/PreferenceForm.tsx`, `src/lib/actions/profile/index.ts` |

---

### 12. ChatBottomPanel 드래그 UX + addToMemo 세션 기반 분리 (2026-05-18)

> 채팅 하단 패널 UX 통합 리팩터링 + 세션 단위 메모 주제 분리

**FIX-011 ChatBottomPanel 컴포넌트 분리**

| ID | 항목 | 내용 | 영향 파일 |
|----|------|------|----------|
| **UX-011** | `ChatBottomPanel` 신설 | 기존 `ChatShell`에 인라인으로 흩어져 있던 냉장고 버튼·`QuickChips`·`ChatInput`을 단일 컴포넌트로 통합. `@use-gesture/react` 드래그 핸들바(위↑ 펼침 / 아래↓ 접힘, 50px 임계)로 UI 열고닫기. Framer Motion `spring` 애니메이션 적용 | `src/components/chat/chat-bottom-panel.tsx` (신규) |
| **UX-012** | 자동 접힘 동작 | AI 스트리밍 시작 시 `startTransition(() => setIsExpanded(false))`로 cascading render 방지하며 자동 접힘. 메시지 전송 시에도 접힘 | `src/components/chat/chat-bottom-panel.tsx` |
| **REFACT-011** | `ChatShell` 간소화 | 인라인 냉장고 버튼·`QuickChips`·`ChatInput` 제거 → `<ChatBottomPanel>` 단일 호출로 교체 | `src/components/chat/chat-shell.tsx` |
| **UX-013** | 핸들바 클릭 토글 + 상태 레이블 | 드래그 핸들바에 `onClick` 토글 추가(드래그 외 탭으로도 접기/펼치기 가능). `ChevronDown/Up` 아이콘 + "접기/펼치기" 10px 텍스트 레이블 표시. 핸들바 높이 `h-5 → h-8` 확장 | `src/components/chat/chat-bottom-panel.tsx` |
| **FIX-012** | `dvh → svh` 뷰포트 단위 수정 | `ChatShell` 컨테이너 높이 `100dvh → 100svh` 교체. `dvh`(Dynamic Viewport Height)는 iOS Safari에서 주소창 크기 변화에 따라 레이아웃이 흔들리는 문제 → `svh`(Small Viewport Height, 항상 최소 뷰포트 기준)로 안정화 | `src/components/chat/chat-shell.tsx` |
| **FIX-013** | 채팅 화면 pull-to-refresh 차단 | `ChatShell` 마운트 시 `document.body.style.overscrollBehaviorY = "none"` 적용 → 채팅 화면 이탈 시 원복(`cleanup`). `MessageList` 스크롤 컨테이너에 `overscroll-y-contain` 추가 → 메시지 목록 내부 스크롤이 body 오버스크롤로 전파되지 않도록 격리 | `src/components/chat/chat-shell.tsx`, `src/components/chat/message-list.tsx` |

**MEMO-001 addToMemo 세션 기반 분리**

| ID | 항목 | 내용 | 영향 파일 |
|----|------|------|----------|
| **DB-M019** | `fp_shopping_memo.session_id` 추가 | `TEXT` 컬럼 추가. 세션 기반 조회 단일 인덱스 + `(user_id, session_id)` 복합 인덱스(Partial WHERE session_id IS NOT NULL) 추가 | `supabase/migrations/20260518_019_memo_session_id.sql` |
| **TOOL-001** | `addToMemo` 세션 기반 조회 전략 | 세션 ID 전달 시: ①세션 일치 기존 메모 조회 → ②타이틀 폴백 → ③신규 생성(session_id 저장). 동일 세션 내 누적 저장, 세션 변경 시 새 메모 자동 분리 | `src/lib/ai/tools/add-to-memo.ts` |
| **TOOL-002** | `topic` 파라미터 추가 | AI가 대화 맥락에서 주제 키워드(예: '주말식사', '주중도시락', '간식')를 자동 추출. 메모 제목에 `· 주제` 접미사로 반영 (`AI 추천 장보기 (날짜) · 주제`) | `src/lib/ai/tools/add-to-memo.ts` |
| **ROUTE-001** | `sessionId` 라우트 전달 | `/api/ai/chat` Route Handler에서 `createAddToMemoTool(user.id, supabase, sessionId)` 형태로 세션 ID 주입 | `src/app/api/ai/chat/route.ts` |

---

### 13. 캐시 최적화 + DB 쿼리 감소 + 버그 수정 (2026-05-18)

> 서버 응답 속도 개선 — `unstable_cache` 도입 + auth 중복 호출 제거 + revalidateTag 연동

**PERF: unstable_cache 캐시 최적화**

| ID | 항목 | 내용 | 영향 파일 |
|----|------|------|----------|
| **PERF-C01** | 페르소나 컨텍스트 5분 캐시 | `buildPersonaContext()` 내 DB 조회(`fp_user_preference`·`fp_user_profile`)를 `unstable_cache` 래핑. TTL 300초, `persona-context` 태그. 선호 설정 변경 시 `revalidateTag("persona-context")` 즉시 무효화 | `src/lib/ai/persona-context.ts` |
| **PERF-C02** | 대분류 목록 1시간 캐시 | `getLargeCategoriesAction()` → admin client 기반 `_fetchLargeCategories()` `unstable_cache` 래핑. TTL 3600초, `large-categories` 태그. 정적 데이터라 재배포 전까지 변경 없음 | `src/lib/actions/category/index.ts` |
| **PERF-C03** | 카테고리 페이지 `force-dynamic` 제거 | `category/page.tsx`의 `export const dynamic = "force-dynamic"` 삭제 → 정적 캐시 허용으로 전환 | `src/app/(main)/category/page.tsx` |

**PERF: DB 쿼리 중복 제거**

| ID | 항목 | 내용 | 영향 파일 |
|----|------|------|----------|
| **PERF-Q01** | 가족 Server Actions `userId` 파라미터화 | `getFamilyGroup(userId?)` · `getFamilyMembers(userId?)` · `getFamilyStatsAction(userId?)` — 옵셔널 `userId` 파라미터 추가. 호출 측에서 이미 확보한 `user.id`를 직접 전달해 내부 `supabase.auth.getUser()` 호출 제거 | `src/lib/actions/family/index.ts`, `src/app/(main)/family/page.tsx` |
| **PERF-Q02** | profile 페이지 중복 쿼리 제거 | `ProfilePage`에서 `fp_user_preference` 별도 쿼리 제거. `buildPersonaContext()` ctx에서 `dietaryTags·householdSize·cookingSkill·preferredShoppingTime·familyRole·gender` 직접 추출 (DB 왕복 1회 절감) | `src/app/(main)/profile/page.tsx` |

**FIX: 버그 수정 3건**

| ID | 항목 | 현상 | 수정 내용 | 영향 파일 |
|----|------|------|----------|----------|
| **FIX-014** | 온보딩 후 persona 캐시 stale | 온보딩 완료/스킵 시 페르소나 캐시가 갱신되지 않아 구 데이터 사용 | `saveOnboarding()` · `skipOnboardingAction()` 완료 후 `revalidateTag("persona-context")` 호출. 신규 가입자 AI 추천 타임스탬프(`ai_recommend_generated_at`) 초기화하여 홈 즉시 Claude 호출 방지 | `src/lib/actions/auth/onboarding.ts` |
| **FIX-015** | `getPollResults` 불필요한 쿼리 + 타입 캐스팅 버그 | 4번째 `members` 쿼리가 이미 `fpPoll.groupId`로 대체 가능. `totalTargeted` 계산 시 `(memberCount as unknown as { count })` 잘못된 캐스팅 | `members` 쿼리 제거(3개 병렬로 축소). `count: "exact", head: true` 로 직접 숫자 반환. 타입 캐스팅 제거 | `src/lib/actions/family/poll.ts` |
| **FIX-016** | PWA SW 업데이트 시 화면 미반영 | SW 업데이트 후 `controllerchange` 이벤트가 발생해도 페이지가 자동 새로고침되지 않음 | `InstallBanner`에 `controllerchange` 이벤트 리스너 추가 → 기존 SW 교체 시 `window.location.reload()`. 최초 설치(`hadController=false`) 시엔 새로고침 제외 | `src/components/pwa/install-banner.tsx` |

**revalidateTag 연동 전체 맵**

| 태그 | 무효화 시점 |
|------|------------|
| `persona-context` | `updateUserProfile()` · `saveOnboarding()` · `skipOnboardingAction()` · `applyInferredTags()` · `saveUserPreference()` |
| `large-categories` | 재배포 또는 수동 revalidate |

---

### 14. 가족보드 성능 스프린트 (2026-05-18)

> 가족 페이지 TTFB 단축 — Suspense 스트리밍 분리 + 투표 N+1 → 배치 쿼리 + AI 추천 RPC 전환

| ID | 항목 | 내용 | 영향 파일 |
|----|------|------|----------|
| **PERF-P01** | `DinnerVoteLoader` Suspense 스트리밍 분리 | `FamilyPage`에서 DinnerVote·PopularRanking·TrendingCards 로직(AI 메뉴 추천·투표 세션·월간 랭킹)을 `DinnerVoteLoader` async Server Component로 추출. `<Suspense fallback={<DinnerVoteSkeleton />}>` 래핑 → 나머지 가족 보드 UI를 블로킹 없이 먼저 렌더링 | `src/components/family/dinner-vote-loader.tsx` (신규), `src/app/(main)/family/page.tsx` |
| **PERF-P02** | 투표 N+1 → `getBatchPollData()` 4쿼리 배치 | 기존: 투표 안건당 `getPollResults` + `getMyPollVote` 각 2쿼리 → N×2 쿼리. 개선: `fp_get_batch_poll_results` RPC + 전체 투표 조회 + 내 투표 조회 + 멤버 수 조회 총 4쿼리로 처리. 활성/종료 투표 배치를 `Promise.all([getBatchPollData(active), getBatchPollData(closed)])` 병렬 실행 | `src/lib/actions/family/poll.ts`, `src/app/(main)/family/page.tsx` |
| **PERF-P03** | `getCardIdsFromStoreItems()` 2쿼리 → 1 RPC | 기존: `fp_dish_ingredient` 조회(1) → `fp_card_dish` 조회(2) 순차 2쿼리. 개선: `fp_get_card_ids_from_store_items` RPC 단일 호출로 통합 | `src/app/api/ai/recommend/route.ts` |

---

### 15. 상품 상세 detailImgLabel 표시 (FIX-017 — 2026-05-18)

> `v_store_inventory_item.item_detail_img_label` 컬럼을 상품 상세 이미지 하단에 렌더링

| ID | 항목 | 내용 | 영향 파일 |
|----|------|------|----------|
| **FIX-017a** | `CategoryItemDetail` 타입 확장 | `detailImgLabel: string \| null` 필드 추가. `getItemByIdAction()` SELECT 쿼리에 `item_detail_img_label` 컬럼 추가 및 반환 객체 매핑 | `src/lib/actions/category/index.ts` |
| **FIX-017b** | 상품 상세 레이블 렌더링 | 이미지 상세 `<details>` 섹션 표시 조건 `detailImages.length > 0` → `detailImages.length > 0 \|\| item.detailImgLabel`로 확장. 이미지 목록 하단에 `detailImgLabel` 13px `whitespace-pre-line` 텍스트 표시 | `src/app/(main)/category/[itemId]/page.tsx` |

---

### 8. MVP 이후 기능 (Phase 5~6 잔여)

| ID | 기능명 | Phase | 상태 |
|----|--------|-------|------|
| F023 | FCM 푸시 알림 | Phase 5 | ✅ 완료 (Task 055) |
| F023b | 인앱 알림 수신함 | Phase 5 | ✅ 완료 (Sprint 6 보강) |
| F024 | 검색 고도화 | Phase 5 | ✅ 완료 (Task 056) |
| F025 | 영양 분석 차트 | Phase 5 | ✅ 완료 (Task 057) |
| F026 | 운영자 검수 큐 | Phase 5 | 🔜 Task 058 |
| F027 | OCR 장보기 메모 | Phase 5 | ✅ 완료 (Task 059) |
| F028 | 멀티 매장 가격 비교 | Phase 5 | 🔜 Task 060 |
| F029 | 정기 배송 구독 | Phase 6 | 🔜 Task 061 |
| F031 | 운영자 대시보드 | Phase 6 | 🔜 Task 063 |

---

### 9. 모바일 성능 최적화 (PERF — 2026-05-17)

> 모바일 로딩 속도 저하 대응 — 소스 구조·캐시·API·DB 인덱싱 전방위 개선 (1~3단계 완료, 4단계 운영테스트 후 적용)

**✅ 1단계 — 즉시 적용**

| 포인트 | 변경 파일 | 내용 | 효과 |
|--------|-----------|------|------|
| P1 DailyPick 쿼리 최적화 | `src/lib/actions/cards/index.ts` | 전체 N행 → `count` + `.range(idx,idx)` 단일 행 반환 | 서버 응답 40~60% 단축 |
| P2 이미지 CDN TTL | `next.config.ts` | `minimumCacheTTL: 60` → `86400` (24h) | 재방문 LCP 25~35% 향상 |
| P3 Pretendard preload | `src/app/layout.tsx` | `preload: false` → `true` | CLS 0 수렴, 텍스트 렌더 20~30% 향상 |
| P7 번들 트리셰이킹 | `next.config.ts` | `optimizePackageImports`에 radix-ui 3종·recharts·date-fns 추가 | JS 파싱 5~10% 감소 |

**✅ 2단계 — 번들 분리**

| 포인트 | 변경 파일 | 내용 | 효과 |
|--------|-----------|------|------|
| P5 Firebase 동적 임포트 | `src/components/layout/client-providers.tsx` (신설) | `ClientProviders` Client Component 분리 → `FcmInitializer`·`NotificationProvider` `dynamic({ ssr: false })` 래핑. Next.js 16 Server Component 내 `ssr:false` 금지 규칙 대응 | 초기 JS 15~25% 감소, Firebase ~150KB 번들 제외 |
| P5 Firebase 모듈 지연 | `src/hooks/useFcmToken.ts` | firebase 모듈 static → 함수 내 `await import()` 전환 | Firebase 패키지 코드 분할 |
| P6 recharts 동적 임포트 | `src/app/(main)/profile/nutrition/page.tsx` | `WeeklyNutritionChart` → `dynamic({ ssr: false })` | 홈/카드 초기 번들 10~15% 감소 |
| P9 API CDN 캐시 | `src/app/api/cards/route.ts`, `cards/[id]/route.ts`, `daily-pick/route.ts` | `Cache-Control: public, s-maxage` 헤더 추가 (공식카드 300s, 카드상세 300s, 데일리픽 3600s) | Vercel Edge CDN 서빙, 10~30ms 응답 |

**✅ 3단계 — DB + 서버 로직**

| 포인트 | 변경 파일 | 내용 | 효과 |
|--------|-----------|------|------|
| P4 getCard RPC | `src/lib/actions/cards/index.ts` | 3 round-trip → `fp_get_card_detail` RPC 1 round-trip | 카드 상세 35~50% 단축 |
| P8 검색 MV 전환 | `src/app/api/search/route.ts` | `v_store_inventory_item(VIEW)` → `mv_store_item_slim(GIN trgm 인덱스)` | 상품 검색 50~80% 단축 |
| P10 임베딩 캐시 | `src/lib/ai/vector-search.ts` | `unstable_cache` 1시간 — 동일 검색어 OpenAI 호출 생략 | 반복 검색 30~40% 단축 |
| P12 LCP 이미지 priority | `src/components/home/AIRecommendSection.tsx` | AI 추천 캐러셀 첫 번째 카드 `priority={true}` → `<link rel="preload">` + `fetchpriority="high"` 자동 적용 | LCP Core Web Vitals 개선 |
| DB 인덱스 3종 | Supabase 마이그레이션 | `fp_menu_card` 복합 필터 인덱스 + trgm GIN 인덱스, `fp_memory_items` customer 인덱스 | 카드 검색·RAG 조회 최적화 |

**실측 성능 (개발 서버 기준 — 2026-05-17 측정)**

| 지표 | 캐시 전 (cold) | 캐시 후 (warm) | 개선율 |
|------|---------------|---------------|--------|
| 홈 페이지 로드 (GET /) | 1,422ms | 338ms | **76% ↓** |
| AI 추천 메타 API | 620ms | 120ms | **80% ↓** |
| 알림 미읽음 수 조회 | 486ms | 126ms | **74% ↓** |

**🔜 4단계 — 운영테스트 완료 후 적용 예정**

| 포인트 | 내용 | 주의사항 |
|--------|------|----------|
| P11 PWA SW 이미지 캐싱 전략 | `src/sw.ts` — `/_next/image` `NetworkFirst` → `StaleWhileRevalidate` (7일) | 이미지 변경 시 최대 7일 구버전 노출 가능. 빈도 확인 후 `maxAgeSeconds` 조정 (7일 → 1일 단축 가능) |

---

### 10. PWA 설치 경험 개선 (2026-05-17)

> 모바일 사용자가 홈 화면에 FreshPick AI를 설치하도록 유도하는 UX 개선

| ID | 항목 | 내용 | 영향 파일 |
|----|------|------|----------|
| **PWA-001** | `usePwaInstall` 훅 | `BeforeInstallPromptEvent` 캡처(Android Chrome) + iOS Safari 감지 + `display-mode: standalone` 설치 완료 감지 + localStorage 7일 닫기 기억 (`pwa-install-dismissed` 키) | `src/hooks/usePwaInstall.ts` |
| **PWA-002** | `InstallBanner` 컴포넌트 | 모바일 하단 고정 배너 (z-50, safe-area-pb). Android: 네이티브 `prompt()` 설치 플로우. iOS: "Safari 공유 → 홈 화면에 추가 → 추가" 3단계 가이드 모달. 닫기 시 7일간 재노출 억제 | `src/components/pwa/install-banner.tsx` |
| **PWA-003** | 레이아웃 전역 배치 | `layout.tsx`에 `<InstallBanner />` 추가 → 전체 페이지에서 설치 배너 노출 | `src/app/layout.tsx` |

**노출 조건**: 모바일 UA (`/android|iphone|ipad|ipod|mobile/i`) + 미설치 + 미닫힘 + (Android `BeforeInstallPrompt` 이벤트 캡처 OR iOS 감지)

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
| family_group / family_member | group_id, group_name, member_id, role, **relationship** (13종) | 가족 그룹 |
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

### FIX-010 스키마 변경 (2026-05-18)

| 테이블 | 변경 내용 | 비고 |
|--------|---------|------|
| fp_user_profile | `gender TEXT CHECK(male\|female\|other) DEFAULT NULL` 추가 | AI 페르소나 분류, 마이페이지 선호설정 |
| fp_family_member | `relationship TEXT NOT NULL DEFAULT 'other' CHECK(13종)` 추가 | 초대 수락 시 관계 선택, 가족 보드 표시 |

### Phase 5 신규 테이블

| 테이블 | 핵심 필드 | 비고 |
|--------|---------|------|
| nutrition_log | log_id, customer_id, card_id, calories, protein, carbs, fat | F025 영양 이력 |
| search_log | log_id, customer_id, query, result_count, created_at | F024 검색 분석 |
| push_subscription | sub_id, customer_id, endpoint, keys | F023 FCM 구독 |
| fp_notifications | id, user_id, type(vote\|movie_night\|delivery\|system), title, body, link_url, is_read, read_at | F023b 인앱 알림 수신함 · Realtime 배지 |
| fp_poll | poll_id, group_id, title, options JSONB, ends_at, poll_type, status | F023 가족 투표 |
| fp_poll_vote | vote_id, poll_id, voter_id, option_id | F023 투표 참여 |
| fp_user_notification_settings | user_id, vote_enabled, movie_night_enabled, delivery_enabled | F023 알림 설정 |

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
