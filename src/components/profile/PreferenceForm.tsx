"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { saveUserPreference } from "@/lib/ai/persona-inference";
import type { CookingSkill, ShoppingTime } from "@/lib/ai/persona-context";

// ── 프리셋 데이터 ──────────────────────────────────────────────
const DIET_TAGS = [
  "비건",
  "채식",
  "글루텐프리",
  "저탄수",
  "저GI",
  "고단백",
  "저칼로리",
  "할랄",
  "오가닉",
  "항산화",
];

const SKILL_OPTIONS: { value: CookingSkill; label: string; desc: string }[] = [
  { value: "beginner", label: "초보", desc: "간단한 레시피 위주" },
  { value: "intermediate", label: "중급", desc: "일반 가정 요리 가능" },
  { value: "advanced", label: "고급", desc: "복잡한 요리도 도전" },
];

const SHOP_TIME_OPTIONS: { value: ShoppingTime; label: string; emoji: string }[] = [
  { value: "morning", label: "오전", emoji: "🌅" },
  { value: "afternoon", label: "오후", emoji: "☀️" },
  { value: "evening", label: "저녁", emoji: "🌙" },
];

// ── Props ──────────────────────────────────────────────────────
export interface PreferenceFormValues {
  dietaryTags: string[];
  cookingSkill: CookingSkill;
  preferredShoppingTime: ShoppingTime;
  householdSize: number;
}

interface PreferenceFormProps {
  initialValues?: Partial<PreferenceFormValues>;
  onSaved?: () => void;
  className?: string;
}

// ── 컴포넌트 ───────────────────────────────────────────────────
export function PreferenceForm({ initialValues, onSaved, className }: PreferenceFormProps) {
  const [dietaryTags, setDietaryTags] = useState<string[]>(initialValues?.dietaryTags ?? []);
  const [cookingSkill, setCookingSkill] = useState<CookingSkill>(
    initialValues?.cookingSkill ?? "intermediate"
  );
  const [preferredShoppingTime, setPreferredShoppingTime] = useState<ShoppingTime>(
    initialValues?.preferredShoppingTime ?? "afternoon"
  );
  const [householdSize, setHouseholdSize] = useState<number>(initialValues?.householdSize ?? 3);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleDietTag = (tag: string) => {
    setDietaryTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveUserPreference({
        dietaryTags,
        cookingSkill,
        preferredShoppingTime,
        householdSize,
      });
      if (result.success) {
        setSaved(true);
        onSaved?.();
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError("저장에 실패했습니다. 다시 시도해주세요.");
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* 가족 인원 */}
      <section>
        <p className="text-ink-700 mb-3 text-sm font-semibold">우리 가족은 몇 명인가요?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setHouseholdSize(n)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition",
                householdSize === n
                  ? "border-mocha-700 bg-mocha-700 text-paper"
                  : "border-line text-ink-500 hover:border-mocha-300"
              )}
            >
              {n === 6 ? "6+" : n}
            </button>
          ))}
        </div>
      </section>

      {/* 식이 태그 */}
      <section>
        <p className="text-ink-700 mb-1 text-sm font-semibold">식이 태그</p>
        <p className="text-ink-300 mb-3 text-xs">해당하는 항목을 모두 선택해주세요</p>
        <div className="flex flex-wrap gap-2">
          {DIET_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleDietTag(tag)}
              className={cn(
                "rounded-pill px-3 py-1.5 text-sm transition",
                dietaryTags.includes(tag)
                  ? "bg-mocha-700 text-paper"
                  : "bg-mocha-50 text-ink-700 hover:bg-mocha-100"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* 조리 수준 */}
      <section>
        <p className="text-ink-700 mb-3 text-sm font-semibold">요리 실력은?</p>
        <div className="grid grid-cols-3 gap-2">
          {SKILL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCookingSkill(opt.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded border py-3 text-sm transition",
                cookingSkill === opt.value
                  ? "border-mocha-700 bg-mocha-50 text-mocha-700 font-semibold"
                  : "border-line text-ink-500 hover:border-mocha-300"
              )}
            >
              <span className="font-medium">{opt.label}</span>
              <span className="text-ink-300 text-xs">{opt.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 선호 쇼핑 시간대 */}
      <section>
        <p className="text-ink-700 mb-3 text-sm font-semibold">선호하는 쇼핑 시간대</p>
        <div className="grid grid-cols-3 gap-2">
          {SHOP_TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPreferredShoppingTime(opt.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded border py-3 text-sm transition",
                preferredShoppingTime === opt.value
                  ? "border-mocha-700 bg-mocha-50 text-mocha-700 font-semibold"
                  : "border-line text-ink-500 hover:border-mocha-300"
              )}
            >
              <span className="text-lg">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 저장 버튼 */}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        data-testid="preference-save-btn"
        className={cn(
          "btn-primary w-full transition",
          saved && "bg-green-600",
          isPending && "opacity-60"
        )}
      >
        {isPending ? "저장 중..." : saved ? "✓ 저장됨" : "저장하기"}
      </button>
    </div>
  );
}
