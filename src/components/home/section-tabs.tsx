"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSectionStore } from "@/lib/store";

const OFFICIAL_SECTIONS = [
  { id: "all", label: "전체" },
  { id: "chef_table", label: "흑백요리사" },
  { id: "one_meal", label: "한 끼" },
  { id: "family_recipe", label: "엄마손맛" },
  { id: "drama_recipe", label: "드라마한끼" },
  { id: "honwell", label: "혼웰빙" },
  { id: "seasonal", label: "제철한상" },
  { id: "global_plate", label: "글로벌" },
  { id: "k_dessert", label: "K디저트" },
  { id: "snack_pack", label: "간식팩" },
  { id: "cinema_night", label: "홈시네마" },
  /** F020: 냉장고 비우기 가상 섹션 */
  { id: "fridge", label: "🧊 냉장고" },
];

interface SectionTabsProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function SectionTabs({ activeSection, onSectionChange }: SectionTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sections } = useSectionStore();

  // 사용자 정의(커스텀) 섹션을 공식 탭 뒤에 이어 붙임
  const tabs = useMemo(() => {
    const customSections = sections
      .filter((s) => !s.isOfficial)
      .map((s) => ({ id: `custom:${s.sectionId}`, label: s.name }));
    return [...OFFICIAL_SECTIONS, ...customSections];
  }, [sections]);

  return (
    <div className="flex items-center gap-2">
      <div
        ref={scrollRef}
        className="scrollbar-hide flex flex-1 gap-1 overflow-x-auto pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSectionChange(id)}
            className={cn(
              "rounded-pill shrink-0 px-3.5 py-1.5 text-sm transition",
              activeSection === id
                ? "bg-mocha-700 text-paper font-semibold"
                : "bg-mocha-50 text-ink-500 hover:bg-mocha-100"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 섹션 편집 버튼 */}
      <Link
        href="/sections"
        aria-label="섹션 편집"
        className="bg-mocha-50 text-ink-400 hover:bg-mocha-100 hover:text-ink-700 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      >
        <Settings2 size={15} />
      </Link>
    </div>
  );
}
