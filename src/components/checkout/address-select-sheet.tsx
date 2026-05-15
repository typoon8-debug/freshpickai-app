"use client";

import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { MapPin, Star, X, Plus } from "lucide-react";
import Link from "next/link";
import { getAddresses, type FpAddress } from "@/lib/actions/address";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (address: FpAddress) => void;
  selectedId?: string;
}

export function AddressSelectSheet({ open, onClose, onSelect, selectedId }: Props) {
  const [addresses, setAddresses] = useState<FpAddress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAddresses();
        if (!cancelled) setAddresses(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSelect = (addr: FpAddress) => {
    onSelect(addr);
    onClose();
  };

  return (
    <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content
          aria-describedby={undefined}
          className="bg-paper fixed right-0 bottom-0 left-0 z-50 mx-auto flex max-h-[80dvh] max-w-[480px] flex-col rounded-t-2xl"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-gray-300" />
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <Drawer.Title className="text-ink-800 text-base font-bold">배송지 선택</Drawer.Title>
            <button type="button" onClick={onClose}>
              <X size={20} className="text-ink-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {loading ? (
              <p className="text-ink-400 py-10 text-center text-sm">불러오는 중...</p>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <MapPin size={36} className="text-ink-200" />
                <p className="text-ink-500 text-sm">등록된 배송지가 없어요</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {addresses.map((addr) => {
                  const isDefault = addr.status === "DEFAULT";
                  const isSelected = addr.addressId === selectedId;
                  return (
                    <li key={addr.addressId}>
                      <button
                        type="button"
                        onClick={() => handleSelect(addr)}
                        className={`border-line w-full rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-mocha-500 bg-mocha-50"
                            : "hover:border-mocha-300 bg-white"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-ink-800 text-sm font-bold">{addr.addressName}</span>
                          {isDefault && <Star size={12} className="fill-honey text-honey" />}
                          {isSelected && (
                            <span className="bg-mocha-100 text-mocha-700 rounded-full px-2 py-0.5 text-[10px] font-bold">
                              선택됨
                            </span>
                          )}
                        </div>
                        <p className="text-ink-600 text-xs">
                          {addr.address}
                          {addr.addrDetail ? ` ${addr.addrDetail}` : ""}
                        </p>
                        {addr.receiverName && (
                          <p className="text-ink-400 mt-0.5 text-xs">
                            {addr.receiverName} · {addr.receiverPhone}
                          </p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <Link
              href="/profile/addresses"
              onClick={onClose}
              className="border-line text-mocha-700 mt-3 flex w-full items-center justify-center gap-2 rounded-xl border bg-white py-3 text-sm font-semibold"
            >
              <Plus size={15} />새 배송지 추가
            </Link>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
