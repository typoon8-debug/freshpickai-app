/**
 * Task 039 E2E 테스트: 카드 외부 공유 + OG 미리보기 구현 (F021 BP7)
 *
 * 완료 기준:
 * 1. 비로그인 미리보기 — /cards/[id]/preview 인증 없이 접근 가능
 * 2. 미리보기 페이지 — 카드 이름·이모지·테마·건강점수·가격 표시
 * 3. 미리보기 페이지 — 구성 음식 목록 표시
 * 4. CTA 버튼 — "FreshPickAI 시작하기" → /login 이동
 * 5. OG 이미지 — /cards/[id]/opengraph-image 200 응답 (image/png)
 * 6. OG 메타태그 — preview 페이지에 og:title, og:image 포함
 * 7. ShareButton — 카드 상세 페이지에 공유 버튼 렌더링 확인
 * 8. 클립보드 공유 — ShareButton 클릭 시 /cards/[id]/preview URL 사용
 * 9. 미들웨어 — /cards/[id]/preview 비로그인 접근 허용 (로그인 리다이렉트 없음)
 * 10. 미들웨어 — /cards/[id] 인증 필요 (로그인 리다이렉트)
 */

import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const CARD_ID = "ca000001-0001-4000-8000-000000000001";
const PREVIEW_URL = `/cards/${CARD_ID}/preview`;
const OG_IMAGE_URL = `/cards/${CARD_ID}/opengraph-image`;

// ── T039-01: 비로그인 미리보기 접근 ─────────────────────────────
test.describe("Task 039-01: 비로그인 미리보기 접근", () => {
  test("미인증 상태에서 /cards/[id]/preview 접근 가능 (로그인 리다이렉트 없음)", async ({
    page,
  }) => {
    await page.goto(PREVIEW_URL);
    await page.waitForLoadState("domcontentloaded");

    // /login 으로 리다이렉트되지 않아야 함
    expect(page.url()).toContain("/cards/");
    expect(page.url()).toContain("/preview");
    expect(page.url()).not.toContain("/login");
  });

  test("미인증 상태에서 /cards/[id] 접근 시 로그인 리다이렉트", async ({ page }) => {
    await page.goto(`/cards/${CARD_ID}`);
    await page.waitForLoadState("domcontentloaded");
    // /login 으로 리다이렉트되어야 함
    expect(page.url()).toContain("/login");
  });
});

// ── T039-02: 미리보기 페이지 콘텐츠 ────────────────────────────
test.describe("Task 039-02: 미리보기 페이지 콘텐츠", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PREVIEW_URL);
    await page.waitForLoadState("networkidle");
  });

  test("미리보기 페이지 — 주요 요소 렌더링 확인", async ({ page }) => {
    await expect(page.getByTestId("card-preview-page")).toBeVisible();
    await expect(page.getByTestId("preview-header")).toBeVisible();
    await expect(page.getByTestId("preview-card-info")).toBeVisible();
  });

  test("미리보기 페이지 — 카드 이름 표시", async ({ page }) => {
    const nameEl = page.getByTestId("preview-card-name");
    await expect(nameEl).toBeVisible();
    const name = await nameEl.textContent();
    expect(name).toBeTruthy();
    expect(name!.length).toBeGreaterThan(0);
  });

  test("미리보기 페이지 — 카드 이모지 표시", async ({ page }) => {
    const emojiEl = page.getByTestId("preview-card-emoji");
    await expect(emojiEl).toBeVisible();
    const emoji = await emojiEl.textContent();
    expect(emoji).toBeTruthy();
  });

  test("미리보기 페이지 — 지표 배지 섹션 존재", async ({ page }) => {
    await expect(page.getByTestId("preview-badges")).toBeVisible();
  });

  test("미리보기 페이지 — 구성 음식 목록 표시", async ({ page }) => {
    await expect(page.getByTestId("preview-dishes")).toBeVisible();
    const dishes = page.locator('[data-testid="preview-dishes"] li');
    const count = await dishes.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ── T039-03: CTA 버튼 ───────────────────────────────────────────
test.describe("Task 039-03: CTA 버튼", () => {
  test("CTA 버튼 렌더링 확인", async ({ page }) => {
    await page.goto(PREVIEW_URL);
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("preview-cta")).toBeVisible();
    const ctaLink = page.getByTestId("preview-cta-link");
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toContainText("시작하기");
  });

  test("CTA 링크가 /login 을 가리킴", async ({ page }) => {
    await page.goto(PREVIEW_URL);
    await page.waitForLoadState("networkidle");

    const ctaLink = page.getByTestId("preview-cta-link");
    const href = await ctaLink.getAttribute("href");
    expect(href).toContain("/login");
  });

  test("CTA 클릭 시 로그인 페이지로 이동", async ({ page }) => {
    await page.goto(PREVIEW_URL);
    await page.waitForLoadState("networkidle");

    await page.getByTestId("preview-cta-link").click();
    await page.waitForURL((url) => url.pathname.includes("/login"), { timeout: 8000 });
    expect(page.url()).toContain("/login");
  });
});

// ── T039-04: OG 이미지 엔드포인트 ──────────────────────────────
test.describe("Task 039-04: OG 이미지 엔드포인트", () => {
  test("OG 이미지 엔드포인트 200 응답", async ({ page }) => {
    const res = await page.request.get(OG_IMAGE_URL);
    expect(res.status()).toBe(200);
  });

  test("OG 이미지 Content-Type이 image/png", async ({ page }) => {
    const res = await page.request.get(OG_IMAGE_URL);
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("image/png");
  });

  test("OG 이미지 응답에 바이너리 데이터 포함", async ({ page }) => {
    const res = await page.request.get(OG_IMAGE_URL);
    const body = await res.body();
    expect(body.byteLength).toBeGreaterThan(1000);
  });
});

// ── T039-05: OG 메타태그 ────────────────────────────────────────
test.describe("Task 039-05: OG 메타태그", () => {
  test("미리보기 페이지에 og:title 메타태그 존재", async ({ page }) => {
    await page.goto(PREVIEW_URL);
    await page.waitForLoadState("domcontentloaded");

    const ogTitle = await page.$eval(
      'meta[property="og:title"]',
      (el) => (el as HTMLMetaElement).content
    );
    expect(ogTitle).toBeTruthy();
    expect(ogTitle.length).toBeGreaterThan(0);
  });

  test("미리보기 페이지에 og:image 메타태그 존재", async ({ page }) => {
    await page.goto(PREVIEW_URL);
    await page.waitForLoadState("domcontentloaded");

    const ogImage = await page.$eval(
      'meta[property="og:image"]',
      (el) => (el as HTMLMetaElement).content
    );
    expect(ogImage).toBeTruthy();
    expect(ogImage).toContain("opengraph-image");
  });

  test("미리보기 페이지에 twitter:card 메타태그 존재", async ({ page }) => {
    await page.goto(PREVIEW_URL);
    await page.waitForLoadState("domcontentloaded");

    const twitterCard = await page.$eval(
      'meta[name="twitter:card"]',
      (el) => (el as HTMLMetaElement).content
    );
    expect(twitterCard).toBe("summary_large_image");
  });
});

// ── T039-06: ShareButton 컴포넌트 ──────────────────────────────
test.describe("Task 039-06: ShareButton 컴포넌트", () => {
  test("카드 상세 페이지에 ShareButton 렌더링", async ({ page }) => {
    await login(page);
    await page.goto(`/cards/${CARD_ID}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("share-button")).toBeVisible();
  });

  test("ShareButton aria-label 확인", async ({ page }) => {
    await login(page);
    await page.goto(`/cards/${CARD_ID}`);
    await page.waitForLoadState("networkidle");

    const btn = page.getByTestId("share-button");
    await expect(btn).toHaveAttribute("aria-label", "공유하기");
  });

  test("ShareButton 클릭 시 클립보드에 preview URL 복사 (Web Share API 미지원 환경)", async ({
    page,
  }) => {
    await login(page);
    await page.goto(`/cards/${CARD_ID}`);
    await page.waitForLoadState("networkidle");

    // 클립보드 권한 부여
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    // navigator.share 비활성화 (클립보드 폴백 테스트)
    await page.evaluate(() => {
      Object.defineProperty(navigator, "share", {
        value: undefined,
        configurable: true,
      });
    });

    await page.getByTestId("share-button").click();
    await page.waitForTimeout(500);

    const clipText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipText).toContain(`/cards/${CARD_ID}/preview`);
  });
});

// ── T039-07: 공유 URL 형식 ──────────────────────────────────────
test.describe("Task 039-07: 공유 URL 형식", () => {
  test("미리보기 URL 패턴 /cards/[id]/preview 확인", async ({ page }) => {
    await page.goto(PREVIEW_URL);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toMatch(/\/cards\/[^/]+\/preview/);
  });

  test("미리보기 페이지에서 브랜드명 표시", async ({ page }) => {
    await page.goto(PREVIEW_URL);
    await page.waitForLoadState("networkidle");

    const header = page.getByTestId("preview-header");
    await expect(header).toContainText("FreshPick AI");
  });
});
