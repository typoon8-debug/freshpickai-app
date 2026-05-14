import { cn } from "@/lib/utils";

interface HealthScoreBadgeProps {
  score: number; // 0.0 ~ 1.0
  size?: "default" | "xs";
  className?: string;
}

export function HealthScoreBadge({ score, size = "default", className }: HealthScoreBadgeProps) {
  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);
  const label = pct >= 80 ? "건강" : pct >= 50 ? "보통" : "주의";
  const labelColor = pct >= 80 ? "text-sage" : pct >= 50 ? "text-honey" : "text-terracotta";
  const bgColor = pct >= 80 ? "bg-sage/10" : pct >= 50 ? "bg-honey/10" : "bg-terracotta/10";

  if (size === "xs") {
    return (
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] font-semibold",
          bgColor,
          labelColor,
          className
        )}
      >
        {pct}
      </span>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-ink-500 text-[11px]">건강점수</span>
        <span className={cn("text-[11px] font-semibold", labelColor)}>
          {label} {pct}
        </span>
      </div>
      <div className="bg-mocha-100 h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-sage h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
