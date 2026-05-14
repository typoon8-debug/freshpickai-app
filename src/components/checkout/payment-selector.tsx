"use client";

import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FpOrder } from "@/lib/types";

type PaymentMethod = NonNullable<FpOrder["paymentMethod"]>;

const PAYMENT_OPTIONS: { method: PaymentMethod; label: string; emoji: string }[] = [
  { method: "kakao", label: "카카오페이", emoji: "💛" },
  { method: "naver", label: "네이버페이", emoji: "💚" },
  { method: "card", label: "신용카드", emoji: "💳" },
  { method: "bank", label: "계좌이체", emoji: "🏦" },
];

interface PaymentSelectorProps {
  selected: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentSelector({ selected, onChange }: PaymentSelectorProps) {
  return (
    <div className="border-line overflow-hidden rounded-lg border bg-white">
      <div className="border-line flex items-center gap-2 border-b px-4 py-3">
        <CreditCard size={15} className="text-mocha-500" />
        <span className="text-ink-800 text-sm font-semibold">결제 수단</span>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3">
        {PAYMENT_OPTIONS.map((opt) => (
          <button
            key={opt.method}
            type="button"
            onClick={() => onChange(opt.method)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition",
              selected === opt.method
                ? "border-mocha-600 bg-mocha-50 text-mocha-700 font-semibold"
                : "border-line text-ink-600"
            )}
          >
            <span className="text-lg">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
