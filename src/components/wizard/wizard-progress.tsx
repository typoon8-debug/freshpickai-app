import { cn } from "@/lib/utils";

const STEPS = ["테마 선택", "취향 태그", "재료·예산", "미리보기"];

interface WizardProgressProps {
  currentStep: number; // 1-based
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="px-4 py-4">
      {/* 진행률 바 */}
      <div className="bg-mocha-100 mb-3 h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-mocha-700 h-full rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>

      {/* 단계 레이블 */}
      <div className="flex justify-between">
        {STEPS.map((label, idx) => {
          const step = idx + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition",
                  isDone
                    ? "bg-mocha-700 text-paper"
                    : isActive
                      ? "bg-mocha-700 text-paper"
                      : "bg-mocha-100 text-ink-300"
                )}
              >
                {isDone ? "✓" : step}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-mocha-700" : "text-ink-300"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
