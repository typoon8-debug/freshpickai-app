import { type NextRequest, NextResponse } from "next/server";
import { setQtyAction, removeItemAction } from "@/lib/actions/cart";

interface Params {
  params: Promise<{ itemId: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { itemId } = await params;

  let body: { qty?: number };
  try {
    body = (await request.json()) as { qty?: number };
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { qty } = body;
  if (typeof qty !== "number" || qty < 1) {
    return NextResponse.json({ error: "qty는 1 이상이어야 합니다." }, { status: 400 });
  }

  const result = await setQtyAction(itemId, qty);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { itemId } = await params;
  const result = await removeItemAction(itemId);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}
