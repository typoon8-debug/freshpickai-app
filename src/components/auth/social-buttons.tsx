"use client";

import { useTransition } from "react";
import { signInWithKakao } from "@/lib/actions/auth/kakao";
import { signInWithApple } from "@/lib/actions/auth/apple";
import { cn } from "@/lib/utils";

interface SocialButtonsProps {
  onEmailClick?: () => void;
  className?: string;
}

export function SocialButtons({ onEmailClick, className }: SocialButtonsProps) {
  const [kakaoLoading, startKakao] = useTransition();
  const [appleLoading, startApple] = useTransition();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* 카카오 버튼 */}
      <button
        type="button"
        disabled={kakaoLoading}
        onClick={() => startKakao(() => signInWithKakao())}
        className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded bg-[#FEE500] text-[15px] font-semibold text-[#191919] transition hover:brightness-95 disabled:opacity-60"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 2C5.582 2 2 4.896 2 8.455c0 2.278 1.468 4.28 3.687 5.43l-.94 3.484 4.075-2.678A9.3 9.3 0 0 0 10 14.91c4.418 0 8-2.896 8-6.455C18 4.896 14.418 2 10 2Z"
            fill="#191919"
          />
        </svg>
        {kakaoLoading ? "연결 중…" : "카카오로 시작하기"}
      </button>

      {/* 애플 버튼 */}
      <button
        type="button"
        disabled={appleLoading}
        onClick={() => startApple(() => signInWithApple())}
        className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded bg-[#000000] text-[15px] font-semibold text-white transition hover:bg-[#1a1a1a] disabled:opacity-60"
      >
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
          <path
            d="M15.026 10.65c-.025-2.752 2.25-4.087 2.352-4.152-1.283-1.876-3.276-2.133-3.98-2.163-1.686-.172-3.302 1.001-4.157 1.001-.864 0-2.185-.977-3.598-.95C3.844 4.413 2.11 5.328 1.15 6.812c-1.965 3.4-.501 8.428 1.4 11.187.939 1.353 2.049 2.865 3.503 2.812 1.413-.057 1.944-.902 3.651-.902 1.695 0 2.185.902 3.664.876 1.52-.026 2.474-1.366 3.4-2.726 1.082-1.558 1.52-3.085 1.544-3.164-.035-.013-2.95-1.128-2.986-4.244Z"
            fill="white"
          />
          <path
            d="M12.174 2.9C12.95 1.956 13.475.678 13.33 0c-1.195.05-2.654.797-3.466 1.727-.753.84-1.416 2.19-1.244 3.471 1.34.1 2.707-.675 3.554-2.298Z"
            fill="white"
          />
        </svg>
        {appleLoading ? "연결 중…" : "Apple로 계속하기"}
      </button>

      {/* 이메일 버튼 */}
      <button
        type="button"
        onClick={onEmailClick}
        className="border-line text-ink-700 hover:bg-mocha-50 flex min-h-[52px] w-full items-center justify-center gap-2 rounded border text-[15px] transition"
      >
        이메일로 시작하기
      </button>
    </div>
  );
}
