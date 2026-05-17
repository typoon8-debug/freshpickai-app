"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, LogIn, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createFamilyGroup } from "@/lib/actions/family";
import { joinFamilyByInvite } from "@/lib/actions/family/invite";

type Tab = "create" | "join";

export function CreateFamilyGroupForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("create");

  // 그룹 만들기
  const [groupName, setGroupName] = useState("우리 가족");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, startCreate] = useTransition();

  // 코드로 합류
  const [code, setCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, startJoin] = useTransition();

  const JOIN_ERROR_MSG: Record<string, string> = {
    CODE_INVALID: "유효하지 않은 코드예요. 6자리 영숫자를 확인해주세요.",
    CODE_EXPIRED: "만료된 초대 링크예요. 가족에게 새 링크를 요청해주세요.",
    CODE_EXHAUSTED: "초대 인원이 가득 찼어요. 관리자에게 문의해주세요.",
    JOIN_FAILED: "가입 처리에 실패했어요. 잠시 후 다시 시도해주세요.",
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setCreateError(null);
    startCreate(async () => {
      const group = await createFamilyGroup(groupName.trim());
      if (!group) {
        setCreateError("그룹 생성에 실패했어요. 다시 시도해주세요.");
        return;
      }
      // push로 강제 전체 네비게이션 — 서버 컴포넌트 데이터를 확실히 갱신
      router.push("/family");
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    setJoinError(null);
    startJoin(async () => {
      const result = await joinFamilyByInvite(normalized);
      if (result.success) {
        router.push("/family");
      } else if (result.error !== "AUTH_REQUIRED") {
        setJoinError(JOIN_ERROR_MSG[result.error] ?? "알 수 없는 오류가 발생했어요.");
      }
    });
  };

  return (
    <div className="flex flex-col">
      {/* 탭 */}
      <div className="border-line flex border-b">
        {(["create", "join"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2.5 text-xs font-medium transition",
              tab === t ? "border-mocha-700 text-mocha-700 border-b-2" : "text-ink-400"
            )}
          >
            {t === "create" ? "그룹 만들기" : "코드로 합류"}
          </button>
        ))}
      </div>

      {tab === "create" ? (
        <form onSubmit={handleCreate} className="flex flex-col gap-3 px-4 py-5">
          <div className="flex flex-col items-center gap-2 pb-1 text-center">
            <div className="bg-mocha-100 flex h-14 w-14 items-center justify-center rounded-full">
              <Users size={26} className="text-mocha-500" />
            </div>
            <p className="text-ink-700 text-sm font-semibold">새 가족 그룹을 만들어보세요</p>
            <p className="text-ink-400 text-xs leading-relaxed">
              그룹을 만들면 초대 코드와 카카오톡 공유가
              <br />
              바로 활성화됩니다
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="group-name" className="text-ink-600 text-xs font-medium">
              그룹 이름
            </label>
            <input
              id="group-name"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={20}
              placeholder="우리 가족"
              disabled={isCreating}
              className="border-line text-ink-900 placeholder:text-ink-300 focus:border-mocha-400 w-full rounded-lg border px-3 py-2.5 text-sm transition outline-none disabled:opacity-50"
            />
            {createError && <p className="text-terracotta text-xs">{createError}</p>}
          </div>

          <button
            type="submit"
            disabled={isCreating || !groupName.trim()}
            className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                만드는 중...
              </>
            ) : (
              <>
                <Users size={14} />
                가족 그룹 만들기
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="flex flex-col gap-3 px-4 py-5">
          <div className="flex flex-col items-center gap-2 pb-1 text-center">
            <div className="bg-mocha-100 flex h-14 w-14 items-center justify-center rounded-full">
              <LogIn size={26} className="text-mocha-500" />
            </div>
            <p className="text-ink-700 text-sm font-semibold">초대 코드로 합류하기</p>
            <p className="text-ink-400 text-xs leading-relaxed">
              가족에게 받은 6자리 초대 코드를
              <br />
              입력하면 바로 합류할 수 있어요
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite-code" className="text-ink-600 text-xs font-medium">
              초대 코드 (6자리)
            </label>
            <input
              id="invite-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              maxLength={6}
              placeholder="예: XTU4MG"
              disabled={isJoining}
              autoCapitalize="characters"
              className="border-line text-ink-900 placeholder:text-ink-300 focus:border-mocha-400 w-full rounded-lg border px-3 py-2.5 text-center font-mono text-lg tracking-widest transition outline-none disabled:opacity-50"
            />
            {joinError && <p className="text-terracotta text-xs">{joinError}</p>}
          </div>

          <button
            type="submit"
            disabled={isJoining || code.trim().length < 6}
            className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"
          >
            {isJoining ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                합류 중...
              </>
            ) : (
              <>
                <LogIn size={14} />
                가족 보드 합류하기
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
