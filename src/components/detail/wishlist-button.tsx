"use client";

import { useState, useOptimistic, startTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { addWishlistAction, removeWishlistAction } from "@/lib/actions/wishlist";

interface WishlistButtonProps {
  storeItemId: string;
  storeId: string;
  initialWishlisted?: boolean;
  className?: string;
}

export function WishlistButton({
  storeItemId,
  storeId,
  initialWishlisted = false,
  className,
}: WishlistButtonProps) {
  const [serverState, setServerState] = useState(initialWishlisted);
  const [optimistic, setOptimistic] = useOptimistic(serverState);

  const toggle = async () => {
    const next = !optimistic;
    startTransition(async () => {
      setOptimistic(next);
      if (next) {
        await addWishlistAction(storeItemId, storeId);
      } else {
        await removeWishlistAction(storeItemId);
      }
      setServerState(next);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={optimistic ? "찜 해제" : "찜하기"}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        optimistic
          ? "bg-red-50 text-red-500"
          : "bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-400",
        className
      )}
    >
      <Heart size={18} fill={optimistic ? "currentColor" : "none"} />
    </button>
  );
}
