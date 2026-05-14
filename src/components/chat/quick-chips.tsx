"use client";

interface QuickChipsProps {
  /** text: 전송할 메시지, chipLabel: 컨텍스트 제약 조건 키 */
  onSelect: (text: string, chipLabel?: string) => void;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  { label: "🥗 비건", text: "비건 메뉴 추천해줘", chipKey: "비건" },
  { label: "🌶️ 매운맛", text: "매운 음식 먹고 싶어", chipKey: "매운맛" },
  { label: "⏱️ 10분", text: "10분 안에 만드는 간단한 요리", chipKey: "10분" },
  { label: "💰 8천원이하", text: "8천원 이하 저렴한 메뉴 추천", chipKey: "8천원이하" },
  { label: "🧒 초등간식", text: "초등학생 아이 간식 추천해줘", chipKey: "초등간식" },
];

export function QuickChips({ onSelect, disabled }: QuickChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {QUICK_PROMPTS.map((chip) => (
        <button
          key={chip.label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip.text, chip.chipKey)}
          className="rounded-pill border-mocha-200 text-ink-600 hover:bg-mocha-50 flex-shrink-0 border bg-white px-3.5 py-2 text-xs font-medium transition disabled:opacity-40"
          data-testid={`quick-chip-${chip.chipKey}`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
