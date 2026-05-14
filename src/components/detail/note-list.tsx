"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, MessageSquareReply } from "lucide-react";
import { cn } from "@/lib/utils";
import { markHelpful } from "@/lib/actions/notes";
import type { CardNote } from "@/lib/types";

type NoteType = CardNote["noteType"] | "all";
type SortType = "latest" | "helpful";

const TYPE_LABELS: Record<NoteType, string> = {
  all: "전체",
  tip: "팁",
  review: "후기",
  question: "질문",
};

const TYPE_BADGE_CLASS: Record<CardNote["noteType"], string> = {
  tip: "bg-olive-100 text-olive-700",
  review: "bg-sage/20 text-sage",
  question: "bg-honey/20 text-amber-700",
};

interface NoteListProps {
  notes: CardNote[];
  onNotesChange?: (notes: CardNote[]) => void;
}

export function NoteList({ notes, onNotesChange }: NoteListProps) {
  const [activeType, setActiveType] = useState<NoteType>("all");
  const [sort, setSort] = useState<SortType>("latest");
  // helpful count 로컬 오버라이드 맵 (notes prop 변경과 독립적으로 관리)
  const [helpfulOverrides, setHelpfulOverrides] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  // notes prop + 로컬 오버라이드를 합산한 파생 배열
  const mergedNotes = notes.map((n) => ({
    ...n,
    helpfulCount: helpfulOverrides[n.noteId] ?? n.helpfulCount,
  }));

  const filtered = (
    activeType === "all" ? mergedNotes : mergedNotes.filter((n) => n.noteType === activeType)
  ).sort((a, b) =>
    sort === "helpful"
      ? b.helpfulCount - a.helpfulCount
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function handleHelpful(noteId: string) {
    if (isPending) return;
    startTransition(async () => {
      const result = await markHelpful(noteId);
      if (result.success && typeof result.helpfulCount === "number") {
        setHelpfulOverrides((prev) => ({ ...prev, [noteId]: result.helpfulCount! }));
        onNotesChange?.(
          notes.map((n) => (n.noteId === noteId ? { ...n, helpfulCount: result.helpfulCount! } : n))
        );
      }
    });
  }

  if (notes.length === 0) {
    return (
      <p className="text-ink-300 py-6 text-center text-xs" data-testid="note-empty">
        아직 노트가 없어요. 첫 번째 노트를 남겨보세요!
      </p>
    );
  }

  return (
    <div data-testid="note-list">
      {/* 타입 필터 */}
      <div className="mb-3 flex gap-1">
        {(["all", "tip", "review", "question"] as NoteType[]).map((t) => (
          <button
            key={t}
            type="button"
            data-testid={`note-filter-${t}`}
            onClick={() => setActiveType(t)}
            className={cn(
              "rounded-pill px-3 py-1 text-xs transition",
              activeType === t
                ? "bg-mocha-700 text-paper"
                : "bg-mocha-50 text-ink-500 hover:bg-mocha-100"
            )}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* 정렬 */}
      <div className="mb-3 flex justify-end gap-2">
        {(["latest", "helpful"] as SortType[]).map((s) => (
          <button
            key={s}
            type="button"
            data-testid={`note-sort-${s}`}
            onClick={() => setSort(s)}
            className={cn(
              "text-xs transition",
              sort === s ? "text-mocha-700 font-semibold" : "text-ink-400 hover:text-ink-600"
            )}
          >
            {s === "latest" ? "최신순" : "도움순"}
          </button>
        ))}
      </div>

      {/* 노트 목록 */}
      <div className="flex flex-col gap-3">
        {filtered.map((note) => (
          <div
            key={note.noteId}
            data-testid={`note-item-${note.noteId}`}
            className="border-line/50 border-b pb-3"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-pill px-2 py-0.5 text-[10px]",
                    TYPE_BADGE_CLASS[note.noteType]
                  )}
                >
                  {TYPE_LABELS[note.noteType]}
                </span>
                <span className="text-ink-300 text-xs">{note.createdAt.slice(0, 10)}</span>
              </div>

              {/* 도움이 됨 버튼 */}
              <button
                type="button"
                data-testid={`note-helpful-${note.noteId}`}
                onClick={() => handleHelpful(note.noteId)}
                className="text-ink-400 hover:text-mocha-700 flex items-center gap-1 text-xs transition"
              >
                <ThumbsUp size={12} />
                <span>{note.helpfulCount}</span>
              </button>
            </div>

            <p className="text-ink-700 text-sm leading-relaxed">{note.body}</p>

            {/* 운영자 답글 */}
            {note.adminReply && (
              <div
                className="border-mocha-300 bg-mocha-50 mt-2 rounded border-l-2 px-3 py-2"
                data-testid={`note-admin-reply-${note.noteId}`}
              >
                <div className="mb-1 flex items-center gap-1">
                  <MessageSquareReply size={11} className="text-mocha-500" />
                  <p className="text-mocha-700 text-xs font-medium">운영자 답글</p>
                </div>
                <p className="text-ink-700 text-xs leading-relaxed">{note.adminReply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
