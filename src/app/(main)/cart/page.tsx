"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopHeader } from "@/components/layout/top-header";
import { FreeShippingBar } from "@/components/cart/free-shipping-bar";
import { CartGroup } from "@/components/cart/cart-group";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCartStore } from "@/lib/store";
import { MOCK_CARDS } from "@/data/mock-cards";

export default function CartPage() {
  const { items, setQty, remove } = useCartStore();
  // 선택 해제한 ID만 추적 → 새 항목은 자동으로 선택 상태
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());
  const selectedIds = useMemo(
    () => new Set(items.filter((i) => !deselectedIds.has(i.cartItemId)).map((i) => i.cartItemId)),
    [items, deselectedIds]
  );

  const allSelected = items.length > 0 && deselectedIds.size === 0;

  const toggleAll = () => {
    if (allSelected) {
      setDeselectedIds(new Set(items.map((i) => i.cartItemId)));
    } else {
      setDeselectedIds(new Set());
    }
  };

  const toggleSelect = (cartItemId: string) => {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cartItemId)) next.delete(cartItemId);
      else next.add(cartItemId);
      return next;
    });
  };

  // 카드별 그룹핑
  const groups = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const key = item.cardId ?? "memo";
      const group = map.get(key) ?? [];
      group.push(item);
      map.set(key, group);
    }
    return Array.from(map.entries()).map(([cardId, groupItems]) => {
      const card = MOCK_CARDS.find((c) => c.cardId === cardId);
      return {
        cardId,
        cardName: card?.name ?? "메모",
        cardTheme: card?.cardTheme,
        items: groupItems,
      };
    });
  }, [items]);

  // 선택된 항목만 소계
  const subtotal = useMemo(
    () =>
      items
        .filter((i) => selectedIds.has(i.cartItemId))
        .reduce((sum, i) => sum + i.price * i.qty, 0),
    [items, selectedIds]
  );

  const selectedCount = selectedIds.size;

  if (items.length === 0) {
    return (
      <>
        <TopHeader title="장바구니" />
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <ShoppingCart size={48} className="text-ink-200" />
          <p className="text-ink-400 text-sm">장바구니가 비어있어요</p>
          <Link href="/" className="btn-primary px-8">
            홈으로
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <TopHeader title={`장바구니 (${items.length})`} />
      <FreeShippingBar subtotal={subtotal} />

      {/* 전체 선택 바 */}
      <div className="border-line flex items-center gap-3 border-b bg-white px-4 py-2.5">
        <button
          type="button"
          onClick={toggleAll}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border-2 transition",
            allSelected ? "border-mocha-600 bg-mocha-600" : "border-ink-300 bg-white"
          )}
          aria-label="전체 선택"
        >
          {allSelected && <Check size={11} className="text-white" strokeWidth={3} />}
        </button>
        <span className="text-ink-600 text-sm">
          전체 선택 ({selectedCount}/{items.length})
        </span>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-28">
        {groups.map((group) => (
          <CartGroup
            key={group.cardId}
            cardId={group.cardId}
            cardName={group.cardName}
            cardTheme={group.cardTheme}
            items={group.items}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onQtyChange={setQty}
            onRemove={remove}
          />
        ))}
        <CartSummary subtotal={subtotal} />
      </div>

      {/* 결제하기 CTA */}
      <div className="border-line fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 px-4 py-3 backdrop-blur-sm">
        <Link
          href={{
            pathname: "/checkout",
            query: { ids: Array.from(selectedIds).join(",") },
          }}
          className={cn(
            "btn-primary flex w-full items-center justify-center",
            selectedCount === 0 && "pointer-events-none opacity-40"
          )}
          aria-disabled={selectedCount === 0}
        >
          {selectedCount === 0 ? "상품을 선택하세요" : `선택 상품 결제하기 (${selectedCount}개)`}
        </Link>
      </div>
    </>
  );
}
