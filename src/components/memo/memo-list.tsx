"use client";

import { useEffect, useState } from "react";
import { ChevronRight, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { ShoppingMemo } from "@/lib/types";
import { getMemosAction, deleteMemoAction } from "@/lib/actions/memo";

type SavedMemo = ShoppingMemo & { itemCount: number };

interface MemoListProps {
  onSelect?: (memo: ShoppingMemo) => void;
}

export function MemoList({ onSelect }: MemoListProps) {
  const [memos, setMemos] = useState<SavedMemo[]>([]);
  // 초기값 true → 마운트 시 즉시 로딩 상태 표시
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemosAction().then((data) => {
      setMemos(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (e: React.MouseEvent, memoId: string) => {
    e.stopPropagation();
    const result = await deleteMemoAction(memoId);
    if (!result.error) {
      setMemos((prev) => prev.filter((m) => m.memoId !== memoId));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-ink-100 h-16 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (memos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <FileText size={36} className="text-ink-200" />
        <p className="text-ink-400 text-sm">저장된 메모가 없어요</p>
        <p className="text-ink-300 text-xs">새 메모 탭에서 메모를 저장해보세요</p>
      </div>
    );
  }

  return (
    <div className="border-line overflow-hidden rounded-lg border bg-white">
      {memos.map((memo, idx) => (
        <div
          key={memo.memoId}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-3",
            idx < memos.length - 1 && "border-line border-b"
          )}
        >
          <button
            type="button"
            onClick={() => onSelect?.(memo)}
            className="hover:bg-mocha-50 flex min-w-0 flex-1 items-center gap-3 text-left transition"
          >
            <FileText size={18} className="text-mocha-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-ink-900 text-sm font-semibold">{memo.title}</p>
              <p className="text-ink-400 mt-0.5 truncate text-xs">{memo.rawText}</p>
            </div>
            <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
              <span className="text-ink-400 text-xs">{formatDate(memo.createdAt)}</span>
              <span className="text-mocha-500 text-[11px]">{memo.itemCount}개 항목</span>
            </div>
            <ChevronRight size={15} className="text-ink-300 flex-shrink-0" />
          </button>

          <button
            type="button"
            onClick={(e) => handleDelete(e, memo.memoId)}
            className="text-ink-300 hover:text-terracotta flex-shrink-0 p-1 transition"
            aria-label="메모 삭제"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
