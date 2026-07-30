import { useEffect } from 'react'

const COLORS = ['#3b82f6', '#22d3ee', '#8b5cf6', '#34d399', '#f59e0b']

export default function ClickParticles() {
  useEffect(() => {
    const container = document.createElement('div')
    container.className = 'fixed inset-0 pointer-events-none z-[9997]'
    document.body.appendChild(container)
    const removalIds = []

    const spawn = (x, y) => {
      const count = 8 + Math.floor(Math.random() * 6)
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div')
        const size = 2 + Math.random() * 3
        const angle = Math.random() * Math.PI * 2
        const dist = 30 + Math.random() * 60
        const color = COLORS[Math.floor(Math.random() * COLORS.length)]
        p.style.cssText = `
          position:fixed; left:${x}px; top:${y}px; width:${size}px; height:${size}px;
          background:${color}; border-radius:50%; pointer-events:none; z-index:9997;
          box-shadow: 0 0 4px ${color};
          transition: all ${0.4 + Math.random() * 0.4}s cubic-bezier(.2,.8,.3,1);
          opacity:1;
        `
        container.appendChild(p)
        requestAnimationFrame(() => {
          p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`
          p.style.opacity = '0'
        })
        removalIds.push(setTimeout(() => p.remove(), 900))
      }
    }

    const handler = (e) => spawn(e.clientX, e.clientY)
    window.addEventListener('click', handler)
    return () => {
      window.removeEventListener('click', handler)
      removalIds.forEach(clearTimeout)
      container.remove()
    }
  }, [])

  return null
}
