"use client";

import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { QuickChips } from "@/components/chat/quick-chips";
import { ChatInput } from "@/components/chat/chat-input";
import { useChatStream } from "@/hooks/use-chat-stream";

export default function ChatPage() {
  const { send, isStreaming } = useChatStream();

  return (
    <div className="flex h-[calc(100dvh-80px)] flex-col">
      <ChatHeader />
      <MessageList />
      <QuickChips onSelect={send} disabled={isStreaming} />
      <ChatInput onSend={send} disabled={isStreaming} />
    </div>
  );
}
