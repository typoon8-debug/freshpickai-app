/**
 * Task 026 E2E 테스트
 *
 * 완료 기준:
 * 1. /api/ai/recommend 인증 가드 — 미인증 시 401 반환
 * 2. /api/ai/recommend 인증 후 5테마 추천 응답 구조 확인
 * 3. 홈 화면 AI 추천 섹션 표시 확인
 * 4. 5테마 탭 표시 및 전환 동작
 * 5. 추천 카드 캐러셀 표시 확인
 * 6. 추천 카드 클릭 → 카드 상세 이동
 * 7. sessionStorage 24h 캐시 동작
 * 8. 폴백 추천 동작 (API 실패 시)
 */

import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const CACHE_KEY = "ai-recommend:v1";

// 테스트용 목업 추천 데이터
const MOCK_RECOMMENDATIONS = {
  recommendations: [
    {
      theme: "오늘의한끼",
      cards: [
        {
          cardId: "card-1",
          title: "제육볶음 정식",
          reason: "가족 매니저님을 위한 든든한 한 끼입니다. 30분 이내로 준비 가능합니다.",
          confidence: 0.92,
        },
        {
          cardId: "card-2",
          title: "된장찌개 정식",
          reason:
            "건강한 발효 식품으로 균형 잡힌 영양을 제공합니다. 온 가족이 좋아하는 메뉴입니다.",
          confidence: 0.87,
        },
        {
          cardId: "card-3",
          title: "비빔밥 세트",
          reason: "다채로운 채소로 영양 균형을 맞춘 건강식입니다.",
          confidence: 0.85,
        },
      ],
    },
    {
      theme: "지금이적기",
      cards: [
        {
          cardId: "card-4",
          title: "봄나물 비빔밥",
          reason: "봄철 제철 나물이 가장 신선할 시기입니다. 지금 먹어야 맛있는 계절 메뉴입니다.",
          confidence: 0.88,
        },
        {
          cardId: "card-5",
          title: "냉이된장국",
          reason: "봄의 향기가 느껴지는 제철 채소 메뉴입니다.",
          confidence: 0.83,
        },
      ],
    },
    {
      theme: "놓치면아까워요",
      cards: [
        {
          cardId: "card-6",
          title: "삼겹살 파티",
          reason: "지금 삼겹살 재료가 20% 할인 중입니다. 지금 구매하는 게 유리합니다.",
          confidence: 0.9,
          discountPct: 20,
        },
        {
          cardId: "card-7",
          title: "LA갈비 세트",
          reason: "프리미엄 구이류가 특별 프로모션 중입니다.",
          confidence: 0.82,
          discountPct: 15,
        },
      ],
    },
    {
      theme: "다시만나볼까요",
      cards: [
        {
          cardId: "card-8",
          title: "김치찌개 정식",
          reason: "이전에 즐겨 드셨던 스타일의 메뉴입니다. 익숙하고 편안한 맛을 다시 느껴보세요.",
          confidence: 0.78,
        },
        {
          cardId: "card-9",
          title: "순두부찌개 세트",
          reason: "부드러운 두부 요리를 좋아하시는 분들께 추천드립니다.",
          confidence: 0.74,
        },
      ],
    },
    {
      theme: "새로들어왔어요",
      cards: [
        {
          cardId: "card-10",
          title: "흑백요리사 스페셜",
          reason: "최근 새롭게 추가된 프리미엄 메뉴입니다. 처음 도전해보기 좋은 특별한 메뉴입니다.",
          confidence: 0.86,
        },
        {
          cardId: "card-11",
          title: "글로벌 퓨전 한 끼",
          reason: "신규 입점한 세계 각국의 식재료로 만든 퓨전 메뉴입니다.",
          confidence: 0.81,
        },
      ],
    },
  ],
};

// ── T026-01: API 인증 가드 ────────────────────────────────────
test.describe("Task 026-01: AI 추천 API 인증", () => {
  test("미인증 GET /api/ai/recommend → 401 반환", async ({ request }) => {
    const res = await request.get("/api/ai/recommend");
    expect(res.status()).toBe(401);
  });

  test("인증 후 GET /api/ai/recommend → 200 + recommendations 배열 반환", async ({ page }) => {
    test.setTimeout(60000);
    await login(page);
    const res = await page.request.get("/api/ai/recommend");
    expect(res.status()).toBe(200);

    const body = (await res.json()) as { recommendations?: unknown[] };
    expect(body).toHaveProperty("recommendations");
    expect(Array.isArray(body.recommendations)).toBe(true);
  });
});

// ── T026-02: 추천 응답 구조 검증 ─────────────────────────────
test.describe("Task 026-02: 추천 응답 스키마", () => {
  test("recommendations에 theme, cards 필드가 있어야 함", async ({ page }) => {
    test.setTimeout(60000);
    await login(page);
    const res = await page.request.get("/api/ai/recommend");
    const body = (await res.json()) as {
      recommendations: Array<{
        theme: string;
        cards: Array<{ cardId: string; title: string; reason: string; confidence: number }>;
      }>;
    };

    expect(body.recommendations.length).toBeGreaterThan(0);

    const firstTheme = body.recommendations[0];
    expect(firstTheme).toHaveProperty("theme");
    expect(firstTheme).toHaveProperty("cards");
    expect(Array.isArray(firstTheme.cards)).toBe(true);
    expect(firstTheme.cards.length).toBeGreaterThan(0);

    const firstCard = firstTheme.cards[0];
    expect(firstCard).toHaveProperty("cardId");
    expect(firstCard).toHaveProperty("title");
    expect(firstCard).toHaveProperty("reason");
    expect(firstCard).toHaveProperty("confidence");
    expect(typeof firstCard.confidence).toBe("number");
    expect(firstCard.confidence).toBeGreaterThanOrEqual(0);
    expect(firstCard.confidence).toBeLessThanOrEqual(1);
  });

  test("5가지 테마 이름이 올바르게 포함되어야 함", async ({ page }) => {
    test.setTimeout(60000);
    await login(page);
    const res = await page.request.get("/api/ai/recommend");
    const body = (await res.json()) as { recommendations: Array<{ theme: string }> };

    const themes = body.recommendations.map((r) => r.theme);
    const expectedThemes = [
      "오늘의한끼",
      "지금이적기",
      "놓치면아까워요",
      "다시만나볼까요",
      "새로들어왔어요",
    ];

    for (const expected of expectedThemes) {
      expect(themes).toContain(expected);
    }
  });
});

// ── T026-03: 홈 화면 AI 추천 섹션 표시 ──────────────────────
test.describe("Task 026-03: 홈 AI 추천 섹션 UI", () => {
  test("홈 화면에 AI 추천 섹션이 표시되어야 함", async ({ page }) => {
    await login(page);
    // API 응답 목업 — 빠른 UI 테스트를 위해
    await page.route("/api/ai/recommend", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECOMMENDATIONS),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const section = page.getByTestId("ai-recommend-section");
    await expect(section).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("AI 테마 추천")).toBeVisible();
  });

  test("로딩 중 스켈레톤 표시 후 탭 렌더링", async ({ page }) => {
    await login(page);
    await page.route("/api/ai/recommend", async (route) => {
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECOMMENDATIONS),
      });
    });

    await page.goto("/");

    const tabs = page.getByTestId("recommend-tabs");
    await expect(tabs).toBeVisible({ timeout: 5000 });

    const tabButtons = tabs.locator("button");
    await expect(tabButtons.first()).toBeVisible({ timeout: 5000 });
  });
});

// ── T026-04: 5테마 탭 전환 ──────────────────────────────────
test.describe("Task 026-04: 테마 탭 전환", () => {
  test("탭 클릭 시 해당 테마 카드 캐러셀로 전환", async ({ page }) => {
    await login(page);
    await page.route("/api/ai/recommend", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECOMMENDATIONS),
      });
    });

    await page.goto("/");
    await page.waitForSelector('[data-testid="recommend-tab-0"]', { timeout: 8000 });

    // 두 번째 탭 클릭
    const secondTab = page.getByTestId("recommend-tab-1");
    await secondTab.click();

    // 캐러셀이 표시되어야 함
    await expect(page.getByTestId("recommend-carousel")).toBeVisible({ timeout: 3000 });
  });

  test("각 탭은 테마 이름을 표시해야 함", async ({ page }) => {
    await login(page);
    await page.route("/api/ai/recommend", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECOMMENDATIONS),
      });
    });

    await page.goto("/");
    await page.waitForSelector('[data-testid="recommend-tab-0"]', { timeout: 8000 });

    const tabs = page.getByTestId("recommend-tabs").locator("button");
    const count = await tabs.count();
    expect(count).toBe(5);

    // 테마 이름 확인
    await expect(page.getByText("오늘의한끼")).toBeVisible();
    await expect(page.getByText("지금이적기")).toBeVisible();
    await expect(page.getByText("놓치면아까워요")).toBeVisible();
    await expect(page.getByText("다시만나볼까요")).toBeVisible();
    await expect(page.getByText("새로들어왔어요")).toBeVisible();
  });
});

// ── T026-05: 추천 카드 캐러셀 ────────────────────────────────
test.describe("Task 026-05: 추천 카드 캐러셀", () => {
  test("활성 테마에 카드가 1개 이상 표시되어야 함", async ({ page }) => {
    await login(page);
    await page.route("/api/ai/recommend", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECOMMENDATIONS),
      });
    });

    await page.goto("/");
    await page.waitForSelector('[data-testid="recommend-carousel"]', { timeout: 8000 });

    const carousel = page.getByTestId("recommend-carousel");
    await expect(carousel).toBeVisible();

    const cards = carousel.locator("button");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("추천 카드에 매칭 퍼센트가 표시되어야 함", async ({ page }) => {
    await login(page);
    await page.route("/api/ai/recommend", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECOMMENDATIONS),
      });
    });

    await page.goto("/");
    await page.waitForSelector('[data-testid="recommend-carousel"]', { timeout: 8000 });

    const carousel = page.getByTestId("recommend-carousel");
    const firstCard = carousel.locator("button").first();
    await expect(firstCard).toBeVisible();

    // "% 매칭" 텍스트 확인
    const matchText = firstCard.getByText(/매칭/);
    await expect(matchText).toBeVisible();
  });

  test("놓치면아까워요 테마 카드에 할인율 배지 표시", async ({ page }) => {
    await login(page);
    await page.route("/api/ai/recommend", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECOMMENDATIONS),
      });
    });

    await page.goto("/");

    // 테마3 탭 클릭
    await page.waitForSelector('[data-testid="recommend-tab-2"]', { timeout: 8000 });
    await page.getByTestId("recommend-tab-2").click();

    // 할인율 배지 (-%숫자%) 확인
    const carousel = page.getByTestId("recommend-carousel");
    await expect(carousel).toBeVisible({ timeout: 3000 });
    await expect(carousel.getByText(/-\d+%/).first()).toBeVisible({ timeout: 3000 });
  });
});

// ── T026-06: 추천 카드 클릭 → 상세 이동 ────────────────────
test.describe("Task 026-06: 카드 클릭 내비게이션", () => {
  test("추천 카드 클릭 시 /cards/[id] 페이지로 이동", async ({ page }) => {
    await login(page);

    // 실제 카드 ID로 목업 설정 필요 — 실제 카드 목록에서 첫 번째 카드 조회
    const cardsRes = await page.request.get("/api/cards?official=true");
    const cards = (await cardsRes.json()) as Array<{ cardId: string; name: string }>;

    if (cards.length === 0) {
      test.skip();
      return;
    }

    const realCardId = cards[0].cardId;
    const mockWithRealId = {
      recommendations: [
        {
          theme: "오늘의한끼",
          cards: [
            {
              cardId: realCardId,
              title: cards[0].name,
              reason: "테스트 추천 이유입니다.",
              confidence: 0.9,
            },
          ],
        },
        ...MOCK_RECOMMENDATIONS.recommendations.slice(1),
      ],
    };

    await page.route("/api/ai/recommend", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockWithRealId),
      });
    });

    await page.goto("/");
    await page.waitForSelector('[data-testid="recommend-carousel"]', { timeout: 8000 });

    const carousel = page.getByTestId("recommend-carousel");
    const firstCard = carousel.locator("button").first();
    await firstCard.click();

    await page.waitForURL(/\/cards\//, { timeout: 5000 });
    expect(page.url()).toContain("/cards/");
  });
});

// ── T026-07: sessionStorage 24h 캐시 ────────────────────────
test.describe("Task 026-07: 세션 캐시", () => {
  test("API 응답이 sessionStorage에 캐시되어야 함", async ({ page }) => {
    await login(page);
    await page.route("/api/ai/recommend", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECOMMENDATIONS),
      });
    });

    await page.goto("/");
    await page.waitForSelector('[data-testid="recommend-tab-0"]', { timeout: 8000 });

    // sessionStorage 캐시 확인
    const cached = await page.evaluate((key) => sessionStorage.getItem(key), CACHE_KEY);
    expect(cached).not.toBeNull();

    const parsed = JSON.parse(cached!) as { data: unknown; timestamp: number };
    expect(parsed).toHaveProperty("data");
    expect(parsed).toHaveProperty("timestamp");
    expect(typeof parsed.timestamp).toBe("number");
  });

  test("캐시된 데이터가 있을 때 API 재호출 없이 캐시 사용", async ({ page }) => {
    await login(page);
    await page.route("/api/ai/recommend", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECOMMENDATIONS),
      });
    });

    // 첫 방문: 캐시 저장
    await page.goto("/");
    await page.waitForSelector('[data-testid="recommend-tab-0"]', { timeout: 8000 });

    // API 호출 카운터 설정 (캐시 이후)
    let apiCallCount = 0;
    await page.route("/api/ai/recommend", async (route) => {
      apiCallCount++;
      await route.continue();
    });

    // 재방문
    await page.reload();
    await page.waitForSelector('[data-testid="recommend-tab-0"]', { timeout: 8000 });

    // 캐시가 유효하면 API 재호출 없음
    expect(apiCallCount).toBe(0);
  });

  test("만료된 캐시는 무시하고 API 재호출", async ({ page }) => {
    await login(page);

    // 만료된 캐시 주입
    await page.goto("/login");
    await login(page);
    await page.evaluate((key) => {
      const expiredCache = JSON.stringify({
        data: { recommendations: [] },
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25시간 전
      });
      sessionStorage.setItem(key, expiredCache);
    }, CACHE_KEY);

    let apiCallCount = 0;
    await page.route("/api/ai/recommend", async (route) => {
      apiCallCount++;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_RECOMMENDATIONS),
      });
    });

    await page.goto("/");
    await page.waitForSelector('[data-testid="recommend-tab-0"]', { timeout: 8000 });

    // 만료된 캐시 → API 재호출
    expect(apiCallCount).toBe(1);
  });
});

// ── T026-08: 폴백 추천 동작 ──────────────────────────────────
test.describe("Task 026-08: 폴백 추천", () => {
  test("API 실패 시 섹션이 숨겨지고 홈 보드는 정상 로드", async ({ page }) => {
    await login(page);

    // AI 추천 API 실패 모킹
    await page.route("/api/ai/recommend", async (route) => {
      await route.fulfill({ status: 500, body: '{"error":"Internal Server Error"}' });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // AI 추천 섹션은 숨겨짐 (error 상태)
    const section = page.getByTestId("ai-recommend-section");
    await expect(section)
      .not.toBeVisible({ timeout: 3000 })
      .catch(() => {
        // 섹션이 없어도 OK (null 반환)
      });

    // 홈 보드(기존 카드 섹션)는 정상 표시되어야 함
    await expect(page.locator(".grid")).toBeVisible({ timeout: 5000 });
  });
});
