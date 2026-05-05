"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Phase 0 stub — Phase 4에서 Plan B 토스페이먼츠 완전 구현
export default function CheckoutSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), 2000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="bg-paper flex min-h-screen flex-col items-center justify-center gap-3 px-8">
      <CheckCircle2 className="text-sage h-14 w-14" />
      <h2 className="font-display text-mocha-900 text-xl">결제 완료!</h2>
      <p className="text-ink-500 text-sm">주문이 성공적으로 접수되었습니다.</p>
    </div>
  );
}
