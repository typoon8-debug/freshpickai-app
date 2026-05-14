"use client";

import { useCallback, useRef } from "react";
import { useChatStore } from "@/lib/store";
import type { MemoAddedItem, CartAddedItem } from "@/lib/types";

function formatTime() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

/** AI SDK v6 UIMessageChunk SSE 라인 파싱 (data: {...}\n\n 형식) */
function parseSseLine(line: string): Record<string, unknown> | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const json = trimmed.slice(5).trim();
  if (json === "[DONE]") return null;
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function useChatStream() {
  const {
    push,
    appendStream,
    setStreaming,
    setCurrentTool,
    updateMemoItems,
    updateCartItems,
    isStreaming,
  } = useChatStore();

  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const activeChipRef = useRef<string | undefined>(undefined);

  const send = useCallback(
    async (text: string, chipLabel?: string) => {
      if (isStreaming || !text.trim()) return;

      const trimmed = text.trim();
      activeChipRef.current = chipLabel;
      historyRef.current = [...historyRef.current, { role: "user", content: trimmed }];

      push({
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed,
        time: formatTime(),
      });

      setStreaming(true);
      setCurrentTool(null);

      const aiId = `ai-${Date.now()}`;
      push({ id: aiId, role: "ai", text: "", time: formatTime() });

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyRef.current.slice(-20),
            quickChip: activeChipRef.current,
          }),
        });

        if (!res.ok) {
          const errBody = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errBody.error ?? `HTTP ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";
        let pendingMemoItems: MemoAddedItem[] | undefined;
        let pendingCartItems: CartAddedItem[] | undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          // SSE는 \n\n으로 메시지 구분
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            for (const line of part.split("\n")) {
              const chunk = parseSseLine(line);
              if (!chunk) continue;

              const type = chunk.type as string;

              switch (type) {
                case "text-delta": {
                  const delta = (chunk.delta as string) ?? "";
                  fullText += delta;
                  appendStream(delta);
                  break;
                }
                case "tool-input-start": {
                  const toolName = (chunk.toolName as string) ?? "";
                  if (toolName) setCurrentTool(toolName);
                  break;
                }
                case "tool-input-available": {
                  const toolName = (chunk.toolName as string) ?? "";
                  if (toolName) setCurrentTool(toolName);
                  break;
                }
                case "tool-output-available": {
                  const output = chunk.output as Record<string, unknown> | undefined;
                  if (output?.success === true) {
                    // addToMemo 결과 파싱
                    if (Array.isArray(output.addedItems) && output.addedItems.length > 0) {
                      pendingMemoItems = output.addedItems as MemoAddedItem[];
                    }
                    // addToCart 결과 파싱
                    if (
                      Array.isArray(output.addedItems) &&
                      output.count !== undefined &&
                      (output.addedItems as CartAddedItem[]).some((i) => "price" in i)
                    ) {
                      pendingCartItems = output.addedItems as CartAddedItem[];
                    }
                  }
                  setCurrentTool(null);
                  break;
                }
                case "finish-step":
                case "finish": {
                  setCurrentTool(null);
                  break;
                }
                case "error": {
                  console.error("[chat stream] error:", chunk.errorText);
                  break;
                }
              }
            }
          }
        }

        historyRef.current = [...historyRef.current, { role: "assistant", content: fullText }];

        if (pendingMemoItems) {
          updateMemoItems(aiId, pendingMemoItems);
        }
        if (pendingCartItems) {
          updateCartItems(aiId, pendingCartItems);
        }
      } catch (err) {
        console.error("[useChatStream] error:", err);
        appendStream("\n\n죄송합니다. 잠시 오류가 발생했습니다. 다시 시도해 주세요.");
      } finally {
        setStreaming(false);
        setCurrentTool(null);
      }
    },
    [
      isStreaming,
      push,
      appendStream,
      setStreaming,
      setCurrentTool,
      updateMemoItems,
      updateCartItems,
    ]
  );

  return { send, isStreaming };
}
