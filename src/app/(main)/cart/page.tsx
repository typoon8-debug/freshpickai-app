"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TopHeader } from "@/components/layout/top-header";
import { FreeShippingBar } from "@/components/cart/free-shipping-bar";
import { CartGroup } from "@/components/cart/cart-group";
import { CartSummary } from "@/components/cart/cart-summary";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/lib/store";
import { MOCK_CARDS } from "@/data/mock-cards";
import {
  fetchCartItemsAction,
  removeItemAction,
  setQtyAction,
  clearCartAction,
} from "@/lib/actions/cart";

export default function CartPage() {
  const { items, setQty, remove, clear, syncFromDB } = useCartStore();

  // AI 도구가 DB에만 담은 항목을 Zustand에 동기화 (마운트마다 최신 DB 반영)
  useEffect(() => {
    fetchCartItemsAction().then(syncFromDB);
  }, [syncFromDB]);

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

  // DB + Zustand 동시 삭제
  const handleRemove = useCallback(
    async (cartItemId: string) => {
      remove(cartItemId); // 낙관적: Zustand 즉시 삭제
      const result = await removeItemAction(cartItemId);
      if (result.error) {
        toast.error("삭제에 실패했습니다. 다시 시도해주세요.");
        fetchCartItemsAction().then(syncFromDB); // 실패 시 DB 기준 복원
      }
    },
    [remove, syncFromDB]
  );

  // DB + Zustand 동시 수량 변경
  const handleSetQty = useCallback(
    async (cartItemId: string, qty: number) => {
      setQty(cartItemId, qty); // 낙관적: Zustand 즉시 변경
      const result = await setQtyAction(cartItemId, qty);
      if (result.error) {
        fetchCartItemsAction().then(syncFromDB); // 실패 시 DB 기준 복원
      }
    },
    [setQty, syncFromDB]
  );

  // 전체 삭제: DB + Zustand
  const handleClearAll = useCallback(async () => {
    clear(); // 낙관적: Zustand 즉시 비움
    const result = await clearCartAction();
    if (result.error) {
      toast.error("전체 삭제에 실패했습니다.");
      fetchCartItemsAction().then(syncFromDB);
    } else {
      toast.success("장바구니를 비웠어요");
    }
  }, [clear, syncFromDB]);

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

      {/* 전체 선택 + 전체 삭제 바 */}
      <div className="border-line flex items-center gap-3 border-b bg-white px-4 py-2.5">
        <Checkbox
          checked={allSelected}
          onCheckedChange={toggleAll}
          aria-label="전체 선택"
          className="data-checked:border-mocha-600 data-checked:bg-mocha-600 border-ink-400"
        />
        <span className="text-ink-600 flex-1 text-sm">
          전체 선택 ({selectedCount}/{items.length})
        </span>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-ink-400 hover:text-terracotta flex items-center gap-1 text-xs transition"
        >
          <Trash2 size={13} />
          전체 삭제
        </button>
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
            onQtyChange={handleSetQty}
            onRemove={handleRemove}
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
