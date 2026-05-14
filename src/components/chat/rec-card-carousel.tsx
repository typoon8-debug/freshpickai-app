"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { HealthScoreBadge } from "@/components/ui/health-score-badge";

interface RecCardCarouselProps {
  cards: NonNullable<ChatMessage["cards"]>;
}

export function RecCardCarousel({ cards }: RecCardCarouselProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {cards.map((card) => (
        <Link
          key={card.cardId}
          href={`/cards/${card.cardId}`}
          className="border-line flex-shrink-0 overflow-hidden rounded-lg border bg-white"
          style={{ width: 140 }}
        >
          {/* 썸네일 영역 */}
          <div className="bg-mocha-50 flex h-20 items-center justify-center">
            <span className="text-4xl">{card.emoji ?? "🍽️"}</span>
          </div>

          <div className="p-2">
            <p className="text-ink-900 line-clamp-2 text-xs leading-tight font-semibold">
              {card.name}
            </p>
            <div className="mt-1.5 flex items-center justify-between">
              {card.priceMin != null && (
                <span className="text-mocha-700 text-[11px] font-semibold">
                  {formatPrice(card.priceMin)}~
                </span>
              )}
              {card.healthScore != null && <HealthScoreBadge score={card.healthScore} size="xs" />}
            </div>
          </div>
        </Link>
      ))}

      {/* 더보기 카드 */}
      {cards.length >= 2 && (
        <Link
          href="/"
          className="border-line bg-mocha-50 flex flex-shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border"
          style={{ width: 80 }}
        >
          <Heart size={16} className="text-mocha-400" />
          <span className="text-ink-500 text-[10px]">더 보기</span>
        </Link>
      )}
    </div>
  );
}
