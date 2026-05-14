"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const WELLNESS_TAGS = [
  "저속노화",
  "다이어트",
  "근육강화",
  "혈당관리",
  "면역강화",
  "수면개선",
  "소화개선",
];
const COOK_TIMES = ["10분 이내", "30분 이내", "1시간 이내"];
const BUDGETS = ["1만원 이하", "2만원대", "3만원 이상"];

export interface OnboardingValues {
  householdSize: number;
  wellnessTags: string[];
  cookTime: string;
  budget: string;
}

interface OnboardingFormProps {
  onSubmit: (values: OnboardingValues) => void;
  className?: string;
}

export function OnboardingForm({ onSubmit, className }: OnboardingFormProps) {
  const [householdSize, setHouseholdSize] = useState(3);
  const [wellnessTags, setWellnessTags] = useState<string[]>([]);
  const [cookTime, setCookTime] = useState("");
  const [budget, setBudget] = useState("");

  const toggleTag = (tag: string) => {
    setWellnessTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (!cookTime || !budget) return;
    onSubmit({ householdSize, wellnessTags, cookTime, budget });
  };

  const isValid = cookTime !== "" && budget !== "";

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* 가구 인원 */}
      <div>
        <p className="text-ink-700 mb-3 text-sm font-semibold">우리 가족은 몇 명인가요?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setHouseholdSize(n)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition",
                householdSize === n
                  ? "border-mocha-700 bg-mocha-700 text-paper"
                  : "border-line text-ink-500 hover:border-mocha-300"
              )}
            >
              {n === 6 ? "6+" : n}
            </button>
          ))}
        </div>
      </div>

      {/* 웰빙 목표 */}
      <div>
        <p className="text-ink-700 mb-3 text-sm font-semibold">
          건강 목표를 선택해주세요 <span className="text-ink-300 font-normal">(복수 선택)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {WELLNESS_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "rounded-pill px-3 py-1.5 text-sm transition",
                wellnessTags.includes(tag)
                  ? "bg-mocha-700 text-paper"
                  : "bg-mocha-50 text-ink-700 hover:bg-mocha-100"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 선호 요리시간 */}
      <div>
        <p className="text-ink-700 mb-3 text-sm font-semibold">선호하는 요리 시간은?</p>
        <div className="grid grid-cols-2 gap-2">
          {COOK_TIMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCookTime(t)}
              className={cn(
                "rounded border py-2.5 text-sm transition",
                cookTime === t
                  ? "border-mocha-700 bg-mocha-50 text-mocha-700 font-semibold"
                  : "border-line text-ink-500 hover:border-mocha-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 끼니 예산 */}
      <div>
        <p className="text-ink-700 mb-3 text-sm font-semibold">한 끼 예산은?</p>
        <div className="grid grid-cols-2 gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBudget(b)}
              className={cn(
                "rounded border py-2.5 text-sm transition",
                budget === b
                  ? "border-mocha-700 bg-mocha-50 text-mocha-700 font-semibold"
                  : "border-line text-ink-500 hover:border-mocha-300"
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!isValid}
        onClick={handleSubmit}
        className="btn-primary w-full disabled:opacity-40"
      >
        시작하기
      </button>
    </div>
  );
}
