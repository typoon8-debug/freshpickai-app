"use client";

import { useState, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TopHeader } from "@/components/layout/top-header";
import { AddressBlock } from "@/components/checkout/address-block";
import { PaymentSelector } from "@/components/checkout/payment-selector";
import { BenefitBlock, MOCK_COUPONS } from "@/components/checkout/benefit-block";
import { CartSummary } from "@/components/cart/cart-summary";
import { CheckoutFooter } from "@/components/checkout/checkout-footer";
import { useCartStore } from "@/lib/store";
import { prepareOrderAction, type FpOrderPayload } from "@/lib/actions/orders";
import type { FpOrder } from "@/lib/types";

type PaymentMethod = NonNullable<FpOrder["paymentMethod"]>;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const selectedIdsParam = searchParams.get("ids") ?? "";
  const selectedIdSet = useMemo(
    () => new Set(selectedIdsParam ? selectedIdsParam.split(",") : []),
    [selectedIdsParam]
  );

  const allItems = useCartStore((s) => s.items);
  const items = useMemo(
    () =>
      selectedIdSet.size > 0 ? allItems.filter((i) => selectedIdSet.has(i.cartItemId)) : allItems,
    [allItems, selectedIdSet]
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const initiated = useRef(false);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const shipping = subtotal >= 30000 ? 0 : 3000;
  const couponDiscount = MOCK_COUPONS.find((c) => c.id === couponId)?.discount ?? 0;
  const total = Math.max(0, subtotal + shipping - pointsUsed - couponDiscount);

  // fail redirect에서 복귀 시 에러 메시지 (렌더 타임 직접 읽기)
  const urlError = searchParams.get("error_msg")
    ? decodeURIComponent(searchParams.get("error_msg")!)
    : null;
  const payError = actionError ?? urlError;

  const handlePay = async () => {
    if (!paymentMethod || isPaying) return;
    if (initiated.current) return;
    initiated.current = true;
    setIsPaying(true);
    setActionError(null);

    try {
      // Step 1: 재고 검증 + orderNo 발급
      const prepareRes = await prepareOrderAction({
        items: items.map((i) => ({
          cartItemId: i.cartItemId,
          refStoreItemId: i.refStoreItemId,
          name: i.name,
          qty: i.qty,
          price: i.price,
          emoji: i.emoji,
        })),
        finalAmount: total,
      });

      if (prepareRes.error) {
        setActionError(prepareRes.error.message);
        setIsPaying(false);
        initiated.current = false;
        return;
      }

      const { orderNo, amount, storeId } = prepareRes.data!;

      // Step 2: 주문 페이로드 sessionStorage 저장
      const payload: FpOrderPayload = {
        items: items.map((i) => ({
          cartItemId: i.cartItemId,
          refStoreItemId: i.refStoreItemId,
          name: i.name,
          qty: i.qty,
          price: i.price,
          emoji: i.emoji,
        })),
        storeId,
        subtotal,
        shipping,
        pointsUsed,
        couponId,
        couponDiscount,
        finalAmount: amount,
        paymentMethod,
        addressFull: null,
      };
      sessionStorage.setItem(`pending_order_${orderNo}`, JSON.stringify(payload));

      // Step 3: Toss SDK 로드 + 결제 요청
      const { loadTossPayments, ANONYMOUS } = await import("@tosspayments/tosspayments-sdk");
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) throw new Error("NEXT_PUBLIC_TOSS_CLIENT_KEY is not set");

      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });

      const successUrl = `${window.location.origin}/checkout/success`;
      const failUrl = new URL("/checkout/fail", window.location.origin);
      failUrl.searchParams.set("orderNo", orderNo);

      const orderName =
        items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}건`;

      // 카카오페이·네이버페이는 CARD method + easyPay flowMode DIRECT로 처리
      // 계좌이체는 TRANSFER, 그 외는 CARD
      if (paymentMethod === "bank") {
        await payment.requestPayment({
          method: "TRANSFER",
          amount: { currency: "KRW", value: amount },
          orderId: orderNo,
          orderName,
          successUrl,
          failUrl: failUrl.toString(),
        });
      } else {
        await payment.requestPayment({
          method: "CARD",
          amount: { currency: "KRW", value: amount },
          orderId: orderNo,
          orderName,
          successUrl,
          failUrl: failUrl.toString(),
          card: {
            useEscrow: false,
            flowMode: paymentMethod === "kakao" || paymentMethod === "naver" ? "DIRECT" : "DEFAULT",
            useCardPoint: false,
            useAppCardOnly: false,
            ...(paymentMethod === "naver" && { easyPay: "NAVERPAY" as const }),
          },
        });
      }
    } catch (err) {
      // 사용자가 결제창을 닫은 경우
      const msg = err instanceof Error ? err.message : "결제 초기화 실패";
      if (!msg.includes("취소")) {
        setActionError(msg);
      }
      setIsPaying(false);
      initiated.current = false;
    }
  };

  if (items.length === 0) {
    return (
      <>
        <TopHeader title="결제" backHref="/cart" />
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-ink-400 text-sm">결제할 상품이 없어요</p>
          <Link href="/cart" className="btn-primary px-8">
            장바구니로
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <TopHeader title="결제" backHref="/cart" />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-36">
        {/* 주문 상품 요약 */}
        <div className="border-line overflow-hidden rounded-lg border bg-white px-4 py-3">
          <p className="text-ink-700 text-sm font-semibold">주문 상품 ({items.length}개)</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {items.slice(0, 3).map((item) => (
              <div key={item.cartItemId} className="flex items-center gap-2">
                <span className="text-base">{item.emoji ?? "🛒"}</span>
                <span className="text-ink-700 flex-1 truncate text-sm">{item.name}</span>
                <span className="text-ink-500 text-xs">×{item.qty}</span>
              </div>
            ))}
            {items.length > 3 && <p className="text-ink-400 text-xs">외 {items.length - 3}개</p>}
          </div>
        </div>

        <AddressBlock />
        <PaymentSelector selected={paymentMethod} onChange={setPaymentMethod} />
        <BenefitBlock
          pointsUsed={pointsUsed}
          onPointsChange={setPointsUsed}
          couponId={couponId}
          onCouponChange={setCouponId}
          subtotal={subtotal}
        />
        <CartSummary subtotal={subtotal} couponDiscount={couponDiscount} pointsUsed={pointsUsed} />

        {payError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{payError}</div>
        )}
      </div>

      <CheckoutFooter
        total={total}
        paymentMethod={paymentMethod}
        onPay={handlePay}
        isPaying={isPaying}
      />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="text-mocha-500 h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
