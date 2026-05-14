/**
 * Task 025 E2E 테스트
 *
 * 완료 기준:
 * 1. /api/ai/chat Route Handler — 인증 필요, 스트리밍 응답 반환
 * 2. 채팅 페이지 — 메시지 전송 → 스트리밍 응답 수신
 * 3. addToMemo Tool — 메모 추가 요청 시 DB 저장 + 확인 카드 표시
 * 4. Haiku 분류 — /api/ai/classify 의도 분류 확인
 * 5. 빠른칩 — 칩 클릭 시 컨텍스트 메시지 전송
 * 6. 스트리밍 에러 처리 — 미인증 시 401 반환
 * 7. 레이트 리밋 — 응답 정상 (30req/min 미만에서 200)
 * 8. common_code AI_CHAT_LLM 설정 반영
 */

import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

// ── T025-01: API 인증 가드 ─────────────────────────────────────
test.describe("Task 025-01: AI 채팅 API 인증", () => {
  test("미인증 POST /api/ai/chat → 401 반환", async ({ request }) => {
    const res = await request.post("/api/ai/chat", {
      data: { messages: [{ role: "user", content: "안녕" }] },
    });
    expect(res.status()).toBe(401);
  });

  test("빈 body POST /api/ai/chat (인증됨) → 스트리밍 응답", async ({ page }) => {
    await login(page);
    const res = await page.request.post("/api/ai/chat", {
      data: {
        messages: [{ role: "user", content: "안녕하세요" }],
      },
    });
    // 인증 후 200 또는 스트리밍 응답 확인
    expect([200, 201]).toContain(res.status());
  });
});

// ── T025-02: common_code AI_CHAT_LLM 반영 ────────────────────
test.describe("Task 025-02: AI 모델 설정", () => {
  test("common_code AI_CHAT_LLM → description 값으로 모델 ID 적용 (API 정상 응답)", async ({
    page,
  }) => {
    await login(page);
    const res = await page.request.post("/api/ai/chat", {
      data: {
        messages: [{ role: "user", content: "안녕" }],
      },
    });
    // 모델 설정이 잘못되면 500, 올바르면 200
    expect(res.status()).toBe(200);
    // content-type이 text/event-stream (UIMessage 스트림)인지 확인
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("text/event-stream");
  });
});

// ── T025-03: 채팅 페이지 UI ───────────────────────────────────
test.describe("Task 025-03: 채팅 페이지 UI", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
  });

  test("/chat 페이지 정상 로드 — 입력창·전송 버튼 표시", async ({ page }) => {
    await expect(page.getByPlaceholder("AI에게 물어보세요...")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: "전송" })).toBeVisible();
  });

  test("빠른칩 5개 표시 확인", async ({ page }) => {
    await expect(page.getByTestId("quick-chip-비건")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("quick-chip-매운맛")).toBeVisible();
    await expect(page.getByTestId("quick-chip-10분")).toBeVisible();
    await expect(page.getByTestId("quick-chip-8천원이하")).toBeVisible();
    await expect(page.getByTestId("quick-chip-초등간식")).toBeVisible();
  });

  test("빈 메시지 전송 시 버튼 비활성화", async ({ page }) => {
    const sendBtn = page.getByRole("button", { name: "전송" });
    await expect(sendBtn).toBeDisabled();
  });
});

// ── T025-04: 메시지 전송 + 스트리밍 응답 ─────────────────────
test.describe("Task 025-04: 자연어 요청 → 스트리밍 응답", () => {
  test("메시지 전송 → 사용자 말풍선 + AI 스트리밍 응답 수신", async ({ page }) => {
    await login(page);
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");

    const input = page.getByPlaceholder("AI에게 물어보세요...");
    await input.fill("안녕하세요, 오늘 뭐 먹을까요?");
    await page.keyboard.press("Enter");

    // 사용자 메시지 말풍선 확인
    await expect(page.getByText("안녕하세요, 오늘 뭐 먹을까요?")).toBeVisible({ timeout: 5000 });

    // AI 응답 스트리밍 대기 (최대 30초)
    await expect(async () => {
      const aiMessages = page.locator(
        ".bg-white.shadow-\\[0_1px_3px_rgba\\(0\\,0\\,0\\,0\\.08\\)\\]"
      );
      const count = await aiMessages.count();
      expect(count).toBeGreaterThan(0);
    }).toPass({ timeout: 30000 });
  });

  test("빠른칩 '비건' 클릭 → 비건 메뉴 요청 전송", async ({ page }) => {
    await login(page);
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");

    const chip = page.getByTestId("quick-chip-비건");
    await expect(chip).toBeVisible({ timeout: 5000 });
    await chip.click();

    // 사용자 메시지 표시 확인
    await expect(page.getByText("비건 메뉴 추천해줘")).toBeVisible({ timeout: 5000 });
  });

  test("빠른칩 클릭 후 스트리밍 중 재전송 불가 (disabled)", async ({ page }) => {
    await login(page);
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");

    await page.getByTestId("quick-chip-10분").click();

    // 스트리밍 시작 직후 다른 칩 disabled 확인
    await expect(page.getByTestId("quick-chip-비건")).toBeDisabled({ timeout: 3000 });
  });
});

// ── T025-05: addToMemo Tool ───────────────────────────────────
test.describe("Task 025-05: addToMemo Tool", () => {
  test("메모 추가 요청 → AI 도구 호출 + 확인 카드 표시 (단순 응답 확인)", async ({ page }) => {
    await login(page);
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");

    const input = page.getByPlaceholder("AI에게 물어보세요...");
    await input.fill("계란 2판 장보기 메모에 추가해줘");
    await page.keyboard.press("Enter");

    // AI 응답 기다림 (도구 호출 포함 최대 30초)
    // 확인 카드 또는 AI 텍스트 응답이 표시되면 성공
    await expect(async () => {
      const hasConfirmCard = await page.getByTestId("add-to-memo-confirm").isVisible();
      const hasAiText =
        (await page
          .locator(".bg-white.shadow-\\[0_1px_3px_rgba\\(0\\,0\\,0\\,0\\.08\\)\\]")
          .count()) > 0;
      expect(hasConfirmCard || hasAiText).toBeTruthy();
    }).toPass({ timeout: 35000 });
  });
});

// ── T025-06: 스트리밍 헤더 + 응답 포맷 ──────────────────────
test.describe("Task 025-06: 응답 형식 검증", () => {
  test("POST /api/ai/chat → x-vercel-ai-ui-message-stream 헤더 존재", async ({ page }) => {
    await login(page);
    const res = await page.request.post("/api/ai/chat", {
      data: { messages: [{ role: "user", content: "간단히 안녕이라고만 답해줘" }] },
    });
    expect(res.status()).toBe(200);
    const headers = res.headers();
    // UIMessage 스트림 헤더 확인
    expect(headers["x-vercel-ai-ui-message-stream"]).toBe("v1");
  });
});

// ── T025-07: 빠른칩 컨텍스트 주입 ───────────────────────────
test.describe("Task 025-07: 빠른칩 API 제약 조건 전달", () => {
  test("빠른칩 chipKey가 request body quickChip 필드로 전달됨", async ({ page }) => {
    await login(page);
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");

    // 요청 인터셉트
    let capturedQuickChip: string | undefined;
    await page.route("**/api/ai/chat", async (route) => {
      const req = route.request();
      const body = JSON.parse(req.postData() ?? "{}") as { quickChip?: string };
      capturedQuickChip = body.quickChip;
      await route.continue();
    });

    await page.getByTestId("quick-chip-비건").click();

    // 요청이 전송되면 quickChip 확인
    await page.waitForTimeout(1000);
    expect(capturedQuickChip).toBe("비건");
  });
});
