"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/lib/store";
import { qk } from "@/lib/query-keys";
import { SectionTabs } from "./section-tabs";
import { CategoryFilter } from "./category-filter";
import { AiTagFilter } from "./ai-tag-filter";
import { CardGrid } from "./card-grid";
import type { MenuCard } from "@/lib/types";

const CATEGORY_THEME_MAP: Record<string, string[]> = {
  meal: [
    "chef_table",
    "one_meal",
    "family_recipe",
    "drama_recipe",
    "honwell",
    "seasonal",
    "global_plate",
  ],
  snack: ["k_dessert", "snack_pack"],
  cinema: ["cinema_night"],
};

interface HomeBoardProps {
  initialCards: MenuCard[];
}

export function HomeBoard({ initialCards }: HomeBoardProps) {
  const [activeSection, setActiveSection] = useState("all");
  const [selectedAiTags, setSelectedAiTags] = useState<string[]>([]);
  const { homeFilter } = useUIStore();

  const filterKey = `${activeSection}:${homeFilter}:${selectedAiTags.sort().join(",")}`;
  const { data: allCards = initialCards, isFetching } = useQuery<MenuCard[]>({
    queryKey: qk.cards(filterKey),
    queryFn: async (): Promise<MenuCard[]> => {
      const params = new URLSearchParams({ official: "true" });
      if (activeSection !== "all") params.set("theme", activeSection);
      if (homeFilter !== "all") params.set("category", homeFilter);
      if (selectedAiTags.length > 0) params.set("aiTags", selectedAiTags.join(","));
      const res = await fetch(`/api/cards?${params.toString()}`);
      if (!res.ok) return initialCards;
      return res.json() as Promise<MenuCard[]>;
    },
    initialData: initialCards,
    enabled: true,
  });

  const filteredCards = useMemo(() => {
    let cards = allCards;
    if (activeSection !== "all") {
      cards = cards.filter((c) => c.cardTheme === activeSection);
    }
    if (homeFilter !== "all") {
      const allowed = CATEGORY_THEME_MAP[homeFilter] ?? [];
      cards = cards.filter((c) => allowed.includes(c.cardTheme));
    }
    return cards;
  }, [allCards, activeSection, homeFilter]);

  const top3Ids = useMemo(() => {
    return [...allCards]
      .filter((c) => c.isOfficial)
      .sort((a, b) => (b.healthScore ?? 0) - (a.healthScore ?? 0))
      .slice(0, 3)
      .map((c) => c.cardId);
  }, [allCards]);

  return (
    <>
      <SectionTabs activeSection={activeSection} onSectionChange={setActiveSection} />
      <CategoryFilter />
      <AiTagFilter selected={selectedAiTags} onChange={setSelectedAiTags} />
      <CardGrid cards={filteredCards} loading={isFetching} top3Ids={top3Ids} />
    </>
  );
}
