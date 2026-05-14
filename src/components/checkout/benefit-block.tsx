"use client";

import { Gift, Tag, Ticket } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

export const MOCK_COUPONS = [
  { id: "COUP5000", label: "5,000원 할인", discount: 5000, minOrder: 30000 },
  { id: "COUP10PCT", label: "신선식품 10% 할인 (최대 3,000원)", discount: 3000, minOrder: 20000 },
  { id: "COUP2000", label: "배송비 할인쿠폰", discount: 2000, minOrder: 15000 },
];

interface BenefitBlockProps {
  points?: number;
  pointsUsed: number;
  onPointsChange: (pts: number) => void;
  couponId: string | null;
  onCouponChange: (id: string | null) => void;
  subtotal?: number;
}

export function BenefitBlock({
  points = 1200,
  pointsUsed,
  onPointsChange,
  couponId,
  onCouponChange,
  subtotal = 0,
}: BenefitBlockProps) {
  const selectedCoupon = MOCK_COUPONS.find((c) => c.id === couponId) ?? null;

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
          <button
            type="button"
            onClick={() => onPointsChange(pointsUsed > 0 ? 0 : Math.min(points, 5000))}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              pointsUsed > 0 ? "bg-honey/20 text-honey" : "bg-mocha-50 text-mocha-600"
            )}
          >
            {pointsUsed > 0 ? `${formatPrice(pointsUsed)} 적용됨` : "전액 사용"}
          </button>
        </div>

        {/* 쿠폰 */}
        <div className="py-3">
          <div className="mb-2 flex items-center gap-2">
            <Ticket size={14} className="text-mocha-500" />
            <span className="text-ink-700 text-sm">쿠폰</span>
            {selectedCoupon && (
              <span className="text-mocha-600 bg-mocha-50 rounded px-1.5 py-0.5 text-[10px] font-medium">
                -{formatPrice(selectedCoupon.discount)}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => onCouponChange(null)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm transition",
                couponId === null
                  ? "border-mocha-600 bg-mocha-50 text-mocha-700 font-medium"
                  : "border-line text-ink-400"
              )}
            >
              쿠폰 사용 안 함
            </button>
            {MOCK_COUPONS.map((c) => {
              const available = subtotal >= c.minOrder;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={!available}
                  onClick={() => onCouponChange(couponId === c.id ? null : c.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm transition",
                    couponId === c.id
                      ? "border-mocha-600 bg-mocha-50 text-mocha-700 font-medium"
                      : available
                        ? "border-line text-ink-600"
                        : "border-line text-ink-300 cursor-not-allowed opacity-50"
                  )}
                >
                  <span>{c.label}</span>
                  {!available && (
                    <span className="text-ink-300 ml-1 text-xs">
                      ({formatPrice(c.minOrder)} 이상 구매 시)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
