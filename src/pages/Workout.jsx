import { useState, useEffect, useRef } from 'react'
import { format, subDays, parseISO } from 'date-fns'
import { Dumbbell, CheckCheck, Zap, Plus, AlertTriangle } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useWorkout, saveWorkout } from '../hooks/useWorkout'
import { useEntry } from '../hooks/useEntry'
import { awardXP } from '../hooks/useXP'
import { XP as XP_VALUES } from '../theme'
import { db } from '../db'

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPES = ['PUSH', 'PULL', 'LEGS', 'UPPER', 'ARMS', 'CARDIO', 'OTHER']

const PRESETS = {
  PUSH:   ['Bench Press', 'Incline DB Press', 'OHP', 'Dips', 'Cable Fly', 'Lateral Raise', 'Tricep Pushdown', 'Skull Crushers'],
  PULL:   ['Deadlift', 'Pull-Up', 'Lat Pulldown', 'Cable Row', 'DB Row', 'Barbell Row', 'Face Pull', 'Barbell Curl', 'Hammer Curl'],
  LEGS:   ['Squat', 'Leg Press', 'RDL', 'Leg Curl', 'Leg Extension', 'Hack Squat', 'Calf Raise', 'Bulgarian Split Squat'],
  UPPER:  ['Bench Press', 'OHP', 'Pull-Up', 'DB Row', 'Lateral Raise', 'Barbell Curl', 'Tricep Pushdown'],
  ARMS:   ['Barbell Curl', 'Hammer Curl', 'Incline DB Curl', 'Tricep Pushdown', 'Skull Crushers', 'Overhead Ext', 'Preacher Curl'],
  CARDIO: ['Treadmill', 'Rowing Machine', 'Assault Bike', 'Stairmaster', 'Swimming'],
  OTHER:  [],
}

function newExercise(name = '') {
  return { id: crypto.randomUUID(), name, sets: [{ weight: '', reps: '' }] }
}

// ─── Workout streak ───────────────────────────────────────────────────────────
async function calcWorkoutStreak() {
  const today = format(new Date(), 'yyyy-MM-dd')
  let streak = 0
  let cursor = today
  for (let i = 0; i < 365; i++) {
    const record = await db.workouts.get(cursor)
    if (!record) break
    streak++
    cursor = format(subDays(parseISO(cursor), 1), 'yyyy-MM-dd')
  }
  return streak
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

function StatChip({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1 py-3">
      <span className="ff-mono text-[17px] text-[#d4a853] tabular-nums font-medium">{value}</span>
      <span className="ff-mono text-[9px] text-[#525252] uppercase tracking-widest">{label}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Workout({ onXP }) {
  const todayStr      = format(new Date(), 'yyyy-MM-dd')
  const existing      = useWorkout()
  const todayEntry    = useEntry()
  const workoutStreak = useLiveQuery(calcWorkoutStreak, [])

  // form state
  const [wtype,      setWtype]      = useState(null)
  const [duration,   setDuration]   = useState('')
  const [exercises,  setExercises]  = useState([])
  const [notes,      setNotes]      = useState('')
  const [saved,      setSaved]      = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const prefilled  = useRef(false)
  const alreadyXPd = useRef(false)

  // Pre-fill once when Dexie resolves
  useEffect(() => {
    if (existing === undefined) return
    if (prefilled.current) return
    prefilled.current = true
    if (!existing) return

    alreadyXPd.current = true
    setWtype(existing.type ?? null)
    setDuration(existing.duration != null ? String(existing.duration) : '')
    setExercises(
      Array.isArray(existing.exercises) && existing.exercises.length > 0
        ? existing.exercises
        : []
    )
    setNotes(existing.notes ?? '')
    setSaved(true)
  }, [existing])

  // ── computed ──
  const allSets      = exercises.flatMap(e => e.sets)
  const totalSets    = allSets.length
  const totalReps    = allSets.reduce((s, set) => s + (parseInt(set.reps) || 0), 0)
  const totalTonnage = allSets.reduce(
    (s, set) => s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0
  )
  const tonnageDisplay = totalTonnage >= 1000
    ? `${(totalTonnage / 1000).toFixed(1)}t`
    : totalTonnage > 0 ? `${Math.round(totalTonnage)}kg` : '—'

  const namedExercises = exercises.filter(e => e.name.trim()).length
  const varietyBonus   = namedExercises >= 3 ? 2 : 0
  const volumeBonus    = totalSets >= 12 ? 3 : 0
  const xpGain         = alreadyXPd.current ? 0
    : XP_VALUES.logWorkout + varietyBonus + volumeBonus

  const gymConfirmed = todayEntry === undefined || !!todayEntry?.gym

  // ── exercise mutations ──
  function addExercise(name = '') {
    setExercises(prev => [...prev, newExercise(name)])
  }

  function removeExercise(id) {
    setExercises(prev => prev.filter(e => e.id !== id))
  }

  function updateExerciseName(id, name) {
    setExercises(prev => prev.map(e => e.id === id ? { ...e, name } : e))
  }

  function addSet(exerciseId) {
    setExercises(prev => prev.map(e =>
      e.id === exerciseId
        ? { ...e, sets: [...e.sets, { weight: '', reps: '' }] }
        : e
    ))
  }

  function updateSet(exerciseId, idx, field, value) {
    setExercises(prev => prev.map(e => {
      if (e.id !== exerciseId) return e
      const sets = e.sets.map((s, i) => i === idx ? { ...s, [field]: value } : s)
      return { ...e, sets }
    }))
  }

  function removeSet(exerciseId, idx) {
    setExercises(prev => prev.map(e => {
      if (e.id !== exerciseId) return e
      if (e.sets.length <= 1) return e
      return { ...e, sets: e.sets.filter((_, i) => i !== idx) }
    }))
  }

  // ── submit ──
  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)

    const cleanExercises = exercises
      .filter(e => e.name.trim())
      .map(e => ({
        ...e,
        sets: e.sets.filter(s => s.reps !== '' || s.weight !== ''),
      }))

    await saveWorkout(todayStr, {
      type:      wtype,
      duration:  duration ? parseInt(duration, 10) : null,
      notes:     notes.trim() || null,
      exercises: cleanExercises,
    })

    if (!alreadyXPd.current) {
      alreadyXPd.current = true
      const [totalWorkouts, totalCheckIns, totalGoals, completedGoals,
             outboundDays, totalCalls, totalWeightLogs, totalScans, totalFinanceLogs] =
        await Promise.all([
          db.workouts.count(),
          db.entries.count(),
          db.goals.count(),
          db.goals.filter(g => g.completed).count(),
          db.outbound.count(),
          db.outbound.toArray().then(r => r.reduce((s, x) => s + (x.calls || 0), 0)),
          db.entries.filter(e => !!e.weight).count(),
          db.scans.count(),
          db.finance.count(),
        ])
      const { unlockedAchievements } = await awardXP(xpGain, {
        totalWorkouts, totalCheckIns, checkInStreak: 0,
        totalGoals, completedGoals,
        outboundDays, totalCalls, totalWeightLogs,
        totalScans, totalFinanceLogs,
      })
      onXP?.({ amount: xpGain, achievement: unlockedAchievements[0] ?? null })
    }

    setSaved(true)
    setSubmitting(false)
  }

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">

      {/* header */}
      <div className="mb-4">
        <h1 className="ff-heading text-[22px] font-bold text-[#e5e5e5] tracking-tight leading-none">
          TRAINING LOG
        </h1>
        <p className="ff-mono text-[11px] text-[#3a3a3a] mt-1 tracking-[0.15em] uppercase">
          {format(new Date(), 'EEEE, d MMMM yyyy')}
        </p>
      </div>

      {/* streak + xp row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5
          bg-[#161616] border border-[#252525]">
          <Dumbbell size={12} className="text-[#d4a853]" />
          <span className="ff-mono text-[12px] text-[#e5e5e5] tabular-nums">
            {workoutStreak ?? 0}
          </span>
          <span className="ff-mono text-[10px] text-[#525252]">session streak</span>
        </div>

        <div className="ml-auto flex items-center gap-1 px-2.5 py-1.5
          bg-[#d4a85312] border border-[#d4a85330]">
          <Zap size={11} className="text-[#d4a853]" />
          <span className="ff-mono text-[12px] text-[#d4a853] font-medium">
            {alreadyXPd.current ? 'FILED'
              : xpGain > 0 ? `+${xpGain} XP` : '+15 XP'}
          </span>
        </div>
      </div>

      {/* gym not confirmed */}
      {!gymConfirmed && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2
          border-l-2 border-[#fbbf24] bg-[#fbbf2408]">
          <AlertTriangle size={11} className="text-[#fbbf24] shrink-0" />
          <span className="ff-mono text-[11px] text-[#fbbf24] tracking-widest uppercase">
            Gym not confirmed in check-in
          </span>
        </div>
      )}

      {/* filed banner */}
      {saved && (
        <div className="flex items-center gap-2 mb-5 px-3 py-2
          bg-[#4ade8010] border border-[#4ade8028]">
          <CheckCheck size={12} className="text-[#4ade80] shrink-0" />
          <span className="ff-mono text-[11px] text-[#4ade80] tracking-widest uppercase">
            Session on file — tap to edit
          </span>
        </div>
      )}

      {/* ── WORKOUT TYPE ── */}
      <div className="mb-5">
        <SectionLabel>Workout Type</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setWtype(wtype === t ? null : t)}
              className="px-3 py-2 ff-mono text-[11px] uppercase tracking-widest border
                transition-all duration-150"
              style={{
                borderColor:     wtype === t ? '#d4a853' : '#252525',
                color:           wtype === t ? '#d4a853' : '#3a3a3a',
                backgroundColor: wtype === t ? '#d4a85314' : '#161616',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── DURATION ── */}
      <div className="mb-5">
        <SectionLabel>Duration</SectionLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="—"
            className="fl-input ff-mono text-lg text-center py-2 w-20"
          />
          <span className="ff-mono text-[#525252] text-sm">min</span>
        </div>
      </div>

      {/* ── EXERCISES ── */}
      <div className="mb-4">
        <SectionLabel>Exercises</SectionLabel>

        <div className="space-y-2">
          {exercises.map((ex) => (
            <div key={ex.id} className="border border-[#252525] bg-[#161616]">

              {/* exercise name header */}
              <div className="flex items-center gap-2 px-3 pt-2.5 pb-2
                border-b border-[#1e1e1e]">
                <input
                  type="text"
                  value={ex.name}
                  onChange={e => updateExerciseName(ex.id, e.target.value)}
                  placeholder="Exercise name"
                  className="flex-1 bg-transparent outline-none ff-mono text-[13px]
                    text-[#e5e5e5] placeholder:text-[#2a2a2a] border-none"
                />
                <button
                  type="button"
                  onClick={() => removeExercise(ex.id)}
                  className="ff-mono text-[#2a2a2a] hover:text-[#f87171] transition-colors
                    text-base leading-none"
                >
                  ×
                </button>
              </div>

              {/* sets */}
              <div className="px-3 py-2 space-y-1.5">
                {ex.sets.map((set, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="ff-mono text-[10px] text-[#2a2a2a] w-3.5 tabular-nums text-right shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      value={set.weight}
                      onChange={e => updateSet(ex.id, idx, 'weight', e.target.value)}
                      placeholder="—"
                      className="fl-input ff-mono text-sm text-center py-1 w-16"
                    />
                    <span className="ff-mono text-[11px] text-[#3a3a3a] shrink-0">kg ×</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={set.reps}
                      onChange={e => updateSet(ex.id, idx, 'reps', e.target.value)}
                      placeholder="—"
                      className="fl-input ff-mono text-sm text-center py-1 w-14"
                    />
                    {ex.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSet(ex.id, idx)}
                        className="ff-mono text-[#2a2a2a] hover:text-[#f87171]
                          transition-colors text-sm ml-auto"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addSet(ex.id)}
                  className="ff-mono text-[10px] text-[#3a3a3a] hover:text-[#d4a853]
                    transition-colors uppercase tracking-widest mt-0.5
                    flex items-center gap-1"
                >
                  <Plus size={9} />
                  Add Set
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* preset quick-add chips */}
        {wtype && PRESETS[wtype]?.length > 0 && (
          <div className="mt-3">
            <p className="ff-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest mb-1.5">
              Quick add
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none' }}>
              {PRESETS[wtype]
                .filter(name => !exercises.some(e => e.name === name))
                .map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => addExercise(name)}
                    className="flex-shrink-0 px-2.5 py-1.5 ff-mono text-[10px]
                      uppercase tracking-wider border border-[#252525] bg-[#0f0f0f]
                      text-[#525252] hover:border-[#d4a85360] hover:text-[#d4a853]
                      transition-all duration-150 whitespace-nowrap"
                  >
                    {name}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* add exercise */}
        <button
          type="button"
          onClick={() => addExercise()}
          className="mt-3 w-full py-2.5 ff-mono text-[11px] uppercase tracking-[0.15em]
            border border-dashed border-[#252525] text-[#3a3a3a]
            hover:border-[#d4a85350] hover:text-[#525252] transition-all duration-150
            flex items-center justify-center gap-1.5"
        >
          <Plus size={12} />
          Add Exercise
        </button>
      </div>

      {/* ── VOLUME STATS ── */}
      {totalSets > 0 && (
        <div className="mb-5">
          <SectionLabel>Volume</SectionLabel>
          <div className="flex border border-[#252525] bg-[#161616] divide-x divide-[#252525]">
            <StatChip label="Sets"    value={totalSets} />
            <StatChip label="Reps"    value={totalReps || '—'} />
            <StatChip label="Tonnage" value={tonnageDisplay} />
          </div>
          {(varietyBonus > 0 || volumeBonus > 0) && !alreadyXPd.current && (
            <div className="flex gap-2 mt-1.5">
              {varietyBonus > 0 && (
                <span className="ff-mono text-[10px] text-[#d4a853]">
                  +{varietyBonus} XP variety bonus
                </span>
              )}
              {volumeBonus > 0 && (
                <span className="ff-mono text-[10px] text-[#d4a853]">
                  +{volumeBonus} XP volume bonus
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── NOTES ── */}
      <div className="mb-6">
        <SectionLabel>Notes</SectionLabel>
        <textarea
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How'd it go? PRs, new weights, technique notes…"
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
            ? 'Update Session'
            : `Log Session${xpGain > 0 ? ` — +${xpGain} XP` : ''}`}
      </button>

    </div>
  )
}
