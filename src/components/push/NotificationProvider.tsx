"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUnreadCount } from "@/lib/actions/profile/notifications-inbox";
import { useNotificationStore } from "@/lib/store/notification-store";

export function NotificationProvider() {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const increment = useNotificationStore((s) => s.increment);
  const reset = useNotificationStore((s) => s.reset);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let subscribedUserId: string | null = null;

    const setup = async (uid: string) => {
      // 동일 사용자로 이미 구독 중이면 중복 방지 (onAuthStateChange 다중 발화 대응)
      if (subscribedUserId === uid) return;

      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
      subscribedUserId = uid;

      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch {
        // fp_notifications 테이블 미생성 등 오류 무시
      }

      channel = supabase
        .channel("fp_notifications_badge")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "fp_notifications",
            filter: `user_id=eq.${uid}`,
          },
          () => increment()
        )
        .subscribe();
    };

    // INITIAL_SESSION·SIGNED_IN 모두 처리 (onAuthStateChange는 등록 즉시 현재 상태를 발화)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        reset();
        if (channel) {
          supabase.removeChannel(channel);
          channel = null;
          subscribedUserId = null;
        }
      } else if (session?.user) {
        setup(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, [setUnreadCount, increment, reset]);

  return null;
}
