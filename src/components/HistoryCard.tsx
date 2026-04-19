import type { SwapResult } from '../types'

import { Heart, ArrowRight, TrendingDown, TrendingUp, Clock } from 'lucide-react'
import { MacroCard } from './MacroCard'

interface HistoryCardProps {
  swap: SwapResult
  onSelect: (swap: SwapResult) => void
  onToggleFavorite: (id: string) => void
  index: number
}

// Map bento spans for visual variety
const BENTO_SPANS = [
  'col-span-2 row-span-2',
  'col-span-1',
  'col-span-1',
  'col-span-2',
]

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Сьогодні'
  if (days === 1) return 'Вчора'
  return `${days} дн. тому`
}

export function HistoryCard({ swap, onSelect, onToggleFavorite, index }: HistoryCardProps) {
  const spanClass = BENTO_SPANS[index % BENTO_SPANS.length]
  const isLarge = spanClass.includes('row-span-2')
  const calDiff = swap.caloriesDiff

  return (
    <div
      className={`bento-card glass relative group ${spanClass}`}
      onClick={() => onSelect(swap)}
      role="button"
      tabIndex={0}
      aria-label={`Переглянути заміну: ${swap.original.name} → ${swap.swap.name}`}
      onKeyDown={e => e.key === 'Enter' && onSelect(swap)}
    >
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${swap.swap.color} opacity-60`} />

      <div className="relative z-10 p-4 h-full flex flex-col justify-between gap-3 min-h-[130px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">{swap.original.emoji}</span>
            {isLarge && (
              <>
                <ArrowRight size={14} className="text-white/40" />
                <span className="text-2xl leading-none">{swap.swap.emoji}</span>
              </>
            )}
          </div>

          <button
            className={`p-1.5 rounded-full transition-colors duration-200 ${
              swap.isFavorite
                ? 'text-rose-400 bg-rose-400/20'
                : 'text-white/30 hover:text-rose-400 hover:bg-rose-400/10'
            }`}
            onClick={e => { e.stopPropagation(); onToggleFavorite(swap.id) }}
            aria-label={swap.isFavorite ? 'Видалити з обраного' : 'Зберегти в обране'}
          >
            <Heart size={14} fill={swap.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Food Names */}
        <div>
          <p className="font-display font-semibold text-white text-sm leading-tight line-clamp-2">
            {swap.original.name}
          </p>
          {isLarge && (
            <p className="text-xs text-brand-400 font-medium mt-0.5">
              → {swap.swap.name}
            </p>
          )}
        </div>

        {/* Large card extras */}
        {isLarge && (
          <div className="flex flex-col gap-2">
            <MacroCard macros={swap.swap.macros} compact />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className={`flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${
            calDiff < 0
              ? 'bg-brand-500/20 text-brand-400'
              : 'bg-orange-500/20 text-orange-400'
          }`}>
            {calDiff < 0
              ? <TrendingDown size={10} />
              : <TrendingUp size={10} />
            }
            {Math.abs(calDiff)} ккал
          </div>

          <div className="flex items-center gap-1 text-white/30 text-xs">
            <Clock size={10} />
            {formatRelativeDate(swap.savedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}
