"use server";

import { createClient } from "@/lib/supabase/server";
import type { FpOrder } from "@/lib/types";

interface CreateFpOrderParams {
  userId: string;
  refOrderId?: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: NonNullable<FpOrder["paymentMethod"]>;
  paymentKey?: string;
  addressName?: string;
  addressPhone?: string;
  addressFull?: string;
  deliveryWindow?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: { code: string; message: string };
}

/** fp_order 레코드 생성 — 결제 완료 후 호출 */
export async function createFpOrder(
  params: CreateFpOrderParams
): Promise<ApiResponse<{ fpOrderId: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fp_order")
    .insert({
      user_id: params.userId,
      ref_order_id: params.refOrderId ?? null,
      subtotal: params.subtotal,
      shipping: params.shipping,
      discount: params.discount,
      total: params.total,
      payment_method: params.paymentMethod,
      payment_key: params.paymentKey ?? null,
      address_name: params.addressName ?? null,
      address_phone: params.addressPhone ?? null,
      address_full: params.addressFull ?? null,
      delivery_window: params.deliveryWindow ?? null,
      status: "confirmed",
    })
    .select("fp_order_id")
    .single();

  if (error) return { error: { code: "CREATE_ERROR", message: error.message } };
  return { data: { fpOrderId: (data as { fp_order_id: string }).fp_order_id } };
}
