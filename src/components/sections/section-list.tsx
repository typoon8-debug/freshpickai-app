"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectionItem } from "./section-item";
import type { CardSection } from "@/lib/types";

interface SectionListProps {
  sections: CardSection[];
  onReorder: (newSections: CardSection[]) => void;
  onRename: (sectionId: string, name: string) => void;
  onToggleAI: (sectionId: string) => void;
  onDelete: (sectionId: string) => void;
}

interface SortableItemProps {
  section: CardSection;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRename: (name: string) => void;
  onToggleAI: () => void;
  onDelete: () => void;
}

function SortableSectionItem({
  section,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRename,
  onToggleAI,
  onDelete,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.sectionId,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionItem
        section={section}
        index={index}
        total={total}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRename={onRename}
        onToggleAI={onToggleAI}
        onDelete={onDelete}
      />
    </div>
  );
}

export function SectionList({
  sections,
  onReorder,
  onRename,
  onToggleAI,
  onDelete,
}: SectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 8px 이동 후 드래그 시작 (클릭과 구분)
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      // 모바일 터치: 200ms 딜레이 + 5px 허용 오차
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.sectionId === active.id);
    const newIndex = sections.findIndex((s) => s.sectionId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({
      ...s,
      sortOrder: i,
    }));
    onReorder(reordered);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const reordered = arrayMove(sections, idx, idx - 1).map((s, i) => ({
      ...s,
      sortOrder: i,
    }));
    onReorder(reordered);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === sections.length - 1) return;
    const reordered = arrayMove(sections, idx, idx + 1).map((s, i) => ({
      ...s,
      sortOrder: i,
    }));
    onReorder(reordered);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={sections.map((s) => s.sectionId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2" data-testid="section-list">
          {sections.map((section, idx) => (
            <SortableSectionItem
              key={section.sectionId}
              section={section}
              index={idx}
              total={sections.length}
              onMoveUp={() => handleMoveUp(idx)}
              onMoveDown={() => handleMoveDown(idx)}
              onRename={(name) => onRename(section.sectionId, name)}
              onToggleAI={() => onToggleAI(section.sectionId)}
              onDelete={() => onDelete(section.sectionId)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
