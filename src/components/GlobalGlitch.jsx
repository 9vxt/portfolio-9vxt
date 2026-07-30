import { useEffect, useRef, useCallback } from 'react'

const CHARS = '<>!@#$%^&*/\\|;:=+-_[]{}~?¡¿'
const allTags = 'h1,h2,h3,h4,h5,h6,p,span,a,button,pre,li,td,th,label,strong,em,b,i,code,small,div,section'.split(',')

function gather() {
  const els = []
  for (const tag of allTags) {
    els.push(...document.querySelectorAll(tag))
  }
  return els
}

export default function GlobalGlitch({ enabled }) {
  const timersRef = useRef([])

  // state managed in App.jsx, passed as prop
  // toggle is rendered via GlitchToggle

  useEffect(() => {
    if (!enabled) {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      document.querySelectorAll('.random-glitch, .glitch-scrambled').forEach(el => {
        el.classList.remove('random-glitch', 'glitch-scrambled')
      })
      return
    }

    const schedule = () => {
      if (!enabled) return
      const delay = 300 + Math.random() * 4200
      const t = setTimeout(() => {
        if (!enabled) return
        const els = gather()
        const count = 3 + Math.floor(Math.random() * 8)
        const picked = new Set()
        for (let i = 0; i < count && i < els.length; i++) {
          let el
          let tries = 0
          do {
            el = els[Math.floor(Math.random() * els.length)]
            tries++
          } while ((picked.has(el) || el.closest('.no-glitch')) && tries < 30)
          if (!el || el.closest('.no-glitch')) continue
          picked.add(el)

          const mode = Math.random()
          if (mode < 0.3) {
            el.classList.add('random-glitch')
            setTimeout(() => el.classList.remove('random-glitch'), 80 + Math.random() * 120)
          } else {
            const text = el.textContent || ''
            const words = text.trim().split(/\s+/)
            if (words.length < 2) continue
            const scrambleCount = 1 + Math.floor(Math.random() * Math.min(4, words.length))
            const origWords = [...words]
            for (let s = 0; s < scrambleCount; s++) {
              const wi = Math.floor(Math.random() * words.length)
              const w = words[wi]
              if (w.length < 2) continue
              const chars = w.split('')
              for (let ci = 0; ci < Math.min(4, chars.length); ci++) {
                chars[Math.floor(Math.random() * chars.length)] = CHARS[Math.floor(Math.random() * CHARS.length)]
              }
              words[wi] = chars.join('')
            }
            el.classList.add('glitch-scrambled')
            const orig = el.textContent
            el.textContent = words.join(' ')
            setTimeout(() => {
              el.textContent = orig
              el.classList.remove('glitch-scrambled')
            }, 150 + Math.random() * 300)
          }
        }
        schedule()
      }, delay)
      timersRef.current.push(t)
    }
    schedule()

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [enabled])

  return null
}

export function GlitchToggle({ enabled, onToggle }) {
  return (
    <button onClick={onToggle}
      className="fixed bottom-3 left-[108px] z-[999] flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono transition-all"
      style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(30,41,59,0.8)', backdropFilter: 'blur(4px)', color: enabled ? '#8b5cf6' : '#475569' }}>
      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-[#8b5cf6]' : 'bg-[#475569]'}`} />
      <span>glitch {enabled ? 'on' : 'off'}</span>
    </button>
  )
}
