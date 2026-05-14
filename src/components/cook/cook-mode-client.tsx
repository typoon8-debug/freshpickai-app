"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  BookOpen,
  Share2,
  Bookmark,
  StickyNote,
  CheckCircle2,
  Circle,
  ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "@/components/detail/bookmark-button";
import { RecipeStepTimer } from "@/components/cook/recipe-step-timer";
import { toast } from "sonner";
import type { CookModeData } from "@/lib/actions/cards/recipe-steps";

interface CookModeClientProps {
  data: CookModeData;
  initialBookmarked?: boolean;
}

export function CookModeClient({ data, initialBookmarked = false }: CookModeClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"recipe" | "summary">("recipe");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  const activeDish = data.dishes.find((d) => d.recipe);
  const steps = activeDish?.recipe?.steps ?? [];
  const completedCount = completedSteps.size;
  const totalCount = steps.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const handleShare = async () => {
    const url = window.location.href.replace("/cook", "");
    if (navigator.share) {
      await navigator.share({ title: data.card.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("링크를 복사했습니다.");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="hover:bg-mocha-50 flex h-10 w-10 items-center justify-center rounded-full"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={22} className="text-ink-700" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-ink-400 text-[11px] tracking-wider uppercase">요리 모드</span>
          <span className="text-ink-900 max-w-[180px] truncate text-sm font-semibold">
            {data.card.emoji ? `${data.card.emoji} ` : ""}
            {data.card.name}
          </span>
        </div>

        <div className="w-10" />
      </header>

      {/* 진행률 바 */}
      {totalCount > 0 && (
        <div className="bg-mocha-50 mx-4 mb-2 h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-mocha-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* 탭 */}
      <div className="border-line flex gap-0 border-b px-4">
        {[
          { key: "recipe" as const, label: "레시피", icon: ChefHat },
          { key: "summary" as const, label: "요약", icon: BookOpen },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition",
              activeTab === key
                ? "border-mocha-700 text-mocha-700"
                : "text-ink-400 hover:text-ink-600 border-transparent"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36">
        {activeTab === "recipe" && (
          <div className="space-y-4">
            {activeDish ? (
              <>
                <h2 className="text-ink-700 text-xs font-medium tracking-wider uppercase">
                  {activeDish.name}
                </h2>

                {steps.length > 0 ? (
                  steps.map((step, idx) => {
                    const done = completedSteps.has(step.stepId);
                    return (
                      <div
                        key={step.stepId}
                        className={cn(
                          "rounded-2xl border p-4 transition",
                          done ? "border-green-200 bg-green-50" : "border-mocha-100 bg-white"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* 스텝 번호 + 완료 체크 */}
                          <button
                            type="button"
                            onClick={() => toggleStep(step.stepId)}
                            aria-label={done ? "스텝 취소" : "스텝 완료"}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {done ? (
                              <CheckCircle2 size={22} className="text-green-500" />
                            ) : (
                              <Circle size={22} className="text-mocha-300" />
                            )}
                          </button>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-xs font-semibold",
                                  done ? "text-green-600" : "text-mocha-600"
                                )}
                              >
                                {idx + 1}단계
                              </span>
                            </div>
                            <p
                              className={cn(
                                "text-sm leading-relaxed",
                                done ? "text-ink-400 line-through" : "text-ink-800"
                              )}
                            >
                              {step.description}
                            </p>

                            {/* 타이머 */}
                            {step.timerSeconds && step.timerSeconds > 0 && !done && (
                              <RecipeStepTimer
                                timerSeconds={step.timerSeconds}
                                onComplete={() => toggleStep(step.stepId)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : activeDish.recipe?.body ? (
                  /* 스텝 없이 body 텍스트만 있는 경우 */
                  <div className="border-mocha-100 rounded-2xl border bg-white p-4">
                    <p className="text-ink-800 text-sm leading-relaxed whitespace-pre-line">
                      {activeDish.recipe.body}
                    </p>
                  </div>
                ) : (
                  <div className="text-ink-400 py-12 text-center text-sm">
                    등록된 레시피 스텝이 없습니다.
                  </div>
                )}
              </>
            ) : (
              <div className="text-ink-400 py-12 text-center text-sm">
                이 카드에는 레시피가 없습니다.
              </div>
            )}

            {/* 완료 메시지 */}
            {totalCount > 0 && completedCount === totalCount && (
              <div className="rounded-2xl border border-green-200 bg-green-50 py-6 text-center">
                <span className="text-2xl">🎉</span>
                <p className="mt-2 font-semibold text-green-700">요리가 완성되었습니다!</p>
                <p className="mt-1 text-sm text-green-600">맛있게 드세요 😋</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-3">
            <h2 className="text-ink-700 text-xs font-medium tracking-wider uppercase">
              레시피 요약
            </h2>
            {steps.length > 0 ? (
              steps.map((step, idx) => (
                <div key={step.stepId} className="flex gap-3 text-sm">
                  <span className="bg-mocha-100 text-mocha-700 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <p className="text-ink-700 leading-relaxed">{step.description}</p>
                </div>
              ))
            ) : (
              <p className="text-ink-400 py-8 text-center text-sm">요약할 스텝이 없습니다.</p>
            )}
          </div>
        )}
      </div>

      {/* Floating 4-action 바 */}
      <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2">
        <div className="bg-ink-900/90 flex items-center gap-1 rounded-full px-3 py-2 shadow-lg backdrop-blur-sm">
          {/* 요약 */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "summary" ? "recipe" : "summary")}
            aria-label="요약 보기"
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[10px] transition",
              activeTab === "summary" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"
            )}
          >
            <BookOpen size={16} />
            요약
          </button>

          {/* 공유 */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="공유하기"
            className="flex flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[10px] text-white/70 transition hover:text-white"
          >
            <Share2 size={16} />
            공유
          </button>

          {/* 북마크 */}
          <div className="flex flex-col items-center gap-0.5 rounded-full px-3 py-2">
            <BookmarkButton
              cardId={data.card.cardId}
              initialBookmarked={initialBookmarked}
              className="h-7 w-7 border-white/30 bg-transparent text-white/70 hover:border-white hover:text-white"
            />
            <span className="text-[10px] text-white/70">북마크</span>
          </div>

          {/* 노트 */}
          <button
            type="button"
            onClick={() => setNoteOpen((p) => !p)}
            aria-label="노트 보기"
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[10px] transition",
              noteOpen ? "bg-white/20 text-white" : "text-white/70 hover:text-white"
            )}
          >
            <StickyNote size={16} />
            노트
          </button>
        </div>
      </div>

      {/* 인라인 노트 패널 */}
      {noteOpen && (
        <div className="border-line fixed right-4 bottom-36 left-4 z-40 rounded-2xl border bg-white p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-ink-700 text-sm font-semibold">요리 노트</span>
            <button
              type="button"
              onClick={() => setNoteOpen(false)}
              className="text-ink-400 hover:text-ink-700 text-xs"
            >
              닫기
            </button>
          </div>
          <textarea
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="요리하면서 기록할 메모를 작성하세요..."
            className="text-ink-800 border-mocha-100 placeholder:text-ink-300 w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => {
              toast.success("노트가 저장되었습니다.");
              setNoteOpen(false);
            }}
            className="bg-mocha-700 text-paper mt-2 w-full rounded-xl py-2 text-sm font-medium"
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
}
