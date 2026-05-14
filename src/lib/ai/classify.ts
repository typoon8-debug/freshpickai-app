import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getAiModelId, AI_MODEL_KEYS } from "@/lib/ai/model-config";

export type ChatIntentType =
  | "meal_recommendation"
  | "recipe_question"
  | "cart_action"
  | "memo_action"
  | "general";

const INTENT_KEYWORDS: Record<Exclude<ChatIntentType, "general">, string[]> = {
  meal_recommendation: ["추천", "뭐 먹", "메뉴", "오늘", "저녁", "점심", "아침", "요리", "뭐해"],
  recipe_question: ["레시피", "만들기", "방법", "조리법", "어떻게", "재료"],
  cart_action: ["담아줘", "장바구니", "담기", "주문", "구매", "사줘"],
  memo_action: ["메모", "저장", "기록", "적어줘", "추가해줘", "넣어줘"],
};

const intentCache = new Map<string, { intent: ChatIntentType; expiresAt: number }>();

function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^가-힣a-z0-9]/g, "")
    .slice(0, 50);
}

function quickClassify(text: string): ChatIntentType | null {
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [
    Exclude<ChatIntentType, "general">,
    string[],
  ][]) {
    if (keywords.some((kw) => text.includes(kw))) return intent;
  }
  return null;
}

export async function classifyIntent(text: string): Promise<ChatIntentType> {
  const key = normalizeKey(text);
  const cached = intentCache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.intent;

  const quick = quickClassify(text);
  if (quick) {
    intentCache.set(key, { intent: quick, expiresAt: Date.now() + 300_000 });
    return quick;
  }

  try {
    const modelId = await getAiModelId(AI_MODEL_KEYS.CLASSIFY);
    const { text: raw } = await generateText({
      model: anthropic(modelId),
      prompt: `다음 메시지의 의도를 분류하세요. 반드시 아래 중 하나만 답하세요:
meal_recommendation, recipe_question, cart_action, memo_action, general

메시지: "${text}"

의도:`,
      maxOutputTokens: 20,
    });

    const valid: ChatIntentType[] = [
      "meal_recommendation",
      "recipe_question",
      "cart_action",
      "memo_action",
      "general",
    ];
    const result = valid.includes(raw.trim() as ChatIntentType)
      ? (raw.trim() as ChatIntentType)
      : "general";

    intentCache.set(key, { intent: result, expiresAt: Date.now() + 300_000 });
    return result;
  } catch {
    return "general";
  }
}
