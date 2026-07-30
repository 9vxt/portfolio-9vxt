import { useEffect, useRef } from 'react'

const TRAIL_LENGTH = 12

export default function CursorTrail() {
  const dotsRef = useRef([])

  useEffect(() => {
    const dots = Array.from({ length: TRAIL_LENGTH }, () => {
      const el = document.createElement('div')
      el.style.cssText = 'position:fixed;width:4px;height:4px;border-radius:50%;pointer-events:none;z-index:9999;transition:opacity 0.3s'
      document.body.appendChild(el)
      return el
    })
    dotsRef.current = dots

    let idx = 0
    const handler = (e) => {
      const dot = dots[idx % TRAIL_LENGTH]
      if (dot) {
        dot.style.left = `${e.clientX}px`
        dot.style.top = `${e.clientY}px`
        dot.style.background = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3b82f6'
        dot.style.opacity = '0.6'
        dot.style.boxShadow = '0 0 6px var(--accent, #3b82f6)'
        setTimeout(() => { dot.style.opacity = '0' }, 200)
      }
      idx++
    }
    window.addEventListener('mousemove', handler)
    return () => {
      window.removeEventListener('mousemove', handler)
      dots.forEach(d => d.remove())
    }
  }, [])

  return null
}
