import { Suspense } from "react";
import { BrandHeader } from "@/components/layout/brand-header";
import { FamilyBanner } from "@/components/family/family-banner";
import { MemberGrid } from "@/components/family/member-grid";
import { DinnerVote } from "@/components/family/dinner-vote";
import { DinnerVoteLoader } from "@/components/family/dinner-vote-loader";
import { PopularRanking } from "@/components/family/popular-ranking";
import { TrendingCards } from "@/components/family/trending-cards";
import { KidsPreferenceSection } from "@/components/family/KidsPreferenceSection";
import { FamilyMission } from "@/components/family/family-mission";
import { FamilyInvite } from "@/components/family/family-invite";
import { MovieNightButton } from "@/components/family/movie-night-button";
import { FamilyPollSection } from "@/components/family/family-poll-section";
import { Skeleton } from "@/components/ui/skeleton";
import { getFamilyGroup, getFamilyMembers, getFamilyStatsAction } from "@/lib/actions/family";
import {
  getActivePolls,
  getClosedPolls,
  getLatestMovieNightPoll,
  getBatchPollData,
} from "@/lib/actions/family/poll";
import { createClient } from "@/lib/supabase/server";
import type { FpPoll, PollResult } from "@/lib/types";

function DinnerVoteSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-3">
        <Skeleton className="h-28 flex-1 rounded-2xl" />
        <Skeleton className="h-28 flex-1 rounded-2xl" />
        <Skeleton className="h-28 flex-1 rounded-2xl" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

export default async function FamilyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [group, members, familyStats] = await Promise.all([
    getFamilyGroup(user?.id),
    getFamilyMembers(user?.id),
    getFamilyStatsAction(user?.id),
  ]);

  // 트렌딩 폴백용: 실제 존재하는 공식 카드 조회
  const { data: officialCards } = await supabase
    .from("fp_menu_card")
    .select("card_id, name, emoji")
    .eq("is_official", true)
    .limit(5);

  const missionCards = (officialCards ?? []).slice(0, 2);
  const trendingFallback =
    officialCards && officialCards.length >= 3
      ? officialCards.slice(0, 3).map((c, i) => ({
          rank: i + 1,
          cardId: c.card_id,
          name: c.name,
          emoji: c.emoji ?? "🍽️",
          count: 0,
        }))
      : undefined;

  // 활성 투표 안건 + 결과 + 내 투표 조회 (일반 투표, movie_night 제외)
  let activePolls: Array<{
    poll: FpPoll;
    results: PollResult[];
    myVoteOptionId: string | null;
    totalTargeted: number;
  }> = [];

  // 최근 완료된 일반 투표
  let closedPolls: Array<{
    poll: FpPoll;
    results: PollResult[];
    myVoteOptionId: string | null;
    totalTargeted: number;
  }> = [];

  // 최신 무비나이트 투표 (가장 최근 1건, ends_at 무관)
  let movieNightPollData: {
    poll: FpPoll;
    results: PollResult[];
    totalVoted: number;
    totalTargeted: number;
  } | null = null;

  if (group && user) {
    const [rawActive, rawClosed, movieNight] = await Promise.all([
      getActivePolls(group.groupId),
      getClosedPolls(group.groupId),
      getLatestMovieNightPoll(group.groupId),
    ]);

    movieNightPollData = movieNight;

    const [activeBatch, closedBatch] = await Promise.all([
      getBatchPollData(rawActive, user.id, group.groupId),
      getBatchPollData(rawClosed, user.id, group.groupId),
    ]);
    activePolls = activeBatch;
    closedPolls = closedBatch;
  }

  // 로그인 사용자 표시 이름 (FamilyInvite용)
  const { data: myProfile } = await supabase
    .from("fp_user_profile")
    .select("display_name")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const inviterName = myProfile?.display_name ?? "나";

  // 키즈 멤버 (실제 members에서 탐색)
  const kidsMember =
    members.find((m) => m.familyRole === "kid" || m.familyRole === "teen") ?? undefined;

  return (
    <>
      <BrandHeader />
      <FamilyBanner
        groupName={group?.name ?? "우리 가족"}
        level={familyStats.level}
        mealsThisMonth={familyStats.mealsThisMonth}
      />
      <div className="flex flex-col gap-6 py-5">
        <MemberGrid members={members} currentUserId={user?.id} hasGroup={!!group} />
        {group && user ? (
          <Suspense fallback={<DinnerVoteSkeleton />}>
            <DinnerVoteLoader
              groupId={group.groupId}
              userId={user.id}
              trendingFallback={trendingFallback}
            />
          </Suspense>
        ) : (
          <>
            <DinnerVote session={null} voteItems={[]} initialResults={[]} initialMyVotes={{}} />
            <PopularRanking items={undefined} />
            <TrendingCards items={trendingFallback} />
          </>
        )}
        {group && (
          <FamilyPollSection
            groupId={group.groupId}
            currentUserId={user?.id ?? ""}
            polls={activePolls}
            closedPolls={closedPolls}
          />
        )}
        {group && (
          <section className="px-4">
            <h3 className="text-ink-700 mb-3 text-sm font-semibold">무비나이트 🎬</h3>
            <MovieNightButton
              groupId={group.groupId}
              currentUserId={user?.id ?? ""}
              totalFamilyMembers={members.length}
              initialActivePoll={movieNightPollData}
            />
          </section>
        )}
        {kidsMember && (
          <KidsPreferenceSection groupId={group?.groupId ?? ""} kidsMember={kidsMember} />
        )}
        <FamilyMission cards={missionCards ?? []} />
        <FamilyInvite
          groupName={group?.name ?? "우리가족"}
          inviterName={inviterName}
          presetCode={group?.inviteCode}
        />
      </div>
    </>
  );
}
