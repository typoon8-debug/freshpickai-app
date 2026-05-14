"use client";

import { useRouter } from "next/navigation";
import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookModeButtonProps {
  cardId: string;
  className?: string;
}

export function CookModeButton({ cardId, className }: CookModeButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/cards/${cardId}/cook`)}
      title="이 카드로 요리하기"
      className={cn(
        "rounded-pill border-mocha-700 text-mocha-700 hover:bg-mocha-700 hover:text-paper flex items-center gap-2 border px-4 py-2 text-sm font-medium transition",
        className
      )}
    >
      <ChefHat size={16} />이 카드로 요리하기
    </button>
  );
}
