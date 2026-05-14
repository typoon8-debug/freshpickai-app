"use client";

import { useEffect, useState } from "react";

export type VoteStatus = "open" | "closed";

export interface VoteSession {
  sessionId: string;
  endsAt: string; // ISO 8601 절대 시각
  isPaused: boolean;
  pausedRemainingMs: number | null;
  status: VoteStatus;
}

export interface VoteCountdownState {
  remainingMs: number;
  isExpired: boolean;
  formatted: string;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "마감됨";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}일 ${hours}시간 남음`;
  if (hours > 0) return `${hours}시간 ${mins}분 남음`;
  if (mins > 0) return `${mins}분 ${secs}초 남음`;
  return `${secs}초 남음`;
}

/**
 * 절대 종료 시각(endsAt)을 기준으로 클라이언트가 1초마다 차감.
 * 새로고침/탭 전환에도 자가 보정되며 서버 트래픽 0.
 * Phase 2/3에서 Supabase Realtime postgres_changes 구독으로 session 동기화 예정.
 */
export function useVoteCountdown(session: VoteSession | null): VoteCountdownState {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!session) return;

    // setInterval callback 내부 setState는 외부 source 구독으로 간주되어 OK
    const tick = () => {
      if (session.isPaused) {
        setRemainingMs(session.pausedRemainingMs ?? 0);
        return;
      }
      if (session.status === "closed") {
        setRemainingMs(0);
        return;
      }
      const end = new Date(session.endsAt).getTime();
      setRemainingMs(Math.max(0, end - Date.now()));
    };

    const id = setInterval(tick, 1000);
    // 첫 tick은 즉시가 아닌 1초 후 — react-hooks/set-state-in-effect 준수
    return () => clearInterval(id);
  }, [session]);

  return {
    remainingMs,
    isExpired: session !== null && remainingMs <= 0,
    formatted: formatDuration(remainingMs),
  };
}
