"use client";

import { Lock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { FpOrder } from "@/lib/types";

interface CheckoutFooterProps {
  total: number;
  paymentMethod: FpOrder["paymentMethod"] | null;
  onPay: () => void;
  isPaying?: boolean;
}

// Task 032에서 토스페이먼츠 SDK 실제 연동 예정
export function CheckoutFooter({ total, paymentMethod, onPay, isPaying }: CheckoutFooterProps) {
  return (
    <div className="border-line fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 px-4 py-3 backdrop-blur-sm">
      <button
        type="button"
        onClick={onPay}
        disabled={!paymentMethod || isPaying}
        className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-40"
      >
        <Lock size={14} />
        {isPaying ? "결제 중..." : `${formatPrice(total)} 결제하기`}
      </button>
      <p className="text-ink-300 mt-1.5 text-center text-[10px]">
        주문 내용을 확인하였으며 결제에 동의합니다
      </p>
    </div>
  );
}
