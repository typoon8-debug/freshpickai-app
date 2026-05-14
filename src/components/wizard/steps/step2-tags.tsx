"use client";

import { cn } from "@/lib/utils";

const TAG_GROUPS = [
  {
    label: "맛 스타일",
    tags: ["구수한", "달콤한", "매운맛", "짭짤", "담백한", "깊은맛", "새콤한"],
  },
  {
    label: "식단",
    tags: ["비건", "저칼로리", "단백질 식단", "저속노화", "글루텐프리"],
  },
  {
    label: "상황",
    tags: ["혼밥", "가족식사", "손님초대", "도시락", "야식", "간식"],
  },
];

interface Step2TagsProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function Step2Tags({ selected, onChange }: Step2TagsProps) {
  const MIN_TAGS = 3;

  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-ink-500 text-sm">취향 태그를 선택해주세요 (최소 {MIN_TAGS}개)</p>
        <span
          className={cn(
            "text-xs font-medium",
            selected.length >= MIN_TAGS ? "text-sage" : "text-terracotta"
          )}
        >
          {selected.length}/{MIN_TAGS}+
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {TAG_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-ink-500 mb-2 text-xs font-semibold tracking-wide uppercase">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5 text-sm transition",
                    selected.includes(tag)
                      ? "border-mocha-600 bg-mocha-700 text-paper font-medium"
                      : "border-line text-ink-600 bg-white"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
