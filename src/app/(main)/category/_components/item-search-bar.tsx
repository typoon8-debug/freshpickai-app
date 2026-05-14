"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface ItemSearchBarProps {
  value: string;
  onChange: (q: string) => void;
  placeholder?: string;
}

export function ItemSearchBar({
  value,
  onChange,
  placeholder = "재료·상품을 검색해보세요",
}: ItemSearchBarProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (v: string) => {
    setLocal(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 300);
  };

  const handleClear = () => {
    setLocal("");
    onChange("");
  };

  return (
    <div className="relative flex items-center">
      <Search className="text-ink-400 pointer-events-none absolute left-3 h-4 w-4" />
      <input
        type="search"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="border-line bg-paper text-ink-800 placeholder:text-ink-300 focus:border-mocha-500 focus:ring-mocha-200 w-full rounded-xl border py-2.5 pr-10 pl-9 text-sm outline-none focus:ring-2"
      />
      {local && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full"
          aria-label="검색어 지우기"
        >
          <X className="text-ink-400 h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
