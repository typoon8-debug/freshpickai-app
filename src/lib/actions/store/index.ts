"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export interface MyShop {
  storeId: string;
  storeName: string;
  storeAddress: string | null;
  storePhone: string | null;
  operationHours: string | null;
  storePicture: string | null;
  pointBalance: number;
  createdAt: string;
  status: string;
}

export interface NearbyStore {
  storeId: string;
  storeName: string;
  storeAddress: string | null;
  storePicture: string | null;
  distanceM: number | null;
  inRange: boolean;
  alreadyJoined: boolean;
}

async function resolveCustomerId(): Promise<{
  customerId: string | null;
  currentStoreId: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { customerId: null, currentStoreId: null };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("fp_user_profile")
    .select("ref_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = (profile?.ref_customer_id as string | null) ?? null;
  if (!customerId) {
    const { data: c } = await admin
      .from("customer")
      .select("customer_id")
      .eq("email", user.email)
      .maybeSingle();
    customerId = (c?.customer_id as string | null) ?? null;
  }

  if (!customerId) return { customerId: null, currentStoreId: null };

  const { data: cust } = await admin
    .from("customer")
    .select("store_id")
    .eq("customer_id", customerId)
    .maybeSingle();

  return { customerId, currentStoreId: (cust?.store_id as string | null) ?? null };
}

/** 내 가게 목록 (customer_shop + store JOIN) */
export async function getMyShops(): Promise<{ shops: MyShop[]; currentStoreId: string | null }> {
  const { customerId, currentStoreId } = await resolveCustomerId();
  if (!customerId) return { shops: [], currentStoreId: null };

  const admin = createAdminClient();
  const { data: shopRows } = await admin
    .from("customer_shop")
    .select("store_id, point_balance, status, created_at")
    .eq("customer_id", customerId)
    .eq("status", "ACTIVE");

  if (!shopRows || shopRows.length === 0) return { shops: [], currentStoreId };

  const storeIds = shopRows.map((s) => s.store_id as string);
  const { data: stores } = await admin
    .from("store")
    .select("store_id, name, address, phone, operation_hours, store_picture")
    .in("store_id", storeIds);

  const storeMap = new Map(
    (stores ?? []).map((s) => [
      s.store_id,
      {
        name: s.name,
        address: s.address,
        phone: s.phone,
        operation_hours: s.operation_hours,
        store_picture: s.store_picture,
      },
    ])
  );

  const shops: MyShop[] = shopRows.map((row) => {
    const info = storeMap.get(row.store_id as string);
    return {
      storeId: row.store_id as string,
      storeName: info?.name ?? "알 수 없는 가게",
      storeAddress: info?.address ?? null,
      storePhone: info?.phone ?? null,
      operationHours: info?.operation_hours ?? null,
      storePicture: info?.store_picture ?? null,
      pointBalance: (row.point_balance as number) ?? 0,
      createdAt: row.created_at as string,
      status: row.status as string,
    };
  });

  return { shops, currentStoreId };
}

/** 추가 가능한 주변 가게 목록 */
export async function getNearbyStores(): Promise<NearbyStore[]> {
  const { customerId } = await resolveCustomerId();
  if (!customerId) return [];

  const admin = createAdminClient();

  // 기본 배송지의 좌표 조회
  const { data: defaultAddr } = await admin
    .from("address")
    .select("lat, lng")
    .eq("customer_id", customerId)
    .in("status", ["DEFAULT", "ACTIVE"])
    .not("lat", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  // 이미 가입된 가게 ID
  const { data: myShops } = await admin
    .from("customer_shop")
    .select("store_id")
    .eq("customer_id", customerId)
    .eq("status", "ACTIVE");
  const joinedIds = new Set((myShops ?? []).map((s) => s.store_id as string));

  // 전체 가게 조회 (ACTIVE 상태)
  const { data: stores } = await admin
    .from("store")
    .select("store_id, name, address, store_picture, lat, lng, delivery_radius_m")
    .eq("status", "ACTIVE");

  if (!stores) return [];

  const userLat = defaultAddr?.lat as number | null;
  const userLng = defaultAddr?.lng as number | null;

  return stores
    .map((s) => {
      let distanceM: number | null = null;
      let inRange = true;

      if (userLat != null && userLng != null && s.lat != null && s.lng != null) {
        // Haversine 근사 거리 계산 (앱 레벨)
        const R = 6371000;
        const dLat = ((s.lat - userLat) * Math.PI) / 180;
        const dLng = ((s.lng - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((s.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        distanceM = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
        inRange = distanceM <= (s.delivery_radius_m ?? 3000);
      }

      return {
        storeId: s.store_id,
        storeName: s.name,
        storeAddress: s.address ?? null,
        storePicture: s.store_picture ?? null,
        distanceM,
        inRange,
        alreadyJoined: joinedIds.has(s.store_id),
      };
    })
    .sort((a, b) => (a.distanceM ?? 99999) - (b.distanceM ?? 99999));
}

/** 가게 추가 (customer_shop UPSERT) */
export async function addMyShop(storeId: string): Promise<{ error?: string }> {
  const { customerId } = await resolveCustomerId();
  if (!customerId) return { error: "로그인이 필요합니다." };

  const admin = createAdminClient();
  const { error } = await admin.from("customer_shop").upsert(
    {
      customer_id: customerId,
      store_id: storeId,
      status: "ACTIVE",
    },
    { onConflict: "customer_id,store_id" }
  );

  return error ? { error: error.message } : {};
}

/** 가게 해제 */
export async function deactivateMyShop(storeId: string): Promise<{ error?: string }> {
  const { customerId, currentStoreId } = await resolveCustomerId();
  if (!customerId) return { error: "로그인이 필요합니다." };
  if (currentStoreId === storeId) return { error: "현재 이용 중인 가게는 해제할 수 없습니다." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("customer_shop")
    .update({ status: "LEFT", modified_at: new Date().toISOString() })
    .eq("customer_id", customerId)
    .eq("store_id", storeId);

  return error ? { error: error.message } : {};
}

/** 이용 가게 전환 */
export async function selectMyStore(storeId: string): Promise<{ error?: string }> {
  const { customerId } = await resolveCustomerId();
  if (!customerId) return { error: "로그인이 필요합니다." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("customer")
    .update({ store_id: storeId, modified_at: new Date().toISOString() })
    .eq("customer_id", customerId);

  return error ? { error: error.message } : {};
}
