import { useState, useEffect } from 'react'

export default function TypeWriter({ text, className = '', delay = 0, speed = 40 }) {
  const [display, setDisplay] = useState('')
  const [started, setStarted] = useState(delay === 0)

  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setStarted(true), delay)
      return () => clearTimeout(t)
    }
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const id = setInterval(() => {
      if (i < text.length) {
        setDisplay(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(id)
      }
    }, speed)
    return () => clearInterval(id)
  }, [started, text, speed])

  return <span className={className}>{display}<span className="text-[#3b82f6] blink">|</span></span>
}
