"use client";

import { Star, Utensils } from "lucide-react";

interface FamilyBannerProps {
  groupName?: string;
  level?: number;
  mealsThisMonth?: number;
}

export function FamilyBanner({
  groupName = "우리 가족",
  level = 12,
  mealsThisMonth = 47,
}: FamilyBannerProps) {
  return (
    <div className="bg-mocha-700 px-4 py-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-mocha-200 text-xs font-medium">우리가족 보드</p>
          <h2 className="font-display text-paper mt-1 text-2xl">{groupName}</h2>
        </div>
        <div className="bg-mocha-600 flex items-center gap-1.5 rounded-full px-3 py-1.5">
          <Star size={13} className="text-honey fill-honey" />
          <span className="text-paper text-xs font-semibold">Lv.{level}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="bg-mocha-600/50 flex items-center gap-2 rounded-lg px-3 py-2">
          <Utensils size={14} className="text-mocha-200" />
          <div>
            <span className="text-paper text-sm font-bold">{mealsThisMonth}끼</span>
            <span className="text-mocha-300 ml-1 text-xs">이번 달 함께한 식사</span>
          </div>
        </div>
      </div>
    </div>
  );
}
