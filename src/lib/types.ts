// ============================================================
// FreshPickAI 도메인 타입
// 공유 DB fp_ 프리픽스 아키텍처 기반
// ============================================================

// ── 사용자 / 인증 ──────────────────────────────────────────
/** fp_user_profile — Supabase Auth(auth.uid()) 기반 */
export type FpUser = {
  userId: string; // auth.uid()
  displayName: string;
  avatarUrl?: string;
  familyRole: "parent" | "teen" | "kid";
  level: number;
  onboardedAt?: string;
  /** public.customer.customer_id — 커머스 연동 시만 사용 */
  refCustomerId?: string;
};

/** fp_user_preference — 9 페르소나 RAG 컨텍스트 */
export type FpUserPreference = {
  prefId: string;
  userId: string;
  wellnessGoals: string[];
  cookTimeMin?: number;
  budgetLevel?: "low" | "mid" | "high";
  personaTags: string[];
  dietaryTags: string[];
};

// ── 가족 그룹 ──────────────────────────────────────────────
/** fp_family_group */
export type FamilyGroup = {
  groupId: string;
  name: string;
  inviteCode: string;
  createdAt: string;
};

/** fp_family_member */
export type FamilyMember = {
  memberId: string;
  groupId: string;
  userId: string;
  displayName: string; // JOIN 결과
  avatarUrl?: string;
  familyRole: FpUser["familyRole"];
  level: number;
  online: boolean;
  todayActivity: string;
  joinedAt: string;
};

// ── 카드메뉴 ───────────────────────────────────────────────
export type CardTheme =
  | "chef_table"
  | "one_meal"
  | "family_recipe"
  | "drama_recipe"
  | "honwell"
  | "seasonal"
  | "global_plate"
  | "k_dessert"
  | "snack_pack"
  | "cinema_night";

/** fp_menu_card */
export type MenuCard = {
  cardId: string;
  sectionId?: string;
  ownerUserId?: string;
  cardTheme: CardTheme;
  name: string;
  subtitle?: string;
  taste?: string;
  category: "meal" | "snack" | "cinema";
  emoji?: string;
  coverImage?: string;
  description?: string;
  isOfficial: boolean;
  isNew: boolean;
  reviewStatus: "private" | "pending" | "approved";
  healthScore?: number;
  priceMin?: number;
  priceMax?: number;
};

/** fp_card_section */
export type CardSection = {
  sectionId: string;
  userId: string;
  name: string;
  sortOrder: number;
  isOfficial: boolean;
  aiAutoFill: boolean;
};

// ── 음식 / 레시피 (F022 RAG) ───────────────────────────────
/** fp_dish */
export type Dish = {
  dishId: string;
  name: string;
  description?: string;
  healthScore?: number;
  cookTime?: number; // 분
  kcal?: number;
  price?: number;
  seasonStart?: number;
  seasonEnd?: number;
  dietTags: string[];
  personaTags: string[];
};

/** fp_dish_recipe */
export type DishRecipe = {
  recipeId: string;
  dishId: string;
  title: string;
  body?: string;
  status: "draft" | "approved" | "archived";
  aiConsent: boolean;
};

/** fp_dish_recipe_step */
export type DishRecipeStep = {
  stepId: string;
  recipeId: string;
  stepNo: number;
  description: string;
  timerSeconds?: number;
  imageUrl?: string;
};

/** fp_card_dish */
export type CardDish = {
  cardDishId: string;
  cardId: string;
  dishId: string;
  role: "main" | "side" | "dessert";
  sortOrder: number;
};

/** fp_dish_ingredient */
export type Ingredient = {
  ingredientId: string;
  dishId: string;
  name: string;
  quantity?: string;
  unit?: string;
  price?: number;
  priceWas?: number;
  emoji?: string;
  sortOrder: number;
  /** public.store_item.store_item_id — 매칭 완료 시 */
  refStoreItemId?: string;
  /** v_store_inventory_item enrichment 결과 (Phase 2.5) */
  liveData?: StoreItemAiData;
};

/** fp_ingredient_meta (F018) */
export type IngredientMeta = {
  metaId: string;
  name: string;
  prepTips?: string;
  measurementHints?: string;
  substitutes: string[];
};

// ── 사용자 노트 (F016) ─────────────────────────────────────
/** fp_card_note */
export type CardNote = {
  noteId: string;
  cardId: string;
  userId: string;
  noteType: "tip" | "review" | "question";
  body: string;
  helpfulCount: number;
  aiConsent: boolean;
  adminReply?: string;
  createdAt: string;
};

// ── 가족 투표 ──────────────────────────────────────────────
/** fp_vote (레거시 — fp_family_vote 로 대체) */
export type Vote = {
  voteId: string;
  groupId: string;
  cardId: string;
  userId: string;
  createdAt: string;
  totalVotes?: number;
  pct?: number;
};

/** fp_vote_session */
export type VoteSessionRecord = {
  sessionId: string;
  groupId: string;
  title: string;
  cardIds: string[];
  endsAt: string;
  status: "open" | "closed";
  createdAt: string;
};

/** fp_family_vote — 개별 투표 레코드 */
export type FamilyVoteRecord = {
  voteId: string;
  sessionId: string;
  groupId: string;
  cardId: string;
  userId: string;
  voteType: "like" | "dislike";
  createdAt: string;
  updatedAt: string;
};

/** 투표 집계 결과 (fp_get_vote_results RPC) */
export type VoteResult = {
  cardId: string;
  cardName?: string;
  emoji?: string;
  likeCount: number;
  dislikeCount: number;
};

/** 무비나이트 생성 결과 */
export type MovieNightCard = {
  cardId: string;
  name: string;
  subtitle?: string;
  emoji: string;
  isKidsVersion: boolean;
};

// ── 장보기 메모 (F012) ─────────────────────────────────────
/** fp_shopping_memo */
export type ShoppingMemo = {
  memoId: string;
  userId: string;
  title: string;
  rawText?: string;
  createdAt: string;
  modifiedAt: string;
};

/** fp_memo_item — 4-step 파싱 결과 */
export type MemoItem = {
  memoItemId: string;
  memoId: string;
  rawText: string;
  correctedText?: string;
  qtyValue?: number;
  qtyUnit?: string;
  matchedDishIngredientId?: string;
  refStoreItemId?: string;
  category?: string;
  done: boolean;
  sortOrder: number;
};

// ── 장바구니 / 주문 ────────────────────────────────────────
/** fp_cart_item */
export type CartItem = {
  cartItemId: string;
  userId: string;
  cardId?: string;
  ingredientId?: string;
  name: string;
  qty: number;
  unit?: string;
  price: number;
  emoji?: string;
  /** public.store_item.store_item_id */
  refStoreItemId?: string;
  /** v_store_inventory_item enrichment 결과 (Phase 2.5) */
  aiAdCopy?: string;
  thumbnailUrl?: string;
  isInStock?: boolean;
  effectiveSalePrice?: number;
  discountPct?: number;
  promoType?: StoreItemAiData["promoType"];
  promoName?: string;
  listPrice?: number;
};

/** fp_order */
export type FpOrder = {
  fpOrderId: string;
  userId: string;
  /** public.order.order_id — 결제 완료 후 연결 */
  refOrderId?: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod?: "kakao" | "naver" | "card" | "bank";
  paymentKey?: string;
  addressName?: string;
  addressPhone?: string;
  addressFull?: string;
  deliveryWindow?: string;
  status: "pending" | "confirmed" | "shipping" | "delivered";
};

// ── AI 채팅 ────────────────────────────────────────────────
export type MemoAddedItem = {
  name: string;
  qty: number;
  unit: string;
};

export type CartAddedItem = {
  name: string;
  qty: number;
  price: number;
  storeItemId?: string;
};

export type ChatMessage = {
  id: string;
  role: "ai" | "user";
  text: string;
  time: string;
  cards?: Pick<MenuCard, "cardId" | "name" | "emoji" | "priceMin" | "healthScore">[];
  /** addToMemo 도구 실행 결과 품목 목록 */
  memoItems?: MemoAddedItem[];
  /** addToCart 도구 실행 결과 품목 목록 */
  cartItems?: CartAddedItem[];
  /** 현재 실행 중인 도구 이름 (스트리밍 중 표시용) */
  currentTool?: string;
};

// ── 페르소나 (F003 RAG) ────────────────────────────────────
/** customer_preference — 9 페르소나 컨텍스트 빌더 입력 */
export type CustomerPreference = {
  id: string;
  customerId: string;
  dietTags: string[];
  cookingSkill: "beginner" | "intermediate" | "advanced";
  cookTimePref: "10min" | "30min" | "60min";
  budgetRange: "under_10k" | "under_20k" | "over_30k";
  wellnessTags: string[];
  onboardingCompletedAt: string | null; // ISO timestamp — Task 041에서 DB 컬럼 매핑
  onboardingSkippedAt: string | null;
};

// ── v_store_inventory_item AI 데이터 (Phase 2.5) ───────────
/** AI 칼로리 구조 (ai_calories JSONB) */
export type ItemCalories = {
  total: number;
  carb: number;
  protein: number;
  fat: number;
};

/**
 * v_store_inventory_item AI 데이터 필드
 * net_price(납품가/원가)는 포함하지 않음 — UI 표시 금지
 */
export type StoreItemAiData = {
  storeItemId: string;
  storeId?: string;
  itemName?: string;
  thumbnailSmall?: string;
  thumbnailBig?: string;
  aiStatus: "ACTIVE" | "REVIEW_NEEDED" | "ERROR" | null;
  aiConfidence?: number;
  descriptionMarkup?: string;
  aiAdCopy?: string;
  aiTags: string[];
  aiCookingUsage?: string;
  aiCalories?: ItemCalories;
  aiNutritionSummary?: Record<string, number>;
  listPrice?: number;
  salePrice?: number;
  effectiveSalePrice?: number;
  discountPct?: number;
  promoId?: string;
  promoName?: string;
  promoType?: "SALE" | "BUNDLE" | "DISCOUNT_PCT" | "TWO_PLUS_ONE";
  isInStock?: boolean;
  availableQuantity?: number;
  /** resolveAiData() 결과 플래그 — "AI 분석 보완 중" 배지 표시 여부 */
  _showReviewBadge?: boolean;
};

/** 찜 목록 항목 */
export type WishlistItem = StoreItemAiData & {
  wishlistId: string;
  addedAt: string;
};

// ── 재료 대체 (F018) ───────────────────────────────────────
/** 재료 대체 단일 항목 */
export type IngredientSubstitute = {
  name: string;
  note: string;
};

// ── 레거시 호환 (store.ts 등에서 사용 중) ─────────────────
/** @deprecated FpUser 사용 권장 */
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  familyId?: string;
  role: "parent" | "teen" | "kid";
  level: number;
};

/** @deprecated CartItem 사용 권장 */
export type Card = MenuCard;

export type KidsPick = {
  id: string;
  emoji: string;
  name: string;
};

/** @deprecated ShoppingMemo 사용 권장 */
export type Memo = {
  id: string;
  title: string;
  date: string;
  items: { text: string; qty?: string; done: boolean }[];
};

export type Order = FpOrder & {
  id: string;
  items: CartItem[];
  pointsUsed: number;
};
