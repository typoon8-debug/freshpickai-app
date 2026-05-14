import { createClient } from "@/lib/supabase/server";
import { embedText, embeddingToSql } from "./embedding";

export type VectorSearchTable = "dish" | "recipe" | "store_item";

export interface VectorSearchOptions {
  table: VectorSearchTable;
  limit?: number;
  threshold?: number;
  filters?: {
    dietTags?: string[];
    personaTags?: string[];
    aiTags?: string[];
  };
}

export interface VectorSearchResult {
  id: string;
  name: string;
  similarity: number;
  searchSource: "vector" | "trgm" | "ilike";
  dishId?: string;
}

async function generateEmbeddingOrNull(query: string): Promise<string | null> {
  try {
    const embedding = await embedText(query);
    return embeddingToSql(embedding);
  } catch {
    return null;
  }
}

export async function searchByVector(
  query: string,
  options: VectorSearchOptions
): Promise<VectorSearchResult[]> {
  const supabase = await createClient();
  const { limit = 10, threshold = 0.5, filters } = options;

  const embeddingStr = await generateEmbeddingOrNull(query);

  if (options.table === "dish") {
    const { data, error } = await supabase.rpc("fp_vector_search_dish", {
      query_text: query,
      query_embedding: embeddingStr,
      similarity_threshold: threshold,
      match_count: limit,
      filter_diet_tags: filters?.dietTags ?? null,
      filter_persona_tags: filters?.personaTags ?? null,
    });
    if (error) throw new Error(`dish 검색 오류: ${error.message}`);

    return (data ?? []).map(
      (d: { dish_id: string; name: string; similarity: number; search_source: string }) => ({
        id: d.dish_id,
        name: d.name,
        similarity: d.similarity,
        searchSource: d.search_source as "vector" | "trgm" | "ilike",
      })
    );
  }

  if (options.table === "recipe") {
    const { data, error } = await supabase.rpc("fp_vector_search_recipe", {
      query_text: query,
      query_embedding: embeddingStr,
      similarity_threshold: threshold,
      match_count: limit,
    });
    if (error) throw new Error(`recipe 검색 오류: ${error.message}`);

    return (data ?? []).map(
      (r: {
        recipe_id: string;
        title: string;
        dish_id: string;
        similarity: number;
        search_source: string;
      }) => ({
        id: r.recipe_id,
        name: r.title,
        similarity: r.similarity,
        searchSource: r.search_source as "vector" | "trgm" | "ilike",
        dishId: r.dish_id,
      })
    );
  }

  // store_item
  const { data, error } = await supabase.rpc("fp_vector_search_store_item", {
    query_text: query,
    query_embedding: embeddingStr,
    similarity_threshold: threshold,
    match_count: limit,
    filter_ai_tags: filters?.aiTags ?? null,
  });
  if (error) throw new Error(`store_item 검색 오류: ${error.message}`);

  return (data ?? []).map(
    (s: {
      store_item_id: string;
      item_name: string;
      similarity: number;
      search_source: string;
    }) => ({
      id: s.store_item_id,
      name: s.item_name,
      similarity: s.similarity,
      searchSource: s.search_source as "vector" | "trgm" | "ilike",
    })
  );
}
