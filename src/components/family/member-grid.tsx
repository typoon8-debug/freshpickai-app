"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { removeFamilyMember } from "@/lib/actions/family";
import type { FamilyMember } from "@/lib/types";

const ROLE_EMOJI: Record<FamilyMember["familyRole"], string> = {
  parent: "👨‍👩‍",
  teen: "🧑‍",
  kid: "🧒",
};

const ROLE_LABEL: Record<FamilyMember["familyRole"], string> = {
  parent: "부모",
  teen: "청소년",
  kid: "아이",
};

interface MemberGridProps {
  members: FamilyMember[];
  currentUserId?: string;
  hasGroup?: boolean;
}

export function MemberGrid({ members, currentUserId, hasGroup = true }: MemberGridProps) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRemove = (member: FamilyMember) => {
    if (!confirm(`${member.displayName}님을 가족에서 제외할까요?`)) return;
    setRemovingId(member.memberId);
    startTransition(async () => {
      const result = await removeFamilyMember(member.memberId);
      if (result.ok) {
        router.refresh();
      } else {
        alert("삭제에 실패했어요. 다시 시도해주세요.");
      }
      setRemovingId(null);
    });
  };

  if (members.length === 0) {
    return (
      <section className="px-4">
        <h3 className="text-ink-700 mb-3 text-sm font-semibold">가족 구성원</h3>
        <div className="border-line rounded-lg border bg-white p-6 text-center">
          <p className="text-2xl">👨‍👩‍👧‍👦</p>
          <p className="text-ink-400 mt-1 text-sm">아직 가족 구성원이 없어요</p>
          <p className="text-ink-300 text-xs">
            {hasGroup ? "아래 초대 링크로 가족을 초대해보세요" : "가족 그룹을 만들고 초대해보세요"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4">
      <h3 className="text-ink-700 mb-3 text-sm font-semibold">가족 구성원</h3>
      <div className="grid grid-cols-2 gap-3">
        {members.map((member) => {
          const isMe = member.userId === currentUserId;
          const isRemoving = removingId === member.memberId && isPending;
          return (
            <div
              key={member.memberId}
              className={cn(
                "border-line relative flex items-center gap-3 rounded-lg border bg-white p-3 transition",
                isRemoving && "opacity-50"
              )}
            >
              {/* 아바타 */}
              <div className="relative">
                <div className="bg-mocha-100 flex h-10 w-10 items-center justify-center rounded-full text-lg">
                  {ROLE_EMOJI[member.familyRole]}
                </div>
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                    member.online ? "bg-sage" : "bg-ink-200"
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-ink-900 text-sm font-semibold">{member.displayName}</span>
                  <span className="text-ink-400 text-[10px]">{ROLE_LABEL[member.familyRole]}</span>
                  {isMe && (
                    <span className="bg-mocha-100 text-mocha-600 rounded px-1 text-[9px] font-medium">
                      나
                    </span>
                  )}
                </div>
                {member.todayActivity && (
                  <p className="text-ink-400 mt-0.5 truncate text-[11px]">{member.todayActivity}</p>
                )}
                <p className="text-mocha-500 mt-0.5 text-[10px] font-medium">Lv.{member.level}</p>
              </div>

              {/* 삭제 버튼 — 본인 제외 */}
              {!isMe && (
                <button
                  type="button"
                  disabled={isPending}
                  aria-label={`${member.displayName} 제외`}
                  onClick={() => handleRemove(member)}
                  className="text-ink-300 hover:text-terracotta absolute top-2 right-2 rounded p-0.5 transition disabled:opacity-50"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
