import { type NextRequest, NextResponse } from "next/server";
import { confirmTossPayment, cancelTossPayment } from "@/lib/payments/toss";
import { createOrder, createOrderItems, updateOrderStatus } from "@/lib/api/orders";
import { createPayment, logPaymentError } from "@/lib/api/payments";
import { validateStock, decreaseInventory } from "@/lib/api/inventory";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const DEFAULT_STORE_ID =
  process.env.FRESHPICKAI_DEFAULT_STORE_ID ?? "00000000-0000-0000-0000-000000000001";

interface ConfirmRequestBody {
  paymentKey: string;
  orderId: string;
  amount: number;
  items: {
    cartItemId: string;
    refStoreItemId?: string;
    name: string;
    qty: number;
    price: number;
    emoji?: string;
  }[];
  storeId?: string;
  subtotal: number;
  shipping: number;
  couponDiscount?: number;
  pointsUsed?: number;
  paymentMethod: string;
  addressFull?: string | null;
}

/**
 * POST /api/payments/confirm
 * 토스페이먼츠 결제 승인 + 주문 생성 Route Handler
 * Server Action(confirmAndCreateOrderAction)의 HTTP 래퍼
 */
export async function POST(request: NextRequest) {
  let body: ConfirmRequestBody;
  try {
    body = (await request.json()) as ConfirmRequestBody;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const {
    paymentKey,
    orderId: orderNo,
    amount,
    items,
    storeId,
    subtotal,
    shipping,
    paymentMethod,
  } = body;

  if (!paymentKey || !orderNo || !amount) {
    return NextResponse.json(
      { error: "paymentKey, orderId, amount는 필수입니다." },
      { status: 400 }
    );
  }

  // 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // customer_id 조회
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("fp_user_profile")
    .select("ref_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: customer } = profile?.ref_customer_id
    ? { data: { customer_id: profile.ref_customer_id } }
    : await admin.from("customer").select("customer_id").eq("email", user.email).maybeSingle();

  const customerId = (customer?.customer_id as string) ?? user.id;
  const resolvedStoreId = storeId ?? DEFAULT_STORE_ID;

  // Step 1: Toss 결제 승인
  let confirmedPaymentKey: string;
  let tossApprovedAt: string;
  try {
    const tossRes = await confirmTossPayment({ paymentKey, orderId: orderNo, amount });
    confirmedPaymentKey = tossRes.paymentKey;
    tossApprovedAt = tossRes.approvedAt;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "결제 승인 실패" },
      { status: 422 }
    );
  }

  // Step 2: DB 처리 (재고 검증 → order → order_item → payment → 재고 차감)
  try {
    const stockItems = (items ?? [])
      .filter((i) => i.refStoreItemId)
      .map((i) => ({ storeItemId: i.refStoreItemId!, storeId: resolvedStoreId, qty: i.qty }));

    if (stockItems.length > 0) {
      const { valid, outOfStock } = await validateStock(stockItems);
      if (!valid) {
        throw Object.assign(new Error(`품절 상품: ${outOfStock.join(", ")}`), {
          code: "OUT_OF_STOCK",
        });
      }
    }

    const orderRes = await createOrder({
      customerId,
      storeId: resolvedStoreId,
      originTotalPrice: subtotal,
      discountedTotalPrice: subtotal - (body.couponDiscount ?? 0),
      deliveryFee: shipping,
      finalPayable: amount,
      requests: body.addressFull ?? undefined,
      orderNo,
      status: "PAID",
    });
    if (orderRes.error || !orderRes.data)
      throw new Error(orderRes.error?.message ?? "주문 생성 실패");
    const orderId = orderRes.data.order_id;

    await createOrderItems(
      orderId,
      (items ?? []).map((i) => ({
        storeItemId: i.refStoreItemId ?? i.cartItemId,
        qty: i.qty,
        unitPrice: i.price,
      }))
    );

    await createPayment({
      orderId,
      pgTxId: confirmedPaymentKey,
      paidAmount: amount,
      netPaidAmount: amount - (body.couponDiscount ?? 0),
      pointsUsed: body.pointsUsed ?? 0,
      deliveryFee: shipping,
      paymentMethod,
      status: "CAPTURED",
      approvedAt: tossApprovedAt,
    });

    if (stockItems.length > 0) {
      await decreaseInventory(stockItems);
    }

    // fp_order 레코드 생성 + fp_cart_item 비우기
    await Promise.all([
      supabase.from("fp_order").insert({
        user_id: user.id,
        ref_order_id: orderId,
        subtotal,
        shipping,
        discount: body.couponDiscount ?? 0,
        total: amount,
        payment_method: paymentMethod,
        payment_key: confirmedPaymentKey,
        address_full: body.addressFull ?? null,
        status: "confirmed",
      }),
      supabase.from("fp_cart_item").delete().eq("user_id", user.id),
    ]);

    await updateOrderStatus(orderId, "PAID");

    return NextResponse.json({ orderId, orderNo });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "주문 처리 오류";
    const errorCode = (err as { code?: string }).code ?? "ORDER_PROCESS_FAILED";

    try {
      await cancelTossPayment({
        paymentKey: confirmedPaymentKey!,
        cancelReason: `주문 처리 오류로 자동 취소 (${errorCode})`,
      });
      await logPaymentError({
        orderNo,
        customerId,
        paymentKey: confirmedPaymentKey!,
        paymentAmount: amount,
        errorType: "DB_FAILURE",
        errorMessage,
        refundStatus: "SUCCESS",
      });
    } catch {
      console.error("[CRITICAL] Toss 결제 취소 실패:", { orderNo, paymentKey, amount });
      await logPaymentError({
        orderNo,
        customerId,
        paymentKey: confirmedPaymentKey!,
        paymentAmount: amount,
        errorType: "REFUND_FAILURE",
        errorMessage: `원인: ${errorMessage}`,
        refundStatus: "FAILED",
      });
    }

    return NextResponse.json(
      { error: errorCode === "OUT_OF_STOCK" ? `재고 부족: ${errorMessage}` : "주문 처리 오류" },
      { status: 500 }
    );
  }
}
