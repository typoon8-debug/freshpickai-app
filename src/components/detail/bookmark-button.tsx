"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleBookmarkAction } from "@/lib/actions/cards/bookmark";
import { toast } from "sonner";

interface BookmarkButtonProps {
  cardId: string;
  initialBookmarked?: boolean;
  className?: string;
}

export function BookmarkButton({
  cardId,
  initialBookmarked = false,
  className,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleBookmarkAction(cardId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setIsBookmarked(result.isBookmarked);
      toast.success(result.isBookmarked ? "북마크에 저장했습니다." : "북마크를 해제했습니다.");
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isBookmarked ? "북마크 해제" : "북마크 저장"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border transition",
        isBookmarked
          ? "border-mocha-700 bg-mocha-700 text-paper"
          : "border-mocha-200 text-mocha-400 hover:border-mocha-400 hover:text-mocha-700 bg-white",
        isPending && "opacity-60",
        className
      )}
    >
      <Bookmark size={16} className={cn(isBookmarked && "fill-current")} />
    </button>
  );
}
