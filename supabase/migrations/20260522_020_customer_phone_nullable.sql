-- OAuth 유저 지원: customer.phone NOT NULL 제약 완화
-- freshpickai-app OAuth 가입 시 전화번호 없이 customer 레코드 생성 가능하도록 변경
-- phone이 실제 값인 경우에만 UNIQUE 적용 (NULL/빈문자열 중복 허용)

ALTER TABLE public.customer
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN phone SET DEFAULT NULL;

-- 기존 UNIQUE 제약(빈 문자열도 중복 불가)을 partial unique index로 교체
-- NULL과 '' 는 중복 허용, 실제 전화번호만 고유성 보장
ALTER TABLE public.customer
  DROP CONSTRAINT IF EXISTS customer_phone_key;

DROP INDEX IF EXISTS public.customer_phone_key;

CREATE UNIQUE INDEX IF NOT EXISTS customer_phone_unique
  ON public.customer (phone)
  WHERE phone IS NOT NULL AND phone <> '';
