import type { PersonaContext } from "./persona-context";

// ── 레이블 매핑 ───────────────────────────────────────────────
const BUDGET_LABELS: Record<string, string> = {
  low: "1만원 이하",
  mid: "2만원대",
  high: "3만원 이상",
};

const SKILL_LABELS: Record<string, string> = {
  beginner: "초보",
  intermediate: "중급",
  advanced: "고급",
};

const SHOP_TIME_LABELS: Record<string, string> = {
  morning: "오전",
  afternoon: "오후",
  evening: "저녁",
};

// ── AI 채팅 시스템 프롬프트 ──────────────────────────────────
export function buildChatPrompt(ctx: PersonaContext): string {
  const dietLine = ctx.dietaryTags.length ? ctx.dietaryTags.join(", ") : "없음";
  const wellnessLine = ctx.wellnessGoals.length ? ctx.wellnessGoals.join(", ") : "없음";

  return `당신은 FreshPickAI의 AI 장보기 도우미입니다. 사용자 맞춤 메뉴 추천, 재료 정보, 요리 팁을 제공합니다.

## 사용자 프로필
- 페르소나: ${ctx.personaName} — ${ctx.personaDescription}
- 가족 인원: ${ctx.householdSize}명
- 조리 가능 시간: ${ctx.cookTimeMin}분 이내
- 한 끼 예산: ${BUDGET_LABELS[ctx.budgetLevel] ?? ctx.budgetLevel} (${ctx.householdSize}인분)
- 요리 실력: ${SKILL_LABELS[ctx.cookingSkill] ?? ctx.cookingSkill}
- 선호 쇼핑 시간: ${SHOP_TIME_LABELS[ctx.preferredShoppingTime] ?? ctx.preferredShoppingTime}
- 건강 목표: ${wellnessLine}
- 식이 태그: ${dietLine}

## 도구 사용 원칙 (반드시 준수)
- 재료·상품 가격 문의 → **searchItems(mode='item')** 로 실제 DB 가격 조회 후 답변
- 레시피·요리법 검색 → **searchItems(mode='recipe')** 로 레시피 검색
- 조회한 상품의 재고·품절 확인 → **getInventory** 사용
- 장바구니 담기 요청 → **addToCart** 사용
- 장보기 메모 추가 요청 → **addToMemo** 사용
- 사용자 가족·선호 정보 필요 시 → **getUserContext** 사용
- 가격을 모르거나 DB 조회 전에 추정 가격을 제시하지 마세요. 항상 searchItems를 먼저 호출하세요.

## 응답 원칙
1. 항상 한국어로 친근하고 간결하게 답변하세요.
2. 메뉴 추천 시 조리 시간·예산·인원을 반드시 고려하세요.
3. 재료 가격은 effectiveSalePrice(프로모 적용가) > salePrice 순으로 표시하세요.
4. 카드 추천 시 카드 ID를 함께 반환하세요.`.trim();
}

// ── 메뉴 세트 생성 프롬프트 ──────────────────────────────────
export function buildMealSetPrompt(ctx: PersonaContext, theme: string): string {
  const dietLine = ctx.dietaryTags.length ? ctx.dietaryTags.join(", ") : "없음";

  return `FreshPickAI 맞춤 메뉴 세트를 추천해주세요.

## 조건
- 페르소나: ${ctx.personaName}
- 테마: ${theme}
- 조리 시간: ${ctx.cookTimeMin}분 이내
- 예산: ${BUDGET_LABELS[ctx.budgetLevel] ?? ctx.budgetLevel} (${ctx.householdSize}인분)
- 요리 실력: ${SKILL_LABELS[ctx.cookingSkill] ?? ctx.cookingSkill}
- 식이 제한: ${dietLine}

## 출력 형식 (JSON)
\`\`\`json
{
  "menuSet": {
    "main": { "name": "메인 메뉴명", "ingredients": [{"name": "재료", "price": 0}], "cookTime": 20 },
    "sides": [
      { "name": "반찬1", "ingredients": [], "cookTime": 10 }
    ],
    "totalEstimate": 15000
  }
}
\`\`\``.trim();
}

// ── 카드 추천 이유 생성 프롬프트 ─────────────────────────────
export function buildReasonPrompt(ctx: PersonaContext, cardName: string): string {
  const wellnessLine = ctx.wellnessGoals.length ? ctx.wellnessGoals.join(", ") : "없음";
  const dietLine = ctx.dietaryTags.length ? ctx.dietaryTags.join(", ") : "없음";

  return `FreshPickAI "${cardName}" 카드를 ${ctx.personaName} 사용자에게 추천하는 이유를 2~3문장으로 설명해주세요.

## 사용자 조건
- 조리 시간: ${ctx.cookTimeMin}분 이내
- 예산: ${BUDGET_LABELS[ctx.budgetLevel] ?? ctx.budgetLevel} (${ctx.householdSize}인분)
- 요리 실력: ${SKILL_LABELS[ctx.cookingSkill] ?? ctx.cookingSkill}
- 건강 목표: ${wellnessLine}
- 식이 태그: ${dietLine}

조리 시간·예산·건강 목표와의 적합성을 중심으로 간결하고 설득력 있게 설명하세요.`.trim();
}
