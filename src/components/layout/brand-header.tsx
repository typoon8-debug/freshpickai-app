"use client";

import Link from "next/link";
import { Heart, ShoppingCart, User } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useCartStore } from "@/lib/store";
import { useWishlistStore } from "@/lib/store/wishlist-store";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function BrandHeader() {
  const mounted = useIsMounted();
  const cartCount = useCartStore((s) => s.items.length);
  const wishCount = useWishlistStore((s) => s.ids.size);

  return (
    <header className="bg-paper/90 border-line sticky top-0 z-10 flex h-14 items-center border-b px-4 backdrop-blur-sm">
      <span className="font-display text-mocha-700 flex-1 text-lg">FreshPick AI</span>

      <div className="flex items-center">
        <Link
          href="/wishlist"
          className="relative flex min-h-11 min-w-11 items-center justify-center"
          aria-label="찜 목록"
        >
          <Heart className="text-ink-500 h-5 w-5" />
          {mounted && wishCount > 0 && (
            <span className="bg-terracotta absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
              {wishCount > 99 ? "99+" : wishCount}
            </span>
          )}
        </Link>

        <Link
          href="/cart"
          className="relative flex min-h-11 min-w-11 items-center justify-center"
          aria-label="장바구니"
        >
          <ShoppingCart className="text-ink-500 h-5 w-5" />
          {mounted && cartCount > 0 && (
            <span className="bg-mocha-700 absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          className="flex min-h-11 min-w-11 items-center justify-center"
          aria-label="마이프레시"
        >
          <User className="text-ink-500 h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
