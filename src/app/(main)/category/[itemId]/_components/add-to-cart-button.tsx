"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store";
import { addBundleAction } from "@/lib/actions/cart";
import type { CategoryItemDetail } from "@/lib/actions/category";

interface AddToCartButtonProps {
  item: CategoryItemDetail;
}

export function AddToCartButton({ item }: AddToCartButtonProps) {
  const addBundle = useCartStore((s) => s.addBundle);
  const [isAdding, setIsAdding] = useState(false);
  const [qty, setQty] = useState(1);

  const price = item.effectiveSalePrice ?? item.listPrice ?? 0;
  const isOutOfStock = item.isInStock === false;

  const handleAdd = async () => {
    if (isAdding || isOutOfStock) return;
    setIsAdding(true);

    const cartItem = {
      cartItemId: `item-${item.storeItemId}-${Date.now()}`,
      userId: "",
      cardId: "",
      ingredientId: item.storeItemId,
      name: item.itemName,
      emoji: "🛒",
      qty,
      price,
      unit: "개",
      refStoreItemId: item.storeItemId,
    };

    addBundle("", [cartItem]);

    const result = await addBundleAction("", [cartItem]);
    if (result.error && result.error !== "로그인이 필요합니다.") {
      toast.error("장바구니 저장 실패");
    } else {
      toast.success(`${item.itemName}을(를) 장바구니에 담았습니다!`);
    }

    setIsAdding(false);
  };

  return (
    <div className="flex items-center gap-3">
      {/* 수량 조절 */}
      <div className="border-line flex items-center rounded-xl border">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="text-ink-600 hover:bg-mocha-50 flex h-11 w-11 items-center justify-center text-lg font-bold transition"
        >
          −
        </button>
        <span className="text-ink-800 w-8 text-center text-sm font-semibold">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="text-ink-600 hover:bg-mocha-50 flex h-11 w-11 items-center justify-center text-lg font-bold transition"
        >
          +
        </button>
      </div>

      {/* 장바구니 담기 버튼 */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={isAdding || isOutOfStock}
        className="bg-mocha-700 text-paper hover:bg-mocha-900 flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition disabled:opacity-50"
      >
        <ShoppingCart size={16} />
        {isOutOfStock
          ? "품절"
          : isAdding
            ? "담는 중..."
            : `장바구니 담기 · ${(price * qty).toLocaleString()}원`}
      </button>
    </div>
  );
}
