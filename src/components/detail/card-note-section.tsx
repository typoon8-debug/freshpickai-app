"use client";

import { PenLine } from "lucide-react";
import { NoteList } from "@/components/detail/note-list";
import type { CardNote } from "@/lib/types";

interface CardNoteSectionProps {
  cardId: string;
  notes: CardNote[];
  onNotesChange: (notes: CardNote[]) => void;
  onWrite?: () => void;
}

export function CardNoteSection({ notes, onNotesChange, onWrite }: CardNoteSectionProps) {
  return (
    <section className="border-line rounded-xl border bg-white p-4" data-testid="card-note-section">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-ink-900 text-sm font-semibold">
          사용자 노트{" "}
          <span className="text-ink-400 font-normal" data-testid="note-count">
            ({notes.length})
          </span>
        </h3>
        <button
          type="button"
          data-testid="note-write-btn"
          onClick={onWrite}
          className="text-mocha-700 flex items-center gap-1 text-xs font-medium hover:underline"
        >
          <PenLine size={12} />내 노트 남기기
        </button>
      </div>

      <NoteList notes={notes} onNotesChange={onNotesChange} />
    </section>
  );
}
