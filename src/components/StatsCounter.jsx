import { useEffect, useRef, useState } from 'react'

const stats = [
  { label: 'projects built', value: 14 },
  { label: 'technologies', value: 24 },
  { label: 'commits this year', value: 847 },
  { label: 'coffees consumed', value: 1024 },
]

function CountUp({ end, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const step = (now) => {
          const pct = Math.min((now - start) / duration, 1)
          setCount(Math.floor(pct * end))
          if (pct < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function StatsCounter() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="eng-card p-4 text-center">
            <p className="text-2xl font-bold font-mono" style={{ color: 'var(--accent, #3b82f6)' }}>
              <CountUp end={s.value} />
              <span className="text-xs ml-0.5 opacity-60">+</span>
            </p>
            <p className="text-[10px] font-mono text-[#64748b] mt-1 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
