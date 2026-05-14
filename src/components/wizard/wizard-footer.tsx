"use client";

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface WizardFooterProps {
  currentStep: number;
  totalSteps: number;
  canNext: boolean;
  isSaving?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
}

export function WizardFooter({
  currentStep,
  totalSteps,
  canNext,
  isSaving,
  onPrev,
  onNext,
  onSave,
}: WizardFooterProps) {
  const isLast = currentStep === totalSteps;

  return (
    <div className="border-line fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex gap-3">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="rounded-pill border-mocha-300 text-mocha-700 flex h-13 flex-1 items-center justify-center gap-1.5 border text-sm font-semibold"
          >
            <ChevronLeft size={16} />
            이전
          </button>
        )}

        {isLast ? (
          <button
            type="button"
            onClick={onSave}
            disabled={!canNext || isSaving}
            data-testid="wizard-save"
            className="btn-primary rounded-pill flex h-13 flex-[2] items-center justify-center gap-2 disabled:opacity-40"
          >
            <Sparkles size={15} />
            {isSaving ? "저장 중..." : "카드 만들기"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            data-testid="wizard-next"
            className="btn-primary rounded-pill flex h-13 flex-[2] items-center justify-center gap-1.5 disabled:opacity-40"
          >
            다음
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
