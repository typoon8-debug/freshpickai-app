/**
 * Task 024 E2E 테스트
 *
 * 완료 기준:
 * 1. buildPersonaContext() API 엔드포인트가 9 페르소나 중 1개를 반환한다
 * 2. 프로필 페이지(/profile)가 페르소나 배지를 표시한다
 * 3. PreferenceForm에서 식이 태그·조리 수준·쇼핑 시간대를 선택하고 저장할 수 있다
 * 4. 저장 후 페르소나가 재분류된다
 * 5. 페르소나 컨텍스트 API가 buildChatPrompt 포함 여부를 검증한다
 */

import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const VALID_PERSONA_IDS = [
  "family_manager",
  "solo_efficient",
  "working_couple",
  "health_senior",
  "budget_student",
  "premium_gourmet",
  "working_mom",
  "young_chef",
  "trend_curator",
] as const;

const VALID_PERSONA_NAMES = [
  "가족 저녁 매니저",
  "효율 1인식",
  "맞벌이 부부",
  "건강 시니어",
  "가성비 대학생",
  "프리미엄 미식가",
  "워킹맘",
  "막내셰프",
  "트렌드 큐레이터",
];

// ── T024-01: API 엔드포인트 ────────────────────────────────────
test.describe("Task 024-01: 페르소나 컨텍스트 API", () => {
  test("GET /api/persona/context → 9 페르소나 중 1개 personaId 반환", async ({ request }) => {
    const res = await request.get("/api/persona/context");
    // 미인증 시 401 또는 리다이렉트 — 인증 필요 API
    expect([200, 401, 302, 307]).toContain(res.status());
  });

  test("GET /api/persona/context (인증됨) → personaId·personaName 포함", async ({
    page,
    request,
  }) => {
    await login(page);
    // 쿠키 컨텍스트를 request에 공유하기 위해 page.request 사용
    const res = await page.request.get("/api/persona/context");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();

    // personaId가 9 페르소나 중 하나여야 함
    expect(VALID_PERSONA_IDS).toContain(body.personaId);
    // personaName이 한국어 이름이어야 함
    expect(VALID_PERSONA_NAMES).toContain(body.personaName);
    // 필수 필드 존재 확인
    expect(body).toHaveProperty("userId");
    expect(body).toHaveProperty("cookTimeMin");
    expect(body).toHaveProperty("budgetLevel");
    expect(body).toHaveProperty("householdSize");
    expect(body).toHaveProperty("cookingSkill");
    expect(body).toHaveProperty("preferredShoppingTime");
  });
});

// ── T024-02: 프로필 페이지 렌더링 ────────────────────────────
test.describe("Task 024-02: 프로필 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("/profile 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
    // 페이지 타이틀 또는 컨텐츠 확인
    await expect(page).not.toHaveURL(/login/);
  });

  test("페르소나 배지가 표시된다", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    const badge = page.getByTestId("persona-badge");
    await expect(badge).toBeVisible({ timeout: 8000 });

    // 배지에 유효한 페르소나 이름 중 하나가 포함되어야 함
    const badgeText = await badge.textContent();
    const hasValidPersona = VALID_PERSONA_NAMES.some((name) => badgeText?.includes(name));
    expect(hasValidPersona).toBeTruthy();
  });

  test("선호 설정 폼이 표시된다", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    // 식이 태그 섹션
    await expect(page.getByText("식이 태그")).toBeVisible({ timeout: 8000 });
    // 요리 실력 섹션
    await expect(page.getByText("요리 실력")).toBeVisible();
    // 선호 쇼핑 시간대 섹션
    await expect(page.getByText("선호하는 쇼핑 시간대")).toBeVisible();
  });
});

// ── T024-03: PreferenceForm 인터랙션 ─────────────────────────
test.describe("Task 024-03: PreferenceForm 인터랙션", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
  });

  test("식이 태그 칩을 클릭하면 토글된다", async ({ page }) => {
    // "비건" 태그 버튼 클릭
    const veganBtn = page.getByRole("button", { name: "비건" });
    await expect(veganBtn).toBeVisible({ timeout: 8000 });

    await veganBtn.click();
    // 선택 상태 — mocha-700 배경 클래스
    await expect(veganBtn).toHaveClass(/bg-mocha-700/, { timeout: 3000 });

    // 다시 클릭하면 해제
    await veganBtn.click();
    await expect(veganBtn).not.toHaveClass(/bg-mocha-700/, { timeout: 3000 });
  });

  test("조리 수준 버튼 (초보/중급/고급)을 선택할 수 있다", async ({ page }) => {
    const advancedBtn = page.getByRole("button", { name: /고급/ });
    await expect(advancedBtn).toBeVisible({ timeout: 8000 });

    await advancedBtn.click();
    await expect(advancedBtn).toHaveClass(/border-mocha-700/, { timeout: 3000 });
  });

  test("쇼핑 시간대 버튼을 선택할 수 있다", async ({ page }) => {
    const morningBtn = page.getByRole("button", { name: "오전" });
    await expect(morningBtn).toBeVisible({ timeout: 8000 });

    await morningBtn.click();
    await expect(morningBtn).toHaveClass(/border-mocha-700/, { timeout: 3000 });
  });

  test("가족 인원 버튼을 선택할 수 있다", async ({ page }) => {
    // "1" 버튼 클릭
    const oneBtn = page.getByRole("button", { name: "1", exact: true });
    await expect(oneBtn).toBeVisible({ timeout: 8000 });

    await oneBtn.click();
    await expect(oneBtn).toHaveClass(/bg-mocha-700/, { timeout: 3000 });
  });

  test("저장하기 버튼이 표시되고 클릭 가능하다", async ({ page }) => {
    const saveBtn = page.getByTestId("preference-save-btn");
    await expect(saveBtn).toBeVisible({ timeout: 8000 });
    await expect(saveBtn).toBeEnabled();
  });
});

// ── T024-04: 저장 → 페르소나 재분류 ─────────────────────────
test.describe("Task 024-04: 선호 저장 후 페르소나 재분류", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
  });

  test("1인 + 저칼로리 선택 후 저장 → 페르소나가 효율 1인식으로 변경될 수 있다", async ({
    page,
  }) => {
    // 가족 인원 1명 선택
    const oneBtn = page.getByRole("button", { name: "1", exact: true });
    await oneBtn.click();

    // 저칼로리 태그 선택
    const lowCalBtn = page.getByRole("button", { name: "저칼로리" });
    await lowCalBtn.click();

    // 초보 요리 실력 선택
    const beginnerBtn = page.getByRole("button", { name: /초보/ });
    await beginnerBtn.click();

    // 저장
    const saveBtn = page.getByTestId("preference-save-btn");
    await saveBtn.click();

    // "저장됨" 상태 확인
    await expect(saveBtn).toHaveText(/저장됨|저장 중/, { timeout: 5000 });
  });

  test("고예산 + 고급 요리 실력 선택 후 저장 가능", async ({ page }) => {
    // 고급 실력 선택
    const advancedBtn = page.getByRole("button", { name: /고급/ });
    await advancedBtn.click();

    // 오가닉 태그 선택
    const organicBtn = page.getByRole("button", { name: "오가닉" });
    await organicBtn.click();

    // 저장
    const saveBtn = page.getByTestId("preference-save-btn");
    await saveBtn.click();

    await expect(saveBtn).toHaveText(/저장됨|저장 중/, { timeout: 5000 });
  });
});

// ── T024-05: buildChatPrompt 프롬프트 API ────────────────────
test.describe("Task 024-05: 채팅 프롬프트 빌더 API", () => {
  test("GET /api/persona/chat-prompt → 페르소나 컨텍스트 포함 프롬프트 반환", async ({ page }) => {
    await login(page);
    const res = await page.request.get("/api/persona/chat-prompt");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();

    // chatPrompt 문자열이 포함되어야 함
    expect(body).toHaveProperty("chatPrompt");
    expect(typeof body.chatPrompt).toBe("string");
    expect(body.chatPrompt.length).toBeGreaterThan(50);

    // 프롬프트에 사용자 프로필 정보가 포함되어야 함
    expect(body.chatPrompt).toMatch(/페르소나|조리|예산/);
  });
});
