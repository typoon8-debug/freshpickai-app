"use client";

import Link from "next/link";
import { CheckCircle2, ShoppingCart } from "lucide-react";

export type CartAddedItem = {
  name: string;
  qty: number;
  price: number;
  storeItemId?: string;
};

interface ActionableProductCardProps {
  items: CartAddedItem[];
}

export function ActionableProductCard({ items }: ActionableProductCardProps) {
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div
      className="border-mocha-200 bg-mocha-50 w-full rounded-xl border p-3"
      data-testid="add-to-cart-confirm"
    >
      {/* 헤더 */}
      <div className="mb-2 flex items-center gap-1.5">
        <CheckCircle2 size={14} className="text-mocha-600 flex-shrink-0" />
        <span className="text-mocha-700 text-xs font-semibold">장바구니에 담겼어요!</span>
      </div>

      {/* 상품 목록 */}
      <ul className="mb-3 space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-ink-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-mocha-400">•</span>
              <span className="font-medium">{item.name}</span>
              <span className="text-ink-400">x{item.qty}</span>
            </div>
            <span className="text-mocha-600 font-medium">
              {(item.price * item.qty).toLocaleString()}원
            </span>
          </li>
        ))}
      </ul>

      {/* 합계 */}
      {items.length > 1 && (
        <div className="border-mocha-200 mb-3 flex items-center justify-between border-t pt-2 text-xs">
          <span className="text-ink-500">합계</span>
          <span className="text-mocha-700 font-semibold">{totalPrice.toLocaleString()}원</span>
        </div>
      )}

      {/* 장바구니 보기 */}
      <Link
        href="/cart"
        className="bg-mocha-700 text-paper hover:bg-mocha-900 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition"
        data-testid="go-to-cart-btn"
      >
        <ShoppingCart size={13} />
        장바구니 보기
      </Link>
    </div>
  );
}
