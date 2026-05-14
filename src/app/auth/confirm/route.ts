import { createClient, createAdminClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // 프로덕션에서 x-forwarded-host 로 정확한 URL 구성 (freshpick-app 패턴)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  const buildRedirectUrl = (path: string) => {
    if (isLocalEnv) return `${origin}${path}`;
    if (forwardedHost) return `https://${forwardedHost}${path}`;
    return `${origin}${path}`;
  };

  const supabase = await createClient();

  // 이메일 OTP 인증 처리
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(buildRedirectUrl("/"));
    }
    return NextResponse.redirect(
      buildRedirectUrl(`/login?error=${encodeURIComponent(error.message)}`)
    );
  }

  // OAuth 코드 교환
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        buildRedirectUrl(`/login?error=${encodeURIComponent(error.message)}`)
      );
    }

    // 세션 교환 성공 후 유저 정보 조회
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();

      // fp_user_profile 존재 여부 확인 (RLS 우회)
      const { data: profile } = await admin
        .from("fp_user_profile")
        .select("onboarded_at")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: pref } = await admin
        .from("fp_user_preference")
        .select("onboarding_skipped_at")
        .eq("user_id", user.id)
        .maybeSingle();

      const isOnboarded = !!profile?.onboarded_at;
      const isSkipped = !!pref?.onboarding_skipped_at;

      if (isOnboarded || isSkipped) {
        // 온보딩 완료 → 홈으로 이동 + fp_onboarded 쿠키 설정
        const cookieValue = isOnboarded ? "done" : "skipped";
        const response = NextResponse.redirect(buildRedirectUrl("/"));
        response.cookies.set("fp_onboarded", cookieValue, {
          maxAge: 365 * 24 * 60 * 60,
          path: "/",
          httpOnly: false,
          sameSite: "lax",
        });
        return response;
      } else {
        // 온보딩 미완료 → /onboarding 으로 이동
        return NextResponse.redirect(buildRedirectUrl("/onboarding"));
      }
    }

    return NextResponse.redirect(buildRedirectUrl("/"));
  }

  return NextResponse.redirect(buildRedirectUrl("/login?error=missing_params"));
}
