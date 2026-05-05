import type { StoreInRange } from "@/lib/geo/types";

export type DeliveryGuardMode = "OFF" | "WARN" | "STRICT";

export function getDeliveryGuardMode(): DeliveryGuardMode {
  const mode = process.env.NEXT_PUBLIC_DELIVERY_GUARD_MODE as DeliveryGuardMode | undefined;
  return mode ?? "OFF";
}

export interface CartGuardResult {
  allInRange: boolean;
  outOfRangeStoreIds: string[];
  storeDistances: Record<string, number | null>;
  inRangeStoreIds: string[];
}

/**
 * 장바구니 storeId 목록과 권역 내 매장 목록을 비교하여 가드 결과를 반환.
 * fn_stores_within_delivery RPC 결과를 외부에서 받아 처리.
 */
export function evaluateDeliveryGuard(
  cartStoreIds: string[],
  storesInRange: StoreInRange[]
): CartGuardResult {
  const inRangeMap = new Map<string, StoreInRange>(storesInRange.map((s) => [s.store_id, s]));
  const outOfRangeStoreIds: string[] = [];
  const storeDistances: Record<string, number | null> = {};

  for (const storeId of cartStoreIds) {
    const store = inRangeMap.get(storeId);
    storeDistances[storeId] = store?.distance_m ?? null;
    if (!store || !store.in_range) {
      outOfRangeStoreIds.push(storeId);
    }
  }

  return {
    allInRange: outOfRangeStoreIds.length === 0,
    outOfRangeStoreIds,
    storeDistances,
    inRangeStoreIds: storesInRange.filter((s) => s.in_range).map((s) => s.store_id),
  };
}

/** 거리(m)를 사람이 읽기 좋은 형태로 반환. 100m 단위 반올림 */
export function formatDistance(distanceM: number | null): string {
  if (distanceM === null) return "";
  if (distanceM < 1000) {
    const rounded = Math.round(distanceM / 100) * 100;
    return `약 ${rounded}m`;
  }
  return `약 ${(distanceM / 1000).toFixed(1)}km`;
}
