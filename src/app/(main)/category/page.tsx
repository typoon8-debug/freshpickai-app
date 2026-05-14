import { BrandHeader } from "@/components/layout/brand-header";
import {
  getLargeCategoriesAction,
  getItemsByCategoryAction,
  getUserStoreIdAction,
} from "@/lib/actions/category";
import { CategoryShell } from "./_components/category-shell";

export const dynamic = "force-dynamic";

export default async function CategoryPage() {
  const [largeCategories, storeId] = await Promise.all([
    getLargeCategoriesAction(),
    getUserStoreIdAction(),
  ]);

  const initialResult = await getItemsByCategoryAction({
    sortBy: "popular",
    limit: 40,
    offset: 0,
    storeId: storeId ?? undefined,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader />
      <CategoryShell
        initialLargeCategories={largeCategories}
        initialItems={initialResult.items}
        initialTotal={initialResult.total}
        storeId={storeId ?? undefined}
      />
    </div>
  );
}
