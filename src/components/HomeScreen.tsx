import { useState, useEffect } from 'react'
import { Search, ChevronRight, Bell, Sparkles } from 'lucide-react'
import { getHealthTip } from '../geminiAI'

interface HomeScreenProps {
  userName: string
  onSearch: (query: string) => void
  onCategorySelect: (category: string) => void
  onOpenChat: () => void
  savedCount: number
  swapsToday: number
  selectedGoals: string[]
  onGoalsChange: (goals: string[]) => void
}

const DIETARY_GOALS = [
  'Правильне харчування',
  'Зменшення ваги',
  'Лікування шлунку',
  'Лікування нирок',
  'Панкреатит',
  'Підвищений холестерин'
]

const CATEGORIES = [
  { id: 'desserts', label: 'Десерти', emoji: '🍰', bg: '#f3e6ff', emoji2: '🧁' },
  { id: 'fastfood', label: 'Фастфуд', emoji: '🍔', bg: '#e6f0ff', emoji2: '🌮' },
  { id: 'drinks', label: 'Напої', emoji: '🥤', bg: '#ffe6f0', emoji2: '☕' },
  { id: 'snacks', label: 'Снеки', emoji: '🥜', bg: '#fff3e6', emoji2: '🫙' },
]

const SUGGESTIONS = [
  'Замінити піцу Маргарита',
  'Здорова альтернатива шоколаду',
  'Замінити чізбургер',
  'Корисне замість чіпсів',
  'Що їсти замість морозива',
]

export function HomeScreen({
  userName,
  onSearch,
  onCategorySelect,
  onOpenChat,
  savedCount,
  swapsToday,
  selectedGoals,
  onGoalsChange
}: HomeScreenProps) {
  const [query, setQuery] = useState('')
  const [healthTip, setHealthTip] = useState('Завантажується порада дня...')
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    getHealthTip().then(tip => setHealthTip(tip)).catch(() => {
      setHealthTip('Пий більше води — це перший крок до здоров\'я! 💧')
    })
  }, [tipIndex])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <div style={{ background: 'var(--green-bg)', minHeight: '100dvh' }} className="pb-nav">
      {/* Header */}
      <div style={{ background: 'white', padding: '16px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #2ecc71, #27ae60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              🥗
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 1 }}>Привіт, <span style={{ color: 'var(--green-primary)', fontWeight: 700 }}>{userName}</span></p>
                <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--green-primary)', color: 'white', padding: '1px 6px', borderRadius: 6, textTransform: 'uppercase' }}>V6.6</span>
              </div>
              <p style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Що замінимо сьогодні?</p>
            </div>
          </div>
          <button
            id="notification-btn"
            style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Bell size={18} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Goals Selector */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ціль або Діагноз</p>
          <div className="scroll-area" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {DIETARY_GOALS.map(goal => {
              const isSelected = selectedGoals.includes(goal)
              return (
                <button
                  key={goal}
                  onClick={() => {
                    if (isSelected) {
                      onGoalsChange(selectedGoals.filter(g => g !== goal))
                    } else {
                      onGoalsChange([...selectedGoals, goal])
                    }
                  }}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '8px 14px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: isSelected ? '1px solid transparent' : '1px solid var(--border)',
                    background: isSelected ? 'var(--green-primary)' : 'white',
                    color: isSelected ? 'white' : 'var(--text-secondary)',
                    boxShadow: isSelected ? '0 4px 12px rgba(46, 204, 113, 0.3)' : 'none'
                  }}
                >
                  {goal}
                </button>
              )
            })}
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit}>
          <div className="search-wrap" style={{ paddingLeft: 14, paddingRight: 8 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              id="home-search-input"
              type="text"
              placeholder="Шукати заміну..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: 8 }}
            />
            {query && (
              <button
                id="home-search-submit"
                type="submit"
                style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Swap ✨
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px' }} className="flex flex-col gap-5">

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="animate-fade-in">
          <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#e8f8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              🔄
            </div>
            <div>
              <p style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 800, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{swapsToday}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>Свапів сьогодні</p>
            </div>
          </div>
          <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff3e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              ❤️
            </div>
            <div>
              <p style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 800, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{savedCount}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>Збережено</p>
            </div>
          </div>
        </div>

        {/* AI Chat CTA */}
        <button
          id="open-ai-chat-btn"
          onClick={onOpenChat}
          className="animate-fade-in"
          style={{ background: 'linear-gradient(135deg, #2ecc71, #1e8449)', color: 'white', border: 'none', borderRadius: 18, padding: '16px 20px', cursor: 'pointer', textAlign: 'left', width: '100%', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>AI Помічник</p>
              <p style={{ fontSize: 12, opacity: 0.85, marginTop: 1 }}>Запитай про харчування й здоров'я</p>
            </div>
          </div>
        </button>

        {/* Categories */}
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Категорії</h2>
            <button style={{ background: 'none', border: 'none', color: 'var(--green-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              Всі <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                id={`cat-${cat.id}`}
                onClick={() => onCategorySelect(cat.label)}
                className="category-chip"
                style={{ background: 'white', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="category-icon" style={{ background: cat.bg, fontSize: 26 }}>
                  {cat.emoji}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Health News / AI Tip */}
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>AI Порада дня</h2>
            <button
              id="refresh-tip-btn"
              onClick={() => setTipIndex(i => i + 1)}
              style={{ background: 'none', border: 'none', color: 'var(--green-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Оновити
            </button>
          </div>

          <div className="news-card">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'white' }}>
                  🤖 Gemini AI
                </div>
              </div>
              <p style={{ color: 'white', fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>{healthTip}</p>
              <button style={{ marginTop: 10, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Дізнатись більше →
              </button>
            </div>
          </div>
        </div>

        {/* Quick suggestions */}
        <div className="animate-fade-in">
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 12 }}>Швидкий старт</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SUGGESTIONS.slice(0, 4).map(s => (
              <button
                key={s}
                onClick={() => onSearch(s)}
                className="card"
                style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{s}</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
