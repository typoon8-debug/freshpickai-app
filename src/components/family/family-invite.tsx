"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Share2, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { initKakao, isKakaoShareReady, shareFamilyInvite } from "@/lib/share/kakao";
import { CreateFamilyGroupForm } from "@/components/family/create-family-group-form";

interface FamilyInviteProps {
  groupName?: string;
  inviterName?: string;
  /** DB에 저장된 실제 invite_code. 미제공 시 공유 기능 비활성. */
  presetCode?: string;
}

export function FamilyInvite({
  groupName = "우리가족",
  inviterName = "나",
  presetCode,
}: FamilyInviteProps) {
  const [copied, setCopied] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (initKakao()) {
        setKakaoReady(isKakaoShareReady());
        clearInterval(id);
      }
    }, 300);
    return () => clearInterval(id);
  }, []);

  const inviteUrl = useMemo(() => {
    if (!presetCode) return "";
    const base =
      process.env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/family/invite/${presetCode}`;
  }, [presetCode]);

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKakaoShare = () => {
    if (!presetCode || !inviteUrl) return;
    shareFamilyInvite({ inviteCode: presetCode, inviteUrl, groupName, inviterName });
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

        {!presetCode ? (
          /* 그룹 없음 — 그룹 생성 폼 표시 */
          <CreateFamilyGroupForm />
        ) : (
          <div className="flex flex-col items-center gap-4 px-4 py-5">
            {/* QR 코드 */}
            <div className="border-line rounded-lg border bg-white p-3">
              <QRCodeSVG
                value={inviteUrl}
                size={140}
                level="M"
                fgColor="#2C1810"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="w-full">
              <p className="text-ink-500 text-xs">초대 코드 (6자리)</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-display text-mocha-700 font-mono text-2xl tracking-widest tabular-nums">
                  {presetCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-mocha-50 text-mocha-700 hover:bg-mocha-100 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition"
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

              <button
                type="button"
                onClick={handleKakaoShare}
                disabled={!kakaoReady}
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
        )}
      </div>
    </section>
  );
}
