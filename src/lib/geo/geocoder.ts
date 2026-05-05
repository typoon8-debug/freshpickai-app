import "server-only";
import type { GeocodeResult } from "./types";

const KAKAO_API_URL = "https://dapi.kakao.com/v2/local/search/address.json";

export class KakaoGeocodeError extends Error {
  constructor(
    message: string,
    public readonly address: string,
    public readonly status: "NOT_FOUND" | "ERROR"
  ) {
    super(message);
    this.name = "KakaoGeocodeError";
  }
}

/**
 * 주소 문자열 → WGS84 좌표 변환 (Kakao Local API).
 * 서버 전용(KAKAO_REST_KEY 노출 방지).
 * GEOCODE_DRY_RUN=true 이면 mock 좌표 반환.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  if (process.env.GEOCODE_DRY_RUN === "true") {
    return { lat: 37.5665, lng: 126.978, address };
  }

  const key = process.env.KAKAO_REST_KEY;
  if (!key) {
    throw new KakaoGeocodeError("KAKAO_REST_KEY 환경변수가 설정되지 않았습니다.", address, "ERROR");
  }

  const url = `${KAKAO_API_URL}?query=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${key}` },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new KakaoGeocodeError(`Kakao API 오류 (HTTP ${res.status})`, address, "ERROR");
  }

  const data = (await res.json()) as {
    documents: Array<{
      x: string;
      y: string;
      address_name: string;
      road_address?: { address_name: string } | null;
    }>;
  };

  if (!data.documents.length) {
    throw new KakaoGeocodeError(`주소를 찾을 수 없습니다: ${address}`, address, "NOT_FOUND");
  }

  const doc = data.documents[0];
  return {
    lat: parseFloat(doc.y),
    lng: parseFloat(doc.x),
    address: doc.address_name,
    roadAddress: doc.road_address?.address_name,
  };
}
