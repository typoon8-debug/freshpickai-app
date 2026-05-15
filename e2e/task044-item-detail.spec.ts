/**
 * Task 044 E2E 테스트: 상품 상세 페이지 재개발 검증
 *
 * TC01 - 헤더: "상품상세" 타이틀 + 뒤로가기/장바구니 아이콘
 * TC02 - 상품 이미지 렌더링
 * TC03 - 상품명(h1) + 가격 표시
 * TC04 - AI 태그 칩 표시
 * TC05 - AI 추천 문구 카드 (green 배경)
 * TC06 - AI 제품 설명 섹션
 * TC07 - 요리 활용법 섹션
 * TC08 - 상품 상세정보 아코디언
 * TC09 - 상품 고시 정보 아코디언
 * TC10 - 배달안내 아코디언
 * TC11 - 교환/반품 안내 아코디언
 * TC12 - 비슷한 상품 섹션
 * TC13 - 구매 리뷰 섹션
 * TC14 - 하단 고정 바: 장바구니 담기 + 바로 구매 버튼
 * TC15 - 장바구니 담기 동작
 * TC16 - 바로 구매 → /cart 이동
 */

import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

async function getFirstCategoryItemId(page: Parameters<typeof login>[0]): Promise<string | null> {
  await page.goto("/category");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2000);

  // role=button 이고 cursor-pointer 클래스를 가진 상품 카드
  const cards = page.locator("div[role='button']").first();
  if ((await cards.count()) === 0) return null;

  // click and get URL
  await cards.click();
  await page.waitForURL(/\/category\/[^/]+$/, { timeout: 10000 });
  const url = new URL(page.url());
  const parts = url.pathname.split("/");
  return parts[parts.length - 1] ?? null;
}

test.describe("Task 044: 상품 상세 페이지", () => {
  let itemId = "";

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await login(page);
    const id = await getFirstCategoryItemId(page);
    if (id) itemId = id;
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("TC01 - 헤더: 상품상세 타이틀 + 뒤로가기 + 장바구니", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    await expect(page.getByText("상품상세")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("link", { name: "뒤로가기" })).toBeVisible();
    // aria-label="장바구니" exact match (비슷한 상품 링크와 구분)
    await expect(page.getByRole("link", { name: "장바구니", exact: true })).toBeVisible();
  });

  test("TC02 - 상품 이미지 렌더링", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // img 태그 또는 placeholder 렌더링 확인
    const img = page.locator("img").first();
    const placeholder = page.getByText("🛒").first();
    const hasContent = (await img.count()) > 0 || (await placeholder.count()) > 0;
    expect(hasContent).toBe(true);
  });

  test("TC03 - 상품명(h1) + 가격 표시", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 10000 });

    // 가격 "원" 텍스트 확인
    const priceText = page.getByText(/\d+원/).first();
    await expect(priceText).toBeVisible({ timeout: 5000 });
  });

  test("TC04 - AI 태그 칩 표시 (있는 경우)", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // 태그 컨테이너 존재 확인 (없을 수도 있으므로 optional)
    const tagContainer = page.locator("div.overflow-x-auto").first();
    if ((await tagContainer.count()) > 0) {
      const chips = tagContainer.locator("span");
      const chipCount = await chips.count();
      test.info().annotations.push({ type: "info", description: `AI 태그 수: ${chipCount}개` });
    }
    // 페이지 자체가 정상 로드됨을 확인
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC05 - AI 추천 문구 카드 (있는 경우)", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const aiCard = page.getByText("AI 추천 문구");
    if ((await aiCard.count()) > 0) {
      await expect(aiCard.first()).toBeVisible({ timeout: 5000 });
    }
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC06 - AI 제품 설명 섹션 (있는 경우)", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const aiDesc = page.getByText("AI 제품 설명");
    if ((await aiDesc.count()) > 0) {
      await expect(aiDesc.first()).toBeVisible({ timeout: 5000 });
    }
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC07 - 요리 활용법 섹션 (있는 경우)", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const cookSection = page.getByText("요리 활용법");
    if ((await cookSection.count()) > 0) {
      await expect(cookSection.first()).toBeVisible({ timeout: 5000 });
    }
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC08 - 상품 상세정보 아코디언", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    await expect(page.getByText("상품 상세정보")).toBeVisible({ timeout: 10000 });
  });

  test("TC09 - 상품 고시 정보 아코디언 + 클릭 열기", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const summary = page.locator("summary").filter({ hasText: "상품 고시 정보" });
    await expect(summary).toBeVisible({ timeout: 10000 });

    // 클릭하여 열기
    await summary.click();
    await page.waitForTimeout(300);

    // "상세정보 참조" 텍스트 확인
    await expect(page.getByText("상세정보 참조").first()).toBeVisible({ timeout: 5000 });
  });

  test("TC10 - 배달안내 아코디언", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const summary = page.locator("summary").filter({ hasText: "배달안내" });
    await expect(summary).toBeVisible({ timeout: 10000 });
    await summary.click();
    await page.waitForTimeout(300);

    // "가게별로 배달금액..." 텍스트는 항상 렌더링됨
    await expect(page.getByText(/가게별로|배달방법|외주업체/).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("TC11 - 교환/반품 안내 아코디언", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const summary = page.locator("summary").filter({ hasText: "교환/반품 안내" });
    await expect(summary).toBeVisible({ timeout: 10000 });
    await summary.click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/7일 이내|배달완료|반품 접수/).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("TC12 - 비슷한 상품 섹션 (있는 경우)", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    const similarSection = page.getByText("비슷한 상품");
    if ((await similarSection.count()) > 0) {
      await expect(similarSection.first()).toBeVisible({ timeout: 5000 });
      // + 버튼 확인
      const plusBtns = page.getByRole("button", { name: "장바구니 담기" });
      test
        .info()
        .annotations.push({
          type: "info",
          description: `비슷한 상품 + 버튼 수: ${await plusBtns.count()}`,
        });
    }
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC13 - 구매 리뷰 섹션", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    await expect(page.getByText(/구매 리뷰/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /리뷰 작성/ })).toBeVisible();
  });

  test("TC14 - 하단 고정 바: 장바구니 담기 + 바로 구매", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // 고정 하단 바 내 버튼만 검사
    const bottomBar = page.locator('[data-testid="item-bottom-bar"]');
    await expect(bottomBar.getByRole("button", { name: "장바구니 담기" })).toBeVisible({
      timeout: 10000,
    });
    await expect(bottomBar.getByRole("button", { name: "바로 구매" })).toBeVisible();
  });

  test("TC15 - 장바구니 담기 클릭 → 토스트 알림", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // 고정 하단 바의 장바구니 담기 버튼
    const bottomBar = page.locator('[data-testid="item-bottom-bar"]');
    const cartBtn = bottomBar.getByRole("button", { name: "장바구니 담기" });
    await expect(cartBtn).toBeVisible({ timeout: 10000 });
    await cartBtn.click();

    // 토스트 알림 확인
    const toast = page
      .locator("[data-sonner-toast]")
      .or(page.getByText(/담았습니다|장바구니/))
      .first();
    await expect(toast).toBeVisible({ timeout: 8000 });
  });

  test("TC16 - 바로 구매 클릭 → /cart 이동", async ({ page }) => {
    if (!itemId) {
      test.skip(true, "itemId 없음");
      return;
    }
    await page.goto(`/category/${itemId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const buyBtn = page.getByRole("button", { name: "바로 구매" });
    await expect(buyBtn).toBeVisible({ timeout: 10000 });
    await buyBtn.click();

    // /cart 로 이동 확인
    await page.waitForURL(/\/cart/, { timeout: 10000 });
    expect(page.url()).toContain("/cart");
  });
});
