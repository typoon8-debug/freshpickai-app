"use client";

import { useState } from "react";
import { Refrigerator } from "lucide-react";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { QuickChips } from "@/components/chat/quick-chips";
import { ChatInput } from "@/components/chat/chat-input";
import { FridgeMode } from "@/components/chat/FridgeMode";
import { useChatStream } from "@/hooks/use-chat-stream";

export default function ChatPage() {
  const { send, isStreaming } = useChatStream();
  const [fridgeOpen, setFridgeOpen] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-80px)] flex-col">
      {fridgeOpen ? (
        <FridgeMode onClose={() => setFridgeOpen(false)} />
      ) : (
        <>
          <ChatHeader />
          <MessageList />

          {/* 냉장고 비우기 버튼 */}
          <div className="border-line border-t px-4 py-2">
            <button
              type="button"
              onClick={() => setFridgeOpen(true)}
              className="border-mocha-200 text-mocha-700 hover:bg-mocha-50 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition"
            >
              <Refrigerator size={16} />
              냉장고 비우기 모드
            </button>
          </div>

          <QuickChips onSelect={send} disabled={isStreaming} />
          <ChatInput onSend={send} disabled={isStreaming} />
        </>
      )}
    </div>
  );
}
