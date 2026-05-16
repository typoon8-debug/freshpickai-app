import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addBundleAction } from "@/lib/actions/cart";

export async function POST(request: NextRequest) {
  let body: { storeItemId?: string; qty?: number; name?: string };
  try {
    body = (await request.json()) as { storeItemId?: string; qty?: number; name?: string };
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { storeItemId, qty = 1, name } = body;
  if (!storeItemId) {
    return NextResponse.json({ error: "storeItemId는 필수입니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // v_store_inventory_item에서 가격·재고 조회
  const { data: itemRow } = await supabase
    .from("v_store_inventory_item")
    .select("item_name, effective_sale_price, list_price, is_in_stock")
    .eq("store_item_id", storeItemId)
    .maybeSingle();

  if (!itemRow || itemRow.is_in_stock === false) {
    return NextResponse.json({ error: "품절이거나 존재하지 않는 상품입니다." }, { status: 409 });
  }

  const price = (itemRow.effective_sale_price ?? itemRow.list_price ?? 0) as number;
  const itemName = (name ?? itemRow.item_name ?? "상품") as string;

  const cartItem = {
    cartItemId: `item-${storeItemId}-${Date.now()}`,
    userId: "",
    cardId: "",
    ingredientId: undefined,
    name: itemName,
    emoji: "🛒",
    qty: Math.max(1, qty),
    price,
    unit: "개",
    refStoreItemId: storeItemId,
  };

  const result = await addBundleAction("", [cartItem]);
  if (result.error) {
    const status = result.error === "로그인이 필요합니다." ? 401 : 422;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, name: itemName, price });
}
