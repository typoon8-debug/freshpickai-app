"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store";
import { addBundleAction } from "@/lib/actions/cart";
import type { CategoryItemDetail } from "@/lib/actions/category";

interface ItemDetailBottomBarProps {
  item: Pick<
    CategoryItemDetail,
    "storeItemId" | "itemName" | "effectiveSalePrice" | "listPrice" | "isInStock"
  >;
}

export function ItemDetailBottomBar({ item }: ItemDetailBottomBarProps) {
  const router = useRouter();
  const addBundle = useCartStore((s) => s.addBundle);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const price = item.effectiveSalePrice ?? item.listPrice ?? 0;
  const isOutOfStock = item.isInStock === false;

  const buildCartItem = () => ({
    cartItemId: `item-${item.storeItemId}-${Date.now()}`,
    userId: "",
    cardId: "",
    ingredientId: item.storeItemId,
    name: item.itemName,
    emoji: "🛒",
    qty: 1,
    price,
    unit: "개",
    refStoreItemId: item.storeItemId,
  });

  const handleAddToCart = async () => {
    if (isAdding || isOutOfStock) return;
    setIsAdding(true);
    const cartItem = buildCartItem();
    addBundle("", [cartItem]);
    const result = await addBundleAction("", [cartItem]);
    if (result.error && result.error !== "로그인이 필요합니다.") {
      toast.error("장바구니 저장 실패");
    } else {
      toast.success(`${item.itemName}을(를) 장바구니에 담았습니다!`);
    }
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (isBuying || isOutOfStock) return;
    setIsBuying(true);
    const cartItem = buildCartItem();
    addBundle("", [cartItem]);
    await addBundleAction("", [cartItem]);
    setIsBuying(false);
    router.push("/cart");
  };

  if (isOutOfStock) {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          disabled
          className="bg-ink-200 text-ink-500 flex flex-1 items-center justify-center rounded-xl py-3.5 text-sm font-bold"
        >
          품절
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding}
        className="bg-mocha-700 text-paper hover:bg-mocha-900 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-bold transition disabled:opacity-60"
      >
        <ShoppingCart size={15} />
        {isAdding ? "담는 중..." : "장바구니 담기"}
      </button>
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={isBuying}
        className="border-mocha-700 bg-paper text-mocha-700 hover:bg-mocha-50 flex flex-1 items-center justify-center rounded-xl border py-3.5 text-sm font-bold transition disabled:opacity-60"
      >
        {isBuying ? "이동 중..." : "바로 구매"}
      </button>
    </div>
  );
}
