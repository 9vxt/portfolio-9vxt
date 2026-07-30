import { useEffect } from 'react'
const CHARS = '<>!@#$%^&*/\\|;:=+-_[]{}~?'

export default function HeadingGlitch() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target
        const orig = el.textContent
        let count = 0
        const id = setInterval(() => {
          count++
          const chars = orig.split('')
          for (let i = 0; i < Math.min(3, chars.length); i++) {
            chars[Math.floor(Math.random() * chars.length)] = CHARS[Math.floor(Math.random() * CHARS.length)]
          }
          el.textContent = chars.join('')
          if (count >= 5) { clearInterval(id); el.textContent = orig }
        }, 60)
        observer.unobserve(el)
        setTimeout(() => observer.unobserve(el), 1000)
      }
    }, { threshold: 0.5 })
    document.querySelectorAll('h2[id], h3[id]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}
