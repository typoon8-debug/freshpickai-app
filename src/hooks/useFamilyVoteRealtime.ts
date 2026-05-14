"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { VoteResult } from "@/lib/types";

interface UseFamilyVoteRealtimeOptions {
  groupId: string | null;
  sessionId: string | null;
  initialResults?: VoteResult[];
}

interface UseFamilyVoteRealtimeReturn {
  voteResults: VoteResult[];
  isConnected: boolean;
}

/**
 * Supabase Realtime postgres_changes 구독으로 투표 결과를 실시간 동기화.
 * 가족 그룹 구성원만 접근 가능 (RLS 적용).
 */
export function useFamilyVoteRealtime({
  groupId,
  sessionId,
  initialResults = [],
}: UseFamilyVoteRealtimeOptions): UseFamilyVoteRealtimeReturn {
  const [voteResults, setVoteResults] = useState<VoteResult[]>(initialResults);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  useEffect(() => {
    // 서버에서 전달된 initialResults prop 변경 시 클라이언트 상태 동기화
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoteResults(initialResults);
  }, [initialResults]);

  useEffect(() => {
    if (!groupId || !sessionId) return;

    const supabase = createClient();
    const channelName = `family-vote-${groupId}-${sessionId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE 모두 수신
          schema: "public",
          table: "fp_family_vote",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as {
            card_id: string;
            vote_type: string;
          } | null;

          if (!row) return;

          setVoteResults((prev) => {
            const map = new Map(prev.map((r) => [r.cardId, { ...r }]));

            if (payload.eventType === "INSERT") {
              const existing = map.get(row.card_id) ?? {
                cardId: row.card_id,
                likeCount: 0,
                dislikeCount: 0,
              };
              if (row.vote_type === "like") existing.likeCount++;
              else existing.dislikeCount++;
              map.set(row.card_id, existing);
            } else if (payload.eventType === "UPDATE") {
              const oldRow = payload.old as { card_id: string; vote_type: string };
              const existing = map.get(row.card_id) ?? {
                cardId: row.card_id,
                likeCount: 0,
                dislikeCount: 0,
              };
              // 이전 투표 취소 후 새 투표 반영
              if (oldRow.vote_type === "like")
                existing.likeCount = Math.max(0, existing.likeCount - 1);
              else existing.dislikeCount = Math.max(0, existing.dislikeCount - 1);
              if (row.vote_type === "like") existing.likeCount++;
              else existing.dislikeCount++;
              map.set(row.card_id, existing);
            } else if (payload.eventType === "DELETE") {
              const delRow = payload.old as { card_id: string; vote_type: string };
              const existing = map.get(delRow.card_id);
              if (existing) {
                if (delRow.vote_type === "like")
                  existing.likeCount = Math.max(0, existing.likeCount - 1);
                else existing.dislikeCount = Math.max(0, existing.dislikeCount - 1);
                map.set(delRow.card_id, existing);
              }
            }

            return Array.from(map.values());
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [groupId, sessionId]);

  return { voteResults, isConnected };
}
