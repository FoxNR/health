// ─── Gemini AI Service for MealSwap ────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

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

const SYSTEM_PROMPT = `Ти — MealSwap AI, експертний помічник з лікувального та здорового харчування. Ти допомагаєш людям знаходити безпечні та здорові заміни для страв, враховуючи їхні медичні цілі та діагнози.

Коли тебе просять знайти заміну (swap) страві:
1. Аналізуй склад оригінальної страви.
2. Враховуй вибрані "Цілі або Діагнози":
   - **Зменшення ваги**: Обирай максимально низькокалорійні варіанти з високим вмістом клітковини.
   - **Лікування шлунку**: Тільки легкозасвоювана їжа. Жодного гострого, надто кислого або грубого.
   - **Лікування нирок**: Обмежуй продукти з високим вмістом пуринів, солі та надлишкового білка (якщо не вказано інше).
   - **Панкреатит**: КРИТИЧНО — низький вміст жиру. Жодного смаженого, копченого або свіжої випічки. Овочі переважно термічно оброблені.
   - **Підвищений холестерин**: Жодних трансжирів та насичених тваринних жирів. Пріоритет — омега-3, клітковина, рослинні білки.
   - **Правильне харчування**: Загальний баланс КБЖВ, цільні продукти.

Відповідай ТІЛЬКИ JSON у такому форматі без жодного тексту до або після:
{
  "originalName": "назва оригінальної страви",
  "originalEmoji": "відповідний емодзі",
  "originalCalories": число,
  "originalProtein": число в г,
  "originalFat": число в г,
  "originalCarbs": число в г,
  "originalFiber": число в г,
  "originalServing": "100г" або "1 порція",
  "swapName": "назва заміни",
  "swapEmoji": "відповідний емодзі",
  "swapCalories": число,
  "swapProtein": число в г,
  "swapFat": число в г,
  "swapCarbs": число в г,
  "swapFiber": число в г,
  "swapServing": "100г" або "1 порція",
  "aiReason": "Поясни, чому ця заміна найкраща САМЕ з огляду на вибрані діагнози (2-3 речення).",
  "caloriesDiff": число (від'ємне якщо заміна менш калорійна)
}

Будь дуже відповідальним. Якщо страва КАТЕГОРИЧНО заборонена при діагнозі (наприклад, свинячий шашлик при панкреатиті), обов'язково запропонуй максимально безпечну дієтичну альтернативу (наприклад, запечена індичка).`

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
  
  if (data.error) {
    throw new Error(`Gemini Error: ${data.error.message}`)
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  
  if (!text) {
    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      throw new Error('Запит заблоковано фільтром безпеки AI.')
    }
    throw new Error('AI не повернув результату. Спробуйте інший запит.')
  }

  // Clean markdown if present
  let cleanedText = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim()
  
  // Extract JSON from response (find first { and last })
  const startIdx = cleanedText.indexOf('{')
  const endIdx = cleanedText.lastIndexOf('}')
  
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    console.error('Raw AI response:', text)
    throw new Error('AI повернув некоректну відповідь. Повторіть спробу.')
  }

  const jsonStr = cleanedText.substring(startIdx, endIdx + 1)

  try {
    return JSON.parse(jsonStr) as SwapAIResult
  } catch (err) {
    console.error('JSON Parse error:', err, 'Final string:', jsonStr)
    throw new Error('Помилка обробки результату AI.')
  }
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
