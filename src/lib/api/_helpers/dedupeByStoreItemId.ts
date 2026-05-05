/**
 * inventory 다중 row → v_store_inventory_item 다중화 방어.
 * (store_id, store_item_id) 조합 기준으로 중복 제거.
 * view DDL 수정(Phase 2) 전까지 클라이언트 방어용.
 */
export function dedupeByStoreItemId<
  T extends { store_item_id: string | null; store_id?: string | null },
>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    if (!r.store_item_id) continue;
    const key = `${r.store_id ?? ""}::${r.store_item_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}
