"use client";

import { Sparkles, Wifi, Heart, ShoppingCart, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useSyncExternalStore } from "react";
import { useChatStore, useCartStore } from "@/lib/store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useNotificationStore } from "@/lib/store/notification-store";
import { cn } from "@/lib/utils";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

type HealthResponse = { checks: { db: boolean } };

function useRagStatus() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      fetch("/api/health")
        .then((r) => r.json() as Promise<HealthResponse>)
        .then((data) => setConnected(data.checks?.db === true))
        .catch(() => setConnected(false));
    };
    check();
    // 30초마다 재확인
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  return connected;
}

export function ChatHeader() {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const currentTool = useChatStore((s) => s.currentTool);
  const router = useRouter();
  const mounted = useIsMounted();

  const cartCount = useCartStore((s) => s.items.length);
  const wishCount = useWishlistStore((s) => s.ids.size);
  const notifCount = useNotificationStore((s) => s.unreadCount);
  const ragConnected = useRagStatus();

  // RAG 툴이 실행 중이거나 DB가 연결된 경우 녹색, 툴 활성 시 깜박임 추가
  const isRagActive = currentTool !== null;

  return (
    <header className="bg-paper/95 border-line sticky top-0 z-10 flex h-14 items-center border-b px-4 backdrop-blur-sm">
      <div className="flex flex-1 items-center gap-2">
        <div className="bg-mocha-700 flex h-8 w-8 items-center justify-center rounded-full">
          <Sparkles size={16} className="text-paper" />
        </div>
        <div>
          <p className="text-ink-900 text-sm leading-none font-semibold">FreshPick AI</p>
          <p className="text-ink-400 mt-0.5 text-[11px]">
            {isStreaming ? "응답 생성 중..." : "온라인"}
          </p>
        </div>
      </div>

      {/* 우측 아이콘 메뉴 */}
      <div className="flex items-center gap-0.5">
        {/* RAG 연결 상태 — 녹색(연결/활성) / 회색(미연결·로딩) */}
        <div
          className="relative flex h-9 w-9 items-center justify-center rounded-lg"
          title={
            isRagActive ? "RAG 검색 중..." : ragConnected === true ? "RAG 연결됨" : "RAG 연결 안됨"
          }
        >
          <Wifi
            size={18}
            className={cn(
              "transition-colors duration-300",
              isRagActive
                ? "animate-pulse text-green-500"
                : ragConnected === true
                  ? "text-green-500"
                  : "text-ink-300"
            )}
          />
        </div>

        {/* 찜 */}
        <button
          type="button"
          onClick={() => router.push("/wishlist")}
          className="hover:bg-mocha-50 relative flex h-9 w-9 items-center justify-center rounded-lg transition"
          aria-label="찜 목록"
        >
          <Heart size={18} className="text-ink-500" />
          {mounted && wishCount > 0 && (
            <span className="bg-terracotta absolute top-1.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
              {wishCount > 99 ? "99+" : wishCount}
            </span>
          )}
        </button>

        {/* 장바구니 */}
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="hover:bg-mocha-50 relative flex h-9 w-9 items-center justify-center rounded-lg transition"
          aria-label="장바구니"
        >
          <ShoppingCart size={18} className="text-ink-500" />
          {mounted && cartCount > 0 && (
            <span className="bg-mocha-700 absolute top-1.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>

        {/* 마이프레시 */}
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="hover:bg-mocha-50 relative flex h-9 w-9 items-center justify-center rounded-lg transition"
          aria-label="마이프레시"
        >
          <User size={18} className="text-ink-500" />
          {mounted && notifCount > 0 && (
            <span className="bg-terracotta absolute top-1.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
              {notifCount > 99 ? "99+" : notifCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
