import { createAdminClient } from "@/lib/supabase/server";

type OrderStatus =
  | "CREATED"
  | "PAID"
  | "PACKING"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELED"
  | "REJECTED_BY_STORE";

interface CreateOrderParams {
  customerId: string;
  storeId: string;
  addressId?: string | null;
  originTotalPrice: number;
  discountedTotalPrice: number;
  deliveryFee: number;
  finalPayable: number;
  requests?: string;
  orderNo: string;
  status?: OrderStatus;
}

interface ApiResponse<T> {
  data?: T;
  error?: { code: string; message: string };
}

export async function createOrder(
  params: CreateOrderParams
): Promise<ApiResponse<{ order_id: string; order_no: string }>> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("order")
    .insert({
      store_id: params.storeId,
      customer_id: params.customerId,
      address_id: params.addressId ?? null,
      order_no: params.orderNo,
      ordered_at: new Date().toISOString(),
      origin_total_price: params.originTotalPrice,
      discounted_total_price: params.discountedTotalPrice,
      delivery_fee: params.deliveryFee,
      delivery_price: params.deliveryFee,
      order_price: params.discountedTotalPrice,
      final_payable: params.finalPayable,
      requests: params.requests ?? null,
      delivery_method: "DELIVERY",
      points_earned: 0,
      points_redeemed: 0,
      points_value_redeemed: 0,
      status: params.status ?? "CREATED",
    })
    .select("order_id, order_no")
    .single();

  if (error) return { error: { code: "CREATE_ERROR", message: error.message } };
  return { data: data as { order_id: string; order_no: string } };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ApiResponse<null>> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("order")
    .update({ status, modified_at: new Date().toISOString() })
    .eq("order_id", orderId);
  if (error) return { error: { code: "UPDATE_ERROR", message: error.message } };
  return { data: null };
}

interface OrderItemInsert {
  storeItemId: string;
  qty: number;
  unitPrice: number;
}

export async function createOrderItems(
  orderId: string,
  items: OrderItemInsert[]
): Promise<ApiResponse<null>> {
  const admin = createAdminClient();
  const { error } = await admin.from("order_item").insert(
    items.map((i) => ({
      order_id: orderId,
      store_item_id: i.storeItemId,
      qty: i.qty,
      unit_price: i.unitPrice,
      line_total: i.qty * i.unitPrice,
      status: "ORDERED",
    }))
  );
  if (error) return { error: { code: "CREATE_ERROR", message: error.message } };
  return { data: null };
}
