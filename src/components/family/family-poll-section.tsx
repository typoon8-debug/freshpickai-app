"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PollCreateSheet } from "@/components/family/poll-create-sheet";
import { PollCard } from "@/components/family/poll-card";
import type { FpPoll, PollResult } from "@/lib/types";

interface PollEntry {
  poll: FpPoll;
  results: PollResult[];
  myVoteOptionId: string | null;
  totalTargeted: number;
}

interface FamilyPollSectionProps {
  groupId: string;
  currentUserId: string;
  /** status='open' 투표 (만료된 것 포함 — PollCard가 "마감" 배지 처리) */
  polls: PollEntry[];
  /** status='closed' 투표 */
  closedPolls?: PollEntry[];
}

type Tab = "active" | "closed";

export function FamilyPollSection({
  groupId,
  currentUserId,
  polls,
  closedPolls = [],
}: FamilyPollSectionProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("active");

  const hasClosedPolls = closedPolls.length > 0;

  return (
    <section className="space-y-3 px-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-ink-700 text-sm font-semibold">가족 투표 🗳</h3>
        <PollCreateSheet groupId={groupId} onCreated={() => router.refresh()} />
      </div>

      {/* 탭 — 완료된 투표가 있을 때만 표시 */}
      {hasClosedPolls && (
        <div className="flex gap-1">
          {(["active", "closed"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                tab === t
                  ? "bg-mocha-700 text-white"
                  : "bg-mocha-100 text-mocha-700 hover:bg-mocha-200"
              )}
            >
              {t === "active" ? `진행중 (${polls.length})` : `최근 종료 (${closedPolls.length})`}
            </button>
          ))}
        </div>
      )}

      {/* 진행중 탭 — status='open' 전체 표시 (ends_at 무관, PollCard가 마감 배지 처리) */}
      {tab === "active" && (
        <>
          {polls.length === 0 ? (
            <div className="border-line rounded-xl border bg-white p-4 text-center">
              <p className="text-ink-400 text-sm">진행 중인 투표가 없어요</p>
              <p className="text-ink-300 mt-0.5 text-xs">새 투표를 만들어 가족과 함께해요!</p>
            </div>
          ) : (
            polls.map(({ poll, results, myVoteOptionId, totalTargeted }) => (
              <PollCard
                key={poll.pollId}
                poll={poll}
                initialResults={results}
                initialMyVoteOptionId={myVoteOptionId}
                totalTargeted={totalTargeted}
                currentUserId={currentUserId}
              />
            ))
          )}
        </>
      )}

      {/* 최근 종료 탭 — status='closed' 투표 결과 조회 */}
      {tab === "closed" && (
        <>
          {closedPolls.map(({ poll, results, myVoteOptionId, totalTargeted }) => (
            <PollCard
              key={poll.pollId}
              poll={poll}
              initialResults={results}
              initialMyVoteOptionId={myVoteOptionId}
              totalTargeted={totalTargeted}
              currentUserId={currentUserId}
            />
          ))}
        </>
      )}
    </section>
  );
}
