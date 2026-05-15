"use client";

import { Chip } from "@/components/ui/chip";

const AI_TAG_PRESETS = ["비건", "채식", "저칼로리", "고단백", "저당", "글루텐프리"];

interface AiTagFilterProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function AiTagFilter({ selected, onChange }: AiTagFilterProps) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      {AI_TAG_PRESETS.map((tag) => (
        <Chip
          key={tag}
          label={`✨ ${tag}`}
          active={selected.includes(tag)}
          onClick={() => toggle(tag)}
          variant="outline"
        />
      ))}
    </div>
  );
}
