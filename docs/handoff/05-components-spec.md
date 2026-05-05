# Component Spec — 화면별 트리

> 모든 컴포넌트는 `src/components/`에 배치, 화면 단위 컨테이너는 `src/app/(main)/[screen]/page.tsx`.
> 모든 props에 `className?: string` 허용 (`cn()` 헬퍼 사용).

## 공통 (Atom / Molecule)

```tsx
// src/components/ui/Button.tsx
type ButtonProps = { variant?: 'primary'|'ghost'|'olive'; size?: 'sm'|'md'|'lg'; ... };

// src/components/ui/Phone.tsx — 데스크톱 미리보기용 디바이스 셸 (개발 only)
// src/components/ui/Card.tsx — .card-paper 래퍼
// src/components/ui/Chip.tsx — toggleable filter chip
// src/components/ui/LabelMark.tsx — uppercase Bree Serif caption
// src/components/ui/TabBar.tsx — bottom 5-tab nav
```

## 01 Login (`/login`)
```
<LoginPage>
  ├─ <SocialButtons>          (Kakao / Naver / Apple)
  ├─ <EmailLoginForm>          (react-hook-form + zod)
  └─ <StatsRow>                (2.4M / 180+ / 4.9)
```
**API:** `POST /auth/social/{provider}`, `POST /auth/email`
**State:** `useAuthStore.login(token, user)`

## 02 Home (`/`)
```
<HomePage>
  ├─ <BrandHeader>             (logo + 알림 + 설정)
  ├─ <DailyHero>               (오늘의 큐레이팅 + AI 신뢰도 + CTA)
  ├─ <CategoryFilter>          (chip group)
  └─ <CardGrid>
       └─ <MenuCard>[]         (썸네일 + 서브 + 타이틀 + 취향 + 종수)
```
**Data:**
```ts
const { data: cards } = useQuery(['cards', filter], () => api.getCards(filter));
const { data: today } = useQuery(['daily-pick'], api.getDailyPick);
```

## 03 Card Detail (`/cards/[id]`)
```
<CardDetailPage>
  ├─ <DetailHeader>            (back / breadcrumb / favorite)
  ├─ <CardFlipper>             ★ key interaction
  │    ├─ <DishFront>           (이름 / 설명 / 건강·시간·칼로리 메타)
  │    └─ <IngredientList>      (재료 / 가격 / 할인)
  └─ <DetailFooter>            (AI변형 + 한꺼번에 담기)
```
**Animation:** `transform: rotateY(180deg)` · `transform-style: preserve-3d` · `transition .7s`
**State:** `useCartStore.addBundle(cardId, ingredients)`

## 04 AI Chat (`/chat`)
```
<ChatPage>
  ├─ <ChatHeader>              (AI 상태 + RAG indicator)
  ├─ <MessageList>
  │    ├─ <Message variant="ai|user">
  │    └─ <RecCardCarousel>    (AI가 카드를 함께 추천할 때)
  ├─ <QuickChips>              (비건 / 매운맛 / 10분 / 8천원이하)
  └─ <ChatInput>               (텍스트 / 음성 / 첨부)
```
**API:** `POST /ai/chat (stream)` — Server-Sent Events
```ts
const stream = await api.chatStream({ messages, context: { userPrefs, family } });
for await (const chunk of stream) appendMessage(chunk);
```

## 05 Family Board (`/family`)
```
<FamilyPage>
  ├─ <FamilyBanner>            (집 이름 + Lv + 끼니 카운터)
  ├─ <MemberGrid>               (4 cards: 엄마/아빠/서연/하준)
  ├─ <DinnerVote>               (실시간 투표 + 마감 카운트다운)
  ├─ <PopularRanking>           (TOP 3 가족 메뉴)
  └─ <TrendingCards>            (실시간 +%)
```
**Realtime:** Supabase Realtime or Pusher for vote updates

## 06 Kids Mode (`/kids`)
```
<KidsPage>
  ├─ <KidsHeader>              (부모 모드 복귀)
  ├─ <MascotBubble>             (프레쉬 토끼 + 메시지)
  ├─ <FoodPicker>               (3×2 grid, big tap targets)
  ├─ <DailyMission>             (채소 도전 + 진행률)
  ├─ <BadgeGrid>                (4 badges, locked/unlocked)
  └─ <KidsFooter>               (선택 카운트 + 엄마한테 보내기)
```
**Storage:** picks → `useKidsStore` → 부모에게 push notification

## 07 Memo (`/memo`)
```
<MemoPage>
  ├─ <MemoSearch>
  ├─ <MemoTabs>                 (저장된 메모 리스트)
  ├─ <MemoList>
  │    └─ <MemoItem>             (체크박스 + 항목 + 수량)
  └─ <MemoFooter>                (AI 카드 변환 / 장바구니)
```

## 08 Cart (`/cart`)
```
<CartPage>
  ├─ <FreeShippingBar>          (3000원 더 / 진행률)
  ├─ <CartGroupList>
  │    └─ <CartGroup>            (카드별 그룹)
  │         └─ <CartItem>         (체크 / 수량 / 가격)
  ├─ <CartSummary>
  └─ <CartFooter>                (결제하기 CTA)
```

## 09 Checkout (`/checkout`)
```
<CheckoutPage>
  ├─ <AddressBlock>             (배송지 + 샛별배송 시간)
  ├─ <OrderItems>                (카드별 요약)
  ├─ <PaymentSelector>           (카카오/네이버/카드/계좌)
  ├─ <BenefitBlock>              (포인트 + 쿠폰)
  ├─ <FinalSummary>
  └─ <CheckoutFooter>            (최종 결제 CTA → 토스페이먼츠 SDK)
```

## 10 Card Wizard (`/cards/new`)
```
<WizardPage>
  ├─ <WizardProgress>           (1→4 단계 + 진행률 라인)
  ├─ <WizardStep>                (4가지 step component swap)
  │    ├─ Step1: 테마 선택
  │    ├─ Step2: 취향 태그 (3+ required)
  │    ├─ Step3: 빈도/예산
  │    └─ Step4: 미리보기
  └─ <WizardFooter>              (이전 / 다음 / 만들기)
```
