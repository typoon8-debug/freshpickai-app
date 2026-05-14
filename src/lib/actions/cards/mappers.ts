import type { Database } from "@/lib/supabase/database.types";
import type { MenuCard, Dish, Ingredient, CardTheme } from "@/lib/types";

type DbCard = Database["public"]["Tables"]["fp_menu_card"]["Row"];
type DbDish = Database["public"]["Tables"]["fp_dish"]["Row"];
type DbIngredient = Database["public"]["Tables"]["fp_dish_ingredient"]["Row"];

export function mapCard(row: DbCard): MenuCard {
  return {
    cardId: row.card_id,
    sectionId: row.section_id ?? undefined,
    ownerUserId: row.owner_user_id ?? undefined,
    cardTheme: row.card_theme as CardTheme,
    name: row.name,
    subtitle: row.subtitle ?? undefined,
    taste: row.taste ?? undefined,
    category: row.category as MenuCard["category"],
    emoji: row.emoji ?? undefined,
    coverImage: row.cover_image ?? undefined,
    description: row.description ?? undefined,
    isOfficial: row.is_official,
    isNew: row.is_new,
    reviewStatus: row.review_status as MenuCard["reviewStatus"],
    healthScore: row.health_score ?? undefined,
    priceMin: row.price_min ?? undefined,
    priceMax: row.price_max ?? undefined,
  };
}

export function mapDish(row: DbDish): Dish {
  return {
    dishId: row.dish_id,
    name: row.name,
    description: row.description ?? undefined,
    healthScore: row.health_score ?? undefined,
    cookTime: row.cook_time ?? undefined,
    kcal: row.kcal ?? undefined,
    price: row.price ?? undefined,
    seasonStart: row.season_start ?? undefined,
    seasonEnd: row.season_end ?? undefined,
    dietTags: row.diet_tags ?? [],
    personaTags: row.persona_tags ?? [],
  };
}

export function mapIngredient(row: DbIngredient): Ingredient {
  return {
    ingredientId: row.ingredient_id,
    dishId: row.dish_id,
    name: row.name,
    quantity: row.quantity ?? undefined,
    unit: row.unit ?? undefined,
    price: row.price ?? undefined,
    priceWas: row.price_was ?? undefined,
    emoji: row.emoji ?? undefined,
    sortOrder: row.sort_order,
    refStoreItemId: row.ref_store_item_id ?? undefined,
  };
}
