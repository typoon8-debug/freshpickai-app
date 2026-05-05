export function getTossClientKey(): string {
  const key = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_TOSS_CLIENT_KEY is not set");
  return key;
}

export function getTossSecretKey(): string {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) throw new Error("TOSS_SECRET_KEY is not set");
  return key;
}

export function getTossAuthHeader(): string {
  const secretKey = getTossSecretKey();
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

export interface TossConfirmResponse {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt: string;
}

export interface TossCancelInfo {
  cancelReason: string;
  canceledAt: string;
  cancelAmount: number;
  taxFreeAmount: number;
  refundableAmount: number;
}

export interface TossCancelResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  cancels: TossCancelInfo[];
}

export async function confirmTossPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossConfirmResponse> {
  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: getTossAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentKey: params.paymentKey,
      orderId: params.orderId,
      amount: params.amount,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "토스페이먼츠 결제 승인 실패");
  }

  return response.json() as Promise<TossConfirmResponse>;
}

/**
 * 토스페이먼츠 결제 취소 API
 * POST /v1/payments/{paymentKey}/cancel
 *
 * PG 결제 성공 후 DB 처리(주문 생성·재고 차감) 실패 시 호출.
 * cancelAmount 미지정 시 전액 취소.
 */
export async function cancelTossPayment(params: {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
}): Promise<TossCancelResponse> {
  const body: Record<string, unknown> = {
    cancelReason: params.cancelReason,
  };
  if (params.cancelAmount !== undefined) {
    body.cancelAmount = params.cancelAmount;
  }

  const response = await fetch(
    `https://api.tosspayments.com/v1/payments/${params.paymentKey}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: getTossAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "토스페이먼츠 결제 취소 실패");
  }

  return response.json() as Promise<TossCancelResponse>;
}
