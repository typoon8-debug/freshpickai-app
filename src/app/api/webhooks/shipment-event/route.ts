import { createAdminClient } from "@/lib/supabase/server";
import { sendDeliveryNotification } from "@/lib/actions/push/send";

// sellerbox-app shipment_event event_code → 알림 메시지 매핑
const EVENT_MESSAGES: Record<string, { title: string; body: string }> = {
  ASSIGNED: {
    title: "배달기사 배정 🛵",
    body: "배달기사가 배정됐어요. 곧 출발 예정이에요!",
  },
  OUT: {
    title: "지금 배달 중! 🛵💨",
    body: "배달기사가 출발했어요!",
  },
  ARRIVED: {
    title: "배달 완료 🎉",
    body: "도착했어요! 맛있게 드세요 🍽",
  },
  FAILED: {
    title: "배달 실패 ⚠️",
    body: "배달에 문제가 생겼어요. 주문 내역을 확인해주세요.",
  },
};

// sellerbox order.status → fp_order.status 매핑
const ORDER_STATUS_MAP: Record<string, string> = {
  PAID: "confirmed",
  PACKING: "confirmed",
  DISPATCHED: "shipping",
  DELIVERING: "shipping",
  DELIVERED: "delivered",
};

export async function POST(req: Request) {
  // Webhook Secret 인증
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.DELIVERY_WEBHOOK_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    event_code?: string;
    order_id?: string;
    shipment_id?: string;
    order_status?: string;
    eta_min?: number;
    eta_max?: number;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event_code, order_id, order_status, eta_min, eta_max } = body;

  if (!order_id) {
    return Response.json({ error: "order_id required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // sellerbox order_id → fp_order 매핑
  const { data: fpOrder } = await admin
    .from("fp_order")
    .select("fp_order_id, user_id, status")
    .eq("ref_order_id", order_id)
    .maybeSingle();

  if (!fpOrder) {
    // freshpickai 주문과 연결된 fp_order 없음 — 정상 케이스
    return Response.json({ ok: true, skipped: true });
  }

  // fp_order 상태 업데이트 (order_status 이벤트)
  if (order_status && ORDER_STATUS_MAP[order_status]) {
    await admin
      .from("fp_order")
      .update({ status: ORDER_STATUS_MAP[order_status], modified_at: new Date().toISOString() })
      .eq("fp_order_id", fpOrder.fp_order_id);
  }

  // shipment_event 기반 FCM 알림
  if (!event_code || !EVENT_MESSAGES[event_code]) {
    return Response.json({ ok: true });
  }

  // 사용자 FCM 토큰 + 알림 설정 조회
  const [{ data: profile }, { data: settings }] = await Promise.all([
    admin.from("fp_user_profile").select("fcm_token").eq("user_id", fpOrder.user_id).single(),
    admin
      .from("fp_user_notification_settings")
      .select("delivery_notify")
      .eq("user_id", fpOrder.user_id)
      .maybeSingle(),
  ]);

  if (!profile?.fcm_token) {
    return Response.json({ ok: true, skipped: "no_fcm_token" });
  }

  if (settings?.delivery_notify === false) {
    return Response.json({ ok: true, skipped: "notification_disabled" });
  }

  const msg = EVENT_MESSAGES[event_code];
  let body_text = msg.body;

  // OUT 이벤트에 ETA 정보 추가
  if (event_code === "OUT" && eta_min && eta_max) {
    body_text = `배달기사가 출발했어요! 약 ${eta_min}~${eta_max}분 후 도착 예정이에요`;
  }

  try {
    await sendDeliveryNotification({
      token: profile.fcm_token,
      title: msg.title,
      body: body_text,
      fpOrderId: fpOrder.fp_order_id,
    });
  } catch {
    // FCM 발송 실패는 내부 오류로 처리 (재시도는 sellerbox-app에서)
    return Response.json({ ok: false, error: "FCM_FAILED" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
