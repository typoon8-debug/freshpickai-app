"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // 자동 높이 조절 (최대 5줄)
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="border-line bg-paper border-t px-4 py-3">
      <div className="border-line flex items-end gap-2 rounded-xl border bg-white px-3 py-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="AI에게 물어보세요..."
          className="text-ink-900 placeholder:text-ink-300 flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none disabled:opacity-50"
          style={{ minHeight: 24, maxHeight: 120 }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition",
            value.trim() && !disabled
              ? "bg-mocha-700 text-paper hover:bg-mocha-900"
              : "bg-mocha-100 text-mocha-300"
          )}
          aria-label="전송"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
