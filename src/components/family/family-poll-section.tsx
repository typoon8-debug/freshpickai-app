"use client";

import { useRouter } from "next/navigation";
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
  polls: PollEntry[];
}

export function FamilyPollSection({ groupId, currentUserId, polls }: FamilyPollSectionProps) {
  const router = useRouter();

  return (
    <section className="space-y-3 px-4">
      <div className="flex items-center justify-between">
        <h3 className="text-ink-700 text-sm font-semibold">가족 투표 🗳</h3>
        <PollCreateSheet groupId={groupId} onCreated={() => router.refresh()} />
      </div>

      {polls.map(({ poll, results, myVoteOptionId, totalTargeted }) => (
        <PollCard
          key={poll.pollId}
          poll={poll}
          initialResults={results}
          initialMyVoteOptionId={myVoteOptionId}
          totalTargeted={totalTargeted}
          currentUserId={currentUserId}
        />
      ))}

      {polls.length === 0 && (
        <p className="text-muted-foreground py-3 text-center text-sm">
          진행 중인 투표가 없어요 — 새 투표를 만들어 보세요!
        </p>
      )}
    </section>
  );
}
