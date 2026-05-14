"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToolName = "searchItems" | "getUserContext" | "getInventory" | "addToCart" | "addToMemo";

const TOOL_LABELS: Record<ToolName, string> = {
  searchItems: "메뉴 검색 중",
  getUserContext: "취향 불러오는 중",
  getInventory: "냉장고 확인 중",
  addToCart: "장바구니에 담는 중",
  addToMemo: "장보기 메모에 추가 중",
};

interface ToolCallIndicatorProps {
  toolName: ToolName;
  status?: "running" | "done";
}

export function ToolCallIndicator({ toolName, status = "running" }: ToolCallIndicatorProps) {
  const isDone = status === "done";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
        isDone ? "bg-mocha-50 text-mocha-600" : "bg-mocha-100 text-mocha-700"
      )}
    >
      {isDone ? (
        <CheckCircle2 size={12} className="text-mocha-500 flex-shrink-0" />
      ) : (
        <Loader2 size={12} className="text-mocha-500 flex-shrink-0 animate-spin" />
      )}
      <span>{TOOL_LABELS[toolName]}</span>
    </div>
  );
}
