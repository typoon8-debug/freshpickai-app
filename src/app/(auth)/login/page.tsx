"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { SocialButtons } from "@/components/auth/social-buttons";
import { EmailLoginForm } from "@/components/auth/email-login-form";

type View = "login" | "email";

const STATS = [
  { value: "2.4M", label: "고객" },
  { value: "180+", label: "카드" },
  { value: "4.9", label: "평점" },
];

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");

  return (
    <main className="bg-paper flex min-h-screen flex-col justify-between px-6 py-12">
      <div className="max-w-phone mx-auto flex w-full flex-col gap-10">
        {/* 브랜드 헤더 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-mocha-700 flex h-9 w-9 items-center justify-center rounded-lg">
              <Leaf size={20} className="text-paper" />
            </div>
            <span className="font-display text-mocha-900 text-2xl tracking-tight">FreshPick</span>
          </div>
          <div>
            <h1 className="font-display text-mocha-900 text-[28px] leading-tight">
              우리가족 AI 큐레이팅
              <br />
              <span className="text-mocha-700">장보기</span>
            </h1>
            <p className="text-ink-500 mt-2 text-sm leading-relaxed">
              다양한 테마 카드로 메뉴를 고르고
              <br />
              재료를 바로바로 배송 받으세요
            </p>
          </div>
        </div>

        {/* 서비스 통계 */}
        <div className="shadow-card flex justify-around rounded-xl bg-white px-4 py-5">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="font-display text-mocha-700 text-xl">{value}</span>
              <span className="text-ink-400 text-xs">{label}</span>
            </div>
          ))}
        </div>

        {/* 로그인 폼 영역 */}
        {view === "login" ? (
          <div className="flex flex-col gap-6">
            <SocialButtons onEmailClick={() => setView("email")} />
            <p className="text-ink-700 text-center text-xs">
              로그인 시{" "}
              <button type="button" className="text-ink-700 underline">
                서비스 이용약관
              </button>{" "}
              및{" "}
              <button type="button" className="text-ink-700 underline">
                개인정보 처리방침
              </button>
              에 동의합니다
            </p>
          </div>
        ) : (
          <EmailLoginForm onBack={() => setView("login")} />
        )}
      </div>

      {/* 온보딩 진입 */}
      <div className="max-w-phone mx-auto w-full">
        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="text-ink-400 hover:text-ink-600 w-full text-center text-xs"
        >
          FreshPick 처음이세요? 서비스 둘러보기 →
        </button>
      </div>
    </main>
  );
}
