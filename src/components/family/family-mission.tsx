import { Film, ChevronRight } from "lucide-react";
import Link from "next/link";

interface MissionCard {
  card_id: string;
  name: string;
  emoji: string | null;
}

const MISSION_META = [
  { icon: "🥗", title: "이번 주 채소 도전!", desc: "4가지 채소 요리 도전 중" },
  { icon: "🎬", title: "금요일 홈시네마 나이트", desc: "오늘의 무비 페어링 메뉴" },
];

interface FamilyMissionProps {
  cards: MissionCard[];
}

export function FamilyMission({ cards }: FamilyMissionProps) {
  if (cards.length === 0) return null;

  return (
    <section className="px-4">
      <div className="mb-3 flex items-center gap-2">
        <Film size={15} className="text-mocha-500" />
        <h3 className="text-ink-700 text-sm font-semibold">이번 주 미션</h3>
      </div>

      <div className="flex flex-col gap-3">
        {cards.slice(0, 2).map((card, idx) => {
          const meta = MISSION_META[idx];
          return (
            <div
              key={card.card_id}
              className="border-line overflow-hidden rounded-lg border bg-white"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-2xl">{card.emoji ?? meta?.icon ?? "🍽️"}</span>
                <div className="flex-1">
                  <p className="text-ink-900 text-sm font-semibold">{meta?.title ?? card.name}</p>
                  <p className="text-ink-500 mt-0.5 text-xs">{card.name}</p>
                </div>
                <Link
                  href={`/cards/${card.card_id}`}
                  className="text-mocha-700 flex items-center text-xs font-medium"
                >
                  카드 보기
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
