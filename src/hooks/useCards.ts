"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import type { MenuCard, CardTheme } from "@/lib/types";
import type { CardWithDishes } from "@/lib/actions/cards";

export type CardFilter = {
  theme?: CardTheme;
  category?: "meal" | "snack" | "cinema";
  officialOnly?: boolean;
};

async function fetchCards(filter?: CardFilter): Promise<MenuCard[]> {
  const params = new URLSearchParams();
  if (filter?.theme) params.set("theme", filter.theme);
  if (filter?.category) params.set("category", filter.category);
  if (filter?.officialOnly) params.set("official", "true");

  const res = await fetch(`/api/cards?${params.toString()}`);
  if (!res.ok) throw new Error("카드 목록 조회 실패");
  return res.json();
}

async function fetchCard(id: string): Promise<CardWithDishes> {
  const res = await fetch(`/api/cards/${id}`);
  if (!res.ok) throw new Error("카드 상세 조회 실패");
  return res.json();
}

async function fetchDailyPick(): Promise<MenuCard> {
  const res = await fetch("/api/daily-pick");
  if (!res.ok) throw new Error("데일리픽 조회 실패");
  return res.json();
}

export function useCards(filter?: CardFilter) {
  const filterKey = filter ? JSON.stringify(filter) : "all";
  return useQuery({
    queryKey: qk.cards(filterKey),
    queryFn: () => fetchCards(filter),
  });
}

export function useCard(id: string) {
  return useQuery({
    queryKey: qk.card(id),
    queryFn: () => fetchCard(id),
    enabled: !!id,
  });
}

export function useDailyPick() {
  return useQuery({
    queryKey: qk.daily(),
    queryFn: fetchDailyPick,
    staleTime: 60 * 60 * 1000, // 1시간 (데일리픽은 하루 단위)
  });
}
