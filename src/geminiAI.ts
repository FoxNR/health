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

const SYSTEM_PROMPT = `You are a headless API agent. Respond ONLY with valid JSON. Never include explanations, markdown code blocks (like \`\`\`json), or any text outside the JSON object.

Ти — MealSwap AI, експертний помічник з лікувального та здорового харчування. Ти допомагаєш людям знаходити безпечні та здорові заміни для страв, враховуючи їхні медичні цілі та діагнози.

Коли тебе просять знайти заміну (swap) страві, враховуй вибрані "Цілі або Діагнози":
   - **Зменшення ваги**: Обирай максимально низькокалорійні варіанти з високим вмістом клітковини.
   - **Лікування шлунку**: Тільки легкозасвоювана їжа. Жодного гострого, надто кислого або грубого.
   - **Лікування нирок**: Обмежуй продукти з високим вмістом пуринів, солі та надлишкового білка (якщо не вказано інше).
   - **Панкреатит**: КРИТИЧНО — низький вміст жиру. Жодного смаженого, копченого або свіжої випічки. Овочі переважно термічно оброблені.
   - **Підвищений холестерин**: Жодних трансжирів та насичених тваринних жирів. Пріоритет — омега-3, клітковина, рослинні білки.
   - **Правильне харчування**: Загальний баланс КБЖВ, цільні продукти.

FORMAT:
{
  "originalName": "назва",
  "originalEmoji": "emoji",
  "originalCalories": число,
  "originalProtein": число,
  "originalFat": число,
  "originalCarbs": число,
  "originalFiber": число,
  "originalServing": "100г",
  "swapName": "заміна",
  "swapEmoji": "emoji",
  "swapCalories": число,
  "swapProtein": число,
  "swapFat": число,
  "swapCarbs": число,
  "swapFiber": число,
  "swapServing": "100г",
  "aiReason": "Чому це краще для діагнозів",
  "caloriesDiff": число
}`

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
      maxOutputTokens: 1024,
      response_mime_type: "application/json"
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
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

  // Response Sanitization: extract content between first { and last }
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  
  if (firstBrace === -1 || lastBrace === -1) {
    console.log('Raw AI Response:', text)
    throw new Error('AI повернув некоректну відповідь (немає JSON). Повторіть спробу.')
  }

  const jsonContent = text.substring(firstBrace, lastBrace + 1)

  try {
    const parsed = JSON.parse(jsonContent)
    
    if (!parsed.originalName || !parsed.swapName) {
      throw new Error('Отримано пустий або неповний результат від AI.')
    }
    
    return parsed as SwapAIResult
  } catch (err) {
    console.log('Raw AI Response:', text)
    throw new Error('AI повернув некоректну відповідь. Повторіть спробу.')
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
