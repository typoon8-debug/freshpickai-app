import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 30000;
const SHIPPING_FEE = 3000;

interface FreeShippingBarProps {
  subtotal: number;
}

export function FreeShippingBar({ subtotal }: FreeShippingBarProps) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const isFree = remaining <= 0;

  return (
    <div className="bg-mocha-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <Truck size={15} className="text-mocha-600" />
        <p className="text-ink-700 text-xs">
          {isFree ? (
            <span className="text-sage font-semibold">무료배송 달성! 🎉</span>
          ) : (
            <>
              <span className="text-mocha-700 font-semibold">{formatPrice(remaining)}</span>
              {" 더 담으면 무료배송"}
            </>
          )}
        </p>
      </div>
      <div className="bg-mocha-200 mt-2 h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-mocha-700 h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-ink-300 mt-1 text-right text-[10px]">
        {formatPrice(FREE_SHIPPING_THRESHOLD)} 이상 무료배송 (기본 {formatPrice(SHIPPING_FEE)})
      </p>
    </div>
  );
}
