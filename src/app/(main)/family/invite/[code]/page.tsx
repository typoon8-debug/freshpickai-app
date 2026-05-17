import { AlertCircle, Clock, UsersRound, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidInviteCode } from "@/lib/family/invite-code";
import { getFamilyGroupByCode } from "@/lib/actions/family";
import { InviteAcceptClient } from "./_components/invite-accept-client";

type Props = { params: Promise<{ code: string }> };

/**
 * 초대 수락 페이지.
 * 1) 코드 유효성 검증
 * 2) 인증 확인 (미인증 → 로그인 redirect)
 * 3) 그룹 정보 조회 → InviteAcceptClient 렌더링 (관계 선택 후 합류)
 */
export default async function FamilyInvitePage({ params }: Props) {
  const { code } = await params;
  const normalized = code.trim().toUpperCase();

  // 코드 형식 검증
  if (!isValidInviteCode(normalized)) {
    return <InviteErrorView type="CODE_INVALID" code={code} />;
  }

  // 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/family/invite/${code}`)}`);
  }

  // 그룹 조회
  const group = await getFamilyGroupByCode(normalized);
  if (!group) {
    return <InviteErrorView type="CODE_INVALID" code={code} />;
  }

  return <InviteAcceptClient code={normalized} groupName={group.name} />;
}

// ── 에러 화면 ─────────────────────────────────────────────────
type ErrorType = "CODE_INVALID" | "CODE_EXPIRED" | "CODE_EXHAUSTED" | "JOIN_FAILED";

const ERROR_MESSAGES: Record<ErrorType, { icon: React.ReactNode; title: string; body: string }> = {
  CODE_INVALID: {
    icon: <AlertCircle size={36} className="text-terracotta" />,
    title: "유효하지 않은 코드",
    body: "초대 코드는 6자리 영숫자여야 합니다.\n가족에게 다시 받아 입력해주세요.",
  },
  CODE_EXPIRED: {
    icon: <Clock size={36} className="text-terracotta" />,
    title: "초대 링크 만료",
    body: "초대 링크가 7일을 넘어 만료되었습니다.\n가족에게 새 링크를 요청해주세요.",
  },
  CODE_EXHAUSTED: {
    icon: <UsersRound size={36} className="text-terracotta" />,
    title: "초대 인원 가득 찼어요",
    body: "이 초대 링크는 사용 가능 인원을 모두 채웠어요.\n관리자에게 새 링크를 요청해주세요.",
  },
  JOIN_FAILED: {
    icon: <AlertCircle size={36} className="text-terracotta" />,
    title: "가입 처리에 실패했어요",
    body: "잠시 후 다시 시도해주세요.\n문제가 계속되면 가족 관리자에게 문의해주세요.",
  },
};

function InviteErrorView({ type, code: _code }: { type: ErrorType; code: string }) {
  const m = ERROR_MESSAGES[type];
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="bg-terracotta/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
          {m.icon}
        </div>
        <h1 className="font-display text-ink-900 text-2xl">{m.title}</h1>
        <p className="text-ink-500 mt-2 text-sm leading-relaxed whitespace-pre-line">{m.body}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/family"
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            <Users size={16} />
            가족 보드로
          </Link>
          <Link href="/" className="text-ink-500 w-full py-3 text-center text-sm">
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
