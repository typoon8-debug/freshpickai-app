"use server";

// Phase 1 stub — 실제 fp_card_section upsert는 Task 030/031에서 구현.
// 현 단계에서는 입력 검증 + 결과 분기로 API 계약만 확정.

import type { CardSection } from "@/lib/types";

export type SaveSectionsError = "AUTH_REQUIRED" | "VALIDATION_FAILED" | "SAVE_FAILED";

export type SaveSectionsResult =
  | { success: true; saved: number }
  | { success: false; error: SaveSectionsError };

export async function saveSections(sections: CardSection[]): Promise<SaveSectionsResult> {
  if (sections.length === 0) {
    return { success: false, error: "VALIDATION_FAILED" };
  }

  const hasBlankName = sections.some((s) => !s.name.trim());
  if (hasBlankName) {
    return { success: false, error: "VALIDATION_FAILED" };
  }

  const orders = sections.map((s) => s.sortOrder);
  const hasDuplicateOrder = new Set(orders).size !== orders.length;
  if (hasDuplicateOrder) {
    return { success: false, error: "VALIDATION_FAILED" };
  }

  return { success: true, saved: sections.length };
}
