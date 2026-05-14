"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Users, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { generateInviteCode } from "@/lib/family/invite-code";
import { initKakao, isKakaoShareReady, shareFamilyInvite } from "@/lib/share/kakao";

interface FamilyInviteProps {
  groupName?: string;
  inviterName?: string;
  /** 외부에서 미리 생성된 코드를 받을 경우 사용. 미지정 시 client mount 후 nanoid로 생성. */
  presetCode?: string;
}

export function FamilyInvite({
  groupName = "우리가족",
  inviterName = "엄마",
  presetCode,
}: FamilyInviteProps) {
  // 코드는 client mount 후 1회 생성 (SSR-safe + react-hooks/purity 준수)
  const [inviteCode, setInviteCode] = useState<string | null>(presetCode ?? null);
  const [copied, setCopied] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);

  useEffect(() => {
    // SSR-safe nanoid 생성을 위해 client mount 후 1회 set (hydration mismatch 회피)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!presetCode) setInviteCode(generateInviteCode());
  }, [presetCode]);

  useEffect(() => {
    // 카카오 SDK는 next/script가 afterInteractive로 로드 → 약간의 폴링이 안전
    const id = setInterval(() => {
      if (initKakao()) {
        setKakaoReady(isKakaoShareReady());
        clearInterval(id);
      }
    }, 300);
    return () => clearInterval(id);
  }, []);

  const inviteUrl = useMemo(() => {
    if (!inviteCode) return "";
    const base =
      process.env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/family/invite/${inviteCode}`;
  }, [inviteCode]);

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKakaoShare = () => {
    if (!inviteCode || !inviteUrl) return;
    shareFamilyInvite({ inviteCode, inviteUrl, groupName, inviterName });
  };

  return (
    <section className="px-4">
      <div className="border-line overflow-hidden rounded-lg border bg-white">
        <div className="border-line border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-mocha-500" />
            <h3 className="text-ink-700 text-sm font-semibold">가족 초대하기</h3>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 px-4 py-5">
          {/* QR 코드 — 흰 배경 quiet zone 필수 */}
          <div className="border-line rounded-lg border bg-white p-3">
            {inviteCode ? (
              <QRCodeSVG
                value={inviteUrl}
                size={140}
                level="M"
                fgColor="#2C1810"
                bgColor="#FFFFFF"
              />
            ) : (
              <div className="bg-mocha-50 h-[140px] w-[140px] animate-pulse rounded-md" />
            )}
          </div>

          <div className="w-full">
            <p className="text-ink-500 text-xs">초대 코드 (6자리)</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-display text-mocha-700 font-mono text-2xl tracking-widest tabular-nums">
                {inviteCode ?? "------"}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!inviteCode}
                className="bg-mocha-50 text-mocha-700 hover:bg-mocha-100 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-sage" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    링크 복사
                  </>
                )}
              </button>
            </div>

            {/* 카카오톡 공유 — SDK 미로드 시 graceful degradation */}
            <button
              type="button"
              onClick={handleKakaoShare}
              disabled={!inviteCode || !kakaoReady}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FEE500] px-3 py-2.5 text-xs font-semibold text-[#191919] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="카카오톡으로 가족 초대 보내기"
            >
              <Share2 size={14} />
              {kakaoReady ? "카카오톡으로 공유" : "카카오톡 공유 (설정 필요)"}
            </button>

            <p className="text-ink-400 mt-2 text-[11px]">
              QR을 찍거나 링크/카카오로 보내면 가족이 바로 합류할 수 있어요
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
