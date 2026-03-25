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
      <div className="flex flex-col items-center gap-3 text-center px-8 py-10
        bg-[#161616] border border-[#d4a853] shadow-2xl max-w-xs mx-4"
        style={{ boxShadow: '0 0 40px #d4a85320' }}>
        <div className="text-5xl">{achievement.icon}</div>
        <p className="ff-mono text-[10px] uppercase tracking-[0.25em] text-[#d4a853]">
          Achievement Unlocked
        </p>
        <h2 className="ff-heading text-xl font-bold text-[#e5e5e5]">{achievement.label}</h2>
        <p className="ff-mono text-[12px] text-[#525252]">{achievement.desc}</p>
        <p className="ff-mono text-[13px] text-[#d4a853]">+{achievement.xp} XP</p>
      </div>
    </div>
  )
}
