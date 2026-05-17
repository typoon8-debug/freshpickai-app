"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyNutritionSummary, DayNutrition } from "@/lib/actions/nutrition/weekly";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function DeltaBadge({ value, label }: { value: number; label: string }) {
  const isUp = value > 0;
  const color = isUp ? "text-red-500" : "text-green-600";
  const arrow = isUp ? "▲" : "▼";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {arrow} {Math.abs(value)}% {label}
    </span>
  );
}

interface Props {
  summary: WeeklyNutritionSummary;
}

export function WeeklyNutritionChart({ summary }: Props) {
  const { days, dailyGoal, prevWeekDelta, topCards } = summary;

  const barData = days.map((d: DayNutrition, i) => ({
    day: DAY_LABELS[i],
    kcal: Math.round(d.kcal),
  }));

  const radarData = [
    {
      subject: "단백질",
      value: Math.min(
        100,
        Math.round((days.reduce((s, d) => s + d.protein, 0) / 7 / dailyGoal.protein) * 100)
      ),
    },
    {
      subject: "탄수화물",
      value: Math.min(
        100,
        Math.round((days.reduce((s, d) => s + d.carbs, 0) / 7 / dailyGoal.carbs) * 100)
      ),
    },
    {
      subject: "지방",
      value: Math.min(
        100,
        Math.round((days.reduce((s, d) => s + d.fat, 0) / 7 / dailyGoal.fat) * 100)
      ),
    },
    {
      subject: "식이섬유",
      value: Math.min(100, Math.round((days.reduce((s, d) => s + d.fiber, 0) / 7 / 25) * 100)),
    },
    {
      subject: "나트륨",
      value: Math.min(100, Math.round((days.reduce((s, d) => s + d.sodium, 0) / 7 / 2000) * 100)),
    },
  ];

  const totalKcal = Math.round(days.reduce((s, d) => s + d.kcal, 0));
  const avgKcal = Math.round(totalKcal / 7);

  return (
    <div className="flex flex-col gap-6" data-testid="weekly-nutrition-chart">
      {/* 주간 요약 헤더 */}
      <div className="bg-mocha-50 rounded-xl px-4 py-3">
        <p className="text-ink-500 text-xs">주간 총 칼로리</p>
        <p className="text-mocha-700 text-2xl font-bold">
          {totalKcal.toLocaleString()}
          <span className="text-ink-500 ml-1 text-base font-normal">kcal</span>
        </p>
        <p className="text-ink-500 mt-0.5 text-xs">
          일 평균 {avgKcal.toLocaleString()} kcal (목표 {dailyGoal.kcal.toLocaleString()} kcal)
        </p>
        {prevWeekDelta && (
          <div className="mt-2 flex flex-wrap gap-2">
            <DeltaBadge value={prevWeekDelta.kcal} label="칼로리" />
            <DeltaBadge value={prevWeekDelta.protein} label="단백질" />
            <DeltaBadge value={prevWeekDelta.carbs} label="탄수화물" />
          </div>
        )}
      </div>

      {/* 칼로리 막대 그래프 */}
      <section>
        <p className="text-ink-700 mb-2 text-sm font-semibold">일별 칼로리</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece8" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => [`${Number(v ?? 0).toLocaleString()} kcal`, "칼로리"]}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <ReferenceLine
              y={dailyGoal.kcal}
              stroke="#b5936b"
              strokeDasharray="4 4"
              label={{ value: "목표", position: "right", fontSize: 10 }}
            />
            <Bar dataKey="kcal" fill="#b5936b" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* 영양소 균형 레이더 */}
      <section>
        <p className="text-ink-700 mb-2 text-sm font-semibold">영양소 균형 (권장량 대비 %)</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#f0ece8" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <Radar
              name="섭취량"
              dataKey="value"
              stroke="#b5936b"
              fill="#b5936b"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </section>

      {/* 칼로리 기여 Top 3 카드 */}
      {topCards.length > 0 && (
        <section>
          <p className="text-ink-700 mb-2 text-sm font-semibold">
            칼로리 기여 Top {topCards.length}
          </p>
          <div className="flex flex-col gap-2">
            {topCards.map((c, i) => (
              <div
                key={c.cardId}
                className="border-line flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5"
              >
                <span className="text-mocha-700 w-5 text-center text-sm font-bold">{i + 1}</span>
                <p className="text-ink-700 flex-1 text-sm">{c.cardName}</p>
                <span className="text-ink-500 text-xs">
                  {Math.round(c.totalKcal).toLocaleString()} kcal
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
