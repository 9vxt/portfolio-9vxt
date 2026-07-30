import { useEffect, useState } from 'react'

const sections = ['hero', 'about', 'skills', 'learning', 'projects', 'showcase', 'wasm', 'gpu', 'contact']

export default function SectionBreadcrumb() {
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        let best = { id: null, ratio: 0 }
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > best.ratio) best = { id: e.target.id, ratio: e.intersectionRatio }
        }
        if (best.id) setActive(best.id)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    for (const id of sections) {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    }
    return () => obs.disconnect()
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
