import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, CartItem, ChatMessage, KidsPick, CardSection } from "./types";

// ── Auth ──────────────────────────────────────────────
type AuthState = {
  user: User | null;
  token: string | null;
  onboardingCompletedAt: string | null;
  onboardingSkippedAt: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
};
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      onboardingCompletedAt: null,
      onboardingSkippedAt: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      completeOnboarding: () => set({ onboardingCompletedAt: new Date().toISOString() }),
      skipOnboarding: () => set({ onboardingSkippedAt: new Date().toISOString() }),
      resetOnboarding: () => set({ onboardingCompletedAt: null, onboardingSkippedAt: null }),
    }),
    { name: "fp-auth" }
  )
);

// ── Cart ──────────────────────────────────────────────
type CartState = {
  items: CartItem[];
  addBundle: (cardId: string, items: CartItem[]) => void;
  setQty: (cartItemId: string, qty: number) => void;
  remove: (cartItemId: string) => void;
  clear: () => void;
  total: () => number;
  totalCount: () => number;
};
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addBundle: (cardId, items) =>
        set((s) => ({
          items: [
            ...s.items.filter((i) => !items.some((n) => n.cartItemId === i.cartItemId)),
            ...items.map((i) => ({ ...i, cardId })),
          ],
        })),
      setQty: (cartItemId, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.cartItemId === cartItemId ? { ...i, qty } : i)),
        })),
      remove: (cartItemId) =>
        set((s) => ({ items: s.items.filter((i) => i.cartItemId !== cartItemId) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      totalCount: () => get().items.length,
    }),
    { name: "fp-cart" }
  )
);

// ── Chat ──────────────────────────────────────────────
import type { MemoAddedItem, CartAddedItem } from "./types";

type ChatState = {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentTool: string | null;
  push: (m: ChatMessage) => void;
  appendStream: (chunk: string) => void;
  setStreaming: (b: boolean) => void;
  setCurrentTool: (tool: string | null) => void;
  updateMemoItems: (msgId: string, items: MemoAddedItem[]) => void;
  updateCartItems: (msgId: string, items: CartAddedItem[]) => void;
  reset: () => void;
};
export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  currentTool: null,
  push: (m) => set((s) => ({ messages: [...s.messages, m] })),
  appendStream: (chunk) =>
    set((s) => {
      const last = s.messages[s.messages.length - 1];
      if (!last || last.role !== "ai") return s;
      return {
        messages: [...s.messages.slice(0, -1), { ...last, text: last.text + chunk }],
      };
    }),
  setStreaming: (b) => set({ isStreaming: b }),
  setCurrentTool: (tool) => set({ currentTool: tool }),
  updateMemoItems: (msgId, items) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === msgId ? { ...m, memoItems: items } : m)),
    })),
  updateCartItems: (msgId, items) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === msgId ? { ...m, cartItems: items } : m)),
    })),
  reset: () => set({ messages: [], currentTool: null }),
}));

// ── Kids Mode ─────────────────────────────────────────
type KidsState = {
  picks: KidsPick[];
  toggle: (food: KidsPick) => void;
  clear: () => void;
};
export const useKidsStore = create<KidsState>((set) => ({
  picks: [],
  toggle: (food) =>
    set((s) => ({
      picks: s.picks.find((p) => p.id === food.id)
        ? s.picks.filter((p) => p.id !== food.id)
        : [...s.picks, food],
    })),
  clear: () => set({ picks: [] }),
}));

// ── UI / preference ───────────────────────────────────
type UIState = {
  homeFilter: "all" | "meal" | "snack" | "cinema";
  setHomeFilter: (f: UIState["homeFilter"]) => void;
};
export const useUIStore = create<UIState>((set) => ({
  homeFilter: "all",
  setHomeFilter: (f) => set({ homeFilter: f }),
}));

// ── Section Management (F015) ─────────────────────────
type SectionState = {
  sections: CardSection[];
  setSections: (sections: CardSection[]) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  toggleAiAutoFill: (sectionId: string) => void;
  rename: (sectionId: string, name: string) => void;
};
export const useSectionStore = create<SectionState>()(
  persist(
    (set) => ({
      sections: [],
      setSections: (sections) => set({ sections }),
      reorder: (fromIndex, toIndex) =>
        set((s) => {
          const next = [...s.sections];
          const [item] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, item);
          return { sections: next.map((sec, i) => ({ ...sec, sortOrder: i })) };
        }),
      toggleAiAutoFill: (sectionId) =>
        set((s) => ({
          sections: s.sections.map((sec) =>
            sec.sectionId === sectionId ? { ...sec, aiAutoFill: !sec.aiAutoFill } : sec
          ),
        })),
      rename: (sectionId, name) =>
        set((s) => ({
          sections: s.sections.map((sec) => (sec.sectionId === sectionId ? { ...sec, name } : sec)),
        })),
    }),
    { name: "fp-sections" }
  )
);
