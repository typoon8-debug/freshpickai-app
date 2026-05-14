import type { HealthScore } from "@/lib/health-score";

interface HealthScoreSectionProps {
  healthScore?: number;
  healthScore3?: HealthScore;
}

const METRICS = [
  { label: "저속노화 지수", key: "slowAging" as const, desc: "항산화·가공도·식이섬유" },
  { label: "혈당 지수", key: "glycemicIndex" as const, desc: "GI 지수 기반" },
  { label: "영양 밸런스", key: "nutrition" as const, desc: "단백질·탄수화물·지방 비율" },
];

export function HealthScoreSection({ healthScore = 0.5, healthScore3 }: HealthScoreSectionProps) {
  // healthScore3 우선, 없으면 단일 값으로 3지표 추정
  const scores: Record<"slowAging" | "glycemicIndex" | "nutrition", number> = healthScore3
    ? {
        slowAging: healthScore3.slowAging,
        glycemicIndex: healthScore3.glycemicIndex,
        nutrition: healthScore3.nutrition,
      }
    : {
        slowAging: Math.min(1, healthScore * 1.1),
        glycemicIndex: Math.min(1, healthScore * 0.9),
        nutrition: Math.min(1, healthScore),
      };

  return (
    <section className="border-line rounded-xl border bg-white p-4">
      <h3 className="text-ink-900 mb-3 text-sm font-semibold">건강 점수</h3>
      <div className="flex flex-col gap-3">
        {METRICS.map(({ label, key, desc }) => {
          const score = scores[key];
          const pct = Math.round(score * 10);
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <span className="text-ink-700 text-sm font-medium">{label}</span>
                  <span className="text-ink-400 ml-1.5 text-xs">{desc}</span>
                </div>
                <span className="text-sage text-sm font-semibold">{pct}/10</span>
              </div>
              <div className="bg-mocha-50 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-sage h-full rounded-full transition-all duration-500"
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
