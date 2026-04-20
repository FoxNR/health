import { useState, useEffect } from 'react'
import type { SwapResult } from './types'
import { MOCK_HISTORY } from './mockData'
import { getAiSwap } from './geminiAI'
import { Sparkles } from 'lucide-react'
import { loadState, saveState } from './utils/storage'

import { LoginScreen } from './components/LoginScreen'
import { HomeScreen } from './components/HomeScreen'
import { AIChatScreen } from './components/AIChatScreen'
import { FavoritesScreen } from './components/FavoritesScreen'
import { SwapResultScreen } from './components/SwapResultScreen'
import { BottomNav } from './components/BottomNav'

type Tab = 'home' | 'chat' | 'favorites' | 'profile'
type Screen = 'login' | 'app' | 'result' | 'chat-full'

interface LoadingOverlayProps {
  query: string
  isRegenerating?: boolean
}

function LoadingOverlay({ query, isRegenerating }: LoadingOverlayProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32 }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #2ecc71, #27ae60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, animation: 'bounce-soft 1.5s ease-in-out infinite' }}>
        🤖
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Sparkles size={20} color="var(--green-primary)" />
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', margin: 0 }}>
            AI шукає заміну…
          </p>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 260, lineHeight: 1.5, margin: '0 auto' }}>«{query}»</p>
      </div>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green-primary)', animation: `typing 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      <div style={{ background: '#e8f8f0', borderRadius: 16, padding: '14px 20px', textAlign: 'center', maxWidth: 300 }}>
        <p style={{ color: 'var(--green-dark)', fontSize: 13, lineHeight: 1.5 }}>
          Gemini AI аналізує нутрієнтний склад і підбирає найкращу здорову альтернативу...
        </p>
      </div>
    </div>
  )
}

function ProfileScreen() {
  return (
    <div style={{ background: 'var(--green-bg)', minHeight: '100dvh' }} className="pb-nav">
      <div style={{ background: 'linear-gradient(160deg, #2ecc71, #1e8449)', padding: '30px 20px 40px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 12px' }}>
          👤
        </div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 22, color: 'white' }}>Користувач</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>user@mealswap.app</p>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: -16 }}>
        {['🎯 Моя мета', '📊 Статистика', '🔔 Сповіщення', '🌙 Тема', '❓ Підтримка', '🚪 Вийти'].map(item => (
          <div key={item} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{item}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  // Load persisted state
  const persistedState = loadState()

  const [screen, setScreen] = useState<Screen>((persistedState?.screen as Screen) || 'login')
  const [activeTab, setActiveTab] = useState<Tab>((persistedState?.activeTab as Tab) || 'home')
  const [history, setHistory] = useState<SwapResult[]>(persistedState?.history || MOCK_HISTORY)
  const [currentSwap, setCurrentSwap] = useState<SwapResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [loadingQuery, setLoadingQuery] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedGoals, setSelectedGoals] = useState<string[]>(persistedState?.selectedGoals || [])

  // Persist state on changes
  useEffect(() => {
    saveState({
      history,
      selectedGoals,
      activeTab,
      screen
    })
  }, [history, selectedGoals, activeTab, screen])

  const favorites = history.filter(h => h.isFavorite)
  const swapsToday = 3

  const performAISearch = async (query: string, customNote?: string, isRegenerate?: boolean) => {
    setIsLoading(true)
    setIsRegenerating(!!isRegenerate)
    setLoadingQuery(customNote ? `${query} (${customNote})` : query)
    setErrorMsg(null)

    try {
      const aiResult = await getAiSwap(query, selectedGoals, customNote, isRegenerate)

      const newSwap: SwapResult = {
        id: `swap-${Date.now()}`,
        query,
        original: {
          id: `orig-${Date.now()}`,
          name: aiResult.originalName,
          emoji: aiResult.originalEmoji,
          category: 'Оригінал',
          macros: {
            calories: aiResult.originalCalories,
            protein: aiResult.originalProtein,
            fat: aiResult.originalFat,
            carbs: aiResult.originalCarbs,
            fiber: aiResult.originalFiber,
          },
          serving: aiResult.originalServing,
          tags: [],
          color: 'from-orange-400/20 to-red-500/20',
        },
        swap: {
          id: `swap-${Date.now()}`,
          name: aiResult.swapName,
          emoji: aiResult.swapEmoji,
          category: 'Здорова альтернатива',
          macros: {
            calories: aiResult.swapCalories,
            protein: aiResult.swapProtein,
            fat: aiResult.swapFat,
            carbs: aiResult.swapCarbs,
            fiber: aiResult.swapFiber,
          },
          serving: aiResult.swapServing,
          tags: [],
          color: 'from-green-400/20 to-emerald-500/20',
        },
        aiReason: aiResult.aiReason,
        savedAt: new Date().toISOString(),
        isFavorite: false,
        caloriesDiff: aiResult.caloriesDiff,
      }

      setHistory(prev => [newSwap, ...prev])
      setCurrentSwap(newSwap)
      setScreen('result')
      
      // Scroll to top on new result
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e: any) {
      console.error(e)
      setErrorMsg(`AI Помилка: ${e.message || 'Невідома помилка'}`)
    } finally {
      setIsLoading(false)
      setIsRegenerating(false)
    }
  }

  const handleSearch = (query: string) => performAISearch(query)

  const handleRegenerateSwap = (customNote?: string) => {
    console.log("MealSwap: handleRegenerateSwap called with note:", customNote);
    if (currentSwap) {
      performAISearch(currentSwap.query, customNote, true)
    } else {
      console.warn("MealSwap: handleRegenerateSwap called but currentSwap is null");
    }
  }

  const handleSelectSwap = (swap: SwapResult) => {
    setCurrentSwap(swap)
    setScreen('result')
  }

  const handleToggleFavorite = (id: string) => {
    setHistory(prev =>
      prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s)
    )
    if (currentSwap?.id === id) {
      setCurrentSwap(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : prev)
    }
  }

  // Login
  if (screen === 'login') {
    return <LoginScreen onLogin={() => setScreen('app')} />
  }

  // Full-screen chat
  if (screen === 'chat-full') {
    return <AIChatScreen onBack={() => setScreen('app')} />
  }

  // Result screen
  if (screen === 'result' && currentSwap) {
    return (
      <>
        <SwapResultScreen
          swap={currentSwap}
          selectedGoals={selectedGoals}
          onBack={() => setScreen('app')}
          onToggleFavorite={handleToggleFavorite}
          onRegenerate={handleRegenerateSwap}
          isLoading={isLoading}
        />
        <BottomNav activeTab={activeTab} onTabChange={tab => { setActiveTab(tab); setScreen('app') }} />
      </>
    )
  }

  // Main app with tabs
  return (
    <div style={{ position: 'relative' }}>
      {isLoading && <LoadingOverlay query={loadingQuery} isRegenerating={isRegenerating} />}

      {/* Error toast */}
      {errorMsg && (
        <div
          style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#e74c3c', color: 'white', padding: '16px 20px', borderRadius: 18, fontSize: 13, fontWeight: 500, zIndex: 300, maxWidth: 340, boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>❌ {errorMsg}</span>
            <button 
              onClick={() => setErrorMsg(null)}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', fontSize: 10 }}
            >
              ✕
            </button>
          </div>
          
          {loadingQuery && (
            <button
              onClick={() => handleSearch(loadingQuery)}
              style={{ background: 'white', color: '#e74c3c', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              🔄 Спробувати ще раз
            </button>
          )}
        </div>
      )}

      {activeTab === 'home' && (
        <HomeScreen
          userName="Друже"
          onSearch={handleSearch}
          onCategorySelect={(cat) => handleSearch(`Здорова альтернатива: ${cat}`)}
          onOpenChat={() => setScreen('chat-full')}
          savedCount={favorites.length}
          swapsToday={swapsToday}
          selectedGoals={selectedGoals}
          onGoalsChange={setSelectedGoals}
        />
      )}

      {activeTab === 'chat' && (
        <AIChatScreen onBack={() => setActiveTab('home')} />
      )}

      {activeTab === 'favorites' && (
        <FavoritesScreen
          favorites={favorites}
          onSelect={handleSelectSwap}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {activeTab === 'profile' && <ProfileScreen />}

      <BottomNav activeTab={activeTab} onTabChange={tab => { setActiveTab(tab) }} />
    </div>
  )
}
