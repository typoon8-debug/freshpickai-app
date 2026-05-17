import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchByVector } from "@/lib/ai/vector-search";

export const maxDuration = 30;

export type SearchCardResult = {
  cardId: string;
  name: string;
  emoji?: string;
  coverImage?: string;
  category: string;
  healthScore?: number;
  priceMin?: number;
  priceMax?: number;
  similarity?: number;
};

export type SearchItemResult = {
  storeItemId: string;
  itemName: string;
  thumbnailSmall?: string;
  effectiveSalePrice?: number;
  aiTags?: string[];
  similarity?: number;
};

export type SearchResponse = {
  cards: SearchCardResult[];
  items: SearchItemResult[];
  total: number;
  elapsed_ms: number;
};

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const type = (searchParams.get("type") ?? "all") as "card" | "item" | "all";
  const limit = Math.min(Number(searchParams.get("limit") ?? "10"), 30);

  if (!q || q.length < 1) {
    return NextResponse.json({ error: "q 파라미터 필수 (최소 1자)" }, { status: 400 });
  }

  const start = Date.now();
  const cards: SearchCardResult[] = [];
  const items: SearchItemResult[] = [];

  const tasks: Promise<void>[] = [];

  // 카드 검색
  if (type === "card" || type === "all") {
    tasks.push(
      (async () => {
        const [trgmResult, vectorResult] = await Promise.allSettled([
          supabase
            .from("fp_menu_card")
            .select(
              "card_id, name, emoji, cover_image, category, health_score, price_min, price_max"
            )
            .or(`name.ilike.%${q}%, subtitle.ilike.%${q}%, description.ilike.%${q}%`)
            .eq("review_status", "approved")
            .limit(limit),
          searchByVector(q, { table: "dish", limit, threshold: 0.45 }),
        ]);

        const seen = new Set<string>();

        if (trgmResult.status === "fulfilled" && trgmResult.value.data) {
          for (const row of trgmResult.value.data) {
            if (!seen.has(row.card_id)) {
              seen.add(row.card_id);
              cards.push({
                cardId: row.card_id,
                name: row.name,
                emoji: row.emoji ?? undefined,
                coverImage: row.cover_image ?? undefined,
                category: row.category,
                healthScore: row.health_score ?? undefined,
                priceMin: row.price_min ?? undefined,
                priceMax: row.price_max ?? undefined,
              });
            }
          }
        }

        // pgvector 결과에서 dish_id → card 역방향 매핑
        if (vectorResult.status === "fulfilled" && vectorResult.value.length > 0) {
          const dishIds = vectorResult.value.map((r) => r.dishId).filter(Boolean) as string[];
          if (dishIds.length > 0) {
            const { data: cardDishes } = await supabase
              .from("fp_card_dish")
              .select(
                "card_id, fp_menu_card(card_id, name, emoji, cover_image, category, health_score, price_min, price_max)"
              )
              .in("dish_id", dishIds.slice(0, 10));

            type CardDishRow = {
              card_id: string;
              fp_menu_card: {
                card_id: string;
                name: string;
                emoji?: string;
                cover_image?: string;
                category: string;
                health_score?: number;
                price_min?: number;
                price_max?: number;
              } | null;
            };

            for (const cd of (cardDishes ?? []) as unknown as CardDishRow[]) {
              const c = cd.fp_menu_card;
              if (c && !seen.has(c.card_id)) {
                seen.add(c.card_id);
                const vec = vectorResult.value.find((r) => r.dishId);
                cards.push({
                  cardId: c.card_id,
                  name: c.name,
                  emoji: c.emoji ?? undefined,
                  coverImage: c.cover_image ?? undefined,
                  category: c.category,
                  healthScore: c.health_score ?? undefined,
                  priceMin: c.price_min ?? undefined,
                  priceMax: c.price_max ?? undefined,
                  similarity: vec?.similarity,
                });
              }
            }
          }
        }
      })()
    );
  }

  // 상품 검색 — mv_store_item_slim(GIN trgm 인덱스) 사용으로 ILIKE full scan 제거
  if (type === "item" || type === "all") {
    tasks.push(
      (async () => {
        const { data: storeRows } = await supabase
          .from("mv_store_item_slim")
          .select("store_item_id, item_name, item_thumbnail_small, effective_sale_price, ai_tags")
          .ilike("item_name", `%${q}%`)
          .eq("is_in_stock", true)
          .order("effective_sale_price", { ascending: true })
          .limit(limit);

        for (const row of storeRows ?? []) {
          items.push({
            storeItemId: row.store_item_id,
            itemName: row.item_name,
            thumbnailSmall: row.item_thumbnail_small ?? undefined,
            effectiveSalePrice: row.effective_sale_price ?? undefined,
            aiTags: (row.ai_tags as string[] | null) ?? undefined,
          });
        }
      })()
    );
  }

  await Promise.allSettled(tasks);

  return NextResponse.json({
    cards: cards.slice(0, limit),
    items: items.slice(0, limit),
    total: cards.length + items.length,
    elapsed_ms: Date.now() - start,
  } satisfies SearchResponse);
}
