"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { ChatBottomPanel } from "@/components/chat/chat-bottom-panel";
import { FridgeMode } from "@/components/chat/FridgeMode";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useCartStore, useChatStore } from "@/lib/store";
import { qk } from "@/lib/query-keys";
import { ChatActionEnum } from "@/lib/types";
import type { ChatActionIntent, ChatMessage } from "@/lib/types";

interface ChatShellProps {
  /** 서버에서 가져온 최근 DB 메시지 — sessionStorage가 비어있을 때만 주입 */
  initialMessages: ChatMessage[];
  /** 가장 최근 세션 요약 (배너 표시용) */
  latestSummary: { summaryText: string; keywords: string[] } | null;
}

export function ChatShell({ initialMessages, latestSummary }: ChatShellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { send, isStreaming } = useChatStream();
  const [fridgeOpen, setFridgeOpen] = useState(false);
  const addBundle = useCartStore((s) => s.addBundle);
  const removeFromCart = useCartStore((s) => s.remove);
  const initMessages = useChatStore((s) => s.initMessages);

  // 페이지 진입 시 항상 DB 기록으로 초기화 (탭 재진입·새로고침 모두 최신 대화 복원)
  useEffect(() => {
    initMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

          const tempId = `chat-${storeItemId}-${Date.now()}`;
          addBundle("", [
            {
              cartItemId: tempId,
              userId: "",
              cardId: "",
              ingredientId: undefined,
              name: name ?? "상품",
              emoji: "🛒",
              qty: 1,
              price: 0,
              unit: "개",
              refStoreItemId: storeItemId,
            },
          ]);

          try {
            const res = await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ storeItemId, qty: 1, name }),
            });
            if (res.ok) {
              toast.success(`${name ?? "상품"}을 장바구니에 담았어요`);
              void queryClient.invalidateQueries({ queryKey: qk.cart() });
            } else {
              removeFromCart(tempId);
              const data = (await res.json()) as { error?: string };
              toast.error(data.error ?? "담기 실패. 다시 시도해주세요.");
            }
          } catch {
            removeFromCart(tempId);
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
            if (res.ok) {
              toast.success("찜 목록에 추가했어요");
            } else {
              const data = (await res.json()) as { error?: string };
              toast.error(data.error ?? "찜 추가 실패.");
            }
          } catch {
            toast.error("네트워크 오류가 발생했습니다.");
          }
          break;
        }
        case ChatActionEnum.INITIATE_PAYMENT: {
          try {
            const res = await fetch("/api/payment/initiate", { method: "POST" });
            if (res.ok) {
              const data = (await res.json()) as { checkoutUrl?: string };
              router.push(data.checkoutUrl ?? "/cart");
            } else {
              const data = (await res.json()) as { error?: string };
              toast.error(data.error ?? "결제 준비 중 오류가 발생했습니다.");
            }
          } catch {
            router.push("/cart");
          }
          break;
        }
        default:
          break;
      }
    },
    [router, send, addBundle, removeFromCart, queryClient]
  );

  return (
    <div className="flex h-[calc(100dvh-80px)] flex-col">
      {fridgeOpen ? (
        <FridgeMode onClose={() => setFridgeOpen(false)} />
      ) : (
        <>
          <ChatHeader />
          <MessageList onActionSelect={handleActionSelect} latestSummary={latestSummary} />

          <ChatBottomPanel
            onFridgeOpen={() => setFridgeOpen(true)}
            onSend={send}
            disabled={isStreaming}
            isStreaming={isStreaming}
          />
        </>
      )}
    </div>
  );
}
