"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createOrder, createOrderItems } from "@/lib/api/orders";
import { createPayment, logPaymentError } from "@/lib/api/payments";
import { validateStock, decreaseInventory } from "@/lib/api/inventory";
import { confirmTossPayment, cancelTossPayment } from "@/lib/payments/toss";

export interface FpOrderItem {
  cartItemId: string;
  refStoreItemId?: string;
  name: string;
  qty: number;
  price: number;
  emoji?: string;
}

/** Plan B: sessionStorage 직렬화용 주문 페이로드 */
export interface FpOrderPayload {
  items: FpOrderItem[];
  storeId: string;
  subtotal: number;
  shipping: number;
  pointsUsed: number;
  couponId: string | null;
  couponIssuanceId: string | null;
  couponDiscount: number;
  finalAmount: number;
  paymentMethod: string;
  addressFull: string | null;
  addressName: string | null;
  addressPhone: string | null;
}

interface ApiResponse<T = unknown> {
  data?: T;
  error?: { code: string; message: string };
}

async function getAuthedCustomerInfo(): Promise<{
  userId: string;
  customerId: string;
  storeId: string;
  email: string;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = createAdminClient();

  // 1) fp_user_profile.ref_customer_id 확인
  const { data: profile } = await admin
    .from("fp_user_profile")
    .select("ref_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId: string | null = profile?.ref_customer_id as string | null;

  if (!customerId) {
    // 2) customer 테이블에서 이메일로 조회
    const { data: customer } = await admin
      .from("customer")
      .select("customer_id")
      .eq("email", user.email)
      .maybeSingle();

    if (customer?.customer_id) {
      customerId = customer.customer_id as string;
      // ref_customer_id 캐싱
      await admin
        .from("fp_user_profile")
        .update({ ref_customer_id: customerId })
        .eq("user_id", user.id);
    }
  }

  if (!customerId) return null;

  // customer.store_id 조회 (실제 storeId)
  const { data: cust } = await admin
    .from("customer")
    .select("store_id")
    .eq("customer_id", customerId)
    .maybeSingle();

  const storeId = (cust?.store_id as string | null) ?? null;
  if (!storeId) return null;

  return { userId: user.id, customerId, storeId, email: user.email };
}

/**
 * Plan B Step 1: 가격 위변조 검증 + 재고 사전 검증 + orderNo 발급
 */
export async function prepareOrderAction(params: {
  items: FpOrderItem[];
  finalAmount: number;
}): Promise<ApiResponse<{ orderNo: string; amount: number; storeId: string }>> {
  const authInfo = await getAuthedCustomerInfo();
  if (!authInfo) return { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } };

  const admin = createAdminClient();

  // ── 가격 위변조 + 재고 검증 ─────────────────────────────────
  const itemsWithRef = params.items.filter((i) => i.refStoreItemId);
  if (itemsWithRef.length > 0) {
    const { data: liveItems } = await admin
      .from("v_store_inventory_item")
      .select("store_item_id,effective_sale_price,sale_price,is_in_stock,available_quantity")
      .in(
        "store_item_id",
        itemsWithRef.map((i) => i.refStoreItemId!)
      );

    const liveMap = new Map((liveItems ?? []).map((r) => [r.store_item_id, r]));

    for (const item of itemsWithRef) {
      const live = liveMap.get(item.refStoreItemId!);
      if (!live) continue;

      if (live.is_in_stock === false) {
        return { error: { code: "OUT_OF_STOCK", message: `품절된 상품입니다: ${item.name}` } };
      }
      if ((live.available_quantity ?? 0) < item.qty) {
        return { error: { code: "OUT_OF_STOCK", message: `재고 부족: ${item.name}` } };
      }

      const livePrice = live.effective_sale_price ?? live.sale_price;
      if (livePrice != null && Math.abs(item.price - livePrice) > 1) {
        return {
          error: {
            code: "PRICE_MISMATCH",
            message: `가격이 변경된 상품이 있습니다: ${item.name}. 장바구니를 새로고침해 주세요.`,
          },
        };
      }
    }
  }

  // 재고 재검증 (validateStock)
  const stockItems = itemsWithRef.map((i) => ({
    storeItemId: i.refStoreItemId!,
    storeId: authInfo.storeId,
    qty: i.qty,
  }));
  if (stockItems.length > 0) {
    const { valid, outOfStock } = await validateStock(stockItems);
    if (!valid) {
      return {
        error: {
          code: "OUT_OF_STOCK",
          message: `품절된 상품이 있습니다: ${outOfStock.join(", ")}`,
        },
      };
    }
  }

  const orderNo = `FPA-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return { data: { orderNo, amount: params.finalAmount, storeId: authInfo.storeId } };
}

/**
 * Plan B Step 2: Toss 결제 승인 후 주문 생성 + 재고 차감 원자적 처리
 */
export async function confirmAndCreateOrderAction(params: {
  paymentKey: string;
  orderNo: string;
  amount: number;
  orderPayload: FpOrderPayload;
}): Promise<ApiResponse<{ orderId: string }>> {
  const authInfo = await getAuthedCustomerInfo();
  if (!authInfo) return { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } };

  const { paymentKey, orderNo, amount, orderPayload } = params;

  // ── Step 1: Toss 서버 결제 승인 ──────────────────────────
  let confirmedPaymentKey: string;
  let tossApprovedAt: string;
  try {
    const tossRes = await confirmTossPayment({ paymentKey, orderId: orderNo, amount });
    confirmedPaymentKey = tossRes.paymentKey;
    tossApprovedAt = tossRes.approvedAt;
  } catch (err) {
    return {
      error: {
        code: "PAYMENT_CONFIRM_FAILED",
        message: err instanceof Error ? err.message : "결제 승인에 실패했습니다.",
      },
    };
  }

  // ── Steps 2~7: DB 처리 (실패 시 Toss 결제 취소) ──────────
  try {
    // refStoreItemId 있는 항목만 재고/주문 처리 대상
    const stockItems = orderPayload.items
      .filter((i) => i.refStoreItemId)
      .map((i) => ({
        storeItemId: i.refStoreItemId!,
        storeId: orderPayload.storeId,
        qty: i.qty,
      }));

    // Step 2: 재고 재확인
    if (stockItems.length > 0) {
      const { valid, outOfStock } = await validateStock(stockItems);
      if (!valid) {
        throw Object.assign(new Error(`품절 상품: ${outOfStock.join(", ")}`), {
          code: "OUT_OF_STOCK",
        });
      }
    }

    // Step 3: order INSERT (customer.store_id 사용)
    const orderRes = await createOrder({
      customerId: authInfo.customerId,
      storeId: orderPayload.storeId,
      originTotalPrice: orderPayload.subtotal,
      discountedTotalPrice: orderPayload.subtotal - orderPayload.couponDiscount,
      deliveryFee: orderPayload.shipping,
      finalPayable: amount,
      requests: orderPayload.addressFull ?? undefined,
      orderNo,
      status: "PAID",
    });
    if (orderRes.error || !orderRes.data) {
      throw Object.assign(new Error(orderRes.error?.message ?? "주문 생성 실패"), {
        code: "ORDER_CREATE_FAILED",
      });
    }
    const orderId = orderRes.data.order_id;

    // Step 4: order_item INSERT — refStoreItemId 있는 항목만
    const orderItemsToInsert = orderPayload.items
      .filter((i) => i.refStoreItemId)
      .map((i) => ({
        storeItemId: i.refStoreItemId!,
        qty: i.qty,
        unitPrice: i.price,
      }));

    if (orderItemsToInsert.length > 0) {
      const itemRes = await createOrderItems(orderId, orderItemsToInsert);
      if (itemRes.error) {
        throw Object.assign(new Error(itemRes.error.message ?? "주문 상세 생성 실패"), {
          code: "ORDER_ITEMS_FAILED",
        });
      }
    }

    // Step 5: payment INSERT
    const paymentRes = await createPayment({
      orderId,
      pgTxId: confirmedPaymentKey,
      paidAmount: amount,
      netPaidAmount: amount - orderPayload.couponDiscount,
      pointsUsed: orderPayload.pointsUsed,
      deliveryFee: orderPayload.shipping,
      paymentMethod: orderPayload.paymentMethod,
      status: "CAPTURED",
      approvedAt: tossApprovedAt,
    });
    if (paymentRes.error) {
      throw Object.assign(new Error(paymentRes.error.message ?? "결제 기록 생성 실패"), {
        code: "PAYMENT_RECORD_FAILED",
      });
    }

    // Step 6: inventory 차감
    if (stockItems.length > 0) {
      await decreaseInventory(stockItems);
    }

    // Step 7: fp_order INSERT + fp_cart_item 비우기 + 쿠폰 사용 처리
    const supabaseClient = await createClient();
    const admin = createAdminClient();

    const fpOrderPromise = supabaseClient.from("fp_order").insert({
      user_id: authInfo.userId,
      ref_order_id: orderId,
      subtotal: orderPayload.subtotal,
      shipping: orderPayload.shipping,
      discount: orderPayload.couponDiscount,
      total: amount,
      payment_method: orderPayload.paymentMethod,
      payment_key: confirmedPaymentKey,
      address_name: orderPayload.addressName ?? null,
      address_phone: orderPayload.addressPhone ?? null,
      address_full: orderPayload.addressFull ?? null,
      delivery_window: null,
      status: "confirmed",
    });

    const clearCartPromise = supabaseClient
      .from("fp_cart_item")
      .delete()
      .eq("user_id", authInfo.userId);

    // 쿠폰 사용 처리 (issued_status → USED)
    const couponPromise = orderPayload.couponIssuanceId
      ? admin
          .from("coupon_issurance")
          .update({ issued_status: "USED", modified_at: new Date().toISOString() })
          .eq("issuance_id", orderPayload.couponIssuanceId)
          .eq("issued_status", "ACTIVE")
      : Promise.resolve();

    await Promise.all([fpOrderPromise, clearCartPromise, couponPromise]);

    return { data: { orderId } };
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
        customerId: authInfo.customerId,
        paymentKey: confirmedPaymentKey!,
        paymentAmount: amount,
        errorType: "DB_FAILURE",
        errorMessage,
        refundStatus: "SUCCESS",
      });
    } catch (cancelErr) {
      console.error("[CRITICAL] Toss 결제 취소 실패. 수동 환불 필요:", {
        orderNo,
        paymentKey: confirmedPaymentKey,
        amount,
        originalError: errorMessage,
        cancelError: cancelErr instanceof Error ? cancelErr.message : cancelErr,
      });
      await logPaymentError({
        orderNo,
        customerId: authInfo.customerId,
        paymentKey: confirmedPaymentKey!,
        paymentAmount: amount,
        errorType: "REFUND_FAILURE",
        errorMessage: `원인: ${errorMessage} / 취소오류: ${cancelErr instanceof Error ? cancelErr.message : "알 수 없음"}`,
        refundStatus: "FAILED",
      });
    }

    return {
      error: {
        code: errorCode,
        message:
          errorCode === "OUT_OF_STOCK"
            ? `재고 부족으로 결제가 취소되었습니다. (${errorMessage})`
            : "주문 처리 중 오류가 발생했습니다. 결제가 취소되었습니다.",
      },
    };
  }
}
