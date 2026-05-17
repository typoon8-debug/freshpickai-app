"use client";

import { useState } from "react";
import { X, Share, Download } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export function InstallBanner() {
  const { showBanner, isIos, install, dismiss } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (!showBanner) return null;

  const handleInstall = () => {
    if (isIos) {
      setShowIosGuide(true);
    } else {
      install();
    }
  };

  return (
    <>
      {/* 하단 고정 배너 */}
      <div className="safe-area-pb fixed right-0 bottom-0 left-0 z-50">
        <div className="border-line mx-auto flex max-w-md items-center gap-3 border-t bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          {/* 앱 아이콘 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192x192.png"
            alt="FreshPick AI"
            width={44}
            height={44}
            className="shrink-0 rounded-xl"
          />

          {/* 텍스트 */}
          <div className="min-w-0 flex-1">
            <p className="text-ink-800 truncate text-sm font-semibold">FreshPick AI 앱 설치</p>
            <p className="text-ink-400 truncate text-xs">홈 화면에서 더 빠르게 실행하세요</p>
          </div>

          {/* 설치 버튼 */}
          <button
            type="button"
            onClick={handleInstall}
            className="bg-mocha-600 hover:bg-mocha-700 flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition active:scale-95"
          >
            {isIos ? (
              <>
                <Share size={12} strokeWidth={2.5} />
                설치
              </>
            ) : (
              <>
                <Download size={12} strokeWidth={2.5} />
                설치
              </>
            )}
          </button>

          {/* 닫기 */}
          <button
            type="button"
            onClick={dismiss}
            aria-label="배너 닫기"
            className="text-ink-300 hover:text-ink-500 shrink-0 rounded-full p-1 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* iOS 홈 화면 추가 안내 모달 */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 pb-0"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white px-6 pt-5 pb-10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 핸들 */}
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200" />

            <h3 className="text-ink-800 mb-4 text-center text-base font-semibold">
              홈 화면에 추가하는 방법
            </h3>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="bg-mocha-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                  1
                </span>
                <div>
                  <p className="text-ink-700 text-sm font-medium">Safari 하단 공유 버튼 탭</p>
                  <p className="text-ink-400 mt-0.5 flex items-center gap-1 text-xs">
                    <Share size={12} />
                    아이콘을 눌러주세요
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-mocha-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                  2
                </span>
                <div>
                  <p className="text-ink-700 text-sm font-medium">
                    &quot;홈 화면에 추가&quot; 선택
                  </p>
                  <p className="text-ink-400 mt-0.5 text-xs">스크롤을 내려 항목을 찾아주세요</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-mocha-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                  3
                </span>
                <div>
                  <p className="text-ink-700 text-sm font-medium">우측 상단 &quot;추가&quot; 탭</p>
                  <p className="text-ink-400 mt-0.5 text-xs">
                    홈 화면에 FreshPick AI 아이콘이 생겨요
                  </p>
                </div>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="bg-mocha-600 hover:bg-mocha-700 mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white transition"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
