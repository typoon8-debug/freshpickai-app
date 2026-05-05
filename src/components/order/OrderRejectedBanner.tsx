"use client";

import { AlertCircle } from "lucide-react";

type RefundStatus = "NONE" | "PENDING" | "REQUESTED" | "COMPLETED" | "FAILED" | null;

interface OrderRejectedBannerProps {
  rejectReason?: string | null;
  refundStatus?: RefundStatus;
}

const REFUND_STATUS_LABEL: Record<NonNullable<RefundStatus>, string> = {
  NONE: "",
  PENDING: "환불 처리 중입니다.",
  REQUESTED: "환불 처리 중입니다.",
  COMPLETED: "환불이 완료되었습니다.",
  FAILED: "환불에 문제가 있어요. 고객센터로 문의해 주세요.",
};

export function OrderRejectedBanner({ rejectReason, refundStatus }: OrderRejectedBannerProps) {
  const refundLabel = refundStatus ? REFUND_STATUS_LABEL[refundStatus] : "";

  return (
    <div className="mx-4 my-3 rounded-xl border border-red-200 bg-red-50 p-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-red-700">매장 사정으로 배송이 거부되었어요</p>
          {rejectReason && <p className="text-xs text-red-600">{rejectReason}</p>}
          {refundLabel && <p className="text-xs text-red-500">{refundLabel}</p>}
        </div>
      </div>
    </div>
  );
}
