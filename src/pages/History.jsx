import { format, subDays, parseISO } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

const MOOD_COLORS = {
  DIALED:  '#4ade80',
  SOLID:   '#d4a853',
  STEADY:  '#8a8a8a',
  DRAINED: '#fb923c',
  COOKED:  '#f87171',
}

export default function History() {
  // Last 60 days of entries + matching workouts + outbound
  const entries = useLiveQuery(async () => {
    const start = format(subDays(new Date(), 59), 'yyyy-MM-dd')
    const today = format(new Date(), 'yyyy-MM-dd')
    const [ents, works, outs] = await Promise.all([
      db.entries.where('date').between(start, today, true, true).toArray(),
      db.workouts.where('date').between(start, today, true, true).toArray(),
      db.outbound.where('date').between(start, today, true, true).toArray(),
    ])
    // Index by date
    const workMap = Object.fromEntries(works.map(w => [w.date, w]))
    const outMap  = Object.fromEntries(outs.map(o => [o.date, o]))
    return ents
      .map(e => ({ ...e, workout: workMap[e.date], outbound: outMap[e.date] }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [])

  if (!entries) {
    return (
      <div className="px-4 pt-4">
        <h1 className="ff-heading text-[22px] font-bold text-[#e5e5e5] tracking-tight">LOGBOOK</h1>
        <p className="ff-mono text-[11px] text-[#3a3a3a] mt-6 uppercase tracking-widest">Loading…</p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="px-4 pt-4 max-w-lg mx-auto">
        <h1 className="ff-heading text-[22px] font-bold text-[#e5e5e5] tracking-tight leading-none mb-1">
          LOGBOOK
        </h1>
        <p className="ff-mono text-[11px] text-[#3a3a3a] uppercase tracking-[0.15em]">
          Last 60 days
        </p>
        <div className="py-16 text-center">
          <p className="ff-mono text-[11px] text-[#252525] uppercase tracking-widest">No entries yet</p>
          <p className="ff-mono text-[10px] text-[#1e1e1e] mt-1">Start your daily check-in to build history</p>
        </div>
      </div>
    )
  }

  // Group by month
  const grouped = {}
  for (const e of entries) {
    const month = format(parseISO(e.date), 'MMMM yyyy')
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(e)
  }

  return (
    <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">

      <div className="mb-5">
        <h1 className="ff-heading text-[22px] font-bold text-[#e5e5e5] tracking-tight leading-none">
          LOGBOOK
        </h1>
        <p className="ff-mono text-[11px] text-[#3a3a3a] mt-1 tracking-[0.15em] uppercase">
          Last 60 days · {entries.length} entries
        </p>
      </div>

      {/* column headers */}
      <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] gap-1 px-2 mb-2">
        {['Date', 'Wt', 'Cal', 'Pro', 'Gym', 'Mood'].map(h => (
          <span key={h} className="ff-mono text-[9px] text-[#3a3a3a] uppercase tracking-wider">
            {h}
          </span>
        ))}
      </div>

      {Object.entries(grouped).map(([month, rows]) => (
        <div key={month} className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="ff-mono text-[10px] tracking-[0.2em] text-[#d4a853] uppercase">
              {month}
            </span>
            <div className="flex-1 h-px bg-[#252525]" />
          </div>

          <div className="border border-[#252525] divide-y divide-[#1a1a1a]">
            {rows.map(e => {
              const isToday = e.date === format(new Date(), 'yyyy-MM-dd')
              const moodColor = MOOD_COLORS[e.moodWord] ?? '#525252'
              const dateLabel = isToday
                ? 'Today'
                : format(parseISO(e.date), 'EEE d')
              return (
                <div
                  key={e.date}
                  className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] gap-1 px-2 py-2 items-center"
                  style={{ backgroundColor: isToday ? '#d4a85308' : undefined }}
                >
                  <span className="ff-mono text-[11px]"
                    style={{ color: isToday ? '#d4a853' : '#8a8a8a' }}>
                    {dateLabel}
                  </span>
                  <span className="ff-mono text-[11px] text-[#e5e5e5] tabular-nums">
                    {e.weight ?? '—'}
                  </span>
                  <span className="ff-mono text-[11px] text-[#525252] tabular-nums">
                    {e.cals ?? '—'}
                  </span>
                  <span className="ff-mono text-[11px] text-[#525252] tabular-nums">
                    {e.protein ? `${e.protein}g` : '—'}
                  </span>
                  <span className="ff-mono text-[11px]"
                    style={{ color: e.gym ? '#4ade80' : '#2a2a2a' }}>
                    {e.gym ? '✓' : '—'}
                  </span>
                  <span className="ff-mono text-[10px] truncate"
                    style={{ color: moodColor }}>
                    {e.moodWord ?? '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}

    </div>
  )
}
