// ─── Gemini AI Service for MealSwap ────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_ANTIGRAVITY || import.meta.env.VITE_GEMINI_API_KEY
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

const SWAP_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    originalName: { type: "STRING" },
    originalEmoji: { type: "STRING" },
    originalCalories: { type: "NUMBER" },
    originalProtein: { type: "NUMBER" },
    originalFat: { type: "NUMBER" },
    originalCarbs: { type: "NUMBER" },
    originalFiber: { type: "NUMBER" },
    originalServing: { type: "STRING" },
    swapName: { type: "STRING" },
    swapEmoji: { type: "STRING" },
    swapCalories: { type: "NUMBER" },
    swapProtein: { type: "NUMBER" },
    swapFat: { type: "NUMBER" },
    swapCarbs: { type: "NUMBER" },
    swapFiber: { type: "NUMBER" },
    swapServing: { type: "STRING" },
    aiReason: { type: "STRING" },
    caloriesDiff: { type: "NUMBER" }
  },
  required: ["originalName", "swapName", "aiReason"]
}

const SYSTEM_PROMPT = `You are a headless API agent. Respond ONLY with valid JSON. Never include explanations, markdown code blocks (like \`\`\`json), or any text outside the JSON object.

Ти — MealSwap AI, експертний помічник з лікувального та здорового харчування. Ти допомагаєш людям знаходити безпечні та здорові заміни для страв, враховуючи їхні медичні цілі та діагнози.

Коли тебе просять знайти заміну (swap) страві, враховуй вибрані "Цілі або Діагнози":
   - **Зменшення ваги**: Обирай максимально низькокалорійні варіанти з високим вмістом клітковини.
   - **Лікування шлунку**: Тільки легкозасвоювана їжа. Жодного гострого, надто кислого або грубого.
   - **Лікування нирок**: Обмежуй продукти з високим вмістом пуринів, солі та надлишкового білка (якщо не вказано інше).
   - **Панкреатит**: КРИТИЧНО — низький вміст жиру. Жодного смаженого, копченого або свіжої випічки. Овочі переважно термічно оброблені.
   - **Підвищений холестерин**: Жодних трансжирів та насичених тваринних жирів. Пріоритет — омега-3, клітковина, рослинні білки.
   - **Правильне харчування**: Загальний баланс КБЖВ, цільні продукти.

FORMAT: Use the provided JSON Schema.`

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
      temperature: 0.1,
      maxOutputTokens: 2048,
      response_mime_type: "application/json",
      response_schema: SWAP_RESPONSE_SCHEMA
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ]
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

  // JSON Extraction & Smart Repair
  let match = text.match(/\{[\s\S]*\}/)
  let jsonContent = match ? match[0] : null

  if (!jsonContent && text.includes('{')) {
    // Attempt repair for truncated response
    const start = text.indexOf('{')
    let partial = text.substring(start)
    // Add missing braces/quotes (basic heuristic)
    if (!partial.endsWith('}')) {
      if (partial.includes('"') && (partial.split('"').length % 2 === 0)) {
        partial += '"'
      }
      partial += '}'
    }
    jsonContent = partial
  }

  if (!jsonContent) {
    console.error('FULL_RAW_RESPONSE:', text)
    throw new Error('AI повернув некоректну відповідь (немає JSON). Повторіть спробу.')
  }

  try {
    const parsed = JSON.parse(jsonContent)
    
    if (!parsed.originalName || !parsed.swapName) {
      throw new Error('Отримано пустий або неповний результат від AI.')
    }
    
    return parsed as SwapAIResult
  } catch (err) {
    console.error('FULL_RAW_RESPONSE:', text)
    throw new Error('AI повернув некоректну відповідь (помилка структури). Повторіть спробу.')
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
