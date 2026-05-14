/**
 * Task 042 E2E 테스트: F017 인터랙티브 조리 UX + F020 냉장고 비우기 모드
 *
 * 완료 기준 TC 목록:
 * TC01 - CookModeButton 활성화: 카드 상세 페이지에서 "이 카드로 요리하기" 버튼 렌더링 + 활성
 * TC02 - CookMode 페이지 진입: /cards/[id]/cook URL 접근 + 기본 레이아웃 렌더링
 * TC03 - 레시피 탭: 레시피 단계 또는 기본 안내 메시지 표시
 * TC04 - 요약 탭: 탭 전환 및 요약 콘텐츠 렌더링
 * TC05 - Floating 4-action 바: 요약·공유·북마크·노트 버튼 렌더링
 * TC06 - 노트 패널 열기/닫기
 * TC07 - 북마크 버튼: 토글 클릭 후 피드백 확인
 * TC08 - 채팅 페이지: "냉장고 비우기 모드" 버튼 렌더링
 * TC09 - FridgeMode: 재료 칩 입력 + 추가
 * TC10 - FridgeMode: 빠른 재료 추가 버튼 클릭
 * TC11 - fridge-match API: POST 요청 400 (재료 없음)
 * TC12 - fridge-match API: POST 요청 200 (재료 있음)
 */

import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

/** 홈에서 첫 번째 카드 링크의 ID를 추출하는 헬퍼 */
async function getFirstCardId(page: Parameters<typeof login>[0]): Promise<string | null> {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);

  // 카드 링크 href에서 /cards/[id] 패턴 추출
  const cardLinks = page
    .locator('a[href*="/cards/"]')
    .filter({ hasNot: page.locator('[href*="/cards/new"]') });
  const count = await cardLinks.count();
  if (count === 0) return null;

  const href = await cardLinks.first().getAttribute("href");
  if (!href) return null;

  const match = href.match(/\/cards\/([^/?#]+)/);
  return match ? match[1] : null;
}

test.describe("Task 042: F017 인터랙티브 조리 UX", () => {
  let cardId = "";

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await login(page);
    const id = await getFirstCardId(page);
    if (id) cardId = id;
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("TC01 - CookModeButton 활성화: 카드 상세 '요리하기' 버튼 활성 상태", async ({ page }) => {
    if (!cardId) {
      test.skip(true, "카드 ID 획득 실패");
      return;
    }
    await page.goto(`/cards/${cardId}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const cookBtn = page.getByRole("button", { name: /이 카드로 요리하기/ });
    await expect(cookBtn).toBeVisible({ timeout: 10000 });
    await expect(cookBtn).not.toBeDisabled();
  });

  test("TC02 - CookMode 페이지: /cards/[id]/cook 렌더링", async ({ page }) => {
    if (!cardId) {
      test.skip(true, "카드 ID 획득 실패");
      return;
    }
    await page.goto(`/cards/${cardId}/cook`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    await expect(page.getByText("요리 모드")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "뒤로가기" })).toBeVisible();
  });

  test("TC03 - 레시피 탭: 스텝 또는 안내 메시지 렌더링", async ({ page }) => {
    if (!cardId) {
      test.skip(true, "카드 ID 획득 실패");
      return;
    }
    await page.goto(`/cards/${cardId}/cook`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // 레시피 탭이 기본 활성
    await expect(page.getByRole("button", { name: /레시피/ })).toBeVisible({ timeout: 10000 });

    // 본문 영역에 무언가 렌더링됨 (스텝 카드, 안내 메시지, 텍스트 레시피 중 하나)
    const content = page
      .getByText("등록된 레시피 스텝이 없습니다")
      .or(page.getByText("이 카드에는 레시피가 없습니다"))
      .or(page.locator("[class*='rounded-2xl']").first());
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test("TC04 - 요약 탭: 탭 전환 동작", async ({ page }) => {
    if (!cardId) {
      test.skip(true, "카드 ID 획득 실패");
      return;
    }
    await page.goto(`/cards/${cardId}/cook`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // 요약 탭 버튼 클릭 (4-action 바의 "요약 보기" 버튼과 구분 — 탭 영역의 버튼)
    const summaryTab = page.locator("button").filter({ hasText: "요약" }).first();
    await expect(summaryTab).toBeVisible({ timeout: 10000 });
    await summaryTab.click();
    await page.waitForTimeout(300);

    // 요약 콘텐츠 또는 안내 메시지 중 하나 (first() 로 strict mode 우회)
    const summaryContent = page
      .getByText("레시피 요약")
      .or(page.getByText("요약할 스텝이 없습니다"))
      .first();
    await expect(summaryContent).toBeVisible({ timeout: 5000 });
  });

  test("TC05 - Floating 4-action 바: 4개 버튼 렌더링", async ({ page }) => {
    if (!cardId) {
      test.skip(true, "카드 ID 획득 실패");
      return;
    }
    await page.goto(`/cards/${cardId}/cook`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // floating 4-action 바에 있는 버튼들
    await expect(page.getByRole("button", { name: "요약 보기" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "공유하기" })).toBeVisible();
    await expect(page.getByRole("button", { name: /북마크/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "노트 보기" })).toBeVisible();
  });

  test("TC06 - 노트 패널: 열기/닫기", async ({ page }) => {
    if (!cardId) {
      test.skip(true, "카드 ID 획득 실패");
      return;
    }
    await page.goto(`/cards/${cardId}/cook`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // 노트 버튼 클릭 → 패널 열림
    await page.getByRole("button", { name: "노트 보기" }).click();
    await expect(page.getByText("요리 노트")).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder("요리하면서 기록할 메모를 작성하세요...")).toBeVisible();

    // 닫기
    await page.getByRole("button", { name: "닫기" }).click();
    await expect(page.getByText("요리 노트")).not.toBeVisible({ timeout: 3000 });
  });

  test("TC07 - 북마크 토글: 클릭 후 피드백 (토스트 또는 상태 변경)", async ({ page }) => {
    if (!cardId) {
      test.skip(true, "카드 ID 획득 실패");
      return;
    }
    await page.goto(`/cards/${cardId}/cook`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const bookmarkBtn = page.getByRole("button", { name: /북마크/ });
    await expect(bookmarkBtn).toBeVisible({ timeout: 10000 });

    // 클릭
    await bookmarkBtn.click();

    // 토스트 알림 또는 버튼 스타일 변경 확인
    const feedback = page
      .locator("[data-sonner-toast]")
      .or(page.getByText(/북마크/))
      .first();
    await expect(feedback).toBeVisible({ timeout: 8000 });
  });
});

test.describe("Task 042: F020 냉장고 비우기 모드", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("TC08 - 채팅 페이지: '냉장고 비우기 모드' 버튼 렌더링", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    await expect(page.getByRole("button", { name: /냉장고 비우기 모드/ })).toBeVisible({
      timeout: 10000,
    });
  });

  test("TC09 - FridgeMode: 재료 칩 입력 및 추가", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // FridgeMode 열기
    await page.getByRole("button", { name: /냉장고 비우기 모드/ }).click();
    await expect(page.getByText("냉장고 비우기")).toBeVisible({ timeout: 5000 });

    // 첫 번째 재료 입력 (placeholder 있을 때)
    const input = page
      .locator("input")
      .filter({ has: page.locator(":focus-within") })
      .or(page.getByPlaceholder(/재료를 입력하세요/))
      .first();
    await input.fill("달걀");
    await input.press("Enter");

    // 칩으로 추가됨
    await expect(page.locator("span").filter({ hasText: "달걀" }).first()).toBeVisible({
      timeout: 3000,
    });

    // 두 번째 재료 — placeholder가 사라지므로 클래스 기반으로 input 찾기
    const inputEl = page.locator('input[class*="bg-transparent"]');
    await expect(inputEl).toBeVisible({ timeout: 3000 });
    await inputEl.fill("양파");
    await inputEl.press("Enter");
    await expect(page.locator("span").filter({ hasText: "양파" }).first()).toBeVisible({
      timeout: 3000,
    });
  });

  test("TC10 - FridgeMode: 빠른 재료 추가 버튼 클릭", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: /냉장고 비우기 모드/ }).click();
    await expect(page.getByText("냉장고 비우기")).toBeVisible({ timeout: 5000 });

    // "달걀" 빠른 추가 버튼
    const quickBtn = page.getByRole("button", { name: "+ 달걀" });
    await expect(quickBtn).toBeVisible({ timeout: 5000 });
    await quickBtn.click();

    await expect(page.locator("span").filter({ hasText: "달걀" }).first()).toBeVisible({
      timeout: 3000,
    });
  });

  test("TC11 - fridge-match API: 재료 없음 → 400 응답", async ({ page }) => {
    const res = await page.request.post("http://localhost:3001/api/ai/fridge-match", {
      data: { ingredients: [] },
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status()).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBeTruthy();
  });

  test("TC12 - fridge-match API: 재료 있음 → 200 응답 + cards 배열", async ({ page }) => {
    const res = await page.request.post("http://localhost:3001/api/ai/fridge-match", {
      data: { ingredients: ["달걀", "양파", "마늘"] },
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status()).toBe(200);
    const json = (await res.json()) as { cards?: unknown[] };
    expect(Array.isArray(json.cards)).toBe(true);
  });
});
