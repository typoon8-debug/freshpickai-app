# 6-Week Sprint Plan

> 2 devs (1 FE / 1 FS) · 1 designer · 디자인은 본 핸드오프 기준 픽셀 페어리티

## Sprint 0 — Setup (Week 0, 3일)
- [ ] Next.js 14 부트스트랩 (`create-next-app`)
- [ ] Tailwind 토큰 적용 (`03-tailwind.config.ts`, `04-globals.css`)
- [ ] shadcn/ui 초기화 + 기본 컴포넌트 add
- [ ] Vercel 프로젝트 + 도메인 + 환경변수
- [ ] 백엔드 API 모킹 (MSW or `/api/mock/*`)
- [ ] Storybook 셋업 (선택)

## Sprint 1 — Foundation + 카드 발견 (Week 1–2) · P0
- [ ] **01 Login** — 카카오/네이버/이메일
- [ ] **02 Home** — Daily hero + 필터 + 카드 그리드 (RSC + 필터 client island)
- [ ] **03 Card Detail** — flip 애니메이션 + 한꺼번에 담기
- [ ] `useAuthStore`, `useCartStore` 적용
- [ ] 미들웨어 인증 게이트
- [ ] **DOD:** 로그인 → 홈 → 카드 → 담기까지 클릭 가능 (모킹된 데이터)

## Sprint 2 — AI Chat (Week 3) · P0
- [ ] **04 AI Chat** — SSE 스트리밍
- [ ] RAG 추천 카드 carousel
- [ ] 빠른칩 (비건/매운맛/예산)
- [ ] `useChatStore` + 스크롤 자동 이동
- [ ] **DOD:** 자연어 입력 → 토큰 스트리밍 + 카드 추천 → 담기 연결

## Sprint 3 — Cart + Checkout (Week 4) · P0
- [ ] **08 Cart** — 카드별 그룹 + 무료배송 진행률
- [ ] **09 Checkout** — 주소/결제수단/포인트/쿠폰
- [ ] 토스페이먼츠 SDK 통합 (테스트키)
- [ ] 주문 생성 server action
- [ ] **DOD:** 결제 테스트 완료 (토스 샌드박스)

## Sprint 4 — Family + Memo (Week 5) · P1
- [ ] **05 Family Board** — 멤버 + 투표 + TOP3 + 트렌딩
- [ ] **07 Memo** — CRUD + AI 카드 변환 stub
- [ ] WebSocket 투표 실시간 업데이트
- [ ] **DOD:** 두 디바이스에서 동시 투표 시 즉시 동기화

## Sprint 5 — Kids + Wizard + Polish (Week 6) · P1/P2
- [ ] **06 Kids Mode** — 마스코트 + 미션 + 업적
- [ ] **10 Card Wizard** — 4단계 + 미리보기
- [ ] 접근성 감사 (axe) + Lighthouse 90+
- [ ] PWA manifest + offline shell
- [ ] **DOD:** 베타 출시 가능

## 출시 후 (P2)
- 알림 (FCM)
- 검색 + 필터 고도화
- 영양분석 그래프
- 정기배송
- OCR 메모

## Definition of Done (전체)
- 모든 화면 Lighthouse Mobile ≥ 90
- 모든 인터랙션 hit target ≥ 44px
- WCAG AA 통과
- E2E (Playwright) 핵심 시나리오 5개 그린
- Sentry / PostHog 통합
