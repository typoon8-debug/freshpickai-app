"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Brain } from "lucide-react";
import type { ChatMemoryContext } from "@/lib/types";

interface MemoryDebugPanelProps {
  context: ChatMemoryContext;
}

/**
 * 개발 모드 전용 AI 3계층 메모리 디버그 패널.
 * NODE_ENV가 'development'가 아닌 경우 null을 반환합니다.
 */
export function MemoryDebugPanel({ context }: MemoryDebugPanelProps) {
  // 프로덕션 환경에서는 렌더링하지 않음
  if (process.env.NODE_ENV !== "development") return null;

  return <MemoryDebugPanelInner context={context} />;
}

/** 실제 패널 UI — 개발 모드에서만 마운트됨 */
function MemoryDebugPanelInner({ context }: MemoryDebugPanelProps) {
  const [open, setOpen] = useState(false);

  const totalItems =
    context.recentMessages.length + context.sessionSummaries.length + context.memoryItems.length;

  return (
    <div className="border-mocha-200 bg-mocha-50 rounded-lg border text-xs">
      {/* 패널 헤더 — 클릭으로 접기/펼치기 */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-mocha-700 flex w-full items-center gap-1.5 px-3 py-2 font-medium"
      >
        <Brain size={12} />
        <span>Memory Debug ({totalItems})</span>
        {open ? (
          <ChevronUp size={12} className="ml-auto" />
        ) : (
          <ChevronDown size={12} className="ml-auto" />
        )}
      </button>

      {/* 펼쳐진 상태 — 3계층 각각 표시 */}
      {open && (
        <div className="border-mocha-200 space-y-2 border-t px-3 py-2">
          {/* Layer 1 — 원문 메시지 */}
          <div>
            <p className="text-mocha-700 font-semibold">
              Layer 1 — 원문 ({context.recentMessages.length})
            </p>
            {context.recentMessages.length === 0 ? (
              <p className="text-ink-400 italic">없음</p>
            ) : (
              context.recentMessages.map((m) => (
                <p key={m.messageId} className="text-ink-600 truncate">
                  [{m.role}] {m.content}
                </p>
              ))
            )}
          </div>

          {/* Layer 2 — 세션 요약 */}
          <div>
            <p className="text-mocha-700 font-semibold">
              Layer 2 — 요약 ({context.sessionSummaries.length})
            </p>
            {context.sessionSummaries.length === 0 ? (
              <p className="text-ink-400 italic">없음</p>
            ) : (
              context.sessionSummaries.map((s) => (
                <p key={s.summaryId} className="text-ink-600 truncate">
                  {s.summaryText}
                </p>
              ))
            )}
          </div>

          {/* Layer 3 — 장기 기억 */}
          <div>
            <p className="text-mocha-700 font-semibold">
              Layer 3 — 장기기억 ({context.memoryItems.length})
            </p>
            {context.memoryItems.length === 0 ? (
              <p className="text-ink-400 italic">없음</p>
            ) : (
              context.memoryItems.map((m) => (
                <p key={m.memoryId} className="text-ink-600 truncate">
                  [{m.importanceScore.toFixed(1)}] {m.content}
                </p>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
