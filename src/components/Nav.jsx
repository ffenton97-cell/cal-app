import { NavLink } from 'react-router-dom'
import {
  CheckSquare, CalendarDays, ListTodo, Utensils,
  Dumbbell, Phone, Target, Activity, DollarSign, BookOpen,
} from 'lucide-react'

const tabs = [
  { to: '/',          icon: CheckSquare, label: 'Check In' },
  { to: '/datebook',  icon: CalendarDays, label: 'Datebook' },
  { to: '/todos',     icon: ListTodo,    label: 'Todos' },
  { to: '/food',      icon: Utensils,    label: 'Food' },
  { to: '/workout',   icon: Dumbbell,    label: 'Workout' },
  { to: '/outbound',  icon: Phone,       label: 'Sales' },
  { to: '/goals',     icon: Target,      label: 'Goals' },
  { to: '/body',      icon: Activity,    label: 'Body' },
  { to: '/finance',   icon: DollarSign,  label: 'Finance' },
  { to: '/journal',   icon: BookOpen,    label: 'Journal' },
]

export default function Nav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-[#2a2a2a] pb-safe">
      <div className="flex overflow-x-auto scrollbar-none">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 flex-shrink-0 px-3 py-2 ff-mono
               text-[10px] transition-colors tracking-wide ${
                isActive ? 'text-[#d4a853]' : 'text-[#3a3a3a] hover:text-[#525252]'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span className="whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
