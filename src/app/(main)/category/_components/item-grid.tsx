"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { CategoryEmpty } from "./category-empty";
import type { CategoryItem, SortBy } from "@/lib/actions/category";

interface ItemGridProps {
  items: CategoryItem[];
  total: number;
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
  searchQuery?: string;
  isLoading?: boolean;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "popular", label: "인기순" },
  { value: "price_asc", label: "낮은가격" },
  { value: "price_desc", label: "높은가격" },
  { value: "discount", label: "할인율" },
];

function ItemCard({ item }: { item: CategoryItem }) {
  const router = useRouter();
  const toggle = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.ids.has(item.storeItemId));

  const price = item.effectiveSalePrice ?? item.listPrice;

  return (
    <div
      className="border-line shadow-card flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md"
      onClick={() => router.push(`/category/${item.storeItemId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/category/${item.storeItemId}`)}
    >
      {/* 썸네일 */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {item.thumbnailSmall ? (
          <Image
            src={item.thumbnailSmall}
            alt={item.itemName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 45vw, 200px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">🛒</div>
        )}

        {/* 할인 배지 */}
        {(item.discountPct ?? 0) > 0 && (
          <span className="absolute top-2 left-2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {Math.round(item.discountPct!)}%
          </span>
        )}

        {/* 재고 없음 오버레이 */}
        {item.isInStock === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded bg-black/60 px-2 py-1 text-xs text-white">품절</span>
          </div>
        )}

        {/* 찜 버튼 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle(item.storeItemId);
          }}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80"
          aria-label={isWished ? "찜 해제" : "찜하기"}
        >
          <Heart
            size={14}
            className={cn(isWished ? "fill-terracotta text-terracotta" : "text-ink-400")}
          />
        </button>
      </div>

      {/* 상품 정보 */}
      <div className="flex flex-col gap-0.5 p-2.5">
        <p className="text-ink-800 line-clamp-2 text-xs leading-tight">{item.itemName}</p>
        {price != null ? (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-ink-900 text-sm font-bold">{price.toLocaleString()}원</span>
            {item.listPrice &&
              item.effectiveSalePrice &&
              item.listPrice > item.effectiveSalePrice && (
                <span className="text-ink-300 text-[10px] line-through">
                  {item.listPrice.toLocaleString()}원
                </span>
              )}
          </div>
        ) : (
          <span className="text-ink-400 mt-1 text-xs">가격 미정</span>
        )}
      </div>
    </div>
  );
}

export function ItemGrid({
  items,
  total,
  sortBy,
  onSortChange,
  searchQuery,
  isLoading,
}: ItemGridProps) {
  const isSearch = !!searchQuery;

  return (
    <div className="flex flex-col gap-3">
      {/* 상단 바: 결과 수 + 정렬 */}
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="text-ink-500 text-xs">
          {isSearch ? `검색 결과 ${total.toLocaleString()}개` : `상품 ${total.toLocaleString()}개`}
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
          className="border-line text-ink-700 rounded-lg border bg-white px-2 py-1 text-xs"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* 로딩 스켈레톤 */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 px-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border-line rounded-xl border">
              <div className="bg-ink-100 aspect-square w-full animate-pulse rounded-t-xl" />
              <div className="space-y-1.5 p-2.5">
                <div className="bg-ink-100 h-3 w-full animate-pulse rounded" />
                <div className="bg-ink-100 h-3 w-2/3 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && items.length === 0 && (
        <CategoryEmpty isSearch={isSearch} query={searchQuery} />
      )}

      {/* 그리드 */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 px-3 pb-6">
          {items.map((item) => (
            <ItemCard key={item.storeItemId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
