import type { StoreItemAiData } from "@/lib/types";

/** AI 데이터 노출 레벨 */
export type AiDataLevel = "full" | "partial" | "review" | "fallback";

/**
 * AI 가드레일 레벨 결정
 * - full: ACTIVE + confidence >= 0.6 → 모든 AI 필드 노출
 * - partial: ACTIVE + confidence < 0.6 → 칼로리·영양 제외
 * - review: REVIEW_NEEDED | ERROR → "AI 분석 보완 중" 배지
 * - fallback: null → 로컬 fp_dish_ingredient 데이터만
 */
export function resolveAiDataLevel(
  status: StoreItemAiData["aiStatus"],
  confidence?: number | null
): AiDataLevel {
  if (status === "ACTIVE") {
    return (confidence ?? 0) >= 0.6 ? "full" : "partial";
  }
  if (status === "REVIEW_NEEDED" || status === "ERROR") return "review";
  return "fallback";
}

/**
 * 레벨에 따라 조건부로 AI 필드를 제거하고 _showReviewBadge 플래그 반환
 */
export function resolveAiData(live: StoreItemAiData): StoreItemAiData {
  const level = resolveAiDataLevel(live.aiStatus, live.aiConfidence);

  if (level === "fallback") {
    return { ...live, aiTags: [], _showReviewBadge: false };
  }

  if (level === "review") {
    return {
      ...live,
      aiCalories: undefined,
      aiNutritionSummary: undefined,
      _showReviewBadge: true,
    };
  }

  if (level === "partial") {
    return {
      ...live,
      aiCalories: undefined,
      aiNutritionSummary: undefined,
      _showReviewBadge: false,
    };
  }

  // full: 모든 필드 노출
  return { ...live, _showReviewBadge: false };
}
