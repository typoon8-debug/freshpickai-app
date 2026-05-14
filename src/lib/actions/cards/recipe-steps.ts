"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { DishRecipe, DishRecipeStep } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type DbRecipe = Database["public"]["Tables"]["fp_dish_recipe"]["Row"];

export type CookModeData = {
  card: {
    cardId: string;
    name: string;
    emoji?: string;
    description?: string;
  };
  dishes: {
    dishId: string;
    name: string;
    recipe?: DishRecipe & { steps: DishRecipeStep[] };
  }[];
};

/** CookMode용 레시피 스텝 포함 데이터 조회 */
export async function getCookModeDataAction(cardId: string): Promise<CookModeData | null> {
  const supabase = createAdminClient();

  const { data: card, error: cardErr } = await supabase
    .from("fp_menu_card")
    .select("card_id, name, emoji, description")
    .eq("card_id", cardId)
    .single();

  if (cardErr || !card) return null;

  const { data: cardDishes } = await supabase
    .from("fp_card_dish")
    .select("dish_id, sort_order")
    .eq("card_id", cardId)
    .order("sort_order");

  if (!cardDishes || cardDishes.length === 0) {
    return {
      card: {
        cardId: card.card_id,
        name: card.name,
        emoji: card.emoji ?? undefined,
        description: card.description ?? undefined,
      },
      dishes: [],
    };
  }

  const dishIds = cardDishes.map((cd) => cd.dish_id);

  const [{ data: dishes }, { data: recipes }] = await Promise.all([
    supabase.from("fp_dish").select("dish_id, name").in("dish_id", dishIds),
    supabase
      .from("fp_dish_recipe")
      .select("*")
      .in("dish_id", dishIds)
      .eq("status", "approved")
      .order("created_at"),
  ]);

  const recipeIds = (recipes ?? []).map((r) => r.recipe_id);

  const { data: steps } =
    recipeIds.length > 0
      ? await supabase
          .from("fp_dish_recipe_step")
          .select("*")
          .in("recipe_id", recipeIds)
          .order("step_no")
      : { data: [] };

  const stepsByRecipe = (steps ?? []).reduce<Record<string, DishRecipeStep[]>>((acc, s) => {
    if (!acc[s.recipe_id]) acc[s.recipe_id] = [];
    acc[s.recipe_id].push({
      stepId: s.step_id,
      recipeId: s.recipe_id,
      stepNo: s.step_no,
      description: s.description,
      timerSeconds: s.timer_seconds ?? undefined,
      imageUrl: s.image_url ?? undefined,
    });
    return acc;
  }, {});

  const recipeByDish = (recipes ?? []).reduce<Record<string, DbRecipe>>((acc, r) => {
    if (!acc[r.dish_id]) acc[r.dish_id] = r;
    return acc;
  }, {});

  const dishMap = new Map((dishes ?? []).map((d) => [d.dish_id, d]));

  const result: CookModeData["dishes"] = cardDishes
    .map((cd) => {
      const dish = dishMap.get(cd.dish_id);
      if (!dish) return null;
      const rec = recipeByDish[cd.dish_id];
      return {
        dishId: cd.dish_id,
        name: dish.name,
        recipe: rec
          ? {
              recipeId: rec.recipe_id,
              dishId: rec.dish_id,
              title: rec.title,
              body: rec.body ?? undefined,
              status: rec.status as DishRecipe["status"],
              aiConsent: rec.ai_consent,
              steps: stepsByRecipe[rec.recipe_id] ?? [],
            }
          : undefined,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  return {
    card: {
      cardId: card.card_id,
      name: card.name,
      emoji: card.emoji ?? undefined,
      description: card.description ?? undefined,
    },
    dishes: result,
  };
}
