"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { RelationshipSelector } from "@/components/family/relationship-selector";
import { joinFamilyByInvite } from "@/lib/actions/family/invite";
import type { RelationshipType } from "@/lib/constants/relationship";

interface InviteAcceptClientProps {
  code: string;
  groupName: string;
}

export function InviteAcceptClient({ code, groupName }: InviteAcceptClientProps) {
  const router = useRouter();
  const [relationship, setRelationship] = useState<RelationshipType | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleJoin() {
    if (!relationship) return;
    setErrorMsg(null);

    startTransition(async () => {
      const result = await joinFamilyByInvite(code, relationship);

      if (result.success) {
        router.push(`/family?welcome=${result.alreadyMember ? "existing" : "new"}`);
        return;
      }

      const errMessages: Record<string, string> = {
        AUTH_REQUIRED: "로그인이 필요합니다.",
        CODE_INVALID: "유효하지 않은 초대 코드입니다.",
        CODE_EXPIRED: "초대 링크가 만료되었습니다.",
        CODE_EXHAUSTED: "초대 인원이 가득 찼습니다.",
        JOIN_FAILED: "가입 처리에 실패했습니다. 잠시 후 다시 시도해주세요.",
      };
      setErrorMsg(errMessages[result.error] ?? "알 수 없는 오류가 발생했습니다.");
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Users size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-ink-900 text-2xl">
            <span className="text-primary">{groupName}</span>에<br />
            합류하시겠어요?
          </h1>
          <p className="text-ink-500 mt-2 text-sm">가족 그룹 내 역할을 선택해주세요</p>
        </div>

        {/* 관계 선택 */}
        <RelationshipSelector value={relationship} onChange={setRelationship} className="mb-6" />

        {/* 에러 */}
        {errorMsg && <p className="text-terracotta mb-4 text-center text-sm">{errorMsg}</p>}

        {/* 합류 버튼 */}
        <button
          type="button"
          disabled={!relationship || isPending}
          onClick={handleJoin}
          className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? "처리 중…" : "합류하기"}
        </button>
      </div>
    </div>
  );
}
