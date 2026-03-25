import { useState, useEffect, useRef } from 'react'
import { format, subDays } from 'date-fns'
import { Phone, CheckCheck, Zap, Flame, TrendingUp, Calendar } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useOutbound, saveOutbound } from '../hooks/useOutbound'
import { awardXP } from '../hooks/useXP'
import { XP as XP_VALUES } from '../theme'
import { db } from '../db'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(num, den) {
  if (!den || !num) return null
  return Math.round((num / den) * 100)
}

function rateColor(p) {
  if (p == null) return '#525252'
  if (p >= 40)   return '#4ade80'
  if (p >= 20)   return '#d4a853'
  return '#f87171'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="ff-mono text-[10px] tracking-[0.2em] text-[#d4a853] uppercase">
        {children}
      </span>
      <div className="flex-1 h-px bg-[#252525]" />
    </div>
  )
}

function MetricInput({ label, value, onChange, sub }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <label className="ff-mono text-[9px] uppercase tracking-widest text-[#525252]">
        {label}
      </label>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="—"
        className="fl-input ff-mono text-xl text-center py-2.5 w-full"
      />
      {sub != null && (
        <span
          className="ff-mono text-[10px] tabular-nums"
          style={{ color: typeof sub === 'number' ? rateColor(sub) : '#525252' }}
        >
          {typeof sub === 'number' ? `${sub}%` : sub}
        </span>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Outbound({ onXP }) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const existing = useOutbound()

  // ── weekly rollup (last 5 weekdays including today) ──────────────────────
  const weeklyStats = useLiveQuery(async () => {
    const days = Array.from({ length: 7 }, (_, i) =>
      format(subDays(new Date(), i), 'yyyy-MM-dd')
    )
    const records = await Promise.all(days.map(d => db.outbound.get(d)))
    const live = records.filter(Boolean)
    return {
      days:     live.length,
      calls:    live.reduce((s, r) => s + (r.calls    || 0), 0),
      convos:   live.reduce((s, r) => s + (r.convos   || 0), 0),
      emails:   live.reduce((s, r) => s + (r.emails   || 0), 0),
      meetings: live.reduce((s, r) => s + (r.meetings || 0), 0),
    }
  }, [])

  // ── outbound streak ───────────────────────────────────────────────────────
  const outboundStreak = useLiveQuery(async () => {
    let streak = 0
    let cursor = todayStr
    for (let i = 0; i < 365; i++) {
      const rec = await db.outbound.get(cursor)
      if (!rec) break
      streak++
      cursor = format(subDays(new Date(cursor + 'T00:00:00'), 1), 'yyyy-MM-dd')
    }
    return streak
  }, [])

  // ── form state ────────────────────────────────────────────────────────────
  const [calls,       setCalls]       = useState('')
  const [connected,   setConnected]   = useState('')
  const [convos,      setConvos]      = useState('')
  const [emails,      setEmails]      = useState('')
  const [replies,     setReplies]     = useState('')
  const [meetings,    setMeetings]    = useState(0)
  const [liConnects,  setLiConnects]  = useState('')
  const [liAccepted,  setLiAccepted]  = useState('')
  const [liDms,       setLiDms]       = useState('')
  const [notes,       setNotes]       = useState('')
  const [saved,       setSaved]       = useState(false)
  const [submitting,  setSubmitting]  = useState(false)

  const prefilled  = useRef(false)
  const alreadyXPd = useRef(false)

  // ── pre-fill ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (existing === undefined) return
    if (prefilled.current) return
    prefilled.current = true
    if (!existing) return

    alreadyXPd.current = true
    setCalls(existing.calls       != null ? String(existing.calls)       : '')
    setConnected(existing.connected != null ? String(existing.connected) : '')
    setConvos(existing.convos     != null ? String(existing.convos)     : '')
    setEmails(existing.emails     != null ? String(existing.emails)     : '')
    setReplies(existing.replies   != null ? String(existing.replies)    : '')
    setMeetings(existing.meetings != null ? existing.meetings           : 0)
    setLiConnects(existing.liConnects != null ? String(existing.liConnects) : '')
    setLiAccepted(existing.liAccepted != null ? String(existing.liAccepted) : '')
    setLiDms(existing.liDms       != null ? String(existing.liDms)     : '')
    setNotes(existing.notes       ?? '')
    setSaved(true)
  }, [existing])

  // ── derived ───────────────────────────────────────────────────────────────
  const callsN      = parseInt(calls,      10) || 0
  const connectedN  = parseInt(connected,  10) || 0
  const convosN     = parseInt(convos,     10) || 0
  const emailsN     = parseInt(emails,     10) || 0
  const repliesN    = parseInt(replies,    10) || 0
  const liConnectsN = parseInt(liConnects, 10) || 0
  const liAcceptedN = parseInt(liAccepted, 10) || 0
  const liDmsN      = parseInt(liDms,      10) || 0

  const connectRate = pct(connectedN, callsN)
  const convoRate   = pct(convosN,    callsN)
  const replyRate   = pct(repliesN,   emailsN)
  const liAccRate   = pct(liAcceptedN, liConnectsN)

  const xpGain = alreadyXPd.current ? 0
    : XP_VALUES.logOutbound
    + (callsN    > 0 ? 2 : 0)
    + (emailsN   > 0 ? 2 : 0)
    + (liDmsN    > 0 ? 1 : 0)
    + (meetings  > 0 ? 3 : 0)

  // ── submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)

    await saveOutbound(todayStr, {
      calls:      callsN     || null,
      connected:  connectedN || null,
      convos:     convosN    || null,
      emails:     emailsN    || null,
      replies:    repliesN   || null,
      meetings:   meetings   || null,
      liConnects: liConnectsN || null,
      liAccepted: liAcceptedN || null,
      liDms:      liDmsN     || null,
      notes:      notes.trim() || null,
    })

    if (!alreadyXPd.current) {
      alreadyXPd.current = true

      const [outboundDays, allRecords, totalCheckIns, totalWorkouts,
             totalGoals, completedGoals, totalWeightLogs, totalScans, totalFinanceLogs] =
        await Promise.all([
          db.outbound.count(),
          db.outbound.toArray(),
          db.entries.count(),
          db.workouts.count(),
          db.goals.count(),
          db.goals.filter(g => g.completed).count(),
          db.entries.filter(e => !!e.weight).count(),
          db.scans.count(),
          db.finance.count(),
        ])
      const totalCalls = allRecords.reduce((s, r) => s + (r.calls || 0), 0)

      const { unlockedAchievements } = await awardXP(xpGain, {
        outboundDays, totalCalls,
        totalCheckIns, checkInStreak: 0,
        totalWorkouts, totalGoals, completedGoals,
        totalWeightLogs, totalScans, totalFinanceLogs,
      })
      onXP?.({ amount: xpGain, achievement: unlockedAchievements[0] ?? null })
    }

    setSaved(true)
    setSubmitting(false)
  }

  // ─── render ──────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">

      {/* header */}
      <div className="mb-4">
        <h1 className="ff-heading text-[22px] font-bold text-[#e5e5e5] tracking-tight leading-none">
          OUTBOUND LOG
        </h1>
        <p className="ff-mono text-[11px] text-[#3a3a3a] mt-1 tracking-[0.15em] uppercase">
          {format(new Date(), 'EEEE, d MMMM yyyy')}
        </p>
      </div>

      {/* streak + xp row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(outboundStreak ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5
            bg-[#161616] border border-[#252525]">
            <Flame size={12} className="text-[#fb923c]" />
            <span className="ff-mono text-[12px] text-[#e5e5e5] tabular-nums">
              {outboundStreak}
            </span>
            <span className="ff-mono text-[10px] text-[#525252]">day streak</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 px-2.5 py-1.5
          bg-[#d4a85312] border border-[#d4a85330]">
          <Zap size={11} className="text-[#d4a853]" />
          <span className="ff-mono text-[12px] text-[#d4a853] font-medium">
            {alreadyXPd.current ? 'FILED' : `+${xpGain} XP`}
          </span>
        </div>
      </div>

      {/* filed banner */}
      {saved && (
        <div className="flex items-center gap-2 mb-5 px-3 py-2
          bg-[#4ade8010] border border-[#4ade8028]">
          <CheckCheck size={12} className="text-[#4ade80] shrink-0" />
          <span className="ff-mono text-[11px] text-[#4ade80] tracking-widest uppercase">
            Log on file — tap to edit
          </span>
        </div>
      )}

      {/* ── MEETINGS BOOKED — hero metric ── */}
      <div className="mb-5">
        <SectionLabel>Meetings Booked</SectionLabel>
        <div
          className="flex items-center justify-between px-5 py-4 border transition-all duration-300"
          style={{
            borderColor:     meetings > 0 ? '#d4a853'   : '#252525',
            backgroundColor: meetings > 0 ? '#d4a85314' : '#161616',
          }}
        >
          <button
            type="button"
            onClick={() => setMeetings(m => Math.max(0, m - 1))}
            className="ff-mono text-2xl text-[#525252] hover:text-[#d4a853]
              transition-colors w-10 h-10 flex items-center justify-center
              border border-[#252525] hover:border-[#d4a85350]"
          >
            −
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <span
              className="ff-mono tabular-nums font-medium transition-all duration-200"
              style={{
                fontSize: '3rem',
                lineHeight: 1,
                color: meetings > 0 ? '#d4a853' : '#3a3a3a',
              }}
            >
              {meetings}
            </span>
            <span className="ff-mono text-[10px] uppercase tracking-[0.2em] text-[#525252]">
              booked today
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMeetings(m => m + 1)}
            className="ff-mono text-2xl text-[#525252] hover:text-[#d4a853]
              transition-colors w-10 h-10 flex items-center justify-center
              border border-[#252525] hover:border-[#d4a85350]"
          >
            +
          </button>
        </div>
        {meetings > 0 && (
          <p className="ff-mono text-[10px] text-[#d4a853] mt-1.5 tracking-wider">
            +3 XP bonus for booking
          </p>
        )}
      </div>

      {/* ── PHONE ── */}
      <div className="mb-5">
        <SectionLabel>Phone</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <MetricInput label="Dials"     value={calls}     onChange={setCalls}     />
          <MetricInput label="Connected" value={connected} onChange={setConnected} sub={connectRate} />
          <MetricInput label="Convos"    value={convos}    onChange={setConvos}    sub={convoRate} />
        </div>
        {callsN > 0 && (
          <div className="mt-2 flex gap-3">
            {connectRate != null && (
              <span className="ff-mono text-[10px]" style={{ color: rateColor(connectRate) }}>
                {connectRate}% connect rate
              </span>
            )}
            {convoRate != null && (
              <span className="ff-mono text-[10px]" style={{ color: rateColor(convoRate) }}>
                {convoRate}% convo rate
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── EMAIL ── */}
      <div className="mb-5">
        <SectionLabel>Email</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <MetricInput label="Sent"    value={emails}  onChange={setEmails}  />
          <MetricInput label="Replies" value={replies} onChange={setReplies} sub={replyRate} />
        </div>
        {emailsN > 0 && replyRate != null && (
          <p className="ff-mono text-[10px] mt-2" style={{ color: rateColor(replyRate) }}>
            {replyRate}% reply rate
          </p>
        )}
      </div>

      {/* ── LINKEDIN ── */}
      <div className="mb-5">
        <SectionLabel>LinkedIn</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <MetricInput label="Connects" value={liConnects} onChange={setLiConnects} />
          <MetricInput label="Accepted" value={liAccepted} onChange={setLiAccepted} sub={liAccRate} />
          <MetricInput label="DMs"      value={liDms}      onChange={setLiDms}      />
        </div>
        {liConnectsN > 0 && liAccRate != null && (
          <p className="ff-mono text-[10px] mt-2" style={{ color: rateColor(liAccRate) }}>
            {liAccRate}% acceptance rate
          </p>
        )}
      </div>

      {/* ── WEEKLY ROLLUP ── */}
      {weeklyStats && weeklyStats.days > 0 && (
        <div className="mb-5">
          <SectionLabel>This Week</SectionLabel>
          <div className="border border-[#252525] bg-[#161616]
            flex divide-x divide-[#252525]">
            {[
              { label: 'Days',  value: weeklyStats.days },
              { label: 'Calls', value: weeklyStats.calls },
              { label: 'Convos', value: weeklyStats.convos },
              { label: 'Emails', value: weeklyStats.emails },
              { label: 'Meets',  value: weeklyStats.meetings },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 flex-1 py-3">
                <span className="ff-mono text-[15px] tabular-nums"
                  style={{ color: (label === 'Meets' && value > 0) ? '#d4a853' : '#e5e5e5' }}>
                  {value}
                </span>
                <span className="ff-mono text-[9px] uppercase tracking-wider text-[#525252]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NOTES ── */}
      <div className="mb-6">
        <SectionLabel>Notes</SectionLabel>
        <textarea
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Best conversation, pipeline movement, blockers…"
          className="fl-input ff-mono text-[13px] resize-none"
          style={{ padding: '0.6rem 0.75rem' }}
        />
      </div>

      {/* ── SUBMIT ── */}
      <button
        type="button"
        disabled={submitting}
        onClick={handleSubmit}
        className="w-full py-4 ff-mono text-[13px] tracking-[0.2em] uppercase
          font-medium border transition-all duration-150 active:scale-[0.995]"
        style={{
          borderColor:     submitting ? '#252525' : '#d4a853',
          color:           submitting ? '#333'    : '#d4a853',
          backgroundColor: submitting ? '#161616' : '#d4a85316',
        }}
      >
        {submitting
          ? 'Saving…'
          : saved
            ? 'Update Log'
            : `Submit Log${xpGain > 0 ? ` — +${xpGain} XP` : ''}`}
      </button>

    </div>
  )
}
