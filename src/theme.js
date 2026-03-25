// ─── Color tokens ─────────────────────────────────────────────────────────────
export const colors = {
  bg:        '#0f0f0f',
  surface:   '#161616',
  surfaceHi: '#1e1e1e',
  border:    '#252525',
  muted:     '#525252',
  text:      '#e5e5e5',
  textSoft:  '#8a8a8a',
  gold:      '#d4a853',   // primary accent
  goldDim:   '#a07830',
  goldGlow:  'rgba(212,168,83,0.15)',
  green:     '#4ade80',
  red:       '#f87171',
  amber:     '#fbbf24',
  blue:      '#60a5fa',
  cyan:      '#22d3ee',
}

// ─── Typography ───────────────────────────────────────────────────────────────
// Load in index.html via Google Fonts:
//   Syne (700) — headings/labels
//   DM Mono (400,500) — data/body
export const fonts = {
  heading: '"Syne", system-ui, sans-serif',
  mono:    '"DM Mono", ui-monospace, monospace',
}

// ─── XP values per action ─────────────────────────────────────────────────────
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
}

// ─── Level thresholds (Recruit → Legend) ─────────────────────────────────────
export const LEVELS = [
  { level: 1,  xpRequired: 0,    title: 'Recruit'    },
  { level: 2,  xpRequired: 100,  title: 'Prospect'   },
  { level: 3,  xpRequired: 250,  title: 'Grinder'    },
  { level: 4,  xpRequired: 500,  title: 'Operator'   },
  { level: 5,  xpRequired: 900,  title: 'Closer'     },
  { level: 6,  xpRequired: 1400, title: 'Enforcer'   },
  { level: 7,  xpRequired: 2100, title: 'Specialist' },
  { level: 8,  xpRequired: 3000, title: 'Elite'      },
  { level: 9,  xpRequired: 4200, title: 'Veteran'    },
  { level: 10, xpRequired: 6000, title: 'Legend'     },
]

export function getLevelInfo(totalXp = 0) {
  let current = LEVELS[0]
  let next    = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].xpRequired) {
      current = LEVELS[i]
      next    = LEVELS[i + 1] || null
      break
    }
  }
  const xpIntoLevel = totalXp - current.xpRequired
  const xpForNext   = next ? next.xpRequired - current.xpRequired : 1
  const progress    = next ? Math.min(xpIntoLevel / xpForNext, 1) : 1
  return { current, next, xpIntoLevel, xpForNext, progress }
}

// ─── Achievements (15) ────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  // Check-in milestones
  { id: 'first_checkin',   label: 'First Check-In',     xp: 20,  icon: '🎯',
    desc: 'Log your first daily check-in.',
    test: (s) => s.totalCheckIns >= 1 },
  { id: 'streak_3',        label: '3-Day Streak',        xp: 25,  icon: '🔥',
    desc: 'Check in 3 days in a row.',
    test: (s) => s.checkInStreak >= 3 },
  { id: 'streak_7',        label: 'Week Warrior',        xp: 60,  icon: '⚡',
    desc: 'Check in 7 days in a row.',
    test: (s) => s.checkInStreak >= 7 },
  { id: 'streak_30',       label: 'Iron Discipline',     xp: 200, icon: '👑',
    desc: '30-day check-in streak.',
    test: (s) => s.checkInStreak >= 30 },

  // Workout milestones
  { id: 'first_workout',   label: 'First Set',           xp: 20,  icon: '💪',
    desc: 'Log your first workout.',
    test: (s) => s.totalWorkouts >= 1 },
  { id: 'workout_10',      label: 'Ten Sessions',        xp: 50,  icon: '🏋️',
    desc: 'Complete 10 workout sessions.',
    test: (s) => s.totalWorkouts >= 10 },
  { id: 'workout_50',      label: 'Fifty Sessions',      xp: 150, icon: '🔩',
    desc: 'Complete 50 workout sessions.',
    test: (s) => s.totalWorkouts >= 50 },

  // Goals
  { id: 'first_goal',      label: 'Goal Setter',         xp: 15,  icon: '📌',
    desc: 'Create your first goal.',
    test: (s) => s.totalGoals >= 1 },
  { id: 'goal_complete',   label: 'Goal Crusher',        xp: 100, icon: '✅',
    desc: 'Complete a goal.',
    test: (s) => s.completedGoals >= 1 },

  // Outbound / sales
  { id: 'first_outbound',  label: 'First Dial',          xp: 20,  icon: '📞',
    desc: 'Log your first outbound day.',
    test: (s) => s.outboundDays >= 1 },
  { id: 'outbound_50',     label: '50 Calls',            xp: 75,  icon: '📲',
    desc: 'Log 50 total calls.',
    test: (s) => s.totalCalls >= 50 },
  { id: 'outbound_500',    label: '500 Calls',           xp: 250, icon: '🏆',
    desc: 'Log 500 total calls.',
    test: (s) => s.totalCalls >= 500 },

  // Body / health
  { id: 'first_weight',    label: 'Weigh-In',            xp: 10,  icon: '⚖️',
    desc: 'Log your first weight.',
    test: (s) => s.totalWeightLogs >= 1 },
  { id: 'first_scan',      label: 'Body Scan',           xp: 30,  icon: '🔬',
    desc: 'Log a DXA / body composition scan.',
    test: (s) => s.totalScans >= 1 },

  // Finance
  { id: 'first_finance',   label: 'Balance Sheet',       xp: 20,  icon: '💰',
    desc: 'Log your first finance snapshot.',
    test: (s) => s.totalFinanceLogs >= 1 },
]

// ─── User defaults (Freddie) ──────────────────────────────────────────────────
export const USER = {
  name:         'Freddie',
  role:         'Head of Sales',
  company:      'Tendl',
  cutCals:      1850,
  cutProtein:   180,
  weightStart:  68.8,
  weightTarget: 65,
  // Payday: fortnightly Wednesdays from 2026-03-25
  paydayAnchor: '2026-03-25',
  paydayInterval: 14,         // days
}
