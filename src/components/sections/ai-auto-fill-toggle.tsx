"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAutoFillToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function AIAutoFillToggle({ enabled, onChange }: AIAutoFillToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition",
        enabled ? "bg-olive-100 text-olive-700" : "bg-mocha-50 text-ink-400"
      )}
      aria-label="AI 자동 채움 토글"
    >
      <Sparkles size={11} />
      AI
    </button>
  );
}
