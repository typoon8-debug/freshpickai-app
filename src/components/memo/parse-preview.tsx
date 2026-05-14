"use client";

import { useState } from "react";
import { AlertCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemoItem as MemoItemType } from "@/lib/types";
import type { ParseMeta } from "@/lib/memo-adapter";
import type { SearchStoreItem } from "@/app/api/memo/search-items/route";
import { MemoItem } from "./memo-item";
import { MemoMatchDrawer } from "./memo-match-drawer";

const CATEGORY_COLORS: Record<string, string> = {
  식재료: "text-sage bg-sage/10",
  과자: "text-honey bg-honey/10",
  기타: "text-ink-400 bg-ink-100",
};

interface ParsePreviewProps {
  items: MemoItemType[];
  meta: Record<string, ParseMeta>;
  onToggle: (id: string) => void;
  onQtyChange: (id: string, delta: number) => void;
  onMatch?: (memoItemId: string, storeItem: SearchStoreItem) => void;
}

export function ParsePreview({ items, meta, onToggle, onQtyChange, onMatch }: ParsePreviewProps) {
  const [drawerItemId, setDrawerItemId] = useState<string | null>(null);
  const matchedCount = Object.values(meta).filter((m) => m.matched).length;
  const total = items.length;

  const drawerItem = drawerItemId ? items.find((i) => i.memoItemId === drawerItemId) : null;

  const handleMatchSelect = (storeItem: SearchStoreItem) => {
    if (drawerItemId) onMatch?.(drawerItemId, storeItem);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-ink-700 text-sm font-semibold">파싱 결과</p>
          <span className="text-ink-400 text-xs">
            {matchedCount}/{total}개 매칭됨
          </span>
        </div>

        <div className="border-line overflow-hidden rounded-lg border bg-white">
          {items.map((item, idx) => {
            const m = meta[item.memoItemId];
            const isMatched = m?.matched ?? true;
            const category = m?.category ?? "기타";

            return (
              <div
                key={item.memoItemId}
                className={cn(
                  "flex items-center gap-2 px-4 py-3",
                  idx < items.length - 1 && "border-line border-b",
                  !isMatched && "border-l-terracotta border-l-2"
                )}
              >
                {/* 매칭 실패 아이콘 */}
                {!isMatched && <AlertCircle size={14} className="text-terracotta shrink-0" />}

                <div className="min-w-0 flex-1">
                  <MemoItem item={item} onToggle={onToggle} onQtyChange={onQtyChange} />
                  {!isMatched && (
                    <button
                      type="button"
                      onClick={() => setDrawerItemId(item.memoItemId)}
                      className="text-mocha-600 mt-0.5 flex items-center gap-1 pl-8 text-[11px] underline-offset-2 hover:underline"
                    >
                      <Search size={10} />
                      상품 검색으로 매칭하기
                    </button>
                  )}
                </div>

                {/* 카테고리 뱃지 */}
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                    CATEGORY_COLORS[category] ?? "text-ink-400 bg-ink-100"
                  )}
                >
                  {category}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 수동 매칭 Drawer */}
      <MemoMatchDrawer
        open={!!drawerItemId}
        itemName={drawerItem?.correctedText ?? drawerItem?.rawText ?? ""}
        onClose={() => setDrawerItemId(null)}
        onSelect={handleMatchSelect}
      />
    </>
  );
}
