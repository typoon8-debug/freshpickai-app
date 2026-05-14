import { NextRequest, NextResponse } from "next/server";
import { parseMemoItemText } from "@/lib/utils/memo-parser";
import { createClient } from "@/lib/supabase/server";

export type ParsedItem = {
  name: string;
  qty: number;
  unit: string;
  category: string;
  matched: boolean;
  refStoreItemId?: string;
  price?: number;
  thumbnailSmall?: string;
};

const SNACK_KW = [
  "과자",
  "스낵",
  "초코",
  "쿠키",
  "크래커",
  "팝콘",
  "사탕",
  "젤리",
  "빵",
  "케이크",
  "도넛",
  "마카롱",
  "새우깡",
  "포카칩",
  "꿀꽈배기",
  "약과",
  "인절미",
  "호떡",
  "붕어빵",
  "치즈볼",
  "떡",
];

function classifyCategory(name: string): string {
  if (SNACK_KW.some((k) => name.includes(k))) return "과자";
  return "식재료";
}

type StoreItemRow = {
  store_item_id: string | null;
  item_name: string | null;
  item_thumbnail_small: string | null;
  effective_sale_price: number | null;
  sale_price: number | null;
};

export async function POST(req: NextRequest) {
  let text: string;
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text.trim() : "";
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식" }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "text가 필요합니다" }, { status: 400 });
  }

  const { items: parsedItems } = parseMemoItemText(text);
  if (parsedItems.length === 0) {
    return NextResponse.json([] as ParsedItem[]);
  }

  const supabase = await createClient();

  const results: ParsedItem[] = await Promise.all(
    parsedItems.map(async (p): Promise<ParsedItem> => {
      const itemName = p.item || p.raw_token || "";
      const qty = p.qty_value ?? 1;
      const unit = p.qty_unit ?? "개";
      const category = classifyCategory(itemName);

      if (!itemName) {
        return { name: itemName, qty, unit, category: "기타", matched: false };
      }

      // 1차: fp_dish_ingredient ILIKE
      const { data: exact } = await supabase
        .from("fp_dish_ingredient")
        .select("name")
        .ilike("name", `%${itemName}%`)
        .limit(1);

      // 2차: fp_ingredient_meta ILIKE
      const { data: meta } = !exact?.length
        ? await supabase
            .from("fp_ingredient_meta")
            .select("name")
            .ilike("name", `%${itemName}%`)
            .limit(1)
        : { data: null };

      // 3차: 2글자 prefix 폴백
      let trgmMatched = false;
      if (!exact?.length && !meta?.length) {
        const prefix = itemName.slice(0, 2);
        if (prefix.length >= 2) {
          const { data: trgm } = await supabase
            .from("fp_dish_ingredient")
            .select("name")
            .ilike("name", `${prefix}%`)
            .limit(1);
          trgmMatched = !!trgm?.length;
        }
      }

      const ingredientMatched = !!(exact?.length || meta?.length || trgmMatched);

      // 4차: v_store_inventory_item ILIKE — storeItem 매칭 및 가격/썸네일 획득
      const { data: storeRows } = await supabase
        .from("v_store_inventory_item")
        .select("store_item_id, item_name, item_thumbnail_small, effective_sale_price, sale_price")
        .ilike("item_name", `%${itemName}%`)
        .eq("status", "active")
        .order("effective_sale_price", { ascending: true })
        .limit(1);

      const storeItem = (storeRows as StoreItemRow[] | null)?.[0];

      if (storeItem?.store_item_id) {
        const rawPrice = storeItem.effective_sale_price ?? storeItem.sale_price;
        return {
          name: itemName,
          qty,
          unit,
          category,
          matched: true,
          refStoreItemId: storeItem.store_item_id,
          price: rawPrice != null && rawPrice > 0 ? rawPrice : undefined,
          thumbnailSmall: storeItem.item_thumbnail_small ?? undefined,
        };
      }

      return {
        name: itemName,
        qty,
        unit,
        category,
        matched: ingredientMatched,
      };
    })
  );

  return NextResponse.json(results);
}
