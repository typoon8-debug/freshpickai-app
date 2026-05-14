import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "@/lib/utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;
  const isLoginPath = pathname === "/login" || pathname.startsWith("/login/");
  const isOnboardingPath = pathname === "/onboarding" || pathname.startsWith("/onboarding/");
  const isPublicApi =
    pathname.startsWith("/api/ai") ||
    pathname.startsWith("/api/cards") ||
    pathname === "/api/daily-pick" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/onboarding") ||
    (process.env.NODE_ENV !== "production" && pathname.startsWith("/api/test/"));

  // 비로그인 공개 카드 라우트 (F021 공유 미리보기 + OG 이미지)
  const isPublicCardRoute =
    /^\/cards\/[^/]+\/preview/.test(pathname) || /^\/cards\/[^/]+\/opengraph-image/.test(pathname);

  if (!user && !isLoginPath && !isPublicApi && !isPublicCardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 온보딩 가드: 로그인된 사용자가 온보딩 미완료면 /onboarding으로 리다이렉트
  if (user && !isOnboardingPath && !isLoginPath && !isPublicApi && !isPublicCardRoute) {
    const onboardedCookie = request.cookies.get("fp_onboarded");

    if (!onboardedCookie) {
      // DB에서 온보딩 완료 여부 확인 (쿠키 없는 첫 요청 시 1회)
      const [profileRes, prefRes] = await Promise.all([
        supabase.from("fp_user_profile").select("onboarded_at").eq("user_id", user.sub).single(),
        supabase
          .from("fp_user_preference")
          .select("onboarding_skipped_at")
          .eq("user_id", user.sub)
          .single(),
      ]);

      const isOnboarded = !!profileRes.data?.onboarded_at;
      const isSkipped = !!prefRes.data?.onboarding_skipped_at;

      if (isOnboarded || isSkipped) {
        // 쿠키 설정 후 계속 진행
        const cookieValue = isOnboarded ? "done" : "skipped";
        supabaseResponse.cookies.set("fp_onboarded", cookieValue, {
          maxAge: 365 * 24 * 60 * 60,
          path: "/",
          httpOnly: false,
          sameSite: "lax",
        });
      } else {
        // 온보딩 미완료 → /onboarding 리다이렉트
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        const redirectResponse = NextResponse.redirect(url);
        // 쿠키 복사
        supabaseResponse.cookies.getAll().forEach(({ name, value, ...opts }) => {
          redirectResponse.cookies.set(name, value, opts);
        });
        return redirectResponse;
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
