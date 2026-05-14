"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { RecCardCarousel } from "./rec-card-carousel";
import { AddToMemoConfirmCard } from "./AddToMemoConfirmCard";
import { ActionableProductCard } from "./actionable-product-card";
import { ToolCallIndicator } from "./tool-call-indicator";

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  h2: ({ children }) => (
    <h2 className="text-ink-900 mt-2 mb-0.5 text-sm font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-ink-800 mt-1.5 mb-0.5 text-sm font-medium">{children}</h3>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="border-ink-100 my-2" />,
  ul: ({ children }) => <ul className="my-1 list-disc space-y-0.5 pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="my-1 list-decimal space-y-0.5 pl-4">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ children }) => (
    <code className="bg-ink-100 rounded px-1 py-0.5 font-mono text-xs">{children}</code>
  ),
  table: ({ children }) => (
    <div className="border-ink-100 my-2 overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-mocha-100">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="even:bg-ink-50 border-ink-100 border-b last:border-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="border-ink-100 text-ink-700 border-r px-2.5 py-1.5 text-left font-semibold whitespace-nowrap last:border-r-0">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-ink-100 text-ink-800 border-r px-2.5 py-1.5 last:border-r-0">
      {children}
    </td>
  ),
};

interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function Message({ message, isStreaming }: MessageProps) {
  const isAi = message.role === "ai";

  return (
    <div className={cn("flex gap-2", isAi ? "items-start" : "flex-row-reverse items-start")}>
      {/* AI 아바타 */}
      {isAi && (
        <div className="bg-mocha-700 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full">
          <Sparkles size={13} className="text-paper" />
        </div>
      )}

      <div className={cn("flex max-w-[80%] flex-col gap-1.5", !isAi && "items-end")}>
        {/* 도구 호출 인디케이터 */}
        {isAi && isStreaming && message.currentTool && (
          <ToolCallIndicator
            toolName={message.currentTool as Parameters<typeof ToolCallIndicator>[0]["toolName"]}
            status="running"
          />
        )}

        {/* 말풍선 */}
        <div
          className={cn(
            "rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
            isAi
              ? "text-ink-900 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
              : "bg-mocha-700 text-paper"
          )}
        >
          {isAi ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.text}
            </ReactMarkdown>
          ) : (
            message.text
          )}
          {isAi && isStreaming && message.text === "" && !message.currentTool && (
            <span className="inline-flex gap-0.5">
              <span className="bg-ink-300 inline-block h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
              <span className="bg-ink-300 inline-block h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
              <span className="bg-ink-300 inline-block h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
            </span>
          )}
        </div>

        {/* 장보기 메모 추가 확인 카드 */}
        {isAi && message.memoItems && message.memoItems.length > 0 && (
          <div className="w-full max-w-[260px]">
            <AddToMemoConfirmCard items={message.memoItems} />
          </div>
        )}

        {/* 장바구니 추가 확인 카드 */}
        {isAi && message.cartItems && message.cartItems.length > 0 && (
          <div className="w-full max-w-[260px]">
            <ActionableProductCard items={message.cartItems} />
          </div>
        )}

        {/* 추천 카드 캐러셀 */}
        {isAi && message.cards && message.cards.length > 0 && !isStreaming && (
          <RecCardCarousel cards={message.cards} />
        )}

        {/* 시간 */}
        <span className="text-ink-300 text-[10px]">{message.time}</span>
      </div>
    </div>
  );
}
