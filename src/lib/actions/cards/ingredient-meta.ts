"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { IngredientMeta } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type DbMeta = Database["public"]["Tables"]["fp_ingredient_meta"]["Row"];

function mapMeta(row: DbMeta): IngredientMeta {
  return {
    metaId: row.meta_id,
    name: row.name,
    prepTips: row.prep_tips ?? undefined,
    measurementHints: row.measurement_hints ?? undefined,
    substitutes: row.substitutes,
  };
}

export async function getIngredientMeta(name: string): Promise<IngredientMeta | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("fp_ingredient_meta")
    .select("*")
    .eq("name", name)
    .single();
  if (error || !data) return null;
  return mapMeta(data);
}

export async function getIngredientMetaBatch(names: string[]): Promise<IngredientMeta[]> {
  if (names.length === 0) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("fp_ingredient_meta").select("*").in("name", names);
  if (error || !data) return [];
  return data.map(mapMeta);
}
