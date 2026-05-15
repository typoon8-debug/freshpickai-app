"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Store, MapPin, Phone, Clock, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getMyShops,
  getNearbyStores,
  addMyShop,
  deactivateMyShop,
  selectMyStore,
  type MyShop,
  type NearbyStore,
} from "@/lib/actions/store/index";

type Mode = "list" | "add";

interface Props {
  initialShops: MyShop[];
  initialCurrentStoreId: string | null;
}

function formatDistance(m: number | null) {
  if (m == null) return null;
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

export default function MyStoreClient({ initialShops, initialCurrentStoreId }: Props) {
  const [mode, setMode] = useState<Mode>("list");
  const [shops, setShops] = useState<MyShop[]>(initialShops);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(initialCurrentStoreId);
  const [nearbyStores, setNearbyStores] = useState<NearbyStore[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [addingId, setAddingId] = useState<string | null>(null);

  const refreshShops = async () => {
    const result = await getMyShops();
    setShops(result.shops);
    setCurrentStoreId(result.currentStoreId);
  };

  const openAddMode = async () => {
    setMode("add");
    setNearbyLoading(true);
    const stores = await getNearbyStores();
    setNearbyStores(stores);
    setNearbyLoading(false);
  };

  const handleSelectStore = (storeId: string) => {
    startTransition(async () => {
      const result = await selectMyStore(storeId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setCurrentStoreId(storeId);
      toast.success("이용 가게가 변경되었습니다.");
    });
  };

  const handleDeactivate = (storeId: string) => {
    startTransition(async () => {
      const result = await deactivateMyShop(storeId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("가게 연결이 해제되었습니다.");
      await refreshShops();
    });
  };

  const handleAdd = async (storeId: string) => {
    setAddingId(storeId);
    const result = await addMyShop(storeId);
    setAddingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("가게가 추가되었습니다.");
    setNearbyStores((prev) =>
      prev.map((s) => (s.storeId === storeId ? { ...s, alreadyJoined: true } : s))
    );
    await refreshShops();
  };

  return (
    <div className="min-h-screen pb-12">
      {/* 헤더 */}
      <header className="border-line bg-paper sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
        {mode === "list" ? (
          <Link href="/profile" aria-label="뒤로가기">
            <ChevronLeft size={22} className="text-ink-700" />
          </Link>
        ) : (
          <button onClick={() => setMode("list")} className="text-ink-700" aria-label="뒤로가기">
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 className="text-ink-800 flex-1 text-base font-bold">
          {mode === "list" ? "내가게" : "다른 가게 추가"}
        </h1>
      </header>

      {/* 목록 모드 */}
      {mode === "list" && (
        <div className="space-y-4 p-4">
          {shops.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Store size={48} className="text-ink-200" />
              <p className="text-ink-500 text-sm font-medium">연결된 가게가 없어요</p>
              <p className="text-ink-400 text-xs">아래 버튼으로 가게를 추가해보세요</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {shops.map((shop) => {
                const isActive = shop.storeId === currentStoreId;
                return (
                  <li key={shop.storeId} className="border-line rounded-xl border bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-ink-800 text-sm font-bold">{shop.storeName}</span>
                          {isActive && (
                            <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                              이용중
                            </span>
                          )}
                        </div>
                        <p className="text-ink-400 text-xs">
                          포인트 {shop.pointBalance.toLocaleString()}P · 가입일{" "}
                          {new Date(shop.createdAt).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </p>
                        {shop.storeAddress && (
                          <div className="mt-1.5 flex items-start gap-1.5">
                            <MapPin size={12} className="text-ink-400 mt-0.5 shrink-0" />
                            <p className="text-ink-500 text-xs">{shop.storeAddress}</p>
                          </div>
                        )}
                        {shop.storePhone && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <Phone size={12} className="text-ink-400 shrink-0" />
                            <p className="text-ink-500 text-xs">{shop.storePhone}</p>
                          </div>
                        )}
                        {shop.operationHours && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <Clock size={12} className="text-ink-400 shrink-0" />
                            <p className="text-ink-500 text-xs">{shop.operationHours}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        {!isActive && (
                          <Button
                            size="sm"
                            className="bg-mocha-700 h-7 px-2 text-xs text-white"
                            disabled={isPending}
                            onClick={() => handleSelectStore(shop.storeId)}
                          >
                            선택
                          </Button>
                        )}
                        {!isActive && (
                          <button
                            className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-400 disabled:opacity-50"
                            disabled={isPending}
                            onClick={() => handleDeactivate(shop.storeId)}
                          >
                            해제
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            onClick={openAddMode}
            className="border-line text-ink-500 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            다른 가게 추가
          </button>
        </div>
      )}

      {/* 가게 추가 모드 */}
      {mode === "add" && (
        <div className="p-4">
          {nearbyLoading ? (
            <p className="text-ink-400 py-12 text-center text-sm">주변 가게를 검색 중...</p>
          ) : nearbyStores.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <Store size={48} className="text-ink-200" />
              <p className="text-ink-500 text-sm">주변에 이용 가능한 가게가 없어요</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {nearbyStores.map((store) => (
                <li key={store.storeId} className="border-line rounded-xl border bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-ink-800 text-sm font-semibold">
                          {store.storeName}
                        </span>
                        {!store.inRange && (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                            배송권역 밖
                          </span>
                        )}
                      </div>
                      {store.storeAddress && (
                        <p className="text-ink-400 text-xs">{store.storeAddress}</p>
                      )}
                      {store.distanceM != null && (
                        <p className="text-mocha-600 mt-0.5 text-xs font-medium">
                          {formatDistance(store.distanceM)}
                        </p>
                      )}
                    </div>
                    {store.alreadyJoined ? (
                      <div className="flex shrink-0 items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 size={14} />
                        등록됨
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-mocha-700 shrink-0 text-white"
                        disabled={addingId === store.storeId}
                        onClick={() => handleAdd(store.storeId)}
                      >
                        {addingId === store.storeId ? "추가 중..." : "추가"}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
