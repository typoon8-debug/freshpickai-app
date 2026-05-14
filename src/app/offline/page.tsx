"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, FileText, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartItem {
  cartItemId: string;
  name: string;
  qty: number;
  price: number;
}

interface MemoItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
}

interface OfflineData {
  cartItems: CartItem[];
  memoItems: MemoItem[];
}

function loadOfflineData(): OfflineData {
  const result: OfflineData = { cartItems: [], memoItems: [] };
  if (typeof window === "undefined") return result;
  try {
    const cartRaw = localStorage.getItem("fp-cart");
    if (cartRaw) {
      const parsed = JSON.parse(cartRaw) as { state?: { items?: CartItem[] } };
      result.cartItems = parsed.state?.items ?? [];
    }
  } catch {
    // localStorage 접근 불가
  }
  try {
    const memoRaw = localStorage.getItem("fp-memo");
    if (memoRaw) {
      const parsed = JSON.parse(memoRaw) as { state?: { items?: MemoItem[] } };
      result.memoItems = parsed.state?.items ?? [];
    }
  } catch {
    // localStorage 접근 불가
  }
  return result;
}

export default function OfflinePage() {
  const [data, setData] = useState<OfflineData>({ cartItems: [], memoItems: [] });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loadOfflineData());
  }, []);

  const { cartItems, memoItems } = data;
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      data-testid="offline-page"
    >
      <div className="w-full max-w-md space-y-8 text-center">
        {/* 오프라인 아이콘 */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-muted rounded-full p-5">
            <Wifi className="text-muted-foreground h-10 w-10 opacity-40" />
          </div>
          <h1 className="text-foreground text-2xl font-bold">인터넷이 연결되지 않았어요</h1>
          <p className="text-muted-foreground text-sm">
            네트워크 연결을 확인하고 다시 시도해 주세요.
            <br />
            아래에서 저장된 장바구니를 확인할 수 있어요.
          </p>
        </div>

        {/* 장바구니 캐시 */}
        {cartItems.length > 0 && (
          <div className="bg-card rounded-xl border p-4 text-left" data-testid="offline-cart">
            <div className="mb-3 flex items-center gap-2">
              <ShoppingCart className="text-primary h-4 w-4" />
              <span className="text-sm font-semibold">저장된 장바구니 ({cartItems.length}개)</span>
            </div>
            <ul className="space-y-2">
              {cartItems.slice(0, 5).map((item) => (
                <li key={item.cartItemId} className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate">{item.name}</span>
                  <span className="text-muted-foreground ml-2 whitespace-nowrap">
                    {item.qty}개 · {(item.price * item.qty).toLocaleString()}원
                  </span>
                </li>
              ))}
              {cartItems.length > 5 && (
                <li className="text-muted-foreground text-xs">외 {cartItems.length - 5}개 상품</li>
              )}
            </ul>
            <div className="mt-3 border-t pt-3 text-right text-sm font-semibold">
              합계: {cartTotal.toLocaleString()}원
            </div>
          </div>
        )}

        {/* 메모 캐시 */}
        {memoItems.length > 0 && (
          <div className="bg-card rounded-xl border p-4 text-left" data-testid="offline-memo">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="text-primary h-4 w-4" />
              <span className="text-sm font-semibold">저장된 메모 ({memoItems.length}개)</span>
            </div>
            <ul className="space-y-1">
              {memoItems.slice(0, 5).map((item) => (
                <li key={item.id} className="text-foreground text-sm">
                  {item.name} {item.qty}
                  {item.unit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => window.location.reload()}
            className="min-h-[44px] w-full gap-2"
            data-testid="offline-retry-btn"
          >
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>
          <Link href="/" className="w-full">
            <Button variant="outline" className="min-h-[44px] w-full">
              홈으로
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
