import type { SwapResult, FoodItem } from './types'


// ─── Food database (mock) ─────────────────────────────────────────
export const FOOD_DB: FoodItem[] = [
  {
    id: 'cheesecake',
    name: 'Чізкейк',
    emoji: '🍰',
    category: 'Десерти',
    macros: { calories: 321, protein: 6, fat: 22, carbs: 26, fiber: 0.4, sugar: 19 },
    serving: '1 шматок (100г)',
    tags: ['солодке', 'ніжне', 'крем', 'сир'],
    color: 'from-pink-500/20 to-rose-600/20',
  },
  {
    id: 'cheesecake-swap',
    name: 'Грецький йогурт з манго',
    emoji: '🥭',
    category: 'Здорові альтернативи',
    macros: { calories: 95, protein: 10, fat: 0.5, carbs: 14, fiber: 1.2, sugar: 11 },
    serving: '150г йогурт + 50г манго',
    tags: ['солодке', 'ніжне', 'кремове', 'фрукти'],
    color: 'from-amber-400/20 to-orange-500/20',
  },
  {
    id: 'pizza',
    name: 'Піца Маргарита',
    emoji: '🍕',
    category: 'Основні страви',
    macros: { calories: 266, protein: 11, fat: 10, carbs: 33, fiber: 2.3 },
    serving: '1 скибка (107г)',
    tags: ['ситне', 'сирне', 'солоне'],
    color: 'from-red-500/20 to-orange-500/20',
  },
  {
    id: 'pizza-swap',
    name: 'Цільнозернові піта з моцарелою',
    emoji: '🫓',
    category: 'Здорові альтернативи',
    macros: { calories: 178, protein: 10, fat: 5, carbs: 24, fiber: 4.1 },
    serving: '1 піта (90г)',
    tags: ['ситне', 'сирне', 'цільнозернове'],
    color: 'from-yellow-400/20 to-lime-500/20',
  },
  {
    id: 'burger',
    name: 'Чізбургер',
    emoji: '🍔',
    category: 'Фастфуд',
    macros: { calories: 535, protein: 26, fat: 30, carbs: 40, fiber: 1.5 },
    serving: '1 штука (220г)',
    tags: ['ситне', 'м\'ясне', 'соковите'],
    color: 'from-amber-500/20 to-yellow-600/20',
  },
  {
    id: 'burger-swap',
    name: 'Індичий бургер з авокадо',
    emoji: '🥑',
    category: 'Здорові альтернативи',
    macros: { calories: 320, protein: 28, fat: 14, carbs: 22, fiber: 5 },
    serving: '1 штука (200г)',
    tags: ['ситне', 'м\'ясне', 'здорові жири'],
    color: 'from-green-400/20 to-emerald-500/20',
  },
  {
    id: 'icecream',
    name: 'Морозиво пломбір',
    emoji: '🍦',
    category: 'Десерти',
    macros: { calories: 207, protein: 3.5, fat: 11, carbs: 24, sugar: 21 },
    serving: '1 кульку (100г)',
    tags: ['холодне', 'солодке', 'вершкове'],
    color: 'from-sky-400/20 to-blue-500/20',
  },
  {
    id: 'icecream-swap',
    name: 'Заморожений банан–смузі',
    emoji: '🍌',
    category: 'Здорові альтернативи',
    macros: { calories: 93, protein: 1.1, fat: 0.3, carbs: 21, fiber: 2.6, sugar: 12 },
    serving: '1 кульку (100г)',
    tags: ['холодне', 'солодке', 'фруктове'],
    color: 'from-yellow-300/20 to-amber-400/20',
  },
]

// ─── Swap pairs ───────────────────────────────────────────────────
const SWAP_PAIRS: [string, string][] = [
  ['cheesecake', 'cheesecake-swap'],
  ['pizza', 'pizza-swap'],
  ['burger', 'burger-swap'],
  ['icecream', 'icecream-swap'],
]

// ─── Recent swap history (mock) ───────────────────────────────────
export const MOCK_HISTORY: SwapResult[] = SWAP_PAIRS.map(([origId, swapId], index) => {
  const original = FOOD_DB.find(f => f.id === origId)!
  const swap = FOOD_DB.find(f => f.id === swapId)!
  const daysAgo = index * 2

  return {
    id: `swap-${origId}`,
    query: `Заміна для "${original.name}"`,
    original,
    swap,
    aiReason: getAiReason(origId),
    savedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    isFavorite: index === 0 || index === 2,
    caloriesDiff: swap.macros.calories - original.macros.calories,
  }
})

function getAiReason(id: string): string {
  const reasons: Record<string, string> = {
    cheesecake: 'Ти хочеш чогось ніжного і злегка солодкого. Грецький йогурт з манго дає схожу кремову текстуру з 3× менше калорій і при цьому додає 10г протеїну!',
    pizza: 'Цільнозернова піта задовольнить жагу до сирного і ситного, але з майже вдвічі меншою кількістю калорій та вагомою дозою клітковини.',
    burger: 'Індичка природно ніжніша за яловичину, а авокадо замінює жирний соус здоровими моно-насиченими жирами. Ситно, смачно, але на 40% легше!',
    icecream: 'Заморожений банан при збиванні дає дивовижну кремову текстуру, ідентичну морозиву — без доданого цукру та жирів. Природна солодкість без каяття.',
  }
  return reasons[id] || 'AI знайшов для тебе здоровішу альтернативу з кращим нутрієнтним профілем.'
}

// ─── Helper: get food by ID ───────────────────────────────────────
export function getFoodById(id: string): FoodItem | undefined {
  return FOOD_DB.find(f => f.id === id)
}

// ─── Simulated AI swap ────────────────────────────────────────────
export async function mockAiSwap(query: string): Promise<SwapResult> {
  await new Promise(r => setTimeout(r, 1800)) // simulate API delay

  // Simple keyword matching for demo
  const q = query.toLowerCase()
  let pairIndex = 0
  if (q.includes('піц') || q.includes('pizza')) pairIndex = 1
  else if (q.includes('бургер') || q.includes('burger')) pairIndex = 2
  else if (q.includes('морозиво') || q.includes('ice')) pairIndex = 3

  const [origId] = SWAP_PAIRS[pairIndex]
  return MOCK_HISTORY.find(h => h.id === `swap-${origId}`) as SwapResult
}
