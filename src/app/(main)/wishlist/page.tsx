import { Heart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { WishlistClient } from "@/components/wishlist/wishlist-client";
import { fetchWishlistAction } from "@/lib/actions/wishlist";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const items = await fetchWishlistAction();

  return (
    <>
      <PageHeader title="찜 목록" />
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Heart size={40} className="text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">찜한 상품이 없습니다</p>
          <p className="text-muted-foreground/70 text-xs">재료 상세에서 하트를 눌러 찜해 보세요</p>
        </div>
      ) : (
        <WishlistClient items={items} />
      )}
    </>
  );
}
