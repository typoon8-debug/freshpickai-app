import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 개발/테스트 환경에서만 사용 — 프로덕션에서는 비활성화
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table");
  const select = searchParams.get("select") ?? "count";

  if (!table) {
    return NextResponse.json({ error: "table 파라미터 필요" }, { status: 400 });
  }

  // 허용 테이블 목록 (화이트리스트)
  const ALLOWED_TABLES = [
    "fp_ai_semantic_cache",
    "fp_ai_review_queue",
    "fp_wishlist",
    "fp_shopping_memo",
    "fp_card_note",
    "fp_dish_recipe",
    "fp_family_vote",
    "fp_vote_session",
  ] as const;

  if (!ALLOWED_TABLES.includes(table as (typeof ALLOWED_TABLES)[number])) {
    return NextResponse.json({ error: "허용되지 않은 테이블" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from(table as "fp_ai_semantic_cache")
    .select(select)
    .limit(1);

  if (error) {
    const msg = error.message ?? "";
    const isForbidden =
      error.code === "42501" ||
      msg.toLowerCase().includes("permission denied") ||
      msg.toLowerCase().includes("insufficient_privilege") ||
      msg.toLowerCase().includes("row-level security");
    // 기타 모든 오류(스키마 캐시 미등록, 테이블 미존재 등)는 404 처리
    const status = isForbidden ? 403 : 404;
    return NextResponse.json({ error: msg }, { status });
  }

  return NextResponse.json({ table, data });
}
