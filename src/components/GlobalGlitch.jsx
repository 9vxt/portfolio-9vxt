import { useEffect, useRef } from 'react'

const CHARS = '<>!@#$%^&*/\\|;:=+-_[]{}~?¡¿'
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
  for (let i = 0; i < count * 3 && picked.length < count; i++) {
    const el = pool[Math.floor(Math.random() * pool.length)]
    if (!el || seen.has(el) || isExcluded(el) || el.getAttribute('data-glitching') === '1') continue
    // skip elements with no readable text
    const txt = el.textContent || ''
    if (txt.trim().length < 3) continue
    seen.add(el)
    picked.push(el)
  }
  return picked
}

function saveOriginal(el) {
  if (!el.hasAttribute('data-original-text')) {
    el.setAttribute('data-original-text', el.textContent || '')
  }
}

function restore(el) {
  const orig = el.getAttribute('data-original-text')
  if (orig !== null && orig !== undefined) {
    el.textContent = orig
  }
  el.removeAttribute('data-glitching')
  el.classList.remove('glitch-scramble', 'glitch-flicker')
}

function scrambleChar(text) {
  const chars = text.split('')
  const idx = Math.floor(Math.random() * chars.length)
  chars[idx] = CHARS[Math.floor(Math.random() * CHARS.length)]
  return chars.join('')
}

function applyGlitch(el) {
  saveOriginal(el)
  el.setAttribute('data-glitching', '1')
  el.classList.add('glitch-flicker')

  // scramble a single char 3-4 frames at 50ms each
  let frame = 0
  const maxFrames = 3 + Math.floor(Math.random() * 2)
  const interval = 40 + Math.floor(Math.random() * 20)

  el.classList.add('glitch-scramble')

  const id = setInterval(() => {
    frame++
    const txt = el.getAttribute('data-original-text') || ''
    if (frame >= maxFrames) {
      clearInterval(id)
      restore(el)
      return
    }
    // scramble 1-2 random chars
    let result = txt
    const count = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < count; i++) {
      result = scrambleChar(result)
    }
    el.textContent = result
  }, interval)
}

export default function GlobalGlitch({ enabled }) {
  const timerRef = useRef()
  const activeRef = useRef([])

  useEffect(() => {
    // restore any leftover glitched elements
    document.querySelectorAll('[data-glitching="1"]').forEach(restore)

    if (!enabled) {
      document.querySelectorAll('.glitch-flicker, .glitch-scramble').forEach(el => {
        el.classList.remove('glitch-flicker', 'glitch-scramble')
      })
      document.querySelectorAll('[data-original-text]').forEach(el => {
        restore(el)
      })
      return
    }

    const schedule = () => {
      if (!enabled) return
      const delay = 3000 + Math.random() * 2000
      timerRef.current = setTimeout(() => {
        if (!enabled) return
        // restore any stale glitches first
        document.querySelectorAll('[data-glitching="1"]').forEach(restore)

        const count = 1 + Math.floor(Math.random() * 3)
        const els = pickElements(count)
        for (const el of els) {
          applyGlitch(el)
        }
        schedule()
      }, delay)
    }

    schedule()

    return () => {
      clearTimeout(timerRef.current)
      document.querySelectorAll('[data-glitching="1"]').forEach(restore)
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
