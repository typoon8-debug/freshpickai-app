import { getMemoryItems } from "@/lib/actions/chat/memory-manage";
import { AiMemoryClient } from "./ai-memory-client";

export default async function AiMemoryPage() {
  const items = await getMemoryItems();
  return <AiMemoryClient initialItems={items} />;
}
