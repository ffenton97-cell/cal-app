import { useState, useEffect, useRef } from 'react'
import { format, subDays } from 'date-fns'
import { BookOpen, Zap } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useDayNote, saveDayNote } from '../hooks/useDayNotes'
import { awardXP } from '../hooks/useXP'
import { XP as XP_VALUES } from '../theme'
import { db } from '../db'

export default function Journal({ onXP }) {
  const todayStr  = format(new Date(), 'yyyy-MM-dd')
  const todayNote = useDayNote()

  const pastDates = Array.from({ length: 6 }, (_, i) =>
    format(subDays(new Date(), i + 1), 'yyyy-MM-dd')
  )
  const pastNotes = useLiveQuery(
    () => Promise.all(pastDates.map(d => db.dayNotes.get(d))),
    []
  )

  const [text,  setText]  = useState('')
  const [saved, setSaved] = useState(false)

  const prefilled  = useRef(false)
  const alreadyXPd = useRef(false)

  useEffect(() => {
    if (todayNote === undefined) return
    if (prefilled.current) return
    prefilled.current = true
    if (!todayNote) return
    setText(todayNote.notes?.[0] ?? '')
    alreadyXPd.current = true
    setSaved(true)
  }, [todayNote])

  async function handleBlur() {
    if (!text.trim()) return
    await saveDayNote(todayStr, text)
    setSaved(true)
    if (!alreadyXPd.current && text.trim().length > 20) {
      alreadyXPd.current = true
      const { unlockedAchievements } = await awardXP(XP_VALUES.journalEntry, {
        totalCheckIns: 0, checkInStreak: 0, totalWorkouts: 0,
        totalGoals: 0, completedGoals: 0, outboundDays: 0, totalCalls: 0,
        totalWeightLogs: 0, totalScans: 0, totalFinanceLogs: 0,
      })
      onXP?.({ amount: XP_VALUES.journalEntry, achievement: unlockedAchievements[0] ?? null })
    }
  }

  return (
    <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="ff-heading text-[22px] font-bold text-[#e5e5e5] tracking-tight leading-none">
            FIELD NOTES
          </h1>
          <p className="ff-mono text-[11px] text-[#3a3a3a] mt-1 tracking-[0.15em] uppercase">
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
        </div>
        {!alreadyXPd.current && (
          <div className="flex items-center gap-1 px-2.5 py-1.5
            bg-[#d4a85312] border border-[#d4a85330]">
            <Zap size={11} className="text-[#d4a853]" />
            <span className="ff-mono text-[11px] text-[#d4a853]">+{XP_VALUES.journalEntry} XP</span>
          </div>
        )}
      </div>

      {/* today's entry */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-3">
          <span className="ff-mono text-[10px] tracking-[0.2em] text-[#d4a853] uppercase">Today</span>
          <div className="flex-1 h-px bg-[#252525]" />
          {saved && (
            <span className="ff-mono text-[9px] text-[#4ade80] uppercase tracking-wider">Saved</span>
          )}
        </div>
        <textarea
          rows={10}
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder={`${format(new Date(), 'EEEE')} — what happened today? What are you thinking about?`}
          className="fl-input ff-mono text-[13px] leading-relaxed resize-none w-full"
          style={{ padding: '0.75rem', minHeight: '220px' }}
          autoFocus
        />
        <p className="ff-mono text-[9px] text-[#2a2a2a] mt-1 uppercase tracking-widest">
          Auto-saves on tap away
        </p>
      </div>

      {/* past entries */}
      {pastNotes?.some(Boolean) && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="ff-mono text-[10px] tracking-[0.2em] text-[#d4a853] uppercase">Previous</span>
            <div className="flex-1 h-px bg-[#252525]" />
          </div>
          <div className="space-y-4">
            {pastDates.map((d, i) => {
              const note  = pastNotes?.[i]
              const entry = note?.notes?.[0]
              if (!entry) return null
              return (
                <div key={d} className="border-l-2 border-[#252525] pl-3">
                  <p className="ff-mono text-[10px] text-[#525252] uppercase tracking-widest mb-1.5">
                    {format(new Date(d + 'T00:00:00'), 'EEE d MMM')}
                  </p>
                  <p className="ff-mono text-[12px] text-[#8a8a8a] leading-relaxed line-clamp-4">
                    {entry}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!text && !saved && !pastNotes?.some(Boolean) && (
        <div className="py-16 text-center">
          <BookOpen size={28} className="text-[#1e1e1e] mx-auto mb-3" />
          <p className="ff-mono text-[11px] text-[#252525] uppercase tracking-widest">No entries yet</p>
          <p className="ff-mono text-[10px] text-[#1e1e1e] mt-1">Start typing above</p>
        </div>
      )}

    </div>
  )
}
