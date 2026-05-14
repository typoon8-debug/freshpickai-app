"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { MenuCard } from "@/components/cards/menu-card";
import { resizeImage } from "@/lib/utils/image-resize";
import type { MenuCard as MenuCardType, CardTheme } from "@/lib/types";
import { THEME_GUIDES } from "@/data/wizard-guide-keywords";

interface Step4PreviewProps {
  cardName: string;
  theme: CardTheme | null;
  tags: string[];
  budget: string;
  coverImageUrl?: string;
  submitForReview: boolean;
  aiConsent: boolean;
  onCardNameChange: (name: string) => void;
  onCoverImageChange: (url: string | undefined) => void;
  onSubmitForReviewChange: (v: boolean) => void;
  onAiConsentChange: (v: boolean) => void;
}

const CARD_W = 375;
const CARD_H = 500;

export function Step4Preview({
  cardName,
  theme,
  tags,
  budget,
  coverImageUrl,
  submitForReview,
  aiConsent,
  onCardNameChange,
  onCoverImageChange,
  onSubmitForReviewChange,
  onAiConsentChange,
}: Step4PreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | undefined>(coverImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const autoName = tags.slice(0, 2).join(" · ");
  const displayName = cardName || autoName || "나만의 카드";
  const guide = theme ? THEME_GUIDES[theme] : null;

  const previewCard: MenuCardType = {
    cardId: "preview",
    cardTheme: theme ?? "one_meal",
    name: displayName,
    subtitle: "직접 만든 카드메뉴",
    taste: tags.slice(0, 3).join(","),
    category: "meal",
    emoji: "🍽️",
    coverImage: previewDataUrl,
    isOfficial: false,
    isNew: true,
    reviewStatus: submitForReview ? "pending" : "private",
    healthScore: 0.75,
    priceMin: budget ? parseInt(budget) : undefined,
  };

  const handleFileSelect = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    try {
      const { file: resized, dataUrl } = await resizeImage(file, CARD_W, CARD_H, "cover.png");
      setPreviewDataUrl(dataUrl);

      const fd = new FormData();
      fd.append("file", resized);
      const res = await fetch("/api/cards/cover", { method: "POST", body: fd });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "업로드 실패");
      }
      const { url } = (await res.json()) as { url: string };
      onCoverImageChange(url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "업로드 실패");
      setPreviewDataUrl(undefined);
      onCoverImageChange(undefined);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5" data-testid="step4-preview">
      {/* 카드 이름 입력 */}
      <div>
        <p className="text-ink-700 mb-2 text-sm font-semibold">카드 이름</p>
        <input
          value={cardName}
          onChange={(e) => onCardNameChange(e.target.value)}
          placeholder={guide?.menuNamePlaceholder ?? "예) 나만의 스페셜 밥상"}
          maxLength={30}
          data-testid="wizard-card-name-input"
          className="border-line text-ink-900 placeholder:text-ink-300 focus:border-mocha-500 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
        />
        <p className="text-ink-400 mt-1 text-right text-xs">{cardName.length}/30</p>
      </div>

      {/* 커버 이미지 업로드 */}
      <div>
        <p className="text-ink-700 mb-2 text-sm font-semibold">
          커버 이미지 <span className="text-ink-400 font-normal">(선택)</span>
        </p>
        <div className="flex items-start gap-3">
          {/* 미리보기 */}
          <div className="border-line relative h-25 w-18.75 shrink-0 overflow-hidden rounded-xl border bg-gray-100">
            {previewDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewDataUrl}
                alt="커버 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">🍽️</div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
                <span className="text-xs text-gray-500">업로드 중...</span>
              </div>
            )}
          </div>

          {/* 버튼 영역 */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="border-line text-ink-700 flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium active:bg-gray-50 disabled:opacity-50"
            >
              <Camera size={16} />
              카메라/앨범에서 선택
            </button>
            {previewDataUrl && !isUploading && (
              <button
                type="button"
                onClick={() => {
                  setPreviewDataUrl(undefined);
                  onCoverImageChange(undefined);
                }}
                className="text-terracotta text-left text-xs"
              >
                이미지 삭제
              </button>
            )}
            <p className="text-ink-400 text-xs">권장: 3:4 비율 (375×500px)</p>
            {uploadError && <p className="text-terracotta text-xs">{uploadError}</p>}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* 카드 미리보기 */}
      <div>
        <p className="text-ink-500 mb-3 text-sm">완성될 카드 미리보기예요!</p>
        <div className="mx-auto max-w-50">
          <MenuCard card={previewCard} />
        </div>
      </div>

      {/* 검수 신청 */}
      <div className="border-mocha-200 bg-mocha-50 rounded-xl border p-4">
        <label
          className="flex cursor-pointer items-start gap-3"
          data-testid="wizard-submit-for-review-label"
        >
          <input
            type="checkbox"
            checked={submitForReview}
            onChange={(e) => onSubmitForReviewChange(e.target.checked)}
            data-testid="wizard-submit-for-review"
            className="border-mocha-300 accent-mocha-700 mt-0.5 h-4 w-4 rounded"
          />
          <div>
            <p className="text-mocha-800 text-sm font-semibold">공식 카드섹션에 신청</p>
            <p className="text-mocha-600 mt-0.5 text-xs">
              관리자 검토 후 공식 섹션에 등록될 수 있어요. 신청 시 검수 대기 상태로 전환됩니다.
            </p>
          </div>
        </label>
      </div>

      {/* AI 학습 동의 */}
      <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
        <label
          className="flex cursor-pointer items-start gap-3"
          data-testid="wizard-ai-consent-label"
        >
          <input
            type="checkbox"
            checked={aiConsent}
            onChange={(e) => onAiConsentChange(e.target.checked)}
            data-testid="wizard-ai-consent"
            className="mt-0.5 h-4 w-4 rounded border-sky-300 accent-sky-600"
          />
          <div>
            <p className="text-sm font-semibold text-sky-800">AI 학습 동의 (선택)</p>
            <p className="mt-0.5 text-xs text-sky-600">
              동의하면 내 레시피가 AI 학습에 활용되어 더 좋은 추천을 만들어요. 언제든 철회
              가능합니다.
            </p>
          </div>
        </label>
      </div>

      <p className="text-ink-400 text-center text-xs">저장 후 내 카드에서 확인할 수 있어요</p>
    </div>
  );
}
