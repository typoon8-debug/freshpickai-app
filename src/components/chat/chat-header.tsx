"use client";

import { Sparkles, Wifi } from "lucide-react";
import { useChatStore } from "@/lib/store";

export function ChatHeader() {
  const isStreaming = useChatStore((s) => s.isStreaming);

  return (
    <header className="bg-paper/95 border-line sticky top-0 z-10 flex h-14 items-center border-b px-4 backdrop-blur-sm">
      <div className="flex flex-1 items-center gap-2">
        <div className="bg-mocha-700 flex h-8 w-8 items-center justify-center rounded-full">
          <Sparkles size={16} className="text-paper" />
        </div>
        <div>
          <p className="text-ink-900 text-sm leading-none font-semibold">FreshPick AI</p>
          <p className="text-ink-400 mt-0.5 text-[11px]">
            {isStreaming ? "응답 생성 중..." : "온라인"}
          </p>
        </div>
      </div>

      {/* RAG 인디케이터 */}
      <div className="flex items-center gap-1.5 rounded-full bg-olive-100 px-2.5 py-1">
        <Wifi size={11} className="text-olive-700" />
        <span className="text-[11px] font-medium text-olive-700">RAG 연결됨</span>
      </div>
    </header>
  );
}
