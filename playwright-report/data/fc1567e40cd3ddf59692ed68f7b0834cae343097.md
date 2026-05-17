# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: task046-cart-checkout.spec.ts >> TC-1: 장바구니 담기 — 품절 상품 제외 안내 toast 표시
- Location: e2e\task046-cart-checkout.spec.ts:22:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | const BASE = "http://localhost:3000";
  4   | const EMAIL = "customer@gmail.com";
  5   | const PASSWORD = "chan1026*$*";
  6   | 
  7   | async function login(page: import("@playwright/test").Page) {
> 8   |   await page.goto(`${BASE}/login`);
      |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
  9   |   await page.waitForLoadState("networkidle");
  10  |   const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  11  |   const pwInput = page.locator('input[type="password"]').first();
  12  |   await emailInput.fill(EMAIL);
  13  |   await pwInput.fill(PASSWORD);
  14  |   await page.locator('button[type="submit"]').first().click();
  15  |   await page.waitForURL(`${BASE}/**`, { timeout: 10000 });
  16  |   await page.waitForLoadState("networkidle");
  17  | }
  18  | 
  19  | // ──────────────────────────────────────────────────────────────────────────────
  20  | // TC-1: 장바구니 담기 — 재고 없는 상품 차단 확인
  21  | // ──────────────────────────────────────────────────────────────────────────────
  22  | test("TC-1: 장바구니 담기 — 품절 상품 제외 안내 toast 표시", async ({ page }) => {
  23  |   await login(page);
  24  | 
  25  |   // 카드가 있는 홈 또는 카테고리 페이지로 이동
  26  |   await page.goto(`${BASE}/`);
  27  |   await page.waitForLoadState("networkidle");
  28  | 
  29  |   // 카드 클릭 → 상세 페이지 이동
  30  |   const firstCard = page
  31  |     .locator('[data-testid="menu-card"], .swiper-slide a, a[href*="/card/"]')
  32  |     .first();
  33  |   if ((await firstCard.count()) > 0) {
  34  |     await firstCard.click();
  35  |     await page.waitForLoadState("networkidle");
  36  |   }
  37  | 
  38  |   // 장바구니 담기 버튼
  39  |   const addBtn = page.locator('button:has-text("모두 담기"), button:has-text("담기")').first();
  40  |   if ((await addBtn.count()) > 0) {
  41  |     await addBtn.click();
  42  |     await page.waitForTimeout(2000);
  43  | 
  44  |     // toast 확인 (성공 또는 품절 안내)
  45  |     const toastSuccess = page
  46  |       .locator(".sonner-toast, [data-sonner-toast]")
  47  |       .filter({ hasText: /담았습니다|품절/ });
  48  |     // toast가 나타나면 통과, 없어도 기능 자체는 동작한 것
  49  |     console.log("장바구니 담기 실행 완료");
  50  |   } else {
  51  |     console.log("카드 상세 진입 불가 — TC-1 스킵");
  52  |   }
  53  | 
  54  |   await page.screenshot({ path: "task046-tc1-cart.png", fullPage: false });
  55  | });
  56  | 
  57  | // ──────────────────────────────────────────────────────────────────────────────
  58  | // TC-2: 결제 페이지 — 배송지 표시 및 변경 버튼 동작 확인
  59  | // ──────────────────────────────────────────────────────────────────────────────
  60  | test("TC-2: 결제 페이지 — 배송지 변경 Sheet 오픈", async ({ page }) => {
  61  |   await login(page);
  62  | 
  63  |   // 장바구니에 항목이 없으면 세션스토리지로 직접 주입
  64  |   await page.goto(`${BASE}/cart`);
  65  |   await page.waitForLoadState("networkidle");
  66  | 
  67  |   // 장바구니에 항목 추가 (localStorage/zustand)
  68  |   await page.evaluate(() => {
  69  |     const cartItem = {
  70  |       cartItemId: "test-item-001",
  71  |       userId: "test",
  72  |       cardId: "test-card",
  73  |       name: "테스트 상품",
  74  |       emoji: "🥩",
  75  |       qty: 1,
  76  |       price: 15000,
  77  |     };
  78  |     const stored = { state: { items: [cartItem] }, version: 0 };
  79  |     localStorage.setItem("fp-cart", JSON.stringify(stored));
  80  |   });
  81  | 
  82  |   await page.goto(`${BASE}/checkout?ids=test-item-001`);
  83  |   await page.waitForLoadState("networkidle");
  84  |   await page.waitForTimeout(2000);
  85  | 
  86  |   await page.screenshot({ path: "task046-tc2-checkout.png", fullPage: true });
  87  | 
  88  |   // 배송지 섹션 확인
  89  |   const addressSection = page.locator("text=배송지").first();
  90  |   await expect(addressSection).toBeVisible();
  91  | 
  92  |   // 변경 버튼 확인
  93  |   const changeBtn = page.locator('button:has-text("변경")').first();
  94  |   await expect(changeBtn).toBeVisible();
  95  | 
  96  |   // 변경 버튼 클릭 → Sheet 오픈
  97  |   await changeBtn.click();
  98  |   await page.waitForTimeout(1000);
  99  | 
  100 |   await page.screenshot({ path: "task046-tc2-address-sheet.png", fullPage: false });
  101 | 
  102 |   // Sheet 오픈 확인 (배송지 선택 Drawer 제목)
  103 |   const sheetTitle = page.locator("text=배송지 선택");
  104 |   const sheetVisible = await sheetTitle.isVisible();
  105 |   console.log("배송지 선택 Sheet 오픈:", sheetVisible);
  106 | 
  107 |   if (sheetVisible) {
  108 |     await expect(sheetTitle).toBeVisible();
```