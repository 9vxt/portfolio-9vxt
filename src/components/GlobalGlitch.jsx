import { useEffect, useRef } from 'react'

const CHARS = '<>!@#$%^&*/\\|;:=+-_[]{}~?¡¿'
const allTags = 'h1,h2,h3,h4,h5,h6,p,span,a,button,pre,li,td,th,label,strong,em,b,i,code,small'.split(',')

function getAllTextEls() {
  const els = []
  for (const tag of allTags) {
    els.push(...document.querySelectorAll(tag))
  }
  return els
}

export default function GlobalGlitch({ enabled }) {
  const intervalRef = useRef()

  useEffect(() => {
    if (!enabled) {
      document.querySelectorAll('.random-glitch, .glitch-scrambled').forEach(el => {
        el.classList.remove('random-glitch', 'glitch-scrambled')
      })
      clearInterval(intervalRef.current)
      intervalRef.current = null
      return
    }

    const glitch = () => {
      const els = getAllTextEls()
      const count = Math.min(2 + Math.floor(Math.random() * 4), els.length)
      const picked = new Set()
      for (let i = 0; i < count; i++) {
        let el
        let tries = 0
        do {
          el = els[Math.floor(Math.random() * els.length)]
          tries++
        } while ((picked.has(el) || el.classList.contains('random-glitch') || el.closest('.no-glitch')) && tries < 20)
        if (!el || el.classList.contains('random-glitch') || el.closest('.no-glitch')) continue
        picked.add(el)

        if (Math.random() < 0.35) {
          el.classList.add('random-glitch')
          setTimeout(() => el.classList.remove('random-glitch'), 100 + Math.random() * 150)
        } else {
          const origText = el.textContent || ''
          const words = origText.trim().split(/\s+/)
          if (words.length < 2) continue
          const wi = Math.floor(Math.random() * words.length)
          const w = words[wi]
          if (w.length < 2) continue
          const chars = w.split('')
          for (let ci = 0; ci < Math.min(2, chars.length); ci++) {
            chars[Math.floor(Math.random() * chars.length)] = CHARS[Math.floor(Math.random() * CHARS.length)]
          }
          el.classList.add('glitch-scrambled')
          const orig = el.textContent
          el.textContent = words.join(' ')
          setTimeout(() => { el.textContent = orig; el.classList.remove('glitch-scrambled') }, 200 + Math.random() * 250)
        }
      }
    }
    intervalRef.current = setInterval(glitch, 1800 + Math.random() * 1500)
    return () => clearInterval(intervalRef.current)
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
