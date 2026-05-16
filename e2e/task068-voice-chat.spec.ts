/**
 * Task 068: 음성 입력 AI 채팅 Prototype (F035) E2E 테스트
 *
 * TC01 - 채팅 페이지에서 마이크 버튼 렌더링 확인
 * TC02 - Web Speech API 미지원 환경에서 마이크 버튼 비활성화 + 툴팁 확인
 * TC03 - Web Speech API 지원 환경에서 마이크 버튼 클릭 동작 (Mock)
 * TC04 - 파형 애니메이션 컴포넌트 DOM 확인
 * TC05 - 접근성 속성 (aria-label, aria-pressed) 확인
 * TC06 - 음성 인식 Mock → 자동 전송 흐름 확인
 */

import { test, expect, Page } from "@playwright/test";
import { login } from "./helpers/auth";

/** Web Speech API Mock 주입 (브라우저 환경 시뮬레이션) */
async function mockSpeechRecognition(
  page: Page,
  options: { supported: boolean; transcript?: string }
) {
  await page.addInitScript(
    ({ supported, transcript }) => {
      if (!supported) {
        // 미지원 환경: SpeechRecognition 제거
        delete (window as Window & { SpeechRecognition?: unknown }).SpeechRecognition;
        delete (window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
        return;
      }

      // 지원 환경: Mock SpeechRecognition
      class MockSpeechRecognition extends EventTarget {
        continuous = false;
        interimResults = true;
        lang = "ko-KR";
        maxAlternatives = 1;
        onstart: ((ev: Event) => void) | null = null;
        onend: ((ev: Event) => void) | null = null;
        onresult: ((ev: Event & { results: unknown; resultIndex: number }) => void) | null = null;
        onerror: ((ev: Event & { error: string }) => void) | null = null;

        start() {
          if (this.onstart) this.onstart(new Event("start"));

          // 500ms 후 transcript 결과 emit
          setTimeout(() => {
            if (this.onresult && transcript) {
              const mockResults = {
                length: 1,
                resultIndex: 0,
                0: {
                  isFinal: true,
                  length: 1,
                  0: { transcript, confidence: 0.95 },
                },
              };
              const ev = Object.assign(new Event("result"), {
                results: mockResults,
                resultIndex: 0,
              });
              this.onresult(ev as Event & { results: unknown; resultIndex: number });
            }
            setTimeout(() => {
              if (this.onend) this.onend(new Event("end"));
            }, 100);
          }, 500);
        }

        stop() {
          if (this.onend) this.onend(new Event("end"));
        }

        abort() {
          if (this.onend) this.onend(new Event("end"));
        }
      }

      (window as unknown as Record<string, unknown>)["SpeechRecognition"] = MockSpeechRecognition;
    },
    { supported: options.supported, transcript: options.transcript ?? "" }
  );
}

test.describe("Task068: 음성 입력 AI 채팅 Prototype (F035)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ─── TC01: 마이크 버튼 렌더링 확인 ───────────────────────────────────
  test("TC01 - 채팅 페이지에서 마이크 버튼 렌더링 확인", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // aria-label로 마이크 버튼 찾기
    const micBtn = page.getByRole("button", { name: "음성으로 입력하기" });
    await expect(micBtn).toBeVisible({ timeout: 10000 });

    console.log("✅ TC01 마이크 버튼 렌더링 확인");
  });

  // ─── TC02: 미지원 환경 비활성화 확인 ─────────────────────────────────
  test("TC02 - Web Speech API 미지원 환경 → 마이크 버튼 비활성화 + 툴팁", async ({ page }) => {
    await mockSpeechRecognition(page, { supported: false });
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    const micBtn = page.getByRole("button", { name: "음성으로 입력하기" });
    await expect(micBtn).toBeVisible({ timeout: 10000 });

    // 버튼이 disabled 상태여야 함
    await expect(micBtn).toBeDisabled();

    // title 속성(툴팁) 확인
    const title = await micBtn.getAttribute("title");
    expect(title).toContain("지원하지 않습니다");

    console.log("✅ TC02 미지원 환경 비활성화 확인");
  });

  // ─── TC03: 지원 환경에서 마이크 버튼 클릭 ────────────────────────────
  test("TC03 - Web Speech API 지원 환경 → 마이크 버튼 클릭 시 listening 상태", async ({ page }) => {
    await mockSpeechRecognition(page, { supported: true, transcript: "테스트 발화" });
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    const micBtn = page.getByRole("button", { name: "음성으로 입력하기" });
    await expect(micBtn).toBeEnabled({ timeout: 10000 });

    // 클릭 → listening 상태 진입
    await micBtn.click();
    await page.waitForTimeout(200);

    // aria-pressed가 true로 변경되어야 함
    await expect(micBtn).toHaveAttribute("aria-pressed", "true", {
      timeout: 3000,
    });

    // "듣고 있어요..." 레이블 표시 확인
    await expect(page.getByText("듣고 있어요...")).toBeVisible({
      timeout: 3000,
    });

    console.log("✅ TC03 listening 상태 전환 확인");
  });

  // ─── TC04: 파형 애니메이션 DOM 확인 ──────────────────────────────────
  test("TC04 - listening 상태에서 파형 애니메이션 바 4개 렌더링", async ({ page }) => {
    await mockSpeechRecognition(page, { supported: true, transcript: "테스트" });
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    const micBtn = page.getByRole("button", { name: "음성으로 입력하기" });
    await micBtn.click();
    await page.waitForTimeout(200);

    // SoundWaveAnimation 내부의 span 바 4개 확인 (data-testid 기반)
    const waveContainer = page.getByTestId("sound-wave");
    await expect(waveContainer).toBeVisible({ timeout: 3000 });
    const bars = waveContainer.locator("span");
    await expect(bars).toHaveCount(4, { timeout: 3000 });

    console.log("✅ TC04 파형 애니메이션 바 4개 확인");
  });

  // ─── TC05: 접근성 속성 확인 ──────────────────────────────────────────
  test("TC05 - 접근성 속성 확인 (aria-label, aria-pressed)", async ({ page }) => {
    await mockSpeechRecognition(page, { supported: true });
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    const micBtn = page.getByRole("button", { name: "음성으로 입력하기" });

    // aria-label 확인
    await expect(micBtn).toHaveAttribute("aria-label", "음성으로 입력하기");

    // 초기 상태: aria-pressed = false
    await expect(micBtn).toHaveAttribute("aria-pressed", "false");

    console.log("✅ TC05 접근성 속성 확인");
  });

  // ─── TC06: 음성 인식 Mock → 자동 전송 흐름 ──────────────────────────
  test("TC06 - 음성 인식 완료 → 채팅 메시지 자동 전송 흐름", async ({ page }) => {
    const voiceText = "오늘 저녁 뭐 먹을까";
    await mockSpeechRecognition(page, { supported: true, transcript: voiceText });
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // API 요청 인터셉트
    const chatRequestPromise = page.waitForRequest(
      (req) => req.url().includes("/api/ai/chat") && req.method() === "POST",
      { timeout: 15000 }
    );

    const micBtn = page.getByRole("button", { name: "음성으로 입력하기" });
    await expect(micBtn).toBeEnabled({ timeout: 10000 });
    await micBtn.click();

    // 음성 인식 완료 후 자동 전송 대기 (Mock: 600ms 내 완료)
    const chatReq = await chatRequestPromise;
    const body = chatReq.postDataJSON() as { messages: { content: string }[] };
    const lastMsg = body?.messages?.at(-1);

    expect(lastMsg?.content).toContain(voiceText);
    console.log("✅ TC06 음성 인식 텍스트 자동 전송 확인:", lastMsg?.content);
  });
});
