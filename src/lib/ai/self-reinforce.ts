import { createClient } from "@/lib/supabase/server";

const CONFIDENCE_THRESHOLD = 0.6;

export interface ReviewableItem {
  storeItemId?: string;
  itemName: string;
  aiConfidence?: number;
  reason?: string;
  context?: string;
}

/** 낮은 신뢰도 상품을 검토 큐에 등록합니다 (fire-and-forget). */
export async function queueForReview(items: ReviewableItem[]): Promise<void> {
  if (items.length === 0) return;

  try {
    const supabase = await createClient();
    const rows = items.map((item) => ({
      store_item_id: item.storeItemId ?? null,
      item_name: item.itemName,
      ai_confidence: item.aiConfidence ?? null,
      reason: item.reason ?? "ai_confidence_below_threshold",
      context: item.context ?? null,
      status: "pending",
    }));

    await supabase.from("fp_ai_review_queue").insert(rows);
  } catch {
    // 큐 등록 실패는 무시 (핵심 기능 아님)
  }
}

/**
 * 검색 결과에서 신뢰도 0.6 미만 항목을 자동으로 검토 큐에 등록합니다.
 * searchItems tool 실행 후 비동기로 호출하세요.
 */
export function enqueueIfLowConfidence(
  results: Array<{ storeItemId?: string; itemName: string; aiConfidence?: number }>,
  context?: string
): void {
  const lowConfidence = results.filter(
    (r) => typeof r.aiConfidence === "number" && r.aiConfidence < CONFIDENCE_THRESHOLD
  );

  if (lowConfidence.length === 0) return;

  // fire-and-forget
  queueForReview(
    lowConfidence.map((r) => ({
      storeItemId: r.storeItemId,
      itemName: r.itemName,
      aiConfidence: r.aiConfidence,
      reason: "ai_confidence_below_threshold",
      context,
    }))
  ).catch(() => {});
}
