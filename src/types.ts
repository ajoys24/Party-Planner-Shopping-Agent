export type ProductCategory =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Plant Protein'
  | 'Dairy & Deli'
  | 'Bakery & Bread'
  | 'Pantry & Dry Goods'
  | 'Beverages & Mixers'
  | 'Alcohol'
  | 'Ice'
  | 'Tableware & Disposables'
  | 'Decorations & Balloons'
  | 'Miscellaneous';

export type StoreType = 'wholesale' | 'grocery' | 'party_store' | 'liquor' | 'general';
export type CymbalBrandTier = 'Cymbal Essentials' | 'Cymbal Organic' | 'Cymbal Choice' | 'National Brand';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: ProductCategory;
  estimatedCost: number;
  dietaryNotes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  servings: number;
  dietaryTags: string[];
  prepDifficulty: 'Easy' | 'Medium' | 'Advanced';
  prepAheadTime?: string;
  ingredients: Ingredient[];
  quickInstructions?: string[];
}

export interface DrinkItem {
  id: string;
  name: string;
  type: 'Cocktail' | 'Mocktail' | 'Beer & Wine' | 'Punch' | 'Soft Drink' | 'Water & Ice';
  description: string;
  batchServings: number;
  alcoholic: boolean;
  ingredients: Array<{ name: string; quantity: number; unit: string; estimatedCost: number }>;
  batchingInstructions?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: ProductCategory;
  quantityNeeded: number;
  unit: string;
  packSizeSuggestion?: string;
  estimatedPrice: number;
  suggestedStore: string;
  department: string;
  aisle?: string;
  brandTier?: CymbalBrandTier;
  notes?: string;
  dietaryTag?: string;
  checked: boolean;
  isCustom?: boolean;
}

export interface StoreBucket {
  storeName: string;
  storeType: StoreType;
  items: ShoppingItem[];
  estimatedSubtotal: number;
  itemsCount: number;
  checkedCount: number;
}

export interface ScheduleEvent {
  time: string;
  phase: string;
  description: string;
}

export interface PrepTask {
  timeframe: string;
  tasks: string[];
}

export interface OrderFulfillment {
  method: 'delivery' | 'pickup' | 'in_store';
  status: 'draft' | 'submitted' | 'processing' | 'ready';
  orderId?: string;
  storeName: string;
  timeSlot?: string;
  address?: string;
  tipAmount?: number;
  carDescription?: string;
  submittedAt?: string;
}

export interface PartyPlan {
  id: string;
  title: string;
  eventType: string;
  theme: string;
  guestCount: {
    adults: number;
    kids: number;
    total: number;
  };
  durationHours: number;
  budget: {
    targetBudget: number;
    currency: string;
    estimatedTotal: number;
  };
  storeLocation?: string;
  dietaryRestrictions: string[];
  venueType: string;
  equipment: string[];
  vibeAndNotes: string;
  playlistVibe: string;
  schedule: ScheduleEvent[];
  menu: {
    appetizers: MenuItem[];
    mains: MenuItem[];
    sides: MenuItem[];
    desserts: MenuItem[];
    drinks: DrinkItem[];
  };
  shoppingList: ShoppingItem[];
  budgetBreakdown: {
    food: number;
    drinks: number;
    tablewareAndSupplies: number;
    decorations: number;
    buffer: number;
  };
  prepTimeline: PrepTask[];
  hostTips: string[];
  fulfillment?: OrderFulfillment;
  createdAt: string;
  updatedAt: string;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: Array<{
    label: string;
    actionType: 'scale_guests' | 'adjust_budget' | 'add_dietary' | 'custom_prompt' | 'apply_tweak' | 'swap_cymbal_brand' | 'checkout';
    payload?: any;
  }>;
}

export interface PartyPlannerFormInput {
  title: string;
  eventType: string;
  theme: string;
  adults: number;
  kids: number;
  durationHours: number;
  targetBudget: number;
  currency: string;
  storeLocation?: string;
  dietaryRestrictions: string[];
  venueType: string;
  equipment: string[];
  drinkPreference: 'full_bar' | 'beer_wine' | 'mocktails_only' | 'family_mix' | 'byob_plus_mixers';
  additionalNotes: string;
}
