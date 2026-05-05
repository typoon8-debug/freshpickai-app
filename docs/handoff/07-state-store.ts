// handoff/07-state-store.ts — copy to src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, CartItem, Card, ChatMessage, KidsPick } from './types';

// ── Auth ──────────────────────────────────────────────
type AuthState = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
};
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'fp-auth' }
  )
);

// ── Cart ──────────────────────────────────────────────
type CartState = {
  items: CartItem[];
  addBundle: (cardId: number, items: CartItem[]) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: () => number;
};
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addBundle: (cardId, items) =>
        set((s) => ({
          items: [
            ...s.items.filter((i) => !items.some((n) => n.id === i.id)),
            ...items.map((i) => ({ ...i, cardId })),
          ],
        })),
      setQty: (id, qty) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, qty } : i)) })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    { name: 'fp-cart' }
  )
);

// ── Chat ──────────────────────────────────────────────
type ChatState = {
  messages: ChatMessage[];
  isStreaming: boolean;
  push: (m: ChatMessage) => void;
  appendStream: (chunk: string) => void;
  setStreaming: (b: boolean) => void;
  reset: () => void;
};
export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  push: (m) => set((s) => ({ messages: [...s.messages, m] })),
  appendStream: (chunk) =>
    set((s) => {
      const last = s.messages[s.messages.length - 1];
      if (!last || last.role !== 'ai') return s;
      return {
        messages: [...s.messages.slice(0, -1), { ...last, text: last.text + chunk }],
      };
    }),
  setStreaming: (b) => set({ isStreaming: b }),
  reset: () => set({ messages: [] }),
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
  homeFilter: 'all' | 'meal' | 'snack' | 'cinema';
  setHomeFilter: (f: UIState['homeFilter']) => void;
};
export const useUIStore = create<UIState>((set) => ({
  homeFilter: 'all',
  setHomeFilter: (f) => set({ homeFilter: f }),
}));
