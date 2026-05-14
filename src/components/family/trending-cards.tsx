import { TrendingUp } from "lucide-react";
import Link from "next/link";

interface TrendingItem {
  cardId: string;
  name: string;
  emoji: string;
  pct: number;
}

const FALLBACK_TRENDING: TrendingItem[] = [
  { cardId: "c03", name: "봄 나물 제철한상", emoji: "🌿", pct: 42 },
  { cardId: "c05", name: "K-디저트 모음전", emoji: "🍡", pct: 28 },
  { cardId: "c06", name: "홈시네마 나이트", emoji: "🍿", pct: 19 },
];

interface TrendingCardsProps {
  items?: TrendingItem[];
}

export function TrendingCards({ items }: TrendingCardsProps) {
  const trending = items && items.length > 0 ? items : FALLBACK_TRENDING;

  return (
    <section className="px-4" data-testid="trending-cards">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp size={15} className="text-terracotta" />
        <h3 className="text-ink-700 text-sm font-semibold">지금 뜨는 카드</h3>
        <span className="text-ink-300 text-[11px]">실시간</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {trending.map((item) => (
          <Link
            key={item.cardId}
            href={`/cards/${item.cardId}`}
            data-testid={`trending-card-${item.cardId}`}
            className="border-line flex flex-shrink-0 items-center gap-3 rounded-lg border bg-white px-3 py-2.5"
            style={{ minWidth: 180 }}
          >
            <span className="text-2xl">{item.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-ink-800 truncate text-xs font-semibold">{item.name}</p>
              <p className="text-terracotta mt-0.5 text-[11px] font-medium">+{item.pct}% 상승</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
