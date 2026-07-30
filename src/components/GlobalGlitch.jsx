import { useEffect, useRef } from 'react'

const SAFE_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button']

function isExcluded(el) {
  return el.closest('.no-glitch') || el.closest('[data-no-glitch]')
}

function pickElements(count) {
  const pool = []
  for (const tag of SAFE_TAGS) {
    pool.push(...document.querySelectorAll(tag))
  }
  const picked = []
  const seen = new Set()
  for (let i = 0; i < count * 5 && picked.length < count; i++) {
    const el = pool[Math.floor(Math.random() * pool.length)]
    if (!el || seen.has(el) || isExcluded(el) || el.classList.contains('gg-active')) continue
    const txt = (el.textContent || '').trim()
    if (txt.length < 3) continue
    seen.add(el)
    picked.push(el)
  }
  return picked
}

export default function GlobalGlitch({ enabled }) {
  const timerRef = useRef()
  const removalTimeouts = useRef([])
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    if (!enabled) {
      document.querySelectorAll('.gg-active').forEach(el => el.classList.remove('gg-active'))
      return
    }

    const schedule = () => {
      const delay = 3000 + Math.random() * 2000
      timerRef.current = setTimeout(() => {
        if (!enabledRef.current) return
        document.querySelectorAll('.gg-active').forEach(el => el.classList.remove('gg-active'))

        const count = 1 + Math.floor(Math.random() * 3)
        const els = pickElements(count)
        for (const el of els) {
          el.classList.add('gg-active')
          const duration = 150 + Math.random() * 100
          const t = setTimeout(() => {
            if (!enabledRef.current) return
            el.classList.remove('gg-active')
          }, duration)
          removalTimeouts.current.push(t)
        }
        schedule()
      }, delay)
    }
    schedule()

    return () => {
      clearTimeout(timerRef.current)
      removalTimeouts.current.forEach(clearTimeout)
      removalTimeouts.current = []
      document.querySelectorAll('.gg-active').forEach(el => el.classList.remove('gg-active'))
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
