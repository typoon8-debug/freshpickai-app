"use client";

import { cn } from "@/lib/utils";
import type { LargeCategory } from "@/lib/actions/category";

interface CategorySidebarProps {
  categories: LargeCategory[];
  selected: string | null;
  onSelect: (code: string | null) => void;
}

export function CategorySidebar({ categories, selected, onSelect }: CategorySidebarProps) {
  return (
    <nav className="bg-mocha-50 flex w-20 flex-shrink-0 flex-col overflow-y-auto">
      {/* 전체 */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "flex min-h-[56px] items-center justify-center px-1 py-3 text-center text-xs font-medium transition",
          selected === null
            ? "bg-paper text-mocha-700 border-mocha-700 border-r-2 font-semibold"
            : "text-ink-500"
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
            "flex min-h-[56px] items-center justify-center px-1 py-3 text-center text-xs leading-tight font-medium transition",
            selected === cat.code
              ? "bg-paper text-mocha-700 border-mocha-700 border-r-2 font-semibold"
              : "text-ink-500"
          )}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  );
}
