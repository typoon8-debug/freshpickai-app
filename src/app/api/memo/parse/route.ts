import { NextRequest, NextResponse } from "next/server";
import { parseMemoItemText } from "@/lib/utils/memo-parser";
import { createClient } from "@/lib/supabase/server";

export type ParsedItem = {
  name: string;
  qty: number;
  unit: string;
  category: string;
  matched: boolean;
};

// STEP4: 카테고리 키워드 분류 사전
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

  // STEP1 오타보정 + STEP2 수량추출 (memo-parser.ts 위임)
  const { items: parsedItems } = parseMemoItemText(text);

  if (parsedItems.length === 0) {
    return NextResponse.json([] as ParsedItem[]);
  }

  // STEP3: fp_dish_ingredient ILIKE → 2글자 prefix ILIKE 폴백
  const supabase = await createClient();

  const results: ParsedItem[] = await Promise.all(
    parsedItems.map(async (p): Promise<ParsedItem> => {
      const itemName = p.item || p.raw_token || "";
      const qty = p.qty_value ?? 1;
      const unit = p.qty_unit ?? "개";

      if (!itemName) {
        return { name: itemName, qty, unit, category: "기타", matched: false };
      }

      // 1차: 전체 품목명 ILIKE
      const { data: exact } = await supabase
        .from("fp_dish_ingredient")
        .select("name")
        .ilike("name", `%${itemName}%`)
        .limit(1);

      if (exact && exact.length > 0) {
        return {
          name: itemName,
          qty,
          unit,
          category: classifyCategory(itemName),
          matched: true,
        };
      }

      // 2차: fp_ingredient_meta ILIKE (더 넓은 재료 지식)
      const { data: meta } = await supabase
        .from("fp_ingredient_meta")
        .select("name")
        .ilike("name", `%${itemName}%`)
        .limit(1);

      if (meta && meta.length > 0) {
        return {
          name: itemName,
          qty,
          unit,
          category: classifyCategory(itemName),
          matched: true,
        };
      }

      // 3차: 2글자 prefix pg_trgm 폴백
      const prefix = itemName.slice(0, 2);
      if (prefix.length >= 2) {
        const { data: trgm } = await supabase
          .from("fp_dish_ingredient")
          .select("name")
          .ilike("name", `${prefix}%`)
          .limit(1);

        if (trgm && trgm.length > 0) {
          return {
            name: itemName,
            qty,
            unit,
            category: classifyCategory(itemName),
            matched: true,
          };
        }
      }

      // 미매칭 — STEP4 카테고리는 키워드 기반으로 그래도 분류
      return {
        name: itemName,
        qty,
        unit,
        category: classifyCategory(itemName),
        matched: false,
      };
    })
  );

  return NextResponse.json(results);
}
