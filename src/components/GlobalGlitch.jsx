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

export default function GlobalGlitch() {
  const intervalRef = useRef()

  useEffect(() => {
    const glitch = () => {
      const els = getAllTextEls()
      const count = Math.min(2 + Math.floor(Math.random() * 5), els.length)
      const picked = new Set()
      for (let i = 0; i < count; i++) {
        let el
        let tries = 0
        do {
          el = els[Math.floor(Math.random() * els.length)]
          tries++
        } while ((picked.has(el) || el.classList.contains('random-glitch')) && tries < 20)
        if (!el || el.classList.contains('random-glitch')) continue
        picked.add(el)

        const mode = Math.random()
        if (mode < 0.35) {
          el.classList.add('random-glitch')
          setTimeout(() => el.classList.remove('random-glitch'), 100 + Math.random() * 150)
        } else {
          const origText = el.textContent || ''
          const words = origText.trim().split(/\s+/)
          if (words.length < 2) continue
          const scrambleCount = Math.floor(Math.random() * 3) + 1
          const origWords = [...words]
          for (let s = 0; s < scrambleCount; s++) {
            const wi = Math.floor(Math.random() * words.length)
            const w = words[wi]
            if (w.length < 2) continue
            const chars = w.split('')
            for (let ci = 0; ci < Math.min(3, chars.length); ci++) {
              const ri = Math.floor(Math.random() * chars.length)
              chars[ri] = CHARS[Math.floor(Math.random() * CHARS.length)]
            }
            words[wi] = chars.join('')
          }
          el.textContent = words.join(' ')
          setTimeout(() => { el.textContent = origText }, 200 + Math.random() * 250)
        }
      }
    }
    intervalRef.current = setInterval(glitch, 1800 + Math.random() * 1500)
    return () => clearInterval(intervalRef.current)
  }, [])

  return null
}
