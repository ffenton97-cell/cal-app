import { format } from 'date-fns'
import { useXP } from '../hooks/useXP'
import { useStreaks } from '../hooks/useStreaks'

export default function Header() {
  const { totalXp, earnedToday, levelInfo } = useXP()
  const { checkInStreak } = useStreaks()

  const { current, next, progress, xpIntoLevel, xpForNext } = levelInfo ?? {
    current: { level: 1, title: 'Recruit' },
    next:    { xpRequired: 100 },
    progress: 0,
    xpIntoLevel: 0,
    xpForNext: 100,
  }

  return (
    <header className="px-4 pt-3 pb-2.5 bg-[#141414] border-b border-[#252525] shrink-0">
      {/* top row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="ff-heading text-xs font-bold text-[#d4a853] tracking-widest uppercase">
            LVL {current.level}
          </span>
          <span className="w-px h-3 bg-[#252525]" />
          <span className="ff-mono text-[10px] text-[#525252] uppercase tracking-wider">
            {current.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {checkInStreak > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[11px]">🔥</span>
              <span className="ff-mono text-[11px] text-[#fb923c] tabular-nums">{checkInStreak}</span>
            </div>
          )}
          {earnedToday > 0 && (
            <span className="ff-mono text-[10px] text-[#d4a853]">+{earnedToday} today</span>
          )}
          <span className="ff-mono text-[10px] text-[#3a3a3a] uppercase tracking-wider">
            {format(new Date(), 'EEE d MMM')}
          </span>
        </div>
      </div>

      {/* XP bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-[2px] bg-[#1e1e1e] relative">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${progress * 100}%`,
              background: '#d4a853',
              boxShadow: progress > 0.5 ? '0 0 6px #d4a85360' : 'none',
            }}
          />
        </div>
        <span className="ff-mono text-[10px] text-[#3a3a3a] tabular-nums whitespace-nowrap">
          {xpIntoLevel.toLocaleString()}/{xpForNext.toLocaleString()}
          {next ? '' : ' MAX'}
        </span>
      </div>
    </header>
  )
}
