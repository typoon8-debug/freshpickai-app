"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, ShoppingCart } from "lucide-react";
import { removeWishlistAction } from "@/lib/actions/wishlist";
import { addBundleAction } from "@/lib/actions/cart";
import type { WishlistItem } from "@/lib/types";
import { Chip } from "@/components/ui/chip";

const PROMO_BADGE: Record<string, string> = {
  SALE: "🏷️ 세일",
  DISCOUNT_PCT: "💰 할인",
  BUNDLE: "📦 묶음",
  TWO_PLUS_ONE: "🎁 N+1",
};

interface WishlistClientProps {
  items: WishlistItem[];
}

export function WishlistClient({ items }: WishlistClientProps) {
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [addingCart, setAddingCart] = useState<Set<string>>(new Set());

  const handleRemove = async (item: WishlistItem) => {
    setRemoving((prev) => new Set(prev).add(item.storeItemId));
    await removeWishlistAction(item.storeItemId);
    // 낙관적 UI: 새로고침 없이 제거 (서버에서 revalidate)
    window.location.reload();
  };

  const handleAddToCart = async (item: WishlistItem) => {
    setAddingCart((prev) => new Set(prev).add(item.storeItemId));
    await addBundleAction("", [
      {
        cartItemId: "",
        name: item.itemName ?? item.storeItemId,
        qty: 1,
        price: item.effectiveSalePrice ?? item.salePrice ?? 0,
        refStoreItemId: item.storeItemId,
        thumbnailUrl: item.thumbnailSmall,
        aiAdCopy: item.aiAdCopy,
      },
    ]);
    setAddingCart((prev) => {
      const next = new Set(prev);
      next.delete(item.storeItemId);
      return next;
    });
  };

  return (
    <div className="divide-muted/50 flex flex-col divide-y px-4 pb-24">
      {items.map((item) => {
        const displayPrice = item.effectiveSalePrice ?? item.salePrice;
        const originalPrice = item.effectiveSalePrice ? item.salePrice : item.listPrice;
        const showStrikethrough =
          displayPrice != null && originalPrice != null && displayPrice < originalPrice;

        return (
          <div key={item.wishlistId} className="flex items-center gap-3 py-4">
            {/* 썸네일 */}
            {item.thumbnailSmall ? (
              <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border">
                <Image
                  src={item.thumbnailSmall}
                  alt={item.itemName ?? ""}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
                {item.isInStock === false && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-[10px] font-bold text-white">품절</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-3xl">
                🛒
              </div>
            )}

            {/* 정보 */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.itemName ?? item.storeItemId}</p>
              {item.aiAdCopy && (
                <p className="text-muted-foreground mt-0.5 truncate text-xs">{item.aiAdCopy}</p>
              )}

              {/* AI 태그 */}
              {item.aiTags && item.aiTags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.aiTags.slice(0, 3).map((tag) => (
                    <Chip key={tag} size="sm" variant="outline">
                      {tag}
                    </Chip>
                  ))}
                </div>
              )}

              {/* 가격 */}
              <div className="mt-1 flex items-baseline gap-2">
                {displayPrice != null && (
                  <span className="text-primary text-sm font-bold">
                    {displayPrice.toLocaleString("ko-KR")}원
                  </span>
                )}
                {showStrikethrough && originalPrice != null && (
                  <span className="text-muted-foreground text-xs line-through">
                    {originalPrice.toLocaleString("ko-KR")}원
                  </span>
                )}
                {item.promoType && (
                  <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                    {item.promoName ?? PROMO_BADGE[item.promoType]}
                  </span>
                )}
              </div>
            </div>

            {/* 액션 */}
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => handleAddToCart(item)}
                disabled={item.isInStock === false || addingCart.has(item.storeItemId)}
                className="bg-primary flex h-9 w-9 items-center justify-center rounded-full text-white disabled:opacity-40"
                aria-label="장바구니 담기"
              >
                <ShoppingCart size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(item)}
                disabled={removing.has(item.storeItemId)}
                className="bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-40"
                aria-label="찜 해제"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
