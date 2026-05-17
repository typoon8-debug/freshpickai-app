# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: task033.spec.ts >> Task033: 성능 최적화 >> NoteWriteDrawer가 카드 상세에서 동적으로 로드된다
- Location: e2e\task033.spec.ts:252:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic:
  - generic:
    - main:
      - generic:
        - button:
          - img
        - generic:
          - generic: 제철한상
          - generic: 봄 딸기 샐러드
        - button:
          - img
      - generic:
        - generic:
          - button:
            - img
            - text: 이 카드로 요리하기
          - button:
            - img
        - generic:
          - generic:
            - generic:
              - generic:
                - generic:
                  - img
                - generic:
                  - heading [level=2]: 봄 딸기 샐러드
                  - paragraph: 5월 제철 딸기로 만드는 상큼한 샐러드. 루꼴라와 발사믹 드레싱.
                - generic:
                  - generic:
                    - img
                    - text: 10분
                  - generic:
                    - img
                    - text: 240kcal
                  - generic:
                    - generic:
                      - generic: 건강점수
                      - generic: 건강 90
                - generic:
                  - img
                  - text: 재료 보기
            - generic:
              - generic:
                - generic:
                  - heading [level=3]: 재료 목록
                - generic:
                  - generic:
                    - generic:
                      - generic: 🍓
                      - generic:
                        - paragraph: 딸기
                        - paragraph: 200 g
                    - generic:
                      - generic: 9,990원
                      - generic: 6,000원
                      - generic:
                        - button [disabled]:
                          - img
                        - generic: "1"
                        - button:
                          - img
                  - generic:
                    - generic:
                      - generic: 🥬
                      - generic:
                        - paragraph: 루꼴라
                        - paragraph: 80 g
                    - generic:
                      - generic: 4,490원
                      - generic:
                        - button [disabled]:
                          - img
                        - generic: "1"
                        - button:
                          - img
                  - generic:
                    - generic:
                      - generic: 🫙
                      - generic:
                        - paragraph: 발사믹 드레싱
                        - paragraph: 2 tbsp
                    - generic:
                      - generic: 9,980원
                      - generic:
                        - button [disabled]:
                          - img
                        - generic: "1"
                        - button:
                          - img
                  - generic:
                    - generic:
                      - generic: 🧀
                      - generic:
                        - paragraph: 리코타 치즈
                        - paragraph: 50 g
                    - generic:
                      - generic: 5,990원
                      - generic:
                        - button [disabled]:
                          - img
                        - generic: "1"
                        - button:
                          - img
                - generic:
                  - img
                  - text: 앞면 보기
        - generic:
          - heading [level=3]: 건강 점수
          - generic:
            - generic:
              - generic:
                - generic: 저속노화 지수항산화·가공도·식이섬유
                - generic: 4/10
            - generic:
              - generic:
                - generic: 혈당 지수GI 지수 기반
                - generic: 6/10
            - generic:
              - generic:
                - generic: 영양 밸런스단백질·탄수화물·지방 비율
                - generic: 2/10
        - generic:
          - generic:
            - heading [level=3]: 가격 비교
          - generic:
            - generic:
              - generic: 홈메이드 (이 카드)
              - generic: 9,000원
            - generic:
              - generic: 외식 평균
              - generic: 19,800원
            - generic:
              - generic: 배달 평균
              - generic: 16,650원
            - generic:
              - generic: 카페 브런치
              - generic: 14,400원
          - paragraph: 외식 대비 최대 55% 절약
        - generic:
          - heading [level=3]: 구성 음식
          - generic:
            - generic:
              - generic:
                - generic:
                  - paragraph: 봄 딸기 샐러드
                  - paragraph: 5월 제철 딸기로 만드는 상큼한 샐러드. 루꼴라와 발사믹 드레싱.
                  - paragraph: ⏱ 10분
              - generic:
                - button:
                  - generic: 🍓
                  - generic:
                    - generic:
                      - generic: 딸기
                      - generic: 200g
                    - paragraph: 국산 딸기 1kg, 냉동실의 건강한 간식이 되다! 😋 신선한 맛과 영양을 그대로 담아 언제든 꺼내 먹을 수 있어요. 스무디, 디저트, 베이킹까지 뭐든 가능. 설탕 무첨가라 더 깨끗하고, 대용량이라 더 저렴. 지금 바로 담아보세요!
                    - generic:
                      - generic: 냉동딸기
                      - generic: 국산
                      - generic: 대용량
                  - generic:
                    - paragraph: 9,990원
                - button:
                  - generic: 🥬
                  - generic:
                    - generic:
                      - generic: 루꼴라
                      - generic: 80g
                    - paragraph: 독특한 향과 톡 쏘는 맛! 프리미엄 루꼴라로 샐러드를 업그레이드하세요. 50g 한 팩으로 신선한 맛을 그대로 담아냈어요. 지금 담아보세요!
                    - generic:
                      - generic: 신선채소
                      - generic: 루꼴라
                      - generic: 샐러드재료
                  - generic:
                    - paragraph: 4,490원
                - button:
                  - generic: 🫙
                  - generic:
                    - generic:
                      - generic: 발사믹 드레싱
                      - generic: 2tbsp
                    - paragraph: 진한 감식초의 우아한 맛, 올리타리아 발사믹 글레이즈! 이탈리안 요리의 필수 소스로 250ML 한 병이면 수십 끼를 완성할 수 있어요. 스테이크부터 샐러드까지, 한두 방울로 식탁을 업그레이드하는 매력. 지금 담아 당신의 요리 솜씨를 뽐내보세요!
                    - generic:
                      - generic: 발사믹
                      - generic: 이탈리안소스
                      - generic: 감식초
                  - generic:
                    - paragraph: 9,980원
                - button:
                  - generic: 🧀
                  - generic:
                    - generic:
                      - generic: 리코타 치즈
                      - generic: 50g
                    - paragraph: 덴마크의 신선함을 담은 리코타 치즈! 부드러운 식감에 순한 맛으로 샐러드, 디저트, 간식까지 다양하게 즐길 수 있어요. 150g 한 끼 사이즈로 신선함을 놓치지 마세요. 지금 담아보세요!
                    - generic:
                      - generic: 유제품
                      - generic: 리코타치즈
                      - generic: 덴마크산
                  - generic:
                    - paragraph: 5,990원
        - generic:
          - generic:
            - generic: 🌿
            - generic:
              - paragraph: 재료 정보
              - paragraph: 손질법·계량 힌트·대체 재료 정보를 준비 중입니다.
        - generic:
          - generic:
            - heading [level=3]:
              - text: 사용자 노트
              - generic: (0)
            - button [active]:
              - img
              - text: 내 노트 남기기
          - paragraph: 아직 노트가 없어요. 첫 번째 노트를 남겨보세요!
      - generic:
        - generic:
          - link:
            - /url: /chat
            - img
            - text: AI 변형하기
          - button:
            - img
            - text: 30,450원 모두 담기
    - navigation:
      - link:
        - /url: /
        - img
        - generic: 홈
      - link:
        - /url: /chat
        - img
        - generic: AI
      - link:
        - /url: /category
        - img
        - generic: 카테고리
      - link:
        - /url: /family
        - img
        - generic: 가족
      - link:
        - /url: /memo
        - img
        - generic: 메모
  - region "Notifications alt+T"
  - generic [ref=e5] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e6]:
      - img [ref=e7]
    - generic [ref=e10]:
      - button "Open issues overlay" [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]: "0"
          - generic [ref=e14]: "1"
        - generic [ref=e15]: Issue
      - button "Collapse issues badge" [ref=e16]:
        - img [ref=e17]
  - alert
  - dialog [ref=e20]:
    - generic [ref=e22]:
      - heading "노트 남기기" [level=3] [ref=e23]
      - generic [ref=e24]:
        - button "팁" [ref=e25]
        - button "후기" [ref=e26]
        - button "질문" [ref=e27]
      - textbox "요리 팁이나 재료 대체 방법을 적어주세요" [ref=e28]
      - generic [ref=e29]:
        - checkbox "AI 학습에 동의합니다 (선택). 도움이 많이 된 노트는 레시피 개선에 활용될 수 있어요." [ref=e30]
        - generic [ref=e31]: AI 학습에 동의합니다 (선택). 도움이 많이 된 노트는 레시피 개선에 활용될 수 있어요.
      - button "노트 저장하기" [disabled] [ref=e32]
```

# Test source

```ts
  191 |     console.log(`✅ 홈 화면 DOMContentLoaded: ${elapsed}ms`);
  192 |     expect(elapsed).toBeLessThan(10000);
  193 |   });
  194 | 
  195 |   test("카드 상세 화면이 로드된다 (직접 URL 탐색)", async ({ page }) => {
  196 |     // 먼저 홈에서 카드 ID를 추출하거나, 직접 URL로 테스트
  197 |     await page.goto("/");
  198 |     await page.waitForLoadState("networkidle");
  199 | 
  200 |     // 카드 그리드에서 첫 번째 카드 요소 찾기
  201 |     const cardEl = page.locator(".grid-cols-2 .overflow-hidden.cursor-pointer").first();
  202 |     const hasCard = await cardEl.isVisible({ timeout: 8000 }).catch(() => false);
  203 | 
  204 |     if (!hasCard) {
  205 |       // 카드가 없으면 /cards 경로로 직접 이동 테스트
  206 |       await page.goto("/cards/new");
  207 |       // 404 또는 리다이렉트가 아닌 페이지가 로드되면 OK
  208 |       await expect(page.locator("main").first()).toBeVisible({ timeout: 10000 });
  209 |       return;
  210 |     }
  211 | 
  212 |     // 카드를 클릭해서 상세 페이지로 이동
  213 |     await cardEl.click({ force: true });
  214 |     await page.waitForTimeout(2000);
  215 |     await page.waitForLoadState("networkidle");
  216 | 
  217 |     // 카드 상세 페이지이거나, 최소한 페이지가 로드됨
  218 |     const url = page.url();
  219 |     console.log(`✅ 카드 클릭 후 URL: ${url}`);
  220 |     await expect(page.locator("main").first()).toBeVisible({ timeout: 10000 });
  221 |   });
  222 | 
  223 |   test("AI 채팅 화면이 로드된다", async ({ page }) => {
  224 |     const start = Date.now();
  225 |     await page.goto("/chat");
  226 |     await page.waitForLoadState("networkidle");
  227 |     const elapsed = Date.now() - start;
  228 | 
  229 |     // 채팅 입력창 확인
  230 |     await expect(
  231 |       page.locator("textarea, input[type='text'], [data-testid='chat-input']").first()
  232 |     ).toBeVisible({ timeout: 10000 });
  233 | 
  234 |     console.log(`✅ AI 채팅 화면 로드: ${elapsed}ms`);
  235 |   });
  236 | 
  237 |   test("장바구니 화면이 로드된다", async ({ page }) => {
  238 |     const start = Date.now();
  239 |     await page.goto("/cart");
  240 |     await page.waitForLoadState("networkidle");
  241 |     const elapsed = Date.now() - start;
  242 | 
  243 |     // 장바구니 페이지 로드 확인
  244 |     await expect(page.locator("main").first()).toBeVisible({ timeout: 10000 });
  245 |     const title = await page.title();
  246 |     expect(title).toContain("FreshPick");
  247 | 
  248 |     console.log(`✅ 장바구니 화면 로드: ${elapsed}ms`);
  249 |   });
  250 | 
  251 |   // ─── 6. NoteWriteDrawer dynamic import ─────────────────────────────────────
  252 |   test("NoteWriteDrawer가 카드 상세에서 동적으로 로드된다", async ({ page }) => {
  253 |     await page.goto("/");
  254 |     await page.waitForLoadState("load");
  255 | 
  256 |     const cardEl = page.locator(".grid-cols-2 .overflow-hidden.cursor-pointer").first();
  257 |     const hasCard = await cardEl.isVisible({ timeout: 8000 }).catch(() => false);
  258 | 
  259 |     if (!hasCard) {
  260 |       test.skip();
  261 |       return;
  262 |     }
  263 | 
  264 |     await cardEl.click({ force: true });
  265 |     await page.waitForTimeout(2000);
  266 |     await page.waitForLoadState("networkidle");
  267 | 
  268 |     if (!page.url().includes("/cards/")) {
  269 |       // 네비게이션이 안 됐으면 스킵
  270 |       test.skip();
  271 |       return;
  272 |     }
  273 | 
  274 |     // 노트 작성 버튼 찾기
  275 |     const noteBtn = page
  276 |       .locator("button:has-text('노트'), [data-testid='note-write-btn'], button:has-text('메모')")
  277 |       .first();
  278 | 
  279 |     if (await noteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  280 |       await noteBtn.click();
  281 |       await page.waitForTimeout(1500);
  282 | 
  283 |       // drawer가 나타나면 dynamic import 성공
  284 |       const drawerVisible = await page
  285 |         .locator('[role="dialog"], [data-vaul-drawer]')
  286 |         .first()
  287 |         .isVisible()
  288 |         .catch(() => false);
  289 | 
  290 |       console.log(`✅ NoteWriteDrawer dynamic import: ${drawerVisible ? "성공" : "미표시"}`);
> 291 |       expect(drawerVisible).toBe(true);
      |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  292 |     } else {
  293 |       console.log("ℹ️ 노트 버튼 없음 — 스킵");
  294 |       test.skip();
  295 |     }
  296 |   });
  297 | 
  298 |   // ─── 7. 종합 성능 메트릭 ────────────────────────────────────────────────────
  299 |   test("홈 화면 TTFB + 로드 시간 측정 (개발 서버 참고치)", async ({ page }) => {
  300 |     const navStart = Date.now();
  301 |     await page.goto("/");
  302 |     await page.waitForLoadState("load");
  303 |     const totalTime = Date.now() - navStart;
  304 | 
  305 |     const ttfb = await page.evaluate(() => {
  306 |       const nav = performance.getEntriesByType("navigation")[0] as
  307 |         | PerformanceNavigationTiming
  308 |         | undefined;
  309 |       if (!nav) return null;
  310 |       return nav.responseStart > 0 ? Math.round(nav.responseStart - nav.requestStart) : null;
  311 |     });
  312 | 
  313 |     console.log(`📊 홈 화면 성능 지표: TTFB=${ttfb ?? "N/A"}ms, 총=${totalTime}ms`);
  314 | 
  315 |     // 개발 서버 기준 참고치 (프로덕션은 더 빠름)
  316 |     expect(totalTime).toBeLessThan(15000);
  317 |   });
  318 | 
  319 |   // ─── 8. optimizePackageImports @dnd-kit ────────────────────────────────────
  320 |   test("섹션 관리 페이지가 로드된다 (dnd-kit 번들 최적화 간접 검증)", async ({ page }) => {
  321 |     await page.goto("/sections");
  322 |     await page.waitForLoadState("networkidle");
  323 | 
  324 |     // 섹션 목록 페이지 로드 확인
  325 |     await expect(page.locator("[data-testid='section-list'], main").first()).toBeVisible({
  326 |       timeout: 10000,
  327 |     });
  328 | 
  329 |     // 페이지에 에러가 없는지 확인
  330 |     const hasError = await page
  331 |       .locator("text=Error, text=에러, text=500")
  332 |       .first()
  333 |       .isVisible()
  334 |       .catch(() => false);
  335 |     expect(hasError).toBe(false);
  336 |     console.log("✅ 섹션 관리 페이지 로드 성공 (dnd-kit optimizePackageImports)");
  337 |   });
  338 | });
  339 | 
```