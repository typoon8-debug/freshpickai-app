import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { MenuCard } from "@/lib/types";
import { AIBadge } from "./ai-badge";

interface DailyHeroProps {
  card?: MenuCard;
}

export function DailyHero({ card }: DailyHeroProps) {
  const displayName = card?.name ?? "오늘의 AI 추천 메뉴";
  const displaySub = card?.subtitle ?? "지금 가족 취향에 딱 맞는 메뉴를 골랐어요";
  const href = card ? `/cards/${card.cardId}` : "#";
  // AI 신뢰도 — Task 030에서 pgvector cosine 유사도로 교체
  const aiConfidence =
    card?.healthScore !== undefined ? Math.max(80, Math.round(card.healthScore * 100)) : 95;

  return (
    <div className="bg-mocha-700 text-paper relative overflow-hidden rounded-2xl px-5 py-6">
      {/* 배경 장식 */}
      <div className="bg-mocha-500/30 absolute -top-6 -right-6 h-32 w-32 rounded-full" />
      <div className="bg-mocha-900/20 absolute -right-2 -bottom-8 h-24 w-24 rounded-full" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-honey" />
          <span className="text-paper/70 text-[11px] font-semibold tracking-widest uppercase">
            오늘의 큐레이팅
          </span>
        </div>

        <div>
          <h2 className="font-display text-[28px] leading-[1.15] tracking-tight">{displayName}</h2>
          <p className="text-paper/70 mt-1.5 text-sm">{displaySub}</p>
        </div>

        <div className="flex items-center gap-2">
          <AIBadge label={`취향 매칭 ${aiConfidence}%`} highlight />
          {card?.taste && <span className="text-paper/60 text-xs">{card.taste.split(",")[0]}</span>}
        </div>

        <Link
          href={href}
          className="rounded-pill bg-paper text-mocha-700 hover:bg-mocha-50 mt-1 inline-flex h-10 items-center justify-center px-5 text-sm font-semibold transition"
        >
          지금 보기
        </Link>
      </div>
    </div>
  );
}
