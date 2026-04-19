import type { Macros } from '../types'


interface MacroBarProps {
  label: string
  value: number
  unit?: string
  max: number
  color: string
}

function MacroBar({ label, value, unit = 'г', max, color }: MacroBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/50 font-medium">{label}</span>
        <span className="text-white/80 font-semibold tabular-nums">
          {value}{unit}
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

interface MacroCardProps {
  macros: Macros
  compact?: boolean
}

export function MacroCard({ macros, compact = false }: MacroCardProps) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
          <span className="text-xs text-white/60">Кал</span>
          <span className="text-xs font-semibold text-white ml-auto">{macros.calories}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
          <span className="text-xs text-white/60">Білки</span>
          <span className="text-xs font-semibold text-white ml-auto">{macros.protein}г</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
          <span className="text-xs text-white/60">Жири</span>
          <span className="text-xs font-semibold text-white ml-auto">{macros.fat}г</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
          <span className="text-xs text-white/60">Вуглев.</span>
          <span className="text-xs font-semibold text-white ml-auto">{macros.carbs}г</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <MacroBar label="Калорії" value={macros.calories} unit=" ккал" max={800} color="bg-orange-400" />
      <MacroBar label="Білки" value={macros.protein} max={60} color="bg-blue-400" />
      <MacroBar label="Жири" value={macros.fat} max={50} color="bg-yellow-400" />
      <MacroBar label="Вуглеводи" value={macros.carbs} max={100} color="bg-purple-400" />
      {macros.fiber !== undefined && (
        <MacroBar label="Клітковина" value={macros.fiber} max={20} color="bg-green-400" />
      )}
    </div>
  )
}
