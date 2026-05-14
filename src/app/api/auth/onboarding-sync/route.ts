import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const ONBOARDING_COOKIE = "fp_onboarded";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

// 이미 온보딩이 완료된 사용자: DB 상태를 쿠키에 동기화 후 홈으로 리다이렉트
// (새 기기/쿠키 삭제로 fp_onboarded 쿠키가 없을 때 무한 리다이렉트 루프를 방지)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

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

  const cookieStore = await cookies();
  if (isOnboarded || isSkipped) {
    cookieStore.set(ONBOARDING_COOKIE, isOnboarded ? "done" : "skipped", {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
  }

  return NextResponse.redirect(new URL("/", request.url));
}
