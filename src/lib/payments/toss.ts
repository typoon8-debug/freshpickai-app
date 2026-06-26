// ─── 토스페이먼츠 Payment 객체 타입 ──────────────────────────────────────────
// freshpick-app lib/payments/toss.ts 와 동일 버전으로 동기화

export type TossPaymentStatus =
  | "READY"
  | "IN_PROGRESS"
  | "WAITING_FOR_DEPOSIT"
  | "DONE"
  | "CANCELED"
  | "PARTIAL_CANCELED"
  | "ABORTED"
  | "EXPIRED";

export type TossPaymentMethod =
  | "카드"
  | "가상계좌"
  | "간편결제"
  | "휴대폰"
  | "계좌이체"
  | "문화상품권"
  | "도서문화상품권"
  | "게임문화상품권";

export type TossCardAcquireStatus =
  | "READY"
  | "REQUESTED"
  | "COMPLETED"
  | "CANCEL_REQUESTED"
  | "CANCELED";

export interface TossCardInfo {
  amount: number;
  issuerCode: string;
  acquirerCode: string | null;
  number: string;
  installmentPlanMonths: number;
  approveNo: string;
  useCardPoint: boolean;
  cardType: "신용" | "체크" | "기프트" | "미확인";
  ownerType: "개인" | "법인" | "미확인";
  acquireStatus: TossCardAcquireStatus;
  isInterestFree: boolean;
  interestPayer: "BUYER" | "CARD_COMPANY" | "MERCHANT" | null;
}

export interface TossEasyPayInfo {
  provider: string;
  amount: number;
  discountAmount: number;
}

export interface TossVirtualAccountInfo {
  accountType: "일반" | "고정";
  accountNumber: string;
  bankCode: string;
  customerName: string;
  depositorName: string;
  dueDate: string;
  refundStatus: "NONE" | "PENDING" | "FAILED" | "PARTIAL_FAILED" | "COMPLETED";
  expired: boolean;
  settlementStatus: "INCOMPLETED" | "COMPLETED";
  refundReceiveAccount: {
    bankCode: string;
    accountNumber: string;
    holderName: string;
  } | null;
}

export interface TossFailureInfo {
  code: string;
  message: string;
}

/** 결제 취소 건 상세 (Payment.cancels 배열 항목) */
export interface TossCancelInfo {
  cancelAmount: number;
  cancelReason: string;
  taxFreeAmount: number;
  taxExemptionAmount: number;
  refundableAmount: number;
  cardDiscountAmount: number;
  transferDiscountAmount: number;
  easyPayDiscountAmount: number;
  canceledAt: string;
  transactionKey: string;
  receiptKey: string | null;
  cancelStatus: string;
  cancelRequestId: string | null;
}

/**
 * 토스페이먼츠 Payment 전체 객체
 * - 결제 승인 (/v1/payments/confirm) 응답
 * - 결제 취소 (/v1/payments/{key}/cancel) 응답
 * 두 API 모두 이 타입으로 응답
 */
export interface TossPaymentResponse {
  version: string;
  paymentKey: string;
  type: "NORMAL" | "BILLING" | "BRANDPAY";
  orderId: string;
  orderName: string;
  mId: string;
  currency: string;
  method: TossPaymentMethod | null;
  totalAmount: number;
  balanceAmount: number;
  status: TossPaymentStatus;
  requestedAt: string;
  approvedAt: string | null;
  useEscrow: boolean;
  lastTransactionKey: string | null;
  transactionKey: string | null;
  suppliedAmount: number;
  vat: number;
  cultureExpense: boolean;
  taxFreeAmount: number;
  taxExemptionAmount: number;
  cancels: TossCancelInfo[] | null;
  isPartialCancelable: boolean;
  card: TossCardInfo | null;
  virtualAccount: TossVirtualAccountInfo | null;
  secret: string | null;
  mobilePhone: {
    customerMobilePhone: string;
    settlementStatus: "INCOMPLETED" | "COMPLETED";
    receiptUrl: string;
  } | null;
  giftCertificate: {
    approveNo: string;
    settlementStatus: "INCOMPLETED" | "COMPLETED";
  } | null;
  transfer: {
    bankCode: string;
    settlementStatus: "INCOMPLETED" | "COMPLETED";
  } | null;
  receipt: { url: string } | null;
  checkout: { url: string } | null;
  easyPay: TossEasyPayInfo | null;
  easyPayAmount: number | null;
  easyPayDiscountAmount: number | null;
  country: string;
  failure: TossFailureInfo | null;
  discount: { amount: number } | null;
}

// ─── 하위 호환 타입 별칭 (기존 코드가 TossConfirmResponse를 import하는 경우 대비) ─
/** @deprecated TossPaymentResponse 사용 권장 */
export type TossConfirmResponse = TossPaymentResponse;
/** @deprecated TossPaymentResponse 사용 권장 */
export type TossCancelResponse = TossPaymentResponse;

// ─── 환경변수 헬퍼 ────────────────────────────────────────────────────────────

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

// ─── 결제 승인 ────────────────────────────────────────────────────────────────

export async function confirmTossPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossPaymentResponse> {
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
    throw new Error((err as TossFailureInfo).message ?? "토스페이먼츠 결제 승인 실패");
  }

  return response.json() as Promise<TossPaymentResponse>;
}

// ─── 결제 취소 ────────────────────────────────────────────────────────────────

/**
 * 토스페이먼츠 결제 취소 API (POST /v1/payments/{paymentKey}/cancel)
 *
 * - 15초 타임아웃 (PF-03)
 * - 멱등키(Idempotency-Key): 중복 취소 방지 (RC-01 보완)
 * - refundableAmount: 환불 가능 잔액 검증으로 안전한 취소 보장
 */
export async function cancelTossPayment(params: {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
  refundableAmount?: number;
  idempotencyKey?: string;
}): Promise<TossPaymentResponse> {
  const body: Record<string, unknown> = {
    cancelReason: params.cancelReason,
  };
  if (params.cancelAmount !== undefined) {
    body.cancelAmount = params.cancelAmount;
  }
  if (params.refundableAmount !== undefined) {
    body.refundableAmount = params.refundableAmount;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(
      `https://api.tosspayments.com/v1/payments/${params.paymentKey}/cancel`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: getTossAuthHeader(),
          "Content-Type": "application/json",
          "Idempotency-Key": params.idempotencyKey ?? `cancel-${params.paymentKey}-${Date.now()}`,
        },
        body: JSON.stringify(body),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as TossFailureInfo).message ?? "토스페이먼츠 결제 취소 실패");
    }

    return response.json() as Promise<TossPaymentResponse>;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("TOSS_TIMEOUT: 결제 취소 API 응답 시간 초과 (15초)");
    }
    throw err;
  }
}
