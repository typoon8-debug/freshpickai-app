"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/store";
import { Message } from "./message";
import { ToolCallIndicator } from "./tool-call-indicator";

export function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const currentTool = useChatStore((s) => s.currentTool);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <div className="bg-mocha-100 flex h-16 w-16 items-center justify-center rounded-full">
          <span className="text-3xl">🤖</span>
        </div>
        <p className="text-ink-700 font-semibold">FreshPick AI에게 물어보세요</p>
        <p className="text-ink-400 text-sm leading-relaxed">
          오늘 뭐 먹을지, 가족 취향에 맞는 메뉴,
          <br />
          특별한 날 요리까지 함께 찾아드릴게요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      {messages.map((msg, idx) => {
        const isLastAi = idx === messages.length - 1 && msg.role === "ai";
        const isLastStreaming = isStreaming && isLastAi;
        // 스트리밍 중 도구 호출 상태를 마지막 AI 메시지에 주입
        const msgWithTool = isLastStreaming && currentTool ? { ...msg, currentTool } : msg;

        return (
          <div key={msg.id} className="flex flex-col gap-2">
            <Message message={msgWithTool} isStreaming={isLastStreaming} />
            {/* 도구 호출 중 — 텍스트가 비어있을 때만 별도 표시 */}
            {isLastStreaming && msg.text === "" && currentTool && (
              <div className="ml-9">
                <ToolCallIndicator
                  toolName={currentTool as Parameters<typeof ToolCallIndicator>[0]["toolName"]}
                  status="running"
                />
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
