"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MenuCard } from "@/lib/types";

export type AgeGroup = "ELEMENTARY" | "TEEN";

const AGE_TAGS: Record<AgeGroup, string[]> = {
  ELEMENTARY: ["간식", "디저트", "어린이", "무알콜"],
  TEEN: ["트렌디", "글로벌", "홈시네마"],
};

export function useKidsFilter(ageGroup: AgeGroup) {
  const [cards, setCards] = useState<MenuCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function fetchFilteredCards() {
      setLoading(true);
      try {
        const { data: rpcResult } = await supabase.rpc("fp_cards_by_ai_tags", {
          p_tags: AGE_TAGS[ageGroup],
        });

        if (cancelled) return;

        const ids = (rpcResult ?? []).map((r: { card_id: string }) => r.card_id);

        if (ids.length === 0) {
          setCards([]);
          return;
        }

        const { data: cardData } = await supabase
          .from("fp_menu_card")
          .select(
            "card_id, name, subtitle, emoji, category, card_theme, cover_image, health_score, price_min, price_max, is_official, is_new, review_status"
          )
          .in("card_id", ids)
          .limit(20);

        if (cancelled) return;

        setCards(
          (cardData ?? []).map((c) => ({
            cardId: c.card_id,
            name: c.name,
            subtitle: c.subtitle ?? undefined,
            emoji: c.emoji ?? undefined,
            category: c.category as MenuCard["category"],
            cardTheme: c.card_theme as MenuCard["cardTheme"],
            coverImage: c.cover_image ?? undefined,
            healthScore: c.health_score ?? undefined,
            priceMin: c.price_min ?? undefined,
            priceMax: c.price_max ?? undefined,
            isOfficial: c.is_official,
            isNew: c.is_new,
            reviewStatus: c.review_status as MenuCard["reviewStatus"],
          }))
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFilteredCards();
    return () => {
      cancelled = true;
    };
  }, [ageGroup]);

  return { cards, loading };
}
