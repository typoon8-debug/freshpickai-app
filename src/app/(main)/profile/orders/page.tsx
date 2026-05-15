import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type FpOrder = {
  fp_order_id: string;
  ref_order_id: string | null;
  subtotal: number;
  total: number;
  status: string;
  address_name: string | null;
  delivery_window: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  paid: "결제완료",
  preparing: "상품준비중",
  shipped: "배송중",
  delivered: "배송완료",
  cancelled: "취소됨",
};

const STATUS_COLOR: Record<string, string> = {
  paid: "text-mocha-700 bg-mocha-50",
  preparing: "text-olive-700 bg-olive-100",
  shipped: "text-blue-700 bg-blue-50",
  delivered: "text-ink-500 bg-ink-100",
  cancelled: "text-terracotta bg-red-50",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("fp_order")
    .select(
      "fp_order_id, ref_order_id, subtotal, total, status, address_name, delivery_window, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const list = (orders ?? []) as FpOrder[];

  return (
    <div className="min-h-screen pb-12">
      <header className="border-line bg-paper sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
        <Link href="/profile" aria-label="뒤로가기">
          <ChevronLeft size={22} className="text-ink-700" />
        </Link>
        <h1 className="text-ink-800 flex-1 text-base font-bold">주문 / 배송조회</h1>
      </header>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Package size={48} className="text-ink-200" />
          <p className="text-ink-500 text-sm font-medium">주문 내역이 없어요</p>
          <p className="text-ink-400 text-xs">장보기를 시작해보세요!</p>
          <Link
            href="/category"
            className="bg-mocha-700 text-paper mt-2 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <ul className="divide-line divide-y">
          {list.map((order) => {
            const label = STATUS_LABEL[order.status] ?? order.status;
            const color = STATUS_COLOR[order.status] ?? "text-ink-600 bg-ink-50";
            const date = new Date(order.created_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            return (
              <li key={order.fp_order_id} className="flex items-center gap-4 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${color}`}>
                      {label}
                    </span>
                    <span className="text-ink-400 text-xs">{date}</span>
                  </div>
                  <p className="text-ink-800 truncate text-sm font-semibold">
                    주문번호: {order.ref_order_id ?? order.fp_order_id.slice(0, 8).toUpperCase()}
                  </p>
                  {order.address_name && (
                    <p className="text-ink-500 mt-0.5 truncate text-xs">
                      받는분: {order.address_name}
                    </p>
                  )}
                  <p className="text-mocha-700 mt-1 text-sm font-bold">
                    {order.total.toLocaleString()}원
                  </p>
                </div>
                <ChevronRight size={16} className="text-ink-300 shrink-0" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
