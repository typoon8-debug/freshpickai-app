import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 30000;
const SHIPPING_FEE = 3000;

interface CartSummaryProps {
  subtotal: number;
  couponDiscount?: number;
  pointsUsed?: number;
}

export function CartSummary({ subtotal, couponDiscount = 0, pointsUsed = 0 }: CartSummaryProps) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal + shipping - couponDiscount - pointsUsed);

  return (
    <div className="border-line overflow-hidden rounded-lg border bg-white">
      {/* 배송 안내 */}
      <div className="border-line bg-mocha-50 flex items-center gap-2 border-b px-4 py-2.5">
        <Truck size={13} className="text-mocha-500" />
        <p className="text-ink-700 text-xs">스토어 배송정책에 따라 배송됩니다</p>
      </div>

      <div className="px-4 py-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-ink-500 text-sm">상품 합계</span>
            <span className="text-ink-900 text-sm">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-500 text-sm">배송비</span>
            <span
              className={shipping === 0 ? "text-sage text-sm font-medium" : "text-ink-900 text-sm"}
            >
              {shipping === 0 ? "무료" : formatPrice(shipping)}
            </span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-ink-500 text-sm">쿠폰 할인</span>
              <span className="text-mocha-600 text-sm font-medium">
                -{formatPrice(couponDiscount)}
              </span>
            </div>
          )}
          {pointsUsed > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-ink-500 text-sm">포인트 사용</span>
              <span className="text-honey text-sm font-medium">-{formatPrice(pointsUsed)}</span>
            </div>
          )}
          <div className="border-line my-1 border-t" />
          <div className="flex items-center justify-between">
            <span className="text-ink-900 text-sm font-semibold">최종 결제금액</span>
            <span className="text-mocha-700 text-lg font-bold">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
