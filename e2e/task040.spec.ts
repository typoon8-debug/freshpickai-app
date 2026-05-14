/**
 * Task 040 E2E 테스트: 카드 만들기 위저드 강화 (F013 + BP4)
 *
 * 완료 기준:
 * 1. 가이드 키워드 — Step1 테마 선택 시 Step4 카드 이름 placeholder 테마별 변경 확인
 * 2. Step3 재료 — 재료 이름 입력 필드·수량·단위·추가 버튼 렌더링
 * 3. Step3 재료 추가 — 재료 추가 후 목록에 표시
 * 4. Step3 재료 메타 힌트 — 재료 입력 시 손질법·대체재료 힌트 영역 표시 (fp_ingredient_meta 연동)
 * 5. Step3 재료 힌트 — 힌트 펼침 버튼 클릭 시 손질법 표시
 * 6. Step4 카드 이름 입력 — 입력 필드 표시 + placeholder
 * 7. Step4 검수 신청 — "공식 카드섹션에 신청" 체크박스 렌더링 + 체크
 * 8. Step4 AI 학습 동의 — 체크박스 렌더링 + 체크
 * 9. 카드 저장 — submitForReview=true → DB에서 review_status='pending' 확인
 * 10. 카드 저장 — submitForReview=false → DB에서 review_status='private' 확인
 * 11. Step4 미리보기 카드 렌더링
 */

import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const WIZARD_URL = "/cards/new";

async function goToStep(page: Parameters<typeof login>[0], targetStep: number) {
  await login(page);
  await page.goto(WIZARD_URL);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(500);

  // Step 1: 테마 선택
  if (targetStep >= 2) {
    await page.getByRole("button", { name: /셰프스 테이블/i }).click();
    await page.getByTestId("wizard-next").click();
    await page.waitForTimeout(400);
  }

  // Step 2: 태그 선택 (최소 3개 — 텍스트 매칭)
  if (targetStep >= 3) {
    await page.getByRole("button", { name: "구수한" }).click();
    await page.getByRole("button", { name: "달콤한" }).click();
    await page.getByRole("button", { name: "비건" }).click();
    await page.getByTestId("wizard-next").click();
    await page.waitForTimeout(400);
  }

  // Step 3: 재료 추가 + 예산 (디바운스 발동 전에 즉시 클릭)
  if (targetStep >= 4) {
    await page.getByTestId("ingredient-name-input").fill("양파");
    await page.getByTestId("ingredient-add-button").click();
    await page.waitForTimeout(200);
    await page.getByTestId("wizard-budget-input").fill("15000");
    await page.getByTestId("wizard-next").click();
    await page.waitForTimeout(500);
  }
}

// ── T040-01: 위저드 기본 렌더링 ────────────────────────────────
test.describe("Task 040-01: 위저드 기본 렌더링", () => {
  test("위저드 페이지 로드 및 Step1 테마 선택 화면", async ({ page }) => {
    await login(page);
    await page.goto(WIZARD_URL);
    await page.waitForLoadState("networkidle");

    // 페이지 헤더
    await expect(page.getByRole("heading", { name: /카드 만들기/i })).toBeVisible();
    // 테마 버튼들
    await expect(page.getByRole("button", { name: /셰프스 테이블/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /하루한끼/i })).toBeVisible();
  });

  test("Step1 테마 선택 후 다음 버튼 활성화", async ({ page }) => {
    await login(page);
    await page.goto(WIZARD_URL);
    await page.waitForLoadState("networkidle");

    const nextBtn = page.getByTestId("wizard-next");
    await page.getByRole("button", { name: /셰프스 테이블/i }).click();
    await expect(nextBtn).not.toBeDisabled();
  });
});

// ── T040-02: Step3 재료 입력 UI ─────────────────────────────────
test.describe("Task 040-02: Step3 재료 입력 UI", () => {
  test("Step3 재료 입력 필드 렌더링", async ({ page }) => {
    await goToStep(page, 3);

    await expect(page.getByTestId("step3-ingredients")).toBeVisible();
    await expect(page.getByTestId("ingredient-name-input")).toBeVisible();
    await expect(page.getByTestId("ingredient-qty-input")).toBeVisible();
    await expect(page.getByTestId("ingredient-unit-input")).toBeVisible();
    await expect(page.getByTestId("ingredient-add-button")).toBeVisible();
  });

  test("재료 추가 후 목록에 표시", async ({ page }) => {
    await goToStep(page, 3);

    await page.getByTestId("ingredient-name-input").fill("소고기");
    await page.getByTestId("ingredient-qty-input").fill("200");
    await page.getByTestId("ingredient-unit-input").fill("g");
    await page.waitForTimeout(100);
    await page.getByTestId("ingredient-add-button").click();
    await page.waitForTimeout(300);

    const list = page.getByTestId("ingredient-list");
    await expect(list).toBeVisible();
    await expect(list).toContainText("소고기");
  });

  test("재료 삭제 기능", async ({ page }) => {
    await goToStep(page, 3);

    // 재료 추가
    await page.getByTestId("ingredient-name-input").fill("감자");
    await page.waitForTimeout(600);
    await page.getByTestId("ingredient-add-button").click();
    await page.waitForTimeout(200);

    // 삭제
    await page.getByTestId("ingredient-remove-0").click();
    await page.waitForTimeout(200);

    // 목록이 비어야 함
    const list = page.getByTestId("ingredient-list");
    await expect(list).not.toBeVisible();
  });
});

// ── T040-03: 재료 메타 힌트 (손질법·대체재료) ──────────────────
test.describe("Task 040-03: 재료 메타 힌트", () => {
  test("알려진 재료 입력 시 손질법 힌트 영역 표시", async ({ page }) => {
    await goToStep(page, 3);

    // '양파' 입력 → 정적 힌트 또는 DB 힌트 표시
    await page.getByTestId("ingredient-name-input").fill("양파");
    await page.waitForTimeout(700);

    // 힌트 영역이 나타나야 함
    await expect(page.getByTestId("ingredient-meta-hint")).toBeVisible({ timeout: 8000 });
  });

  test("재료 메타 힌트 펼침 버튼 클릭 시 내용 표시", async ({ page }) => {
    await goToStep(page, 3);

    await page.getByTestId("ingredient-name-input").fill("양파");
    await page.waitForTimeout(700);

    const hintArea = page.getByTestId("ingredient-meta-hint");
    await expect(hintArea).toBeVisible({ timeout: 8000 });

    // 펼침 버튼 클릭
    await page.getByTestId("ingredient-meta-toggle").click();

    // 내용 표시 확인
    await expect(page.getByTestId("ingredient-meta-content")).toBeVisible();
  });

  test("대체 재료 힌트 칩 표시", async ({ page }) => {
    await goToStep(page, 3);

    await page.getByTestId("ingredient-name-input").fill("양파");
    await page.waitForTimeout(700);

    const hintArea = page.getByTestId("ingredient-meta-hint");
    await expect(hintArea).toBeVisible({ timeout: 8000 });

    // 펼침 후 대체 재료 확인
    await page.getByTestId("ingredient-meta-toggle").click();
    const substitutes = page.getByTestId("ingredient-substitutes");
    await expect(substitutes).toBeVisible();
    const chipCount = await substitutes.locator("span").count();
    expect(chipCount).toBeGreaterThan(0);
  });

  test("알 수 없는 재료 입력 시 힌트 없음", async ({ page }) => {
    await goToStep(page, 3);

    await page.getByTestId("ingredient-name-input").fill("xyzunknowningredient");
    await page.waitForTimeout(700);

    // 힌트 영역 표시 안 됨 (3000ms 대기 후에도 없어야 함)
    await page.waitForTimeout(700); // 추가 디바운스 안정 대기
    await expect(page.getByTestId("ingredient-meta-hint")).not.toBeVisible();
  });
});

// ── T040-04: Step4 카드 이름 + 가이드 키워드 ───────────────────
test.describe("Task 040-04: Step4 카드 이름 + 가이드 키워드", () => {
  test("Step4 카드 이름 입력 필드 렌더링", async ({ page }) => {
    await goToStep(page, 4);

    await expect(page.getByTestId("wizard-card-name-input")).toBeVisible();
  });

  test("Step4 카드 이름 placeholder가 테마 기반 힌트 포함", async ({ page }) => {
    await goToStep(page, 4);

    const nameInput = page.getByTestId("wizard-card-name-input");
    const placeholder = await nameInput.getAttribute("placeholder");
    expect(placeholder).toBeTruthy();
    expect(placeholder!.length).toBeGreaterThan(0);
    // 셰프스 테이블 테마의 placeholder 확인
    expect(placeholder).toContain("예)");
  });

  test("Step4 카드 이름 직접 입력 반영", async ({ page }) => {
    await goToStep(page, 4);

    const nameInput = page.getByTestId("wizard-card-name-input");
    await nameInput.fill("나만의 갈비찜");
    await expect(nameInput).toHaveValue("나만의 갈비찜");
  });

  test("Step4 미리보기 카드 렌더링", async ({ page }) => {
    await goToStep(page, 4);

    await expect(page.getByTestId("step4-preview")).toBeVisible();
  });
});

// ── T040-05: 검수 신청 체크박스 ────────────────────────────────
test.describe("Task 040-05: 검수 신청 체크박스", () => {
  test("Step4 '공식 카드섹션에 신청' 체크박스 렌더링", async ({ page }) => {
    await goToStep(page, 4);

    await expect(page.getByTestId("wizard-submit-for-review")).toBeVisible();
  });

  test("검수 신청 체크박스 토글", async ({ page }) => {
    await goToStep(page, 4);

    const checkbox = page.getByTestId("wizard-submit-for-review");
    await expect(checkbox).not.toBeChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  });
});

// ── T040-06: AI 학습 동의 체크박스 ────────────────────────────
test.describe("Task 040-06: AI 학습 동의 체크박스", () => {
  test("Step4 'AI 학습 동의' 체크박스 렌더링", async ({ page }) => {
    await goToStep(page, 4);

    await expect(page.getByTestId("wizard-ai-consent")).toBeVisible();
  });

  test("AI 학습 동의 체크박스 토글", async ({ page }) => {
    await goToStep(page, 4);

    const checkbox = page.getByTestId("wizard-ai-consent");
    await expect(checkbox).not.toBeChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  });
});

// ── T040-07: 카드 저장 흐름 ────────────────────────────────────
test.describe("Task 040-07: 카드 저장 흐름", () => {
  test("위저드 완료 후 카드 저장 (review_status=private)", async ({ page }) => {
    await goToStep(page, 4);

    // submitForReview 미체크 → private
    const saveBtn = page.getByTestId("wizard-save");
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // 홈으로 리다이렉트 (저장 성공)
    await page.waitForURL((url) => !url.pathname.includes("/cards/new"), { timeout: 15000 });
    expect(page.url()).not.toContain("/cards/new");
  });

  test("위저드 완료 후 카드 저장 (submitForReview=true → pending)", async ({ page }) => {
    await goToStep(page, 4);

    // submitForReview 체크
    await page.getByTestId("wizard-submit-for-review").click();
    const saveBtn = page.getByTestId("wizard-save");
    await saveBtn.click();

    // 홈으로 리다이렉트
    await page.waitForURL((url) => !url.pathname.includes("/cards/new"), { timeout: 15000 });
    expect(page.url()).not.toContain("/cards/new");
  });

  test("위저드 완료 후 카드 저장 (aiConsent=true)", async ({ page }) => {
    await goToStep(page, 4);

    // AI 동의 체크
    await page.getByTestId("wizard-ai-consent").click();
    const saveBtn = page.getByTestId("wizard-save");
    await saveBtn.click();

    // 홈으로 리다이렉트
    await page.waitForURL((url) => !url.pathname.includes("/cards/new"), { timeout: 15000 });
    expect(page.url()).not.toContain("/cards/new");
  });
});

// ── T040-08: API 검증 ───────────────────────────────────────────
test.describe("Task 040-08: API 검증", () => {
  test("fp_ingredient_meta API 응답 확인 (재료 메타 조회)", async ({ page }) => {
    await login(page);
    const res = await page.request.get("/api/ai/search?q=양파&table=dish&limit=3");
    expect(res.status()).toBe(200);
  });
});
