import { createAdminClient } from "@/lib/supabase/server";

type PaymentStatus = "AUTH" | "CAPTURED" | "CANCELLED" | "FAILED";

interface ApiResponse<T> {
  data?: T;
  error?: { code: string; message: string };
}

interface CreatePaymentParams {
  orderId: string;
  pgTxId: string;
  paidAmount: number;
  netPaidAmount: number;
  pointsUsed?: number;
  deliveryFee?: number;
  paymentMethod: string;
  status?: PaymentStatus;
  approvedAt?: string;
}

export async function createPayment(
  params: CreatePaymentParams
): Promise<ApiResponse<{ payment_id: string }>> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("payment")
    .insert({
      order_id: params.orderId,
      pg_tx_id: params.pgTxId,
      paid_amount: params.paidAmount,
      net_paid_amount: params.netPaidAmount,
      points_used: params.pointsUsed ?? 0,
      delivery_fee: params.deliveryFee ?? 0,
      payment_method: params.paymentMethod,
      status: params.status ?? "AUTH",
      approved_at: params.approvedAt ?? null,
    })
    .select("payment_id")
    .single();

  if (error) return { error: { code: "CREATE_ERROR", message: error.message } };
  return { data: data as { payment_id: string } };
}

interface LogPaymentErrorParams {
  orderNo: string;
  customerId: string;
  paymentKey: string;
  paymentAmount: number;
  errorType: string;
  errorMessage: string;
  refundStatus: "PENDING" | "SUCCESS" | "FAILED";
}

export async function logPaymentError(params: LogPaymentErrorParams): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("payment_error_log").insert({
      order_no: params.orderNo,
      customer_id: params.customerId,
      payment_key: params.paymentKey,
      payment_amount: params.paymentAmount,
      error_type: params.errorType,
      error_message: params.errorMessage,
      refund_status: params.refundStatus,
      refund_attempted_at: params.refundStatus !== "PENDING" ? new Date().toISOString() : null,
    });
  } catch (e) {
    console.error("[CRITICAL] payment_error_log 기록 실패:", e);
  }
}
