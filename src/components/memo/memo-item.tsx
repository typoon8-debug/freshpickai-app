"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemoItem as MemoItemType } from "@/lib/types";

interface MemoItemProps {
  item: MemoItemType;
  onToggle: (id: string) => void;
  onQtyChange: (id: string, delta: number) => void;
}

export function MemoItem({ item, onToggle, onQtyChange }: MemoItemProps) {
  return (
    <div className={cn("flex items-center gap-3", item.done && "opacity-50")}>
      <button
        type="button"
        onClick={() => onToggle(item.memoItemId)}
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition",
          item.done ? "border-mocha-600 bg-mocha-600" : "border-line bg-white"
        )}
        aria-label={item.done ? "체크 해제" : "체크"}
      >
        {item.done && (
          <svg viewBox="0 0 10 8" className="h-3 w-3 fill-none stroke-white stroke-2">
            <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <p className={cn("text-ink-900 flex-1 text-sm", item.done && "line-through")}>
        {item.correctedText ?? item.rawText}
      </p>

      {item.qtyValue != null && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onQtyChange(item.memoItemId, -1)}
            disabled={item.qtyValue <= 1}
            className="bg-mocha-50 text-ink-700 flex h-7 w-7 items-center justify-center rounded-lg disabled:opacity-30"
          >
            <Minus size={12} />
          </button>
          <span className="text-ink-900 w-6 text-center text-sm font-medium">{item.qtyValue}</span>
          <button
            type="button"
            onClick={() => onQtyChange(item.memoItemId, 1)}
            className="bg-mocha-50 text-ink-700 flex h-7 w-7 items-center justify-center rounded-lg"
          >
            <Plus size={12} />
          </button>
        </div>
      )}

      {item.qtyUnit && <span className="text-ink-400 w-6 text-right text-xs">{item.qtyUnit}</span>}
    </div>
  );
}
