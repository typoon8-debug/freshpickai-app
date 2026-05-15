"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Star, MapPinOff, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AddressForm, { type AddressFormValues } from "./AddressForm";
import type { FpAddress } from "@/lib/actions/address/index";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  regeocodeAddress,
} from "@/lib/actions/address/index";

type Mode = "list" | "add" | "edit";

interface Props {
  initialAddresses: FpAddress[];
}

export default function AddressManageClient({ initialAddresses }: Props) {
  const [mode, setMode] = useState<Mode>("list");
  const [addresses, setAddresses] = useState<FpAddress[]>(initialAddresses);
  const [editTarget, setEditTarget] = useState<FpAddress | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reGeocoding, setReGeocoding] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshAddresses = async () => {
    const { getAddresses } = await import("@/lib/actions/address/index");
    const data = await getAddresses();
    setAddresses(data);
  };

  const handleAdd = async (values: AddressFormValues) => {
    setSubmitting(true);
    const result = await createAddress({
      addressName: values.address_name,
      address: values.address,
      addrDetail: values.addr_detail,
      zipcode: values.zipcode,
      receiverName: values.receiver_name,
      receiverPhone: values.receiver_phone,
      message: values.message,
      isDefault: values.is_default,
    });
    setSubmitting(false);
    if (result.error) {
      toast.error("배송지 저장에 실패했습니다.");
      return;
    }
    toast.success("배송지가 추가되었습니다.");
    await refreshAddresses();
    setMode("list");
  };

  const handleEdit = async (values: AddressFormValues) => {
    if (!editTarget) return;
    setSubmitting(true);
    const result = await updateAddress(editTarget.addressId, {
      addressName: values.address_name,
      address: values.address,
      addrDetail: values.addr_detail,
      zipcode: values.zipcode,
      receiverName: values.receiver_name,
      receiverPhone: values.receiver_phone,
      message: values.message,
    });
    setSubmitting(false);
    if (result.error) {
      toast.error("배송지 수정에 실패했습니다.");
      return;
    }
    toast.success("배송지가 수정되었습니다.");
    await refreshAddresses();
    setMode("list");
    setEditTarget(null);
  };

  const handleSetDefault = (addressId: string) => {
    startTransition(async () => {
      const result = await setDefaultAddress(addressId);
      if (result.error) {
        toast.error("기본 배송지 설정에 실패했습니다.");
        return;
      }
      toast.success("기본 배송지로 설정되었습니다.");
      await refreshAddresses();
    });
  };

  const handleDelete = (addressId: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error("기본 배송지는 삭제할 수 없습니다.");
      return;
    }
    startTransition(async () => {
      const result = await deleteAddress(addressId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("배송지가 삭제되었습니다.");
      setAddresses((prev) => prev.filter((a) => a.addressId !== addressId));
    });
  };

  const handleReGeocode = async (addressId: string) => {
    setReGeocoding(addressId);
    const result = await regeocodeAddress(addressId);
    setReGeocoding(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("📍 좌표가 등록되었습니다.");
    await refreshAddresses();
  };

  const editInitialValues: Partial<AddressFormValues> | undefined = editTarget
    ? {
        address_name: editTarget.addressName,
        receiver_name: editTarget.receiverName ?? "",
        receiver_phone: editTarget.receiverPhone ?? "",
        zipcode: editTarget.zipcode ?? "",
        address: editTarget.address,
        addr_detail: editTarget.addrDetail ?? "",
        message: editTarget.message ?? "",
        is_default: editTarget.status === "DEFAULT",
      }
    : undefined;

  const title = mode === "list" ? "배송지 관리" : mode === "add" ? "새 배송지 추가" : "배송지 수정";

  return (
    <div className="flex min-h-screen flex-col">
      {/* 헤더 */}
      <header className="border-line bg-paper sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4">
        {mode === "list" ? (
          <Link href="/profile" aria-label="뒤로가기">
            <ChevronLeft size={22} className="text-ink-700" />
          </Link>
        ) : (
          <button
            onClick={() => {
              setMode("list");
              setEditTarget(null);
            }}
            className="text-ink-700"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 className="text-ink-800 flex-1 text-base font-bold">{title}</h1>
      </header>

      {/* 목록 모드 */}
      {mode === "list" && (
        <div className="flex-1 overflow-y-auto pb-12">
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <MapPin size={48} className="text-ink-200" />
              <p className="text-ink-500 text-sm font-medium">등록된 배송지가 없어요</p>
              <p className="text-ink-400 text-xs">아래 버튼을 눌러 배송지를 추가해보세요</p>
            </div>
          ) : (
            <ul className="space-y-2 p-4">
              {addresses.map((addr) => (
                <li key={addr.addressId} className="border-line rounded-xl border bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        {addr.status === "DEFAULT" && (
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        )}
                        <span className="text-ink-800 text-sm font-semibold">
                          {addr.addressName}
                        </span>
                        {addr.status === "DEFAULT" && (
                          <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                            기본
                          </span>
                        )}
                        {!addr.geocodedAt && (
                          <>
                            <span className="flex items-center gap-0.5 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">
                              <MapPinOff className="h-2.5 w-2.5" />
                              좌표 미등록
                            </span>
                            <button
                              onClick={() => handleReGeocode(addr.addressId)}
                              disabled={reGeocoding === addr.addressId}
                              className="flex items-center gap-0.5 rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-medium text-white disabled:opacity-60"
                            >
                              <RefreshCw
                                className={`h-2.5 w-2.5 ${reGeocoding === addr.addressId ? "animate-spin" : ""}`}
                              />
                              재등록
                            </button>
                          </>
                        )}
                      </div>
                      {(addr.receiverName || addr.receiverPhone) && (
                        <p className="text-ink-500 text-xs">
                          {[addr.receiverName, addr.receiverPhone].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <p className="text-ink-800 mt-0.5 text-sm leading-snug">{addr.address}</p>
                      {addr.addrDetail && <p className="text-ink-400 text-xs">{addr.addrDetail}</p>}
                      {addr.zipcode && <p className="text-ink-400 text-xs">[{addr.zipcode}]</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => {
                          setEditTarget(addr);
                          setMode("edit");
                        }}
                        className="border-line rounded-lg border px-2 py-1 text-xs"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(addr.addressId, addr.status === "DEFAULT")}
                        disabled={isPending}
                        className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  {addr.status !== "DEFAULT" && (
                    <button
                      onClick={() => handleSetDefault(addr.addressId)}
                      disabled={isPending}
                      className="text-mocha-600 mt-2 text-xs font-medium disabled:opacity-50"
                    >
                      기본으로 설정
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="px-4">
            <button
              onClick={() => setMode("add")}
              className="border-line text-ink-500 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />새 배송지 추가
            </button>
          </div>
        </div>
      )}

      {/* 폼 모드 (add / edit) */}
      {mode !== "list" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 스크롤 영역: data-vaul-no-drag로 드로어 사용 시에도 안전 */}
          <div className="flex-1 overflow-y-auto" data-vaul-no-drag>
            <AddressForm
              key={editTarget?.addressId ?? "add"}
              formId="fp-address-form"
              hideButtons
              onSubmit={mode === "add" ? handleAdd : handleEdit}
              submitting={submitting}
              initialValues={editInitialValues}
            />
          </div>
          {/* 고정 하단 버튼: safe-area-inset-bottom으로 iPhone 홈 버튼 영역 처리 */}
          <div className="border-line flex shrink-0 gap-2 border-t px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setMode("list");
                setEditTarget(null);
              }}
              disabled={submitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              form="fp-address-form"
              className="bg-mocha-700 hover:bg-mocha-800 flex-1 text-white"
              disabled={submitting}
            >
              {submitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
