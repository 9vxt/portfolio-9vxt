import { useEffect } from 'react'

export default function CardHoverShine() {
  useEffect(() => {
    const handler = (e) => {
      const card = e.currentTarget
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      card.style.setProperty('--shine-x', `${x}%`)
      card.style.setProperty('--shine-y', `${y}%`)
    }
    const cards = document.querySelectorAll('.eng-card')
    cards.forEach(c => c.addEventListener('mousemove', handler))
    return () => cards.forEach(c => c.removeEventListener('mousemove', handler))
  }, [])

  return (
    <style>{`
      .eng-card::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at var(--shine-x, 50%) var(--shine-y, 50%), rgba(255,255,255,0.04) 0%, transparent 60%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .eng-card:hover::after { opacity: 1; }
    `}</style>
  )
}
