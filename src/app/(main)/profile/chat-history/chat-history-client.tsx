"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { getSessionMessages } from "@/lib/actions/chat/session-list";
import type { ChatSessionSummary, ChatSessionMessage } from "@/lib/actions/chat/session-list";

interface ChatHistoryClientProps {
  sessions: ChatSessionSummary[];
}

interface ExpandedSession {
  messages: ChatSessionMessage[];
  loading: boolean;
}

export function ChatHistoryClient({ sessions }: ChatHistoryClientProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, ExpandedSession>>({});

  const toggleSession = async (sessionId: string) => {
    if (expanded[sessionId]) {
      setExpanded((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      return;
    }

    setExpanded((prev) => ({ ...prev, [sessionId]: { messages: [], loading: true } }));
    const messages = await getSessionMessages(sessionId);
    setExpanded((prev) => ({ ...prev, [sessionId]: { messages, loading: false } }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <button type="button" onClick={() => router.back()} className="text-ink-600 p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-1 items-center gap-2">
          <MessageSquare size={18} className="text-mocha-500" />
          <h1 className="text-ink-900 text-base font-semibold">대화 히스토리</h1>
        </div>
      </div>

      {/* 세션 목록 */}
      <div className="flex-1 divide-y px-4">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <MessageSquare size={40} className="text-mocha-200" />
            <p className="text-ink-400 text-sm">저장된 대화 기록이 없어요</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isOpen = !!expanded[session.sessionId];
            const expSession = expanded[session.sessionId];

            return (
              <div key={session.sessionId} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleSession(session.sessionId)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <div className="flex-1">
                    <p className="text-ink-800 text-sm leading-relaxed">{session.summaryText}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-ink-300 text-xs">
                        {new Date(session.createdAt).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {session.keywords.slice(0, 4).map((kw) => (
                        <span
                          key={kw}
                          className="bg-mocha-100 text-mocha-600 rounded-full px-2 py-0.5 text-xs"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-ink-400 mt-0.5">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>

                {/* 메시지 펼치기 */}
                {isOpen && (
                  <div className="mt-3 space-y-2 pl-2">
                    {expSession.loading ? (
                      <p className="text-ink-300 text-xs">불러오는 중...</p>
                    ) : (
                      expSession.messages.map((msg) => (
                        <div
                          key={msg.messageId}
                          className={`rounded-xl px-3 py-2 text-sm ${
                            msg.role === "user"
                              ? "bg-mocha-50 text-ink-700 ml-6"
                              : "text-ink-600 mr-6 bg-gray-50"
                          }`}
                        >
                          <span className="text-ink-300 mr-2 text-xs">
                            {msg.role === "user" ? "나" : "AI"}
                          </span>
                          {msg.content}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
