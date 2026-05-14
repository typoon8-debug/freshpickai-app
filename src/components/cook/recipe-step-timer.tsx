"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeStepTimerProps {
  timerSeconds: number;
  onComplete?: () => void;
}

type State = { remaining: number; running: boolean; finished: boolean };
type Action =
  | { type: "reset"; seconds: number }
  | { type: "tick" }
  | { type: "complete" }
  | { type: "toggle" };

function timerReducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return { remaining: action.seconds, running: false, finished: false };
    case "tick":
      return { ...state, remaining: state.remaining - 1 };
    case "complete":
      return { ...state, running: false, finished: true };
    case "toggle":
      return state.finished ? state : { ...state, running: !state.running };
    default:
      return state;
  }
}

export function RecipeStepTimer({ timerSeconds, onComplete }: RecipeStepTimerProps) {
  const [{ remaining, running, finished }, dispatch] = useReducer(timerReducer, {
    remaining: timerSeconds,
    running: false,
    finished: false,
  });

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // timerSeconds prop 변경 시 리셋
  useEffect(() => {
    dispatch({ type: "reset", seconds: timerSeconds });
  }, [timerSeconds]);

  // 카운트다운 틱
  useEffect(() => {
    if (!running || finished) return;
    if (remaining <= 0) {
      const id = setTimeout(() => {
        dispatch({ type: "complete" });
        onCompleteRef.current?.();
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("요리 타이머 완료! 🍳", { body: "다음 단계로 넘어가세요." });
        }
      }, 0);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => dispatch({ type: "tick" }), 1000);
    return () => clearTimeout(id);
  }, [running, finished, remaining]);

  const handleReset = useCallback(() => {
    dispatch({ type: "reset", seconds: timerSeconds });
  }, [timerSeconds]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = timerSeconds > 0 ? ((timerSeconds - remaining) / timerSeconds) * 100 : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3",
        finished
          ? "border-green-300 bg-green-50"
          : running
            ? "border-mocha-400 bg-mocha-50"
            : "border-mocha-200 bg-white"
      )}
    >
      <Timer
        size={18}
        className={cn(finished ? "text-green-600" : running ? "text-mocha-700" : "text-mocha-400")}
      />

      <span className="text-ink-800 min-w-[52px] font-mono text-base font-semibold">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>

      <div className="bg-mocha-100 h-1.5 flex-1 overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            finished ? "bg-green-500" : "bg-mocha-600"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => dispatch({ type: "toggle" })}
          disabled={finished}
          aria-label={running ? "일시정지" : "시작"}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full transition",
            finished ? "text-green-600 opacity-60" : "bg-mocha-700 text-paper hover:bg-mocha-900"
          )}
        >
          {running ? <Pause size={13} /> : <Play size={13} />}
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="초기화"
          className="text-mocha-400 hover:text-mocha-700 flex h-7 w-7 items-center justify-center rounded-full transition"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}
