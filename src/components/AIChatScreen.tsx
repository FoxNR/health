import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Send, Sparkles, X } from 'lucide-react'
import { chatWithAI } from '../geminiAI'
import type { ChatMessage } from '../geminiAI'

interface AIChatScreenProps {
  onBack: () => void
}

const QUICK_PROMPTS = [
  '💡 Як схуднути без дієт?',
  '🥗 Що їсти після тренування?',
  '🍎 Найкорисніші продукти?',
]

export function AIChatScreen({ onBack }: AIChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Привіт! 👋 Я MealSwap AI — твій помічник з харчування. Запитуй про будь-яку їжу, я знайду здорову заміну або дам корисну пораду!' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: ChatMessage = { role: 'user', text: text.trim() }
    const history = [...messages]
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const reply = await chatWithAI(history, text.trim())
      setMessages(prev => [...prev, { role: 'model', text: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Вибач, щось пішло не так 😕 Спробуй ще раз.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--green-bg)' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          id="chat-back-btn"
          onClick={onBack}
          style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronLeft size={18} color="var(--text-secondary)" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #2ecc71, #27ae60)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>MealSwap AI</p>
            <p style={{ fontSize: 11, color: 'var(--green-primary)', fontWeight: 500 }}>● Онлайн · Gemini 2.0</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([{ role: 'model', text: 'Привіт! 👋 Я MealSwap AI — твій помічник з харчування. Запитуй про будь-яку їжу!' }])}
          style={{ marginLeft: 'auto', width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          title="Очистити чат"
        >
          <X size={16} color="var(--text-muted)" />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }} className="scroll-area">
        {/* Quick prompts at top */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 20, padding: '7px 13px', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className="animate-pop-in"
              style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}
            >
              {msg.role === 'model' && (
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #2ecc71, #27ae60)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={16} color="white" />
                </div>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="animate-pop-in" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #2ecc71, #27ae60)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={16} color="white" />
              </div>
              <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 60 }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: 'white', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="search-wrap" style={{ flex: 1, paddingLeft: 14 }}>
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              placeholder="Напиши запитання..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{ width: 46, height: 46, borderRadius: 14, background: input.trim() && !isLoading ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 'var(--surface-2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', flexShrink: 0 }}
          >
            <Send size={18} color={input.trim() && !isLoading ? 'white' : 'var(--text-muted)'} />
          </button>
        </form>
      </div>
    </div>
  )
}
