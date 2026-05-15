"use client";

import { useState, useMemo, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TopHeader } from "@/components/layout/top-header";
import { AddressBlock } from "@/components/checkout/address-block";
import { AddressSelectSheet } from "@/components/checkout/address-select-sheet";
import { PaymentSelector } from "@/components/checkout/payment-selector";
import { BenefitBlock } from "@/components/checkout/benefit-block";
import { CartSummary } from "@/components/cart/cart-summary";
import { CheckoutFooter } from "@/components/checkout/checkout-footer";
import { useCartStore } from "@/lib/store";
import { prepareOrderAction, type FpOrderPayload } from "@/lib/actions/orders";
import { getAddresses, type FpAddress } from "@/lib/actions/address";
import { getMyCouponsWithStatus, type MyCoupon } from "@/lib/actions/coupon";
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
  const [couponIssuanceId, setCouponIssuanceId] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const initiated = useRef(false);

  // 배송지 상태
  const [selectedAddress, setSelectedAddress] = useState<FpAddress | null>(null);
  const [showAddressSheet, setShowAddressSheet] = useState(false);

  // 쿠폰 목록
  const [availableCoupons, setAvailableCoupons] = useState<MyCoupon[]>([]);

  // 배송지 + 쿠폰 초기 로드
  useEffect(() => {
    getAddresses().then((addrs) => {
      const defaultAddr = addrs.find((a) => a.status === "DEFAULT") ?? addrs[0] ?? null;
      setSelectedAddress(defaultAddr);
    });
    getMyCouponsWithStatus().then((coupons) => {
      setAvailableCoupons(coupons.filter((c) => c.status === "AVAILABLE"));
    });
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const shipping = subtotal >= 30000 ? 0 : 3000;
  const total = Math.max(0, subtotal + shipping - pointsUsed - couponDiscount);

  const urlError = searchParams.get("error_msg")
    ? decodeURIComponent(searchParams.get("error_msg")!)
    : null;
  const payError = actionError ?? urlError;

  const handleCouponChange = (issuanceId: string | null, discount: number) => {
    setCouponIssuanceId(issuanceId);
    setCouponDiscount(discount);
  };

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

      // 배송지 전체 주소 문자열
      const addressFull = selectedAddress
        ? `${selectedAddress.address}${selectedAddress.addrDetail ? " " + selectedAddress.addrDetail : ""}`
        : null;

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
        couponId: couponIssuanceId,
        couponIssuanceId,
        couponDiscount,
        finalAmount: amount,
        paymentMethod,
        addressFull,
        addressName: selectedAddress?.addressName ?? null,
        addressPhone: selectedAddress?.receiverPhone ?? null,
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

        {/* 배송지 */}
        <AddressBlock address={selectedAddress} onChangeRequest={() => setShowAddressSheet(true)} />

        <PaymentSelector selected={paymentMethod} onChange={setPaymentMethod} />

        <BenefitBlock
          points={0}
          pointsUsed={pointsUsed}
          onPointsChange={setPointsUsed}
          couponIssuanceId={couponIssuanceId}
          onCouponChange={handleCouponChange}
          subtotal={subtotal}
          coupons={availableCoupons}
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

      {/* 배송지 선택 Sheet */}
      <AddressSelectSheet
        open={showAddressSheet}
        onClose={() => setShowAddressSheet(false)}
        onSelect={setSelectedAddress}
        selectedId={selectedAddress?.addressId}
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
