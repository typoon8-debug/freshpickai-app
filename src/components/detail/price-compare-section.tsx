import type { PriceCompareResult } from "@/lib/price-compare";
import { calcPriceCompare } from "@/lib/price-compare";

interface PriceCompareSectionProps {
  price?: number;
  priceCompare?: PriceCompareResult;
}

export function PriceCompareSection({ price = 15000, priceCompare }: PriceCompareSectionProps) {
  const result = priceCompare ?? calcPriceCompare(price);

  return (
    <section className="border-line rounded-xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-ink-900 text-sm font-semibold">가격 비교</h3>
        {result.isSeasonal && (
          <span className="rounded-full bg-olive-100 px-2 py-0.5 text-xs font-medium text-olive-700">
            🌿 제철 특가
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {result.rows.map(({ label, value, highlight }) => (
          <div key={label} className="flex items-center justify-between">
            <span
              className={
                highlight ? "text-mocha-700 text-sm font-semibold" : "text-ink-500 text-sm"
              }
            >
              {label}
            </span>
            <span
              className={highlight ? "text-mocha-700 text-sm font-bold" : "text-ink-400 text-sm"}
            >
              {value.toLocaleString("ko-KR")}원
            </span>
          </div>
        ))}
      </div>
      <p className="text-ink-300 mt-3 text-xs">외식 대비 최대 {result.savingsPct}% 절약</p>
    </section>
  );
}
