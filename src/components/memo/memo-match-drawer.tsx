"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { SearchStoreItem } from "@/app/api/memo/search-items/route";

interface MemoMatchDrawerProps {
  open: boolean;
  itemName: string;
  onClose: () => void;
  onSelect: (item: SearchStoreItem) => void;
}

function DrawerBody({ itemName, onClose, onSelect }: Omit<MemoMatchDrawerProps, "open">) {
  const [query, setQuery] = useState(itemName);
  const [results, setResults] = useState<SearchStoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      const t = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(t);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/memo/search-items?q=${encodeURIComponent(query)}`);
        const data = (await res.json()) as SearchStoreItem[];
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return (
    <>
      {/* 검색 입력 */}
      <div className="border-line border-b px-4 pb-3">
        <div className="relative flex items-center">
          <Search className="text-ink-400 pointer-events-none absolute left-3 h-4 w-4" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="상품명으로 검색"
            className="border-line bg-mocha-50 text-ink-800 placeholder:text-ink-300 focus:border-mocha-500 w-full rounded-xl border py-2.5 pr-8 pl-9 text-sm outline-none"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3"
              aria-label="지우기"
            >
              <X className="text-ink-400 h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 결과 목록 */}
      <div className="overflow-y-auto">
        {loading && (
          <div className="flex flex-col gap-2 px-4 py-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-ink-100 h-12 w-12 animate-pulse rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="bg-ink-100 h-3 w-3/4 animate-pulse rounded" />
                  <div className="bg-ink-100 h-3 w-1/3 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && query.trim() && (
          <div className="py-10 text-center">
            <p className="text-ink-400 text-sm">검색 결과가 없어요</p>
            <p className="text-ink-300 mt-1 text-xs">다른 키워드로 검색해보세요</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <ul className="divide-line divide-y">
            {results.map((item) => (
              <li key={item.storeItemId}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="hover:bg-mocha-50 flex w-full items-center gap-3 px-4 py-3 text-left transition"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {item.thumbnailSmall ? (
                      <Image
                        src={item.thumbnailSmall}
                        alt={item.itemName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg">
                        🛒
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                    <span className="text-ink-800 truncate text-sm">{item.itemName}</span>
                    <div className="flex items-center gap-1.5">
                      {item.price != null ? (
                        <span className="text-mocha-700 text-sm font-semibold">
                          {item.price.toLocaleString()}원
                        </span>
                      ) : (
                        <span className="text-ink-400 text-xs">가격 미정</span>
                      )}
                      {item.discountPct && item.discountPct > 0 && (
                        <span className="rounded bg-red-100 px-1 text-[10px] font-semibold text-red-600">
                          {Math.round(item.discountPct)}%
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export function MemoMatchDrawer({ open, itemName, onClose, onSelect }: MemoMatchDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="pb-safe max-h-[80dvh] rounded-t-2xl px-0">
        <SheetHeader className="px-4 pb-3">
          <SheetTitle className="text-base">&apos;{itemName}&apos; 상품 검색</SheetTitle>
        </SheetHeader>
        {/* key로 open/itemName 변경 시 DrawerBody 리마운트 → query/results 초기화 */}
        {open && (
          <DrawerBody key={itemName} itemName={itemName} onClose={onClose} onSelect={onSelect} />
        )}
      </SheetContent>
    </Sheet>
  );
}
