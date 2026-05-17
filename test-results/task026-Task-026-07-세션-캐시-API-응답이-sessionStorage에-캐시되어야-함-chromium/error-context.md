# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: task026.spec.ts >> Task 026-07: 세션 캐시 >> API 응답이 sessionStorage에 캐시되어야 함
- Location: e2e\task026.spec.ts:404:7

# Error details

```
Error: expect(received).not.toBeNull()

Received: null
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - main [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]: FreshPick AI
        - generic [ref=e6]:
          - link "찜 목록" [ref=e7] [cursor=pointer]:
            - /url: /wishlist
            - img [ref=e8]
          - link "장바구니" [ref=e10] [cursor=pointer]:
            - /url: /cart
            - img [ref=e11]
          - link "마이프레시" [ref=e15] [cursor=pointer]:
            - /url: /profile
            - img [ref=e16]
      - main [ref=e19]:
        - generic [ref=e23]:
          - generic [ref=e24]:
            - img [ref=e25]
            - generic [ref=e28]: 오늘의 큐레이팅
          - generic [ref=e29]:
            - heading "정통 태국 팟타이" [level=2] [ref=e30]
            - paragraph [ref=e31]: 현지 소스로 완성하는 정통의 맛
          - generic [ref=e32]:
            - generic [ref=e33]:
              - img [ref=e34]
              - text: 취향 매칭 80%
            - generic [ref=e37]: 새콤
          - link "지금 보기" [ref=e38] [cursor=pointer]:
            - /url: /cards/ca000007-0007-4000-8000-000000000001
        - generic [ref=e39]:
          - generic [ref=e40]:
            - img [ref=e41]
            - heading "AI 테마 추천" [level=2] [ref=e44]
          - generic [ref=e45]:
            - button "🍽️ 오늘의한끼" [ref=e46]
            - button "🌿 지금이적기" [ref=e47]
            - button "⚡ 놓치면아까워요" [ref=e48]
            - button "💝 다시만나볼까요" [ref=e49]
            - button "✨ 새로들어왔어요" [ref=e50]
          - generic [ref=e51]:
            - button "🍽️ 제육볶음 정식 가족 매니저님을 위한 든든한 한 끼입니다. 30분 이내로 준비 가능합니다. 92% 매칭" [ref=e52]:
              - generic [ref=e54]: 🍽️
              - generic [ref=e55]:
                - paragraph [ref=e56]: 제육볶음 정식
                - paragraph [ref=e57]: 가족 매니저님을 위한 든든한 한 끼입니다. 30분 이내로 준비 가능합니다.
                - generic [ref=e58]:
                  - img [ref=e59]
                  - generic [ref=e62]: 92% 매칭
            - button "🍽️ 된장찌개 정식 건강한 발효 식품으로 균형 잡힌 영양을 제공합니다. 온 가족이 좋아하는 메뉴입니다. 87% 매칭" [ref=e63]:
              - generic [ref=e65]: 🍽️
              - generic [ref=e66]:
                - paragraph [ref=e67]: 된장찌개 정식
                - paragraph [ref=e68]: 건강한 발효 식품으로 균형 잡힌 영양을 제공합니다. 온 가족이 좋아하는 메뉴입니다.
                - generic [ref=e69]:
                  - img [ref=e70]
                  - generic [ref=e73]: 87% 매칭
            - button "🍽️ 비빔밥 세트 다채로운 채소로 영양 균형을 맞춘 건강식입니다. 85% 매칭" [ref=e74]:
              - generic [ref=e76]: 🍽️
              - generic [ref=e77]:
                - paragraph [ref=e78]: 비빔밥 세트
                - paragraph [ref=e79]: 다채로운 채소로 영양 균형을 맞춘 건강식입니다.
                - generic [ref=e80]:
                  - img [ref=e81]
                  - generic [ref=e84]: 85% 매칭
        - generic [ref=e85]:
          - generic [ref=e86]:
            - button "전체" [ref=e87]
            - button "흑백요리사" [ref=e88]
            - button "한 끼" [ref=e89]
            - button "엄마손맛" [ref=e90]
            - button "드라마한끼" [ref=e91]
            - button "혼웰빙" [ref=e92]
            - button "제철한상" [ref=e93]
            - button "글로벌" [ref=e94]
            - button "K디저트" [ref=e95]
            - button "간식팩" [ref=e96]
            - button "홈시네마" [ref=e97]
            - button "🧊 냉장고" [ref=e98]
          - link "섹션 편집" [ref=e99] [cursor=pointer]:
            - /url: /sections
            - img [ref=e100]
        - generic [ref=e103]:
          - button "전체" [ref=e104]
          - button "식사형" [ref=e105]
          - button "간식·디저트" [ref=e106]
          - button "홈시네마" [ref=e107]
        - generic [ref=e108]:
          - button "✨ 비건" [ref=e109]
          - button "✨ 채식" [ref=e110]
          - button "✨ 저칼로리" [ref=e111]
          - button "✨ 고단백" [ref=e112]
          - button "✨ 저당" [ref=e113]
          - button "✨ 글루텐프리" [ref=e114]
        - generic [ref=e115]:
          - generic [ref=e116] [cursor=pointer]:
            - generic [ref=e117]:
              - img "봄 딸기 샐러드" [ref=e118]
              - generic [ref=e119]: 제철K팜
              - generic [ref=e120]:
                - img [ref=e121]
                - text: TOP2
            - generic [ref=e123]:
              - generic [ref=e124]:
                - heading "봄 딸기 샐러드" [level=3] [ref=e125]
                - paragraph [ref=e126]: 5월 제철 딸기로 만드는 상큼함
              - generic [ref=e127]:
                - generic [ref=e128]: 상큼
                - generic [ref=e129]: 달콤
                - generic [ref=e130]: 신선한
              - generic [ref=e131]:
                - generic [ref=e133]:
                  - generic [ref=e134]: 건강점수
                  - generic [ref=e135]: 건강 90
                - generic [ref=e138]:
                  - img [ref=e139]
                  - text: 취향 90%
              - paragraph [ref=e142]: 9,000원~
          - generic [ref=e143] [cursor=pointer]:
            - generic [ref=e144]:
              - img "더 글로리 쌀국수" [ref=e145]
              - generic [ref=e146]: 드라마레시피
              - generic [ref=e147]: NEW
            - generic [ref=e148]:
              - generic [ref=e149]:
                - heading "더 글로리 쌀국수" [level=3] [ref=e150]
                - paragraph [ref=e151]: 화제의 드라마 속 위로 한 그릇
              - generic [ref=e152]:
                - generic [ref=e153]: 시원한
                - generic [ref=e154]: 깔끔
                - generic [ref=e155]: 매콤
              - generic [ref=e156]:
                - generic [ref=e158]:
                  - generic [ref=e159]: 건강점수
                  - generic [ref=e160]: 보통 70
                - generic [ref=e163]:
                  - img [ref=e164]
                  - text: 취향 70%
              - paragraph [ref=e167]: 11,000원~
          - generic [ref=e168] [cursor=pointer]:
            - generic [ref=e169]:
              - img "10분 참치 마요 주먹밥" [ref=e170]
              - generic [ref=e171]: 한 끼
              - generic [ref=e172]: NEW
            - generic [ref=e173]:
              - generic [ref=e174]:
                - heading "10분 참치 마요 주먹밥" [level=3] [ref=e175]
                - paragraph [ref=e176]: 바쁜 아침 10분이면 완성
              - generic [ref=e177]:
                - generic [ref=e178]: 고소한
                - generic [ref=e179]: 심플
                - generic [ref=e180]: 빠른
              - generic [ref=e181]:
                - generic [ref=e183]:
                  - generic [ref=e184]: 건강점수
                  - generic [ref=e185]: 보통 70
                - generic [ref=e188]:
                  - img [ref=e189]
                  - text: 취향 70%
              - paragraph [ref=e192]: 5,000원~
          - generic [ref=e193] [cursor=pointer]:
            - generic [ref=e194]:
              - img "청소년 에너지 바" [ref=e195]
              - generic [ref=e196]: 간식팩
              - generic [ref=e197]: NEW
            - generic [ref=e198]:
              - generic [ref=e199]:
                - heading "청소년 에너지 바" [level=3] [ref=e200]
                - paragraph [ref=e201]: 시험기간 집중력 UP 간식
              - generic [ref=e202]:
                - generic [ref=e203]: 달콤
                - generic [ref=e204]: 고소
                - generic [ref=e205]: 바삭
              - generic [ref=e206]:
                - generic [ref=e208]:
                  - generic [ref=e209]: 건강점수
                  - generic [ref=e210]: 보통 60
                - generic [ref=e213]:
                  - img [ref=e214]
                  - text: 취향 60%
              - paragraph [ref=e217]: 6,000원~
          - generic [ref=e218] [cursor=pointer]:
            - generic [ref=e219]:
              - img "발효 곡물 그래놀라 볼" [ref=e220]
              - generic [ref=e221]: 혼웰빙
              - generic [ref=e222]:
                - img [ref=e223]
                - text: TOP3
            - generic [ref=e225]:
              - generic [ref=e226]:
                - heading "발효 곡물 그래놀라 볼" [level=3] [ref=e227]
                - paragraph [ref=e228]: 운동 후 회복 식단
              - generic [ref=e229]:
                - generic [ref=e230]: 고소한
                - generic [ref=e231]: 달콤
                - generic [ref=e232]: 건강한
              - generic [ref=e233]:
                - generic [ref=e235]:
                  - generic [ref=e236]: 건강점수
                  - generic [ref=e237]: 건강 90
                - generic [ref=e240]:
                  - img [ref=e241]
                  - text: 취향 90%
              - paragraph [ref=e244]: 8,000원~
          - generic [ref=e245] [cursor=pointer]:
            - generic [ref=e246]:
              - img "인절미 티라미수" [ref=e247]
              - generic [ref=e248]: K디저트
              - generic [ref=e249]: NEW
            - generic [ref=e250]:
              - generic [ref=e251]:
                - heading "인절미 티라미수" [level=3] [ref=e252]
                - paragraph [ref=e253]: K-디저트의 정수
              - generic [ref=e254]:
                - generic [ref=e255]: 달콤
                - generic [ref=e256]: 쫀득
                - generic [ref=e257]: 고소
              - generic [ref=e258]:
                - generic [ref=e260]:
                  - generic [ref=e261]: 건강점수
                  - generic [ref=e262]: 주의 40
                - generic [ref=e265]:
                  - img [ref=e266]
                  - text: 취향 40%
              - paragraph [ref=e269]: 8,000원~
          - generic [ref=e270] [cursor=pointer]:
            - generic [ref=e271]:
              - img "정통 태국 팟타이" [ref=e272]
              - generic [ref=e273]: 세계한끼
              - generic [ref=e274]: NEW
            - generic [ref=e275]:
              - generic [ref=e276]:
                - heading "정통 태국 팟타이" [level=3] [ref=e277]
                - paragraph [ref=e278]: 현지 소스로 완성하는 정통의 맛
              - generic [ref=e279]:
                - generic [ref=e280]: 새콤
                - generic [ref=e281]: 달콤
                - generic [ref=e282]: 매콤
              - generic [ref=e283]:
                - generic [ref=e285]:
                  - generic [ref=e286]: 건강점수
                  - generic [ref=e287]: 보통 60
                - generic [ref=e290]:
                  - img [ref=e291]
                  - text: 취향 60%
              - paragraph [ref=e294]: 12,000원~
          - generic [ref=e295] [cursor=pointer]:
            - generic [ref=e296]:
              - img "셰프의 갈비찜 정식" [ref=e297]
              - generic [ref=e298]: 흑백요리사
              - generic [ref=e299]: NEW
            - generic [ref=e300]:
              - generic [ref=e301]:
                - heading "셰프의 갈비찜 정식" [level=3] [ref=e302]
                - paragraph [ref=e303]: 방송에서 화제된 그 레시피
              - generic [ref=e304]:
                - generic [ref=e305]: 깊은맛
                - generic [ref=e306]: 짭짤
                - generic [ref=e307]: 달콤
              - generic [ref=e308]:
                - generic [ref=e310]:
                  - generic [ref=e311]: 건강점수
                  - generic [ref=e312]: 보통 70
                - generic [ref=e315]:
                  - img [ref=e316]
                  - text: 취향 70%
              - paragraph [ref=e319]: 18,000원~
          - generic [ref=e320] [cursor=pointer]:
            - generic [ref=e321]:
              - img "로마식 카르보나라" [ref=e322]
              - generic [ref=e323]: 세계한끼
            - generic [ref=e324]:
              - generic [ref=e325]:
                - heading "로마식 카르보나라" [level=3] [ref=e326]
                - paragraph [ref=e327]: 크림 없는 진짜 이탈리안
              - generic [ref=e328]:
                - generic [ref=e329]: 진한
                - generic [ref=e330]: 고소
                - generic [ref=e331]: 크리미
              - generic [ref=e332]:
                - generic [ref=e334]:
                  - generic [ref=e335]: 건강점수
                  - generic [ref=e336]: 보통 60
                - generic [ref=e339]:
                  - img [ref=e340]
                  - text: 취향 60%
              - paragraph [ref=e343]: 14,000원~
          - generic [ref=e344] [cursor=pointer]:
            - generic [ref=e345]:
              - img "일본식 돈코츠 라멘" [ref=e346]
              - generic [ref=e347]: 세계한끼
            - generic [ref=e348]:
              - generic [ref=e349]:
                - heading "일본식 돈코츠 라멘" [level=3] [ref=e350]
                - paragraph [ref=e351]: 12시간 우린 진한 육수
              - generic [ref=e352]:
                - generic [ref=e353]: 진한
                - generic [ref=e354]: 고소
                - generic [ref=e355]: 짭짤
              - generic [ref=e356]:
                - generic [ref=e358]:
                  - generic [ref=e359]: 건강점수
                  - generic [ref=e360]: 보통 60
                - generic [ref=e363]:
                  - img [ref=e364]
                  - text: 취향 60%
              - paragraph [ref=e367]: 13,000원~
          - generic [ref=e368] [cursor=pointer]:
            - generic [ref=e369]:
              - img "쑥 인절미 파르페" [ref=e370]
              - generic [ref=e371]: K디저트
            - generic [ref=e372]:
              - generic [ref=e373]:
                - heading "쑥 인절미 파르페" [level=3] [ref=e374]
                - paragraph [ref=e375]: 전통과 현대가 만나는 파르페
              - generic [ref=e376]:
                - generic [ref=e377]: 쌉쌀
                - generic [ref=e378]: 달콤
                - generic [ref=e379]: 쫀득
              - generic [ref=e380]:
                - generic [ref=e382]:
                  - generic [ref=e383]: 건강점수
                  - generic [ref=e384]: 보통 50
                - generic [ref=e387]:
                  - img [ref=e388]
                  - text: 취향 50%
              - paragraph [ref=e391]: 9,000원~
          - generic [ref=e392] [cursor=pointer]:
            - generic [ref=e393]:
              - img "아이 영양 간식 세트" [ref=e394]
              - generic [ref=e395]: 간식팩
            - generic [ref=e396]:
              - generic [ref=e397]:
                - heading "아이 영양 간식 세트" [level=3] [ref=e398]
                - paragraph [ref=e399]: 방부제 없는 엄마표 간식 5종
              - generic [ref=e400]:
                - generic [ref=e401]: 달콤
                - generic [ref=e402]: 건강한
                - generic [ref=e403]: 안전한
              - generic [ref=e404]:
                - generic [ref=e406]:
                  - generic [ref=e407]: 건강점수
                  - generic [ref=e408]: 건강 80
                - generic [ref=e411]:
                  - img [ref=e412]
                  - text: 취향 80%
              - paragraph [ref=e415]: 9,000원~
          - generic [ref=e416] [cursor=pointer]:
            - generic [ref=e417]:
              - img "아빠표 불고기 파티" [ref=e418]
              - generic [ref=e419]: 가족레시피
            - generic [ref=e420]:
              - generic [ref=e421]:
                - heading "아빠표 불고기 파티" [level=3] [ref=e422]
                - paragraph [ref=e423]: 주말 저녁 온 가족이 함께
              - generic [ref=e424]:
                - generic [ref=e425]: 달콤
                - generic [ref=e426]: 짭짤
                - generic [ref=e427]: 풍성한
              - generic [ref=e428]:
                - generic [ref=e430]:
                  - generic [ref=e431]: 건강점수
                  - generic [ref=e432]: 보통 70
                - generic [ref=e435]:
                  - img [ref=e436]
                  - text: 취향 70%
              - paragraph [ref=e439]: 22,000원~
          - generic [ref=e440] [cursor=pointer]:
            - generic [ref=e441]:
              - img "오징어게임 달고나 세트" [ref=e442]
              - generic [ref=e443]: 드라마레시피
            - generic [ref=e444]:
              - generic [ref=e445]:
                - heading "오징어게임 달고나 세트" [level=3] [ref=e446]
                - paragraph [ref=e447]: 달고나 뽑기 4종 모양 도전
              - generic [ref=e448]:
                - generic [ref=e449]: 달콤
                - generic [ref=e450]: 바삭
                - generic [ref=e451]: 추억의
              - generic [ref=e452]:
                - generic [ref=e454]:
                  - generic [ref=e455]: 건강점수
                  - generic [ref=e456]: 주의 30
                - generic [ref=e459]:
                  - img [ref=e460]
                  - text: 취향 30%
              - paragraph [ref=e463]: 3,000원~
          - generic [ref=e464] [cursor=pointer]:
            - generic [ref=e465]:
              - img "아보카도 퀴노아 포케 볼" [ref=e466]
              - generic [ref=e467]: 혼웰빙
            - generic [ref=e468]:
              - generic [ref=e469]:
                - heading "아보카도 퀴노아 포케 볼" [level=3] [ref=e470]
                - paragraph [ref=e471]: 저칼로리 고영양 한 끼
              - generic [ref=e472]:
                - generic [ref=e473]: 담백한
                - generic [ref=e474]: 고소한
                - generic [ref=e475]: 산뜻한
              - generic [ref=e476]:
                - generic [ref=e478]:
                  - generic [ref=e479]: 건강점수
                  - generic [ref=e480]: 건강 90
                - generic [ref=e483]:
                  - img [ref=e484]
                  - text: 취향 90%
              - paragraph [ref=e487]: 13,000원~
          - generic [ref=e488] [cursor=pointer]:
            - generic [ref=e489]:
              - img "미슐랭 된장찌개" [ref=e490]
              - generic [ref=e491]: 흑백요리사
            - generic [ref=e492]:
              - generic [ref=e493]:
                - heading "미슐랭 된장찌개" [level=3] [ref=e494]
                - paragraph [ref=e495]: 재래식 된장으로 완성하는 깊은 맛
              - generic [ref=e496]:
                - generic [ref=e497]: 구수한
                - generic [ref=e498]: 따뜻한
                - generic [ref=e499]: 깊은맛
              - generic [ref=e500]:
                - generic [ref=e502]:
                  - generic [ref=e503]: 건강점수
                  - generic [ref=e504]: 건강 80
                - generic [ref=e507]:
                  - img [ref=e508]
                  - text: 취향 80%
              - paragraph [ref=e511]: 12,000원~
          - generic [ref=e512] [cursor=pointer]:
            - generic [ref=e513]:
              - img "셰프의 트러플 버섯 리조또" [ref=e514]
              - generic [ref=e515]: 흑백요리사
            - generic [ref=e516]:
              - generic [ref=e517]:
                - heading "셰프의 트러플 버섯 리조또" [level=3] [ref=e518]
                - paragraph [ref=e519]: 3종 버섯으로 완성하는 이탈리안
              - generic [ref=e520]:
                - generic [ref=e521]: 고소한
                - generic [ref=e522]: 진한
                - generic [ref=e523]: 풍성한
              - generic [ref=e524]:
                - generic [ref=e526]:
                  - generic [ref=e527]: 건강점수
                  - generic [ref=e528]: 보통 70
                - generic [ref=e531]:
                  - img [ref=e532]
                  - text: 취향 70%
              - paragraph [ref=e535]: 15,000원~
          - generic [ref=e536] [cursor=pointer]:
            - generic [ref=e537]:
              - img "흑임자 크림 케이크" [ref=e538]
              - generic [ref=e539]: K디저트
            - generic [ref=e540]:
              - generic [ref=e541]:
                - heading "흑임자 크림 케이크" [level=3] [ref=e542]
                - paragraph [ref=e543]: 전통 재료로 만드는 트렌디 케이크
              - generic [ref=e544]:
                - generic [ref=e545]: 고소
                - generic [ref=e546]: 달콤
                - generic [ref=e547]: 부드러운
              - generic [ref=e548]:
                - generic [ref=e550]:
                  - generic [ref=e551]: 건강점수
                  - generic [ref=e552]: 보통 50
                - generic [ref=e555]:
                  - img [ref=e556]
                  - text: 취향 50%
              - paragraph [ref=e559]: 15,000원~
          - generic [ref=e560] [cursor=pointer]:
            - generic [ref=e561]:
              - img "전통 약과 세트" [ref=e562]
              - generic [ref=e563]: 간식팩
            - generic [ref=e564]:
              - generic [ref=e565]:
                - heading "전통 약과 세트" [level=3] [ref=e566]
                - paragraph [ref=e567]: 꿀·생강·계피 정통 약과
              - generic [ref=e568]:
                - generic [ref=e569]: 달콤
                - generic [ref=e570]: 고소
                - generic [ref=e571]: 향긋
              - generic [ref=e572]:
                - generic [ref=e574]:
                  - generic [ref=e575]: 건강점수
                  - generic [ref=e576]: 보통 50
                - generic [ref=e579]:
                  - img [ref=e580]
                  - text: 취향 50%
              - paragraph [ref=e583]: 11,000원~
          - generic [ref=e584] [cursor=pointer]:
            - generic [ref=e585]:
              - img "무비나이트 치킨 플래터" [ref=e586]
              - generic [ref=e587]: 홈시네마
            - generic [ref=e588]:
              - generic [ref=e589]:
                - heading "무비나이트 치킨 플래터" [level=3] [ref=e590]
                - paragraph [ref=e591]: 영화 볼 때 온 가족이 함께
              - generic [ref=e592]:
                - generic [ref=e593]: 바삭
                - generic [ref=e594]: 매콤
                - generic [ref=e595]: 풍성한
              - generic [ref=e596]:
                - generic [ref=e598]:
                  - generic [ref=e599]: 건강점수
                  - generic [ref=e600]: 보통 50
                - generic [ref=e603]:
                  - img [ref=e604]
                  - text: 취향 50%
              - paragraph [ref=e607]: 25,000원~
          - generic [ref=e608] [cursor=pointer]:
            - generic [ref=e609]:
              - img "홈시네마 팝콘 버킷" [ref=e610]
              - generic [ref=e611]: 홈시네마
            - generic [ref=e612]:
              - generic [ref=e613]:
                - heading "홈시네마 팝콘 버킷" [level=3] [ref=e614]
                - paragraph [ref=e615]: 버터·카라멜·체다 3가지 맛
              - generic [ref=e616]:
                - generic [ref=e617]: 고소
                - generic [ref=e618]: 짭짤
                - generic [ref=e619]: 달콤
              - generic [ref=e620]:
                - generic [ref=e622]:
                  - generic [ref=e623]: 건강점수
                  - generic [ref=e624]: 주의 40
                - generic [ref=e627]:
                  - img [ref=e628]
                  - text: 취향 40%
              - paragraph [ref=e631]: 9,000원~
          - generic [ref=e632] [cursor=pointer]:
            - generic [ref=e633]:
              - img "혼밥 삼겹살 덮밥" [ref=e634]
              - generic [ref=e635]: 한 끼
            - generic [ref=e636]:
              - generic [ref=e637]:
                - heading "혼밥 삼겹살 덮밥" [level=3] [ref=e638]
                - paragraph [ref=e639]: 1인 가구를 위한 간단 한 끼
              - generic [ref=e640]:
                - generic [ref=e641]: 고소한
                - generic [ref=e642]: 매콤
                - generic [ref=e643]: 든든한
              - generic [ref=e644]:
                - generic [ref=e646]:
                  - generic [ref=e647]: 건강점수
                  - generic [ref=e648]: 보통 60
                - generic [ref=e651]:
                  - img [ref=e652]
                  - text: 취향 60%
              - paragraph [ref=e655]: 8,000원~
          - generic [ref=e656] [cursor=pointer]:
            - generic [ref=e657]:
              - img "심야 나초 & 살사 세트" [ref=e658]
              - generic [ref=e659]: 홈시네마
            - generic [ref=e660]:
              - generic [ref=e661]:
                - heading "심야 나초 & 살사 세트" [level=3] [ref=e662]
                - paragraph [ref=e663]: 3가지 딥 소스와 바삭한 나초
              - generic [ref=e664]:
                - generic [ref=e665]: 바삭
                - generic [ref=e666]: 새콤
                - generic [ref=e667]: 매콤
              - generic [ref=e668]:
                - generic [ref=e670]:
                  - generic [ref=e671]: 건강점수
                  - generic [ref=e672]: 주의 40
                - generic [ref=e675]:
                  - img [ref=e676]
                  - text: 취향 40%
              - paragraph [ref=e679]: 12,000원~
          - generic [ref=e680] [cursor=pointer]:
            - generic [ref=e681]:
              - img "가족 나들이 김밥 세트" [ref=e682]
              - generic [ref=e683]: 가족레시피
            - generic [ref=e684]:
              - generic [ref=e685]:
                - heading "가족 나들이 김밥 세트" [level=3] [ref=e686]
                - paragraph [ref=e687]: 소풍·나들이 필수 도시락
              - generic [ref=e688]:
                - generic [ref=e689]: 고소한
                - generic [ref=e690]: 담백한
                - generic [ref=e691]: 정겨운
              - generic [ref=e692]:
                - generic [ref=e694]:
                  - generic [ref=e695]: 건강점수
                  - generic [ref=e696]: 보통 70
                - generic [ref=e699]:
                  - img [ref=e700]
                  - text: 취향 70%
              - paragraph [ref=e703]: 12,000원~
          - generic [ref=e704] [cursor=pointer]:
            - generic [ref=e705]:
              - img "계란 토스트 & 미니 수프" [ref=e706]
              - generic [ref=e707]: 한 끼
            - generic [ref=e708]:
              - generic [ref=e709]:
                - heading "계란 토스트 & 미니 수프" [level=3] [ref=e710]
                - paragraph [ref=e711]: 영양 가득 아침 세트
              - generic [ref=e712]:
                - generic [ref=e713]: 고소한
                - generic [ref=e714]: 따뜻한
                - generic [ref=e715]: 심플
              - generic [ref=e716]:
                - generic [ref=e718]:
                  - generic [ref=e719]: 건강점수
                  - generic [ref=e720]: 보통 70
                - generic [ref=e723]:
                  - img [ref=e724]
                  - text: 취향 70%
              - paragraph [ref=e727]: 6,000원~
          - generic [ref=e728] [cursor=pointer]:
            - generic [ref=e729]:
              - img "엄마표 김치찌개" [ref=e730]
              - generic [ref=e731]: 가족레시피
            - generic [ref=e732]:
              - generic [ref=e733]:
                - heading "엄마표 김치찌개" [level=3] [ref=e734]
                - paragraph [ref=e735]: 3대가 함께하는 가족 밥상
              - generic [ref=e736]:
                - generic [ref=e737]: 칼칼한
                - generic [ref=e738]: 구수한
                - generic [ref=e739]: 정겨운
              - generic [ref=e740]:
                - generic [ref=e742]:
                  - generic [ref=e743]: 건강점수
                  - generic [ref=e744]: 건강 80
                - generic [ref=e747]:
                  - img [ref=e748]
                  - text: 취향 80%
              - paragraph [ref=e751]: 10,000원~
          - generic [ref=e752] [cursor=pointer]:
            - generic [ref=e753]:
              - img "이상한 변호사 우영우 김밥" [ref=e754]
              - generic [ref=e755]: 드라마레시피
            - generic [ref=e756]:
              - generic [ref=e757]:
                - heading "이상한 변호사 우영우 김밥" [level=3] [ref=e758]
                - paragraph [ref=e759]: 드라마 속 그 장면 그대로
              - generic [ref=e760]:
                - generic [ref=e761]: 고소한
                - generic [ref=e762]: 담백한
                - generic [ref=e763]: 추억의
              - generic [ref=e764]:
                - generic [ref=e766]:
                  - generic [ref=e767]: 건강점수
                  - generic [ref=e768]: 보통 70
                - generic [ref=e771]:
                  - img [ref=e772]
                  - text: 취향 70%
              - paragraph [ref=e775]: 7,000원~
          - generic [ref=e776] [cursor=pointer]:
            - generic [ref=e777]:
              - img "수퍼푸드 샐러드 볼" [ref=e778]
              - generic [ref=e779]: 혼웰빙
              - generic [ref=e780]:
                - img [ref=e781]
                - text: TOP1
            - generic [ref=e783]:
              - generic [ref=e784]:
                - heading "수퍼푸드 샐러드 볼" [level=3] [ref=e785]
                - paragraph [ref=e786]: 하루 500kcal 목표 달성
              - generic [ref=e787]:
                - generic [ref=e788]: 담백한
                - generic [ref=e789]: 건강한
                - generic [ref=e790]: 가벼운
              - generic [ref=e791]:
                - generic [ref=e793]:
                  - generic [ref=e794]: 건강점수
                  - generic [ref=e795]: 건강 100
                - generic [ref=e798]:
                  - img [ref=e799]
                  - text: 취향 100%
              - paragraph [ref=e802]: 14,000원~
          - generic [ref=e803] [cursor=pointer]:
            - generic [ref=e804]:
              - img "봄 나물 비빔밥" [ref=e805]
              - generic [ref=e806]: 제철K팜
            - generic [ref=e807]:
              - generic [ref=e808]:
                - heading "봄 나물 비빔밥" [level=3] [ref=e809]
                - paragraph [ref=e810]: 냉이·달래·씀바귀 봄 나물 3종
              - generic [ref=e811]:
                - generic [ref=e812]: 쌉쌀
                - generic [ref=e813]: 구수
                - generic [ref=e814]: 담백
              - generic [ref=e815]:
                - generic [ref=e817]:
                  - generic [ref=e818]: 건강점수
                  - generic [ref=e819]: 건강 90
                - generic [ref=e822]:
                  - img [ref=e823]
                  - text: 취향 90%
              - paragraph [ref=e826]: 8,000원~
          - generic [ref=e827] [cursor=pointer]:
            - generic [ref=e828]:
              - img "제철 꽃게장 정식" [ref=e829]
              - generic [ref=e830]: 제철K팜
            - generic [ref=e831]:
              - generic [ref=e832]:
                - heading "제철 꽃게장 정식" [level=3] [ref=e833]
                - paragraph [ref=e834]: 봄·가을 꽃게 제철 한정 메뉴
              - generic [ref=e835]:
                - generic [ref=e836]: 짭짤
                - generic [ref=e837]: 달콤
                - generic [ref=e838]: 신선한
              - generic [ref=e839]:
                - generic [ref=e841]:
                  - generic [ref=e842]: 건강점수
                  - generic [ref=e843]: 건강 80
                - generic [ref=e846]:
                  - img [ref=e847]
                  - text: 취향 80%
              - paragraph [ref=e850]: 28,000원~
    - navigation [ref=e851]:
      - link "홈" [ref=e852] [cursor=pointer]:
        - /url: /
        - img [ref=e853]
        - generic [ref=e856]: 홈
      - link "AI" [ref=e857] [cursor=pointer]:
        - /url: /chat
        - img [ref=e858]
        - generic [ref=e860]: AI
      - link "카테고리" [ref=e861] [cursor=pointer]:
        - /url: /category
        - img [ref=e862]
        - generic [ref=e867]: 카테고리
      - link "가족" [ref=e868] [cursor=pointer]:
        - /url: /family
        - img [ref=e869]
        - generic [ref=e874]: 가족
      - link "메모" [ref=e875] [cursor=pointer]:
        - /url: /memo
        - img [ref=e876]
        - generic [ref=e879]: 메모
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e885] [cursor=pointer]:
    - img [ref=e886]
  - alert [ref=e889]
```

# Test source

```ts
  319 |     const firstCard = carousel.locator("button").first();
  320 |     await expect(firstCard).toBeVisible();
  321 | 
  322 |     // "% 매칭" 텍스트 확인
  323 |     const matchText = firstCard.getByText(/매칭/);
  324 |     await expect(matchText).toBeVisible();
  325 |   });
  326 | 
  327 |   test("놓치면아까워요 테마 카드에 할인율 배지 표시", async ({ page }) => {
  328 |     await login(page);
  329 |     await page.route("/api/ai/recommend", async (route) => {
  330 |       await route.fulfill({
  331 |         status: 200,
  332 |         contentType: "application/json",
  333 |         body: JSON.stringify(MOCK_RECOMMENDATIONS),
  334 |       });
  335 |     });
  336 | 
  337 |     await page.goto("/");
  338 | 
  339 |     // 테마3 탭 클릭
  340 |     await page.waitForSelector('[data-testid="recommend-tab-2"]', { timeout: 8000 });
  341 |     await page.getByTestId("recommend-tab-2").click();
  342 | 
  343 |     // 할인율 배지 (-%숫자%) 확인
  344 |     const carousel = page.getByTestId("recommend-carousel");
  345 |     await expect(carousel).toBeVisible({ timeout: 3000 });
  346 |     await expect(carousel.getByText(/-\d+%/).first()).toBeVisible({ timeout: 3000 });
  347 |   });
  348 | });
  349 | 
  350 | // ── T026-06: 추천 카드 클릭 → 상세 이동 ────────────────────
  351 | test.describe("Task 026-06: 카드 클릭 내비게이션", () => {
  352 |   test("추천 카드 클릭 시 /cards/[id] 페이지로 이동", async ({ page }) => {
  353 |     await login(page);
  354 | 
  355 |     // 실제 카드 ID로 목업 설정 필요 — 실제 카드 목록에서 첫 번째 카드 조회
  356 |     const cardsRes = await page.request.get("/api/cards?official=true");
  357 |     const cards = (await cardsRes.json()) as Array<{ cardId: string; name: string }>;
  358 | 
  359 |     if (cards.length === 0) {
  360 |       test.skip();
  361 |       return;
  362 |     }
  363 | 
  364 |     const realCardId = cards[0].cardId;
  365 |     const mockWithRealId = {
  366 |       recommendations: [
  367 |         {
  368 |           theme: "오늘의한끼",
  369 |           cards: [
  370 |             {
  371 |               cardId: realCardId,
  372 |               title: cards[0].name,
  373 |               reason: "테스트 추천 이유입니다.",
  374 |               confidence: 0.9,
  375 |             },
  376 |           ],
  377 |         },
  378 |         ...MOCK_RECOMMENDATIONS.recommendations.slice(1),
  379 |       ],
  380 |     };
  381 | 
  382 |     await page.route("/api/ai/recommend", async (route) => {
  383 |       await route.fulfill({
  384 |         status: 200,
  385 |         contentType: "application/json",
  386 |         body: JSON.stringify(mockWithRealId),
  387 |       });
  388 |     });
  389 | 
  390 |     await page.goto("/");
  391 |     await page.waitForSelector('[data-testid="recommend-carousel"]', { timeout: 8000 });
  392 | 
  393 |     const carousel = page.getByTestId("recommend-carousel");
  394 |     const firstCard = carousel.locator("button").first();
  395 |     await firstCard.click();
  396 | 
  397 |     await page.waitForURL(/\/cards\//, { timeout: 5000 });
  398 |     expect(page.url()).toContain("/cards/");
  399 |   });
  400 | });
  401 | 
  402 | // ── T026-07: sessionStorage 24h 캐시 ────────────────────────
  403 | test.describe("Task 026-07: 세션 캐시", () => {
  404 |   test("API 응답이 sessionStorage에 캐시되어야 함", async ({ page }) => {
  405 |     await login(page);
  406 |     await page.route("/api/ai/recommend", async (route) => {
  407 |       await route.fulfill({
  408 |         status: 200,
  409 |         contentType: "application/json",
  410 |         body: JSON.stringify(MOCK_RECOMMENDATIONS),
  411 |       });
  412 |     });
  413 | 
  414 |     await page.goto("/");
  415 |     await page.waitForSelector('[data-testid="recommend-tab-0"]', { timeout: 8000 });
  416 | 
  417 |     // sessionStorage 캐시 확인
  418 |     const cached = await page.evaluate((key) => sessionStorage.getItem(key), CACHE_KEY);
> 419 |     expect(cached).not.toBeNull();
      |                        ^ Error: expect(received).not.toBeNull()
  420 | 
  421 |     const parsed = JSON.parse(cached!) as { data: unknown; timestamp: number };
  422 |     expect(parsed).toHaveProperty("data");
  423 |     expect(parsed).toHaveProperty("timestamp");
  424 |     expect(typeof parsed.timestamp).toBe("number");
  425 |   });
  426 | 
  427 |   test("캐시된 데이터가 있을 때 API 재호출 없이 캐시 사용", async ({ page }) => {
  428 |     await login(page);
  429 |     await page.route("/api/ai/recommend", async (route) => {
  430 |       await route.fulfill({
  431 |         status: 200,
  432 |         contentType: "application/json",
  433 |         body: JSON.stringify(MOCK_RECOMMENDATIONS),
  434 |       });
  435 |     });
  436 | 
  437 |     // 첫 방문: 캐시 저장
  438 |     await page.goto("/");
  439 |     await page.waitForSelector('[data-testid="recommend-tab-0"]', { timeout: 8000 });
  440 | 
  441 |     // API 호출 카운터 설정 (캐시 이후)
  442 |     let apiCallCount = 0;
  443 |     await page.route("/api/ai/recommend", async (route) => {
  444 |       apiCallCount++;
  445 |       await route.continue();
  446 |     });
  447 | 
  448 |     // 재방문
  449 |     await page.reload();
  450 |     await page.waitForSelector('[data-testid="recommend-tab-0"]', { timeout: 8000 });
  451 | 
  452 |     // 캐시가 유효하면 API 재호출 없음
  453 |     expect(apiCallCount).toBe(0);
  454 |   });
  455 | 
  456 |   test("만료된 캐시는 무시하고 API 재호출", async ({ page }) => {
  457 |     await login(page);
  458 | 
  459 |     // 만료된 캐시 주입
  460 |     await page.goto("/login");
  461 |     await login(page);
  462 |     await page.evaluate((key) => {
  463 |       const expiredCache = JSON.stringify({
  464 |         data: { recommendations: [] },
  465 |         timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25시간 전
  466 |       });
  467 |       sessionStorage.setItem(key, expiredCache);
  468 |     }, CACHE_KEY);
  469 | 
  470 |     let apiCallCount = 0;
  471 |     await page.route("/api/ai/recommend", async (route) => {
  472 |       apiCallCount++;
  473 |       await route.fulfill({
  474 |         status: 200,
  475 |         contentType: "application/json",
  476 |         body: JSON.stringify(MOCK_RECOMMENDATIONS),
  477 |       });
  478 |     });
  479 | 
  480 |     await page.goto("/");
  481 |     await page.waitForSelector('[data-testid="recommend-tab-0"]', { timeout: 8000 });
  482 | 
  483 |     // 만료된 캐시 → API 재호출
  484 |     expect(apiCallCount).toBe(1);
  485 |   });
  486 | });
  487 | 
  488 | // ── T026-08: 폴백 추천 동작 ──────────────────────────────────
  489 | test.describe("Task 026-08: 폴백 추천", () => {
  490 |   test("API 실패 시 섹션이 숨겨지고 홈 보드는 정상 로드", async ({ page }) => {
  491 |     await login(page);
  492 | 
  493 |     // AI 추천 API 실패 모킹
  494 |     await page.route("/api/ai/recommend", async (route) => {
  495 |       await route.fulfill({ status: 500, body: '{"error":"Internal Server Error"}' });
  496 |     });
  497 | 
  498 |     await page.goto("/");
  499 |     await page.waitForLoadState("networkidle");
  500 | 
  501 |     // AI 추천 섹션은 숨겨짐 (error 상태)
  502 |     const section = page.getByTestId("ai-recommend-section");
  503 |     await expect(section)
  504 |       .not.toBeVisible({ timeout: 3000 })
  505 |       .catch(() => {
  506 |         // 섹션이 없어도 OK (null 반환)
  507 |       });
  508 | 
  509 |     // 홈 보드(기존 카드 섹션)는 정상 표시되어야 함
  510 |     await expect(page.locator(".grid")).toBeVisible({ timeout: 5000 });
  511 |   });
  512 | });
  513 | 
```