"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemoItem as MemoItemType } from "@/lib/types";
import type { ParseMeta } from "@/lib/memo-adapter";
import { MemoItem } from "./memo-item";

const CATEGORY_COLORS: Record<string, string> = {
  식재료: "text-sage bg-sage/10",
  과자: "text-honey bg-honey/10",
  기타: "text-ink-400 bg-ink-100",
};

interface ParsePreviewProps {
  items: MemoItemType[];
  meta: Record<string, ParseMeta>;
  onToggle: (id: string) => void;
  onQtyChange: (id: string, delta: number) => void;
}

export function ParsePreview({ items, meta, onToggle, onQtyChange }: ParsePreviewProps) {
  const matchedCount = Object.values(meta).filter((m) => m.matched).length;
  const total = items.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-ink-700 text-sm font-semibold">파싱 결과</p>
        <span className="text-ink-400 text-xs">
          {matchedCount}/{total}개 매칭됨
        </span>
      </div>

      <div className="border-line overflow-hidden rounded-lg border bg-white">
        {items.map((item, idx) => {
          const m = meta[item.memoItemId];
          const isMatched = m?.matched ?? true;
          const category = m?.category ?? "기타";

          return (
            <div
              key={item.memoItemId}
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                idx < items.length - 1 && "border-line border-b",
                !isMatched && "border-l-terracotta border-l-2"
              )}
            >
              {/* 매칭 실패 아이콘 */}
              {!isMatched && <AlertCircle size={14} className="text-terracotta flex-shrink-0" />}

              {/* MemoItem 재사용 (체크박스 + 품목명 + 수량 ±조정) */}
              <div className="min-w-0 flex-1">
                <MemoItem item={item} onToggle={onToggle} onQtyChange={onQtyChange} />
                {!isMatched && (
                  <p className="text-terracotta mt-0.5 pl-8 text-[11px]">
                    매칭 실패 — 수동 입력 필요
                  </p>
                )}
              </div>

              {/* 카테고리 뱃지 */}
              <span
                className={cn(
                  "flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                  CATEGORY_COLORS[category] ?? "text-ink-400 bg-ink-100"
                )}
              >
                {category}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
