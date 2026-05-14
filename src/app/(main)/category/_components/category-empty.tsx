import { SearchX } from "lucide-react";

interface CategoryEmptyProps {
  isSearch?: boolean;
  query?: string;
}

export function CategoryEmpty({ isSearch, query }: CategoryEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <SearchX className="text-ink-200 h-12 w-12" />
      {isSearch ? (
        <>
          <p className="text-ink-600 text-sm font-medium">&apos;{query}&apos; 검색 결과가 없어요</p>
          <p className="text-ink-400 text-xs">다른 키워드로 검색해보세요</p>
        </>
      ) : (
        <>
          <p className="text-ink-600 text-sm font-medium">상품이 없어요</p>
          <p className="text-ink-400 text-xs">다른 카테고리를 선택해보세요</p>
        </>
      )}
    </div>
  );
}
