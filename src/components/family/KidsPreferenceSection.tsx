"use client";

import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { getKidsPreferredCards } from "@/lib/actions/kids/rating";
import { cn } from "@/lib/utils";
import type { FamilyMember } from "@/lib/types";

interface KidsPreferenceSectionProps {
  groupId: string;
  kidsMember?: Pick<FamilyMember, "memberId" | "displayName">;
}

function StarDisplay({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rounded ? "fill-honey text-honey" : "text-ink-200"}
        />
      ))}
    </div>
  );
}

export function KidsPreferenceSection({ groupId, kidsMember }: KidsPreferenceSectionProps) {
  const { data: preferred = [], isLoading } = useQuery({
    queryKey: ["kids-preferred", groupId],
    queryFn: () => getKidsPreferredCards(groupId),
    staleTime: 30_000,
    enabled: !!groupId,
  });

  const displayName = kidsMember?.displayName ?? "우리 아이";

  return (
    <section className="px-4">
      <h3 className="text-ink-700 mb-3 text-sm font-semibold">{displayName} 선호 ⭐</h3>

      {isLoading && (
        <div className="border-line rounded-lg border bg-white p-4">
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-ink-100 h-8 w-8 animate-pulse rounded-lg" />
                <div className="flex-1 space-y-1">
                  <div className="bg-ink-100 h-3 w-24 animate-pulse rounded" />
                  <div className="bg-ink-100 h-3 w-16 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && preferred.length === 0 && (
        <div className="border-line rounded-lg border bg-white p-6 text-center">
          <p className="text-2xl">⭐</p>
          <p className="text-ink-400 mt-1 text-sm">아직 별점이 없어요</p>
          <p className="text-ink-300 text-xs">카드 상세 페이지에서 별점을 남겨보세요</p>
        </div>
      )}

      {!isLoading && preferred.length > 0 && (
        <div className="border-line overflow-hidden rounded-lg border bg-white">
          {preferred.map((item, idx) => (
            <div
              key={item.cardId}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                idx < preferred.length - 1 && "border-line border-b"
              )}
            >
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-ink-800 text-sm font-medium">{item.name}</p>
                <StarDisplay rating={item.avgRating} />
              </div>
              <span className="text-ink-400 text-xs">{item.avgRating.toFixed(1)}점</span>
            </div>
          ))}
        </div>
      )}

      {/* 카드 상세 페이지 안내 */}
      {preferred.length === 0 && !isLoading && (
        <p className="text-ink-300 mt-2 text-center text-[11px]">
          카드 상세 페이지에서 별점을 남기면 여기에 나타나요
        </p>
      )}
    </section>
  );
}
