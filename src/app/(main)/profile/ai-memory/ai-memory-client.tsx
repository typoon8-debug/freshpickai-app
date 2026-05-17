"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brain, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteMemoryItem, clearAllMemoryItems } from "@/lib/actions/chat/memory-manage";
import type { MemoryItem } from "@/lib/actions/chat/memory-manage";

interface AiMemoryClientProps {
  initialItems: MemoryItem[];
}

export function AiMemoryClient({ initialItems }: AiMemoryClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<MemoryItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (itemId: string) => {
    startTransition(async () => {
      const { ok } = await deleteMemoryItem(itemId);
      if (ok) {
        setItems((prev) => prev.filter((i) => i.itemId !== itemId));
        toast.success("기억 항목을 삭제했어요");
      } else {
        toast.error("삭제에 실패했습니다");
      }
    });
  };

  const handleClearAll = () => {
    startTransition(async () => {
      const { ok } = await clearAllMemoryItems();
      if (ok) {
        setItems([]);
        toast.success("모든 AI 기억을 초기화했어요");
      } else {
        toast.error("초기화에 실패했습니다");
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <button type="button" onClick={() => router.back()} className="text-ink-600 p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-1 items-center gap-2">
          <Brain size={18} className="text-mocha-500" />
          <h1 className="text-ink-900 text-base font-semibold">AI 기억 관리</h1>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={isPending}
            className="text-red-500 hover:text-red-600"
          >
            전체 초기화
          </Button>
        )}
      </div>

      {/* 안내 배너 */}
      <div className="bg-mocha-50 border-mocha-100 mx-4 mt-4 rounded-xl border p-4">
        <p className="text-ink-600 text-sm leading-relaxed">
          AI가 대화에서 학습한 선호도, 알레르기, 식습관 등의 장기 기억 목록입니다.
          <br />
          불필요한 항목은 삭제해 AI 응답 품질을 관리하세요.
        </p>
      </div>

      {/* 기억 목록 */}
      <div className="flex-1 px-4 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Brain size={40} className="text-mocha-200" />
            <p className="text-ink-400 text-sm">저장된 AI 기억이 없어요</p>
            <p className="text-ink-300 text-xs">대화를 더 많이 나눌수록 AI가 취향을 기억해요</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.itemId}
                className="border-line flex items-start gap-3 rounded-xl border p-4"
              >
                <div className="flex-1">
                  <p className="text-ink-800 text-sm leading-relaxed">{item.content}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="bg-mocha-100 text-mocha-600 rounded-full px-2 py-0.5 text-xs">
                      중요도 {Math.round(item.importanceScore * 100)}%
                    </span>
                    <span className="text-ink-300 text-xs">
                      {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item.itemId)}
                  disabled={isPending}
                  className="text-ink-300 mt-0.5 p-1 transition hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
