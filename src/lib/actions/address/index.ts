"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export interface FpAddress {
  addressId: string;
  addressName: string;
  address: string;
  addrDetail?: string;
  zipcode?: string;
  receiverName?: string;
  receiverPhone?: string;
  message: string;
  status: string;
}

async function getCustomerId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = createAdminClient();

  // fp_user_profile에서 ref_customer_id 확인
  const { data: profile } = await admin
    .from("fp_user_profile")
    .select("ref_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.ref_customer_id) return profile.ref_customer_id as string;

  // customer 테이블에서 이메일로 조회
  const { data: customer } = await admin
    .from("customer")
    .select("customer_id")
    .eq("email", user.email)
    .maybeSingle();

  return (customer?.customer_id as string) ?? null;
}

function mapRow(row: Record<string, unknown>): FpAddress {
  return {
    addressId: row.address_id as string,
    addressName: row.address_name as string,
    address: row.address as string,
    addrDetail: (row.addr_detail as string | null) ?? undefined,
    zipcode: (row.zipcode as string | null) ?? undefined,
    receiverName: (row.receiver_name as string | null) ?? undefined,
    receiverPhone: (row.receiver_phone as string | null) ?? undefined,
    message: (row.message as string) ?? "",
    status: row.status as string,
  };
}

/** 기본 배송지 조회 (첫 번째 ACTIVE 주소) */
export async function getDefaultAddress(): Promise<FpAddress | null> {
  const customerId = await getCustomerId();
  if (!customerId) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("address")
    .select("*")
    .eq("customer_id", customerId)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data ? mapRow(data as Record<string, unknown>) : null;
}

/** 배송지 목록 조회 */
export async function getAddresses(): Promise<FpAddress[]> {
  const customerId = await getCustomerId();
  if (!customerId) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("address")
    .select("*")
    .eq("customer_id", customerId)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

/** 배송지 등록 */
export async function createAddress(params: {
  addressName: string;
  address: string;
  addrDetail?: string;
  zipcode?: string;
  receiverName?: string;
  receiverPhone?: string;
  message?: string;
}): Promise<{ data?: FpAddress; error?: string }> {
  const customerId = await getCustomerId();
  if (!customerId) return { error: "로그인이 필요합니다." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("address")
    .insert({
      customer_id: customerId,
      address_name: params.addressName,
      address: params.address,
      addr_detail: params.addrDetail ?? null,
      zipcode: params.zipcode ?? null,
      receiver_name: params.receiverName ?? null,
      receiver_phone: params.receiverPhone ?? null,
      message: params.message ?? "",
      status: "ACTIVE",
    })
    .select("*")
    .single();

  if (error) return { error: error.message };
  return { data: mapRow(data as Record<string, unknown>) };
}

/** 배송지 수정 */
export async function updateAddress(
  addressId: string,
  params: Partial<{
    addressName: string;
    address: string;
    addrDetail: string;
    zipcode: string;
    receiverName: string;
    receiverPhone: string;
    message: string;
  }>
): Promise<{ error?: string }> {
  const customerId = await getCustomerId();
  if (!customerId) return { error: "로그인이 필요합니다." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("address")
    .update({
      ...(params.addressName && { address_name: params.addressName }),
      ...(params.address && { address: params.address }),
      ...(params.addrDetail !== undefined && { addr_detail: params.addrDetail }),
      ...(params.zipcode !== undefined && { zipcode: params.zipcode }),
      ...(params.receiverName !== undefined && { receiver_name: params.receiverName }),
      ...(params.receiverPhone !== undefined && { receiver_phone: params.receiverPhone }),
      ...(params.message !== undefined && { message: params.message }),
      modified_at: new Date().toISOString(),
    })
    .eq("address_id", addressId)
    .eq("customer_id", customerId);

  return error ? { error: error.message } : {};
}
