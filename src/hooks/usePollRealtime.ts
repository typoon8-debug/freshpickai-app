"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PollResult } from "@/lib/types";

interface UsePollRealtimeOptions {
  pollId: string | null;
  groupId: string | null;
  initialResults?: PollResult[];
  initialMyVoteOptionId?: string | null;
}

interface UsePollRealtimeReturn {
  results: PollResult[];
  myVoteOptionId: string | null;
  totalVoted: number;
  isConnected: boolean;
}

export function usePollRealtime({
  pollId,
  groupId,
  initialResults = [],
  initialMyVoteOptionId = null,
}: UsePollRealtimeOptions): UsePollRealtimeReturn {
  const [results, setResults] = useState<PollResult[]>(initialResults);
  const [myVoteOptionId] = useState<string | null>(initialMyVoteOptionId);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  // initialResults prop 변경 시 동기화
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResults(initialResults);
  }, [initialResults]);

  useEffect(() => {
    if (!pollId || !groupId) return;

    const supabase = createClient();

    channelRef.current = supabase
      .channel(`fp-poll-${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fp_poll_vote",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          // DB row는 snake_case 그대로 수신됨
          type RawVote = { option_id: string; user_id: string };

          setResults((prev) => {
            const next = prev.map((r) => ({ ...r, voterNames: [...r.voterNames] }));

            if (eventType === "INSERT") {
              const vote = newRow as RawVote;
              return next.map((r) =>
                r.optionId === vote.option_id ? { ...r, count: r.count + 1 } : r
              );
            }

            if (eventType === "UPDATE") {
              const oldVote = oldRow as RawVote;
              const newVote = newRow as RawVote;
              return next.map((r) => {
                if (r.optionId === oldVote.option_id)
                  return { ...r, count: Math.max(0, r.count - 1) };
                if (r.optionId === newVote.option_id) return { ...r, count: r.count + 1 };
                return r;
              });
            }

            if (eventType === "DELETE") {
              const vote = oldRow as RawVote;
              return next.map((r) =>
                r.optionId === vote.option_id ? { ...r, count: Math.max(0, r.count - 1) } : r
              );
            }

            return next;
          });
        }
      )
      .subscribe((status) => setIsConnected(status === "SUBSCRIBED"));

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [pollId, groupId]);

  const totalVoted = results.reduce((sum, r) => sum + r.count, 0);

  return { results, myVoteOptionId, totalVoted, isConnected };
}
