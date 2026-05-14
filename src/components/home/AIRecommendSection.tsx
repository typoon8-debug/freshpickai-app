"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuCard } from "@/lib/types";
import type { RecommendResponse, Recommendation } from "@/lib/validations/recommendation";

const CACHE_KEY = "ai-recommend:v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const THEME_EMOJIS: Record<string, string> = {
  오늘의한끼: "🍽️",
  지금이적기: "🌿",
  놓치면아까워요: "⚡",
  다시만나볼까요: "💝",
  새로들어왔어요: "✨",
};

interface CachedData {
  data: RecommendResponse;
  timestamp: number;
}

type RecommendState = {
  data: RecommendResponse | null;
  loading: boolean;
  error: boolean;
};

function readSessionCache(): RecommendResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedData;
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) return parsed.data;
  } catch {
    // 무시
  }
  return null;
}

function getInitialState(): RecommendState {
  const cached = readSessionCache();
  return cached
    ? { data: cached, loading: false, error: false }
    : { data: null, loading: true, error: false };
}

interface AIRecommendSectionProps {
  initialCards: MenuCard[];
}

export function AIRecommendSection({ initialCards }: AIRecommendSectionProps) {
  const router = useRouter();
  const [state, setState] = useState<RecommendState>(getInitialState);
  const [activeTheme, setActiveTheme] = useState(0);
  const hasFetchedRef = useRef(false);

  const cardMap = new Map(initialCards.map((c) => [c.cardId, c]));

  useEffect(() => {
    if (!state.loading || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetch("/api/ai/recommend")
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json() as Promise<RecommendResponse>;
      })
      .then((data) => {
        if (!data.recommendations?.length) throw new Error("empty");
        setState({ data, loading: false, error: false });
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        } catch {
          // 무시
        }
      })
      .catch(() => {
        setState({ data: null, loading: false, error: true });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.error) return null;

  const themes = state.data?.recommendations ?? [];
  const activeRec: Recommendation | undefined = themes[activeTheme];

  return (
    <section className="flex flex-col gap-3" data-testid="ai-recommend-section">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-honey" />
        <h2 className="text-ink-900 text-base font-semibold">AI 테마 추천</h2>
      </div>

      {/* 테마 탭 */}
      <div
        className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4"
        data-testid="recommend-tabs"
      >
        {state.loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-mocha-100 h-8 w-24 flex-shrink-0 animate-pulse rounded-full"
              />
            ))
          : themes.map((rec, i) => (
              <button
                key={rec.theme}
                onClick={() => setActiveTheme(i)}
                data-testid={`recommend-tab-${i}`}
                className={cn(
                  "rounded-pill flex-shrink-0 px-3 py-1.5 text-[12px] font-semibold transition",
                  activeTheme === i
                    ? "bg-mocha-700 text-paper"
                    : "bg-mocha-100 text-ink-600 hover:bg-mocha-200"
                )}
              >
                {THEME_EMOJIS[rec.theme] ?? "🍽️"} {rec.theme}
              </button>
            ))}
      </div>

      {/* 카드 캐러셀 */}
      {state.loading ? (
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-mocha-100 h-44 w-40 flex-shrink-0 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : activeRec ? (
        <div
          className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2"
          data-testid="recommend-carousel"
        >
          {activeRec.cards.map((rec) => {
            const card = cardMap.get(rec.cardId);
            return (
              <RecommendCard
                key={rec.cardId}
                rec={rec}
                card={card}
                onClick={() => router.push(`/cards/${rec.cardId}`)}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

interface RecommendCardItemProps {
  rec: {
    cardId: string;
    title: string;
    reason: string;
    confidence: number;
    discountPct?: number;
  };
  card?: MenuCard;
  onClick: () => void;
}

function RecommendCard({ rec, card, onClick }: RecommendCardItemProps) {
  const confidencePct = Math.round(rec.confidence * 100);

  return (
    <button
      onClick={onClick}
      data-testid={`recommend-card-${rec.cardId}`}
      className="bg-card shadow-card flex w-40 flex-shrink-0 flex-col overflow-hidden rounded-xl text-left"
    >
      <div className="bg-mocha-50 relative h-32 w-full flex-shrink-0">
        {card?.coverImage ? (
          <Image
            src={card.coverImage}
            alt={rec.title}
            fill
            sizes="160px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            {card?.emoji ?? "🍽️"}
          </div>
        )}
        {rec.discountPct !== undefined && (
          <span className="rounded-pill absolute top-2 right-2 bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            -{rec.discountPct}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <p className="text-ink-900 line-clamp-1 text-[12px] font-semibold">{rec.title}</p>
        <p className="text-ink-500 line-clamp-2 text-[11px] leading-relaxed">{rec.reason}</p>
        <div className="mt-auto flex items-center gap-1">
          <Sparkles size={9} className="text-olive-600" />
          <span className="text-[10px] font-semibold text-olive-700">{confidencePct}% 매칭</span>
        </div>
      </div>
    </button>
  );
}
