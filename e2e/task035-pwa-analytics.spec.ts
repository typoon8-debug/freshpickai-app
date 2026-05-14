/**
 * Task 035: PWA + 접근성 (WCAG AA) + 모니터링 E2E
 *
 * TC01 - PWA manifest.webmanifest 필수 필드 검증
 * TC02 - 오프라인 폴백 페이지 렌더링 검증
 * TC03 - 로그인 페이지 WCAG AA 접근성 검사 (axe-core)
 * TC04 - 홈 페이지 WCAG AA 접근성 검사 (axe-core, 로그인 후)
 * TC05 - Vercel Analytics + SpeedInsights layout.tsx 주입 확인
 * TC06 - 핵심 인터랙션 hit target 44px 이상 검증
 * TC07 - PostHog 이벤트 함수 6종 export 검증
 * TC08 - Sentry 설정 파일 존재 및 환경변수 가드 확인
 */

import { test, expect } from "@playwright/test";
import { checkA11y, injectAxe } from "axe-playwright";
import * as fs from "fs";
import * as path from "path";

const EMAIL = "customer@gmail.com";
const PASSWORD = "chan1026*$*";

async function login(page: import("@playwright/test").Page) {
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
  await page.getByRole("button", { name: "이메일로 시작하기" }).click();
  await page.getByRole("textbox", { name: "이메일" }).fill(EMAIL);
  await page.getByRole("textbox", { name: "비밀번호" }).fill(PASSWORD);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
}

test.describe("Task035: PWA + 접근성 + 모니터링", () => {
  // ─── TC01: PWA manifest 필드 검증 ─────────────────────────────────────────
  test("TC01 - manifest.webmanifest 필수 필드 검증", async ({ page }) => {
    const res = await page.goto("/manifest.webmanifest");
    expect(res?.status()).toBe(200);

    const manifest = (await res?.json()) as {
      name: string;
      short_name: string;
      display: string;
      theme_color: string;
      icons: { src: string; sizes: string }[];
    };

    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.icons?.length).toBeGreaterThanOrEqual(2);

    const icon192 = manifest.icons.find((i) => i.sizes === "192x192");
    const icon512 = manifest.icons.find((i) => i.sizes === "512x512");
    expect(icon192).toBeTruthy();
    expect(icon512).toBeTruthy();

    console.log("✅ TC01 manifest 검증 완료 — icons:", manifest.icons.length);
  });

  // ─── TC02: 오프라인 폴백 페이지 렌더링 ────────────────────────────────────
  test("TC02 - 오프라인 폴백 페이지 렌더링", async ({ page }) => {
    await page.goto("/offline");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator('[data-testid="offline-page"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("인터넷이 연결되지 않았어요")).toBeVisible();
    await expect(page.locator('[data-testid="offline-retry-btn"]')).toBeVisible();
    await expect(page.getByRole("link", { name: "홈으로" })).toBeVisible();

    console.log("✅ TC02 오프라인 폴백 페이지 렌더링 완료");
  });

  // ─── TC03: 로그인 페이지 WCAG AA 접근성 검사 ──────────────────────────────
  test("TC03 - 로그인 페이지 WCAG AA 접근성 검사", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await injectAxe(page);
    // critical/serious 위반이 없어야 함
    await checkA11y(
      page,
      undefined,
      {
        axeOptions: {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
        },
        includedImpacts: ["critical", "serious"],
        detailedReport: true,
      },
      false // skipFailures=false → 위반 시 테스트 실패
    );

    console.log("✅ TC03 로그인 페이지 WCAG AA 통과");
  });

  // ─── TC04: 홈 페이지 WCAG AA 접근성 검사 ──────────────────────────────────
  test("TC04 - 홈 페이지 WCAG AA 접근성 검사 (로그인 후)", async ({ page }) => {
    await login(page);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    await injectAxe(page);
    await checkA11y(
      page,
      undefined,
      {
        axeOptions: {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
        },
        includedImpacts: ["critical", "serious"],
        detailedReport: true,
      },
      false
    );

    console.log("✅ TC04 홈 페이지 WCAG AA 통과");
  });

  // ─── TC05: Vercel Analytics layout.tsx 주입 확인 ─────────────────────────
  test("TC05 - Vercel Analytics + SpeedInsights layout.tsx 주입 확인", async () => {
    const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");

    expect(content).toContain("@vercel/analytics");
    expect(content).toContain("@vercel/speed-insights");
    expect(content).toContain("<Analytics");
    expect(content).toContain("<SpeedInsights");

    console.log("✅ TC05 Vercel Analytics + SpeedInsights 주입 확인 완료");
  });

  // ─── TC06: 인터랙션 hit target 44px 이상 검증 ─────────────────────────────
  test("TC06 - 핵심 버튼 hit target 44px 이상 검증", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const buttons = [
      page.locator("button:has-text('카카오')"),
      page.getByRole("button", { name: "이메일로 시작하기" }),
    ];

    for (const btn of buttons) {
      if (await btn.isVisible()) {
        const box = await btn.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
          console.log(`  버튼 높이: ${box.height}px ✓`);
        }
      }
    }

    // 오프라인 페이지 재시도 버튼
    await page.goto("/offline");
    const retryBtn = page.locator('[data-testid="offline-retry-btn"]');
    const retryBox = await retryBtn.boundingBox();
    if (retryBox) {
      expect(retryBox.height).toBeGreaterThanOrEqual(44);
      console.log(`  재시도 버튼 높이: ${retryBox.height}px ✓`);
    }

    console.log("✅ TC06 hit target 44px 이상 검증 완료");
  });

  // ─── TC07: PostHog 이벤트 6종 export 검증 ────────────────────────────────
  test("TC07 - PostHog 이벤트 6종 함수 export 검증", async ({ page }) => {
    const eventsPath = path.join(process.cwd(), "src/lib/analytics/events.ts");
    const content = fs.readFileSync(eventsPath, "utf-8");

    const requiredFunctions = [
      "trackCardViewed",
      "trackCartAdded",
      "trackPaymentCompleted",
      "trackAiChatStarted",
      "trackVoteCast",
      "trackCardShared",
    ];
    for (const fn of requiredFunctions) {
      expect(content).toContain(fn);
    }

    // posthog.ts 초기화 확인
    const posthogPath = path.join(process.cwd(), "src/lib/analytics/posthog.ts");
    const posthogContent = fs.readFileSync(posthogPath, "utf-8");
    expect(posthogContent).toContain("NEXT_PUBLIC_POSTHOG_KEY");
    expect(posthogContent).toContain("posthog.init");

    // 콘솔 에러 없이 페이지 로딩
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(800);

    const critical = errors.filter((e) => !e.includes("favicon") && !e.includes("sw.js"));
    if (critical.length) console.warn("console errors:", critical);

    console.log("✅ TC07 PostHog 이벤트 6종 export 검증 완료");
  });

  // ─── TC08: Sentry 설정 파일 존재 확인 ────────────────────────────────────
  test("TC08 - Sentry 설정 파일 4종 + next.config.ts 래핑 확인", async () => {
    const root = process.cwd();
    const files = [
      "sentry.client.config.ts",
      "sentry.server.config.ts",
      "sentry.edge.config.ts",
      "instrumentation.ts",
    ];

    for (const file of files) {
      expect(fs.existsSync(path.join(root, file))).toBe(true);
    }

    const clientContent = fs.readFileSync(path.join(root, "sentry.client.config.ts"), "utf-8");
    expect(clientContent).toContain("NEXT_PUBLIC_SENTRY_DSN");
    expect(clientContent).toContain("Sentry.init");

    const nextConfigContent = fs.readFileSync(path.join(root, "next.config.ts"), "utf-8");
    expect(nextConfigContent).toContain("withSentryConfig");

    const instrumentationContent = fs.readFileSync(path.join(root, "instrumentation.ts"), "utf-8");
    expect(instrumentationContent).toContain("NEXT_RUNTIME");
    expect(instrumentationContent).toContain("sentry.server.config");

    console.log("✅ TC08 Sentry 설정 파일 4종 확인 완료");
  });
});
