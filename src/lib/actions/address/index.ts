"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { geocodeKakao } from "@/lib/actions/geocode";

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
  geocodedAt?: string | null;
  lat?: number | null;
  lng?: number | null;
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
    geocodedAt: (row.geocoded_at as string | null) ?? null,
    lat: (row.lat as number | null) ?? null,
    lng: (row.lng as number | null) ?? null,
  };
}

/** 기본 배송지 조회 (DEFAULT → ACTIVE 순) */
export async function getDefaultAddress(): Promise<FpAddress | null> {
  const customerId = await getCustomerId();
  if (!customerId) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("address")
    .select("*")
    .eq("customer_id", customerId)
    .in("status", ["DEFAULT", "ACTIVE"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data ? mapRow(data as Record<string, unknown>) : null;
}

/** 배송지 목록 조회 (ACTIVE + DEFAULT) */
export async function getAddresses(): Promise<FpAddress[]> {
  const customerId = await getCustomerId();
  if (!customerId) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("address")
    .select("*")
    .eq("customer_id", customerId)
    .in("status", ["ACTIVE", "DEFAULT"])
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

/** 배송지 등록 (자동 지오코딩 포함) */
export async function createAddress(params: {
  addressName: string;
  address: string;
  addrDetail?: string;
  zipcode?: string;
  receiverName?: string;
  receiverPhone?: string;
  message?: string;
  isDefault?: boolean;
}): Promise<{ data?: FpAddress; error?: string }> {
  const customerId = await getCustomerId();
  if (!customerId) return { error: "로그인이 필요합니다." };

  const admin = createAdminClient();

  // isDefault=true면 기존 DEFAULT를 ACTIVE로
  if (params.isDefault) {
    await admin
      .from("address")
      .update({ status: "ACTIVE" })
      .eq("customer_id", customerId)
      .eq("status", "DEFAULT");
  }

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
      status: params.isDefault ? "DEFAULT" : "ACTIVE",
    })
    .select("*")
    .single();

  if (error) return { error: error.message };

  // 자동 지오코딩 (백그라운드, 실패해도 무시)
  const insertedId = (data as Record<string, unknown>).address_id as string;
  const fullAddress = [params.address, params.addrDetail].filter(Boolean).join(" ");
  const geo = await geocodeKakao(fullAddress);
  if (geo) {
    await admin
      .from("address")
      .update({ lat: geo.lat, lng: geo.lng, geocoded_at: new Date().toISOString() })
      .eq("address_id", insertedId);
  }

  return { data: mapRow(data as Record<string, unknown>) };
}

/** 배송지 수정 (주소 변경 시 좌표 재등록) */
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

  const updatePayload: Record<string, unknown> = {
    modified_at: new Date().toISOString(),
  };
  if (params.addressName) updatePayload.address_name = params.addressName;
  if (params.address) updatePayload.address = params.address;
  if (params.addrDetail !== undefined) updatePayload.addr_detail = params.addrDetail;
  if (params.zipcode !== undefined) updatePayload.zipcode = params.zipcode;
  if (params.receiverName !== undefined) updatePayload.receiver_name = params.receiverName;
  if (params.receiverPhone !== undefined) updatePayload.receiver_phone = params.receiverPhone;
  if (params.message !== undefined) updatePayload.message = params.message;

  // 주소가 바뀌면 좌표 초기화 후 재등록
  if (params.address) {
    updatePayload.geocoded_at = null;
    updatePayload.lat = null;
    updatePayload.lng = null;
  }

  const { error } = await admin
    .from("address")
    .update(updatePayload)
    .eq("address_id", addressId)
    .eq("customer_id", customerId);

  if (error) return { error: error.message };

  // 주소 변경 시 재지오코딩
  if (params.address) {
    const fullAddress = [params.address, params.addrDetail].filter(Boolean).join(" ");
    const geo = await geocodeKakao(fullAddress);
    if (geo) {
      await admin
        .from("address")
        .update({ lat: geo.lat, lng: geo.lng, geocoded_at: new Date().toISOString() })
        .eq("address_id", addressId);
    }
  }

  return {};
}

/** 배송지 삭제 (소프트: status → INACTIVE) */
export async function deleteAddress(addressId: string): Promise<{ error?: string }> {
  const customerId = await getCustomerId();
  if (!customerId) return { error: "로그인이 필요합니다." };

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("address")
    .select("status")
    .eq("address_id", addressId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (!existing) return { error: "주소를 찾을 수 없습니다." };
  if ((existing as Record<string, unknown>).status === "DEFAULT")
    return { error: "기본 배송지는 삭제할 수 없습니다." };

  const { error } = await admin
    .from("address")
    .update({ status: "INACTIVE", modified_at: new Date().toISOString() })
    .eq("address_id", addressId);

  return error ? { error: error.message } : {};
}

/** 기본 배송지 설정 (기존 DEFAULT → ACTIVE, 대상 → DEFAULT) */
export async function setDefaultAddress(addressId: string): Promise<{ error?: string }> {
  const customerId = await getCustomerId();
  if (!customerId) return { error: "로그인이 필요합니다." };

  const admin = createAdminClient();

  await admin
    .from("address")
    .update({ status: "ACTIVE", modified_at: new Date().toISOString() })
    .eq("customer_id", customerId)
    .eq("status", "DEFAULT");

  const { error } = await admin
    .from("address")
    .update({ status: "DEFAULT", modified_at: new Date().toISOString() })
    .eq("address_id", addressId)
    .eq("customer_id", customerId);

  return error ? { error: error.message } : {};
}

/** 좌표 재등록 */
export async function regeocodeAddress(addressId: string): Promise<{ error?: string }> {
  const customerId = await getCustomerId();
  if (!customerId) return { error: "로그인이 필요합니다." };

  const admin = createAdminClient();

  const { data: addr } = await admin
    .from("address")
    .select("address, addr_detail")
    .eq("address_id", addressId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (!addr) return { error: "주소를 찾을 수 없습니다." };

  const row = addr as Record<string, unknown>;
  const fullAddress = [row.address, row.addr_detail].filter(Boolean).join(" ");
  const geo = await geocodeKakao(fullAddress);
  if (!geo) return { error: "좌표를 찾을 수 없습니다. 주소를 확인해주세요." };

  const { error } = await admin
    .from("address")
    .update({ lat: geo.lat, lng: geo.lng, geocoded_at: new Date().toISOString() })
    .eq("address_id", addressId);

  return error ? { error: error.message } : {};
}
