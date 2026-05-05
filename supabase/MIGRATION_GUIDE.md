# Supabase 마이그레이션 가이드

## 공유 DB 구조

freshpickai-app은 아래 앱들과 **동일 Supabase 프로젝트**를 사용합니다:

| 앱 | 주요 테이블 |
|----|------------|
| freshpick-app | `customer`, `cart`, `cart_item`, `order`, `order_item`, `memo`, `memo_item` |
| sellerbox-app | `store`, `store_item`, `tenant`, `tenant_item_master`, `seller` |
| manager-app | `users`, `tenant_user`, `ad_campaign`, `picking_task` |
| rideron-app | `rider`, `shipment`, `dispatch_request`, `route_point` |
| **freshpickai-app** | **`fp_*` 테이블 전용** |

## 설계 원칙

1. **기존 `public.*` 테이블 수정 금지**
2. **freshpickai 전용 테이블은 `fp_` 프리픽스** 사용
3. **사용자 인증**: Supabase Auth (`auth.uid()`) → `fp_user_profile.user_id`
4. **커머스 연동**: `fp_order.ref_order_id → public.order.order_id` (결제 완료 후)
5. **상품 연동**: `fp_dish_ingredient.ref_store_item_id → public.store_item.store_item_id` (매칭 후)

## 인증 구조 차이

| 앱 | 인증 방식 | 사용자 테이블 |
|----|----------|--------------|
| freshpick-app | password_hash 직접 저장 | `public.customer` |
| sellerbox-app | 동일 | `public.customer` |
| manager-app | Supabase Auth + `auth_user_id` | `public.users` |
| **freshpickai-app** | **Supabase Auth (카카오·애플 OAuth)** | **`fp_user_profile`** |

## 마이그레이션 실행 방법

### ❌ Supabase MCP `apply_migration` 사용 불가

현재 MCP `apply_migration`이 마이그레이션 히스토리 테이블 초기화 단계에서
Connection timeout이 발생합니다 (86개 테이블 복잡도로 인한 지연 추정).

### ✅ 방법 1: Supabase Dashboard SQL Editor (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 (`yfwbejswktamkgasdfeh`)
3. 좌측 메뉴 → **SQL Editor**
4. `supabase/migrations/20260505_002_freshpickai_fp_prefix.sql` 전체 내용 붙여넣기
5. **Run** 실행

### ✅ 방법 2: Supabase CLI

```bash
# Claude Code 터미널에서
! npx supabase login
! npx supabase link --project-ref yfwbejswktamkgasdfeh
! npx supabase db push
```

### ✅ 방법 3: psql 직접 실행

```bash
# DB 연결 문자열은 Supabase Dashboard → Settings → Database 에서 확인
! psql "postgresql://postgres:[PASSWORD]@db.yfwbejswktamkgasdfeh.supabase.co:5432/postgres" \
  -f supabase/migrations/20260505_002_freshpickai_fp_prefix.sql
```

## TypeScript 타입 재생성

마이그레이션 적용 후 반드시 실행:

```bash
! npx supabase gen types typescript \
  --project-id yfwbejswktamkgasdfeh \
  --schema public \
  > src/lib/supabase/database.types.ts
```

## 커머스 플랫폼 연동 흐름

```
[freshpickai 장바구니]          [커머스 플랫폼]
fp_cart_item
  └─ ref_store_item_id ──────→ public.store_item
                                     │
[결제 완료]                           │
fp_order                              │
  └─ ref_order_id ──────────→ public.order
                                     └─ public.order_item
                                          └─ store_item_id
```

## 주의사항

- `fp_user_profile`은 **소셜 로그인 최초 성공 시** Server Action에서 자동 생성
- `ref_customer_id` (fp_user_profile) ← 사용자가 커머스 계정을 연동할 때만 채움
- `public.memo` / `public.memo_item`은 freshpickai가 건드리지 않음
  → freshpickai는 `fp_shopping_memo` / `fp_memo_item` 사용
