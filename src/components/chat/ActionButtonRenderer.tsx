"use client";

import {
  ShoppingCart,
  Heart,
  CreditCard,
  ExternalLink,
  Search,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { ChatActionEnum } from "@/lib/types";
import type { ChatActionIntent } from "@/lib/types";

interface ActionButtonRendererProps {
  intents: ChatActionIntent[];
  onActionSelect: (intent: ChatActionIntent) => void;
  disabled?: boolean;
}

/** 액션 종류별 아이콘·스타일 매핑 */
function getButtonConfig(action: ChatActionEnum): {
  icon: React.ReactNode;
  className: string;
} {
  switch (action) {
    case ChatActionEnum.ADD_TO_CART:
      return {
        icon: <ShoppingCart size={14} />,
        className: "bg-mocha-700 text-paper hover:bg-mocha-800 active:scale-95",
      };
    case ChatActionEnum.ADD_TO_WISHLIST:
      return {
        icon: <Heart size={14} />,
        className: "border border-mocha-300 text-mocha-700 hover:bg-mocha-50 active:scale-95",
      };
    case ChatActionEnum.INITIATE_PAYMENT:
      return {
        icon: <CreditCard size={14} />,
        className: "bg-green-600 text-white hover:bg-green-700 active:scale-95",
      };
    case ChatActionEnum.VIEW_CARD:
      return {
        icon: <ExternalLink size={14} />,
        className: "border border-ink-200 text-ink-700 hover:bg-ink-50 active:scale-95",
      };
    case ChatActionEnum.SEARCH_MORE:
      return {
        icon: <Search size={14} />,
        className: "border border-ink-200 text-ink-700 hover:bg-ink-50 active:scale-95",
      };
    case ChatActionEnum.CONFIRM_YES:
      return {
        icon: <Check size={14} />,
        className: "bg-green-600 text-white hover:bg-green-700 active:scale-95",
      };
    case ChatActionEnum.CONFIRM_NO:
      return {
        icon: <X size={14} />,
        className: "bg-red-500 text-white hover:bg-red-600 active:scale-95",
      };
    case ChatActionEnum.UPDATE_CART:
      return {
        icon: <RefreshCw size={14} />,
        className: "border border-mocha-300 text-mocha-700 hover:bg-mocha-50 active:scale-95",
      };
    case ChatActionEnum.REMOVE_FROM_CART:
      return {
        icon: <X size={14} />,
        className: "border border-red-200 text-red-600 hover:bg-red-50 active:scale-95",
      };
    default:
      return {
        icon: null,
        className: "border border-ink-200 text-ink-700 hover:bg-ink-50 active:scale-95",
      };
  }
}

/** AI 응답 후 표시되는 인텐트 액션 버튼 렌더러 (모바일 44px 최소 터치 타겟) */
export function ActionButtonRenderer({
  intents,
  onActionSelect,
  disabled = false,
}: ActionButtonRendererProps) {
  if (!intents || intents.length === 0) return null;

  // CONFIRM_YES/NO 쌍이 있으면 가로 배치, 나머지는 세로 배치
  const hasConfirmPair =
    intents.some((i) => i.action === ChatActionEnum.CONFIRM_YES) &&
    intents.some((i) => i.action === ChatActionEnum.CONFIRM_NO);

  return (
    <div
      className={hasConfirmPair ? "flex flex-wrap gap-2" : "flex flex-col gap-1.5"}
      role="group"
      aria-label="AI 추천 액션"
    >
      {intents.map((intent, idx) => {
        const { icon, className } = getButtonConfig(intent.action);
        return (
          <button
            key={`${intent.action}-${idx}`}
            type="button"
            disabled={disabled}
            onClick={() => onActionSelect(intent)}
            className={`flex min-h-[44px] items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            aria-label={intent.label}
          >
            {icon}
            <span>{intent.label}</span>
          </button>
        );
      })}
    </div>
  );
}
