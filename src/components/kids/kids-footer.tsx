"use client";

import { Send } from "lucide-react";
import { useKidsStore } from "@/lib/store";

export function KidsFooter() {
  const picks = useKidsStore((s) => s.picks);

  const handleSend = () => {
    // Task 031에서 실제 push notification 연동 예정
    alert(`${picks.map((p) => p.name).join(", ")} 엄마한테 보냈어요! 🎉`);
  };

  return (
    <div className="border-line fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          {picks.length > 0 ? (
            <p className="text-ink-700 text-sm">
              <span className="text-mocha-700 font-bold">{picks.length}개</span> 선택됨:{" "}
              {picks.map((p) => p.emoji).join(" ")}
            </p>
          ) : (
            <p className="text-ink-400 text-sm">음식을 골라주세요!</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={picks.length === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-40"
        >
          <Send size={14} />
          엄마한테 보내기
        </button>
      </div>
    </div>
  );
}
