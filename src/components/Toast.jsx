import { useEffect, useState } from 'react'

const messages = [
  '> CONNECTION ESTABLISHED',
  '> MODULES LOADED: 42',
  '> WELCOME TO MY PORTFOLIO',
  '> SYSTEM: NOMINAL',
]

export default function Toast() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timers = []
    messages.forEach((_, i) => {
      timers.push(setTimeout(() => { setIdx(i); setVisible(true) }, i * 1800))
      timers.push(setTimeout(() => {
        if (i === messages.length - 1) setDone(true)
        else setVisible(false)
      }, i * 1800 + 1200))
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  if (done) return null

  return (
    <div
      className={`fixed bottom-16 left-3 z-[999] px-3 py-1.5 rounded text-[10px] font-mono transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      style={{ background: 'rgba(8,12,20,0.9)', border: '1px solid rgba(34,211,238,0.2)', backdropFilter: 'blur(4px)' }}
    >
      <span className="text-[#22d3ee]">{messages[idx]}</span>
    </div>
  )
}
