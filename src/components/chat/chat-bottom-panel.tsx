"use client";

import { startTransition, useEffect, useState } from "react";
import { useDrag } from "@use-gesture/react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Refrigerator } from "lucide-react";
import { QuickChips } from "@/components/chat/quick-chips";
import { ChatInput } from "@/components/chat/chat-input";

interface ChatBottomPanelProps {
  onFridgeOpen: () => void;
  onSend: (text: string, chipKey?: string) => void;
  disabled: boolean;
  isStreaming: boolean;
}

export function ChatBottomPanel({
  onFridgeOpen,
  onSend,
  disabled,
  isStreaming,
}: ChatBottomPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // AI 스트리밍 시작 시 자동 접힘 (startTransition으로 cascading render 방지)
  useEffect(() => {
    if (isStreaming) startTransition(() => setIsExpanded(false));
  }, [isStreaming]);

  const bind = useDrag(
    ({ direction: [, dirY], distance: [, distY], last }) => {
      if (!last) return;
      if (dirY > 0 && distY > 50) setIsExpanded(false); // 아래로 → 접힘
      if (dirY < 0 && distY > 50) setIsExpanded(true); // 위로 → 펼침
    },
    { axis: "y" }
  );

  const handleSend = (text: string, chipKey?: string) => {
    setIsExpanded(false); // 메시지 전송 시 접힘
    onSend(text, chipKey);
  };

  return (
    <div className="border-line bg-paper border-t">
      {/* 드래그 핸들바 + 아코디언 상태 표시 */}
      <div
        {...bind()}
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex h-8 cursor-grab touch-none flex-col items-center justify-center gap-0.5 active:cursor-grabbing"
        aria-label={isExpanded ? "접기" : "펼치기"}
      >
        <div className="bg-mocha-200 h-1 w-8 rounded-full" />
        <span className="text-mocha-400 flex items-center gap-0.5 text-[10px] leading-none select-none">
          {isExpanded ? (
            <>
              <ChevronDown size={10} />
              접기
            </>
          ) : (
            <>
              <ChevronUp size={10} />
              펼치기
            </>
          )}
        </span>
      </div>

      {/* 아코디언 영역 — 냉장고 버튼 + 빠른 칩 */}
      <motion.div
        initial={false}
        variants={{
          open: { height: "auto", opacity: 1 },
          closed: { height: 0, opacity: 0 },
        }}
        animate={isExpanded ? "open" : "closed"}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        style={{ overflow: "hidden" }}
      >
        <div className="px-4 pt-1 pb-2">
          <button
            type="button"
            onClick={onFridgeOpen}
            className="border-mocha-200 text-mocha-700 hover:bg-mocha-50 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition"
          >
            <Refrigerator size={16} />
            냉장고 비우기 모드
          </button>
        </div>
        <QuickChips onSelect={handleSend} disabled={disabled} />
      </motion.div>

      {/* 채팅 입력 — 항상 표시 */}
      <ChatInput onSend={(text) => handleSend(text)} disabled={disabled} />
    </div>
  );
}
