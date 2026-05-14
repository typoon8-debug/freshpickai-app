"use client";

import Link from "next/link";
import { CheckCircle2, ClipboardList } from "lucide-react";
import type { MemoAddedItem } from "@/lib/types";

interface AddToMemoConfirmCardProps {
  items: MemoAddedItem[];
}

export function AddToMemoConfirmCard({ items }: AddToMemoConfirmCardProps) {
  return (
    <div
      className="border-mocha-200 bg-mocha-50 w-full rounded-xl border p-3"
      data-testid="add-to-memo-confirm"
    >
      {/* 헤더 */}
      <div className="mb-2 flex items-center gap-1.5">
        <CheckCircle2 size={14} className="text-mocha-600 flex-shrink-0" />
        <span className="text-mocha-700 text-xs font-semibold">장보기 메모에 추가됐어요!</span>
      </div>

      {/* 품목 목록 */}
      <ul className="mb-3 space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-ink-700 flex items-center gap-1 text-xs">
            <span className="text-mocha-400">•</span>
            <span className="font-medium">{item.name}</span>
            <span className="text-ink-400">
              {item.qty}
              {item.unit}
            </span>
          </li>
        ))}
      </ul>

      {/* 메모 보기 버튼 */}
      <Link
        href="/memo"
        className="bg-mocha-700 text-paper hover:bg-mocha-900 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition"
        data-testid="go-to-memo-btn"
      >
        <ClipboardList size={13} />
        메모 보기
      </Link>
    </div>
  );
}
