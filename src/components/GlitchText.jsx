import { useState, useEffect, useRef } from 'react'

const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/`~ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export default function GlitchText({ text, className = '', as: Tag = 'span', interval = 80, glitchProb = 0.03 }) {
  const [display, setDisplay] = useState(text)
  const frameRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      frameRef.current++
      if (Math.random() < glitchProb) {
        const idx = Math.floor(Math.random() * text.length)
        const original = text[idx]
        if (original === ' ') return
        const glitched = text.slice(0, idx) + chars[Math.floor(Math.random() * chars.length)] + text.slice(idx + 1)
        setDisplay(glitched)
        setTimeout(() => setDisplay(text), 60)
      }
    }, interval)
    return () => clearInterval(id)
  }, [text, interval, glitchProb])

  return <Tag className={className}>{display}</Tag>
}
