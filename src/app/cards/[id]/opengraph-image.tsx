import { ImageResponse } from "next/og";
import { getCardDetail } from "@/lib/actions/cards/detail";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

export default async function OGImage({ params }: Props) {
  const { id } = await params;
  const detail = await getCardDetail(id);

  const name = detail?.name ?? "FreshPick AI 카드메뉴";
  const emoji = detail?.emoji ?? "🍽️";
  const healthScore = detail?.healthScore ?? 0;
  const priceMin = detail?.priceMin ?? 0;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: "linear-gradient(135deg, #FFF8F3 0%, #F0DFD0 100%)",
        fontFamily: "sans-serif",
      }}
    >
      {/* 브랜드 헤더 */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "#6B4A2E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
          }}
        >
          🛒
        </div>
        <span
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#6B4A2E",
          }}
        >
          FreshPick AI
        </span>
      </div>

      {/* 메인 콘텐츠 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          gap: 24,
          paddingBottom: 40,
        }}
      >
        <div style={{ fontSize: 120, lineHeight: 1 }}>{emoji}</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#1A1008",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.2,
          }}
        >
          {name}
        </div>

        {/* 지표 배지 */}
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          {healthScore > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#E8F5E9",
                borderRadius: 50,
                padding: "12px 28px",
              }}
            >
              <span style={{ fontSize: 28 }}>💚</span>
              <span
                style={{
                  fontSize: 26,
                  color: "#2E7D32",
                  fontWeight: 600,
                }}
              >
                건강 점수 {healthScore}점
              </span>
            </div>
          )}
          {priceMin > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#FFF3E0",
                borderRadius: 50,
                padding: "12px 28px",
              }}
            >
              <span style={{ fontSize: 28 }}>💰</span>
              <span
                style={{
                  fontSize: 26,
                  color: "#E65100",
                  fontWeight: 600,
                }}
              >
                약 {priceMin.toLocaleString()}원~
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 하단 태그라인 */}
      <div
        style={{
          position: "absolute",
          bottom: 44,
          right: 60,
          fontSize: 22,
          color: "#9E7A5A",
        }}
      >
        우리가족 AI 큐레이팅 장보기
      </div>
    </div>,
    { ...size }
  );
}
