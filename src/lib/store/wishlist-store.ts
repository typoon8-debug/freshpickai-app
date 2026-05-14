import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  ids: Set<string>;
  toggle: (storeItemId: string) => void;
  has: (storeItemId: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: new Set<string>(),
      toggle: (storeItemId) =>
        set((s) => {
          const next = new Set(s.ids);
          if (next.has(storeItemId)) next.delete(storeItemId);
          else next.add(storeItemId);
          return { ids: next };
        }),
      has: (storeItemId) => get().ids.has(storeItemId),
      clear: () => set({ ids: new Set() }),
    }),
    {
      name: "fp-wishlist",
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          const parsed = JSON.parse(raw) as { state: { ids: string[] }; version: number };
          return {
            state: { ids: new Set(parsed.state.ids ?? []) },
            version: parsed.version,
          };
        },
        setItem: (name, value) => {
          const serialized = {
            state: { ids: Array.from((value.state as WishlistState).ids) },
            version: value.version,
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
