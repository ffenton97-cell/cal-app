import { format } from 'date-fns'
import { useXP } from '../hooks/useXP'
import { useStreaks } from '../hooks/useStreaks'

export default function Header() {
  const { totalXp, earnedToday, levelInfo } = useXP()
  const { checkInStreak } = useStreaks()
  const { current, progress, xpIntoLevel, xpForNext } = levelInfo ?? {
    current: { level: 1, title: 'Rookie' }, progress: 0, xpIntoLevel: 0, xpForNext: 100,
  }

  return (
    <header className="flex flex-col gap-1 px-4 pt-3 pb-2 bg-[#141414] border-b border-[#2a2a2a]">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Lvl {current.level}
          </span>
          <span className="text-xs text-zinc-500">{current.title}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {checkInStreak > 0 && (
            <span className="flex items-center gap-1">
              🔥 <span className="text-amber-400 font-semibold">{checkInStreak}</span>
            </span>
          )}
          <span>{format(new Date(), 'EEE d MMM')}</span>
        </div>
      </div>

      {/* XP bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-zinc-500 tabular-nums whitespace-nowrap">
          {xpIntoLevel}/{xpForNext} XP
          {earnedToday > 0 && (
            <span className="text-violet-400 ml-1">+{earnedToday} today</span>
          )}
        </span>
      </div>
    </header>
  )
}
