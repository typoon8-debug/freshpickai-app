"use client";

import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookModeButtonProps {
  cardId: string;
  className?: string;
}

// F017 BP2 자리 표시 — Task 042에서 인터랙티브 요리 UX 연동
export function CookModeButton({ cardId: _cardId, className }: CookModeButtonProps) {
  return (
    <button
      type="button"
      disabled
      title="이 카드로 요리하기 (출시 후 활성화)"
      className={cn(
        "rounded-pill border-mocha-300 text-mocha-400 flex cursor-not-allowed items-center gap-2 border border-dashed px-4 py-2 text-sm opacity-60",
        className
      )}
    >
      <ChefHat size={16} />이 카드로 요리하기
    </button>
  );
}
