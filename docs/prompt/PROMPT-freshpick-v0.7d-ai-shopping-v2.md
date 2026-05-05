# PROMPT — freshpick-app v0.7d AI장보기 점진 개선 (탭 재구성 + AI채팅 + 5테마 AI추천)

> **작성일**: 2026-05-04 (v2 — 탭 재구성·자연어 메모 추가·AI추천 5테마 반영)
> **대상 버전**: freshpick-app **v0.7d** (현행 v0.7c 다음 정식 버전)
> **선행 버전**: v0.7c — Hotfix BF (PWA) 까지 완료, Phase 5 v0.7 신규 요구사항 6/10 진행 중
> **다음 버전**: v1.0 — RAG 본격 도입 (별도 프롬프트 `PROMPT-freshpick-v1.0-ai-rag.md` 참조)
> **목표 기간**: 3~4주 (단일 sprint, v1 대비 +1주 — AI추천 5테마 + addToMemo tool)
> **전제**: 시스템 아직 오픈 전, 기존 30개 보정 사전은 샘플

---

## 0. 이 프롬프트의 사용법

이 프롬프트는 **Claude Code**에 1회 또는 Phase 단위로 전달하여 v0.7d의 AI장보기 개선 Task로 실행시키는 것을 목적으로 작성되었습니다.

> **시작 명령**
>
> > 다음은 freshpick-app v0.7d의 AI장보기 점진 개선 Task 명세입니다. 핵심 변경은 (1) AI장보기 탭 구조 재편 [내메모·AI추천·자동리스트] → [AI채팅·내메모·AI추천], (2) AI채팅의 자연어 명령으로 내메모 자동 추가 (lightweight tool 1개), (3) AI추천 탭을 카테고리 TOP3 나열형 → 5개 테마 섹션 구조로 재설계 입니다. v1.0의 RAG 인프라(pgvector·ToolLoopAgent·시맨틱 캐시)는 도입하지 않습니다. 각 Phase는 독립 PR로 분리하고 `npm run check-all` + `npm run build`를 통과시킨 후 커밋하세요.

---

## 1. v0.7d 범위 정의 — 무엇을 하고 / 하지 않는가

### 1.1 v0.7d에서 **할 것** (6가지, v1 대비 +2)

| 항목 | 이유 |
|------|------|
| **A. AI장보기 탭 재구성** [AI채팅·내메모·AI추천] | "AI가 도와준다"는 첫 인상 강화, 자동리스트 흡수로 한 화면 한 책임 |
| **B. AI채팅 화면 + LLM streamText (+ addToMemo tool 1개)** | 채팅으로 끝나지 않고 **메모 추가 액션**까지 자연어로 연결 |
| **C. AI추천 탭 5테마 재설계** | 8개 단순 나열 → 결정 피로를 줄이는 테마형 카드 그룹 |
| **D. F014/F015 보강 (자동리스트 흡수)** | 자동리스트 탭은 제거, F015는 AI추천 "지금이 적기" 테마로 흡수 |
| **E. `customer_preference` 데이터 수집 시작** | v1.0 RAG가 활용할 데이터를 미리 모음 |
| **F. 페르소나 컨텍스트 빌더** | 채팅·5테마 모두 동일 페르소나 컨텍스트 사용 |

### 1.2 v0.7d에서 **하지 않을 것** (v1.0으로 미루는 것)

| 항목 | 미루는 이유 |
|------|------------|
| ❌ Supabase pgvector / 임베딩 인프라 | 활성화·인덱스·HNSW 빌드는 1.0의 본격 RAG에서 |
| ❌ `tenant_item_ai_detail` 테이블 + 청킹·임베딩 백필 | 데이터 적재가 본격적인 ETL 작업 |
| ❌ Vercel AI SDK `ToolLoopAgent` + 4개 tool | v0.7d는 **tool 1개(addToMemo)만** 도입, 4개 tool 전체는 v1.0 |
| ❌ 시맨틱 캐시 (`ai_query_cache`) | 사용자 데이터 누적 후 ROI 측정 가능 |
| ❌ 자기보강 루프 + manager-app 검토 큐 | 운영 가드 없이 시작하면 부정확 정보 누적 |
| ❌ AI Gateway·멀티 모델 라우팅 | 단일 모델로 비용·품질 베이스라인 확보 후 |
| ❌ 페르소나 시그니처 자동 추론 | `customer_preference` 명시 입력만으로 출발 |
| ❌ 채팅에서 장바구니 직접 추가 | v1.0의 `addToCart` tool에서. v0.7d는 "메모 추가" + "검색 화면 이동"까지만 |

이 분리 원칙은 **"운영 가드 + 데이터 기반"이 갖춰지지 않은 단계에서 LLM을 깊게 묶지 않는다**입니다. v0.7d에서 LLM은 **stateless + lightweight tool 1개**로만 작동합니다.

---

## 2. 컨텍스트 (작업 시작 전 반드시 확인)

### 2.1 현행 freshpick-app v0.7c 상태 (확인된 사실)

- **AI장보기 진입**: 하단 탭 → `/ai-shopping`, 3개 내부탭 [내메모 · AI추천 · 자동리스트] (Hotfix BA, 기본 탭=내메모) **— v0.7d에서 재구성**
- **F014 AI 추천**: `lib/api/recommendations.ts` `getAiRecommendations(customerId, storeId)` — `order_detail` 기반 카테고리 TOP3 + `inventory` JOIN
- **F015 자동 리스트**: `lib/api/purchasePattern.ts` `getPurchasePatterns(customerId)` — 6개월 DELIVERED, 런타임 on-the-fly 계산
- **자연어 4-step 파이프라인**: `lib/utils/memo-parser.ts` (CORRECTION_DICT 30개)
- **inventory 필터 VIEW**: `v_store_inventory_item` (Hotfix BB)
- **Architecture C**: `tenant_item_master + store_item + v_store_item + tenant_item_detail` (Hotfix AV)
- **결제 우선 (Plan B)**: orderNo 생성 → 토스 결제 완료 후 DB 쓰기 (Hotfix BE)
- **메모 시스템**: `memo` (메모 마스터) + `memo_item` (qty_value, qty_unit, item, note 컬럼) — addToMemo tool에서 활용

### 2.2 핵심 데이터 모델 (v0.7d AI장보기에서 사용)

```
v_store_inventory_item (가용재고 상품) — AI추천 5테마 모두 이 VIEW 경유
  ├─ store_item_id (PK)
  ├─ tenant_item_id, store_id
  ├─ item_name, sale_price, list_price, item_img
  └─ category_code, std_large/medium/small_code (페르소나 매칭용)

memo + memo_item (AI채팅의 addToMemo tool이 INSERT)
  └─ memo_item: { raw_text, item, qty_value, qty_unit, note, status }

customer + 최근 30일 order + (신규) customer_preference
  └─ buildPersonaContext()가 통합

promotion + promotion_item (AI추천 "놓치면 아까워요" 테마)
  └─ N+1, 할인율, 기간

(신규) customer_preference — household, diet, taste, allergy, cooking_skill, preferred_hour
```

### 2.3 기술 스택 (v0.7c에서 그대로 + 신규 1개)

기존: Next.js 16 / React 19 / TypeScript / Tailwind / shadcn/ui / Zustand / Supabase / Server Actions / Vercel.

신규 의존성 (v0.7d에서 추가):
- **`ai`** (Vercel AI SDK) — `streamText` + `tools` 옵션 (tool 1개), `generateObject`. `ToolLoopAgent`는 v1.0
- **`@ai-sdk/anthropic`** — Claude Haiku 4.5 기본 / Sonnet 4.6 (env 토글)
- 환경 변수: `ANTHROPIC_API_KEY`, `AI_SHOPPING_MODEL=haiku|sonnet`

> **중요한 명명 규칙**: AI 어시스턴트 이름은 일관되게 **"FreshPick"** 으로 표기합니다 (별명·캐릭터명 없음). UI 카피에서 "FreshPick에게 물어보세요" / "FreshPick이 추천합니다" 형태로 사용. 인사말도 동일.

---

## 3. AI장보기 탭 재구성 설계

### 3.1 새 탭 구조: [AI채팅 · 내메모 · AI추천]

```
/ai-shopping
├── ?tab=chat       (기본, BottomTabNav 진입 시)
├── ?tab=memo       (메모 상세 → 다른 메모 보기 등 직접 진입)
└── ?tab=recommend  (홈의 "AI 추천 더보기" 클릭 시 직접 진입)
```

`SwipeableTabArea`(Hotfix BA `isInsideHorizontalScrollArea` 가드 유지)로 좌우 스와이프 전환.

### 3.2 진입 맥락별 기본 탭

| 진입 경로 | 기본 탭 | 근거 |
|-----------|---------|------|
| BottomTabNav "AI장보기" 클릭 | **AI채팅** | "AI가 도와준다" 첫 인상 강화 |
| 홈 화면 AI추천 섹션 "더보기" 클릭 | **AI추천** | 홈에서 본 추천을 더 깊이 |
| 홈 화면 "메모로 시작" 같은 진입점 / 메모 상세 → 다른 메모 | **내메모** | 메모 작업 흐름 보존 |
| 푸시 알림 (v1.x) | 알림 컨텍스트 | — |

이를 위해 `app/(mobile)/ai-shopping/page.tsx`는 `searchParams.tab`을 읽어 초기 탭을 결정합니다 (default: `chat`).

### 3.3 자동 리스트 탭 처리

자동리스트 탭은 **제거**하되 기능은 **흡수**:
- F015 `getPurchasePatterns()` 로직은 그대로 유지
- AI추천 탭의 **테마 2 "지금이 적기"** 섹션이 흡수
- 마이프레시 페이지의 "자주 사시는 상품" 섹션은 그대로 유지 (이중 노출)

### 3.4 호환성

- 기존 직링크 `/ai-shopping?tab=auto` 는 **301 → `/ai-shopping?tab=recommend`** (Next.js middleware redirect)
- Hotfix BA의 `data-no-tab-swipe` 등 가드 속성은 새 탭 구조에서도 그대로 유지

---

## 4. AI추천 탭 5테마 설계 (숨겨진 요구사항 반영)

### 4.1 사용자의 숨겨진 요구사항 5축

| # | 표면적 요구 | 숨겨진 요구 | 흡수 기능 |
|---|-------------|-------------|-----------|
| 1 | 추천 상품 보여줘 | **오늘 뭘 사야 할지 모르겠어** (결정 피로 감소) | 메뉴 세트 단위 |
| 2 | 내가 좋아할 만한 거 | **한 끼·한 식단 단위로 묶어줘** | 페르소나 컨텍스트 + 카테고리 조합 |
| 3 | 재고 있는 거 | **지금 가게 가면 살 수 있는 것** + **픽업 가능 시간** | `v_store_inventory_item` + `store_quick_time_slot` |
| 4 | 할인 알려줘 | **놓치면 아까운 것** | promotion + inventory 임박 |
| 5 | 최근 본 거 다시 | **계속 사긴 했는데 까먹은 것** | order 6개월 + 미구매 90일 |

### 4.2 5테마 섹션 (vertical stack, 각 섹션 2~4개 카드)

```
┌────────────────────────────────────────────┐
│ 🍽️ 오늘의 한끼              (테마 1)         │
│ "16시·구리 인창동·자녀 1명 가족"             │
│ ┌───────────────────────┐                  │
│ │ 김치찌개 정식           │                  │
│ │ 김치 · 두부 · 돼지고기 · 대파│                  │
│ │ 4인 / 약 8,400원       │                  │
│ │ [전체 담기] [메모로 추가]│                  │
│ └───────────────────────┘                  │
│ [더보기]                                    │
├────────────────────────────────────────────┤
│ ⏰ 지금이 적기              (테마 2, F015 흡수)│
│ "우유 13일째에요"                            │
│ [우유 1L] [쌀 5kg] [계란 30구]              │
├────────────────────────────────────────────┤
│ 🔥 놓치면 아까워요          (테마 3, 신규)    │
│ "오늘 마감"                                  │
│ [돼지목살 40%] [N+1 라면] [재고 3개 남음]    │
├────────────────────────────────────────────┤
│ 💭 다시 만나볼까요          (테마 4, 신규)    │
│ "지난 봄 자주 사셨어요"                      │
│ [미나리] [냉이] [봄동]                       │
├────────────────────────────────────────────┤
│ 🆕 새로 들어왔어요          (테마 5)          │
│ "깔끔한 맛 좋아하시는 분께"                  │
│ [신상품 1] [신상품 2] [신상품 3]             │
└────────────────────────────────────────────┘
```

### 4.3 각 테마의 데이터 소스 (v0.7d 기준 — RAG 없이)

| 테마 | 소스 | LLM 사용 |
|------|------|----------|
| 1. 오늘의 한끼 | 페르소나 컨텍스트 + 카테고리 TOP3 + 시간대 → LLM `generateObject`로 메뉴 세트 1~2개 구성 | ✅ 1회 (24h sessionStorage 캐시) |
| 2. 지금이 적기 | F015 `getPurchasePatterns(customerId)` (기존) + dueLabel | ❌ 사유 텍스트 LLM 1회만 (재이용) |
| 3. 놓치면 아까워요 | promotion + promotion_item (활성·기간 내) + inventory `(on_hand-reserved) ≤ 안전재고+α` 정렬 | ❌ |
| 4. 다시 만나볼까요 | order_detail 6개월 within + 90일 within 미구매 + 재고 보유 | ❌ |
| 5. 새로 들어왔어요 | tenant_item_master.created_at 최근 14일 + customer_preference 매칭 정렬 | ❌ |

LLM 호출 빈도: **테마 1만 호출** (1일 1회 sessionStorage 캐시), 나머지는 정형 쿼리. 비용 가드 강함.

### 4.4 AI추천 빈 상태 처리

| 빈 상태 케이스 | 표시 방식 |
|----------------|-----------|
| 신규 회원 (주문 0건, preference 미입력) | "취향을 알려주시면 더 정확한 추천을 드릴 수 있어요" + 마이프레시 → 내 취향 설정 CTA + 테마 5만 표시 |
| 주문은 있는데 preference 미입력 | 테마 1·5 사용 가능, 테마 2·4 사용 가능, "취향 추가하면 더 정확해져요" 가벼운 안내 |
| 모두 입력된 노련한 회원 | 5테마 모두 노출 |

---

## 5. AI채팅 → 내메모 자동 기록 설계 (`addToMemo` tool)

### 5.1 동작 시나리오

**시나리오 1 — 명시적 요청**
```
사용자: 오늘 저녁 갈비찜 할 건데 재료 메모해줘
FreshPick: 갈비찜 재료를 메모에 추가할게요. 다음 항목이 맞을까요?
  - 소갈비 1.5kg
  - 무 1개
  - 당근 1개
  - 대파 2뿌리
  - 양파 1개
  [확인] [수정] [취소]
사용자: [확인]
FreshPick: "갈비찜 재료" 메모에 5개 항목을 추가했어요. [메모 보기]
```

**시나리오 2 — 추천에서 메모로**
```
사용자: 다이어트 식단 추천해줘
FreshPick: ... (추천 메뉴 카드 3개) ...
사용자: 두 번째 메뉴 재료 메모에 추가해줘
FreshPick: 닭가슴살 샐러드 재료를 메모에 추가할게요. 확인해주세요. [확인] [취소]
```

### 5.2 Tool 정의 (v0.7d, 1개만)

```typescript
// lib/ai/tools/add-to-memo.ts
import { tool } from "ai";
import { z } from "zod";

export const addToMemoTool = tool({
  description: `사용자가 명시적으로 "메모에 추가", "장바구니 메모", "쇼핑리스트에 적어줘" 등을 요청할 때 사용.
임의 호출 금지 — 사용자 의도가 분명할 때만.
호출 전 사용자에게 항목을 한 번 더 확인받는 것이 원칙이지만, 사용자가 명시적으로 빠르게 추가하라고 했다면 즉시 추가 가능.`,
  parameters: z.object({
    memoTitle: z.string().describe("메모 제목 (예: '갈비찜 재료', '오늘 저녁')").max(40),
    items: z.array(z.object({
      itemName: z.string().describe("품목명. 한국어. 표준 단어."),
      qtyValue: z.number().nullable(),
      qtyUnit: z.string().nullable().describe("판, 봉지, 개, g, kg, ml 등"),
      note: z.string().nullable().describe("선택 사항. 예: '국거리용'"),
    })).min(1).max(20),
    userConsent: z.literal(true).describe("사용자가 명시적으로 메모 추가에 동의했음을 확인"),
  }),
  // execute는 Route Handler에서 customerId 컨텍스트와 함께 바인딩
});
```

### 5.3 Tool 실행 흐름 (서버 측)

```typescript
// app/api/ai/shopping/chat/route.ts (요지)
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { addToMemoTool } from "@/lib/ai/tools/add-to-memo";
import { addMemoItems, createMemo } from "@/lib/api/memo";

export async function POST(req: Request) {
  const { messages, customerIdFromClient, storeId } = await req.json();

  // ⚠️ 클라이언트 customerId 신뢰 금지 — 서버에서 재조회
  const verifiedCustomerId = await verifyCustomerByEmail();
  const ctx = await buildPersonaContext(verifiedCustomerId, storeId);

  const result = streamText({
    model: anthropic(process.env.AI_SHOPPING_MODEL === "sonnet"
      ? "claude-sonnet-4-6"
      : "claude-haiku-4-5-20251001"),
    system: buildShoppingChatSystemPrompt(ctx),
    messages,
    maxOutputTokens: 1200, // tool 사용 위해 v1 800 → 1200으로 상향
    temperature: 0.7,
    tools: { addToMemo: addToMemoTool },
    maxSteps: 2, // tool 1회 호출 + 후속 응답 1회 = 2 step 제한
    // tool 호출 시 서버 측에서 실제 메모 INSERT 수행
    onToolCall: async ({ toolName, args }) => {
      if (toolName !== "addToMemo") return;
      if (!args.userConsent) {
        return { error: "user_consent_required" };
      }
      // 1) 메모 마스터 생성 (또는 같은 제목 활성 메모 재사용)
      const memoId = await createOrGetMemo(verifiedCustomerId, args.memoTitle);
      // 2) memo_item bulk INSERT (기존 addMemoItems 재사용)
      await addMemoItems({
        memoId,
        items: args.items.map(i => ({
          raw_text: `${i.itemName}${i.qtyValue ? ` ${i.qtyValue}${i.qtyUnit ?? ""}` : ""}`,
          item: i.itemName, // 기존 CORRECTION_DICT applyCorrection 적용
          qty_value: i.qtyValue,
          qty_unit: i.qtyUnit,
          note: i.note,
        })),
      });
      return { ok: true, memoId, itemCount: args.items.length };
    },
  });

  return result.toDataStreamResponse();
}
```

### 5.4 클라이언트 UX (확인 다이얼로그)

```
1. 사용자: "오늘 저녁 갈비찜 할 건데 재료 메모해줘"
2. 모델 응답 스트리밍 중 tool_call 이벤트 발생
3. AiChatClient의 onToolCallStart 핸들러:
   - 응답 영역에 인라인 카드 표시 (다이얼로그 X — 모바일 친화)
     ┌─────────────────────────────────┐
     │ 메모에 추가하시겠어요?           │
     │ 메모: "갈비찜 재료"             │
     │ ☑ 소갈비 1.5kg                  │
     │ ☑ 무 1개                        │
     │ ☑ 당근 1개                      │
     │ ☑ 대파 2뿌리                    │
     │ ☑ 양파 1개                      │
     │ [수정] [확인] [취소]            │
     └─────────────────────────────────┘
4. 사용자가 [확인] 클릭 → 별도 user message 자동 생성 ("네, 추가해주세요")
   → 모델이 tool 재호출 with userConsent=true → 서버 INSERT 수행
5. tool_result 도착 후 응답에 "[메모 보기]" 링크 (→ /memo/{memoId}) 자동 삽입
```

### 5.5 안전 가드

- `userConsent: true`가 없으면 tool 미실행 (서버 측 강제)
- 같은 메모 제목으로 이미 활성 메모가 있으면 새로 만들지 말고 항목만 추가 (같은 날 중복 메모 방지)
- 1회 tool 호출당 최대 20개 항목 (Zod max(20))
- `applyCorrection()` (CORRECTION_DICT) 통과 후 INSERT — 오타 보정 동일 정책

---

## 6. 산출물

```
freshpick-app/
├── app/
│   ├── (mobile)/
│   │   ├── ai-shopping/
│   │   │   ├── page.tsx                              # 수정 — searchParams.tab 분기
│   │   │   └── _components/
│   │   │       ├── AiShoppingTabs.tsx                # 수정 — 3탭 [chat·memo·recommend]
│   │   │       ├── chat/
│   │   │       │   ├── AiChatClient.tsx              # 신규 — useChat + tool_call UI
│   │   │       │   ├── ChatMessage.tsx               # 신규
│   │   │       │   ├── AddToMemoConfirmCard.tsx     # 신규 — 인라인 확인 카드
│   │   │       │   └── ChatComposer.tsx              # 신규
│   │   │       ├── memo/                              # 기존 내메모 컴포넌트 이전
│   │   │       └── recommend/
│   │   │           ├── RecommendTabClient.tsx        # 신규 — 5테마 오케스트레이터
│   │   │           ├── ThemeSection.tsx              # 신규 — 공통 섹션 셸
│   │   │           ├── theme1-meal-set/
│   │   │           │   ├── MealSetSection.tsx        # 신규 — 테마 1 (LLM 1회 호출)
│   │   │           │   └── MealSetCard.tsx
│   │   │           ├── theme2-due-now/
│   │   │           │   └── DueNowSection.tsx         # F015 흡수
│   │   │           ├── theme3-dont-miss/
│   │   │           │   └── DontMissSection.tsx       # promotion + inventory 임박
│   │   │           ├── theme4-rediscover/
│   │   │           │   └── RediscoverSection.tsx     # 90일 미구매
│   │   │           ├── theme5-new-arrivals/
│   │   │           │   └── NewArrivalsSection.tsx    # 14일 신상품
│   │   │           └── EmptyStateGuide.tsx
│   │   └── mypage/
│   │       └── preference/                            # v1과 동일
│   └── api/
│       └── ai/
│           └── shopping/
│               ├── chat/route.ts                     # 신규 — streamText + addToMemo tool
│               └── meal-set/route.ts                # 신규 — generateObject (테마 1)
│
├── lib/
│   ├── ai/
│   │   ├── prompts.ts                                # 신규 — system prompt 빌더 3종
│   │   ├── persona-context.ts                       # 신규 — 페르소나 컨텍스트 빌더
│   │   ├── tools/
│   │   │   └── add-to-memo.ts                       # 신규 — tool 1개
│   │   └── meal-set-schema.ts                       # 신규 — Zod schema (테마 1)
│   ├── actions/
│   │   ├── ai/
│   │   │   ├── chat.actions.ts                      # 신규 — 메모 INSERT 헬퍼 (createOrGetMemo)
│   │   │   └── meal-set.actions.ts                  # 신규 — 테마 1 LLM 호출 + 캐시
│   │   └── domain/
│   │       └── preference.actions.ts                # v1과 동일
│   └── api/
│       ├── recommendations.ts                       # 수정 — 테마 5용
│       ├── purchasePattern.ts                       # 수정 — 테마 2용 (기존 유지)
│       ├── promotion.ts                             # 수정 — 테마 3용 신규 함수
│       └── rediscover.ts                            # 신규 — 테마 4용
│
├── types/
│   └── preference.ts                                 # v1과 동일
│
├── supabase/
│   └── migrations/
│       └── 20260615_customer_preference_v07d.sql   # v1과 동일
│
└── docs/
    └── ai-shopping-v0.7d.md                         # 신규 — 운영 가이드 + v1.0 노트
```

---

## 7. 단계별 구현 계획 (5 Phase, 약 3~4주)

### Phase 1 — 페르소나 데이터 수집 인프라 (3~4일)

> v1 변경 없음. `customer_preference` 테이블 + RLS + 마이프레시 입력 UI + Server Action.

**작업** (v1 프롬프트 Phase 1 그대로):
1. 마이그레이션 `20260615_customer_preference_v07d.sql` (RLS 본인만)
2. `types/preference.ts`, `lib/schemas/domain/preference.schema.ts`
3. `lib/actions/domain/preference.actions.ts` (`getMyPreference`, `upsertMyPreferenceAction`)
4. `app/(mobile)/mypage/preference/page.tsx` + form client
5. Playwright 3 시나리오

**DoD**: 마이프레시 → 내 취향 설정 진입·저장·재조회, RLS 검증, `npm run check-all` 통과

---

### Phase 2 — 페르소나 컨텍스트 빌더 + LLM 헬퍼 + 탭 재구성 (3일)

**목표**: customer / order / preference / store / 시간을 system prompt로 변환하는 단일 함수와 새 탭 구조의 셸을 동시에 만든다.

**작업**:

1. **`lib/ai/persona-context.ts`** (v1과 동일)
   - `buildPersonaContext(customerId, storeId)` → `PersonaContext`
   - customer + customer_preference + 최근 30일 order_detail (최대 20건) + store + KST 시간 한 번에 조회
   - `Promise.all` 병렬

2. **`lib/ai/prompts.ts`** — system prompt 빌더 **3종**
   - `buildShoppingChatSystemPrompt(ctx)` — 채팅용 (FreshPick 캐릭터, 알러지 가드, addToMemo tool 사용 가이드 포함)
   - `buildMealSetSystemPrompt(ctx)` — 테마 1 메뉴 세트 생성용 (`generateObject`)
   - `buildReasonSystemPrompt(ctx)` — F014/F015 사유 생성용 (기존 v1 보강 로직)

   **공통 강조사항**:
   - AI 어시스턴트 이름은 항상 **"FreshPick"** (별명·대체명 사용 금지)
   - 알러지 식재료 절대 추천 금지
   - 한국어 / 친근 / 이모지 절제
   - 마트 즉시 구매 가능 식재료 위주
   - **addToMemo tool 사용 가이드** (채팅용에만):
     - 사용자가 "메모에 추가해줘", "메모해줘", "쇼핑리스트에 적어줘" 같은 명시적 표현을 했을 때만 호출
     - 호출 전 항목 리스트를 다시 한 번 사용자 응답으로 확인받기
     - 추측·임의 호출 절대 금지

3. **AI장보기 탭 재구성** — `app/(mobile)/ai-shopping/page.tsx` 수정
   - `searchParams.tab` 읽어서 초기 탭 결정 (default: `chat`)
   - 탭 순서: `["chat", "memo", "recommend"]`
   - 기존 자동리스트 컴포넌트는 `app/(mobile)/ai-shopping/_components/auto-list-deprecated/`로 이동 (Phase 5에서 제거)
   - `middleware.ts`에 `/ai-shopping?tab=auto` → `/ai-shopping?tab=recommend` 리다이렉트
   - Hotfix BA의 `data-no-tab-swipe` 가드 모두 유지

4. **빈 셸 컴포넌트 생성**
   - `chat/AiChatClient.tsx` — 일단 "준비 중" placeholder
   - `recommend/RecommendTabClient.tsx` — 일단 기존 `getAiRecommendations` 8개 카드 그대로 표시 (Phase 4·5에서 5테마로 전환)
   - 메모 탭은 기존 컴포넌트를 `memo/` 디렉터리로 이동만

5. **단위 테스트** — `lib/ai/prompts.test.ts`, `persona-context.test.ts`
   - preference 있음/없음, order 있음/없음, 시간대별 5건
   - "FreshPick" 문자열 포함, 알러지 가이드 포함 검증

**DoD**:
- [ ] 새 3탭 구조 진입·전환 동작 (Playwright)
- [ ] `?tab=auto` 리다이렉트 동작
- [ ] `buildPersonaContext` 단위 테스트 5건 통과
- [ ] 모든 system prompt에 "FreshPick" 명칭, 알러지 가드 포함

---

### Phase 3 — AI채팅 화면 + addToMemo tool (6~7일)

**목표**: 첨부 스크린샷의 채팅 입력창을 만들고, 자연어 메모 추가까지 한 흐름으로 완성.

**작업**:

1. **API Route** — `app/api/ai/shopping/chat/route.ts`
   - `streamText` + `tools: { addToMemo: addToMemoTool }` + `maxSteps: 2`
   - 인증 + `customerId` 서버 측 재검증 (Hotfix Q 패턴 — `customer.email` 매칭)
   - tool 호출 시 `userConsent === true` 강제, 메모 INSERT 수행
   - `maxOutputTokens: 1200` (tool 호출용 상향)
   - 에러 핸들링 (API 키 누락·rate limit·timeout) — fallback 문구

2. **`lib/ai/tools/add-to-memo.ts`** (위 5.2 그대로)

3. **`lib/actions/ai/chat.actions.ts`**
   - `createOrGetMemo(customerId, title)` — 같은 제목 활성 메모 있으면 재사용, 없으면 생성
   - 기존 `addMemoItems` 재사용
   - `applyCorrection()` 통과 후 INSERT

4. **컴포넌트 — `chat/AiChatClient.tsx`**
   ```typescript
   "use client";
   import { useChat } from "@ai-sdk/react";

   export default function AiChatClient({ customerId, storeId }: Props) {
     const { messages, input, handleInputChange, handleSubmit, isLoading, addToolResult } =
       useChat({
         api: "/api/ai/shopping/chat",
         body: { customerIdFromClient: customerId, storeId },
         onToolCall: async ({ toolCall }) => {
           if (toolCall.toolName === "addToMemo") {
             // 자동 실행하지 않음 — 인라인 확인 카드 표시 후 사용자 클릭으로만
             return;
           }
         },
       });

     // 메시지에 tool_call이 있으면 AddToMemoConfirmCard 렌더
     // ...
   }
   ```

5. **`AddToMemoConfirmCard.tsx`** — 인라인 확인 카드
   - 다이얼로그 X (모바일 친화), 메시지 흐름 안에 카드 형태
   - 항목별 체크박스 (기본 전체 체크), 메모 제목 inline edit, 수량/단위 inline edit
   - [확인] 클릭 → `addToolResult()`로 tool 결과 전달 + 모델이 후속 응답 생성
   - [취소] 클릭 → tool_result에 `{ cancelled: true }` 전달
   - tool_result 도착 후 응답에 "[메모 보기]" 링크 자동 삽입 (`/memo/{memoId}`)

6. **빈 상태 — 첨부 스크린샷 매칭**
   - 메시지 0개일 때: 중앙에 이모지 가이드 (🥗🍅🥬🥦🐟🍗🍚🎁🍊) + 추천 프롬프트 3개 chip:
     - "오늘 뭐 먹지?"
     - "데친 고사리 활용법"
     - "다이어트 식단 추천"
   - 입력창 placeholder: **"FreshPick에게 물어보세요..."**

7. **테스트 — Playwright 시나리오 7건**
   - 비로그인 → 로그인 리다이렉트
   - "오늘 뭐 먹지?" → 응답 스트리밍 시작 (3초 이내)
   - 알러지 입력자 → 응답에 알러지 식재료 미포함
   - "갈비찜 재료 메모해줘" → 인라인 확인 카드 표시
   - 확인 카드 [확인] 클릭 → memo + memo_item INSERT, [메모 보기] 링크 동작
   - 확인 카드 [취소] 클릭 → INSERT 안 됨
   - API 에러 시 fallback 문구 표시

**DoD**:
- [ ] 채팅 화면 진입·메시지 송수신·스트리밍 정상
- [ ] 페르소나 컨텍스트 system prompt 정확히 주입
- [ ] addToMemo tool 호출 → 인라인 확인 카드 → 사용자 확인 후에만 INSERT
- [ ] 동일 제목 메모 재사용 (중복 생성 방지)
- [ ] applyCorrection 적용 (오타 보정)
- [ ] 알러지 가드 통과
- [ ] FreshPick 명칭이 system prompt + UI 카피 모두 일관

---

### Phase 4 — AI추천 5테마 — 단순 테마 (테마 2·3·4·5) 먼저 (5~6일)

**목표**: LLM 호출이 필요 없는 4개 테마를 먼저 완성한다. 테마 1은 LLM 비용·캐시 검토 후 Phase 5에서.

**작업**:

1. **`lib/api/promotion.ts` 확장** (테마 3 "놓치면 아까워요")
   - `getDontMissItems(storeId, customerId)` —
     - promotion ACTIVE + 기간 내 + promotion_item 매핑
     - 또는 `v_store_inventory_item.on_hand - reserved ≤ 안전재고+α` (재고 임박)
     - 할인율 또는 임박도 정렬, 최대 6개

2. **`lib/api/rediscover.ts` 신규** (테마 4 "다시 만나볼까요")
   - `getRediscoverItems(customerId, storeId)` —
     - order_detail 6개월 within에 등장 + 90일 within 미구매 + 현재 재고 보유
     - 계절성 가산 (예: 봄에 봄동·미나리)
     - 최대 5개

3. **`lib/api/recommendations.ts` 수정** (테마 5 "새로 들어왔어요")
   - 기존 `getAiRecommendations`와 별도로 `getNewArrivals(storeId, customerId)` 추가
   - tenant_item_master.created_at 최근 14일 + customer_preference의 diet/taste/category 매칭 정렬
   - 최대 4개

4. **`lib/api/purchasePattern.ts`** (테마 2, 기존 유지)
   - `getPurchasePatterns()`는 이미 존재 — 컴포넌트만 새로 작성

5. **컴포넌트 — `recommend/`**
   - `RecommendTabClient.tsx` — 5섹션 vertical stack 오케스트레이터
     - 5개 섹션 각각 독립적으로 데이터 조회 (`Promise.all` 병렬)
     - 빈 섹션은 자동 숨김
     - 섹션이 모두 비면 `EmptyStateGuide` (취향 입력 권유)
   - `ThemeSection.tsx` — 공통 셸 (제목·아이콘·서브카피·더보기)
   - 각 테마별 Section 컴포넌트 (4개)
   - 각 카드에 [담기] + [메모로 추가] 두 CTA
     - [담기] → 기존 `addCartItemAction`
     - [메모로 추가] → 채팅의 addToMemo가 아닌 직접 INSERT (Server Action 별도)

6. **테스트 — Playwright 시나리오 6건**
   - 신규 회원 (주문 0건, preference 미입력) → 테마 5만 노출, EmptyStateGuide 보임
   - preference 입력 후 → 테마 5의 카드 변화
   - 주문 이력 있는 회원 → 테마 2·4도 노출
   - promotion 활성 시 테마 3 노출
   - [담기] 클릭 → cart INSERT + Fly 애니메이션
   - [메모로 추가] 클릭 → memo + memo_item INSERT

**DoD**:
- [ ] 4개 테마 모두 동작, 빈 상태 자동 숨김
- [ ] 카드별 [담기]·[메모로 추가] CTA 동작
- [ ] 응답 P95 < 1초 (LLM 호출 없음)
- [ ] EmptyStateGuide → 마이프레시 취향 설정 CTA 동작

---

### Phase 5 — AI추천 테마 1 (메뉴 세트, LLM) + F014/F015 사유 보강 + 자동리스트 제거 (4~5일)

**목표**: LLM이 필요한 테마 1을 추가하고, 기존 v1 프롬프트의 사유 보강(F014/F015)을 함께 적용한다. 자동리스트 흡수를 마무리한다.

**작업**:

1. **테마 1 메뉴 세트 — `app/api/ai/shopping/meal-set/route.ts`**
   ```typescript
   import { generateObject } from "ai";
   import { anthropic } from "@ai-sdk/anthropic";
   import { z } from "zod";

   const MealSetSchema = z.object({
     sets: z.array(z.object({
       title: z.string().max(20),                  // "김치찌개 정식"
       reasonText: z.string().max(80),             // "쌀쌀한 저녁, 가족이 함께 즐기기 좋아요"
       servings: z.number().min(1).max(10),
       items: z.array(z.object({
         categoryKeyword: z.string(),              // "김치", "두부" — 이름이 아닌 카테고리 키워드
         expectedItemName: z.string(),             // "포기김치 1kg" (예시)
         qtyValue: z.number().nullable(),
         qtyUnit: z.string().nullable(),
       })).min(2).max(8),
     })).min(1).max(2),
   });

   export async function POST(req: Request) {
     // 인증 + ctx 빌드
     // generateObject 호출 (Haiku 기본)
     // 응답의 categoryKeyword로 v_store_inventory_item 검색하여 실제 store_item_id 매핑
     // 매핑 실패 항목은 "추천만, 재고 미확인" 표시 또는 제외
   }
   ```

2. **테마 1 클라이언트 — `theme1-meal-set/MealSetSection.tsx`**
   - sessionStorage 24시간 캐시 (key: `meal_set_${customerId}_${storeId}_${YYYY-MM-DD}`)
   - 카드 즉시 표시 (skeleton) → LLM 응답 도착 시 hydrate
   - 메뉴 카드 [전체 담기] → 모든 store_item_id cart INSERT (Fly 애니메이션 묶음)
   - 메뉴 카드 [메모로 추가] → 메모 제목 = "오늘의 한끼 - {title}", 모든 항목 자동 INSERT

3. **F014/F015 사유 보강** (기존 v1 프롬프트의 Phase 4 그대로 적용)
   - `app/api/ai/shopping/recommend/route.ts` — `generateObject`로 사유 텍스트 일괄 생성
   - 테마 2 (DueNowSection): "우유 사신 지 13일 됐어요" 같은 사유 텍스트
   - 테마 4 (RediscoverSection): "지난 봄 자주 사셨던 미나리, 제철이에요"
   - 24시간 sessionStorage 캐시 동일

4. **자동리스트 탭 완전 제거**
   - `app/(mobile)/ai-shopping/_components/auto-list-deprecated/` 삭제
   - middleware redirect (Phase 2 추가) 유지
   - 마이프레시의 "자주 사시는 상품" 섹션은 그대로 유지 (이중 노출)

5. **비용 가드 (전체 합산)**
   | LLM 호출 빈도 (1 사용자/일) | 횟수 |
   |---|---|
   | AI채팅 (사용자 능동) | 무제한 (자체 토큰 가드) |
   | AI채팅 addToMemo tool | 채팅 호출에 포함 |
   | 테마 1 meal-set | 1회/일 (sessionStorage 캐시) |
   | 테마 2·4 사유 보강 | 1회/일 (sessionStorage 캐시) |
   | 합계 | 약 2~3 LLM 호출/일 + 채팅 |
   - env `AI_SHOPPING_REASONS_ENABLED=false`로 사유 보강 일괄 차단 가능
   - env `AI_SHOPPING_MEAL_SET_ENABLED=false`로 테마 1 차단 가능

6. **테스트 — Playwright 6건**
   - 테마 1 진입 → 메뉴 카드 1~2개 표시, 항목 매핑 확인
   - 24시간 캐시 적중 시 LLM 미호출 (Network 모킹)
   - [전체 담기] → cart 일괄 INSERT
   - [메모로 추가] → memo + memo_item 일괄 INSERT
   - F015 사유 보강 표시
   - LLM 차단 토글 시 graceful degrade

**DoD**:
- [ ] 5테마 모두 정상 동작
- [ ] 테마 1 LLM 1회/일 캐시 동작
- [ ] 비용 차단 토글 동작
- [ ] 자동리스트 탭 코드 완전 제거, 리다이렉트 정상
- [ ] AI추천 탭 P95 응답 < 2초 (캐시 적중 시 < 0.5초)

---

## 8. v1.0 마이그레이션 노트

| v0.7d 자산 | v1.0에서의 변화 |
|------------|----------------|
| `customer_preference` 테이블 | `embedding vector(1536)` 컬럼 추가 + HNSW 인덱스 |
| `lib/ai/persona-context.ts` | `getUserContext` tool로 래핑되어 `ToolLoopAgent`에서 사용 |
| `lib/ai/prompts.ts` | tool 사용 가이드·자기보강 지침 추가, 모듈화 |
| `lib/ai/tools/add-to-memo.ts` | **그대로 유지** + 신규 tool 3개 (`searchItems`, `getInventory`, `addToCart`) 추가 |
| `app/api/ai/shopping/chat/route.ts` | `streamText` + 1 tool → `ToolLoopAgent` + 4 tools, 시맨틱 캐시 미들웨어 추가 |
| AI추천 5테마 컴포넌트 | **구조 그대로 유지**, 데이터 소스를 RAG 우선 + 카테고리 폴백 50:50으로 |
| 테마 1 meal-set | RAG 보강: chunk 검색 → tenant_item 매핑 정확도 ↑ |
| sessionStorage 24h 캐시 | `ai_query_cache` (DB 기반) 와 병존 → 점진 전환 |
| 인라인 메모 확인 카드 | 그대로 유지 (UX 패턴) |
| FreshPick 명칭 | 변경 없음, 일관 유지 |

**호환성 약속**: v0.7d의 모든 컴포넌트·테이블·tool은 v1.0에서 **확장**되지만 **삭제되지 않습니다**. v0.7d 데이터(`customer_preference` 입력값, 메모 등) 100% 보존.

---

## 9. 명시적 거부 / 비목표 (v0.7d 한정)

- ❌ **pgvector·임베딩 인프라**: v1.0
- ❌ **`tenant_item_ai_detail` 테이블**: v1.0
- ❌ **ToolLoopAgent / 다단계 tool**: v1.0 (v0.7d는 tool 1개 + maxSteps 2)
- ❌ **시맨틱 캐시 (DB)**: v1.0 (sessionStorage만)
- ❌ **자기보강 루프**: v1.0
- ❌ **manager-app 운영 도구**: v1.0
- ❌ **AI Gateway / 멀티 모델 라우팅**: v1.0
- ❌ **페르소나 시그니처 자동 추론**: v1.0
- ❌ **채팅에서 장바구니 직접 추가**: v1.0 (메모 추가까지만, 장바구니는 추천 카드 CTA로만)
- ❌ **외부 웹 검색 (레시피 보강)**: v1.0
- ❌ **음성 입력 / TTS** (첨부 스크린샷 6 마이크·Say): v1.x

---

## 10. 위험 요소 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| 모델이 addToMemo를 임의로 호출 | 사용자 의도 무시 | system prompt 명시적 가이드 + `userConsent: literal(true)` 강제 + 인라인 확인 카드 필수 |
| 같은 제목 메모 중복 생성 | UX 혼란 | `createOrGetMemo`로 활성 메모 재사용 |
| 테마 1 LLM이 가게 미보유 상품 추천 | 사용자 실망 | `categoryKeyword` 기반 매핑 후 매핑 실패 항목은 표시 제외 또는 "추천만 (재고 미확인)" 별도 라벨 |
| 자동리스트 사용자 이탈 | 기존 사용자 혼란 | (오픈 전이라 영향 작음) middleware redirect + 마이프레시 자주 사시는 상품 강화 안내 |
| 5테마가 모두 비어 빈 화면 | UX 저하 | EmptyStateGuide + 취향 입력 CTA + 신상품 테마는 항상 시도 |
| LLM 응답 한국어 품질 미달 | 이탈 | Haiku → Sonnet env 토글 즉시 가능, 골든 셋 5건 PR 시 점검 |
| 비용 폭주 | 운영비 부담 | maxOutputTokens 1200 / 환경변수 차단 토글 / sessionStorage 캐시 / Haiku 기본값 |
| FreshPick 명칭 일관성 깨짐 | 브랜드 혼란 | system prompt에 명시 + Phase 2 단위 테스트로 검증 + UI 카피 grep 점검 |
| 알러지 가드 우회 | 안전 사고 | system prompt 항상 포함 + 골든 셋 알러지 검증 1건 필수 |
| RLS 우회 (다른 customer 메모 조작) | 프라이버시 | 서버 측 customerId 재조회 강제 + tool execute 안에서도 verifiedCustomerId 사용 |

---

## 11. 수락 기준 요약 (v0.7d 종료 시)

- [ ] AI장보기 탭 [AI채팅·내메모·AI추천] 동작, `?tab=auto` 리다이렉트 정상
- [ ] `customer_preference` 테이블 + RLS + UI + Action 동작
- [ ] AI채팅 화면 + addToMemo tool 동작 (인라인 확인 카드 → 사용자 확인 → 메모 INSERT)
- [ ] AI추천 탭 5테마 모두 동작, 빈 상태 자동 숨김
- [ ] 테마 1 meal-set LLM 호출 + 24시간 캐시
- [ ] 알러지 가드 모든 LLM 응답 통과
- [ ] 비용 가드 (maxOutputTokens, 환경변수 차단, 캐시) 동작
- [ ] FreshPick 명칭이 모든 system prompt + UI 카피에서 일관
- [ ] Playwright E2E 시나리오 25건 통과 (Phase 1: 3 / Phase 2: 2 / Phase 3: 7 / Phase 4: 6 / Phase 5: 6 / 회귀: 1)
- [ ] `npm run check-all` + `npm run build` 통과
- [ ] `docs/ai-shopping-v0.7d.md` 운영 가이드 + v1.0 마이그레이션 노트
- [ ] ROADMAP-freshpick-app-v0.7d.md에 본 sprint Task 등록·완료 표시

---

## 12. 실행 직전 자기검증 8문항

에이전트는 작업 시작 전에 다음 8가지를 답변·확인한 뒤 진행하세요.

1. v0.7c 현행 코드의 `getAiRecommendations` 시그니처와 메모 INSERT 흐름(`addMemoItems`)을 확인했는가?
2. `customer_id` 조회 패턴(`.eq("email", user.email)`)을 모든 신규 코드에 적용했는가?
3. `ANTHROPIC_API_KEY`를 클라이언트 번들에 노출하지 않는 구조인가?
4. `maxOutputTokens` + `maxSteps: 2` 가드를 모든 LLM 호출에 적용했는가?
5. system prompt에 알러지 가드와 FreshPick 명칭이 항상 포함되는가?
6. addToMemo tool이 `userConsent: true` 없이 실행되지 않는 구조인가?
7. v0.7d의 모든 신규 테이블·컴포넌트·tool이 v1.0에서 삭제되지 않고 확장만 되도록 설계되었는가?
8. `?tab=auto` 직링크에 대한 middleware 리다이렉트가 작성되었는가?

8개 모두 "예"가 되어야 진행하세요. 하나라도 "아니오"면 그 단계에서 멈추고 사용자에게 보고하세요.

---

> **본 프롬프트의 끝.**
> v0.7d 완료 후 v1.0은 별도 프롬프트(`PROMPT-freshpick-v1.0-ai-rag.md`)로 진행합니다.
> 의문이 생기면 임의 결정 대신 PR description에 기록하고 사용자 확인을 요청하세요. 특히 모델 선택(Haiku/Sonnet), 알러지 가드 강도, 캐시 TTL, 5테마의 카드 개수·순서는 운영자 결정이 필요합니다.
