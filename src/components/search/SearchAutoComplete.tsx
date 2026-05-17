"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "fp_recent_searches";
const MAX_RECENT = 10;

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  const prev = getRecent().filter((s) => s !== q);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
}

function removeRecent(q: string) {
  const prev = getRecent().filter((s) => s !== q);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong className="text-mocha-700">{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </span>
  );
}

type AutoCompleteItem = {
  id: string;
  label: string;
  type: "card" | "item";
  emoji?: string;
};

interface Props {
  placeholder?: string;
  onSearch?: (q: string) => void;
  className?: string;
}

export function SearchAutoComplete({
  placeholder = "카드, 재료 검색...",
  onSearch,
  className,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutoCompleteItem[]>([]);
  const [recent, setRecent] = useState<string[]>(getRecent);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=all&limit=5`);
      if (!res.ok) return;
      const data = await res.json();
      const items: AutoCompleteItem[] = [
        ...((data.cards ?? []) as { cardId: string; name: string; emoji?: string }[]).map((c) => ({
          id: c.cardId,
          label: c.name,
          type: "card" as const,
          emoji: c.emoji,
        })),
        ...((data.items ?? []) as { storeItemId: string; itemName: string }[]).map((i) => ({
          id: i.storeItemId,
          label: i.itemName,
          type: "item" as const,
        })),
      ].slice(0, 8);
      setSuggestions(items);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 200);
  };

  const handleSubmit = (q: string) => {
    if (!q.trim()) return;
    saveRecent(q.trim());
    setRecent(getRecent());
    setOpen(false);
    if (onSearch) {
      onSearch(q.trim());
    } else {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const handleDeleteRecent = (e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    removeRecent(q);
    setRecent(getRecent());
  };

  const showDropdown =
    open && (query.length >= 2 ? suggestions.length > 0 || loading : recent.length > 0);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="border-line focus-within:border-mocha-400 relative flex items-center gap-2 rounded-xl border bg-white px-3 shadow-sm">
        <Search size={16} className="text-ink-400 shrink-0" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(query)}
          placeholder={placeholder}
          className="text-ink-800 placeholder:text-ink-400 flex-1 bg-transparent py-2.5 text-sm outline-none"
          aria-label="통합 검색"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="text-ink-400 hover:text-ink-600 p-0.5"
            aria-label="검색어 지우기"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="border-line absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-lg">
          {query.length < 2 && recent.length > 0 && (
            <>
              <p className="text-ink-400 px-3 pt-2 pb-1 text-xs font-medium">최근 검색어</p>
              {recent.map((r) => (
                <div
                  key={r}
                  className="hover:bg-mocha-50 flex cursor-pointer items-center justify-between px-3 py-2"
                  onMouseDown={() => {
                    setQuery(r);
                    handleSubmit(r);
                  }}
                  role="option"
                  aria-selected={false}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Clock size={13} className="text-ink-400" />
                    {r}
                  </span>
                  <button
                    type="button"
                    onMouseDown={(e) => handleDeleteRecent(e, r)}
                    className="text-ink-400 hover:text-ink-600 p-0.5"
                    aria-label="삭제"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </>
          )}
          {loading && <p className="text-ink-400 px-3 py-2 text-sm">검색 중...</p>}
          {!loading && suggestions.length > 0 && (
            <>
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="hover:bg-mocha-50 flex cursor-pointer items-center gap-2 px-3 py-2"
                  onMouseDown={() => {
                    setQuery(s.label);
                    handleSubmit(s.label);
                  }}
                  role="option"
                  aria-selected={false}
                >
                  <span className="text-base">{s.emoji ?? (s.type === "card" ? "🍽️" : "🛒")}</span>
                  <span className="text-ink-700 text-sm">{highlightMatch(s.label, query)}</span>
                  <span className="text-ink-400 ml-auto text-xs">
                    {s.type === "card" ? "카드" : "상품"}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
