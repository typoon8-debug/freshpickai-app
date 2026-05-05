# Claude Code Master Prompt

> 아래 블록을 Claude Code 세션에 그대로 붙여넣으세요. 이 핸드오프 폴더(`handoff/`)와 라이브 시안(`FreshPick AI장보기 - Mocha Mousse.html`, `prototype/screens-1.jsx`, `prototype/screens-2.jsx`, `prototype/styles-mocha.css`)을 컨텍스트에 첨부할 것.

---

## 🎯 프롬프트

```
당신은 Next.js 14 + TypeScript + Tailwind + Zustand 시니어 프론트엔드 엔지니어입니다.
"FreshPick" — 우리가족 AI 큐레이팅 장보기 앱을 구현합니다.

## 디자인 입력
- 라이브 HTML 시안: `FreshPick AI장보기 - Mocha Mousse.html` (10개 화면, 픽셀 페어리티 기준)
- 컴포넌트 React 소스: `prototype/screens-1.jsx`, `prototype/screens-2.jsx`
- CSS 토큰: `prototype/styles-mocha.css`
- 핸드오프 문서: `handoff/00-README.md` ~ `handoff/10-sprint-plan.md`

## 디자인 시스템 (절대 변경 금지)
- 컬러: Mocha Mousse 700 = #6B4A2E (primary), Olive 500 = #6B7A3B (accent)
- 폰트: Bree Serif (display), Pretendard (body)
- 코너: 4px (sharp · 마켓컬리 톤), 50% (avatar), 100px (chip)
- 톤: 따뜻한 종이 느낌 / 사이드보드 타이포그래피 / 광택 없는 매트한 표면

## 작업 순서 (Sprint 1 먼저)
1. `handoff/03-tailwind.config.ts` → root 복사
2. `handoff/04-globals.css` → src/app/globals.css 복사
3. `handoff/07-state-store.ts` → src/lib/store.ts 복사
4. `handoff/08-types.ts` → src/lib/types.ts 복사
5. 화면 구현은 `handoff/05-components-spec.md` 트리를 그대로 따를 것
6. 라우팅은 `handoff/06-routing.md` 그대로

## 화면별 구현 규칙
각 화면은 다음 순서로:
  ① `prototype/screens-*.jsx`에서 해당 React 함수 구조 그대로 가져옴
  ② className을 Tailwind 유틸리티로 1:1 변환 (커스텀 클래스 최소화)
  ③ TypeScript 타입 추가 (handoff/08-types.ts 참조)
  ④ TanStack Query로 데이터 페칭 분리 (handoff/06)
  ⑤ Zustand 스토어 연결 (handoff/07)

## 절대 하지 말 것
- 새 컬러 만들기 (토큰만 사용)
- 코너 라운드 키우기 (4px 유지 — 마켓컬리 톤)
- 그라디언트 추가 (라이브 시안에 없으면 절대 안 됨)
- 이모지 임의 추가 (시안에 정의된 것만)
- 헤드라인을 Pretendard로 (Bree Serif 필수)

## 우선 작업: Sprint 1 (Login + Home + Card Detail)
- `handoff/10-sprint-plan.md` Sprint 1 항목을 모두 완료하면 알려주세요
- 각 화면 완성 시 라이브 시안과 비교 스크린샷을 보여주세요

## 출력 포맷
- 각 파일을 만들 때마다 짧은 ✅ 체크리스트로 진행 상황 보고
- 전체 코드 dump가 아닌 diff 단위로 보여주세요
- 의문점은 작업 시작 전에 한 번에 모아 질문

자, 시작합시다. 먼저 `handoff/00-README.md`부터 읽고 빠른 시작 명령을 실행해주세요.
```

---

## 📎 첨부 체크리스트 (Claude Code 세션에 함께 붙일 파일)

- [ ] `FreshPick AI장보기 - Mocha Mousse.html`
- [ ] `prototype/data.jsx`
- [ ] `prototype/screens-1.jsx`
- [ ] `prototype/screens-2.jsx`
- [ ] `prototype/styles-mocha.css`
- [ ] `handoff/` 폴더 전체

---

## 🛟 자주 발생하는 이슈

| 증상 | 원인 | 해결 |
|---|---|---|
| Bree Serif 안 뜸 | next/font 설정 누락 | `app/layout.tsx`에서 `Bree_Serif`를 next/font로 import 후 `--font-display` CSS 변수에 매핑 |
| 카드 그림자 너무 짙음 | shadow-lg 사용 | `shadow-card` (= 1px line) 사용. Mocha 톤은 그림자보다 '선'이 우선 |
| flip 애니 깨짐 | parent에 perspective 없음 | container에 `[perspective:1200px]` 추가 |
| 모바일 가로 스크롤 | 그리드 overflow | `overflow-x-hidden` on body, 카드 그리드는 `grid-cols-2` 고정 |
