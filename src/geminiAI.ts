// ─── Gemini AI Service for MealSwap ────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

export interface SwapAIResult {
  originalName: string
  originalEmoji: string
  originalCalories: number
  originalProtein: number
  originalFat: number
  originalCarbs: number
  originalFiber: number
  originalServing: string
  swapName: string
  swapEmoji: string
  swapCalories: number
  swapProtein: number
  swapFat: number
  swapCarbs: number
  swapFiber: number
  swapServing: string
  aiReason: string
  caloriesDiff: number
}

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

const SYSTEM_PROMPT = `Ти — MealSwap AI, дружній помічник з харчування. Ти допомагаєш людям знаходити здорові заміни для страв і продуктів.

Коли тебе просять знайти заміну (swap) страві:
Відповідай ТІЛЬКИ JSON у такому форматі без жодного тексту до або після:
{
  "originalName": "назва оригінальної страви",
  "originalEmoji": "відповідний емодзі",
  "originalCalories": число,
  "originalProtein": число в г,
  "originalFat": число в г,
  "originalCarbs": число в г,
  "originalFiber": число в г,
  "originalServing": "розмір порції",
  "swapName": "назва заміни",
  "swapEmoji": "відповідний емодзі",
  "swapCalories": число,
  "swapProtein": число в г,
  "swapFat": число в г,
  "swapCarbs": число в г,
  "swapFiber": число в г,
  "swapServing": "розмір порції",
  "aiReason": "2-3 речення чому ця заміна корисніша",
  "caloriesDiff": число (від'ємне якщо заміна менш калорійна)
}

Для звичайних питань про харчування, здоров'я або поради — відповідай коротко і дружньо українською мовою. Будь позитивним і мотивуючим.`

export async function getAiSwap(query: string, goals: string[] = []): Promise<SwapAIResult> {
  const queryText = goals.length > 0
    ? `Знайди здорову заміну для: ${query}. Користувач має такі цілі/діагнози: ${goals.join(', ')}. Враховуй це при підборі.`
    : `Знайди здорову заміну: ${query}`

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: 'model',
        parts: [{ text: 'Зрозумів! Я MealSwap AI і готовий допомогти. Напиши що хочеш замінити і я дам JSON відповідь.' }]
      },
      {
        role: 'user',
        parts: [{ text: queryText }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    }
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in response')

  return JSON.parse(jsonMatch[0]) as SwapAIResult
}

export async function chatWithAI(
  messages: ChatMessage[],
  newMessage: string
): Promise<string> {
  const contents = [
    {
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    },
    {
      role: 'model',
      parts: [{ text: 'Привіт! Я MealSwap AI — твій персональний помічник з харчування. Готовий допомогти знайти здорові заміни та відповісти на питання про їжу і здоров\'я!' }]
    },
    ...messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
    {
      role: 'user',
      parts: [{ text: newMessage }]
    }
  ]

  const body = {
    contents,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 512,
    }
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Вибач, не зміг отримати відповідь.'
}

export async function getHealthTip(): Promise<string> {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Дай один короткий корисний факт або пораду про здорове харчування (1-2 речення, українською, без зайвих символів).' }]
      }
    ],
    generationConfig: {
      temperature: 1.0,
      maxOutputTokens: 100,
    }
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) return 'Пий більше води — це перший крок до здоров\'я! 💧'

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Їж більше овочів і фруктів щодня! 🥦'
}
