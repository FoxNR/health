import { useState } from 'react'
import { ChevronLeft, Heart, Share2, RotateCcw, Check, TrendingDown, TrendingUp, Brain } from 'lucide-react'
import type { SwapResult } from '../types'

interface SwapResultScreenProps {
  swap: SwapResult
  onBack: () => void
  onToggleFavorite: (id: string) => void
}

interface NutrientRowProps {
  label: string
  original: number
  swapped: number
  unit: string
  higherIsBetter?: boolean
}

function NutrientRow({ label, original, swapped, unit, higherIsBetter = false }: NutrientRowProps) {
  const better = higherIsBetter ? swapped > original : swapped < original
  const diff = swapped - original
  const pct = original > 0 ? Math.round(Math.abs(diff / original) * 100) : 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 60, textAlign: 'center' }}>{original}{unit}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 80, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: better ? 'var(--green-primary)' : '#e67e22' }}>
          {swapped}{unit}
        </span>
        {diff !== 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 700, color: better ? 'var(--green-primary)' : '#e67e22' }}>
            {better ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            {pct}%
          </div>
        )}
      </div>
    </div>
  )
}

function ProgressRing({ value, max, color }: { value: number; max: number; color: string }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  const offset = circ * (1 - pct)

  return (
    <svg width={100} height={100}>
      <circle cx={50} cy={50} r={r} fill="none" stroke="#e8f8f0" strokeWidth={8} />
      <circle
        cx={50} cy={50} r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="progress-ring"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x={50} y={50} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 14, fontWeight: 800, fill: color, fontFamily: 'Outfit, sans-serif' }}>
        {Math.round(pct * 100)}%
      </text>
    </svg>
  )
}

export function SwapResultScreen({ swap, onBack, onToggleFavorite }: SwapResultScreenProps) {
  const [copied, setCopied] = useState(false)

  const calDiff = swap.swap.macros.calories - swap.original.macros.calories
  const calPct = swap.original.macros.calories > 0
    ? Math.round(Math.abs(calDiff / swap.original.macros.calories) * 100)
    : 0

  const handleShare = async () => {
    const text = `MealSwap: замінив ${swap.original.name} (${swap.original.macros.calories} ккал) → ${swap.swap.name} (${swap.swap.macros.calories} ккал) — ${calDiff < 0 ? 'мінус' : 'плюс'} ${Math.abs(calDiff)} ккал! 🥗`
    if (navigator.share) {
      await navigator.share({ title: 'MealSwap', text, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ background: 'var(--green-bg)', minHeight: '100dvh' }} className="pb-nav animate-fade-in">
      {/* Top bar breadcrumb (like DoctApp) */}
      <div style={{ background: 'white', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            id="result-back-btn"
            onClick={onBack}
            style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} color="var(--text-secondary)" />
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Їжа · Заміни · <span style={{ color: 'var(--green-primary)', fontWeight: 600 }}>{swap.swap.name}</span>
          </p>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: 20 }}>☰</span>
        </button>
      </div>

      {/* Hero card (like doctor profile card) */}
      <div style={{ background: 'linear-gradient(160deg, #2ecc71 0%, #1e8449 100%)', padding: '20px 20px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 10, width: 80, height: 80, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 48 }}>{swap.swap.emoji}</div>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={14} color="white" strokeWidth={3} />
              </div>
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 2 }}>{swap.swap.name}</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{swap.swap.category}</p>

            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }}>Калорії</p>
                <p style={{ color: 'white', fontSize: 18, fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{swap.swap.macros.calories}</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }}>Порція</p>
                <p style={{ color: 'white', fontSize: 18, fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{swap.swap.macros.protein}г</p>
              </div>
            </div>
          </div>

          {/* Calorie reduction badge */}
          <div style={{ textAlign: 'center' }}>
            <ProgressRing
              value={calDiff < 0 ? calPct : 0}
              max={100}
              color="rgba(255,255,255,0.9)"
            />
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600, marginTop: 4 }}>
              {calDiff < 0 ? 'Економія' : 'Різниця'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px', marginTop: -12, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Original food card */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>🔄 Замінює</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36 }}>{swap.original.emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{swap.original.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{swap.original.serving}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: '#e67e22' }}>{swap.original.macros.calories}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>ккал</p>
            </div>
          </div>

          {/* Diff badge */}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', background: calDiff < 0 ? '#e8f8f0' : '#fff3e6', borderRadius: 10 }}>
            {calDiff < 0 ? <TrendingDown size={14} color="var(--green-primary)" /> : <TrendingUp size={14} color="#e67e22" />}
            <span style={{ fontSize: 13, fontWeight: 700, color: calDiff < 0 ? 'var(--green-primary)' : '#e67e22' }}>
              {calDiff < 0 ? `на ${Math.abs(calDiff)} ккал менше` : `на ${Math.abs(calDiff)} ккал більше`}
            </span>
          </div>
        </div>

        {/* AI Reason */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#e8f8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={16} color="var(--green-primary)" />
            </div>
            <div>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Аналіз</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{swap.aiReason}</p>
          <button
            style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--green-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Дізнатись більше →
          </button>
        </div>

        {/* Nutrient comparison */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Огляд нутрієнтів</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 90 }}>Нутрієнт</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 60, textAlign: 'center' }}>{swap.original.emoji} Ориг.</span>
            <span style={{ fontSize: 11, color: 'var(--green-primary)', width: 80, textAlign: 'right', fontWeight: 600 }}>{swap.swap.emoji} Swap</span>
          </div>
          <NutrientRow label="Калорії" original={swap.original.macros.calories} swapped={swap.swap.macros.calories} unit=" ккал" />
          <NutrientRow label="Білки" original={swap.original.macros.protein} swapped={swap.swap.macros.protein} unit="г" higherIsBetter />
          <NutrientRow label="Жири" original={swap.original.macros.fat} swapped={swap.swap.macros.fat} unit="г" />
          <NutrientRow label="Вуглеводи" original={swap.original.macros.carbs} swapped={swap.swap.macros.carbs} unit="г" />
          {swap.swap.macros.fiber !== undefined && (
            <NutrientRow label="Клітковина" original={swap.original.macros.fiber ?? 0} swapped={swap.swap.macros.fiber} unit="г" higherIsBetter />
          )}
        </div>

        {/* Actions (like "Book Now" button in DoctApp) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
          <button
            id="result-favorite-btn"
            onClick={() => onToggleFavorite(swap.id)}
            style={{
              padding: '13px', borderRadius: 14, fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none',
              background: swap.isFavorite ? '#fff0f3' : 'white',
              color: swap.isFavorite ? '#e74c3c' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Heart size={18} fill={swap.isFavorite ? '#e74c3c' : 'none'} strokeWidth={2} />
            {swap.isFavorite ? 'Збережено' : 'Зберегти'}
          </button>

          <button
            id="result-share-btn"
            onClick={handleShare}
            style={{ padding: '13px', borderRadius: 14, fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', background: 'white', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: 'var(--shadow-card)' }}
          >
            {copied ? <Check size={18} color="var(--green-primary)" /> : <Share2 size={18} />}
            {copied ? 'Скопійовано' : 'Поділитись'}
          </button>
        </div>

        <button
          id="result-new-swap-btn"
          onClick={onBack}
          className="btn-green"
          style={{ marginBottom: 8 }}
        >
          <RotateCcw size={18} />
          Новий Swap
        </button>
      </div>
    </div>
  )
}
