"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedItem } from "@/app/api/memo/parse/route";

export type { ParsedItem };

interface MemoInputProps {
  onParsed: (items: ParsedItem[], rawText: string) => void;
}

export function MemoInput({ onParsed }: MemoInputProps) {
  const [text, setText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX_CHARS = 500;

  const handleParse = async () => {
    if (!text.trim()) return;
    setIsParsing(true);
    setError(null);

    try {
      const res = await fetch("/api/memo/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "파싱 실패");
      }

      const items = (await res.json()) as ParsedItem[];
      onParsed(items, text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "파싱 중 오류가 발생했습니다.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="border-line overflow-hidden rounded-lg border bg-white">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder={"계란2판 새우깡3봉지 저녁찬거리\n(자유롭게 입력하세요)"}
          rows={5}
          className="text-ink-900 placeholder:text-ink-300 w-full resize-none p-3 text-sm outline-none"
        />
        <div className="border-line flex items-center justify-end border-t px-3 py-1.5">
          <span
            className={cn("text-xs", text.length >= MAX_CHARS ? "text-terracotta" : "text-ink-300")}
          >
            {text.length}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {error && <p className="text-terracotta text-xs">{error}</p>}

      <button
        type="button"
        onClick={handleParse}
        disabled={!text.trim() || isParsing}
        className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
      >
        <Sparkles size={15} />
        {isParsing ? "AI 파싱 중..." : "AI로 파싱하기"}
      </button>
    </div>
  );
}
