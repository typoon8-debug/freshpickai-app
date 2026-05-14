import { redirect } from "next/navigation";
import { Leaf } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OnboardingPageClient } from "@/components/auth/onboarding-page-client";

export type CardPreview = {
  card_id: string;
  name: string;
  emoji: string | null;
  card_theme: string;
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 이미 온보딩 완료/스킵 여부 확인 → 홈으로 리다이렉트 (쿠키는 미들웨어가 설정)
  const [profileRes, prefRes] = await Promise.all([
    supabase.from("fp_user_profile").select("onboarded_at").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("fp_user_preference")
      .select("onboarding_skipped_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const isOnboarded = !!profileRes.data?.onboarded_at;
  const isSkipped = !!prefRes.data?.onboarding_skipped_at;

  // 이미 완료/스킵된 사용자 → sync 라우트에서 fp_onboarded 쿠키 설정 후 홈으로 이동
  // (새 기기/쿠키 삭제 시 OnboardingGuard 리다이렉트 루프 방지)
  if (isOnboarded || isSkipped) {
    redirect("/api/auth/onboarding-sync");
  }

  // 슬라이드 1에 표시할 실제 카드 데이터 (10종 카드 시드 연결)
  const { data: cards } = await supabase
    .from("fp_menu_card")
    .select("card_id, name, emoji, card_theme")
    .in("review_status", ["approved", "active"])
    .limit(12)
    .order("created_at", { ascending: true });

  return (
    <main className="bg-paper flex min-h-screen items-start justify-center px-6 py-10">
      <div className="max-w-phone w-full">
        <div className="mb-6 flex items-center gap-2">
          <div className="bg-mocha-700 flex h-7 w-7 items-center justify-center rounded-md">
            <Leaf size={15} className="text-paper" />
          </div>
          <span className="font-display text-mocha-900 text-lg tracking-tight">FreshPick</span>
        </div>
        <OnboardingPageClient cardPreviews={cards ?? []} />
      </div>
    </main>
  );
}
