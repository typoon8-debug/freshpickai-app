"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Package, Truck } from "lucide-react";
import { confirmAndCreateOrderAction, type FpOrderPayload } from "@/lib/actions/orders";
import { useCartStore } from "@/lib/store";

type Status = "processing" | "success" | "error";

/** 익일 06시 배송 예약 문자열 생성 */
function getDeliveryWindowText(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const month = tomorrow.getMonth() + 1;
  const day = tomorrow.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[tomorrow.getDay()];
  return `${month}월 ${day}일(${weekday}) 오전 6시 이전 도착 예정`;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearStore = useCartStore((s) => s.clear);

  // URL params에서 직접 파생 (state 불필요)
  const paymentKey = searchParams.get("paymentKey") ?? "";
  const orderNo = searchParams.get("orderId") ?? "";
  const amount = Number(searchParams.get("amount") ?? "0");

  const [status, setStatus] = useState<Status>("processing");
  const [errorMsg, setErrorMsg] = useState("");
  const initiated = useRef(false);

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    if (!paymentKey || !orderNo || amount <= 0) {
      router.replace("/");
      return;
    }

    const rawPayload = sessionStorage.getItem(`pending_order_${orderNo}`);
    if (!rawPayload) {
      // 이미 처리 완료 또는 세션 만료 — 비동기로 setState
      clearStore();
      Promise.resolve().then(() => setStatus("success"));
      return;
    }

    let orderPayload: FpOrderPayload;
    try {
      orderPayload = JSON.parse(rawPayload) as FpOrderPayload;
    } catch {
      router.replace("/");
      return;
    }

    confirmAndCreateOrderAction({ paymentKey, orderNo, amount, orderPayload })
      .then((result) => {
        sessionStorage.removeItem(`pending_order_${orderNo}`);
        if (result.error) {
          setErrorMsg(result.error.message);
          setStatus("error");
        } else {
          clearStore();
          setStatus("success");
        }
      })
      .catch(() => {
        setErrorMsg("주문 처리 중 알 수 없는 오류가 발생했습니다.");
        setStatus("error");
      });
  }, [paymentKey, orderNo, amount, router, clearStore]);

  if (status === "processing") {
    return (
      <div className="bg-paper flex min-h-screen flex-col items-center justify-center gap-4 px-8">
        <Loader2 className="text-mocha-500 h-10 w-10 animate-spin" />
        <p className="text-ink-700 text-sm font-medium">결제를 완료하는 중...</p>
        <p className="text-ink-400 text-xs">잠시만 기다려 주세요</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-paper flex min-h-screen flex-col items-center justify-center gap-4 px-8">
        <XCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-ink-900 text-base font-bold">결제 처리 실패</h2>
        <p className="text-ink-500 text-center text-sm">{errorMsg}</p>
        <p className="text-ink-400 text-center text-xs">결제가 취소 처리되었습니다.</p>
        <button type="button" onClick={() => router.back()} className="btn-primary mt-2 px-8">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-paper flex min-h-screen flex-col items-center justify-center gap-6 px-8">
      <CheckCircle2 className="text-sage h-16 w-16" />

      <div className="text-center">
        <h2 className="font-display text-mocha-900 text-2xl">결제 완료!</h2>
        <p className="text-ink-500 mt-1 text-sm">주문이 성공적으로 접수되었습니다.</p>
      </div>

      {/* 주문 번호 */}
      <div className="border-line w-full rounded-xl border bg-white px-5 py-4">
        <div className="flex items-center gap-2 pb-3">
          <Package size={15} className="text-mocha-500" />
          <span className="text-ink-700 text-sm font-semibold">주문 번호</span>
        </div>
        <p className="text-mocha-800 font-mono text-base font-bold">{orderNo}</p>
      </div>

      {/* 배송 예약 */}
      <div className="border-line w-full rounded-xl border bg-white px-5 py-4">
        <div className="flex items-center gap-2 pb-3">
          <Truck size={15} className="text-mocha-500" />
          <span className="text-ink-700 text-sm font-semibold">배송 예약 확인</span>
        </div>
        <p className="text-ink-800 text-sm font-semibold">{getDeliveryWindowText()}</p>
        <p className="text-ink-400 mt-1 text-xs">
          ※ 스토어 배송 정책에 따라 배송 시간은 변동될 수 있습니다
        </p>
      </div>

      <button type="button" onClick={() => router.replace("/")} className="btn-primary w-full">
        홈으로 이동
      </button>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-paper flex min-h-screen items-center justify-center">
          <Loader2 className="text-mocha-500 h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
