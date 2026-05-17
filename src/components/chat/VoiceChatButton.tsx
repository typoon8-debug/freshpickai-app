"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SoundWaveAnimation } from "./SoundWaveAnimation";
import type { SpeechState } from "@/hooks/useSpeechRecognition";

interface VoiceChatButtonProps {
  state: SpeechState;
  isSupported: boolean;
  onToggle: () => void;
  /** AI 응답 스트리밍 중 — true이면 버튼 비활성화 */
  aiResponding?: boolean;
}

export function VoiceChatButton({
  state,
  isSupported,
  onToggle,
  aiResponding = false,
}: VoiceChatButtonProps) {
  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isDisabled = !isSupported || isProcessing || aiResponding;

  return (
    <div className="relative flex flex-shrink-0 flex-col items-center">
      <button
        type="button"
        onClick={onToggle}
        disabled={isDisabled}
        aria-label="음성으로 입력하기"
        aria-pressed={isListening}
        title={!isSupported ? "이 브라우저는 음성 입력을 지원하지 않습니다" : undefined}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
          isListening && "bg-red-50 text-red-500 ring-2 ring-red-300 ring-offset-1",
          isProcessing && "bg-mocha-50 text-mocha-400",
          !isListening &&
            !isProcessing &&
            isSupported &&
            "text-ink-400 hover:bg-mocha-50 hover:text-mocha-600",
          !isSupported && "text-ink-300 cursor-not-allowed opacity-40"
        )}
      >
        {isProcessing ? (
          <Loader2 size={15} className="animate-spin" />
        ) : isListening ? (
          <SoundWaveAnimation isActive />
        ) : isSupported ? (
          <Mic size={15} />
        ) : (
          <MicOff size={15} />
        )}
      </button>

      {isListening && (
        <span className="mt-0.5 text-[10px] leading-tight whitespace-nowrap text-red-500">
          듣고 있어요...
        </span>
      )}
    </div>
  );
}
