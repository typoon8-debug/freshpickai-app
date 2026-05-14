"use client";

import { useState } from "react";
import Image from "next/image";
import { Chip } from "@/components/ui/chip";
import { WishlistButton } from "@/components/detail/wishlist-button";
import { IngredientDetailSheet } from "@/components/detail/ingredient-detail-sheet";
import type { Ingredient } from "@/lib/types";

interface Props {
  ingredient: Ingredient;
  showWishlist?: boolean;
}

const PROMO_BADGE: Record<string, string> = {
  SALE: "🏷️ 세일",
  DISCOUNT_PCT: "💰 할인",
  BUNDLE: "📦 묶음",
  TWO_PLUS_ONE: "🎁 N+1",
};

export function IngredientRow({ ingredient, showWishlist = false }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const live = ingredient.liveData;

  const displayPrice = live?.effectiveSalePrice ?? live?.salePrice ?? ingredient.price;
  const originalPrice =
    live?.effectiveSalePrice && live.salePrice ? live.salePrice : ingredient.priceWas;
  const showSalePrice = !!(displayPrice && originalPrice && displayPrice < originalPrice);
  const isUnmatched = !ingredient.refStoreItemId && !ingredient.liveData;

  return (
    <>
      <button
        type="button"
        className="hover:bg-muted/50 active:bg-muted flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left"
        onClick={() => setSheetOpen(true)}
      >
        {/* 썸네일 */}
        {live?.thumbnailSmall ? (
          <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border">
            <Image
              src={live.thumbnailSmall}
              alt={ingredient.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl">
            {ingredient.emoji ?? "🥗"}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* 이름 + 수량 */}
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{ingredient.name}</span>
            {ingredient.quantity && (
              <span className="text-muted-foreground shrink-0 text-xs">
                {ingredient.quantity}
                {ingredient.unit}
              </span>
            )}
            {live?.isInStock === false && (
              <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                품절
              </span>
            )}
            {isUnmatched && (
              <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                미연결
              </span>
            )}
          </div>

          {/* AI 광고 카피 */}
          {live?.aiAdCopy && (
            <p className="text-muted-foreground mt-0.5 truncate text-xs">{live.aiAdCopy}</p>
          )}

          {/* AI 태그 + 프로모 뱃지 */}
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {live?.aiTags?.slice(0, 3).map((tag) => (
              <Chip key={tag} size="sm" variant="outline" className="px-1.5 py-0 text-[10px]">
                {tag}
              </Chip>
            ))}
            {live?.promoType && (
              <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                {live.promoName ?? PROMO_BADGE[live.promoType]}
              </span>
            )}
          </div>
        </div>

        {/* 가격 */}
        <div className="shrink-0 text-right">
          {displayPrice != null && (
            <p className="text-sm font-semibold">{displayPrice.toLocaleString("ko-KR")}원</p>
          )}
          {showSalePrice && originalPrice != null && (
            <p className="text-muted-foreground text-xs line-through">
              {originalPrice.toLocaleString("ko-KR")}원
            </p>
          )}
        </div>
      </button>

      {/* 찜 버튼 (storeItemId 있을 때만) */}
      {showWishlist && live?.storeItemId && (
        <WishlistButton
          storeItemId={live.storeItemId}
          storeId={live.storeId ?? ""}
          className="shrink-0"
        />
      )}

      <IngredientDetailSheet
        ingredient={ingredient}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
