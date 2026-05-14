"use client";

import { useEffect, useState, startTransition } from "react";
import { useCartStore, useSectionStore, useAuthStore } from "@/lib/store";
import { useWishlistStore } from "@/lib/store/wishlist-store";

/**
 * cart·sections·wishlist·auth 4개 persist 스토어가 모두 localStorage
 * hydration을 완료하면 true를 반환합니다.
 *
 * 목적: 홈 화면 모바일 깜빡임 방지.
 * 각 스토어가 독립적으로 setState를 발생시키는 대신,
 * 마지막 스토어가 완료되는 시점에 단 1회만 리렌더합니다.
 */
export function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    type S = {
      persist: {
        hasHydrated: () => boolean;
        onFinishHydration: (fn: () => void) => () => void;
      };
    };

    const stores: S[] = [useCartStore, useSectionStore, useWishlistStore, useAuthStore];
    const pending = stores.filter((s) => !s.persist.hasHydrated());

    // 모두 이미 완료된 경우 (페이지 전환 후 재방문 등)
    if (pending.length === 0) {
      startTransition(() => setHydrated(true));
      return;
    }

    // 아직 대기 중인 스토어 수만큼 카운트 후 마지막에 1회만 setState
    let remaining = pending.length;
    const onDone = () => {
      remaining -= 1;
      if (remaining <= 0) setHydrated(true);
    };

    const unsubs = pending.map((s) => s.persist.onFinishHydration(onDone));
    return () => unsubs.forEach((u) => u());
  }, []);

  return hydrated;
}
