"use client";

import { ShoppingCart } from "lucide-react";

interface MemoFooterProps {
  selectedCount: number;
  onAddToCart: () => void;
}

export function MemoFooter({ selectedCount, onAddToCart }: MemoFooterProps) {
  return (
    <div className="border-line fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 px-4 py-3 backdrop-blur-sm">
      <button
        type="button"
        onClick={onAddToCart}
        disabled={selectedCount === 0}
        className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-40"
      >
        <ShoppingCart size={16} />
        {selectedCount > 0 ? `${selectedCount}개 항목 장바구니에 추가` : "항목을 선택해주세요"}
      </button>
    </div>
  );
}
