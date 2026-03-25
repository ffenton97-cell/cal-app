import Dexie from 'dexie'

export const db = new Dexie('FieldLogDB')

db.version(1).stores({
  // Daily check-in: one record per date
  entries:  '&date, weight, protein, cals, mood, moodWord, gym, win, sales',

  // Workout sessions: one record per date
  workouts: '&date, type, notes, *exercises',

  // Food / nutrition: one record per date
  food:     '&date, *meals, totalCal, totalProtein, notes',

  // Sales / outbound activity: one record per date
  outbound: '&date, calls, connected, convos, emails, replies, meetings, liConnects, liAccepted, liDms, notes',

  // Todos / tasks
  todos:    '&id, title, category, priority, due, originalDue, recur, recurDays, done, completedDate, created, notes',

  // Free-form day notes (multiple per date)
  dayNotes: '&date, *notes',

  // Goals
  goals:    '&id, title, category, start, current, target, unit, deadline, why, completed, *history',

  // Body composition scans (DEXA / InBody / etc.)
  scans:    '&id, date, weight, bf, lean, fat, bmd, visceral, ffmi, arms, legs, trunk, android, notes',

  // Finance snapshots
  finance:  '&id, date, assets, liabilities, netWorth, income, expenses, cash, super, invest, propval, mortgage, hecs, notes',

  // XP / gamification — single row keyed by a fixed id
  xp:       '&id, totalXp, earnedToday, earnedAchievements, lastUpdated',
})

export default db
