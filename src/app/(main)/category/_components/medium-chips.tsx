"use client";

import { cn } from "@/lib/utils";
import type { MediumCategory } from "@/lib/actions/category";

interface MediumChipsProps {
  categories: MediumCategory[];
  selected: string | null;
  onSelect: (code: string | null) => void;
}

export function MediumChips({ categories, selected, onSelect }: MediumChipsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="border-line flex gap-2 overflow-x-auto border-b px-4 py-2.5 [scrollbar-width:none]">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition",
          selected === null ? "bg-mocha-700 text-white" : "border-line text-ink-600 border bg-white"
        )}
      >
        전체
      </button>
      {categories.map((cat) => (
        <button
          key={cat.code}
          type="button"
          onClick={() => onSelect(cat.code)}
          className={cn(
            "flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition",
            selected === cat.code
              ? "bg-mocha-700 text-white"
              : "border-line text-ink-600 border bg-white"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
