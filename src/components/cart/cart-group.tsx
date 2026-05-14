"use client";

import { cn } from "@/lib/utils";
import { CartItemRow } from "./cart-item-row";
import type { CartItem } from "@/lib/types";

interface CartGroupProps {
  cardId: string;
  cardName: string;
  cardTheme?: string;
  items: CartItem[];
  selectedIds: Set<string>;
  onToggleSelect: (cartItemId: string) => void;
  onQtyChange: (cartItemId: string, qty: number) => void;
  onRemove: (cartItemId: string) => void;
}

const THEME_LABEL: Record<string, string> = {
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
  memo: "메모",
};

export function CartGroup({
  cardId: _cardId,
  cardName,
  cardTheme,
  items,
  selectedIds,
  onToggleSelect,
  onQtyChange,
  onRemove,
}: CartGroupProps) {
  return (
    <div className="border-line overflow-hidden rounded-lg border bg-white">
      {/* 그룹 헤더 */}
      <div className="border-line bg-mocha-50 flex items-center gap-2 border-b px-4 py-2.5">
        <span className="text-ink-800 text-sm font-semibold">{cardName}</span>
        {cardTheme && (
          <span className="text-mocha-600 bg-mocha-100 rounded px-1.5 py-0.5 text-[10px] font-medium">
            {THEME_LABEL[cardTheme] ?? cardTheme}
          </span>
        )}
      </div>

      {/* 아이템 목록 */}
      <div>
        {items.map((item, idx) => (
          <div
            key={item.cartItemId}
            className={cn(idx < items.length - 1 && "border-line border-b")}
          >
            <CartItemRow
              item={item}
              checked={selectedIds.has(item.cartItemId)}
              onToggleSelect={onToggleSelect}
              onQtyChange={onQtyChange}
              onRemove={onRemove}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
