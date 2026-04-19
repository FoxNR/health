import { Heart, ChevronRight, RotateCcw } from 'lucide-react'
import type { SwapResult } from '../types'

interface FavoritesScreenProps {
  favorites: SwapResult[]
  onSelect: (swap: SwapResult) => void
  onToggleFavorite: (id: string) => void
}

export function FavoritesScreen({ favorites, onSelect, onToggleFavorite }: FavoritesScreenProps) {
  return (
    <div style={{ background: 'var(--green-bg)', minHeight: '100dvh' }} className="pb-nav">
      {/* Header */}
      <div style={{ background: 'white', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>
          Збережені <span style={{ color: 'var(--green-primary)' }}>Свапи</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{favorites.length} збережених заміни</p>
      </div>

      <div style={{ padding: '16px' }}>
        {favorites.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 }}>
            <div style={{ fontSize: 60 }}>💚</div>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Ще немає збережених</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', maxWidth: 240 }}>Зберігай найкращі заміни щоб повернутись до них пізніше</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {favorites.map(swap => {
              const diff = swap.swap.macros.calories - swap.original.macros.calories
              return (
                <div
                  key={swap.id}
                  className="card animate-fade-in"
                  style={{ padding: '14px 16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ fontSize: 36 }}>{swap.swap.emoji}</div>
                      <div style={{ position: 'absolute', bottom: -2, right: -4, width: 18, height: 18, background: 'var(--green-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 10 }}>✓</span>
                      </div>
                    </div>

                    <div style={{ flex: 1 }} onClick={() => onSelect(swap)} role="button" style={{ cursor: 'pointer', flex: 1 }}>
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{swap.swap.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>замість {swap.original.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <span style={{ background: diff < 0 ? '#e8f8f0' : '#fff3e6', color: diff < 0 ? 'var(--green-dark)' : '#e67e22', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                          {diff < 0 ? '−' : '+'}{Math.abs(diff)} ккал
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{swap.swap.macros.calories} ккал / порція</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button
                        onClick={() => onToggleFavorite(swap.id)}
                        style={{ width: 34, height: 34, borderRadius: 10, background: '#fff0f3', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Видалити з обраного"
                      >
                        <Heart size={16} color="#e74c3c" fill="#e74c3c" />
                      </button>
                      <button
                        onClick={() => onSelect(swap)}
                        style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Переглянути"
                      >
                        <ChevronRight size={16} color="var(--text-muted)" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
