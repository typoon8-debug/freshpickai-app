"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ItemSearchBar } from "./item-search-bar";
import { CategorySidebar } from "./category-sidebar";
import { MediumChips } from "./medium-chips";
import { ItemGrid } from "./item-grid";
import {
  getMediumCategoriesByLargeAction,
  getItemsByCategoryAction,
  searchItemsAction,
} from "@/lib/actions/category";
import type { LargeCategory, MediumCategory, CategoryItem, SortBy } from "@/lib/actions/category";

interface CategoryShellProps {
  initialLargeCategories: LargeCategory[];
  initialItems: CategoryItem[];
  initialTotal: number;
  storeId?: string;
}

export function CategoryShell({
  initialLargeCategories,
  initialItems,
  initialTotal,
  storeId,
}: CategoryShellProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [largeCode, setLargeCode] = useState<string | null>(null);
  const [mediumCode, setMediumCode] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("popular");
  const [mediumCategories, setMediumCategories] = useState<MediumCategory[]>([]);
  const [items, setItems] = useState<CategoryItem[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();

  // 대분류 선택 — 중분류 초기화 + 중분류 목록 로드를 이벤트 핸들러에서 처리
  const handleLargeSelect = useCallback((code: string | null) => {
    setLargeCode(code);
    setMediumCode(null);
    if (!code) {
      setMediumCategories([]);
    } else {
      getMediumCategoriesByLargeAction(code).then(setMediumCategories);
    }
  }, []);

  const loadItems = useCallback(() => {
    startTransition(async () => {
      if (searchQuery.trim()) {
        const result = await searchItemsAction({
          query: searchQuery,
          largeCode: largeCode ?? undefined,
          mediumCode: mediumCode ?? undefined,
          sortBy,
          storeId,
        });
        setItems(result.items);
        setTotal(result.total);
      } else {
        const result = await getItemsByCategoryAction({
          largeCode: largeCode ?? undefined,
          mediumCode: mediumCode ?? undefined,
          sortBy,
          storeId,
        });
        setItems(result.items);
        setTotal(result.total);
      }
    });
  }, [searchQuery, largeCode, mediumCode, sortBy, storeId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <div className="flex flex-col">
      {/* 검색 패널 */}
      <div className="border-line border-b px-4 py-3">
        <ItemSearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* 카테고리 패널 + 상품 그리드 */}
      <div className="flex flex-1 overflow-hidden">
        <CategorySidebar
          categories={initialLargeCategories}
          selected={largeCode}
          onSelect={handleLargeSelect}
        />

        <div className="flex flex-1 flex-col overflow-y-auto pb-20">
          <MediumChips
            categories={mediumCategories}
            selected={mediumCode}
            onSelect={setMediumCode}
          />
          <ItemGrid
            items={items}
            total={total}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchQuery={searchQuery || undefined}
            isLoading={isPending}
          />
        </div>
      </div>
    </div>
  );
}
