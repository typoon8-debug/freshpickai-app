"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Save, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TopHeader } from "@/components/layout/top-header";
import { MemoMatchDrawer } from "./memo-match-drawer";
import { updateMemoAction } from "@/lib/actions/memo";
import { parsedToMemoItems } from "@/lib/memo-adapter";
import type { MemoItem, ShoppingMemo } from "@/lib/types";
import type { ParseMeta } from "@/lib/memo-adapter";
import type { ParsedItem } from "@/app/api/memo/parse/route";
import type { SearchStoreItem } from "@/app/api/memo/search-items/route";

const CATEGORY_COLORS: Record<string, string> = {
  식재료: "text-sage bg-sage/10",
  과자: "text-honey bg-honey/10",
  기타: "text-ink-400 bg-ink-100",
};

interface MemoEditorProps {
  memoId: string;
  initialMemo: ShoppingMemo;
  initialItems: MemoItem[];
}

export function MemoEditor({ memoId, initialMemo, initialItems }: MemoEditorProps) {
  const router = useRouter();

  const [rawText, setRawText] = useState(initialMemo.rawText ?? "");
  const [items, setItems] = useState<MemoItem[]>(initialItems);
  const [meta, setMeta] = useState<Record<string, ParseMeta>>(() => {
    const m: Record<string, ParseMeta> = {};
    initialItems.forEach((i) => {
      m[i.memoItemId] = { category: i.category ?? "기타", matched: !!i.refStoreItemId };
    });
    return m;
  });
  const [drawerItemId, setDrawerItemId] = useState<string | null>(null);
  const [addingName, setAddingName] = useState("");
  const [isSaving, startSave] = useTransition();
  const [isParsing, startParse] = useTransition();
  const addInputRef = useRef<HTMLInputElement>(null);

  const parsedCount = Object.values(meta).filter((m) => m.matched).length;

  const handleQtyChange = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.memoItemId === id ? { ...i, qtyValue: Math.max(1, (i.qtyValue ?? 1) + delta) } : i
      )
    );
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.memoItemId !== id));
    setMeta((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleAddItem = () => {
    const name = addingName.trim();
    if (!name) return;
    const id = `tmp-${Date.now()}`;
    const newItem: MemoItem = {
      memoItemId: id,
      memoId,
      rawText: name,
      correctedText: name,
      qtyValue: 1,
      qtyUnit: "개",
      category: "기타",
      done: false,
      sortOrder: items.length,
    };
    setItems((prev) => [...prev, newItem]);
    setMeta((prev) => ({ ...prev, [id]: { category: "기타", matched: false } }));
    setAddingName("");
    addInputRef.current?.focus();
  };

  const handleReParse = useCallback(() => {
    if (!rawText.trim()) return;
    startParse(async () => {
      try {
        const res = await fetch("/api/memo/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: rawText }),
        });
        if (!res.ok) throw new Error("파싱 실패");
        const parsed: ParsedItem[] = await res.json();
        const { items: newItems, meta: newMeta } = parsedToMemoItems(parsed);
        setItems(newItems);
        setMeta(newMeta);
      } catch {
        toast.error("파싱 중 오류가 발생했습니다");
      }
    });
  }, [rawText]);

  const handleMatch = (memoItemId: string, storeItem: SearchStoreItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.memoItemId === memoItemId ? { ...i, refStoreItemId: storeItem.storeItemId } : i
      )
    );
    setMeta((prev) => ({
      ...prev,
      [memoItemId]: { ...prev[memoItemId], matched: true },
    }));
  };

  const handleSave = () => {
    startSave(async () => {
      const parsedForSave: ParsedItem[] = items.map((i) => ({
        name: i.correctedText ?? i.rawText,
        qty: i.qtyValue ?? 1,
        unit: i.qtyUnit ?? "개",
        category: i.category ?? "기타",
        matched: meta[i.memoItemId]?.matched ?? false,
        refStoreItemId: i.refStoreItemId,
      }));

      const result = await updateMemoAction(memoId, rawText, parsedForSave);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("메모가 저장되었습니다");
        router.push("/memo");
      }
    });
  };

  const drawerItem = drawerItemId ? items.find((i) => i.memoItemId === drawerItemId) : null;

  return (
    <>
      <TopHeader title="메모 편집" backHref="/memo" />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-36">
        {/* 원문 텍스트 입력 */}
        <div className="relative">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="장보기 텍스트를 입력하세요"
            className="border-line bg-paper text-ink-800 placeholder:text-ink-300 focus:border-mocha-500 focus:ring-mocha-200 w-full resize-none rounded-xl border p-3 text-sm outline-none focus:ring-2"
          />
          <span className="text-ink-300 absolute right-3 bottom-2.5 text-[11px]">
            {rawText.length}/500
          </span>
        </div>

        {/* AI 재파싱 버튼 */}
        <button
          type="button"
          onClick={handleReParse}
          disabled={isParsing || !rawText.trim()}
          className="bg-mocha-700 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          <Sparkles size={14} />
          {isParsing ? "파싱 중..." : "AI로 다시 파싱하기"}
        </button>

        {/* 파싱 결과 목록 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-ink-700 text-sm font-semibold">항목 목록</p>
            <span className="text-ink-400 text-xs">
              {parsedCount}/{items.length}개 매칭됨
            </span>
          </div>

          {items.length > 0 && (
            <div className="border-line overflow-hidden rounded-lg border bg-white">
              {items.map((item, idx) => {
                const m = meta[item.memoItemId];
                const isMatched = m?.matched ?? false;
                const category = m?.category ?? "기타";

                return (
                  <div
                    key={item.memoItemId}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5",
                      idx < items.length - 1 && "border-line border-b",
                      !isMatched && "border-l-terracotta border-l-2"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-ink-900 flex-1 truncate text-sm">
                          {item.correctedText ?? item.rawText}
                        </p>
                        <span
                          className={cn(
                            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                            CATEGORY_COLORS[category] ?? "text-ink-400 bg-ink-100"
                          )}
                        >
                          {category}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.memoItemId, -1)}
                            disabled={(item.qtyValue ?? 1) <= 1}
                            className="bg-mocha-50 text-ink-700 flex h-6 w-6 items-center justify-center rounded disabled:opacity-30"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-ink-900 w-5 text-center text-xs font-medium">
                            {item.qtyValue ?? 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.memoItemId, 1)}
                            className="bg-mocha-50 text-ink-700 flex h-6 w-6 items-center justify-center rounded"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <span className="text-ink-400 text-xs">{item.qtyUnit ?? "개"}</span>

                        {!isMatched && (
                          <button
                            type="button"
                            onClick={() => setDrawerItemId(item.memoItemId)}
                            className="text-mocha-600 ml-auto text-[11px] underline-offset-2 hover:underline"
                          >
                            상품 매칭
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.memoItemId)}
                      className="text-ink-300 hover:text-terracotta shrink-0 p-1 transition"
                      aria-label="항목 삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 항목 직접 추가 */}
          <div className="border-line flex gap-2 rounded-lg border bg-white px-3 py-2">
            <input
              ref={addInputRef}
              type="text"
              value={addingName}
              onChange={(e) => setAddingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              placeholder="항목 직접 추가 (Enter)"
              className="text-ink-800 placeholder:text-ink-300 flex-1 bg-transparent text-sm outline-none"
            />
            {addingName && (
              <button
                type="button"
                onClick={handleAddItem}
                className="text-mocha-600 text-xs font-medium"
              >
                추가
              </button>
            )}
            {addingName && (
              <button
                type="button"
                onClick={() => setAddingName("")}
                className="text-ink-300 ml-1"
                aria-label="지우기"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 하단 고정 저장 버튼 */}
      <div className="border-line pb-safe fixed right-0 bottom-0 left-0 border-t bg-white px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-mocha-700 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save size={14} />
          {isSaving ? "저장 중..." : "메모 저장하기"}
        </button>
      </div>

      {/* 수동 매칭 Drawer */}
      <MemoMatchDrawer
        open={!!drawerItemId}
        itemName={drawerItem?.correctedText ?? drawerItem?.rawText ?? ""}
        onClose={() => setDrawerItemId(null)}
        onSelect={(storeItem) => {
          if (drawerItemId) handleMatch(drawerItemId, storeItem);
          setDrawerItemId(null);
        }}
      />
    </>
  );
}
