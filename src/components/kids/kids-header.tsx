"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface KidsHeaderProps {
  kidName?: string;
}

export function KidsHeader({ kidName = "하준" }: KidsHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex h-14 items-center justify-between px-4">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="text-mocha-600 flex min-h-[44px] min-w-[44px] items-center gap-1.5"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">부모 모드 복귀</span>
      </button>
      <p className="font-display text-mocha-700 text-base">{kidName}의 음식 선택</p>
      <div className="w-24" />
    </header>
  );
}
