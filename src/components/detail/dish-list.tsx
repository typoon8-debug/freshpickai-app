"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Dish } from "@/lib/types";
import type { DishWithRecipe } from "@/lib/actions/cards/detail";
import { IngredientRow } from "@/components/detail/ingredient-row";

interface DishListProps {
  dishes?: (Dish | DishWithRecipe)[];
}

function hasDishRecipe(dish: Dish | DishWithRecipe): dish is DishWithRecipe {
  return "recipe" in dish && dish.recipe !== undefined;
}

export function DishList({ dishes = [] }: DishListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (dishes.length === 0) {
    return (
      <section className="border-line rounded-xl border bg-white p-4">
        <h3 className="text-ink-900 mb-2 text-sm font-semibold">구성 음식</h3>
        <p className="text-ink-400 text-xs">음식 정보를 불러오는 중입니다.</p>
      </section>
    );
  }

  return (
    <section className="border-line rounded-xl border bg-white p-4">
      <h3 className="text-ink-900 mb-3 text-sm font-semibold">구성 음식</h3>
      <div className="flex flex-col gap-3">
        {dishes.map((dish) => {
          const withRecipe = hasDishRecipe(dish);
          const isExpanded = expandedId === dish.dishId;

          return (
            <div key={dish.dishId}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="text-ink-900 text-sm font-medium">{dish.name}</p>
                  {dish.description && <p className="text-ink-400 text-xs">{dish.description}</p>}
                  {dish.cookTime && <p className="text-ink-300 text-xs">⏱ {dish.cookTime}분</p>}
                </div>
                {withRecipe && (
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : dish.dishId)}
                    className="text-ink-400 hover:text-ink-700 flex items-center gap-1 text-xs"
                  >
                    레시피
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}
              </div>

              {/* 대표 레시피 본문 */}
              {withRecipe && isExpanded && dish.recipe && (
                <div className="bg-mocha-50/40 mt-2 rounded-lg p-3">
                  <p className="text-ink-700 mb-1 text-xs font-semibold">{dish.recipe.title}</p>
                  {dish.recipe.body && (
                    <p className="text-ink-500 text-xs leading-relaxed whitespace-pre-line">
                      {dish.recipe.body}
                    </p>
                  )}
                </div>
              )}

              {/* 재료 목록 — AI enrichment 포함 */}
              {"ingredients" in dish && (dish as DishWithRecipe).ingredients.length > 0 && (
                <div className="divide-muted/50 mt-2 flex flex-col divide-y">
                  {(dish as DishWithRecipe).ingredients.map((ing) => (
                    <IngredientRow key={ing.ingredientId} ingredient={ing} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
