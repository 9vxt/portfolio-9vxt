import { useEffect, useRef } from 'react'

export default function GlobalGlitch() {
  const intervalRef = useRef()

  useEffect(() => {
    const glitch = () => {
      const all = document.querySelectorAll('h1, h2, h3, p, span, a, button, pre')
      const count = Math.floor(Math.random() * 3) + 1
      const picked = []
      for (let i = 0; i < count; i++) {
        const el = all[Math.floor(Math.random() * all.length)]
        if (el && !picked.includes(el)) picked.push(el)
      }
      picked.forEach((el) => {
        el.classList.add('random-glitch')
        setTimeout(() => el.classList.remove('random-glitch'), 120 + Math.random() * 100)
      })
    }
    intervalRef.current = setInterval(glitch, 2500 + Math.random() * 2000)
    return () => clearInterval(intervalRef.current)
  }, [])

  return null
}
