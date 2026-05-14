"use client";

import { useState, useTransition } from "react";
import { Film, Sparkles, Loader2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { triggerMovieNight, MOVIE_GENRES, type MovieGenre } from "@/lib/actions/family/movie-night";
import type { MovieNightCard } from "@/lib/types";

interface MovieNightButtonProps {
  groupId: string;
}

export function MovieNightButton({ groupId }: MovieNightButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"idle" | "genre" | "generating" | "done">("idle");
  const [selectedGenre, setSelectedGenre] = useState<MovieGenre | null>(null);
  const [generatedCards, setGeneratedCards] = useState<MovieNightCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenreSelect = (genre: MovieGenre) => {
    setSelectedGenre(genre);
    setStep("generating");
    setError(null);

    startTransition(async () => {
      const result = await triggerMovieNight(groupId, genre);
      if (result.ok && result.cards) {
        setGeneratedCards(result.cards);
        setStep("done");
      } else {
        setError("카드 생성에 실패했어요. 다시 시도해주세요.");
        setStep("genre");
      }
    });
  };

  if (step === "idle") {
    return (
      <button
        type="button"
        data-testid="movie-night-trigger"
        onClick={() => setStep("genre")}
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

  if (step === "genre") {
    return (
      <div className="border-line rounded-xl border bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Film size={16} className="text-mocha-600" />
          <p className="text-ink-900 text-sm font-semibold">오늘 어떤 장르 볼까요?</p>
        </div>
        {error && <p className="text-terracotta mb-3 text-[11px]">{error}</p>}
        <div className="grid grid-cols-4 gap-2">
          {MOVIE_GENRES.map((genre) => (
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
              {genre}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setStep("idle")}
          className="text-ink-400 mt-3 w-full text-[11px]"
        >
          취소
        </button>
      </div>
    );
  }

  if (step === "generating" || isPending) {
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
