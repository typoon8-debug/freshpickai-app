import { type NextRequest, NextResponse } from "next/server";
import { addWishlistAction } from "@/lib/actions/wishlist";

const DEFAULT_STORE_ID =
  process.env.FRESHPICKAI_DEFAULT_STORE_ID ?? "00000000-0000-0000-0000-000000000001";

export async function POST(request: NextRequest) {
  let body: { itemId?: string; storeId?: string };
  try {
    body = (await request.json()) as { itemId?: string; storeId?: string };
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { itemId, storeId } = body;
  if (!itemId) {
    return NextResponse.json({ error: "itemId는 필수입니다." }, { status: 400 });
  }

  const result = await addWishlistAction(itemId, storeId ?? DEFAULT_STORE_ID);
  if (result.error) {
    const status = result.error === "로그인이 필요합니다." ? 401 : 422;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
