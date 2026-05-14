"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DetailHeaderProps {
  cardName?: string;
  themeName?: string;
}

export function DetailHeader({ cardName, themeName }: DetailHeaderProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="hover:bg-mocha-50 flex h-10 w-10 items-center justify-center rounded-full"
        aria-label="뒤로가기"
      >
        <ChevronLeft size={22} className="text-ink-700" />
      </button>

      <div className="flex flex-col items-center gap-0.5">
        {themeName && (
          <span className="text-ink-400 text-[11px] tracking-wider uppercase">{themeName}</span>
        )}
        {cardName && (
          <span className="text-ink-900 max-w-[180px] truncate text-sm font-semibold">
            {cardName}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setLiked((p) => !p)}
        className="hover:bg-mocha-50 flex h-10 w-10 items-center justify-center rounded-full"
        aria-label={liked ? "찜 해제" : "찜하기"}
      >
        <Heart
          size={20}
          className={cn(liked ? "fill-terracotta text-terracotta" : "text-ink-400")}
        />
      </button>
    </header>
  );
}
