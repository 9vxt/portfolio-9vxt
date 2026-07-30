import { useEffect, useState } from 'react'

const sections = ['hero', 'about', 'skills', 'learning', 'projects', 'showcase', 'wasm', 'gpu', 'contact']

export default function SectionCounter() {
  const [current, setCurrent] = useState(1)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        let idx = 0
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = sections.indexOf(e.target.id)
            if (i >= 0 && i + 1 > idx) idx = i + 1
          }
        }
        setCurrent(idx || 1)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    for (const id of sections) {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    }
    return () => obs.disconnect()
  }, [])

  return (
    <div className="fixed bottom-3 right-3 z-[997] text-[10px] font-mono" style={{ color: 'var(--accent, #475569)', opacity: 0.6 }}>
      {String(current).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
    </div>
  )
}
