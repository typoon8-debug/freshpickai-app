"use server";

// Phase 0 stub — Phase 4에서 Plan B 아키텍처로 완전 구현
export interface OrderPayload {
  cardId?: number;
  items: { id: string; qty: number; price: number }[];
  total: number;
  addressId?: string;
}

export async function prepareOrderAction(
  _payload: OrderPayload
): Promise<{ orderId?: string; error?: string }> {
  return { error: "NOT_IMPLEMENTED" };
}

export async function confirmAndCreateOrderAction(
  _orderId: string,
  _paymentKey: string,
  _amount: number
): Promise<{ success?: boolean; error?: string }> {
  return { error: "NOT_IMPLEMENTED" };
}
