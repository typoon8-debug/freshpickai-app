import type { Page } from "@playwright/test";

const TEST_EMAIL = "customer@gmail.com";
const TEST_PASSWORD = "chan1026*$*";

export async function login(page: Page) {
  // 온보딩 미들웨어 가드 우회: 로그인 전 쿠키 설정
  await page.context().addCookies([
    {
      name: "fp_onboarded",
      value: "skipped",
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // "이메일로 시작하기" 버튼 클릭 → 이메일/비밀번호 폼 노출
  await page.getByRole("button", { name: "이메일로 시작하기" }).click();

  await page.getByRole("textbox", { name: "이메일" }).fill(TEST_EMAIL);
  await page.getByRole("textbox", { name: "비밀번호" }).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "로그인", exact: true }).click();

  // 로그인 완료 후 /login 이탈 대기
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });

  // 온보딩 가드 우회: Zustand fp-auth persist 스토어에 skipOnboarding 설정
  await page.evaluate(() => {
    localStorage.setItem(
      "fp-auth",
      JSON.stringify({
        state: {
          onboardingCompletedAt: null,
          onboardingSkippedAt: new Date().toISOString(),
        },
        version: 0,
      })
    );
  });
}
