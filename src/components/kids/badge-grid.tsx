import { cn } from "@/lib/utils";

interface Badge {
  id: string;
  emoji: string;
  label: string;
  unlocked: boolean;
}

const BADGES: Badge[] = [
  { id: "b1", emoji: "🥗", label: "채소왕", unlocked: true },
  { id: "b2", emoji: "🍳", label: "요리사", unlocked: true },
  { id: "b3", emoji: "🌟", label: "건강왕", unlocked: false },
  { id: "b4", emoji: "🏆", label: "미션마스터", unlocked: false },
];

export function BadgeGrid() {
  return (
    <div className="px-4">
      <p className="text-ink-700 mb-3 text-sm font-semibold">내 뱃지 🏅</p>
      <div className="grid grid-cols-4 gap-3">
        {BADGES.map((badge) => (
          <div
            key={badge.id}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border py-3 transition",
              badge.unlocked ? "border-honey bg-honey/10" : "border-line bg-white"
            )}
          >
            <span className={cn("text-2xl", !badge.unlocked && "opacity-40 grayscale")}>
              {badge.emoji}
            </span>
            <span
              className={cn(
                "text-center text-[10px] font-medium",
                badge.unlocked ? "text-mocha-700" : "text-ink-300"
              )}
            >
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
