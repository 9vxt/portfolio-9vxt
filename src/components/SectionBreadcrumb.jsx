import { useEffect, useState, useRef } from 'react'

const sections = ['hero', 'about', 'skills', 'learning', 'projects', 'showcase', 'wasm', 'webgpu', 'contact']

export default function SectionBreadcrumb() {
  const [active, setActive] = useState('hero')
  const rafRef = useRef(null)

  useEffect(() => {
    const calc = () => {
      rafRef.current = requestAnimationFrame(() => {
        let current = 'hero'
        for (const id of sections) {
          const el = document.getElementById(id)
          if (el) {
            const rect = el.getBoundingClientRect()
            if (rect.top <= window.innerHeight / 2) current = id
          }
        }
        setActive(current)
      })
    }
    window.addEventListener('scroll', calc, { passive: true })
    calc()
    return () => { window.removeEventListener('scroll', calc); cancelAnimationFrame(rafRef.current) }
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-[998] flex flex-col gap-1.5">
      {sections.map(id => (
        <button key={id} onClick={() => scrollTo(id)}
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${active === id ? 'scale-150' : 'opacity-30 hover:opacity-60'}`}
          style={{ background: active === id ? 'var(--accent, #3b82f6)' : '#475569' }}
          title={id.charAt(0).toUpperCase() + id.slice(1)}
        />
      ))}
    </div>
  )
}
