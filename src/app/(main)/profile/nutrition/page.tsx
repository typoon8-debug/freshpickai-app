"use client";

import { useState, useTransition, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TopHeader } from "@/components/layout/top-header";
import { getWeeklyNutritionSummary } from "@/lib/actions/nutrition/weekly";
import type { WeeklyNutritionSummary } from "@/lib/actions/nutrition/weekly";

// recharts(~200KB)를 영양 분석 페이지 진입 시에만 로드 — 홈/카드 번들에서 제외
const WeeklyNutritionChart = dynamic(
  () =>
    import("@/components/nutrition/WeeklyNutritionChart").then((m) => ({
      default: m.WeeklyNutritionChart,
    })),
  { ssr: false }
);

export default function NutritionPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [summary, setSummary] = useState<WeeklyNutritionSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getWeeklyNutritionSummary(weekOffset);
      setSummary(data);
    });
  }, [weekOffset]);

  const handlePrev = () => setWeekOffset((o) => o - 1);
  const handleNext = () => {
    if (weekOffset < 0) setWeekOffset((o) => o + 1);
  };

  return (
    <div className="min-h-screen pb-24">
      <TopHeader title="영양 분석" backHref="/profile" />

      {/* 주차 탐색 */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={handlePrev}
          className="text-ink-600 hover:text-mocha-700 p-1 transition"
          aria-label="이전 주"
        >
          <ChevronLeft size={22} />
        </button>
        <p className="text-ink-700 text-sm font-semibold">
          {summary?.weekLabel ?? "로딩 중..."}
          {weekOffset === 0 && <span className="text-mocha-500 ml-1 text-xs">(이번 주)</span>}
        </p>
        <button
          type="button"
          onClick={handleNext}
          disabled={weekOffset >= 0}
          className="text-ink-600 hover:text-mocha-700 p-1 transition disabled:opacity-30"
          aria-label="다음 주"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="px-4">
        {isPending && !summary && (
          <div className="flex justify-center py-16">
            <div className="border-mocha-300 border-t-mocha-700 h-6 w-6 animate-spin rounded-full border-2" />
          </div>
        )}

        {!isPending && summary && summary.days.every((d) => d.kcal === 0) && (
          <div className="py-16 text-center">
            <p className="text-ink-400 text-4xl">🥗</p>
            <p className="text-ink-500 mt-3 text-sm">이번 주 주문 내역이 없습니다.</p>
            <p className="text-ink-400 mt-1 text-xs">카드를 선택하고 장보기를 시작해 보세요!</p>
          </div>
        )}

        {summary && summary.days.some((d) => d.kcal > 0) && (
          <WeeklyNutritionChart summary={summary} />
        )}
      </div>
    </div>
  );
}
