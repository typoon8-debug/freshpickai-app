import type { LatLng, DistanceM } from "./types";

const EARTH_RADIUS_M = 6371000;

/**
 * WGS84 두 좌표 간 직선거리(미터).
 * DB의 fn_haversine_m 함수와 동일한 공식 — 클라이언트 사이드 사전 필터링용.
 */
export function haversineM(a: LatLng, b: LatLng): DistanceM {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const inner =
    sinDLat * sinDLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  return EARTH_RADIUS_M * 2 * Math.asin(Math.sqrt(inner));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
