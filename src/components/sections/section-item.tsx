"use client";

import { useState } from "react";
import { GripVertical, Pencil, Check, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIAutoFillToggle } from "./ai-auto-fill-toggle";
import type { CardSection } from "@/lib/types";

interface SectionItemProps {
  section: CardSection;
  index: number;
  total: number;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRename: (name: string) => void;
  onToggleAI: () => void;
  onDelete: () => void;
}

export function SectionItem({
  section,
  index,
  total,
  isDragging,
  dragHandleProps,
  onMoveUp,
  onMoveDown,
  onRename,
  onToggleAI,
  onDelete,
}: SectionItemProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(section.name);

  const handleSave = () => {
    if (draftName.trim()) onRename(draftName.trim());
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "border-line flex flex-col rounded-lg border bg-white transition-colors",
        isDragging && "border-mocha-300 bg-mocha-50"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        {/* 드래그 핸들 — @dnd-kit listeners + attributes 주입 */}
        <span
          className={cn(
            "text-ink-200 hover:text-mocha-500 flex-shrink-0 transition",
            isDragging ? "text-mocha-400 cursor-grabbing" : "cursor-grab"
          )}
          style={{ touchAction: "none" }}
          aria-label="드래그로 순서 변경"
          data-testid="drag-handle"
          {...(dragHandleProps as React.HTMLAttributes<HTMLSpanElement>)}
        >
          <GripVertical size={16} />
        </span>

        {/* 이름 */}
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="border-mocha-500 text-ink-900 w-full border-b bg-transparent text-sm font-medium outline-none"
            />
          ) : (
            <p className="text-ink-900 truncate text-sm font-medium">{section.name}</p>
          )}
        </div>

        {/* AI 토글 */}
        <AIAutoFillToggle enabled={section.aiAutoFill} onChange={() => onToggleAI()} />

        {/* 이름 편집 */}
        <button
          type="button"
          onClick={editing ? handleSave : () => setEditing(true)}
          className={cn("text-ink-300 hover:text-mocha-600 transition")}
          aria-label={editing ? "저장" : "편집"}
        >
          {editing ? <Check size={15} /> : <Pencil size={14} />}
        </button>

        {/* 순서 이동 (a11y 폴백) */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="text-ink-200 hover:text-mocha-600 disabled:opacity-20"
            aria-label="위로"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="text-ink-200 hover:text-mocha-600 disabled:opacity-20"
            aria-label="아래로"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* 삭제 (비공식 섹션만) */}
        {!section.isOfficial && (
          <button
            type="button"
            onClick={onDelete}
            className="text-ink-200 hover:text-terracotta transition"
            aria-label="삭제"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* AI 자동 채움 OFF 안내 */}
      {!section.aiAutoFill && (
        <p className="text-ink-400 border-line border-t px-3 pb-2 text-[11px]">
          수동으로 카드를 골라 채워주세요
        </p>
      )}
    </div>
  );
}
