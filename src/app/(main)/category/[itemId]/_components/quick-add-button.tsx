"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store";
import { addBundleAction } from "@/lib/actions/cart";

interface QuickAddButtonProps {
  storeItemId: string;
  itemName: string;
  price: number;
}

export function QuickAddButton({ storeItemId, itemName, price }: QuickAddButtonProps) {
  const addBundle = useCartStore((s) => s.addBundle);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);

    const cartItem = {
      cartItemId: `item-${storeItemId}-${Date.now()}`,
      userId: "",
      cardId: "",
      ingredientId: storeItemId,
      name: itemName,
      emoji: "🛒",
      qty: 1,
      price,
      unit: "개",
      refStoreItemId: storeItemId,
    };

    addBundle("", [cartItem]);
    await addBundleAction("", [cartItem]);
    toast.success(`${itemName}을(를) 담았습니다!`);
    setIsAdding(false);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isAdding}
      aria-label="장바구니 담기"
      className="bg-mocha-700 text-paper hover:bg-mocha-900 absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full shadow transition disabled:opacity-60"
    >
      <Plus size={16} strokeWidth={2.5} />
    </button>
  );
}
