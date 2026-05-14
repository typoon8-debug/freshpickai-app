"use client";

import { useState } from "react";
import { RotateCw, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { HealthScoreBadge } from "@/components/ui/health-score-badge";
import { QtyAdjuster } from "@/components/detail/qty-adjuster";
import type { Dish, Ingredient } from "@/lib/types";

interface CardFlipperProps {
  dish: Dish;
  ingredients: Ingredient[];
  className?: string;
}

export function CardFlipper({ dish, ingredients, className }: CardFlipperProps) {
  const [flipped, setFlipped] = useState(false);
  const [qtys, setQtys] = useState<Record<string, number>>(() =>
    Object.fromEntries(ingredients.map((ing) => [ing.ingredientId, 1]))
  );

  return (
    <div
      className={cn("relative h-72 w-full cursor-pointer [perspective:1200px]", className)}
      onClick={() => setFlipped((p) => !p)}
    >
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* 앞면 — 음식 정보 */}
        <div className="bg-mocha-50 absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]">
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
            <div className="shadow-card flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-6xl">
              {dish.dishId ? "🍽️" : "🍽️"}
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h2 className="font-display text-mocha-900 text-xl">{dish.name}</h2>
              {dish.description && (
                <p className="text-ink-500 text-sm leading-relaxed">{dish.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {dish.cookTime && (
                <div className="text-ink-500 flex items-center gap-1 text-sm">
                  <Clock size={14} />
                  {dish.cookTime}분
                </div>
              )}
              {dish.kcal && (
                <div className="text-ink-500 flex items-center gap-1 text-sm">
                  <Flame size={14} />
                  {dish.kcal}kcal
                </div>
              )}
              {dish.healthScore !== undefined && <HealthScoreBadge score={dish.healthScore} />}
            </div>
            {/* 뒤집기 힌트 */}
            <div className="text-ink-300 absolute right-3 bottom-3 flex items-center gap-1 text-xs">
              <RotateCw size={12} />
              재료 보기
            </div>
          </div>
        </div>

        {/* 뒷면 — 재료 목록 */}
        <div className="absolute inset-0 [transform:rotateY(180deg)] overflow-hidden rounded-2xl bg-white [backface-visibility:hidden]">
          <div className="flex h-full flex-col">
            <div className="border-line border-b px-4 py-3">
              <h3 className="text-ink-900 text-sm font-semibold">재료 목록</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {ingredients.map((ing) => (
                <div
                  key={ing.ingredientId}
                  className="border-line/50 flex items-center justify-between border-b px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ing.emoji ?? "🛒"}</span>
                    <div>
                      <p className="text-ink-900 text-sm font-medium">{ing.name}</p>
                      <p className="text-ink-400 text-xs">
                        {ing.quantity} {ing.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {ing.price && (
                      <span className="text-ink-700 text-sm font-semibold">
                        {ing.price.toLocaleString("ko-KR")}원
                      </span>
                    )}
                    {ing.priceWas && (
                      <span className="text-terracotta text-xs line-through">
                        {ing.priceWas.toLocaleString("ko-KR")}원
                      </span>
                    )}
                    <QtyAdjuster
                      value={qtys[ing.ingredientId] ?? 1}
                      onChange={(next) =>
                        setQtys((prev) => ({ ...prev, [ing.ingredientId]: next }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-ink-300 absolute right-3 bottom-3 flex items-center gap-1 text-xs">
              <RotateCw size={12} />
              앞면 보기
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
