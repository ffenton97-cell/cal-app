// ─── Color tokens ────────────────────────────────────────────────────────────
export const colors = {
  bg:        '#0f0f0f',
  surface:   '#1a1a1a',
  border:    '#2a2a2a',
  muted:     '#6b7280',
  text:      '#e5e5e5',
  textSoft:  '#a1a1aa',
  accent:    '#7c3aed',   // violet-700
  accentLit: '#8b5cf6',   // violet-500
  green:     '#22c55e',
  red:       '#ef4444',
  amber:     '#f59e0b',
  blue:      '#3b82f6',
}

// ─── XP values per action ────────────────────────────────────────────────────
export const XP = {
  checkIn:      10,
  logWeight:     5,
  logFood:       8,
  logWorkout:   15,
  logOutbound:  10,
  completeTodo:  3,
  addGoal:       5,
  logScan:      10,
  logFinance:    5,
  journalEntry:  5,
  streak3:      20,
  streak7:      50,
  streak30:    150,
}

// ─── Level thresholds ────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1,  xpRequired: 0,    title: 'Rookie' },
  { level: 2,  xpRequired: 100,  title: 'Contender' },
  { level: 3,  xpRequired: 250,  title: 'Grinder' },
  { level: 4,  xpRequired: 500,  title: 'Operator' },
  { level: 5,  xpRequired: 900,  title: 'Closer' },
  { level: 6,  xpRequired: 1400, title: 'Enforcer' },
  { level: 7,  xpRequired: 2100, title: 'Specialist' },
  { level: 8,  xpRequired: 3000, title: 'Elite' },
  { level: 9,  xpRequired: 4200, title: 'Legend' },
  { level: 10, xpRequired: 6000, title: 'Field Master' },
]

export function getLevelInfo(totalXp = 0) {
  let current = LEVELS[0]
  let next = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].xpRequired) {
      current = LEVELS[i]
      next = LEVELS[i + 1] || null
      break
    }
  }
  const xpIntoLevel = totalXp - current.xpRequired
  const xpForNext   = next ? next.xpRequired - current.xpRequired : 1
  const progress    = next ? Math.min(xpIntoLevel / xpForNext, 1) : 1
  return { current, next, xpIntoLevel, xpForNext, progress }
}

// ─── Achievement definitions ──────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'first_checkin',  label: 'First Check-In',   xp: 20, icon: '🎯', test: (stats) => stats.totalCheckIns >= 1 },
  { id: 'streak_3',       label: '3-Day Streak',      xp: 20, icon: '🔥', test: (stats) => stats.checkInStreak >= 3 },
  { id: 'streak_7',       label: 'Week Warrior',      xp: 50, icon: '⚡', test: (stats) => stats.checkInStreak >= 7 },
  { id: 'streak_30',      label: 'Monthly Machine',   xp: 150,icon: '👑', test: (stats) => stats.checkInStreak >= 30 },
  { id: 'first_workout',  label: 'First Workout',     xp: 20, icon: '💪', test: (stats) => stats.totalWorkouts >= 1 },
  { id: 'workout_10',     label: '10 Workouts',       xp: 50, icon: '🏋️', test: (stats) => stats.totalWorkouts >= 10 },
  { id: 'first_goal',     label: 'Goal Setter',       xp: 15, icon: '🎯', test: (stats) => stats.totalGoals >= 1 },
  { id: 'goal_complete',  label: 'Goal Crusher',      xp: 75, icon: '✅', test: (stats) => stats.completedGoals >= 1 },
  { id: 'outbound_100',   label: '100 Calls',         xp: 100,icon: '📞', test: (stats) => stats.totalCalls >= 100 },
]
