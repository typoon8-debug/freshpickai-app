# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: task044-item-detail.spec.ts >> Task 044: 상품 상세 페이지 >> TC01 - 헤더: 상품상세 타이틀 + 뒤로가기 + 장바구니
- Location: e2e\task044-item-detail.spec.ts:57:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: '뒤로가기' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: '뒤로가기' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - main [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - button "뒤로가기" [ref=e6]:
            - img [ref=e7]
          - generic [ref=e9]: 상품상세
          - img [ref=e10]
          - link "장바구니" [ref=e12] [cursor=pointer]:
            - /url: /cart
            - img [ref=e13]
        - img "샘표 티아시아 게살 푸팟퐁 커리 170g" [ref=e18]
        - generic [ref=e19]:
          - paragraph [ref=e20]: 롯데슈퍼구리인창점
          - heading "샘표 티아시아 게살 푸팟퐁 커리 170g" [level=1] [ref=e21]
          - generic [ref=e22]:
            - generic [ref=e23]: 간편식
            - generic [ref=e24]: 태국음식
            - generic [ref=e25]: 커리
            - generic [ref=e26]: 혼밥
            - generic [ref=e27]: 캠핑간식
            - generic [ref=e28]: 밥반찬
            - generic [ref=e29]: 즉석밥
            - generic [ref=e30]: 라면대체
          - generic [ref=e33]: 3,980원
        - generic [ref=e36]:
          - paragraph [ref=e37]:
            - img [ref=e38]
            - text: AI 추천 문구
          - paragraph [ref=e41]: 태국의 맛, 집에서 단 3분이면 완성! 🍜 게살 푸팟퐁커리로 마치 방콕 야시장에 온 듯한 경험을 해보세요. 샘표만의 정교한 맛의 밸런스로 복잡한 향신료도 부담 없이 즐길 수 있어요. 냉장고에 하나씩 준비해두고 피곤한 날 밥에 얹기만 하면 끝! 지금 담아보세요!
        - generic [ref=e42]:
          - heading "AI 제품 설명" [level=2] [ref=e43]:
            - img [ref=e44]
            - text: AI 제품 설명
          - generic [ref=e47]:
            - generic [ref=e48]:
              - heading "이런 제품이에요" [level=3] [ref=e49]
              - paragraph [ref=e50]: 태국 전통 요리 푸팟퐁커리를 샘표의 노하우로 담아낸 즉석 커리입니다. 게살의 풍미와 향긋한 향신료가 어우러져 밥이나 면과 곁들이기 좋습니다.
            - generic [ref=e51]:
              - heading "보관 & 활용 팁" [level=3] [ref=e52]
              - paragraph [ref=e53]: 실온 보관이 가능하며, 데워 바로 즐길 수 있어 간편합니다. 흰쌀밥에 얹어 먹거나 국수, 우동과 함께해도 잘 어울립니다. 캠핑이나 야외 활동 시 휴대하기 좋은 편의식입니다.
        - paragraph [ref=e55]:
          - img [ref=e56]
          - text: AI 분석 정보 · 신뢰도 62% · 2026. 5. 15.
        - group [ref=e60]:
          - generic "상품 상세정보" [ref=e61] [cursor=pointer]:
            - generic [ref=e62]: 상품 상세정보
            - img [ref=e63]
          - generic [ref=e66]:
            - img "샘표 티아시아 게살 푸팟퐁 커리 170g 상세 이미지 1" [ref=e68]
            - img "샘표 티아시아 게살 푸팟퐁 커리 170g 상세 이미지 2" [ref=e70]
            - img "샘표 티아시아 게살 푸팟퐁 커리 170g 상세 이미지 3" [ref=e72]
        - group [ref=e73]:
          - generic "상품 고시 정보" [ref=e74] [cursor=pointer]:
            - generic [ref=e75]: 상품 고시 정보
            - img [ref=e76]
        - group [ref=e78]:
          - generic "배달안내" [ref=e79] [cursor=pointer]:
            - generic [ref=e80]: 배달안내
            - img [ref=e81]
        - group [ref=e83]:
          - generic "교환/반품 안내" [ref=e84] [cursor=pointer]:
            - generic [ref=e85]: 교환/반품 안내
            - img [ref=e86]
        - generic [ref=e89]:
          - heading "비슷한 상품" [level=2] [ref=e90]
          - generic [ref=e91]:
            - link "오뚜기 종로식 도가니탕 500g 장바구니 담기 오뚜기 종로식 도가니탕 500g 9,080원" [ref=e92] [cursor=pointer]:
              - /url: /category/2593c19d-feb4-43be-b62a-7354e41f00ce
              - generic [ref=e93]:
                - img "오뚜기 종로식 도가니탕 500g" [ref=e94]
                - button "장바구니 담기" [ref=e95]:
                  - img [ref=e96]
              - paragraph [ref=e97]: 오뚜기 종로식 도가니탕 500g
              - paragraph [ref=e98]: 9,080원
            - link "샘표 티아시아 치킨 마크니 커리 170g 장바구니 담기 샘표 티아시아 치킨 마크니 커리 170g 3,980원" [ref=e99] [cursor=pointer]:
              - /url: /category/bce4c8f8-89fc-4f18-b743-c06c2720b1a6
              - generic [ref=e100]:
                - img "샘표 티아시아 치킨 마크니 커리 170g" [ref=e101]
                - button "장바구니 담기" [ref=e102]:
                  - img [ref=e103]
              - paragraph [ref=e104]: 샘표 티아시아 치킨 마크니 커리 170g
              - paragraph [ref=e105]: 3,980원
            - link "오뚜기 3분 카레 순한맛 200g 장바구니 담기 오뚜기 3분 카레 순한맛 200g 2,350원" [ref=e106] [cursor=pointer]:
              - /url: /category/9c809949-912b-4560-bdcd-985e45cf44e1
              - generic [ref=e107]:
                - img "오뚜기 3분 카레 순한맛 200g" [ref=e108]
                - button "장바구니 담기" [ref=e109]:
                  - img [ref=e110]
              - paragraph [ref=e111]: 오뚜기 3분 카레 순한맛 200g
              - paragraph [ref=e112]: 2,350원
            - link "오뚜기 3분 쇠고기 카레 200g 장바구니 담기 오뚜기 3분 쇠고기 카레 200g 2,350원" [ref=e113] [cursor=pointer]:
              - /url: /category/a2553321-fa7d-4a2a-948c-52473fccc963
              - generic [ref=e114]:
                - img "오뚜기 3분 쇠고기 카레 200g" [ref=e115]
                - button "장바구니 담기" [ref=e116]:
                  - img [ref=e117]
              - paragraph [ref=e118]: 오뚜기 3분 쇠고기 카레 200g
              - paragraph [ref=e119]: 2,350원
            - link "CJ 비비고 소고기 듬뿍 육개장 460g 장바구니 담기 CJ 비비고 소고기 듬뿍 육개장 460g 8,020원" [ref=e120] [cursor=pointer]:
              - /url: /category/00176369-ce49-4b7a-9a81-3e00e0ac605e
              - generic [ref=e121]:
                - img "CJ 비비고 소고기 듬뿍 육개장 460g" [ref=e122]
                - button "장바구니 담기" [ref=e123]:
                  - img [ref=e124]
              - paragraph [ref=e125]: CJ 비비고 소고기 듬뿍 육개장 460g
              - paragraph [ref=e126]: 8,020원
            - link "동원 양반 차돌 육개장 460G 장바구니 담기 동원 양반 차돌 육개장 460G 5,980원" [ref=e127] [cursor=pointer]:
              - /url: /category/7f9653d7-755a-4050-aa26-d2c8e961626d
              - generic [ref=e128]:
                - img "동원 양반 차돌 육개장 460G" [ref=e129]
                - button "장바구니 담기" [ref=e130]:
                  - img [ref=e131]
              - paragraph [ref=e132]: 동원 양반 차돌 육개장 460G
              - paragraph [ref=e133]: 5,980원
            - link "CJ 비비고 사골곰탕 500g 장바구니 담기 CJ 비비고 사골곰탕 500g 2,180원" [ref=e134] [cursor=pointer]:
              - /url: /category/c53fbdea-423b-448f-aef7-7123d7539cce
              - generic [ref=e135]:
                - img "CJ 비비고 사골곰탕 500g" [ref=e136]
                - button "장바구니 담기" [ref=e137]:
                  - img [ref=e138]
              - paragraph [ref=e139]: CJ 비비고 사골곰탕 500g
              - paragraph [ref=e140]: 2,180원
            - link "오뚜기 카레분말 약간매운맛 100g 장바구니 담기 오뚜기 카레분말 약간매운맛 100g 2,390원" [ref=e141] [cursor=pointer]:
              - /url: /category/3920a352-c8be-4097-9f51-c170432f045e
              - generic [ref=e142]:
                - img "오뚜기 카레분말 약간매운맛 100g" [ref=e143]
                - button "장바구니 담기" [ref=e144]:
                  - img [ref=e145]
              - paragraph [ref=e146]: 오뚜기 카레분말 약간매운맛 100g
              - paragraph [ref=e147]: 2,390원
            - link "샘표 티아시아 마크니 분말커리 100g 장바구니 담기 샘표 티아시아 마크니 분말커리 100g 3,980원" [ref=e148] [cursor=pointer]:
              - /url: /category/1eec87a1-ac6d-4b61-b44f-265e5de4fc3e
              - generic [ref=e149]:
                - img "샘표 티아시아 마크니 분말커리 100g" [ref=e150]
                - button "장바구니 담기" [ref=e151]:
                  - img [ref=e152]
              - paragraph [ref=e153]: 샘표 티아시아 마크니 분말커리 100g
              - paragraph [ref=e154]: 3,980원
            - link "요리하다 분식집 떡볶이 340G 장바구니 담기 요리하다 분식집 떡볶이 340G 2,990원" [ref=e155] [cursor=pointer]:
              - /url: /category/34a4b943-7c86-46ec-8d66-29dc557d75ed
              - generic [ref=e156]:
                - img "요리하다 분식집 떡볶이 340G" [ref=e157]
                - button "장바구니 담기" [ref=e158]:
                  - img [ref=e159]
              - paragraph [ref=e160]: 요리하다 분식집 떡볶이 340G
              - paragraph [ref=e161]: 2,990원
        - generic [ref=e163]:
          - generic [ref=e164]:
            - heading "구매 리뷰 (0)" [level=2] [ref=e165]
            - button "✏️ 리뷰 작성" [ref=e166]
          - paragraph [ref=e167]: 아직 리뷰가 없어요. 첫 번째 리뷰를 작성해보세요!
        - generic [ref=e168]:
          - paragraph [ref=e169]: 롯데슈퍼구리인창점
          - paragraph [ref=e170]: 대표자 지찬영
          - paragraph [ref=e171]: 사업자등록번호 773-21-01951
          - paragraph [ref=e172]: 경기 구리시 동구릉로85번길 49
          - paragraph [ref=e173]: Tel 010-5713-2588
        - generic [ref=e175]:
          - button "장바구니 담기" [ref=e176]:
            - img [ref=e177]
            - text: 장바구니 담기
          - button "바로 구매" [ref=e181]
    - navigation [ref=e182]:
      - link "홈" [ref=e183] [cursor=pointer]:
        - /url: /
        - img [ref=e184]
        - generic [ref=e187]: 홈
      - link "AI" [ref=e188] [cursor=pointer]:
        - /url: /chat
        - img [ref=e189]
        - generic [ref=e191]: AI
      - link "카테고리" [ref=e192] [cursor=pointer]:
        - /url: /category
        - img [ref=e193]
        - generic [ref=e198]: 카테고리
      - link "가족" [ref=e199] [cursor=pointer]:
        - /url: /family
        - img [ref=e200]
        - generic [ref=e205]: 가족
      - link "메모" [ref=e206] [cursor=pointer]:
        - /url: /memo
        - img [ref=e207]
        - generic [ref=e210]: 메모
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e216] [cursor=pointer]:
    - img [ref=e217]
  - alert [ref=e220]
```

# Test source

```ts
  1   | /**
  2   |  * Task 044 E2E 테스트: 상품 상세 페이지 재개발 검증
  3   |  *
  4   |  * TC01 - 헤더: "상품상세" 타이틀 + 뒤로가기/장바구니 아이콘
  5   |  * TC02 - 상품 이미지 렌더링
  6   |  * TC03 - 상품명(h1) + 가격 표시
  7   |  * TC04 - AI 태그 칩 표시
  8   |  * TC05 - AI 추천 문구 카드 (green 배경)
  9   |  * TC06 - AI 제품 설명 섹션
  10  |  * TC07 - 요리 활용법 섹션
  11  |  * TC08 - 상품 상세정보 아코디언
  12  |  * TC09 - 상품 고시 정보 아코디언
  13  |  * TC10 - 배달안내 아코디언
  14  |  * TC11 - 교환/반품 안내 아코디언
  15  |  * TC12 - 비슷한 상품 섹션
  16  |  * TC13 - 구매 리뷰 섹션
  17  |  * TC14 - 하단 고정 바: 장바구니 담기 + 바로 구매 버튼
  18  |  * TC15 - 장바구니 담기 동작
  19  |  * TC16 - 바로 구매 → /cart 이동
  20  |  */
  21  | 
  22  | import { test, expect } from "@playwright/test";
  23  | import { login } from "./helpers/auth";
  24  | 
  25  | async function getFirstCategoryItemId(page: Parameters<typeof login>[0]): Promise<string | null> {
  26  |   await page.goto("/category");
  27  |   await page.waitForLoadState("domcontentloaded");
  28  |   await page.waitForTimeout(2000);
  29  | 
  30  |   // role=button 이고 cursor-pointer 클래스를 가진 상품 카드
  31  |   const cards = page.locator("div[role='button']").first();
  32  |   if ((await cards.count()) === 0) return null;
  33  | 
  34  |   // click and get URL
  35  |   await cards.click();
  36  |   await page.waitForURL(/\/category\/[^/]+$/, { timeout: 10000 });
  37  |   const url = new URL(page.url());
  38  |   const parts = url.pathname.split("/");
  39  |   return parts[parts.length - 1] ?? null;
  40  | }
  41  | 
  42  | test.describe("Task 044: 상품 상세 페이지", () => {
  43  |   let itemId = "";
  44  | 
  45  |   test.beforeAll(async ({ browser }) => {
  46  |     const page = await browser.newPage();
  47  |     await login(page);
  48  |     const id = await getFirstCategoryItemId(page);
  49  |     if (id) itemId = id;
  50  |     await page.close();
  51  |   });
  52  | 
  53  |   test.beforeEach(async ({ page }) => {
  54  |     await login(page);
  55  |   });
  56  | 
  57  |   test("TC01 - 헤더: 상품상세 타이틀 + 뒤로가기 + 장바구니", async ({ page }) => {
  58  |     if (!itemId) {
  59  |       test.skip(true, "itemId 없음");
  60  |       return;
  61  |     }
  62  |     await page.goto(`/category/${itemId}`);
  63  |     await page.waitForLoadState("domcontentloaded");
  64  |     await page.waitForTimeout(1000);
  65  | 
  66  |     await expect(page.getByText("상품상세")).toBeVisible({ timeout: 10000 });
> 67  |     await expect(page.getByRole("link", { name: "뒤로가기" })).toBeVisible();
      |                                                            ^ Error: expect(locator).toBeVisible() failed
  68  |     // aria-label="장바구니" exact match (비슷한 상품 링크와 구분)
  69  |     await expect(page.getByRole("link", { name: "장바구니", exact: true })).toBeVisible();
  70  |   });
  71  | 
  72  |   test("TC02 - 상품 이미지 렌더링", async ({ page }) => {
  73  |     if (!itemId) {
  74  |       test.skip(true, "itemId 없음");
  75  |       return;
  76  |     }
  77  |     await page.goto(`/category/${itemId}`);
  78  |     await page.waitForLoadState("domcontentloaded");
  79  |     await page.waitForTimeout(1000);
  80  | 
  81  |     // img 태그 또는 placeholder 렌더링 확인
  82  |     const img = page.locator("img").first();
  83  |     const placeholder = page.getByText("🛒").first();
  84  |     const hasContent = (await img.count()) > 0 || (await placeholder.count()) > 0;
  85  |     expect(hasContent).toBe(true);
  86  |   });
  87  | 
  88  |   test("TC03 - 상품명(h1) + 가격 표시", async ({ page }) => {
  89  |     if (!itemId) {
  90  |       test.skip(true, "itemId 없음");
  91  |       return;
  92  |     }
  93  |     await page.goto(`/category/${itemId}`);
  94  |     await page.waitForLoadState("domcontentloaded");
  95  |     await page.waitForTimeout(1000);
  96  | 
  97  |     const h1 = page.locator("h1").first();
  98  |     await expect(h1).toBeVisible({ timeout: 10000 });
  99  | 
  100 |     // 가격 "원" 텍스트 확인
  101 |     const priceText = page.getByText(/\d+원/).first();
  102 |     await expect(priceText).toBeVisible({ timeout: 5000 });
  103 |   });
  104 | 
  105 |   test("TC04 - AI 태그 칩 표시 (있는 경우)", async ({ page }) => {
  106 |     if (!itemId) {
  107 |       test.skip(true, "itemId 없음");
  108 |       return;
  109 |     }
  110 |     await page.goto(`/category/${itemId}`);
  111 |     await page.waitForLoadState("domcontentloaded");
  112 |     await page.waitForTimeout(1000);
  113 | 
  114 |     // 태그 컨테이너 존재 확인 (없을 수도 있으므로 optional)
  115 |     const tagContainer = page.locator("div.overflow-x-auto").first();
  116 |     if ((await tagContainer.count()) > 0) {
  117 |       const chips = tagContainer.locator("span");
  118 |       const chipCount = await chips.count();
  119 |       test.info().annotations.push({ type: "info", description: `AI 태그 수: ${chipCount}개` });
  120 |     }
  121 |     // 페이지 자체가 정상 로드됨을 확인
  122 |     await expect(page.locator("body")).toBeVisible();
  123 |   });
  124 | 
  125 |   test("TC05 - AI 추천 문구 카드 (있는 경우)", async ({ page }) => {
  126 |     if (!itemId) {
  127 |       test.skip(true, "itemId 없음");
  128 |       return;
  129 |     }
  130 |     await page.goto(`/category/${itemId}`);
  131 |     await page.waitForLoadState("domcontentloaded");
  132 |     await page.waitForTimeout(1000);
  133 | 
  134 |     const aiCard = page.getByText("AI 추천 문구");
  135 |     if ((await aiCard.count()) > 0) {
  136 |       await expect(aiCard.first()).toBeVisible({ timeout: 5000 });
  137 |     }
  138 |     await expect(page.locator("body")).toBeVisible();
  139 |   });
  140 | 
  141 |   test("TC06 - AI 제품 설명 섹션 (있는 경우)", async ({ page }) => {
  142 |     if (!itemId) {
  143 |       test.skip(true, "itemId 없음");
  144 |       return;
  145 |     }
  146 |     await page.goto(`/category/${itemId}`);
  147 |     await page.waitForLoadState("domcontentloaded");
  148 |     await page.waitForTimeout(1000);
  149 | 
  150 |     const aiDesc = page.getByText("AI 제품 설명");
  151 |     if ((await aiDesc.count()) > 0) {
  152 |       await expect(aiDesc.first()).toBeVisible({ timeout: 5000 });
  153 |     }
  154 |     await expect(page.locator("body")).toBeVisible();
  155 |   });
  156 | 
  157 |   test("TC07 - 요리 활용법 섹션 (있는 경우)", async ({ page }) => {
  158 |     if (!itemId) {
  159 |       test.skip(true, "itemId 없음");
  160 |       return;
  161 |     }
  162 |     await page.goto(`/category/${itemId}`);
  163 |     await page.waitForLoadState("domcontentloaded");
  164 |     await page.waitForTimeout(1000);
  165 | 
  166 |     const cookSection = page.getByText("요리 활용법");
  167 |     if ((await cookSection.count()) > 0) {
```