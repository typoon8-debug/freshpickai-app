"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, Package } from "lucide-react";
import OrderCard from "./OrderCard";
import type { OrderWithDetails } from "@/lib/actions/orders/index";

interface Props {
  initialOrders: OrderWithDetails[];
}

export default function OrdersClient({ initialOrders }: Props) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? initialOrders.filter(
        (o) =>
          o.storeName.includes(search) ||
          o.items.some((i) => i.itemName.includes(search)) ||
          o.orderNo.includes(search)
      )
    : initialOrders;

  return (
    <div className="min-h-screen pb-12">
      {/* 헤더 */}
      <header className="border-line bg-paper sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
        <Link href="/profile" aria-label="뒤로가기">
          <ChevronLeft size={22} className="text-ink-700" />
        </Link>
        <h1 className="text-ink-800 flex-1 text-base font-bold">주문 / 배송조회</h1>
      </header>

      {/* 검색 */}
      <div className="border-line border-b px-4 py-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="가게명, 상품명, 주문번호 검색"
          className="border-line text-ink-800 placeholder:text-ink-300 focus:ring-mocha-400 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-1"
        />
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Package size={48} className="text-ink-200" />
          <p className="text-ink-500 text-sm font-medium">
            {search ? "검색 결과가 없어요" : "주문 내역이 없어요"}
          </p>
          {!search && (
            <Link
              href="/category"
              className="bg-mocha-700 text-paper mt-2 rounded-xl px-5 py-2.5 text-sm font-bold"
            >
              쇼핑하러 가기
            </Link>
          )}
        </div>
      ) : (
        <ul>
          {filtered.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}
