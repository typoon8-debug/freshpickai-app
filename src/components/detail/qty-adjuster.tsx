"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QtyAdjusterProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  className?: string;
}

export function QtyAdjuster({ value, min = 1, max = 99, onChange, className }: QtyAdjusterProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="수량 감소"
        className="border-line text-ink-500 hover:bg-mocha-50 flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-30"
      >
        <Minus size={14} />
      </button>

      <span className="text-ink-900 w-8 text-center text-sm font-semibold">{value}</span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="수량 증가"
        className="border-line text-ink-500 hover:bg-mocha-50 flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-30"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
