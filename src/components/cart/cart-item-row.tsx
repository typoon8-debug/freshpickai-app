"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/lib/types";

interface CartItemRowProps {
  item: CartItem;
  checked: boolean;
  onToggleSelect: (cartItemId: string) => void;
  onQtyChange: (cartItemId: string, qty: number) => void;
  onRemove: (cartItemId: string) => void;
}

const PROMO_BADGE: Record<string, string> = {
  SALE: "🏷️ 세일",
  DISCOUNT_PCT: "💰 할인",
  BUNDLE: "📦 묶음",
  TWO_PLUS_ONE: "🎁 N+1",
};

export function CartItemRow({
  item,
  checked,
  onToggleSelect,
  onQtyChange,
  onRemove,
}: CartItemRowProps) {
  const displayPrice = item.effectiveSalePrice ?? item.price;
  const originalPrice =
    item.effectiveSalePrice && item.price < item.effectiveSalePrice ? undefined : item.price;
  const showStrikethrough =
    item.effectiveSalePrice != null &&
    item.listPrice != null &&
    item.effectiveSalePrice < item.listPrice;

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 transition-opacity",
        !checked && "opacity-55"
      )}
    >
      {/* 품절 오버레이 */}
      {item.isInStock === false && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/30">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-red-600">
            품절
          </span>
        </div>
      )}

      {/* 체크박스 */}
      <button
        type="button"
        onClick={() => onToggleSelect(item.cartItemId)}
        aria-label={checked ? "선택 해제" : "선택"}
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition",
          checked ? "border-mocha-600 bg-mocha-600" : "border-ink-300 bg-white"
        )}
      >
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </button>

      {/* 썸네일 또는 이모지 */}
      {item.thumbnailUrl ? (
        <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border">
          <Image
            src={item.thumbnailUrl}
            alt={item.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="bg-mocha-50 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xl">
          {item.emoji ?? "🛒"}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-ink-900 truncate text-sm font-medium">{item.name}</p>

        {/* AI 광고 카피 */}
        {item.aiAdCopy && <p className="text-muted-foreground truncate text-xs">{item.aiAdCopy}</p>}

        {/* 프로모 뱃지 */}
        {item.promoType && (
          <span className="bg-primary/10 text-primary mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium">
            {item.promoName ?? PROMO_BADGE[item.promoType]}
          </span>
        )}

        {/* 가격 */}
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <p className="text-mocha-600 text-sm font-semibold">
            {formatPrice(displayPrice * item.qty)}
          </p>
          {showStrikethrough && item.listPrice != null && (
            <p className="text-muted-foreground text-xs line-through">
              {formatPrice(item.listPrice * item.qty)}
            </p>
          )}
        </div>
      </div>

      {/* 수량 조정 */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (item.qty <= 1) onRemove(item.cartItemId);
            else onQtyChange(item.cartItemId, item.qty - 1);
          }}
          className="bg-mocha-50 text-ink-700 flex h-7 w-7 items-center justify-center rounded-lg"
        >
          <Minus size={12} />
        </button>
        <span className="text-ink-900 w-5 text-center text-sm font-semibold">{item.qty}</span>
        <button
          type="button"
          onClick={() => onQtyChange(item.cartItemId, item.qty + 1)}
          className="bg-mocha-50 text-ink-700 flex h-7 w-7 items-center justify-center rounded-lg"
        >
          <Plus size={12} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.cartItemId)}
        className="text-ink-300 hover:text-terracotta ml-1 flex h-8 w-8 items-center justify-center"
        aria-label="삭제"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
