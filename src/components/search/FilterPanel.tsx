"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type CardCategory = "meal" | "snack" | "cinema";

const HEALTH_TAGS = [
  { key: "비건", label: "비건" },
  { key: "저GI", label: "저GI" },
  { key: "고단백", label: "고단백" },
  { key: "저칼로리", label: "저칼로리" },
  { key: "글루텐프리", label: "글루텐프리" },
  { key: "무알콜", label: "무알콜" },
];

const CATEGORIES: { key: CardCategory; label: string }[] = [
  { key: "meal", label: "식사형" },
  { key: "snack", label: "간식형" },
  { key: "cinema", label: "홈시네마" },
];

const COOK_TIME_OPTIONS = [
  { value: "", label: "전체" },
  { value: "15", label: "15분 이내" },
  { value: "30", label: "30분 이내" },
  { value: "60", label: "60분 이내" },
];

export type FilterState = {
  categories: CardCategory[];
  healthTags: string[];
  cookTimeMax?: number;
};

function useFilterState(): [FilterState, (next: Partial<FilterState>) => void, () => void] {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const state: FilterState = {
    categories: (sp.getAll("cat") as CardCategory[]) ?? [],
    healthTags: sp.getAll("tag") ?? [],
    cookTimeMax: sp.get("cookMax") ? Number(sp.get("cookMax")) : undefined,
  };

  const update = useCallback(
    (next: Partial<FilterState>) => {
      const params = new URLSearchParams(sp.toString());
      if (next.categories !== undefined) {
        params.delete("cat");
        next.categories.forEach((c) => params.append("cat", c));
      }
      if (next.healthTags !== undefined) {
        params.delete("tag");
        next.healthTags.forEach((t) => params.append("tag", t));
      }
      if (next.cookTimeMax !== undefined) {
        if (next.cookTimeMax) params.set("cookMax", String(next.cookTimeMax));
        else params.delete("cookMax");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, sp]
  );

  const reset = useCallback(() => {
    const params = new URLSearchParams(sp.toString());
    params.delete("cat");
    params.delete("tag");
    params.delete("cookMax");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, sp]);

  return [state, update, reset];
}

function toggleArr<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

interface Props {
  className?: string;
}

export function FilterPanel({ className }: Props) {
  const [filter, update, reset] = useFilterState();
  const hasActive =
    filter.categories.length > 0 || filter.healthTags.length > 0 || !!filter.cookTimeMax;

  return (
    <div className={cn("flex flex-col gap-3", className)} data-testid="filter-panel">
      <div className="flex items-center justify-between">
        <span className="text-ink-700 flex items-center gap-1.5 text-sm font-semibold">
          <SlidersHorizontal size={14} />
          필터
        </span>
        {hasActive && (
          <button
            type="button"
            onClick={reset}
            className="text-ink-400 hover:text-ink-600 flex items-center gap-0.5 text-xs"
            aria-label="필터 초기화"
          >
            <X size={12} />
            초기화
          </button>
        )}
      </div>

      {/* 카드 유형 */}
      <section aria-label="카드 유형 필터">
        <p className="text-ink-500 mb-1.5 text-xs font-medium">카드 유형</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => update({ categories: toggleArr(filter.categories, key) })}
              aria-pressed={filter.categories.includes(key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                filter.categories.includes(key)
                  ? "bg-mocha-700 border-mocha-700 text-white"
                  : "border-line text-ink-600 bg-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 건강 태그 */}
      <section aria-label="건강 태그 필터">
        <p className="text-ink-500 mb-1.5 text-xs font-medium">건강 태그</p>
        <div className="flex flex-wrap gap-2">
          {HEALTH_TAGS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => update({ healthTags: toggleArr(filter.healthTags, key) })}
              aria-pressed={filter.healthTags.includes(key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                filter.healthTags.includes(key)
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-line text-ink-600 bg-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 조리 시간 */}
      <section aria-label="조리 시간 필터">
        <p className="text-ink-500 mb-1.5 text-xs font-medium">조리 시간</p>
        <div className="flex flex-wrap gap-2">
          {COOK_TIME_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => update({ cookTimeMax: value ? Number(value) : undefined })}
              aria-pressed={
                value === "" ? !filter.cookTimeMax : filter.cookTimeMax === Number(value)
              }
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                (value === "" ? !filter.cookTimeMax : filter.cookTimeMax === Number(value))
                  ? "bg-mocha-700 border-mocha-700 text-white"
                  : "border-line text-ink-600 bg-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
