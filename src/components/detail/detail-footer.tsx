"use client";

import { useState } from "react";
import { ShoppingCart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Ingredient } from "@/lib/types";
import { useCartStore } from "@/lib/store";
import { addBundleAction } from "@/lib/actions/cart";
import { formatPrice } from "@/lib/utils";

interface DetailFooterProps {
  cardId: string;
  ingredients: Ingredient[];
}

export function DetailFooter({ cardId, ingredients }: DetailFooterProps) {
  const addBundle = useCartStore((s) => s.addBundle);
  const [isAdding, setIsAdding] = useState(false);

  const totalPrice = ingredients.reduce((sum, ing) => sum + (ing.price ?? 0), 0);

  const handleAddAll = async () => {
    if (isAdding) return;
    setIsAdding(true);

    const cartItems = ingredients.map((ing) => ({
      cartItemId: `${cardId}-${ing.ingredientId}`,
      userId: "",
      cardId,
      ingredientId: ing.ingredientId,
      name: ing.name,
      emoji: ing.emoji ?? "🛒",
      qty: 1,
      price: ing.price ?? 0,
      unit: ing.unit ?? "개",
      refStoreItemId: ing.refStoreItemId,
    }));

    // 즉시 로컬 store 업데이트 (낙관적 UI)
    addBundle(cardId, cartItems);

    // DB 영속화 (백그라운드)
    const result = await addBundleAction(cardId, cartItems);
    if (result.error && result.error !== "로그인이 필요합니다.") {
      toast.error(result.error);
    } else {
      if (result.excludedNames?.length) {
        const names = result.excludedNames.slice(0, 2).join(", ");
        const extra =
          result.excludedNames.length > 2 ? ` 외 ${result.excludedNames.length - 2}개` : "";
        toast.warning(`${names}${extra} 품절로 제외되었습니다.`);
      }
      if (!result.error) {
        toast.success("장바구니에 담았습니다!");
      }
    }

    setIsAdding(false);
  };

  return (
    <div className="border-line fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex gap-3">
        {/* AI 변형 버튼 */}
        <Link
          href="/chat"
          className="rounded-pill border-mocha-300 text-mocha-700 hover:bg-mocha-50 flex h-13 flex-1 items-center justify-center gap-2 border text-sm font-semibold transition"
        >
          <MessageSquare size={16} />
          AI 변형하기
        </Link>

        {/* 모두 담기 버튼 */}
        <button
          type="button"
          onClick={handleAddAll}
          disabled={isAdding}
          className="rounded-pill bg-mocha-700 text-paper hover:bg-mocha-900 flex h-13 flex-[2] items-center justify-center gap-2 text-sm font-semibold shadow-[var(--shadow-cta)] transition disabled:opacity-70"
        >
          <ShoppingCart size={16} />
          {isAdding
            ? "담는 중..."
            : totalPrice > 0
              ? `${formatPrice(totalPrice)} 모두 담기`
              : "모두 담기"}
        </button>
      </div>
    </div>
  );
}
