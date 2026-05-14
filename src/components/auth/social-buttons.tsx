"use client";

import { useState, useTransition } from "react";
import { signInWithKakao } from "@/lib/actions/auth/kakao";
import { signInWithGoogle } from "@/lib/auth/oauth";
import { cn } from "@/lib/utils";

interface SocialButtonsProps {
  onEmailClick?: () => void;
  className?: string;
}

export function SocialButtons({ onEmailClick, className }: SocialButtonsProps) {
  const [kakaoLoading, startKakao] = useTransition();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* 카카오 버튼 */}
      <button
        type="button"
        disabled={kakaoLoading}
        onClick={() => startKakao(() => signInWithKakao())}
        className="flex min-h-13 w-full items-center justify-center gap-3 rounded bg-[#FEE500] text-[15px] font-semibold text-[#191919] transition hover:brightness-95 disabled:opacity-60"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 2C5.582 2 2 4.896 2 8.455c0 2.278 1.468 4.28 3.687 5.43l-.94 3.484 4.075-2.678A9.3 9.3 0 0 0 10 14.91c4.418 0 8-2.896 8-6.455C18 4.896 14.418 2 10 2Z"
            fill="#191919"
          />
        </svg>
        {kakaoLoading ? "연결 중…" : "카카오로 시작하기"}
      </button>

      {/* 구글 버튼 */}
      <button
        type="button"
        disabled={googleLoading}
        onClick={handleGoogleLogin}
        className="border-line flex min-h-13 w-full items-center justify-center gap-3 rounded border bg-white text-[15px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {googleLoading ? "연결 중…" : "구글로 시작하기"}
      </button>

      {/* 이메일 버튼 */}
      <button
        type="button"
        onClick={onEmailClick}
        className="border-line text-ink-700 hover:bg-mocha-50 flex min-h-13 w-full items-center justify-center gap-2 rounded border text-[15px] transition"
      >
        이메일로 시작하기
      </button>
    </div>
  );
}
