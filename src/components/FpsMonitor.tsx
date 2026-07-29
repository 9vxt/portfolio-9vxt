import { useRef, useEffect, useState } from 'react'

export default function FpsMonitor() {
  const [fps, setFps] = useState(60)
  const frameRef = useRef(0)
  const lastRef = useRef(performance.now())

  useEffect(() => {
    let raf: number
    const tick = () => {
      frameRef.current++
      const now = performance.now()
      if (now - lastRef.current >= 1000) {
        setFps(frameRef.current)
        frameRef.current = 0
        lastRef.current = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const color = fps >= 55 ? '#34d399' : fps >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="fixed bottom-3 right-3 z-[999] flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono"
      style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(30,41,59,0.8)', backdropFilter: 'blur(4px)' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span style={{ color }}>{fps}</span>
      <span className="text-[#475569]">fps</span>
    </div>
  )
}
