"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import ShipmentTimeline from "./ShipmentTimeline";
import type { OrderWithDetails } from "@/lib/actions/orders/index";

interface Props {
  order: OrderWithDetails;
}

const STATUS_LABEL: Record<string, string> = {
  CREATED: "주문접수",
  PAID: "결제완료",
  PACKING: "상품준비중",
  DISPATCHED: "배송중",
  DELIVERED: "배송완료",
  CANCELED: "취소됨",
  REJECTED_BY_STORE: "취소됨",
  // fp_order fallback
  paid: "결제완료",
  preparing: "상품준비중",
  shipped: "배송중",
  delivered: "배송완료",
  cancelled: "취소됨",
};

const STATUS_COLOR: Record<string, string> = {
  CREATED: "text-mocha-700 bg-mocha-50",
  PAID: "text-mocha-700 bg-mocha-50",
  PACKING: "text-yellow-700 bg-yellow-50",
  DISPATCHED: "text-blue-700 bg-blue-50",
  DELIVERED: "text-ink-500 bg-ink-100",
  CANCELED: "text-terracotta bg-red-50",
  REJECTED_BY_STORE: "text-terracotta bg-red-50",
  paid: "text-mocha-700 bg-mocha-50",
  preparing: "text-yellow-700 bg-yellow-50",
  shipped: "text-blue-700 bg-blue-50",
  delivered: "text-ink-500 bg-ink-100",
  cancelled: "text-terracotta bg-red-50",
};

export default function OrderCard({ order }: Props) {
  const [expanded, setExpanded] = useState(false);

  const label = STATUS_LABEL[order.status] ?? order.status;
  const colorClass = STATUS_COLOR[order.status] ?? "text-ink-600 bg-ink-50";
  const date = new Date(order.orderedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;

  return (
    <li className="border-line border-b bg-white">
      {/* 접힌 상태 헤더 */}
      <button
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${colorClass}`}>
              {label}
            </span>
            <span className="text-ink-400 text-xs">{date}</span>
          </div>
          <p className="text-ink-700 text-sm font-semibold">{order.storeName}</p>
          {firstItem ? (
            <p className="text-ink-500 mt-0.5 truncate text-xs">
              {firstItem.itemName}
              {extraCount > 0 && ` 외 ${extraCount}개`}
            </p>
          ) : (
            <p className="text-ink-400 mt-0.5 text-xs">주문번호: {order.orderNo}</p>
          )}
          <p className="text-mocha-700 mt-1 text-sm font-bold">
            {order.finalPayable.toLocaleString()}원
          </p>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-ink-300 shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-ink-300 shrink-0" />
        )}
      </button>

      {/* 펼친 상태 */}
      {expanded && (
        <div className="border-line border-t">
          {/* 상품 목록 */}
          {order.items.length > 0 ? (
            <ul className="space-y-2 px-4 py-3">
              {order.items.map((item) => (
                <li key={item.orderDetailId} className="flex items-center gap-3">
                  <div className="bg-ink-50 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <Package size={20} className="text-ink-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-ink-800 truncate text-sm">{item.itemName}</p>
                    <p className="text-ink-400 text-xs">
                      {item.unitPrice.toLocaleString()}원 × {item.qty}
                    </p>
                  </div>
                  <p className="text-ink-700 shrink-0 text-sm font-semibold">
                    {item.lineTotal.toLocaleString()}원
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          {/* 배송 추적 */}
          {order.tracking.length > 0 && (
            <div className="border-line border-t">
              <ShipmentTimeline steps={order.tracking} isCanceled={order.isCanceled} />
            </div>
          )}

          {/* 주문 정보 */}
          <div className="border-line border-t px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-400">주문번호</span>
              <span className="text-ink-700 font-medium">{order.orderNo}</span>
            </div>
            {order.requests && (
              <div className="mt-1 flex items-start justify-between gap-2 text-xs">
                <span className="text-ink-400 shrink-0">요청사항</span>
                <span className="text-ink-600 text-right">{order.requests}</span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-ink-400">결제금액</span>
              <span className="text-mocha-700 font-bold">
                {order.finalPayable.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
