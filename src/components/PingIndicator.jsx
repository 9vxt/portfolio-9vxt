import { useEffect, useState } from 'react'

const states = [
  { label: 'ONLINE', color: '#34d399' },
  { label: 'ACTIVE', color: '#3b82f6' },
  { label: 'READY', color: '#22d3ee' },
]

export default function PingIndicator() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % states.length), 4000)
    return () => clearInterval(id)
  }, [])

  const s = states[idx]

  return (
    <span className="inline-flex items-center gap-1.5" title={`System ${s.label.toLowerCase()}`}>
      <span className="relative flex w-2 h-2">
        <span className="animate-ping absolute inline-flex w-full h-full rounded-full opacity-75" style={{ background: s.color }} />
        <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: s.color }} />
      </span>
      <span className="text-[9px] font-mono tracking-wider transition-colors duration-700" style={{ color: s.color }}>{s.label}</span>
    </span>
  )
}
