"use client";

import { useEffect, useState, startTransition } from "react";
import { useCartStore, useSectionStore, useAuthStore } from "@/lib/store";
import { useWishlistStore } from "@/lib/store/wishlist-store";

/**
 * cart·sections·wishlist·auth 4개 persist 스토어가 모두 localStorage
 * hydration을 완료하면 true를 반환합니다.
 *
 * Grace period(150ms) 패턴:
 * localStorage hydration은 보통 50ms 내에 완료되므로, 150ms 동안은
 * hydration 완료 여부와 관계없이 true를 반환합니다.
 * → 빠른 기기에서 스켈레톤이 화면에 그려질 기회 자체가 없어짐
 * → 느린 기기에서는 150ms 후 스켈레톤 표시 (그레이스풀 폴백)
 */
export function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  // 150ms 유예기간: 이 기간 동안은 콘텐츠를 바로 표시
  const [gracePeriod, setGracePeriod] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setGracePeriod(false), 150);
    return () => clearTimeout(timer);
  }, []);

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

  return hydrated || gracePeriod;
}
