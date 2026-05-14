/**
 * 이미지 리사이징 유틸리티 (Canvas API 기반, 클라이언트 전용)
 * - stretch 모드: targetWidth + targetHeight 모두 지정 → 비율 무시 강제 맞춤
 * - fit-width 모드: targetWidth만 지정 → 가로 고정, 세로 원본 비율 유지
 */

export function resizeImage(
  source: File | Blob,
  targetWidth: number,
  targetHeight?: number,
  outputFileName = "resized.png"
): Promise<{ file: File; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(source);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const drawHeight =
        targetHeight ?? Math.round(targetWidth * (img.naturalHeight / img.naturalWidth));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = drawHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context를 생성할 수 없습니다."));
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, drawHeight);
      const dataUrl = canvas.toDataURL("image/png");

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("이미지 변환에 실패했습니다."));
          return;
        }
        const file = new File([blob], outputFileName, { type: "image/png" });
        resolve({ file, dataUrl });
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 로드할 수 없습니다."));
    };

    img.src = objectUrl;
  });
}
