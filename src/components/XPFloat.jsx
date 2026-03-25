import { useEffect, useState } from 'react'

/**
 * Floating "+XP" animation that fades up and disappears.
 * Props: amount (number), onDone (callback)
 */
export default function XPFloat({ amount, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`fixed top-16 right-4 z-[90] pointer-events-none
        text-violet-400 font-bold text-lg transition-all duration-400
        ${visible ? 'opacity-100 -translate-y-0' : 'opacity-0 -translate-y-6'}`}
    >
      +{amount} XP
    </div>
  )
}
