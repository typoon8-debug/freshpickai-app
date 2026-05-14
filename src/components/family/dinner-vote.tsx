"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown, Clock, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoteCountdown } from "@/hooks/use-vote-countdown";
import { useFamilyVoteRealtime } from "@/hooks/useFamilyVoteRealtime";
import { castVote, removeVote } from "@/lib/actions/family/vote";
import type { VoteSessionRecord, VoteResult } from "@/lib/types";

interface VoteCardItem {
  cardId: string;
  name: string;
  emoji: string;
}

interface DinnerVoteProps {
  session: VoteSessionRecord | null;
  voteItems: VoteCardItem[];
  initialResults: VoteResult[];
  initialMyVotes: Record<string, "like" | "dislike">;
}

export function DinnerVote({
  session,
  voteItems,
  initialResults,
  initialMyVotes,
}: DinnerVoteProps) {
  const [isPending, startTransition] = useTransition();

  // 클라이언트 마운트 후 VoteSession 형식 변환
  const voteSession = session
    ? {
        sessionId: session.sessionId,
        endsAt: session.endsAt,
        isPaused: false,
        pausedRemainingMs: null,
        status: session.status as "open" | "closed",
      }
    : null;

  const { formatted, isExpired } = useVoteCountdown(voteSession);

  // Supabase Realtime 투표 동기화
  const { voteResults, isConnected } = useFamilyVoteRealtime({
    groupId: session?.groupId ?? null,
    sessionId: session?.sessionId ?? null,
    initialResults,
  });

  // 낙관적 UI: 내 투표 상태
  const [optimisticMyVotes, updateOptimisticMyVotes] = useOptimistic(
    initialMyVotes,
    (
      state: Record<string, "like" | "dislike">,
      update: { cardId: string; voteType: "like" | "dislike" | null }
    ) => {
      if (update.voteType === null) {
        const next = { ...state };
        delete next[update.cardId];
        return next;
      }
      return { ...state, [update.cardId]: update.voteType };
    }
  );

  const [clientReady, setClientReady] = useState(false);
  useEffect(() => {
    // SSR hydration 후 클라이언트 마운트 감지 (타이머/Realtime 아이콘 활성화)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClientReady(true);
  }, []);

  const handleVote = (cardId: string, type: "like" | "dislike") => {
    if (isExpired || !session || isPending) return;

    const current = optimisticMyVotes[cardId];
    const isToggleOff = current === type;

    startTransition(async () => {
      updateOptimisticMyVotes({
        cardId,
        voteType: isToggleOff ? null : type,
      });

      if (isToggleOff) {
        await removeVote(session.sessionId, cardId);
      } else {
        await castVote(session.groupId, session.sessionId, cardId, type);
      }
    });
  };

  // 세션 없음
  if (!session) {
    return (
      <section className="px-4">
        <h3 className="text-ink-700 mb-3 text-sm font-semibold">이번 주 뭐 먹지? 🗳️</h3>
        <div className="border-line rounded-lg border bg-white p-4 text-center">
          <p className="text-ink-400 text-sm">현재 진행 중인 투표가 없어요</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-ink-700 text-sm font-semibold">{session.title} 🗳️</h3>
          {/* Realtime 연결 상태 표시 */}
          {clientReady &&
            (isConnected ? (
              <Wifi size={11} className="text-sage" aria-label="실시간 연결됨" />
            ) : (
              <WifiOff size={11} className="text-ink-300" aria-label="연결 중…" />
            ))}
        </div>
        <div
          className={cn("flex items-center gap-1", isExpired ? "text-ink-400" : "text-terracotta")}
        >
          <Clock size={12} />
          <span className="font-mono text-[11px] font-medium tabular-nums">
            {clientReady ? formatted : "계산 중…"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {voteItems.map((item) => {
          const result = voteResults.find((r) => r.cardId === item.cardId) ?? {
            cardId: item.cardId,
            likeCount: 0,
            dislikeCount: 0,
          };
          const total = result.likeCount + result.dislikeCount;
          const upPct = total > 0 ? Math.round((result.likeCount / total) * 100) : 0;
          const myVote = optimisticMyVotes[item.cardId] ?? null;

          return (
            <div
              key={item.cardId}
              data-testid={`vote-item-${item.cardId}`}
              className="border-line overflow-hidden rounded-lg border bg-white"
            >
              <div className="flex items-center gap-3 p-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-ink-900 text-sm font-semibold">{item.name}</p>
                  <div className="bg-mocha-100 mt-1.5 h-1.5 overflow-hidden rounded-full">
                    <div
                      className="bg-sage h-full rounded-full transition-all duration-500"
                      style={{ width: `${upPct}%` }}
                    />
                  </div>
                  <p className="text-ink-400 mt-1 text-[11px]">
                    찬성 {upPct}% ({result.likeCount}표)
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    data-testid={`vote-like-${item.cardId}`}
                    onClick={() => handleVote(item.cardId, "like")}
                    disabled={isExpired || isPending}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-50",
                      myVote === "like" ? "bg-sage/20 text-sage" : "bg-mocha-50 text-ink-400"
                    )}
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <button
                    type="button"
                    data-testid={`vote-dislike-${item.cardId}`}
                    onClick={() => handleVote(item.cardId, "dislike")}
                    disabled={isExpired || isPending}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-50",
                      myVote === "dislike"
                        ? "bg-terracotta/10 text-terracotta"
                        : "bg-mocha-50 text-ink-400"
                    )}
                  >
                    <ThumbsDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
