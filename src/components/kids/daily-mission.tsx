import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyMissionProps {
  current?: number;
  total?: number;
}

export function DailyMission({ current = 2, total = 3 }: DailyMissionProps) {
  const pct = Math.round((current / total) * 100);
  const isDone = current >= total;

  return (
    <div className="border-line mx-4 rounded-xl border bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">🥦</span>
        <div className="flex-1">
          <p className="text-ink-900 text-sm font-semibold">오늘 채소 도전!</p>
          <p className="text-ink-400 text-xs">채소 요리 {total}가지 선택하기</p>
        </div>
        {isDone && <Trophy size={18} className="text-honey" />}
      </div>

      <div className="bg-mocha-100 h-3 overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            isDone ? "bg-honey" : "bg-sage"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p
        className={cn("mt-1.5 text-right text-xs font-medium", isDone ? "text-honey" : "text-sage")}
      >
        {current}/{total} {isDone ? "🎉 완료!" : ""}
      </p>
    </div>
  );
}
