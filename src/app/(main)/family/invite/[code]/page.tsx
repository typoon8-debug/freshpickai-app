import { Users, AlertCircle, Clock, UsersRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { joinFamilyByInvite } from "@/lib/actions/family/invite";

type Props = { params: Promise<{ code: string }> };

/**
 * 초대 수락 페이지 — Server Component.
 * `joinFamilyByInvite` Server Action으로 코드 검증 + 가입 결과 분기.
 * 성공 시 `/family?welcome=new|existing`로 redirect.
 *
 * 실 Supabase 연동(`fp_family_invite` 검증, `fp_family_member` insert,
 * 만료/사용 횟수 검증)은 Task 019/030 범위.
 */
export default async function FamilyInvitePage({ params }: Props) {
  const { code } = await params;
  const result = await joinFamilyByInvite(code);

  if (result.success) {
    redirect(`/family?welcome=${result.alreadyMember ? "existing" : "new"}`);
  }

  // 인증 필요 → 로그인 페이지로 next 파라미터와 함께 redirect
  if (result.error === "AUTH_REQUIRED") {
    redirect(`/login?next=${encodeURIComponent(`/family/invite/${code}`)}`);
  }

  // AUTH_REQUIRED는 위에서 redirect 처리되어 type narrowing으로 제외됨
  const messages: Record<
    typeof result.error,
    { icon: React.ReactNode; title: string; body: string }
  > = {
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

  const m = messages[result.error];

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
