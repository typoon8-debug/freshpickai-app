import { type NextRequest, NextResponse } from "next/server";
import { removeWishlistAction } from "@/lib/actions/wishlist";

interface Params {
  params: Promise<{ itemId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { itemId } = await params;
  const result = await removeWishlistAction(itemId);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}
