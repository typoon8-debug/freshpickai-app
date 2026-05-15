"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuCard } from "@/lib/types";
import type { RecommendResponse, Recommendation } from "@/lib/validations/recommendation";

const CACHE_KEY = "ai-recommend:v3";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const THEME_EMOJIS: Record<string, string> = {
  오늘의한끼: "🍽️",
  지금이적기: "🌿",
  놓치면아까워요: "⚡",
  다시만나볼까요: "💝",
  새로들어왔어요: "✨",
};

// 로딩 중 단계별 안내 메시지 (시간 순)
const LOADING_STEPS = [
  "AI가 식생활 패턴을 분석하고 있어요...",
  "제철 재료·할인 상품을 확인 중이에요...",
  "취향에 맞는 테마를 큐레이팅 중이에요...",
  "거의 완료되었습니다 ✨",
] as const;

// 각 단계로 전환되는 시간 (ms) — 인덱스 1, 2, 3 기준
const STEP_DELAYS = [4000, 9000, 14000] as const;

interface CachedData {
  data: RecommendResponse;
  timestamp: number;
}

type RecommendState = {
  data: RecommendResponse | null;
  loading: boolean;
  error: boolean;
};

function readLocalCache(): RecommendResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedData;
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) return parsed.data;
  } catch {
    // 무시
  }
  return null;
}

interface AIRecommendSectionProps {
  initialCards: MenuCard[];
}

export function AIRecommendSection({ initialCards }: AIRecommendSectionProps) {
  const router = useRouter();
  // SSR: 항상 loading:true 로 시작 → hydration mismatch 방지
  const [state, setState] = useState<RecommendState>({ data: null, loading: true, error: false });
  const [activeTheme, setActiveTheme] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const hasFetchedRef = useRef(false);

  const cardMap = new Map(initialCards.map((c) => [c.cardId, c]));

  // 에러 시 재시도 — meta 기간 체크 없이 강제 재생성
  async function handleForceRegenerate() {
    setState({ data: null, loading: true, error: false });
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // 무시
    }
    try {
      const res = await fetch("/api/ai/recommend");
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as RecommendResponse;
      if (!data.recommendations?.length) throw new Error("empty");
      setState({ data, loading: false, error: false });
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      } catch {
        // 무시
      }
    } catch {
      setState({ data: null, loading: false, error: true });
    }
  }

  // 로딩 중 단계별 메시지 타이머
  useEffect(() => {
    if (!state.loading) {
      setLoadingStep(0); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const timers = STEP_DELAYS.map((delay, i) =>
      window.setTimeout(() => setLoadingStep(i + 1), delay)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [state.loading]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function load() {
      // 1. 주간 갱신 여부 확인 (경량 API, 실패 시 stale=false 처리)
      let stale = false;
      try {
        const metaRes = await fetch("/api/ai/recommend/meta");
        if (metaRes.ok) {
          const meta = (await metaRes.json()) as { stale: boolean };
          stale = meta.stale;
        }
      } catch {
        // 무시 — meta 실패 시 캐시 우선
      }

      // 2. stale이면 기존 캐시 무효화, 아니면 캐시 확인
      if (stale) {
        try {
          localStorage.removeItem(CACHE_KEY);
        } catch {
          // 무시
        }
      } else {
        const cached = readLocalCache();
        if (cached) {
          setState({ data: cached, loading: false, error: false });
          return;
        }
      }

      // 3. AI 추천 신규 생성
      try {
        const res = await fetch("/api/ai/recommend");
        if (!res.ok) throw new Error(`${res.status}`);
        const data = (await res.json()) as RecommendResponse;
        if (!data.recommendations?.length) throw new Error("empty");
        setState({ data, loading: false, error: false });
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        } catch {
          // 무시
        }
      } catch {
        setState({ data: null, loading: false, error: true });
      }
    }

    void load();
  }, []);

  if (state.error) {
    return (
      <section className="flex flex-col gap-3" data-testid="ai-recommend-section">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-honey" />
          <h2 className="text-ink-900 text-base font-semibold">AI 테마 추천</h2>
        </div>
        <div className="flex flex-col items-center gap-3 py-5">
          <p className="text-ink-400 text-[13px]">AI 추천을 불러오지 못했어요</p>
          <button
            onClick={() => {
              void handleForceRegenerate();
            }}
            className="bg-mocha-700 text-paper rounded-pill flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold"
          >
            <Sparkles size={13} />
            AI 테마 추천 받기
          </button>
        </div>
      </section>
    );
  }

  const themes = state.data?.recommendations ?? [];
  const activeRec: Recommendation | undefined = themes[activeTheme];
  const progressPct = Math.round(((loadingStep + 1) / LOADING_STEPS.length) * 100);

  return (
    <section className="flex flex-col gap-3" data-testid="ai-recommend-section">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-honey" />
        <h2 className="text-ink-900 text-base font-semibold">AI 테마 추천</h2>
      </div>

      {state.loading && (
        <div className="flex flex-col items-center gap-2 py-2">
          <Sparkles size={15} className="text-honey animate-pulse" />
          <p className="text-ink-500 text-center text-[13px] transition-all duration-500">
            {LOADING_STEPS[loadingStep]}
          </p>
          {/* 가상 프로그레스바 */}
          <div className="bg-mocha-100 h-1 w-44 overflow-hidden rounded-full">
            <div
              className="bg-honey h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* 테마 탭 */}
      <div
        className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden"
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
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-mocha-100 h-44 w-40 flex-shrink-0 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : activeRec ? (
        <div
          className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden"
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
