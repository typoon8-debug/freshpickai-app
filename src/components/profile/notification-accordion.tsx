"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Vote, Clapperboard, Truck, Info, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useNotificationStore } from "@/lib/store/notification-store";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/profile/notifications-inbox";
import type { NotificationItem } from "@/lib/actions/profile/notifications-inbox";

interface NotificationAccordionProps {
  initialItems: NotificationItem[];
  initialUnread: number;
}

const TYPE_ICON: Record<NotificationItem["type"], React.ReactNode> = {
  vote: <Vote size={16} className="text-mocha-500 shrink-0" />,
  movie_night: <Clapperboard size={16} className="text-mocha-500 shrink-0" />,
  delivery: <Truck size={16} className="text-mocha-500 shrink-0" />,
  system: <Info size={16} className="text-mocha-500 shrink-0" />,
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

export function NotificationAccordion({ initialItems, initialUnread }: NotificationAccordionProps) {
  const [open, setOpen] = useState(initialUnread > 0);
  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { decrement, reset, increment } = useNotificationStore();

  const unreadCount = items.filter((i) => !i.isRead).length;

  // 프로필 페이지 Realtime: 새 알림 도착 시 목록 즉시 추가
  useEffect(() => {
    const supabase = createClient();
    let uid: string | null = null;

    const setup = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      uid = session?.user?.id ?? null;
      if (!uid) return;

      const channel = supabase
        .channel("fp_notifications_accordion")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "fp_notifications",
            filter: `user_id=eq.${uid}`,
          },
          (payload) => {
            const row = payload.new as {
              id: string;
              type: NotificationItem["type"];
              title: string;
              body: string | null;
              link_url: string | null;
              is_read: boolean;
              created_at: string;
            };
            const newItem: NotificationItem = {
              id: row.id,
              type: row.type,
              title: row.title,
              body: row.body,
              linkUrl: row.link_url,
              isRead: row.is_read,
              createdAt: row.created_at,
            };
            setItems((prev) => [newItem, ...prev].slice(0, 20));
            // 아코디언이 닫혀 있으면 자동으로 열기
            setOpen(true);
            increment();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setup();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [increment]);

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      startTransition(async () => {
        await markNotificationRead(item.id);
        setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
        decrement();
      });
    }
    if (item.linkUrl) router.push(item.linkUrl);
  };

  const handleMarkAll = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      reset();
    });
  };

  return (
    <div className="border-line overflow-hidden rounded-xl border bg-white">
      {/* 헤더 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5"
      >
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-ink-500" />
          <span className="text-ink-800 text-sm font-semibold">알림</span>
          {unreadCount > 0 && (
            <span className="bg-terracotta flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn("text-ink-400 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="border-line border-t">
          {/* 모두 읽음 버튼 */}
          {unreadCount > 0 && (
            <div className="border-line flex justify-end border-b px-4 py-2">
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={isPending}
                className="text-mocha-600 flex items-center gap-1 text-xs font-medium disabled:opacity-50"
              >
                <CheckCheck size={13} />
                모두 읽음
              </button>
            </div>
          )}

          {/* 알림 목록 */}
          {items.length === 0 ? (
            <div className="text-ink-400 py-8 text-center text-sm">새 알림이 없습니다</div>
          ) : (
            <ul>
              {items.map((item, idx) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "hover:bg-mocha-50 flex w-full items-start gap-3 px-4 py-3 text-left transition",
                      idx < items.length - 1 && "border-line border-b",
                      !item.isRead && "bg-amber-50/60"
                    )}
                  >
                    <span className="mt-0.5">{TYPE_ICON[item.type]}</span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-ink-800 truncate text-sm",
                          !item.isRead && "font-semibold"
                        )}
                      >
                        {item.title}
                      </p>
                      {item.body && (
                        <p className="text-ink-500 mt-0.5 truncate text-xs">{item.body}</p>
                      )}
                    </div>
                    <span className="text-ink-300 shrink-0 text-[11px]">
                      {relativeTime(item.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
