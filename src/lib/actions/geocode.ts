"use server";

interface KakaoDoc {
  x: string;
  y: string;
}

interface KakaoGeoResponse {
  documents: KakaoDoc[];
}

export async function geocodeKakao(address: string): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.KAKAO_REST_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      { headers: { Authorization: `KakaoAK ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as KakaoGeoResponse;
    const doc = json.documents?.[0];
    if (!doc) return null;
    return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
  } catch {
    return null;
  }
}
