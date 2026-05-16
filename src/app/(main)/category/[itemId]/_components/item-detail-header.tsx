"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, ShoppingCart } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useCartStore } from "@/lib/store";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ItemDetailHeader() {
  const router = useRouter();
  const mounted = useIsMounted();
  const cartCount = useCartStore((s) => s.items.length);

  return (
    <header className="border-line bg-paper sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex min-h-11 min-w-11 items-center justify-center"
        aria-label="뒤로가기"
      >
        <ChevronLeft size={22} className="text-ink-700" />
      </button>
      <span className="text-ink-800 flex-1 truncate text-sm font-semibold">상품상세</span>
      <Heart size={20} className="text-ink-400" />
      <Link
        href="/cart"
        className="relative flex min-h-11 min-w-11 items-center justify-center"
        aria-label="장바구니"
      >
        <ShoppingCart size={20} className="text-ink-400" />
        {mounted && cartCount > 0 && (
          <span className="bg-mocha-700 absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>
    </header>
  );
}
