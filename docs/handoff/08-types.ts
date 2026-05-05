// handoff/08-types.ts — copy to src/lib/types.ts

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  familyId?: string;
  role: 'parent' | 'teen' | 'kid';
  level: number;
};

export type Card = {
  id: number;
  name: string;
  subtitle: string;
  taste: string;
  category: 'meal' | 'snack' | 'cinema';
  itemCount: number;
  emoji: string;
  isNew: boolean;
  coverImage?: string;
  description?: string;
};

export type Ingredient = {
  id: string;
  emoji: string;
  name: string;
  qty: string;
  price: number;
  was?: number;
  discount?: number;
};

export type Dish = {
  id: number;
  cardId: number;
  title: string;
  description: string;
  healthScore: number;
  cookTime: string;
  kcal: string;
  price: number;
  ingredients: Ingredient[];
};

export type CartItem = {
  id: string;
  cardId: number;
  emoji: string;
  name: string;
  qty: number;
  price: number;
};

export type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
  cards?: { cardId: number; title: string; emoji: string; price: number; health: number; time: string }[];
};

export type FamilyMember = {
  name: string;
  role: string;
  avatar: string;
  level: number;
  cards: number;
  online: boolean;
  todayActivity: string;
  isTeen?: boolean;
  isKid?: boolean;
};

export type Vote = {
  menu: string;
  card: string;
  total: number;
  pct: number;
  voters: string[];
};

export type KidsPick = {
  id: string;
  emoji: string;
  name: string;
};

export type Memo = {
  id: string;
  title: string;
  date: string;
  items: { text: string; qty?: string; done: boolean }[];
};

export type Order = {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  pointsUsed: number;
  total: number;
  paymentMethod: 'kakao' | 'naver' | 'card' | 'bank';
  address: { name: string; phone: string; full: string };
  deliveryWindow: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered';
};
