import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ShoppingCart,
  Heart,
  ChevronDown,
  Star,
  Bot,
  ChefHat,
  Sparkles,
  FileText,
} from "lucide-react";
import {
  getItemByIdAction,
  getStoreInfoAction,
  getItemReviewsAction,
  getSimilarItemsAction,
} from "@/lib/actions/category";
import { ItemDetailBottomBar } from "./_components/item-detail-bottom-bar";
import { QuickAddButton } from "./_components/quick-add-button";
import { parseDescriptionSections, parseCookingUsage } from "@/lib/utils/item-parsers";

type Props = { params: Promise<{ itemId: string }> };

export default async function ItemDetailPage({ params }: Props) {
  const { itemId } = await params;

  const item = await getItemByIdAction(itemId);
  if (!item) notFound();

  const [store, reviews, similarItems] = await Promise.all([
    item.storeId ? getStoreInfoAction(item.storeId) : Promise.resolve(null),
    getItemReviewsAction(itemId),
    item.storeId && item.stdMediumCode
      ? getSimilarItemsAction({
          storeId: item.storeId,
          stdMediumCode: item.stdMediumCode,
          excludeItemId: itemId,
        })
      : Promise.resolve([]),
  ]);

  const price = item.effectiveSalePrice ?? item.listPrice;
  const hasDiscount =
    (item.discountPct ?? 0) > 0 &&
    item.listPrice != null &&
    item.effectiveSalePrice != null &&
    item.listPrice > item.effectiveSalePrice;

  const imageSrc = item.thumbnailBig ?? item.itemImage ?? item.thumbnailSmall;

  const descSections = item.descriptionMarkup
    ? parseDescriptionSections(item.descriptionMarkup)
    : [];
  const cookingUsages = item.aiCookingUsage ? parseCookingUsage(item.aiCookingUsage) : [];

  const aiDate = item.aiGeneratedAt
    ? new Date(item.aiGeneratedAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    : null;

  const aiConfidencePct =
    item.aiConfidence != null ? Math.round(Number(item.aiConfidence) * 100) : null;

  const detailImages = [item.detailImgAdv1, item.detailImgAdv2, item.detailImgAdv3].filter(
    Boolean
  ) as string[];

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen pb-28">
      {/* ─── 헤더 ─── */}
      <header className="border-line bg-paper sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
        <Link href="/category" aria-label="뒤로가기">
          <ChevronLeft size={22} className="text-ink-700" />
        </Link>
        <span className="text-ink-800 flex-1 truncate text-sm font-semibold">상품상세</span>
        <Heart size={20} className="text-ink-400" />
        <Link href="/cart" aria-label="장바구니">
          <ShoppingCart size={20} className="text-ink-400" />
        </Link>
      </header>

      {/* ─── 상품 이미지 ─── */}
      <div className="relative w-full bg-gray-50" style={{ aspectRatio: "1 / 1" }}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={item.itemName}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 640px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">🛒</div>
        )}
        {item.isInStock === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-xl bg-black/70 px-4 py-2 text-base font-bold text-white">
              품절
            </span>
          </div>
        )}
      </div>

      {/* ─── 상품 정보 블록 ─── */}
      <div className="bg-paper px-4 pt-4 pb-5">
        {/* 스토어명 */}
        {store?.storeName && <p className="text-ink-400 mb-1 text-xs">{store.storeName}</p>}

        {/* 상품명 */}
        <h1 className="text-ink-900 text-base leading-snug font-bold">{item.itemName}</h1>

        {/* AI 태그 칩 */}
        {item.aiTags.length > 0 && (
          <div className="scrollbar-none mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
            {item.aiTags.slice(0, 10).map((tag) => (
              <span
                key={tag}
                className="border-line text-ink-600 shrink-0 rounded-full border bg-gray-50 px-2.5 py-0.5 text-[11px]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 가격 블록 */}
        <div className="mt-3">
          {price != null ? (
            <div className="flex items-baseline gap-2">
              {hasDiscount && (
                <span className="text-lg font-bold text-red-500">
                  {Math.round(item.discountPct!)}%
                </span>
              )}
              <span className="text-ink-900 text-2xl font-bold">{price.toLocaleString()}원</span>
            </div>
          ) : (
            <span className="text-ink-400 text-sm">가격 미정</span>
          )}
          {hasDiscount && (
            <p className="text-ink-400 mt-0.5 text-sm line-through">
              {item.listPrice!.toLocaleString()}원
            </p>
          )}
        </div>

        {/* 프로모션 뱃지 */}
        {item.promoName && (
          <span className="bg-mocha-100 text-mocha-700 mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
            {item.promoName}
          </span>
        )}
      </div>

      {/* ─── 구분선 ─── */}
      <div className="h-2 bg-gray-100" />

      {/* ─── AI 추천 문구 ─── */}
      {item.aiAdCopy && (
        <div className="px-4 py-5">
          <div className="rounded-xl bg-green-50 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-green-700">
              <Sparkles size={13} />
              AI 추천 문구
            </p>
            <p className="text-ink-700 text-sm leading-relaxed">{item.aiAdCopy}</p>
          </div>
        </div>
      )}

      {/* ─── AI 제품 설명 ─── */}
      {descSections.length > 0 && (
        <div className="px-4 pb-5">
          <h2 className="text-ink-900 mb-3 flex items-center gap-1.5 text-sm font-bold">
            <FileText size={14} className="text-mocha-500" />
            AI 제품 설명
          </h2>
          <div className="space-y-4">
            {descSections.map((sec) => (
              <div key={sec.title}>
                <h3 className="text-ink-800 mb-1.5 text-sm font-bold">{sec.title}</h3>
                <p className="text-ink-600 text-[13px] leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 요리 활용법 ─── */}
      {cookingUsages.length > 0 && (
        <div className="px-4 pb-5">
          <div className="border-line rounded-xl border bg-white p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-amber-600">
              <ChefHat size={15} />
              요리 활용법
            </p>
            <ul className="space-y-2">
              {cookingUsages.map(({ key, value }) => (
                <li key={key} className="text-ink-700 text-[13px] leading-snug">
                  <span className="text-ink-800 font-bold">{key}</span>
                  <span className="text-ink-500">: {value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ─── AI 분석 정보 footer ─── */}
      {(aiConfidencePct != null || aiDate) && (
        <div className="px-4 pb-5">
          <p className="text-ink-400 flex items-center gap-1.5 text-xs">
            <Bot size={12} />
            AI 분석 정보
            {aiConfidencePct != null && ` · 신뢰도 ${aiConfidencePct}%`}
            {aiDate && ` · ${aiDate}`}
          </p>
        </div>
      )}

      {/* ─── 구분선 ─── */}
      <div className="h-2 bg-gray-100" />

      {/* ─── 상품 상세정보 아코디언 ─── */}
      <details className="group border-line bg-paper border-b" open>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 [&::-webkit-details-marker]:hidden">
          <span className="text-ink-800 text-sm font-bold">상품 상세정보</span>
          <ChevronDown
            size={16}
            className="text-ink-400 transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="px-4 pb-5">
          {detailImages.length > 0 ? (
            <div className="space-y-2">
              {detailImages.map((src, i) => (
                <div key={i} className="relative w-full">
                  <Image
                    src={src}
                    alt={`${item.itemName} 상세 이미지 ${i + 1}`}
                    width={600}
                    height={400}
                    className="w-full rounded-lg object-contain"
                  />
                </div>
              ))}
            </div>
          ) : item.descriptionMarkup ? (
            <div className="text-ink-600 text-[13px] leading-relaxed whitespace-pre-line">
              {item.descriptionMarkup.replace(/##\s*/g, "").trim()}
            </div>
          ) : (
            <p className="text-ink-400 text-sm">상세 이미지가 없습니다.</p>
          )}
        </div>
      </details>

      {/* ─── 상품 고시 정보 아코디언 ─── */}
      <details className="group border-line bg-paper border-b">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 [&::-webkit-details-marker]:hidden">
          <span className="text-ink-800 text-sm font-bold">상품 고시 정보</span>
          <ChevronDown
            size={16}
            className="text-ink-400 transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="px-4 pb-5">
          <table className="w-full text-xs">
            <tbody className="divide-line divide-y">
              {[
                "식품의 유형",
                "생산자 및 소재지",
                "제조연월일, 유통기한 또는 품질유지기한",
                "포장단위별 용량(중량), 수량",
                "원재료명 및 함량",
                "영양성분",
                "소비자상담관련 전화번호",
              ].map((label) => (
                <tr key={label}>
                  <td className="text-ink-500 w-2/5 py-2.5 pr-3 leading-snug font-medium">
                    {label}
                  </td>
                  <td className="text-ink-400 py-2.5">상세정보 참조</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* ─── 배달안내 아코디언 ─── */}
      <details className="group border-line bg-paper border-b">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 [&::-webkit-details-marker]:hidden">
          <span className="text-ink-800 text-sm font-bold">배달안내</span>
          <ChevronDown
            size={16}
            className="text-ink-400 transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="text-ink-600 space-y-2 px-4 pb-5 text-[13px] leading-relaxed">
          <p>• 가게별로 배달금액 및 배달시간이 다르게 운영됩니다.</p>
          {store?.minDeliveryPrice != null && (
            <p>• 최소 주문금액: {store.minDeliveryPrice.toLocaleString()}원</p>
          )}
          {store?.deliveryTip != null && (
            <p>
              • 배달팁:{" "}
              {store.deliveryTip === 0 ? "무료" : `${store.deliveryTip.toLocaleString()}원`}
            </p>
          )}
          {(store?.minDeliveryTime != null || store?.maxDeliveryTime != null) && (
            <p>
              • 배달시간:{" "}
              {[store?.minDeliveryTime, store?.maxDeliveryTime].filter(Boolean).join("~")}분
            </p>
          )}
          <p>• 배달방법: 가게 직접 배달 또는 외주업체 배달</p>
          <p>• 배달가능 지역: 가게별 상이</p>
          <p>• 가게 휴무일 주문건에 대해서는 가장 가까운 영업일자에 배달됩니다.</p>
        </div>
      </details>

      {/* ─── 교환/반품 안내 아코디언 ─── */}
      <details className="group border-line bg-paper border-b">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 [&::-webkit-details-marker]:hidden">
          <span className="text-ink-800 text-sm font-bold">교환/반품 안내</span>
          <ChevronDown
            size={16}
            className="text-ink-400 transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="text-ink-600 space-y-2 px-4 pb-5 text-[13px] leading-relaxed">
          <p>• 상품 배달완료 기준으로 7일 이내 교환/반품이 가능합니다. (단, 신선식품 제외)</p>
          <p>• 상품 교환은 구매하신 가게에 직접 방문하시는 경우에만 가능합니다.</p>
          <p>• 반품 접수는 [마이페이지] 1:1문의에서 가능합니다.</p>
          <p className="text-ink-700 font-semibold">[교환/반품이 가능한 경우]</p>
          <p>• 상품에 하자가 있거나 불량인 경우</p>
          <p className="pl-3">
            - 채소, 과일, 생선, 양곡등의 1차 식품과 냉장 냉동 상품은 수령일로부터 1일 이내
          </p>
          <p className="pl-3">- 기타 상품은 수령일로부터 영업일 기준 7일 이내</p>
          <p>• 받으신 상품이 표시·광고 사항과 다른 경우, 상품을 수령하신 날로부터 3개월 이내</p>
        </div>
      </details>

      {/* ─── 구분선 ─── */}
      <div className="h-2 bg-gray-100" />

      {/* ─── 비슷한 상품 ─── */}
      {similarItems.length > 0 && (
        <div className="bg-paper py-5">
          <h2 className="text-ink-900 mb-3 px-4 text-sm font-bold">비슷한 상품</h2>
          <div className="scrollbar-none flex gap-3 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
            {similarItems.map((sim) => {
              const simPrice = sim.effectiveSalePrice ?? sim.listPrice;
              return (
                <Link
                  key={sim.storeItemId}
                  href={`/category/${sim.storeItemId}`}
                  className="relative w-36 shrink-0"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
                    {sim.thumbnailSmall ? (
                      <Image
                        src={sim.thumbnailSmall}
                        alt={sim.itemName}
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🛒</div>
                    )}
                    {simPrice != null && (
                      <QuickAddButton
                        storeItemId={sim.storeItemId}
                        itemName={sim.itemName}
                        price={simPrice}
                      />
                    )}
                  </div>
                  <p className="text-ink-800 mt-1.5 line-clamp-2 text-[12px] leading-snug">
                    {sim.itemName}
                  </p>
                  <p className="text-ink-900 mt-0.5 text-sm font-bold">
                    {simPrice != null ? `${simPrice.toLocaleString()}원` : "가격 미정"}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 구분선 ─── */}
      {similarItems.length > 0 && <div className="h-2 bg-gray-100" />}

      {/* ─── 구매 리뷰 ─── */}
      <div className="bg-paper px-4 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-ink-900 text-sm font-bold">
            구매 리뷰 ({reviews.length})
            {avgRating > 0 && (
              <span className="text-ink-500 ml-2 text-xs font-normal">
                ★ {avgRating.toFixed(1)}
              </span>
            )}
          </h2>
          <button
            type="button"
            className="border-line text-ink-600 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"
          >
            ✏️ 리뷰 작성
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-ink-400 py-6 text-center text-sm">
            아직 리뷰가 없어요. 첫 번째 리뷰를 작성해보세요!
          </p>
        ) : (
          <ul className="divide-line divide-y">
            {reviews.map((rev) => {
              const date = new Date(rev.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              return (
                <li key={rev.reviewId} className="py-3">
                  <div className="mb-1 flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < rev.rating ? "fill-honey text-honey" : "text-ink-200"}
                      />
                    ))}
                    <span className="text-ink-400 text-xs">{date}</span>
                  </div>
                  {rev.content && (
                    <p className="text-ink-700 text-[13px] leading-relaxed">{rev.content}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ─── 사업자 정보 ─── */}
      {store && (
        <div className="text-ink-400 bg-gray-50 px-4 py-5 text-[11px] leading-relaxed">
          {store.storeName && <p className="text-ink-600 font-semibold">{store.storeName}</p>}
          {store.ceoName && <p>대표자 {store.ceoName}</p>}
          {store.regNumber && <p>사업자등록번호 {store.regNumber}</p>}
          {store.regCode && <p>통신판매업신고 {store.regCode}</p>}
          {store.storeAddress && <p>{store.storeAddress}</p>}
          {store.storePhone && <p>Tel {store.storePhone}</p>}
        </div>
      )}

      {/* ─── 하단 고정 바 ─── */}
      <div
        data-testid="item-bottom-bar"
        className="border-line bg-paper safe-area-pb fixed right-0 bottom-0 left-0 z-40 border-t px-4 py-3"
      >
        <ItemDetailBottomBar item={item} />
      </div>
    </div>
  );
}
