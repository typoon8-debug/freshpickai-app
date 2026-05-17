"use client";

import { useState, useTransition } from "react";
import { Film, Sparkles, Loader2, ChevronRight, Vote, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { triggerMovieNight } from "@/lib/actions/family/movie-night";
import { createPoll, closePoll } from "@/lib/actions/family/poll";
import { MOVIE_GENRES, type MovieGenre } from "@/lib/constants/family";
import { PollCard } from "@/components/family/poll-card";
import type { MovieNightCard, FpPoll, PollResult } from "@/lib/types";

interface MovieNightButtonProps {
  groupId: string;
  currentUserId: string;
  totalFamilyMembers?: number;
  initialActivePoll?: {
    poll: FpPoll;
    results: PollResult[];
    totalVoted: number;
    totalTargeted: number;
  } | null;
}

type Step = "idle" | "mode" | "genre" | "poll" | "results" | "generating" | "done";

export function MovieNightButton({
  groupId,
  currentUserId,
  totalFamilyMembers = 1,
  initialActivePoll = null,
}: MovieNightButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(() => {
    if (!initialActivePoll) return "idle";
    const isClosed =
      initialActivePoll.poll.status !== "open" ||
      new Date(initialActivePoll.poll.endsAt) < new Date();
    return isClosed ? "results" : "poll";
  });
  const [selectedGenre, setSelectedGenre] = useState<MovieGenre | null>(null);
  const [generatedCards, setGeneratedCards] = useState<MovieNightCard[]>([]);
  const [activePoll, setActivePoll] = useState<FpPoll | null>(
    () => initialActivePoll?.poll ?? null
  );
  const [pollResults, setPollResults] = useState<PollResult[]>(
    () => initialActivePoll?.results ?? []
  );

  // ── 빠른 장르 선택 → 즉시 카드 생성 ───────────────────────
  function handleGenreSelect(genre: MovieGenre) {
    setSelectedGenre(genre);
    setStep("generating");

    startTransition(async () => {
      const result = await triggerMovieNight(groupId, genre);
      if (result.ok && result.cards) {
        setGeneratedCards(result.cards);
        setStep("done");
      } else {
        toast.error("카드 생성에 실패했어요. 다시 시도해주세요.");
        setStep("genre");
      }
    });
  }

  // ── 투표 모드 → Poll 생성 ────────────────────────────────
  function handleStartPoll() {
    startTransition(async () => {
      const endsAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4시간 후
      const options = MOVIE_GENRES.map((g, i) => ({
        id: g,
        label: g,
        emoji: GENRE_EMOJI[i] ?? "🎬",
      }));

      const result = await createPoll({
        groupId,
        title: "오늘 밤 무슨 장르 볼까? 🎬",
        options,
        endsAt,
        pollType: "movie_night",
      });

      if (!result.ok || !result.poll) {
        toast.error("투표 생성 실패");
        return;
      }

      const initialResults: PollResult[] = options.map((o) => ({
        optionId: o.id,
        label: o.label,
        emoji: o.emoji,
        count: 0,
        voterNames: [],
      }));

      setActivePoll(result.poll);
      setPollResults(initialResults);
      setStep("poll");
      toast.success("투표가 시작됐어요! 가족에게 알림을 보냈어요 🎬");
    });
  }

  // ── 투표 마감 → 최다 장르로 카드 생성 ───────────────────
  function handleClosePollAndGenerate() {
    if (!activePoll) return;

    startTransition(async () => {
      const { ok, winnerId, winnerLabel } = await closePoll(activePoll.pollId);
      if (!ok) {
        toast.error("투표 마감 실패");
        return;
      }

      const genre = (winnerId as MovieGenre) ?? "가족";
      setSelectedGenre(genre);
      setStep("generating");
      toast.info(`"${winnerLabel ?? genre}" 장르로 카드를 만들고 있어요…`);

      const result = await triggerMovieNight(groupId, genre, { pollId: activePoll.pollId });
      if (result.ok && result.cards) {
        setGeneratedCards(result.cards);
        setStep("done");
      } else {
        toast.error("카드 생성 실패");
        setStep("poll");
      }
    });
  }

  // ── Idle ─────────────────────────────────────────────────
  if (step === "idle") {
    return (
      <button
        type="button"
        data-testid="movie-night-trigger"
        onClick={() => setStep("mode")}
        className="border-line flex w-full items-center gap-3 rounded-xl border bg-white p-4 transition active:scale-[0.98]"
      >
        <div className="bg-mocha-100 flex h-10 w-10 items-center justify-center rounded-full">
          <Film size={20} className="text-mocha-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-ink-900 text-sm font-semibold">금요 무비나이트 🍿</p>
          <p className="text-ink-400 mt-0.5 text-[11px]">
            AI가 장르별 안주·간식 카드를 만들어 드려요
          </p>
        </div>
        <ChevronRight size={16} className="text-ink-300" />
      </button>
    );
  }

  // ── 투표 결과 조회 (완료된 movie_night 투표) ──────────────
  if (step === "results" && activePoll) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <BarChart2 size={14} className="text-mocha-500" />
          <p className="text-ink-500 text-xs">최근 무비나이트 투표 결과</p>
        </div>
        <PollCard
          poll={activePoll}
          initialResults={pollResults}
          initialMyVoteOptionId={null}
          totalTargeted={initialActivePoll?.totalTargeted ?? totalFamilyMembers}
          currentUserId={currentUserId}
        />
        <button
          type="button"
          onClick={() => {
            setStep("idle");
            setActivePoll(null);
            setPollResults([]);
          }}
          className="border-line hover:bg-mocha-50 flex w-full items-center justify-center gap-2 rounded-xl border bg-white py-3 text-sm font-medium transition"
        >
          <Film size={14} className="text-mocha-600" />새 무비나이트 시작
        </button>
      </div>
    );
  }

  // ── 모드 선택 ─────────────────────────────────────────────
  if (step === "mode") {
    return (
      <div className="border-line space-y-3 rounded-xl border bg-white p-4">
        <div className="mb-1 flex items-center gap-2">
          <Film size={16} className="text-mocha-600" />
          <p className="text-ink-900 text-sm font-semibold">무비나이트 시작하기</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={handleStartPoll}
          className="border-line bg-mocha-50 hover:bg-mocha-100 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition active:scale-[0.98]"
        >
          <Vote size={18} className="text-mocha-600 shrink-0" />
          <div>
            <p className="text-ink-900 text-sm font-semibold">가족 투표로 장르 선택</p>
            <p className="text-ink-400 text-[11px]">가족 모두에게 알림 → 4시간 투표 후 자동 생성</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setStep("genre")}
          className="border-line flex w-full items-center gap-3 rounded-lg border p-3 text-left transition hover:bg-gray-50 active:scale-[0.98]"
        >
          <Sparkles size={18} className="text-honey shrink-0" />
          <div>
            <p className="text-ink-900 text-sm font-semibold">내가 바로 선택</p>
            <p className="text-ink-400 text-[11px]">장르 선택 후 즉시 카드 생성</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setStep("idle")}
          className="text-ink-400 w-full text-[11px]"
        >
          취소
        </button>
      </div>
    );
  }

  // ── 빠른 장르 선택 ───────────────────────────────────────
  if (step === "genre") {
    return (
      <div className="border-line rounded-xl border bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Film size={16} className="text-mocha-600" />
          <p className="text-ink-900 text-sm font-semibold">오늘 어떤 장르 볼까요?</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {MOVIE_GENRES.map((genre, i) => (
            <button
              key={genre}
              type="button"
              data-testid={`genre-${genre}`}
              onClick={() => handleGenreSelect(genre)}
              className={cn(
                "rounded-lg border px-2 py-2 text-[12px] font-medium transition",
                selectedGenre === genre
                  ? "bg-mocha-600 border-mocha-600 text-white"
                  : "border-line text-ink-700 hover:bg-mocha-50"
              )}
            >
              {GENRE_EMOJI[i]} {genre}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setStep("mode")}
          className="text-ink-400 mt-3 w-full text-[11px]"
        >
          뒤로
        </button>
      </div>
    );
  }

  // ── 투표 진행 중 ──────────────────────────────────────────
  if (step === "poll" && activePoll) {
    return (
      <div className="space-y-3">
        <PollCard
          poll={activePoll}
          initialResults={pollResults}
          initialMyVoteOptionId={null}
          totalTargeted={totalFamilyMembers}
          currentUserId={currentUserId}
        />
        <button
          type="button"
          disabled={isPending}
          onClick={handleClosePollAndGenerate}
          className="border-line bg-mocha-600 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          마감하고 카드 만들기
        </button>
        <button
          type="button"
          onClick={() => setStep("idle")}
          className="text-ink-400 w-full text-[11px]"
        >
          취소
        </button>
      </div>
    );
  }

  // ── 카드 생성 중 ──────────────────────────────────────────
  if (step === "generating" || (isPending && step !== "done")) {
    return (
      <div className="border-line flex items-center gap-3 rounded-xl border bg-white p-4">
        <Loader2 size={20} className="text-mocha-600 animate-spin" />
        <div>
          <p className="text-ink-900 text-sm font-semibold">
            {selectedGenre} 무비나이트 카드 생성 중…
          </p>
          <p className="text-ink-400 text-[11px]">Claude AI가 페어링 메뉴를 추천하고 있어요</p>
        </div>
      </div>
    );
  }

  // ── 완료 ─────────────────────────────────────────────────
  if (step === "done" && generatedCards.length > 0) {
    return (
      <div className="border-line rounded-xl border bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-honey" />
          <p className="text-ink-900 text-sm font-semibold">
            {selectedGenre} 무비나이트 카드 완성! 🎉
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {generatedCards.map((card) => (
            <button
              key={card.cardId}
              type="button"
              data-testid={`movie-card-${card.isKidsVersion ? "kids" : "adult"}`}
              onClick={() => router.push(`/cards/${card.cardId}`)}
              className="border-line bg-mocha-50 flex items-center gap-3 rounded-lg border p-3 text-left transition active:scale-[0.98]"
            >
              <span className="text-2xl">{card.emoji}</span>
              <div className="flex-1">
                <p className="text-ink-900 text-sm font-semibold">{card.name}</p>
                {card.subtitle && <p className="text-ink-500 text-[11px]">{card.subtitle}</p>}
                <p className="text-ink-300 mt-0.5 text-[10px]">
                  {card.isKidsVersion ? "키즈 무알콜 버전" : "성인 버전"}
                </p>
              </div>
              <ChevronRight size={14} className="text-ink-300" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setStep("idle");
            setSelectedGenre(null);
            setGeneratedCards([]);
            setActivePoll(null);
          }}
          className="text-ink-400 mt-3 w-full text-[11px]"
        >
          닫기
        </button>
      </div>
    );
  }

  return null;
}

const GENRE_EMOJI = ["🎬", "💕", "👻", "🚀", "😂", "🏃", "🔍", "👨‍👩‍👧"];
