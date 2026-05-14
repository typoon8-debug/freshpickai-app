import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type SearchStoreItem = {
  storeItemId: string;
  itemName: string;
  price: number | null;
  thumbnailSmall: string | null;
  discountPct: number | null;
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json([] as SearchStoreItem[]);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_store_inventory_item")
    .select(
      "store_item_id, item_name, effective_sale_price, sale_price, item_thumbnail_small, discount_pct"
    )
    .eq("status", "active")
    .ilike("item_name", `%${q}%`)
    .order("effective_sale_price", { ascending: true })
    .limit(10);

  if (error || !data) return NextResponse.json([] as SearchStoreItem[]);

  const items: SearchStoreItem[] = (data as Record<string, unknown>[]).map((r) => {
    const rawPrice = (r.effective_sale_price as number | null) ?? (r.sale_price as number | null);
    return {
      storeItemId: r.store_item_id as string,
      itemName: r.item_name as string,
      price: rawPrice != null && rawPrice > 0 ? rawPrice : null,
      thumbnailSmall: (r.item_thumbnail_small as string | null) ?? null,
      discountPct: (r.discount_pct as number | null) ?? null,
    };
  });

  return NextResponse.json(items);
}
