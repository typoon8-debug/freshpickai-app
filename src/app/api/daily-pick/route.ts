import { NextResponse } from "next/server";
import { getDailyPick } from "@/lib/actions/cards";

export async function GET() {
  const card = await getDailyPick();

  if (!card) {
    return NextResponse.json({ error: "No daily pick available" }, { status: 404 });
  }

  // 데일리픽은 하루 단위로만 변경 — CDN 1시간 캐시 (서버 측 24h unstable_cache와 중첩)
  return NextResponse.json(card, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
  });
}
