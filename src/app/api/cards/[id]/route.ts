import { NextResponse } from "next/server";
import { getCard } from "@/lib/actions/cards";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  // 카드 상세는 공개 데이터 — Vercel Edge CDN 5분 캐시
  return NextResponse.json(card, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}
