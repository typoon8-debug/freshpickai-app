"use client";

import { Gift, Tag, Ticket } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { MyCoupon } from "@/lib/actions/coupon";

function calcCouponDiscount(coupon: MyCoupon, subtotal: number): number {
  if (coupon.discountUnit === "PERCENT") {
    return Math.floor(subtotal * (coupon.discountValue / 100));
  }
  return coupon.discountValue;
}

interface BenefitBlockProps {
  points?: number;
  pointsUsed: number;
  onPointsChange: (pts: number) => void;
  couponIssuanceId: string | null;
  onCouponChange: (issuanceId: string | null, discount: number) => void;
  subtotal?: number;
  coupons?: MyCoupon[];
}

export function BenefitBlock({
  points = 0,
  pointsUsed,
  onPointsChange,
  couponIssuanceId,
  onCouponChange,
  subtotal = 0,
  coupons = [],
}: BenefitBlockProps) {
  const selectedCoupon = coupons.find((c) => c.issuanceId === couponIssuanceId) ?? null;

  const handleCouponClick = (coupon: MyCoupon) => {
    if (couponIssuanceId === coupon.issuanceId) {
      onCouponChange(null, 0);
    } else {
      onCouponChange(coupon.issuanceId, calcCouponDiscount(coupon, subtotal));
    }
  };

  return (
    <div className="border-line overflow-hidden rounded-lg border bg-white">
      <div className="border-line flex items-center gap-2 border-b px-4 py-3">
        <Gift size={15} className="text-mocha-500" />
        <span className="text-ink-800 text-sm font-semibold">혜택 적용</span>
      </div>

      <div className="divide-line divide-y px-4">
        {/* 포인트 */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-honey" />
            <span className="text-ink-700 text-sm">포인트</span>
            <span className="text-honey text-xs font-medium">{formatPrice(points)} 보유</span>
          </div>
          {points > 0 ? (
            <button
              type="button"
              onClick={() => onPointsChange(pointsUsed > 0 ? 0 : Math.min(points, subtotal))}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                pointsUsed > 0 ? "bg-honey/20 text-honey" : "bg-mocha-50 text-mocha-600"
              )}
            >
              {pointsUsed > 0 ? `${formatPrice(pointsUsed)} 적용됨` : "전액 사용"}
            </button>
          ) : (
            <span className="text-ink-300 text-xs">포인트 없음</span>
          )}
        </div>

        {/* 쿠폰 */}
        <div className="py-3">
          <div className="mb-2 flex items-center gap-2">
            <Ticket size={14} className="text-mocha-500" />
            <span className="text-ink-700 text-sm">쿠폰</span>
            {selectedCoupon && (
              <span className="text-mocha-600 bg-mocha-50 rounded px-1.5 py-0.5 text-[10px] font-medium">
                -{formatPrice(calcCouponDiscount(selectedCoupon, subtotal))}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => onCouponChange(null, 0)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm transition",
                couponIssuanceId === null
                  ? "border-mocha-600 bg-mocha-50 text-mocha-700 font-medium"
                  : "border-line text-ink-400"
              )}
            >
              쿠폰 사용 안 함
            </button>

            {coupons.length === 0 ? (
              <p className="text-ink-300 py-1 text-center text-xs">사용 가능한 쿠폰이 없어요</p>
            ) : (
              coupons.map((c) => {
                const available = subtotal >= c.minOrderAmount;
                const discount = calcCouponDiscount(c, subtotal);
                const isSelected = couponIssuanceId === c.issuanceId;
                return (
                  <button
                    key={c.issuanceId}
                    type="button"
                    disabled={!available}
                    onClick={() => handleCouponClick(c)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm transition",
                      isSelected
                        ? "border-mocha-600 bg-mocha-50 text-mocha-700 font-medium"
                        : available
                          ? "border-line text-ink-600"
                          : "border-line text-ink-300 cursor-not-allowed opacity-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span>{c.couponName}</span>
                      <span className="text-mocha-700 shrink-0 font-semibold">
                        {c.discountUnit === "PERCENT"
                          ? `${c.discountValue}%`
                          : formatPrice(discount)}{" "}
                        할인
                      </span>
                    </div>
                    {!available && (
                      <p className="text-ink-300 mt-0.5 text-xs">
                        {formatPrice(c.minOrderAmount)} 이상 구매 시
                      </p>
                    )}
                    {c.expiresAt && (
                      <p className="text-ink-400 mt-0.5 text-xs">
                        {new Date(c.expiresAt).toLocaleDateString("ko-KR", {
                          month: "long",
                          day: "numeric",
                        })}
                        까지
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
