"use client";

import { cn } from "@/lib/utils";
import type { CardTheme } from "@/lib/types";

const THEMES: { value: CardTheme; label: string; emoji: string; desc: string }[] = [
  { value: "chef_table", label: "셰프스 테이블", emoji: "👨‍🍳", desc: "미슐랭 수준 가정식" },
  { value: "one_meal", label: "하루한끼", emoji: "🍱", desc: "균형 잡힌 한 끼" },
  { value: "family_recipe", label: "엄마손맛", emoji: "🥘", desc: "전통 가정식 레시피" },
  { value: "drama_recipe", label: "드라마한끼", emoji: "📺", desc: "드라마 속 그 음식" },
  { value: "honwell", label: "혼웰빙", emoji: "🧘", desc: "혼자서 건강하게" },
  { value: "seasonal", label: "제철한상", emoji: "🌿", desc: "제철 재료 큐레이팅" },
  { value: "global_plate", label: "글로벌", emoji: "🌍", desc: "세계 음식 탐험" },
  { value: "k_dessert", label: "K디저트", emoji: "🍡", desc: "한국 스타일 디저트" },
  { value: "snack_pack", label: "간식팩", emoji: "🍿", desc: "방과후 간식 세트" },
  { value: "cinema_night", label: "홈시네마", emoji: "🎬", desc: "영화 보며 먹는 것" },
];

interface Step1ThemeProps {
  selected: CardTheme | null;
  onChange: (theme: CardTheme) => void;
}

export function Step1Theme({ selected, onChange }: Step1ThemeProps) {
  return (
    <div>
      <p className="text-ink-500 mb-4 text-sm">어떤 테마의 카드를 만들까요?</p>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.value}
            type="button"
            onClick={() => onChange(theme.value)}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition",
              selected === theme.value ? "border-mocha-600 bg-mocha-50" : "border-line bg-white"
            )}
          >
            <span className="text-2xl">{theme.emoji}</span>
            <span
              className={cn(
                "text-sm font-semibold",
                selected === theme.value ? "text-mocha-700" : "text-ink-800"
              )}
            >
              {theme.label}
            </span>
            <span className="text-ink-400 text-[11px]">{theme.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
