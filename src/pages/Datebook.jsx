import { useState } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isToday, isSameMonth, parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getCalendarGrid(month) {
  const start  = startOfMonth(month)
  const end    = endOfMonth(month)
  const days   = eachDayOfInterval({ start, end })
  const offset = (getDay(start) + 6) % 7   // Mon = 0
  const cells  = [...Array(offset).fill(null), ...days]
  // pad tail to complete last row
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function Datebook() {
  const [month,    setMonth]    = useState(new Date())
  const [selected, setSelected] = useState(format(new Date(), 'yyyy-MM-dd'))

  const monthStart = format(startOfMonth(month), 'yyyy-MM-dd')
  const monthEnd   = format(endOfMonth(month),   'yyyy-MM-dd')

  // Activity data for the visible month
  const activity = useLiveQuery(async () => {
    const [entries, workouts, outbound] = await Promise.all([
      db.entries.where('date').between(monthStart, monthEnd, true, true).toArray(),
      db.workouts.where('date').between(monthStart, monthEnd, true, true).toArray(),
      db.outbound.where('date').between(monthStart, monthEnd, true, true).toArray(),
    ])
    const map = {}
    for (const e of entries)  { map[e.date] = { ...map[e.date], checkin: true, gym: !!e.gym, mood: e.moodWord } }
    for (const w of workouts) { map[w.date] = { ...map[w.date], workout: true } }
    for (const o of outbound) { map[o.date] = { ...map[o.date], outbound: true, meetings: o.meetings || 0 } }
    return map
  }, [monthStart, monthEnd])

  // Selected day detail
  const selDetail = useLiveQuery(async () => {
    if (!selected) return null
    const [entry, workout, out] = await Promise.all([
      db.entries.get(selected),
      db.workouts.get(selected),
      db.outbound.get(selected),
    ])
    return { entry, workout, out }
  }, [selected])

  const grid = getCalendarGrid(month)

  return (
    <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">

      {/* header + navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="ff-heading text-[22px] font-bold text-[#e5e5e5] tracking-tight leading-none">
            DATEBOOK
          </h1>
          <p className="ff-mono text-[11px] text-[#3a3a3a] mt-1 tracking-[0.15em] uppercase">
            {format(month, 'MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth(m => subMonths(m, 1))}
            className="p-2 text-[#525252] hover:text-[#d4a853] transition-colors border
              border-[#252525] hover:border-[#d4a85350]"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setMonth(new Date())}
            className="px-2.5 py-2 ff-mono text-[10px] text-[#525252] border border-[#252525]
              hover:text-[#d4a853] hover:border-[#d4a85350] transition-colors uppercase tracking-wider"
          >
            Now
          </button>
          <button
            type="button"
            onClick={() => setMonth(m => addMonths(m, 1))}
            className="p-2 text-[#525252] hover:text-[#d4a853] transition-colors border
              border-[#252525] hover:border-[#d4a85350]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* dow headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map((d, i) => (
          <div key={i} className="text-center ff-mono text-[10px] text-[#3a3a3a] py-1 uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-[#1a1a1a] border border-[#1a1a1a] mb-4">
        {grid.map((day, i) => {
          if (!day) {
            return <div key={`pad-${i}`} className="bg-[#0f0f0f] h-12" />
          }
          const dateStr  = format(day, 'yyyy-MM-dd')
          const info     = activity?.[dateStr] ?? {}
          const today    = isToday(day)
          const sel      = dateStr === selected
          const inMonth  = isSameMonth(day, month)

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => setSelected(dateStr)}
              className="bg-[#0f0f0f] h-12 flex flex-col items-center justify-start pt-1.5 gap-0.5
                transition-colors relative"
              style={{
                backgroundColor: sel ? '#d4a85318' : today ? '#161616' : '#0f0f0f',
                outline: sel ? '1px solid #d4a85360' : today ? '1px solid #252525' : 'none',
                outlineOffset: '-1px',
              }}
            >
              <span
                className="ff-mono text-[11px] tabular-nums"
                style={{
                  color: !inMonth ? '#252525' : sel ? '#d4a853' : today ? '#e5e5e5' : '#525252',
                }}
              >
                {format(day, 'd')}
              </span>
              {/* activity dots */}
              <div className="flex gap-[2px]">
                {info.checkin  && <span className="w-[4px] h-[4px] rounded-full bg-[#d4a853]" />}
                {info.gym      && <span className="w-[4px] h-[4px] rounded-full bg-[#4ade80]" />}
                {info.workout  && !info.gym && <span className="w-[4px] h-[4px] rounded-full bg-[#22d3ee]" />}
                {info.outbound && <span className="w-[4px] h-[4px] rounded-full bg-[#60a5fa]" />}
                {info.meetings > 0 && <span className="w-[4px] h-[4px] rounded-full bg-[#fbbf24]" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* dot legend */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { color: '#d4a853', label: 'Check-in' },
          { color: '#4ade80', label: 'Gym' },
          { color: '#22d3ee', label: 'Workout' },
          { color: '#60a5fa', label: 'Outbound' },
          { color: '#fbbf24', label: 'Meeting' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-[6px] h-[6px] rounded-full" style={{ background: color }} />
            <span className="ff-mono text-[9px] text-[#525252] uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* selected day detail */}
      {selected && selDetail !== undefined && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="ff-mono text-[10px] tracking-[0.2em] text-[#d4a853] uppercase">
              {format(parseISO(selected), 'EEE d MMMM')}
            </span>
            <div className="flex-1 h-px bg-[#252525]" />
          </div>

          {!selDetail?.entry && !selDetail?.workout && !selDetail?.out ? (
            <p className="ff-mono text-[11px] text-[#2a2a2a] uppercase tracking-widest py-4 text-center">
              No data logged
            </p>
          ) : (
            <div className="border border-[#252525] bg-[#161616] divide-y divide-[#1e1e1e]">
              {selDetail?.entry && (
                <>
                  {selDetail.entry.weight != null && (
                    <Row label="Weight" value={`${selDetail.entry.weight} kg`} />
                  )}
                  {selDetail.entry.cals != null && (
                    <Row label="Calories" value={`${selDetail.entry.cals} kcal`} />
                  )}
                  {selDetail.entry.protein != null && (
                    <Row label="Protein" value={`${selDetail.entry.protein}g`} />
                  )}
                  {selDetail.entry.moodWord && (
                    <Row label="Status" value={selDetail.entry.moodWord} />
                  )}
                  {selDetail.entry.gym && (
                    <Row label="Gym" value="Trained" color="#4ade80" />
                  )}
                  {selDetail.entry.win && (
                    <Row label="Win" value={selDetail.entry.win} />
                  )}
                </>
              )}
              {selDetail?.workout?.type && (
                <Row label="Session" value={selDetail.workout.type} />
              )}
              {selDetail?.workout?.exercises?.length > 0 && (
                <Row label="Exercises" value={`${selDetail.workout.exercises.length} logged`} />
              )}
              {selDetail?.out?.calls != null && (
                <Row label="Calls" value={String(selDetail.out.calls)} />
              )}
              {selDetail?.out?.meetings > 0 && (
                <Row label="Meetings" value={String(selDetail.out.meetings)} color="#fbbf24" />
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="ff-mono text-[10px] text-[#525252] uppercase tracking-wider">{label}</span>
      <span className="ff-mono text-[12px]" style={{ color: color ?? '#e5e5e5' }}>{value}</span>
    </div>
  )
}
