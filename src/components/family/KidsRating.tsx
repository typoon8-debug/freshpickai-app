"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { rateCard } from "@/lib/actions/kids/rating";
import { useQueryClient } from "@tanstack/react-query";

interface KidsRatingProps {
  cardId: string;
  memberId: string;
  groupId: string;
  initialRating?: number;
  cardName?: string;
}

export function KidsRating({
  cardId,
  memberId,
  groupId,
  initialRating = 0,
  cardName,
}: KidsRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hovered, setHovered] = useState(0);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  function handleRate(score: number) {
    if (isPending) return;
    const newRating = score as 1 | 2 | 3 | 4 | 5;
    setRating(newRating);

    startTransition(async () => {
      await rateCard(cardId, memberId, newRating);
      void queryClient.invalidateQueries({ queryKey: ["kids-preferred", groupId] });
    });
  }

  return (
    <div className="flex flex-col gap-1">
      {cardName && <p className="text-ink-700 truncate text-xs font-medium">{cardName}</p>}
      <div
        className="flex gap-0.5"
        onMouseLeave={() => setHovered(0)}
        role="group"
        aria-label={`${cardName ?? "카드"} 별점`}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = (hovered || rating) >= starValue;
          return (
            <button
              key={i}
              type="button"
              disabled={isPending}
              aria-label={`${starValue}점`}
              onClick={() => handleRate(starValue)}
              onMouseEnter={() => setHovered(starValue)}
              className={cn(
                "flex items-center justify-center rounded transition-transform active:scale-90 disabled:opacity-50",
                "min-h-[44px] min-w-[44px]"
              )}
            >
              <Star
                size={22}
                className={cn(
                  "transition-colors",
                  isFilled ? "fill-honey text-honey" : "text-ink-200"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
