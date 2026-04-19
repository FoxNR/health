// ─── Nutrition types ──────────────────────────────────────────────
export interface Macros {
  calories: number
  protein: number  // grams
  fat: number      // grams
  carbs: number    // grams
  fiber?: number   // grams
  sugar?: number   // grams
}

// ─── Food item ────────────────────────────────────────────────────
export interface FoodItem {
  id: string
  name: string
  emoji: string
  category: string
  macros: Macros
  serving: string  // e.g. "100g", "1 slice (80g)"
  tags: string[]
  color: string    // tailwind bg class for accent
}

// ─── Swap result ──────────────────────────────────────────────────
export interface SwapResult {
  id: string
  query: string
  original: FoodItem
  swap: FoodItem
  aiReason: string
  savedAt: string  // ISO date string
  isFavorite: boolean
  caloriesDiff: number  // negative = fewer calories
}

// ─── App screen ───────────────────────────────────────────────────
export type Screen = 'home' | 'result' | 'favorites'

// ─── App state ────────────────────────────────────────────────────
export interface AppState {
  screen: Screen
  currentSwap: SwapResult | null
  history: SwapResult[]
  isLoading: boolean
  query: string
}
