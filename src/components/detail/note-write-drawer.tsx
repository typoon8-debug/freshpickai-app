"use client";

import { useState, useTransition } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { createNote } from "@/lib/actions/notes";
import type { CardNote } from "@/lib/types";

type NoteType = CardNote["noteType"];

interface NoteWriteDrawerProps {
  open: boolean;
  onClose: () => void;
  cardId: string;
  onNoteCreated?: (note: CardNote) => void;
}

const TYPE_INFO: Record<NoteType, { label: string; placeholder: string }> = {
  tip: { label: "팁", placeholder: "요리 팁이나 재료 대체 방법을 적어주세요" },
  review: { label: "후기", placeholder: "직접 만들어보신 후기를 남겨주세요" },
  question: { label: "질문", placeholder: "궁금한 점을 질문해주세요" },
};

export function NoteWriteDrawer({ open, onClose, cardId, onNoteCreated }: NoteWriteDrawerProps) {
  const [noteType, setNoteType] = useState<NoteType>("tip");
  const [body, setBody] = useState("");
  const [aiConsent, setAiConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setBody("");
    setAiConsent(false);
    setError(null);
    setNoteType("tip");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (body.trim().length < 5) {
      setError("내용을 5자 이상 입력해주세요.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createNote(cardId, noteType, body, aiConsent);
      if (result.success && result.note) {
        onNoteCreated?.(result.note);
        reset();
        onClose();
      } else {
        setError(result.error ?? "저장에 실패했습니다.");
      }
    });
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
      <DrawerContent className="max-h-[85vh] overflow-y-auto">
        <div className="flex flex-col gap-4 px-4 pt-2 pb-8" data-testid="note-write-drawer">
          <h3 className="text-ink-900 text-base font-semibold">노트 남기기</h3>

          {/* 노트 타입 탭 */}
          <div className="flex gap-2">
            {(["tip", "review", "question"] as NoteType[]).map((t) => (
              <button
                key={t}
                type="button"
                data-testid={`note-type-${t}`}
                onClick={() => setNoteType(t)}
                className={cn(
                  "rounded-pill px-4 py-2 text-sm transition",
                  noteType === t ? "bg-mocha-700 text-paper" : "bg-mocha-50 text-ink-500"
                )}
              >
                {TYPE_INFO[t].label}
              </button>
            ))}
          </div>

          {/* 텍스트 입력 */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={TYPE_INFO[noteType].placeholder}
            rows={4}
            data-testid="note-body-input"
            className="border-line text-ink-900 placeholder:text-ink-300 focus:border-mocha-500 w-full resize-none rounded-lg border p-3 text-sm outline-none"
          />

          {/* 에러 메시지 */}
          {error && (
            <p className="text-xs text-red-500" data-testid="note-error">
              {error}
            </p>
          )}

          {/* AI 학습 동의 */}
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={aiConsent}
              onChange={(e) => setAiConsent(e.target.checked)}
              data-testid="note-ai-consent"
              className="accent-mocha-700 mt-0.5"
            />
            <span className="text-ink-500 text-xs">
              AI 학습에 동의합니다 (선택). 도움이 많이 된 노트는 레시피 개선에 활용될 수 있어요.
            </span>
          </label>

          <button
            type="button"
            data-testid="note-submit-btn"
            disabled={body.trim().length < 5 || isPending}
            onClick={handleSubmit}
            className="btn-primary w-full disabled:opacity-40"
          >
            {isPending ? "저장 중..." : "노트 저장하기"}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
