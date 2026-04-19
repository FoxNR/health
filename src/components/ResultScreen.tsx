import type { SwapResult } from '../types'

import { ArrowRight, Brain, Heart, Share2, RotateCcw, TrendingDown, TrendingUp, ChevronLeft, Check } from 'lucide-react'
import { MacroCard } from './MacroCard'
import { useState } from 'react'

interface ResultScreenProps {
  swap: SwapResult
  onBack: () => void
  onToggleFavorite: (id: string) => void
}

interface CompareRowProps {
  label: string
  original: number | string
  swapped: number | string
  unit?: string
  highlight?: 'up' | 'down' | 'neutral'
}

function CompareRow({ label, original, swapped, unit = '', highlight = 'neutral' }: CompareRowProps) {
  const origNum = typeof original === 'number' ? original : 0
  const swapNum = typeof swapped === 'number' ? swapped : 0
  const better = swapNum < origNum

  return (
    <tr className="group">
      <td className="py-3 px-4 text-sm text-white/50 font-medium w-1/3">{label}</td>
      <td className="py-3 px-4 text-sm text-white/70 text-center w-1/3">
        {original}{unit}
      </td>
      <td className={`py-3 px-4 text-sm font-semibold text-center w-1/3 ${
        highlight === 'neutral'
          ? 'text-white/70'
          : better ? 'text-brand-400' : 'text-orange-400'
      }`}>
        <span className="flex items-center justify-center gap-1">
          {swapped}{unit}
          {highlight !== 'neutral' && better && <TrendingDown size={10} />}
          {highlight !== 'neutral' && !better && <TrendingUp size={10} />}
        </span>
      </td>
    </tr>
  )
}

export function ResultScreen({ swap, onBack, onToggleFavorite }: ResultScreenProps) {
  const [copied, setCopied] = useState(false)
  const calDiff = swap.swap.macros.calories - swap.original.macros.calories
  const calPct = Math.round(Math.abs(calDiff / swap.original.macros.calories) * 100)

  const handleShare = async () => {
    const text = `MealSwap: замінив ${swap.original.name} (${swap.original.macros.calories} ккал) на ${swap.swap.name} (${swap.swap.macros.calories} ккал) — мінус ${Math.abs(calDiff)} ккал! 🥗`
    if (navigator.share) {
      await navigator.share({ title: 'MealSwap', text, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-8">

      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          id="back-btn"
          className="p-2 rounded-xl glass hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          aria-label="Назад"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-display font-bold text-lg text-white">Твій SwapResult</h2>
      </div>

      {/* Hero comparison card */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-white/10">

          {/* Original */}
          <div className={`p-4 bg-gradient-to-b ${swap.original.color}`}>
            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Оригінал</p>
            <div className="text-4xl mb-2">{swap.original.emoji}</div>
            <p className="font-display font-bold text-white text-sm leading-tight">{swap.original.name}</p>
            <p className="text-xs text-white/50 mt-1">{swap.original.serving}</p>
            <div className="mt-3 text-2xl font-display font-black text-white/80">
              {swap.original.macros.calories}
              <span className="text-xs font-normal text-white/40 ml-1">ккал</span>
            </div>
          </div>

          {/* Swap */}
          <div className={`p-4 bg-gradient-to-b ${swap.swap.color} relative`}>
            <p className="text-xs text-brand-400 uppercase tracking-widest font-semibold mb-2 flex items-center gap-1">
              <span>Swap ✨</span>
            </p>
            <div className="text-4xl mb-2">{swap.swap.emoji}</div>
            <p className="font-display font-bold text-white text-sm leading-tight">{swap.swap.name}</p>
            <p className="text-xs text-white/50 mt-1">{swap.swap.serving}</p>
            <div className="mt-3 text-2xl font-display font-black text-brand-400">
              {swap.swap.macros.calories}
              <span className="text-xs font-normal text-white/40 ml-1">ккал</span>
            </div>

            {/* Calorie badge */}
            <div className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5 ${
              calDiff < 0 ? 'bg-brand-500/30 text-brand-300' : 'bg-orange-500/30 text-orange-300'
            }`}>
              {calDiff < 0 ? '−' : '+'}{calPct}%
            </div>
          </div>
        </div>

        {/* Arrow divider */}
        <div className="flex justify-center py-3 border-t border-white/10 bg-white/2">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <ArrowRight size={14} className="text-brand-400" />
            <span>
              {calDiff < 0 ? `на ${Math.abs(calDiff)} ккал менше` : `на ${Math.abs(calDiff)} ккал більше`}
            </span>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="glass rounded-2xl p-4 border border-brand-500/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-brand-500/20">
            <Brain size={14} className="text-brand-400" />
          </div>
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">AI Аналіз</span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{swap.aiReason}</p>
      </div>

      {/* Compare table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="font-display font-semibold text-white text-sm">Порівняння КБЖВ</h3>
        </div>
        <div className="px-2">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="py-2 px-2 text-xs text-white/30 font-normal text-left">Нутрієнт</th>
                <th className="py-2 px-2 text-xs text-white/30 font-normal text-center">{swap.original.emoji} Ориг.</th>
                <th className="py-2 px-2 text-xs text-brand-400 font-normal text-center">{swap.swap.emoji} Swap</th>
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Калорії" original={swap.original.macros.calories} swapped={swap.swap.macros.calories} unit=" ккал" highlight="down" />
              <CompareRow label="Білки" original={swap.original.macros.protein} swapped={swap.swap.macros.protein} unit="г" highlight="up" />
              <CompareRow label="Жири" original={swap.original.macros.fat} swapped={swap.swap.macros.fat} unit="г" highlight="down" />
              <CompareRow label="Вуглеводи" original={swap.original.macros.carbs} swapped={swap.swap.macros.carbs} unit="г" highlight="down" />
              {swap.swap.macros.fiber !== undefined && (
                <CompareRow label="Клітковина" original={swap.original.macros.fiber ?? 0} swapped={swap.swap.macros.fiber} unit="г" highlight="up" />
              )}
            </tbody>
          </table>
        </div>

        {/* Macro bars for swap */}
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-medium">Профіль нутрієнтів — {swap.swap.name}</p>
          <MacroCard macros={swap.swap.macros} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          id="favorite-btn"
          onClick={() => onToggleFavorite(swap.id)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 active:scale-95 ${
            swap.isFavorite
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
              : 'glass text-white/50 hover:text-rose-400'
          }`}
        >
          <Heart size={20} fill={swap.isFavorite ? 'currentColor' : 'none'} />
          <span className="text-xs font-medium">{swap.isFavorite ? 'Збережено' : 'Зберегти'}</span>
        </button>

        <button
          id="share-btn"
          onClick={handleShare}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl glass text-white/50 hover:text-brand-400 transition-all duration-200 active:scale-95"
        >
          {copied ? <Check size={20} className="text-brand-400" /> : <Share2 size={20} />}
          <span className="text-xs font-medium">{copied ? 'Скопійовано' : 'Поділитись'}</span>
        </button>

        <button
          id="retry-btn"
          onClick={onBack}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl glass text-white/50 hover:text-white transition-all duration-200 active:scale-95"
        >
          <RotateCcw size={20} />
          <span className="text-xs font-medium">Новий Swap</span>
        </button>
      </div>
    </div>
  )
}
