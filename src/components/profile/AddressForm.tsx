"use client";

import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useDaumPostcode } from "@/lib/hooks/useDaumPostcode";

const schema = z.object({
  address_name: z.string().min(1, "별칭을 입력해주세요").max(20, "20자 이내로 입력해주세요"),
  receiver_name: z.string().min(1, "수령인을 입력해주세요").max(30, "30자 이내로 입력해주세요"),
  receiver_phone: z
    .string()
    .min(1, "연락처를 입력해주세요")
    .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, "올바른 휴대폰 번호를 입력해주세요"),
  zipcode: z.string().min(1, "주소를 검색해주세요"),
  address: z.string().min(1, "주소를 검색해주세요"),
  addr_detail: z.string().min(1, "상세주소를 입력해주세요").max(100, "100자 이내로 입력해주세요"),
  message: z.string().max(100, "100자 이내로 입력해주세요").optional(),
  is_default: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof schema>;

interface Props {
  onSubmit: (values: AddressFormValues) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  initialValues?: Partial<AddressFormValues>;
  formId?: string;
  hideButtons?: boolean;
}

export default function AddressForm({
  onSubmit,
  onCancel,
  submitting,
  initialValues,
  formId,
  hideButtons,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { is_default: false, message: "", ...initialValues },
  });

  // edit 모드 전환 시 폼 리셋 (prevRef로 무한루프 방지)
  const prevInitialValues = useRef(initialValues);
  useEffect(() => {
    if (initialValues && initialValues !== prevInitialValues.current) {
      prevInitialValues.current = initialValues;
      reset({ is_default: false, message: "", ...initialValues });
    }
  }, [initialValues, reset]);

  const isPostcodeReady = useDaumPostcode();
  const [showPostcode, setShowPostcode] = useState(false);
  const postcodeContainerRef = useRef<HTMLDivElement>(null);

  // Daum embed 방식: popup() 대신 embed() 사용
  // 구 Android에서 popup() 차단 + Vaul 외부클릭 감지 충돌 모두 회피
  // DOM이 Drawer/페이지 내부에 있으므로 setValue가 안전하게 작동
  useEffect(() => {
    if (!showPostcode || !postcodeContainerRef.current || !window.daum?.Postcode) return;
    new window.daum.Postcode({
      oncomplete: (data) => {
        setValue("zipcode", data.zonecode, { shouldValidate: true });
        setValue("address", data.roadAddress || data.address, { shouldValidate: true });
        setShowPostcode(false);
      },
    }).embed(postcodeContainerRef.current, { autoClose: false });
  }, [showPostcode, setValue]);

  const isDefaultValue = watch("is_default");

  return (
    <>
      {/* position:fixed 전체화면 오버레이 — DOM은 컴포넌트 내부 유지
          구 Android: Vaul 외부클릭 감지 우회 + popup 차단 문제 해결 */}
      {showPostcode && (
        <div
          className="fixed inset-0 z-99999 flex flex-col bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-line flex shrink-0 items-center justify-between border-b px-4 py-3">
            <span className="text-ink-900 text-base font-semibold">주소 검색</span>
            <button
              type="button"
              onClick={() => setShowPostcode(false)}
              className="text-ink-500 text-sm"
            >
              닫기
            </button>
          </div>
          <div ref={postcodeContainerRef} className="flex-1 overflow-hidden" />
        </div>
      )}

      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 py-2">
        <div className="space-y-1">
          <Label htmlFor="fp_address_name">별칭</Label>
          <Input id="fp_address_name" placeholder="우리집, 회사 등" {...register("address_name")} />
          {errors.address_name && (
            <p className="text-terracotta text-xs">{errors.address_name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="fp_receiver_name">수령인</Label>
          <Input id="fp_receiver_name" placeholder="홍길동" {...register("receiver_name")} />
          {errors.receiver_name && (
            <p className="text-terracotta text-xs">{errors.receiver_name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="fp_receiver_phone">연락처</Label>
          {/* type="tel": 모바일 전화번호 키보드 최적화 */}
          <Input
            id="fp_receiver_phone"
            type="tel"
            placeholder="010-1234-5678"
            {...register("receiver_phone")}
          />
          {errors.receiver_phone && (
            <p className="text-terracotta text-xs">{errors.receiver_phone.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>주소</Label>
          <div className="flex gap-2">
            {/* readOnly: 구 Android에서 Drawer 내 input focus 이슈 회피
                우편번호/기본주소는 어차피 Daum 검색으로만 입력하므로 readOnly 처리 */}
            <Input
              readOnly
              placeholder="우편번호"
              value={watch("zipcode") ?? ""}
              className="bg-ink-50 w-28 cursor-default"
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => {
                if (!isPostcodeReady) {
                  toast.error("주소 검색을 준비 중입니다. 잠시 후 다시 시도해주세요.");
                  return;
                }
                setShowPostcode(true);
              }}
            >
              <Search className="mr-1 h-4 w-4" />
              주소 검색
            </Button>
          </div>
          <Input
            readOnly
            placeholder="기본주소"
            value={watch("address") ?? ""}
            className="bg-ink-50 cursor-default"
          />
          {errors.zipcode && <p className="text-terracotta text-xs">{errors.zipcode.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="fp_addr_detail">상세주소</Label>
          <Input id="fp_addr_detail" placeholder="동, 호수 등" {...register("addr_detail")} />
          {errors.addr_detail && (
            <p className="text-terracotta text-xs">{errors.addr_detail.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="fp_message">배송 메시지 (선택)</Label>
          <Input id="fp_message" placeholder="배송 시 요청사항" {...register("message")} />
          {errors.message && <p className="text-terracotta text-xs">{errors.message.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="fp_is_default"
            checked={isDefaultValue ?? false}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              setValue("is_default", checked === true)
            }
          />
          <Label htmlFor="fp_is_default" className="cursor-pointer text-sm font-normal">
            기본 배송지로 설정
          </Label>
        </div>

        {!hideButtons && (
          <div className="flex gap-2 pt-2 pb-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={submitting}
            >
              취소
            </Button>
            <Button type="submit" className="bg-mocha-700 flex-1 text-white" disabled={submitting}>
              {submitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        )}
      </form>
    </>
  );
}
