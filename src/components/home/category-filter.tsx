"use client";

import { useUIStore } from "@/lib/store";
import { Chip } from "@/components/ui/chip";

const FILTERS = [
  { value: "all", label: "전체" },
  { value: "meal", label: "식사형" },
  { value: "snack", label: "간식·디저트" },
  { value: "cinema", label: "홈시네마" },
] as const;

export function CategoryFilter() {
  const { homeFilter, setHomeFilter } = useUIStore();

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map(({ value, label }) => (
        <Chip
          key={value}
          label={label}
          active={homeFilter === value}
          onClick={() => setHomeFilter(value)}
        />
      ))}
    </div>
  );
}
