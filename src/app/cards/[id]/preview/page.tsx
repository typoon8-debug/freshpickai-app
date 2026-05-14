import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCardDetail } from "@/lib/actions/cards/detail";

type Props = { params: Promise<{ id: string }> };

const THEME_LABELS: Record<string, string> = {
  chef_table: "흑백요리사",
  one_meal: "한 끼",
  family_recipe: "엄마손맛",
  drama_recipe: "드라마한끼",
  honwell: "혼웰빙",
  seasonal: "제철한상",
  global_plate: "글로벌",
  k_dessert: "K디저트",
  snack_pack: "간식팩",
  cinema_night: "홈시네마",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await getCardDetail(id);
  if (!detail) return { title: "FreshPick AI" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const ogImageUrl = `${appUrl}/cards/${id}/opengraph-image`;
  const previewUrl = `${appUrl}/cards/${id}/preview`;
  const title = `${detail.emoji ?? ""} ${detail.name} — FreshPick AI`.trim();
  const description =
    detail.description ?? `FreshPick AI에서 ${detail.name} 레시피와 재료를 한번에 주문하세요.`;

  return {
    title,
    description,
    openGraph: {
      title: `${detail.emoji ?? ""} ${detail.name}`.trim(),
      description: "FreshPick AI로 오늘 우리 가족 뭐 먹을지 골라봐요!",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: detail.name }],
      url: previewUrl,
      type: "website",
      siteName: "FreshPick AI",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function CardPreviewPage({ params }: Props) {
  const { id } = await params;
  const detail = await getCardDetail(id);
  if (!detail) notFound();

  const themeName = THEME_LABELS[detail.cardTheme] ?? detail.cardTheme;
  const totalIngredients = detail.dishes.reduce((sum, d) => sum + d.ingredients.length, 0);

  return (
    <div
      className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#FFF8F3] to-[#F0DFD0] px-4 py-8"
      data-testid="card-preview-page"
    >
      <div className="w-full max-w-md">
        {/* 브랜드 헤더 */}
        <div className="mb-6 flex items-center gap-2" data-testid="preview-header">
          <span className="text-xl">🛒</span>
          <span className="text-lg font-bold text-[#6B4A2E]">FreshPick AI</span>
        </div>

        {/* 카드 정보 */}
        <div className="mb-4 rounded-2xl bg-white p-6 shadow-md" data-testid="preview-card-info">
          <div className="mb-3 flex items-start gap-4">
            <span className="text-5xl leading-none" data-testid="preview-card-emoji">
              {detail.emoji ?? "🍽️"}
            </span>
            <div className="min-w-0 flex-1">
              <span className="rounded-full bg-[#FFF3E8] px-2 py-0.5 text-xs text-[#9E7A5A]">
                {themeName}
              </span>
              <h1
                className="mt-1 text-2xl font-bold break-keep text-gray-900"
                data-testid="preview-card-name"
              >
                {detail.name}
              </h1>
            </div>
          </div>

          {detail.description && <p className="mb-4 text-sm text-gray-500">{detail.description}</p>}

          {/* 지표 배지 */}
          <div className="flex flex-wrap gap-2" data-testid="preview-badges">
            {(detail.healthScore ?? 0) > 0 && (
              <div
                className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5"
                data-testid="preview-health-score"
              >
                <span>💚</span>
                <span className="text-sm font-medium text-green-700">
                  건강 {detail.healthScore}점
                </span>
              </div>
            )}
            {(detail.priceMin ?? 0) > 0 && (
              <div
                className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5"
                data-testid="preview-price"
              >
                <span>💰</span>
                <span className="text-sm font-medium text-orange-700">
                  약 {(detail.priceMin ?? 0).toLocaleString()}원~
                </span>
              </div>
            )}
            {totalIngredients > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1.5">
                <span>🛒</span>
                <span className="text-sm font-medium text-sky-700">
                  재료 {totalIngredients}가지
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 구성 음식 미리보기 */}
        {detail.dishes.length > 0 && (
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm" data-testid="preview-dishes">
            <h2 className="mb-2 text-sm font-semibold text-gray-500">구성 음식</h2>
            <ul className="space-y-1">
              {detail.dishes.map((dish) => (
                <li key={dish.dishId} className="text-sm text-gray-700">
                  · {dish.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-[#6B4A2E] p-6 text-center" data-testid="preview-cta">
          <p className="mb-3 text-sm text-[#D4B89A]">
            FreshPick AI에서
            <br />
            <strong className="text-white">{detail.name}</strong> 재료를 한번에 주문해보세요!
          </p>
          <Link
            href="/login"
            className="block w-full rounded-xl bg-white py-3 text-center font-bold text-[#6B4A2E] transition-colors hover:bg-[#FFF8F3]"
            data-testid="preview-cta-link"
          >
            FreshPickAI 시작하기 →
          </Link>
          <p className="mt-3 text-xs text-[#9E7A5A]">가입 후 바로 장바구니에 담을 수 있어요</p>
        </div>
      </div>
    </div>
  );
}
