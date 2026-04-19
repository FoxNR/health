import { useState, useRef, useEffect } from 'react'
import { Search, Sparkles, Mic, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

const SUGGESTIONS = [
  'Хочу щось солодке і ніжне, як чізкейк',
  'Замінити піцу на щось легше',
  'Здоровий бургер з менше калорій',
  'Морозиво без цукру',
  'Замінити паста карбонара',
]

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Rotate placeholder suggestions
  useEffect(() => {
    if (focused || value) return
    const id = setInterval(() => {
      setSuggestionIndex(i => (i + 1) % SUGGESTIONS.length)
    }, 3000)
    return () => clearInterval(id)
  }, [focused, value])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isLoading) onSearch(value.trim())
  }

  const handleSuggestionClick = (s: string) => {
    setValue(s)
    inputRef.current?.focus()
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center rounded-2xl transition-all duration-300 ${
          focused
            ? 'ring-2 ring-brand-500 shadow-[0_0_0_4px_rgba(34,197,94,0.1)]'
            : 'ring-1 ring-white/10'
        } bg-white/5 backdrop-blur-md`}>

          {/* Icon */}
          <div className="pl-4 pr-2 flex-shrink-0">
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            ) : (
              <Search size={18} className={`transition-colors ${focused ? 'text-brand-400' : 'text-white/30'}`} />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            id="meal-search-input"
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={SUGGESTIONS[suggestionIndex]}
            className="flex-1 bg-transparent py-4 pr-2 text-sm text-white placeholder:text-white/30 outline-none font-sans"
            disabled={isLoading}
            autoComplete="off"
            aria-label="Введи назву страви або опис смаку"
          />

          {/* Clear */}
          {value && (
            <button
              type="button"
              onClick={() => { setValue(''); inputRef.current?.focus() }}
              className="p-2 text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
              aria-label="Очистити"
            >
              <X size={14} />
            </button>
          )}

          {/* Mic button (decorative for now) */}
          <button
            type="button"
            className="p-2.5 mr-1 text-white/30 hover:text-brand-400 transition-colors flex-shrink-0"
            aria-label="Голосовий пошук"
          >
            <Mic size={16} />
          </button>

          {/* Submit */}
          <button
            id="search-submit-btn"
            type="submit"
            disabled={!value.trim() || isLoading}
            className="m-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center gap-1.5 transition-all duration-200 active:scale-95 flex-shrink-0"
            aria-label="Знайти заміну"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Swap</span>
          </button>
        </div>
      </form>

      {/* Quick suggestions */}
      {!value && !isLoading && (
        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGESTIONS.slice(0, 3).map(s => (
            <button
              key={s}
              onClick={() => handleSuggestionClick(s)}
              className="text-xs px-3 py-1.5 rounded-full glass text-white/50 hover:text-brand-400 hover:border-brand-500/30 transition-all duration-200 border border-white/10"
            >
              {s.slice(0, 28)}…
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
