import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { StoreInRange, RiderNearbyStore } from "./types";

type Supabase = SupabaseClient<Database>;

/**
 * 고객의 기본 배송지 기준으로 배달권 내 store 목록을 반환.
 * DB의 fn_stores_within_delivery RPC를 호출.
 */
export async function fetchStoresWithinDelivery(
  supabase: Supabase,
  customerId: string
): Promise<StoreInRange[]> {
  const { data, error } = await supabase.rpc("fn_stores_within_delivery", {
    p_customer_id: customerId,
  });

  if (error) throw new Error(`fn_stores_within_delivery RPC 오류: ${error.message}`);
  return (data ?? []) as StoreInRange[];
}

/**
 * rider GPS 위치 기준으로 p_max_m 미터 이내 신청 가능 store 목록을 반환.
 * DB의 fn_stores_within_rider_radius RPC를 호출.
 */
export async function fetchStoresWithinRiderRadius(
  supabase: Supabase,
  lat: number,
  lng: number,
  maxM = 5000
): Promise<RiderNearbyStore[]> {
  const { data, error } = await supabase.rpc("fn_stores_within_rider_radius", {
    p_lat: lat,
    p_lng: lng,
    p_max_m: maxM,
  });

  if (error) throw new Error(`fn_stores_within_rider_radius RPC 오류: ${error.message}`);
  return (data ?? []) as RiderNearbyStore[];
}
