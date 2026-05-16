import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/payment/initiate
 * 결제 준비: 장바구니 비어있지 않은지 확인 후 체크아웃 URL 반환
 * 실제 결제 처리는 /cart → /api/payments/confirm 경로
 */
export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { count } = await supabase
    .from("fp_cart_item")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!count || count === 0) {
    return NextResponse.json({ error: "장바구니가 비어있습니다." }, { status: 409 });
  }

  return NextResponse.json({ checkoutUrl: "/cart" });
}
