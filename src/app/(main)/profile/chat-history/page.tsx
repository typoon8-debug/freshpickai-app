import { getChatSessionSummaries } from "@/lib/actions/chat/session-list";
import { ChatHistoryClient } from "./chat-history-client";

export default async function ChatHistoryPage() {
  const sessions = await getChatSessionSummaries();
  return <ChatHistoryClient sessions={sessions} />;
}
