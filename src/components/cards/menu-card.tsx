"use client";

import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { HealthScoreBadge } from "@/components/ui/health-score-badge";
import type { MenuCard as MenuCardType } from "@/lib/types";

const THEME_LABELS: Record<string, string> = {
  chef_table: "흑백요리사",
  one_meal: "한 끼",
  family_recipe: "가족레시피",
  drama_recipe: "드라마레시피",
  honwell: "혼웰빙",
  seasonal: "제철K팜",
  global_plate: "세계한끼",
  k_dessert: "K디저트",
  snack_pack: "간식팩",
  cinema_night: "홈시네마",
};

interface MenuCardProps {
  card: MenuCardType;
  onClick?: () => void;
  className?: string;
  /** 우리가족 TOP3 순위(1~3). 없으면 미표시 */
  topRank?: number;
  /** pgvector 취향 매칭 점수(%). 없으면 미표시 */
  aiMatch?: number;
}

export function MenuCard({ card, onClick, className, topRank, aiMatch }: MenuCardProps) {
  const themeLabel = THEME_LABELS[card.cardTheme] ?? card.cardTheme;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn("bg-card shadow-card cursor-pointer overflow-hidden rounded-xl", className)}
    >
      {/* 썸네일 */}
      <div className="bg-mocha-50 relative h-40 w-full">
        {card.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.coverImage} alt={card.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            {card.emoji ?? "🍽️"}
          </div>
        )}
        {/* 테마 배지 */}
        <span className="rounded-pill bg-mocha-900/70 text-paper absolute top-2 left-2 px-2.5 py-0.5 text-[11px] font-medium">
          {themeLabel}
        </span>
        {/* 우리가족 TOP3 강조 배지 */}
        {topRank !== undefined && (
          <span className="rounded-pill bg-honey text-mocha-900 absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold">
            <Crown size={10} />
            TOP{topRank}
          </span>
        )}
        {topRank === undefined && card.isNew && (
          <span className="rounded-pill bg-honey text-mocha-900 absolute top-2 right-2 px-2.5 py-0.5 text-[11px] font-semibold">
            NEW
          </span>
        )}
      </div>

      {/* 카드 본문 */}
      <div className="flex flex-col gap-2 p-3">
        <div>
          <h3 className="text-ink-900 text-sm leading-tight font-semibold">{card.name}</h3>
          {card.subtitle && <p className="text-ink-500 mt-0.5 text-[12px]">{card.subtitle}</p>}
        </div>

        {/* 취향 태그 */}
        {card.taste && (
          <div className="flex flex-wrap gap-1">
            {card.taste.split(",").map((tag) => (
              <span
                key={tag}
                className="rounded-pill bg-olive-100 px-2 py-0.5 text-[11px] text-olive-700"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* 건강점수 + AI 취향 매칭 */}
        <div className="flex flex-wrap items-center gap-1.5">
          {card.healthScore !== undefined && <HealthScoreBadge score={card.healthScore} />}
          {aiMatch !== undefined && (
            <span className="rounded-pill inline-flex items-center gap-1 bg-olive-100 px-2 py-0.5 text-[11px] font-semibold text-olive-700">
              <Sparkles size={9} />
              취향 {aiMatch}%
            </span>
          )}
        </div>

        {/* 가격 */}
        {card.priceMin !== undefined && (
          <p className="text-mocha-700 text-[12px] font-semibold">
            {card.priceMin.toLocaleString("ko-KR")}원~
          </p>
        )}
      </div>
    </motion.div>
  );
}
