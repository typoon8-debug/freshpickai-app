import type { MemoItem } from "@/lib/types";
import type { ParsedItem } from "@/app/api/memo/parse/route";

export type ParseMeta = { category: string; matched: boolean };

/** ParsedItem 배열을 MemoItem 배열 + 메타(카테고리·매칭여부)로 변환 */
export function parsedToMemoItems(parsed: ParsedItem[]): {
  items: MemoItem[];
  meta: Record<string, ParseMeta>;
} {
  const stamp = Date.now();
  const items: MemoItem[] = [];
  const meta: Record<string, ParseMeta> = {};

  parsed.forEach((p, idx) => {
    const id = `tmp-${stamp}-${idx}`;
    items.push({
      memoItemId: id,
      memoId: "tmp",
      rawText: p.name,
      correctedText: p.name,
      qtyValue: p.qty,
      qtyUnit: p.unit,
      category: p.category,
      done: true,
      sortOrder: idx,
    });
    meta[id] = { category: p.category, matched: p.matched };
  });

  return { items, meta };
}
