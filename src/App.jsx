import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/Header'
import Nav from './components/Nav'
import AchievementOverlay from './components/AchievementOverlay'
import XPFloat from './components/XPFloat'

import CheckIn   from './pages/CheckIn'
import Datebook  from './pages/Datebook'
import Todos     from './pages/Todos'
import Food      from './pages/Food'
import Workout   from './pages/Workout'
import Outbound  from './pages/Outbound'
import Goals     from './pages/Goals'
import BodyComp  from './pages/BodyComp'
import Finance   from './pages/Finance'
import Journal   from './pages/Journal'
import History   from './pages/History'
import Stats     from './pages/Stats'

export default function App() {
  const [xpFloat, setXpFloat]       = useState(null)   // { amount }
  const [achievement, setAchievement] = useState(null) // achievement object

  function handleXP({ amount, achievement: ach }) {
    if (amount)  setXpFloat({ amount })
    if (ach)     setAchievement(ach)
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col h-full bg-[#0f0f0f] text-[#e5e5e5]">
        <Header />

        {/* Scrollable main content — leaves room for fixed bottom nav */}
        <main className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route path="/"          element={<CheckIn  onXP={handleXP} />} />
            <Route path="/datebook"  element={<Datebook onXP={handleXP} />} />
            <Route path="/todos"     element={<Todos    onXP={handleXP} />} />
            <Route path="/food"      element={<Food     onXP={handleXP} />} />
            <Route path="/workout"   element={<Workout  onXP={handleXP} />} />
            <Route path="/outbound"  element={<Outbound onXP={handleXP} />} />
            <Route path="/goals"     element={<Goals    onXP={handleXP} />} />
            <Route path="/body"      element={<BodyComp onXP={handleXP} />} />
            <Route path="/finance"   element={<Finance  onXP={handleXP} />} />
            <Route path="/journal"   element={<Journal  onXP={handleXP} />} />
            <Route path="/history"   element={<History />} />
            <Route path="/stats"     element={<Stats />} />
          </Routes>
        </main>

        <Nav />

        {/* Overlays */}
        {xpFloat && (
          <XPFloat amount={xpFloat.amount} onDone={() => setXpFloat(null)} />
        )}
        {achievement && (
          <AchievementOverlay achievement={achievement} onDone={() => setAchievement(null)} />
        )}
      </div>
    </BrowserRouter>
  )
}
