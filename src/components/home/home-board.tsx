"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore, useSectionStore } from "@/lib/store";
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

// 섹션 AI 자동 채움 캐시 (24h, localStorage — 탭 재오픈 후에도 유지)
const AI_FILL_CACHE_PREFIX = "ai-fill:v2:";
const AI_FILL_TTL_MS = 24 * 60 * 60 * 1000;

function readAutoFillCache(sectionId: string): MenuCard[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${AI_FILL_CACHE_PREFIX}${sectionId}`);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw) as { data: MenuCard[]; timestamp: number };
    if (Date.now() - timestamp < AI_FILL_TTL_MS) return data;
  } catch {
    // 무시
  }
  return null;
}

function writeAutoFillCache(sectionId: string, cards: MenuCard[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${AI_FILL_CACHE_PREFIX}${sectionId}`,
      JSON.stringify({ data: cards, timestamp: Date.now() })
    );
  } catch {
    // 무시
  }
}

interface HomeBoardProps {
  initialCards: MenuCard[];
}

export function HomeBoard({ initialCards }: HomeBoardProps) {
  const [activeSection, setActiveSection] = useState("all");
  const [selectedAiTags, setSelectedAiTags] = useState<string[]>([]);
  // API fetch 결과 저장 (sectionId → cards)
  const [fetchedCardMap, setFetchedCardMap] = useState<Map<string, MenuCard[]>>(new Map());
  const [aiFetching, setAiFetching] = useState(false);
  const { homeFilter } = useUIStore();
  const { sections } = useSectionStore();
  const fetchedRef = useRef<Set<string>>(new Set());

  // 커스텀 섹션 선택 시 sectionId 추출
  const customSectionId = activeSection.startsWith("custom:")
    ? activeSection.replace("custom:", "")
    : null;

  // 해당 섹션의 aiAutoFill 여부 확인
  const activeSectionObj = customSectionId
    ? sections.find((s) => s.sectionId === customSectionId)
    : null;
  const isAiAutoFillSection = activeSectionObj?.aiAutoFill === true;

  // sessionStorage 캐시 (hydration 안전 — effect에서만 읽기)
  const [sessionCachedCards, setSessionCachedCards] = useState<MenuCard[] | null>(null);

  useEffect(() => {
    const value =
      customSectionId && isAiAutoFillSection ? readAutoFillCache(customSectionId) : null;
    Promise.resolve().then(() => setSessionCachedCards(value));
  }, [customSectionId, isAiAutoFillSection]);

  // 현재 섹션의 AI 카드 (세션 캐시 → fetch 결과 순서로 우선)
  const aiCards: MenuCard[] | null =
    sessionCachedCards ?? (customSectionId ? (fetchedCardMap.get(customSectionId) ?? null) : null);

  // AI 자동 채움 API fetch — setState는 모두 비동기 콜백(.then/.catch)에서만 호출
  useEffect(() => {
    if (!customSectionId || !isAiAutoFillSection) return;
    if (sessionCachedCards !== null) return; // 이미 캐시 있음
    if (fetchedCardMap.has(customSectionId)) return; // 이미 fetch 완료
    if (fetchedRef.current.has(customSectionId)) return; // 이미 fetch 중

    const sectionId = customSectionId;
    fetchedRef.current.add(sectionId);
    setAiFetching(true);

    fetch(`/api/sections/auto-fill?sectionId=${sectionId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json() as Promise<{ cards: MenuCard[] }>;
      })
      .then(({ cards }) => {
        const result = cards ?? [];
        setFetchedCardMap((prev) => new Map(prev).set(sectionId, result));
        writeAutoFillCache(sectionId, result);
      })
      .catch(() => {
        setFetchedCardMap((prev) => new Map(prev).set(sectionId, []));
      })
      .finally(() => {
        setAiFetching(false);
        fetchedRef.current.delete(sectionId);
      });
  }, [customSectionId, isAiAutoFillSection, sessionCachedCards, fetchedCardMap]);

  // 구조화된 필터 객체로 쿼리 키 생성 (theme·category·officialOnly·aiTags 개별 캐시 슬롯)
  const cardFilter = useMemo(
    () => ({
      theme:
        activeSection !== "all" && !activeSection.startsWith("custom:")
          ? (activeSection as import("@/lib/types").CardTheme)
          : undefined,
      category: homeFilter !== "all" ? (homeFilter as "meal" | "snack" | "cinema") : undefined,
      officialOnly: true as const,
      aiTags: selectedAiTags.length > 0 ? [...selectedAiTags].sort() : undefined,
    }),
    [activeSection, homeFilter, selectedAiTags]
  );
  // AI 태그 선택 시 initialData를 사용하지 않아야 로딩 스피너가 올바르게 표시됨
  const { data: allCards = selectedAiTags.length > 0 ? [] : initialCards, isFetching } = useQuery<
    MenuCard[]
  >({
    queryKey: qk.cards(cardFilter),
    queryFn: async (): Promise<MenuCard[]> => {
      const params = new URLSearchParams({ official: "true" });
      if (activeSection !== "all" && !activeSection.startsWith("custom:"))
        params.set("theme", activeSection);
      if (homeFilter !== "all") params.set("category", homeFilter);
      if (selectedAiTags.length > 0) params.set("aiTags", selectedAiTags.join(","));
      const res = await fetch(`/api/cards?${params.toString()}`);
      if (!res.ok) return initialCards;
      return res.json() as Promise<MenuCard[]>;
    },
    initialData: selectedAiTags.length === 0 ? initialCards : undefined,
    enabled: !isAiAutoFillSection, // AI 자동 채움 섹션은 별도 fetch
  });

  const filteredCards = useMemo(() => {
    // AI 자동 채움 섹션: AI 결과 사용
    if (isAiAutoFillSection && aiCards !== null) {
      return aiCards;
    }

    let cards = allCards;
    if (activeSection !== "all" && !activeSection.startsWith("custom:")) {
      cards = cards.filter((c) => c.cardTheme === activeSection);
    }
    if (homeFilter !== "all") {
      const allowed = CATEGORY_THEME_MAP[homeFilter] ?? [];
      cards = cards.filter((c) => allowed.includes(c.cardTheme));
    }
    return cards;
  }, [allCards, activeSection, homeFilter, isAiAutoFillSection, aiCards]);

  const top3Ids = useMemo(() => {
    return [...allCards]
      .filter((c) => c.isOfficial)
      .sort((a, b) => (b.healthScore ?? 0) - (a.healthScore ?? 0))
      .slice(0, 3)
      .map((c) => c.cardId);
  }, [allCards]);

  const loading = isAiAutoFillSection ? aiFetching : isFetching;

  return (
    <>
      <SectionTabs activeSection={activeSection} onSectionChange={setActiveSection} />
      <CategoryFilter />
      <AiTagFilter selected={selectedAiTags} onChange={setSelectedAiTags} />

      {isAiAutoFillSection && !aiFetching && aiCards !== null && aiCards.length === 0 && (
        <p className="text-ink-400 py-8 text-center text-sm" data-testid="ai-fill-empty">
          AI가 카드를 준비 중입니다. 잠시 후 다시 확인해보세요.
        </p>
      )}

      <CardGrid
        cards={filteredCards}
        loading={loading}
        top3Ids={top3Ids}
        data-testid="home-card-grid"
      />
    </>
  );
}
