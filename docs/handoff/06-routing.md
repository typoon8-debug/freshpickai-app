# Routing & Data Fetching (Next.js 14 App Router)

## File Structure

```
src/
├─ app/
│  ├─ (auth)/
│  │  └─ login/page.tsx
│  ├─ (main)/
│  │  ├─ layout.tsx              ← <TabBar/> 공통
│  │  ├─ page.tsx                ← Home
│  │  ├─ chat/page.tsx
│  │  ├─ family/page.tsx
│  │  ├─ memo/page.tsx
│  │  ├─ cart/page.tsx
│  │  ├─ checkout/page.tsx
│  │  ├─ cards/
│  │  │  ├─ [id]/page.tsx        ← Card Detail
│  │  │  └─ new/page.tsx         ← Wizard
│  │  └─ kids/page.tsx
│  ├─ api/
│  │  ├─ ai/chat/route.ts        ← POST stream
│  │  ├─ cards/route.ts
│  │  └─ orders/route.ts
│  ├─ globals.css
│  └─ layout.tsx                 ← root, fonts
├─ components/
│  ├─ ui/                        ← atoms (shadcn-style)
│  ├─ home/                      ← screen-specific
│  ├─ detail/
│  ├─ chat/
│  └─ ...
├─ lib/
│  ├─ store.ts                   ← Zustand
│  ├─ types.ts
│  ├─ api.ts                     ← TanStack Query wrappers
│  └─ utils.ts                   ← cn(), formatters
└─ middleware.ts                 ← auth gate
```

## Server vs. Client Components

| Screen | Strategy |
|---|---|
| Home          | RSC fetch cards on server · Client island for filter chip |
| Card Detail   | RSC fetch card + ingredients · Client flipper |
| Chat          | Full client (`'use client'`) — streaming SSE |
| Family        | RSC for static, Client subscribe for vote realtime |
| Cart/Checkout | Client (state) + server actions for mutations |
| Kids          | Full client (animation-heavy) |
| Wizard        | Full client (multi-step state) |

## Auth Gate (`middleware.ts`)
```ts
export function middleware(req: NextRequest) {
  const token = req.cookies.get('fp_token')?.value;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login');
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
export const config = { matcher: ['/((?!_next|api/auth|favicon).*)'] };
```

## TanStack Query 키 컨벤션
```ts
// src/lib/queryKeys.ts
export const qk = {
  cards:    (filter?: string) => ['cards', filter] as const,
  card:     (id: number)      => ['card', id] as const,
  daily:    ()                => ['daily-pick'] as const,
  family:   ()                => ['family'] as const,
  vote:     ()                => ['vote', 'today'] as const,
  cart:     ()                => ['cart'] as const,
  memos:    ()                => ['memos'] as const,
};
```

## Server Actions (예시)
```ts
// src/app/(main)/cart/actions.ts
'use server';
export async function addBundle(cardId: number, ingredientIds: string[]) {
  await api.cart.addBundle({ cardId, ingredientIds });
  revalidateTag('cart');
}
```
