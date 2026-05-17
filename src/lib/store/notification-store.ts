import { create } from "zustand";

type NotificationState = {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: Math.max(0, n) }),
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  decrement: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  reset: () => set({ unreadCount: 0 }),
}));
