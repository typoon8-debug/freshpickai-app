"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { ParsedItem } from "@/app/api/memo/parse/route";

interface Props {
  onParsed: (items: ParsedItem[], rawText: string) => void;
}

export function OCRCaptureButton({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/memo/ocr", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "이미지 파싱 실패");
        return;
      }

      const items = data as ParsedItem[];
      if (items.length === 0) {
        toast.error("인식된 항목이 없습니다. 다시 촬영해 보세요.");
        return;
      }

      const rawText = items.map((i) => `${i.name} ${i.qty}${i.unit}`).join("\n");
      onParsed(items, rawText);
      toast.success(`${items.length}개 항목을 인식했습니다`);
      setPreview(null);
    } catch {
      toast.error("이미지 처리 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleCancel = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="relative">
      {/* 미리보기 오버레이 */}
      {preview && (
        <div className="border-line relative mb-3 overflow-hidden rounded-xl border bg-gray-50">
          <div className="relative aspect-[4/3] w-full">
            <Image src={preview} alt="OCR 미리보기" fill className="object-contain" sizes="100vw" />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                <p className="text-xs text-white">이미지 분석 중...</p>
              </div>
            )}
          </div>
          {!loading && (
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white"
              aria-label="취소"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* 카메라 버튼 */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="border-line text-ink-600 hover:bg-mocha-50 flex min-h-[44px] items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium transition disabled:opacity-40"
        aria-label="카메라로 메모 촬영"
        data-testid="ocr-capture-button"
      >
        <Camera size={15} />
        {loading ? "분석 중..." : "카메라로 촬영"}
      </button>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-hidden="true"
        onChange={handleChange}
      />
    </div>
  );
}
