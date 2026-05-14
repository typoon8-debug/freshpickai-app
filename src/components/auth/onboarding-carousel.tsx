"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { OnboardingForm, type OnboardingValues } from "./onboarding-form";
import type { CardPreview } from "@/app/onboarding/page";

interface OnboardingCarouselProps {
  onComplete: (values?: OnboardingValues) => void;
  cardPreviews?: CardPreview[];
  className?: string;
}

const PERSONA_DEMOS = ["가족매니저", "워킹맘", "건강시니어", "가성비대학생", "프리미엄미식가"];
const FAMILY_FEATURES = ["실시간투표", "가족보드", "주간TOP5", "무비나이트"];
const KIDS_FEATURES = ["키즈모드", "채소도전", "뱃지획득", "엄마한테보내기"];

// 슬라이드 1 태그: 실 카드 데이터로 교체 (없을 때 폴백)
const DEFAULT_CARD_TAGS = ["흑백요리사", "제철K팜", "홈시네마", "드라마한끼", "혼웰빙"];

const SLIDES = [
  {
    id: 1,
    emoji: "🍽️",
    title: "다양한 테마 카드로\n메뉴를 바로 결정",
    desc: "셰프스 테이블부터 홈시네마까지\n원하는 메뉴를 30초 안에 고르세요",
    type: "cards" as const,
  },
  {
    id: 2,
    emoji: "🤖",
    title: "AI가 우리 가족\n취향을 기억해요",
    desc: "9가지 페르소나 AI가 가족 식단을\n맞춤 큐레이팅합니다",
    type: "persona" as const,
  },
  {
    id: 3,
    emoji: "👨‍👩‍👧‍👦",
    title: "가족이 함께\n투표로 결정",
    desc: "이번 주 뭐 먹을지 가족 모두가\n좋아요/싫어요로 투표해요",
    type: "family" as const,
  },
  {
    id: 4,
    emoji: "🐰",
    title: "아이도 직접\n고를 수 있어요",
    desc: "프레쉬 토끼와 함께하는 키즈 모드\n아이가 선택하면 부모에게 전달돼요",
    type: "kids" as const,
  },
];

function getSlideTags(
  type: (typeof SLIDES)[number]["type"],
  cardPreviews: CardPreview[]
): string[] {
  if (type === "cards") {
    if (cardPreviews.length > 0) {
      return cardPreviews.slice(0, 5).map((c) => (c.emoji ? `${c.emoji} ${c.name}` : c.name));
    }
    return DEFAULT_CARD_TAGS;
  }
  if (type === "persona") return PERSONA_DEMOS;
  if (type === "family") return FAMILY_FEATURES;
  return KIDS_FEATURES;
}

export function OnboardingCarousel({
  onComplete,
  cardPreviews = [],
  className,
}: OnboardingCarouselProps) {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const isLast = slide === SLIDES.length;

  const goNext = () => {
    setDirection(1);
    setSlide((s) => s + 1);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className={cn("flex flex-col", className)} data-testid="onboarding-carousel">
      {/* 인디케이터 */}
      <div className="mb-6 flex justify-center gap-1.5" data-testid="onboarding-indicators">
        {[...SLIDES, { id: 5 }].map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === slide ? "bg-mocha-700 w-6" : "bg-mocha-100 w-1.5"
            )}
          />
        ))}
      </div>

      {/* 슬라이드 영역 */}
      <div className="relative min-h-[360px] overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          {!isLast ? (
            <motion.div
              key={slide}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col items-center gap-5 text-center"
              data-testid={`onboarding-slide-${slide}`}
            >
              {/* 이모지 */}
              <div className="bg-mocha-50 flex h-20 w-20 items-center justify-center rounded-2xl text-5xl">
                {SLIDES[slide].emoji}
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="font-display text-mocha-900 text-2xl leading-tight whitespace-pre-line">
                  {SLIDES[slide].title}
                </h2>
                <p className="text-ink-500 text-sm leading-relaxed whitespace-pre-line">
                  {SLIDES[slide].desc}
                </p>
              </div>

              {/* 태그 미리보기 (슬라이드 1은 실 카드 데이터) */}
              <div className="flex flex-wrap justify-center gap-1.5" data-testid="slide-tags">
                {getSlideTags(SLIDES[slide].type, cardPreviews).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-pill bg-olive-100 px-3 py-1 text-xs text-olive-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              data-testid="onboarding-form-slide"
            >
              <p className="font-display text-mocha-900 mb-5 text-xl">취향을 알려주세요 ✨</p>
              <OnboardingForm onSubmit={(v) => onComplete(v)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-6 flex flex-col gap-3">
        {!isLast && (
          <button
            type="button"
            onClick={goNext}
            className="btn-ghost w-full"
            data-testid="onboarding-next"
          >
            다음
          </button>
        )}
        <button
          type="button"
          onClick={() => onComplete()}
          className="text-ink-400 hover:text-ink-600 text-sm"
          data-testid="onboarding-skip"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
