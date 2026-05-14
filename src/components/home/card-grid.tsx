"use client";

import { useRouter } from "next/navigation";
import { MenuCard } from "@/components/cards/menu-card";
import { CardSkeleton } from "@/components/ui/skeleton";
import type { MenuCard as MenuCardType } from "@/lib/types";

interface CardGridProps {
  cards: MenuCardType[];
  loading?: boolean;
  top3Ids?: string[];
}

export function CardGrid({ cards, loading = false, top3Ids = [] }: CardGridProps) {
  const router = useRouter();

  if (loading && cards.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <span className="text-4xl">🍽️</span>
        <p className="text-ink-500 text-sm">이 섹션에 카드가 없어요</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const topRank = top3Ids.indexOf(card.cardId);
        return (
          <MenuCard
            key={card.cardId}
            card={card}
            topRank={topRank >= 0 ? topRank + 1 : undefined}
            aiMatch={
              card.healthScore !== undefined ? Math.round(card.healthScore * 100) : undefined
            }
            onClick={() => router.push(`/cards/${card.cardId}`)}
          />
        );
      })}
    </div>
  );
}
