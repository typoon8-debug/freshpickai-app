"use client";

import { cn } from "@/lib/utils";
import { useKidsStore } from "@/lib/store";
import type { KidsPick } from "@/lib/types";

const FOOD_OPTIONS: KidsPick[] = [
  { id: "f1", emoji: "🍗", name: "치킨" },
  { id: "f2", emoji: "🍕", name: "피자" },
  { id: "f3", emoji: "🍜", name: "라면" },
  { id: "f4", emoji: "🍱", name: "도시락" },
  { id: "f5", emoji: "🌮", name: "타코" },
  { id: "f6", emoji: "🍔", name: "버거" },
];

export function FoodPicker() {
  const { picks, toggle } = useKidsStore();

  return (
    <div>
      <p className="text-ink-500 mb-3 px-4 text-xs">좋아하는 음식을 탭하세요!</p>
      <div className="grid grid-cols-3 gap-3 px-4">
        {FOOD_OPTIONS.map((food) => {
          const isSelected = picks.some((p) => p.id === food.id);
          return (
            <button
              key={food.id}
              type="button"
              onClick={() => toggle(food)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 py-4 transition active:scale-95",
                isSelected ? "border-olive-500 bg-olive-100" : "border-line bg-white"
              )}
              style={{ minHeight: 80 }}
            >
              <span className="text-4xl">{food.emoji}</span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  isSelected ? "text-olive-700" : "text-ink-600"
                )}
              >
                {food.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
