# API Spec — RAG / Commerce / Realtime

## Base URL
- Dev:  `https://api-dev.freshpick.kr/v1`
- Prod: `https://api.freshpick.kr/v1`

Auth: `Authorization: Bearer <jwt>` (모든 엔드포인트 공통, `/auth/*` 제외)

## 1. Auth
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/social/{provider}` | `{ accessToken }` | `{ jwt, user }` |
| POST | `/auth/email`   | `{ email, password }` | `{ jwt, user }` |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ jwt }` |

## 2. Cards
| Method | Path | Query | Response |
|---|---|---|---|
| GET | `/cards` | `?category=meal&limit=20` | `Card[]` |
| GET | `/cards/{id}` | — | `{ card, dishes: Dish[] }` |
| GET | `/cards/{id}/dishes/{dishId}` | — | `Dish` (with `ingredients`) |
| POST | `/cards` | `CardWizardPayload` | `Card` (사용자 생성 카드) |
| GET | `/daily-pick` | — | `{ card, dish, aiConfidence: number, reason: string }` |

## 3. AI Chat (Streaming)
```
POST /ai/chat
Content-Type: application/json
Accept: text/event-stream

{ "messages": ChatMessage[], "context": { "userPrefs": {...}, "familyId": "..." } }
```
Events:
- `data: {"type":"text","chunk":"..."}` — token
- `data: {"type":"cards","cards":[...]}` — RAG 결과 카드 추천
- `data: {"type":"done"}` — 종료

## 4. Family / Vote (Realtime)
| Method | Path | Body / Notes |
|---|---|---|
| GET | `/family` | — |
| POST | `/family/vote` | `{ candidateId }` → 투표 |
| WS | `wss://api.freshpick.kr/realtime?room=family:{id}` | event `vote.updated`, `member.online` |

## 5. Cart / Checkout
| Method | Path | Body |
|---|---|---|
| GET | `/cart` | — |
| POST | `/cart/bundle` | `{ cardId, ingredientIds[] }` |
| PATCH | `/cart/items/{id}` | `{ qty }` |
| DELETE | `/cart/items/{id}` | — |
| POST | `/orders` | `{ items, address, paymentMethod, points, couponId }` |
| POST | `/orders/{id}/pay` | 토스페이먼츠 SDK 콜백 |

## 6. Memo
| Method | Path | Body |
|---|---|---|
| GET | `/memos` | — |
| POST | `/memos` | `{ title, items }` |
| POST | `/memos/{id}/to-card` | AI가 메모 → 카드 변환 |

## 7. Error Format
```json
{ "error": { "code": "INVALID_TOKEN", "message": "...", "details": {} } }
```

## 8. Rate Limits
- AI Chat: 30 req / min / user
- 일반 API: 600 req / min / user
