"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Refrigerator } from "lucide-react";
import { toast } from "sonner";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { QuickChips } from "@/components/chat/quick-chips";
import { ChatInput } from "@/components/chat/chat-input";
import { FridgeMode } from "@/components/chat/FridgeMode";
import { useChatStream } from "@/hooks/use-chat-stream";
import { ChatActionEnum } from "@/lib/types";
import type { ChatActionIntent } from "@/lib/types";

export default function ChatPage() {
  const router = useRouter();
  const { send, isStreaming } = useChatStream();
  const [fridgeOpen, setFridgeOpen] = useState(false);

  const handleActionSelect = useCallback(
    async (intent: ChatActionIntent) => {
      switch (intent.action) {
        case ChatActionEnum.VIEW_CARD: {
          const cardId = intent.payload?.cardId as string | undefined;
          if (cardId) router.push(`/cards/${cardId}`);
          break;
        }
        case ChatActionEnum.SEARCH_MORE: {
          const query = intent.payload?.query as string | undefined;
          if (query) void send(query);
          break;
        }
        case ChatActionEnum.CONFIRM_YES:
        case ChatActionEnum.CONFIRM_NO: {
          void send(intent.label);
          break;
        }
        case ChatActionEnum.ADD_TO_CART: {
          const storeItemId = intent.payload?.storeItemId as string | undefined;
          const name = intent.payload?.name as string | undefined;
          if (!storeItemId) {
            toast.error("상품 정보가 없습니다.");
            break;
          }
          try {
            const res = await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ storeItemId, qty: 1, name }),
            });
            if (res.ok) {
              toast.success(`${name ?? "상품"}을 장바구니에 담았어요`);
            } else {
              toast.error("담기 실패. 다시 시도해주세요.");
            }
          } catch {
            toast.error("네트워크 오류가 발생했습니다.");
          }
          break;
        }
        case ChatActionEnum.ADD_TO_WISHLIST: {
          const itemId = intent.payload?.itemId as string | undefined;
          if (!itemId) break;
          try {
            const res = await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ itemId }),
            });
            if (res.ok) toast.success("찜 목록에 추가했어요");
            else toast.error("찜 추가 실패.");
          } catch {
            toast.error("네트워크 오류가 발생했습니다.");
          }
          break;
        }
        case ChatActionEnum.INITIATE_PAYMENT: {
          router.push("/cart");
          break;
        }
        default:
          break;
      }
    },
    [router, send]
  );

  return (
    <div className="flex h-[calc(100dvh-80px)] flex-col">
      {fridgeOpen ? (
        <FridgeMode onClose={() => setFridgeOpen(false)} />
      ) : (
        <>
          <ChatHeader />
          <MessageList onActionSelect={handleActionSelect} />

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
