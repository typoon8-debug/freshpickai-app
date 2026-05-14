import type { StoreItemAiData } from "@/lib/types";

export type PriceCompareEntry = {
  label: string;
  value: number;
  highlight?: boolean;
};

export type PriceCompareResult = {
  rows: PriceCompareEntry[];
  savingsPct: number;
  isSeasonal: boolean;
  promoTag?: string;
};

// 월별 제철 할인율 — 봄·가을 제철 식재료 풍성한 시기에 할인 높음
const SEASONAL_DISCOUNT: Record<number, number> = {
  1: 0.05,
  2: 0.05,
  3: 0.18,
  4: 0.22,
  5: 0.25,
  6: 0.18,
  7: 0.12,
  8: 0.12,
  9: 0.22,
  10: 0.25,
  11: 0.2,
  12: 0.08,
};

const PROMO_TYPE_LABEL: Record<NonNullable<StoreItemAiData["promoType"]>, string> = {
  SALE: "🏷️ 세일",
  DISCOUNT_PCT: "💰 할인",
  BUNDLE: "📦 묶음",
  TWO_PLUS_ONE: "🎁 N+1",
};

/**
 * @param basePrice 기준 재료 총 가격
 * @param liveDiscount v_store_inventory_item 실시간 할인율 (0~100)
 * @param month 월 (1~12, 기본값: 현재 월)
 */
export function calcPriceCompare(
  basePrice: number,
  liveDiscount?: number | null,
  month?: number
): PriceCompareResult {
  const currentMonth = month ?? new Date().getMonth() + 1;
  const seasonalDiscount = SEASONAL_DISCOUNT[currentMonth] ?? 0.1;

  // 실시간 할인율 우선, 없으면 계절 할인 폴백 (0~99% 범위로 클램핑)
  const discount =
    liveDiscount != null ? Math.max(0, Math.min(0.99, liveDiscount / 100)) : seasonalDiscount;
  const isSeasonal = liveDiscount == null && seasonalDiscount >= 0.2;

  const homemadePrice = Math.max(0, Math.round(basePrice * (1 - discount)));
  const restaurantPrice = Math.round(homemadePrice * 2.2);
  const deliveryPrice = Math.round(homemadePrice * 1.85);
  const cafePrice = Math.round(homemadePrice * 1.6);

  const savingsPct = Math.round((1 - homemadePrice / restaurantPrice) * 100);

  return {
    rows: [
      { label: "홈메이드 (이 카드)", value: homemadePrice, highlight: true },
      { label: "외식 평균", value: restaurantPrice },
      { label: "배달 평균", value: deliveryPrice },
      { label: "카페 브런치", value: cafePrice },
    ],
    savingsPct,
    isSeasonal,
  };
}

/** promo_type → 뱃지 문자열 */
export function getPromoTag(promoType?: StoreItemAiData["promoType"] | null): string | undefined {
  if (!promoType) return undefined;
  return PROMO_TYPE_LABEL[promoType];
}
