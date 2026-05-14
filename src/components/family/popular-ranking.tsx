import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankItem {
  rank: number;
  cardId: string;
  name: string;
  emoji: string;
  count: number;
}

const FALLBACK_RANKING: RankItem[] = [
  { rank: 1, cardId: "c01", name: "셰프의 갈비찜 정식", emoji: "🥩", count: 8 },
  { rank: 2, cardId: "c07", name: "제철 봄나물 비빔밥", emoji: "🌿", count: 6 },
  { rank: 3, cardId: "c03", name: "미슐랭 된장찌개", emoji: "🍲", count: 5 },
  { rank: 4, cardId: "c04", name: "두부 강된장찌개", emoji: "🫘", count: 3 },
  { rank: 5, cardId: "c05", name: "달걀볶음밥", emoji: "🍳", count: 2 },
];

interface PopularRankingProps {
  items?: RankItem[];
}

export function PopularRanking({ items }: PopularRankingProps) {
  const ranking = items && items.length > 0 ? items : FALLBACK_RANKING;

  return (
    <section className="px-4" data-testid="popular-ranking">
      <h3 className="text-ink-700 mb-3 text-sm font-semibold">이번 달 TOP 5 메뉴 🏆</h3>
      <div className="border-line overflow-hidden rounded-lg border bg-white">
        {ranking.map((item, idx) => (
          <div
            key={item.cardId}
            data-testid={`ranking-item-${item.rank}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              idx < ranking.length - 1 && "border-line border-b"
            )}
          >
            {/* 순위 */}
            <div className="w-6 flex-shrink-0 text-center">
              {item.rank === 1 ? (
                <Crown size={16} className="text-honey mx-auto" />
              ) : (
                <span
                  className={cn(
                    "text-sm font-bold",
                    item.rank <= 3 ? "text-mocha-600" : "text-ink-300"
                  )}
                >
                  {item.rank}
                </span>
              )}
            </div>

            <span className="text-xl">{item.emoji}</span>

            <p
              className={cn(
                "flex-1 text-sm",
                item.rank === 1 ? "text-ink-900 font-bold" : "text-ink-700"
              )}
            >
              {item.name}
            </p>

            <span className="text-ink-400 text-xs">{item.count}회</span>
          </div>
        ))}
      </div>
    </section>
  );
}
