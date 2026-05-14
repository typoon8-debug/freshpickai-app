"use client";

import { useEffect, useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { SectionList } from "@/components/sections/section-list";
import { AddSectionButton } from "@/components/sections/add-section-button";
import { useSectionStore } from "@/lib/store";
import {
  getSectionsAction,
  createSectionAction,
  deleteSectionAction,
  updateSectionAction,
  reorderSectionsAction,
  toggleAiAutoFillAction,
} from "@/lib/actions/sections";
import type { CardSection } from "@/lib/types";

export default function SectionsPage() {
  const { sections, setSections, toggleAiAutoFill, rename } = useSectionStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSectionsAction().then((data) => {
      if (data.length > 0) setSections(data);
      setLoading(false);
    });
  }, [setSections]);

  const handleDelete = async (sectionId: string) => {
    const result = await deleteSectionAction(sectionId);
    if (!result.error) {
      setSections(sections.filter((s) => s.sectionId !== sectionId));
    }
  };

  const handleAdd = async (name: string) => {
    const result = await createSectionAction(name);
    if (result.section) {
      setSections([...sections, result.section]);
    }
  };

  const handleRename = async (sectionId: string, name: string) => {
    rename(sectionId, name);
    await updateSectionAction(sectionId, name);
  };

  const handleToggleAI = async (sectionId: string) => {
    const section = sections.find((s) => s.sectionId === sectionId);
    if (!section) return;
    toggleAiAutoFill(sectionId);
    await toggleAiAutoFillAction(sectionId, !section.aiAutoFill);
  };

  // 드래그앤드롭 또는 화살표 버튼으로 순서 변경 시 호출
  const handleReorder = async (newSections: CardSection[]) => {
    setSections(newSections);
    const updated = newSections.map((s, i) => ({
      sectionId: s.sectionId,
      sortOrder: i,
    }));
    await reorderSectionsAction(updated);
  };

  if (loading) {
    return (
      <>
        <TopHeader title="내 섹션 관리" />
        <div className="px-4 py-4">
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-ink-100 h-12 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopHeader title="내 섹션 관리" />

      <div className="px-4 py-4">
        <p className="text-ink-500 mb-4 text-sm">섹션 순서를 바꾸거나 AI 자동 채움을 켜보세요.</p>

        <SectionList
          sections={sections}
          onReorder={handleReorder}
          onRename={handleRename}
          onToggleAI={handleToggleAI}
          onDelete={handleDelete}
        />

        <div className="mt-3">
          <AddSectionButton onAdd={handleAdd} />
        </div>
      </div>
    </>
  );
}
