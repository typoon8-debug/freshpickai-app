import { NextResponse } from "next/server";
import { getCardDetail } from "@/lib/actions/cards/detail";

// 개발 환경에서만 사용하는 테스트 엔드포인트 — 프로덕션 배포 시 삭제
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "ca000001-0001-4000-8000-000000000001";
  const detail = await getCardDetail(id);
  if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(detail);
}
