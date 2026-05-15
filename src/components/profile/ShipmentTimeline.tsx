"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { OrderTrackingStep } from "@/lib/actions/orders/index";

interface Props {
  steps: OrderTrackingStep[];
  isCanceled: boolean;
}

function formatAt(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ShipmentTimeline({ steps, isCanceled }: Props) {
  if (steps.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <p className="text-ink-500 mb-3 text-xs font-semibold">배송 현황</p>
      <ol className="space-y-0">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <li key={step.step} className="flex gap-3">
              {/* 아이콘 + 연결선 */}
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {step.status === "completed" ? (
                    <CheckCircle2 size={18} className="text-mocha-600 fill-mocha-100" />
                  ) : step.status === "current" ? (
                    <Clock size={18} className="text-mocha-700" />
                  ) : (
                    <Circle size={18} className="text-ink-200" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`mt-0.5 h-8 w-0.5 ${
                      step.status === "completed" ? "bg-mocha-200" : "bg-ink-100"
                    }`}
                  />
                )}
              </div>

              {/* 레이블 */}
              <div className="pb-2">
                <p
                  className={`text-sm font-semibold ${
                    step.status === "current"
                      ? "text-mocha-800"
                      : step.status === "completed"
                        ? "text-ink-600"
                        : "text-ink-300"
                  }`}
                >
                  {isCanceled && step.step === 1 ? "주문 취소됨" : step.label}
                </p>
                {step.completedAt && (
                  <p className="text-ink-400 text-xs">{formatAt(step.completedAt)}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
