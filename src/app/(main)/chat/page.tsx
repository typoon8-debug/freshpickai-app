import { getRecentChatHistory } from "@/lib/actions/chat/history";
import { ChatShell } from "@/components/chat/chat-shell";

export default async function ChatPage() {
  const { messages, latestSummary } = await getRecentChatHistory(30);

  return <ChatShell initialMessages={messages} latestSummary={latestSummary} />;
}
