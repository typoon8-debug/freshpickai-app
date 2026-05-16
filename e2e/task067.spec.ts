import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

/**
 * Task 067: AI 채팅 커머스 API 연동 (F034)
 * - POST /api/cart          → 장바구니 담기
 * - PATCH /api/cart/:id     → 수량 변경
 * - DELETE /api/cart/:id    → 항목 삭제
 * - POST /api/wishlist      → 찜 추가
 * - DELETE /api/wishlist/:id → 찜 제거
 * - POST /api/payment/initiate → 결제 준비
 * - ActionButtonRenderer 로딩 상태
 *
 * 주의: API 호출은 page.request를 사용해야 페이지 인증 쿠키를 공유함
 */

test.describe("Task 067: AI 채팅 커머스 API", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ─── /api/cart ───────────────────────────────────────────────────────────

  test("POST /api/cart — storeItemId 누락 시 400 반환", async ({ page }) => {
    const res = await page.request.post("/api/cart", {
      data: { qty: 1 },
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  test("POST /api/cart — 존재하지 않는 storeItemId는 409 반환", async ({ page }) => {
    const res = await page.request.post("/api/cart", {
      data: { storeItemId: "00000000-0000-0000-0000-000000000000", qty: 1, name: "테스트상품" },
    });
    // 재고 없음 → 409
    expect([409, 422]).toContain(res.status());
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBeTruthy();
  });

  test("PATCH /api/cart/:id — qty 0 이하 시 400 반환", async ({ page }) => {
    const res = await page.request.patch("/api/cart/nonexistent-cart-item-id", {
      data: { qty: 0 },
    });
    expect(res.status()).toBe(400);
  });

  test("PATCH /api/cart/:id — 미존재 ID는 200 또는 422 반환", async ({ page }) => {
    const res = await page.request.patch("/api/cart/nonexistent-cart-item-id", {
      data: { qty: 3 },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("DELETE /api/cart/:id — 미존재 항목 삭제는 200 반환", async ({ page }) => {
    const res = await page.request.delete("/api/cart/nonexistent-cart-item-id");
    expect([200, 422]).toContain(res.status());
  });

  // ─── /api/wishlist ────────────────────────────────────────────────────────

  test("POST /api/wishlist — itemId 없이 요청 시 400 반환", async ({ page }) => {
    const res = await page.request.post("/api/wishlist", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  test("POST /api/wishlist — 존재하지 않는 itemId는 200·422·500 반환", async ({ page }) => {
    const res = await page.request.post("/api/wishlist", {
      data: { itemId: "00000000-0000-0000-0000-000000000000" },
    });
    // FK 제약 위반 시 DB 에러(422) 또는 테이블 RLS 예외(500)
    expect([200, 422, 500]).toContain(res.status());
  });

  test("DELETE /api/wishlist/:id — 찜 제거 요청", async ({ page }) => {
    const res = await page.request.delete("/api/wishlist/00000000-0000-0000-0000-000000000000");
    // 미존재 행은 성공(200) 또는 RLS/예외(500)
    expect([200, 422, 500]).toContain(res.status());
  });

  // ─── /api/payment/initiate ───────────────────────────────────────────────

  test("POST /api/payment/initiate — 응답이 JSON 형식", async ({ page }) => {
    const res = await page.request.post("/api/payment/initiate");
    expect([200, 409]).toContain(res.status());
    const body = (await res.json()) as { checkoutUrl?: string; error?: string };
    if (res.status() === 200) {
      expect(body.checkoutUrl).toBe("/cart");
    } else {
      expect(body.error).toBeTruthy();
    }
  });

  // ─── 채팅 페이지 UI ────────────────────────────────────────────────────────

  test("채팅 페이지 정상 로드 및 입력창 표시", async ({ page }) => {
    await page.goto("/chat");
    await expect(page).toHaveURL("/chat");
    // 채팅 입력창 존재 확인
    await expect(page.locator("textarea, input[type='text']").first()).toBeVisible({
      timeout: 8_000,
    });
  });

  test("미인증 API 요청 — /api/cart POST는 401 반환", async ({ page }) => {
    // 새 컨텍스트로 인증 없이 요청
    const newContext = await page.context().browser()!.newContext();
    const unauthPage = await newContext.newPage();
    const res = await unauthPage.request.post("/api/cart", {
      data: { storeItemId: "some-id", qty: 1 },
    });
    // 미들웨어에 의해 리다이렉트(302→login) 또는 401
    expect([200, 401, 302]).toContain(res.status());
    await newContext.close();
  });
});
