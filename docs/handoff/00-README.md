# FreshPickai · Claude Code Handoff Package
**Edition:** Mocha Mousse 2025→26 (Pantone 17-1230 + Olive Branch + Bree Serif)
**Tone reference:** 마켓컬리 × Aesop × 다이소 — 따뜻한 웰니스 / 종이 질감 / 사이드보드 타이포그래피
**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Zustand + shadcn/ui

---

## 패키지 구성

| # | 파일 | 용도 |
|---|---|---|
| 00 | **README.md**           | 본 문서 — 핸드오프 개요 |
| 01 | **PRD.md**              | 제품 요구사항 (왜 / 누구 / 무엇을) |
| 02 | **design-tokens.md**    | 컬러 · 타이포 · 스페이싱 (Tailwind 매핑 포함) |
| 03 | **tailwind.config.ts**  | Tailwind 설정 — 그대로 복사 |
| 04 | **globals.css**         | CSS 변수 + Bree Serif/Pretendard 로딩 |
| 05 | **components-spec.md**  | 화면별 컴포넌트 트리 + props |
| 06 | **routing.md**          | Next.js App Router 구조 + 데이터 패칭 |
| 07 | **state-store.ts**      | Zustand 스토어 스캐폴드 |
| 08 | **types.ts**            | TypeScript 타입 정의 |
| 09 | **api-spec.md**         | RAG/AI 엔드포인트 + 결제/배송 연동 |
| 10 | **sprint-plan.md**      | 6주 스프린트 (P0/P1/P2 우선순위) |
| 11 | **claude-code-prompt.md** | Claude Code에 붙여넣을 마스터 프롬프트 |

---

## 빠른 시작 (Claude Code)

```bash
# 1) 프로젝트 부트스트랩
npx create-next-app@latest freshpickai-app --ts --tailwind --app --src-dir --import-alias "@/*"
cd freshpickai-app

# 2) 핵심 의존성
pnpm add zustand @tanstack/react-query
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs
pnpm add lucide-react clsx tailwind-merge class-variance-authority
pnpm add -D @types/node

# 3) shadcn/ui 셋업
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog tabs badge

# 4) 본 패키지의 03~08 파일을 해당 위치에 복사
#    → tailwind.config.ts          (root)
#    → src/app/globals.css         (overwrite)
#    → src/lib/store.ts            ← state-store.ts
#    → src/lib/types.ts            ← types.ts
```

이후 `11-claude-code-prompt.md`를 Claude Code에 붙여넣으면 화면 단위로 자동 구현 시작.

---

## 디자인 결과물 위치

- **Live HTML 시안:** `../FreshPick AI장보기 - Mocha Mousse.html`
- **컴포넌트 React 소스:** `../prototype/screens-1.jsx`, `../prototype/screens-2.jsx`
- **CSS 토큰 원본:** `../prototype/styles-mocha.css`

위 파일들을 Claude Code 컨텍스트에 함께 첨부할 것 — 픽셀 단위 페어리티 확보의 핵심.
