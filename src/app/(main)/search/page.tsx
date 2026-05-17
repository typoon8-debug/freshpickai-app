"use client";

import { useState, useEffect, useCallback, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { TopHeader } from "@/components/layout/top-header";
import { SearchAutoComplete } from "@/components/search/SearchAutoComplete";
import { FilterPanel } from "@/components/search/FilterPanel";
import { cn } from "@/lib/utils";
import type { SearchCardResult, SearchItemResult } from "@/app/api/search/route";

type Tab = "all" | "card" | "item";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") ?? "";
  const [tab, setTab] = useState<Tab>("all");
  const [cards, setCards] = useState<SearchCardResult[]>([]);
  const [items, setItems] = useState<SearchItemResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [, startTransition] = useTransition();

  const categories = searchParams.getAll("cat");
  const healthTags = searchParams.getAll("tag");
  const cookMax = searchParams.get("cookMax");

  const fetchResults = useCallback(
    async (q: string) => {
      if (!q.trim()) return;
      setLoading(true);
      setSearched(true);
      try {
        const params = new URLSearchParams({ q, type: "all", limit: "20" });
        categories.forEach((c) => params.append("cat", c));
        healthTags.forEach((t) => params.append("tag", t));
        if (cookMax) params.set("cookMax", cookMax);

        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        setCards(data.cards ?? []);
        setItems(data.items ?? []);
      } finally {
        setLoading(false);
      }
    },
    [categories, healthTags, cookMax]
  );

  useEffect(() => {
    if (!initialQ) return;
    startTransition(() => {
      void fetchResults(initialQ);
    });
  }, [initialQ, fetchResults, startTransition]);

  const handleSearch = (q: string) => {
    router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
  };

  const displayCards = cards.filter((c) => {
    if (categories.length > 0 && !categories.includes(c.category)) return false;
    return true;
  });

  const displayItems = items;

  const tabCards = tab === "all" || tab === "card" ? displayCards : [];
  const tabItems = tab === "all" || tab === "item" ? displayItems : [];

  const isEmpty = searched && !loading && tabCards.length === 0 && tabItems.length === 0;

  return (
    <div className="min-h-screen pb-24">
      <TopHeader title="검색" />

      <div className="sticky top-0 z-30 bg-white px-4 pt-3 pb-2 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-ink-600 hover:text-ink-900 p-1"
            aria-label="뒤로"
          >
            <ArrowLeft size={20} />
          </button>
          <SearchAutoComplete
            placeholder="카드, 재료, 메뉴 검색..."
            onSearch={handleSearch}
            className="flex-1"
          />
        </div>

        {/* 탭 */}
        <div className="mt-2 flex gap-0 border-b border-gray-100">
          {(["all", "card", "item"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition",
                tab === t ? "border-mocha-700 text-mocha-700 border-b-2" : "text-ink-400"
              )}
            >
              {t === "all"
                ? "전체"
                : t === "card"
                  ? `카드 (${displayCards.length})`
                  : `상품 (${displayItems.length})`}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowFilter((v) => !v)}
            className={cn(
              "ml-auto px-3 py-2 text-sm font-medium transition",
              showFilter ? "text-mocha-700" : "text-ink-400"
            )}
            aria-expanded={showFilter}
          >
            필터 {showFilter ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="border-b px-4 py-3">
          <Suspense>
            <FilterPanel />
          </Suspense>
        </div>
      )}

      <div className="px-4 pt-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="border-mocha-300 border-t-mocha-700 h-6 w-6 animate-spin rounded-full border-2" />
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <SearchX size={40} className="text-ink-300" />
            <p className="text-ink-500 text-sm">
              &quot;{initialQ}&quot;에 대한 검색 결과가 없습니다.
            </p>
            <p className="text-ink-400 text-xs">다른 검색어나 필터를 시도해 보세요.</p>
          </div>
        )}

        {!loading && !isEmpty && (
          <div className="flex flex-col gap-6">
            {/* 카드 섹션 */}
            {tabCards.length > 0 && (
              <section>
                {tab === "all" && (
                  <p className="text-ink-600 mb-2 text-xs font-semibold">
                    카드 ({tabCards.length})
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {tabCards.map((c) => (
                    <Link
                      key={c.cardId}
                      href={`/cards/${c.cardId}`}
                      className="border-line overflow-hidden rounded-xl border bg-white shadow-sm transition active:scale-95"
                      data-testid="search-card-result"
                    >
                      <div className="relative aspect-[4/3] bg-gray-100">
                        {c.coverImage ? (
                          <Image
                            src={c.coverImage}
                            alt={c.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, 200px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl">
                            {c.emoji ?? "🍽️"}
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-ink-800 line-clamp-1 text-sm font-semibold">{c.name}</p>
                        {c.priceMin != null && (
                          <p className="text-mocha-600 mt-0.5 text-xs">
                            {c.priceMin.toLocaleString()}원~
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 상품 섹션 */}
            {tabItems.length > 0 && (
              <section>
                {tab === "all" && (
                  <p className="text-ink-600 mb-2 text-xs font-semibold">
                    상품 ({tabItems.length})
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  {tabItems.map((item) => (
                    <Link
                      key={item.storeItemId}
                      href={`/category/${item.storeItemId}`}
                      className="border-line flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 shadow-sm transition active:scale-95"
                      data-testid="search-item-result"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {item.thumbnailSmall ? (
                          <Image
                            src={item.thumbnailSmall}
                            alt={item.itemName}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-lg">🛒</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-ink-800 line-clamp-1 text-sm font-medium">
                          {item.itemName}
                        </p>
                        {item.effectiveSalePrice != null && (
                          <p className="text-mocha-600 text-xs">
                            {item.effectiveSalePrice.toLocaleString()}원
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
