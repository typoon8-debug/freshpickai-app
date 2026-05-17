"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Bell, CheckCircle2, Wifi, WifiOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { castPollVote, cancelPollVote, sendPollReminder } from "@/lib/actions/family/poll";
import { usePollRealtime } from "@/hooks/usePollRealtime";
import type { FpPoll, PollResult } from "@/lib/types";

interface PollCardProps {
  poll: FpPoll;
  initialResults: PollResult[];
  initialMyVoteOptionId: string | null;
  totalTargeted: number;
  currentUserId: string;
}

export function PollCard({
  poll,
  initialResults,
  initialMyVoteOptionId,
  totalTargeted,
  currentUserId,
}: PollCardProps) {
  const { results, totalVoted, isConnected } = usePollRealtime({
    pollId: poll.pollId,
    groupId: poll.groupId,
    initialResults,
    initialMyVoteOptionId,
  });

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(initialMyVoteOptionId);
  const [isPending, startTransition] = useTransition();
  const isClosed = poll.status !== "open" || new Date(poll.endsAt) < new Date();

  function handleVote(optionId: string) {
    if (isClosed || isPending) return;

    const isDeselect = selectedOptionId === optionId;
    const prev = selectedOptionId;
    setSelectedOptionId(isDeselect ? null : optionId);

    startTransition(async () => {
      if (isDeselect) {
        const res = await cancelPollVote(poll.pollId);
        if (!res.ok) {
          setSelectedOptionId(prev);
          toast.error("취소 실패");
        }
      } else {
        const res = await castPollVote({ pollId: poll.pollId, groupId: poll.groupId, optionId });
        if (!res.ok) {
          setSelectedOptionId(prev);
          toast.error("투표 실패");
        }
      }
    });
  }

  function handleReminder() {
    startTransition(async () => {
      const res = await sendPollReminder(poll.pollId);
      if (res.ok) toast.success("미투표 가족에게 알림을 보냈어요 🔔");
      else toast.error("알림 발송 실패");
    });
  }

  const maxCount = Math.max(...results.map((r) => r.count), 1);

  return (
    <div className="bg-card space-y-4 rounded-2xl border p-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-sm leading-snug font-semibold">{poll.title}</p>
          {!isClosed && (
            <p className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(poll.endsAt), { addSuffix: true, locale: ko })} 마감
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isClosed ? (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Lock className="h-3 w-3" /> 마감
            </Badge>
          ) : (
            <>
              {isConnected ? (
                <Wifi className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <WifiOff className="text-muted-foreground h-3.5 w-3.5 animate-pulse" />
              )}
              <span className="text-muted-foreground text-xs">
                {totalVoted}/{totalTargeted}명
              </span>
            </>
          )}
        </div>
      </div>

      {/* 선택 항목 */}
      <div className="space-y-2">
        {results.map((result) => {
          const isSelected = selectedOptionId === result.optionId;
          const isWinner = isClosed && result.count === maxCount && result.count > 0;
          const pct = totalVoted > 0 ? Math.round((result.count / totalVoted) * 100) : 0;

          return (
            <button
              key={result.optionId}
              disabled={isClosed || isPending}
              onClick={() => handleVote(result.optionId)}
              className={[
                "w-full rounded-xl border p-3 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
                isWinner ? "ring-1 ring-yellow-400" : "",
                isClosed ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {result.emoji && <span>{result.emoji}</span>}
                  {result.label}
                  {isWinner && <span className="text-yellow-500">🏆</span>}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  {isSelected && <CheckCircle2 className="text-primary h-3.5 w-3.5" />}
                  {result.count}표 {totalVoted > 0 && `(${pct}%)`}
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />
              {result.voterNames.length > 0 && (
                <p className="text-muted-foreground mt-1 truncate text-xs">
                  {result.voterNames.join(", ")}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* 독려 알림 버튼 (생성자 + 열린 투표) */}
      {!isClosed && poll.creatorId === currentUserId && totalVoted < totalTargeted && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-1.5 text-xs"
          disabled={isPending}
          onClick={handleReminder}
        >
          <Bell className="h-3.5 w-3.5" />
          미투표 가족에게 알림 보내기
        </Button>
      )}
    </div>
  );
}
