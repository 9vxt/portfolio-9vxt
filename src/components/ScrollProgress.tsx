import { useRef, useEffect } from 'react'

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const el = barRef.current
    if (!el) return

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const pct = max > 0 ? window.scrollY / max : 0
        el.style.transform = `scaleX(${Math.min(pct, 1)})`
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[999] pointer-events-none" style={{ transformOrigin: '0% 50%' }}>
      <div ref={barRef} className="h-full w-full bg-gradient-to-r from-[#3b82f6] via-[#22d3ee] to-[#8b5cf6]"
        style={{ transform: 'scaleX(0)', transformOrigin: '0% 50%' }} />
    </div>
  )
}
