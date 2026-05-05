// Plan B: 결제 실패/취소 시 DB에 order가 없으므로 DB 처리 없이 redirect만 수행
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const storeId = searchParams.get("storeId") ?? "";
  const code = searchParams.get("code") ?? "";
  const message = searchParams.get("message") ?? "";

  const redirectUrl = new URL("/cart", request.nextUrl.origin);
  if (storeId) redirectUrl.searchParams.set("store_id", storeId);
  if (code) redirectUrl.searchParams.set("error_code", code);
  if (message) redirectUrl.searchParams.set("error_msg", encodeURIComponent(message));

  return NextResponse.redirect(redirectUrl);
}
