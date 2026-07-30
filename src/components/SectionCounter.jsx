import { useEffect, useState, useRef } from 'react'

const sections = ['hero', 'about', 'skills', 'learning', 'projects', 'showcase', 'wasm', 'gpu', 'contact']

export default function SectionCounter() {
  const [current, setCurrent] = useState(1)
  const rafRef = useRef(null)

  useEffect(() => {
    const calc = () => {
      rafRef.current = requestAnimationFrame(() => {
        let idx = 0
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i])
          if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) { idx = i; break }
        }
        setCurrent(idx + 1)
      })
    }
    window.addEventListener('scroll', calc, { passive: true })
    calc()
    return () => { window.removeEventListener('scroll', calc); cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div className="fixed bottom-3 right-3 z-[997] text-[10px] font-mono" style={{ color: 'var(--accent, #475569)', opacity: 0.6 }}>
      {String(current).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
    </div>
  )
}
