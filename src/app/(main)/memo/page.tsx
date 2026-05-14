"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/top-header";
import { MemoInput } from "@/components/memo/memo-input";
import { ParsePreview } from "@/components/memo/parse-preview";
import { MemoList } from "@/components/memo/memo-list";
import { MemoFooter } from "@/components/memo/memo-footer";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import { parsedToMemoItems } from "@/lib/memo-adapter";
import { saveMemoAction } from "@/lib/actions/memo";
import type { MemoItem } from "@/lib/types";
import type { ParseMeta } from "@/lib/memo-adapter";
import type { ParsedItem } from "@/app/api/memo/parse/route";
import type { SearchStoreItem } from "@/app/api/memo/search-items/route";

type Tab = "new" | "saved";

export default function MemoPage() {
  const [tab, setTab] = useState<Tab>("new");
  const [memoItems, setMemoItems] = useState<MemoItem[]>([]);
  const [parseMeta, setParseMeta] = useState<Record<string, ParseMeta>>({});
  const [parsedRaw, setParsedRaw] = useState<ParsedItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const addBundle = useCartStore((s) => s.addBundle);

  const handleToggle = (id: string) => {
    setMemoItems((prev) => prev.map((i) => (i.memoItemId === id ? { ...i, done: !i.done } : i)));
  };

  const handleQtyChange = (id: string, delta: number) => {
    setMemoItems((prev) =>
      prev.map((i) =>
        i.memoItemId === id ? { ...i, qtyValue: Math.max(1, (i.qtyValue ?? 1) + delta) } : i
      )
    );
  };

  const selected = memoItems.filter((i) => i.done);

  const handleParsed = (items: ParsedItem[], text: string) => {
    const { items: mItems, meta } = parsedToMemoItems(items);
    setMemoItems(mItems);
    setParseMeta(meta);
    setParsedRaw(items);
    setRawText(text);
  };

  const handleSave = async () => {
    if (!rawText.trim() || parsedRaw.length === 0) return;
    setIsSaving(true);
    const result = await saveMemoAction(rawText, parsedRaw);
    setIsSaving(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("메모가 저장되었습니다");
      setMemoItems([]);
      setParseMeta({});
      setParsedRaw([]);
      setRawText("");
      setTab("saved");
    }
  };

  const handleMatch = (memoItemId: string, storeItem: SearchStoreItem) => {
    setMemoItems((prev) =>
      prev.map((i) =>
        i.memoItemId === memoItemId ? { ...i, refStoreItemId: storeItem.storeItemId } : i
      )
    );
    setParseMeta((prev) => ({
      ...prev,
      [memoItemId]: { ...prev[memoItemId], matched: true },
    }));
  };

  const handleAddToCart = () => {
    const cartItems = selected.map((i, idx) => ({
      cartItemId: `memo-${Date.now()}-${idx}`,
      userId: "",
      name: i.correctedText ?? i.rawText,
      qty: i.qtyValue ?? 1,
      unit: i.qtyUnit ?? "개",
      price: 0,
      emoji: "📝",
    }));
    addBundle("memo", cartItems);
    toast.success(`${selected.length}개 항목을 장바구니에 추가했습니다`);
    setMemoItems([]);
    setParseMeta({});
    setParsedRaw([]);
    setRawText("");
  };

  return (
    <>
      <TopHeader title="장보기 메모" />

      {/* 탭 */}
      <div className="border-line flex border-b">
        {(["new", "saved"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition",
              tab === t ? "border-mocha-700 text-mocha-700 border-b-2" : "text-ink-400"
            )}
          >
            {t === "new" ? "새 메모" : "저장된 메모"}
          </button>
        ))}
      </div>

      <div className="pt-4 pb-32">
        {tab === "new" ? (
          <div className="flex flex-col gap-4 px-4">
            <MemoInput onParsed={handleParsed} />

            {memoItems.length > 0 && (
              <>
                <ParsePreview
                  items={memoItems}
                  meta={parseMeta}
                  onToggle={handleToggle}
                  onQtyChange={handleQtyChange}
                  onMatch={handleMatch}
                />

                {/* 저장 버튼 */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="border-line text-ink-700 flex items-center justify-center gap-2 rounded-lg border bg-white py-2.5 text-sm font-medium disabled:opacity-40"
                >
                  <Save size={14} />
                  {isSaving ? "저장 중..." : "메모 저장하기"}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="px-4">
            <MemoList />
          </div>
        )}
      </div>

      {tab === "new" && memoItems.length > 0 && (
        <MemoFooter selectedCount={selected.length} onAddToCart={handleAddToCart} />
      )}
    </>
  );
}
