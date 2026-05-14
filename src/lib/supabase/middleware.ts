import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "@/lib/utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

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

  // createServerClient 와 getClaims() 사이에 코드를 추가하지 말 것
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;
  const isLoginPath = pathname === "/login" || pathname.startsWith("/login/");
  const isPublicPath =
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api/ai") ||
    pathname.startsWith("/api/cards") ||
    pathname === "/api/daily-pick" ||
    pathname.startsWith("/api/onboarding") ||
    pathname.startsWith("/api/payments") ||
    /^\/cards\/[^/]+\/preview/.test(pathname) ||
    /^\/cards\/[^/]+\/opengraph-image/.test(pathname) ||
    (process.env.NODE_ENV !== "production" && pathname.startsWith("/api/test/"));

  if (!user && !isLoginPath && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
