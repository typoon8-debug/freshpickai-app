"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export interface OrderItem {
  orderDetailId: string;
  storeItemId: string;
  itemName: string;
  itemThumbnail: string | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  status: string;
}

export interface OrderTrackingStep {
  step: number;
  label: string;
  status: "completed" | "current" | "pending";
  completedAt: string | null;
}

export interface OrderWithDetails {
  orderId: string;
  fpOrderId: string | null;
  orderNo: string;
  storeName: string;
  storeId: string;
  status: string;
  orderedAt: string;
  finalPayable: number;
  requests: string | null;
  items: OrderItem[];
  tracking: OrderTrackingStep[];
  isCanceled: boolean;
  isDelivered: boolean;
}

async function getCustomerId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("fp_user_profile")
    .select("ref_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.ref_customer_id) return profile.ref_customer_id as string;

  const { data: customer } = await admin
    .from("customer")
    .select("customer_id")
    .eq("email", user.email)
    .maybeSingle();
  return (customer?.customer_id as string) ?? null;
}

function calcTracking(params: {
  orderStatus: string;
  orderedAt: string;
  paidAt: string | null;
  pickingCompletedAt: string | null;
  packingStatus: string | null;
  packingCompletedAt: string | null;
  dispatchedAt: string | null;
  shipmentEventOut: string | null;
  shipmentEventArrived: string | null;
}): { steps: OrderTrackingStep[]; isCanceled: boolean; isDelivered: boolean } {
  const {
    orderStatus,
    orderedAt,
    paidAt,
    pickingCompletedAt,
    packingStatus,
    packingCompletedAt,
    dispatchedAt,
    shipmentEventOut,
    shipmentEventArrived,
  } = params;

  const isCanceled = orderStatus === "CANCELED" || orderStatus === "REJECTED_BY_STORE";
  const isDelivered = !!shipmentEventArrived || orderStatus === "DELIVERED";

  const LABELS = ["주문접수", "상품준비", "포장완료", "배송요청", "배송출발", "배송완료"];
  const timestamps = [
    paidAt ?? orderedAt,
    pickingCompletedAt,
    packingStatus === "COMPLETED" ? (packingCompletedAt ?? null) : null,
    dispatchedAt,
    shipmentEventOut,
    shipmentEventArrived,
  ];

  let lastCompleted = 0;
  timestamps.forEach((t, i) => {
    if (t) lastCompleted = i + 1;
  });

  const steps: OrderTrackingStep[] = LABELS.map((label, i) => {
    const idx = i + 1;
    let status: OrderTrackingStep["status"] = "pending";
    if (idx < lastCompleted) status = "completed";
    else if (idx === lastCompleted) status = isCanceled ? "pending" : "current";
    if (timestamps[i]) status = idx === lastCompleted && !isCanceled ? "current" : "completed";
    return { step: idx, label, status, completedAt: timestamps[i] ?? null };
  });

  return { steps, isCanceled, isDelivered };
}

/** 주문 목록 + 상품 상세 + 배송 추적 */
export async function getOrdersWithDetails(): Promise<OrderWithDetails[]> {
  const customerId = await getCustomerId();
  if (!customerId) return [];

  const admin = createAdminClient();

  // 1. order 조회 (customer_id 기준)
  const { data: orders } = await admin
    .from("order")
    .select("order_id, order_no, status, ordered_at, paid_at, final_payable, store_id, requests")
    .eq("customer_id", customerId)
    .order("ordered_at", { ascending: false })
    .limit(50);

  if (!orders || orders.length === 0) {
    // fp_order fallback (ref_order_id 없는 경우)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: fpOrders } = await admin
      .from("fp_order")
      .select("fp_order_id, ref_order_id, subtotal, total, status, address_name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    return (fpOrders ?? []).map((fp) => ({
      orderId: (fp.ref_order_id as string) ?? (fp.fp_order_id as string),
      fpOrderId: fp.fp_order_id as string,
      orderNo: ((fp.ref_order_id as string) ?? (fp.fp_order_id as string))
        .slice(0, 8)
        .toUpperCase(),
      storeName: (fp.address_name as string) ?? "프레시픽",
      storeId: "",
      status: (fp.status as string).toUpperCase(),
      orderedAt: fp.created_at as string,
      finalPayable: fp.total as number,
      requests: null,
      items: [],
      tracking: [],
      isCanceled: fp.status === "cancelled",
      isDelivered: fp.status === "delivered",
    }));
  }

  const orderIds = orders.map((o) => o.order_id as string);
  const storeIds = [...new Set(orders.map((o) => o.store_id as string))];

  // 2. order_item 배치 조회
  const { data: orderItems } = await admin
    .from("order_item")
    .select("order_detail_id, order_id, store_item_id, qty, unit_price, line_total, status")
    .in("order_id", orderIds);

  // 3. store_item 배치 조회 (item_name)
  const storeItemIds = [...new Set((orderItems ?? []).map((i) => i.store_item_id as string))];
  const { data: storeItems } = await admin
    .from("store_item")
    .select("store_item_id, item_name, sale_price")
    .in("store_item_id", storeItemIds);

  const storeItemMap = new Map((storeItems ?? []).map((si) => [si.store_item_id, si]));

  // 4. store 이름 배치 조회
  const { data: stores } = await admin
    .from("store")
    .select("store_id, name")
    .in("store_id", storeIds);
  const storeNameMap = new Map((stores ?? []).map((s) => [s.store_id, s.name]));

  // 5. 배송 추적 정보 (병렬 조회)
  const [pickingRes, packingRes, dispatchRes, shipmentRes] = await Promise.all([
    admin.from("picking_task").select("order_id, completed_at").in("order_id", orderIds),
    admin.from("packing_task").select("order_id, status, completed_at").in("order_id", orderIds),
    admin
      .from("dispatch_request")
      .select("order_id, requested_at, status")
      .in("order_id", orderIds),
    admin.from("shipment").select("shipment_id, order_id, status").in("order_id", orderIds),
  ]);

  const shipmentIds = (shipmentRes.data ?? []).map((s) => s.shipment_id as string);
  const { data: shipmentEvents } =
    shipmentIds.length > 0
      ? await admin
          .from("shipment_event")
          .select("shipment_id, event_code, created_at")
          .in("shipment_id", shipmentIds)
          .in("event_code", ["OUT", "PICKED_UP", "ASSIGNED", "ARRIVED"])
      : { data: [] };

  // 추적 데이터 인덱스
  const pickingMap = new Map(
    (pickingRes.data ?? []).map((p) => [p.order_id as string, p.completed_at as string | null])
  );
  const packingMap = new Map(
    (packingRes.data ?? []).map((p) => [
      p.order_id as string,
      { status: p.status as string, completedAt: p.completed_at as string | null },
    ])
  );
  const dispatchMap = new Map(
    (dispatchRes.data ?? []).map((d) => [d.order_id as string, d.requested_at as string])
  );
  const shipmentOrderMap = new Map(
    (shipmentRes.data ?? []).map((s) => [s.order_id as string, s.shipment_id as string])
  );
  const outEventMap = new Map<string, string>(); // shipmentId → created_at
  const arrivedEventMap = new Map<string, string>();
  (shipmentEvents ?? []).forEach((e) => {
    const sid = e.shipment_id as string;
    const code = e.event_code as string;
    const at = e.created_at as string;
    if (code === "OUT" || code === "PICKED_UP" || code === "ASSIGNED") {
      if (!outEventMap.has(sid)) outEventMap.set(sid, at);
    }
    if (code === "ARRIVED") arrivedEventMap.set(sid, at);
  });

  // 주문별 items 그룹핑
  const itemsByOrder = new Map<string, OrderItem[]>();
  (orderItems ?? []).forEach((item) => {
    const oid = item.order_id as string;
    const si = storeItemMap.get(item.store_item_id as string);
    const orderItem: OrderItem = {
      orderDetailId: item.order_detail_id as string,
      storeItemId: item.store_item_id as string,
      itemName: si?.item_name ?? "상품",
      itemThumbnail: null,
      qty: item.qty as number,
      unitPrice: item.unit_price as number,
      lineTotal: item.line_total as number,
      status: item.status as string,
    };
    const arr = itemsByOrder.get(oid) ?? [];
    arr.push(orderItem);
    itemsByOrder.set(oid, arr);
  });

  return orders.map((o) => {
    const oid = o.order_id as string;
    const sid = shipmentOrderMap.get(oid);
    const packing = packingMap.get(oid);

    const { steps, isCanceled, isDelivered } = calcTracking({
      orderStatus: o.status as string,
      orderedAt: o.ordered_at as string,
      paidAt: o.paid_at as string | null,
      pickingCompletedAt: pickingMap.get(oid) ?? null,
      packingStatus: packing?.status ?? null,
      packingCompletedAt: packing?.completedAt ?? null,
      dispatchedAt: dispatchMap.get(oid) ?? null,
      shipmentEventOut: sid ? (outEventMap.get(sid) ?? null) : null,
      shipmentEventArrived: sid ? (arrivedEventMap.get(sid) ?? null) : null,
    });

    return {
      orderId: oid,
      fpOrderId: null,
      orderNo: o.order_no as string,
      storeName: storeNameMap.get(o.store_id as string) ?? "스토어",
      storeId: o.store_id as string,
      status: isDelivered ? "DELIVERED" : (o.status as string),
      orderedAt: o.ordered_at as string,
      finalPayable: o.final_payable as number,
      requests: o.requests as string | null,
      items: itemsByOrder.get(oid) ?? [],
      tracking: steps,
      isCanceled,
      isDelivered,
    };
  });
}
