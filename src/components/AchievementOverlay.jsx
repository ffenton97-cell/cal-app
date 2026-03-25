import { useEffect, useState } from 'react'

export default function AchievementOverlay({ achievement, onDone }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!achievement) return
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2800)
    return () => clearTimeout(t)
  }, [achievement])

  if (!achievement) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70
        transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={() => { setVisible(false); setTimeout(onDone, 300) }}
    >
      <div className="flex flex-col items-center gap-3 text-center px-8 py-10 bg-[#1a1a1a] border border-violet-600 rounded-2xl shadow-2xl max-w-xs mx-4">
        <div className="text-6xl">{achievement.icon}</div>
        <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold">Achievement Unlocked</p>
        <h2 className="text-xl font-bold text-white">{achievement.label}</h2>
        <p className="text-sm text-zinc-400">+{achievement.xp} XP awarded</p>
      </div>
    </div>
  )
}
