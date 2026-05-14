"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { qk } from "@/lib/query-keys";
import { useCartStore } from "@/lib/store";
import { fetchCartItemsAction } from "@/lib/actions/cart";

/**
 * DB 기반 장바구니 훅
 * - fp_cart_item 테이블에서 아이템 조회
 * - useCartStore와 동기화하여 기존 UI 재사용
 * - revalidateTag('cart') 후 자동 갱신
 */
export function useCart() {
  const queryClient = useQueryClient();
  const { addBundle, clear, items: storeItems } = useCartStore();
  const seededRef = useRef(false);

  const query = useQuery({
    queryKey: qk.cart(),
    queryFn: fetchCartItemsAction,
    staleTime: 30_000,
  });

  // DB 데이터가 최초 로드되면 Zustand store를 DB 상태로 교체
  useEffect(() => {
    if (!query.data || seededRef.current) return;
    seededRef.current = true;

    clear();

    const byCard = new Map<string, typeof query.data>();
    for (const item of query.data) {
      const key = item.cardId ?? "__memo__";
      const group = byCard.get(key) ?? [];
      group.push(item);
      byCard.set(key, group);
    }

    for (const [cardKey, items] of byCard.entries()) {
      addBundle(cardKey === "__memo__" ? "" : cardKey, items);
    }
  }, [query.data, clear, addBundle]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.cart() });

  return {
    items: query.data ?? storeItems,
    isLoading: query.isLoading,
    error: query.error,
    invalidate,
  };
}
