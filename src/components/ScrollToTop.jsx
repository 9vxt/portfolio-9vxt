import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const pct = max > 0 ? window.scrollY / max : 0
      setProgress(Math.min(pct, 1))
      setVisible(window.scrollY > 400)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const r = 12
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - progress)

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-14 right-3 z-[999] flex items-center justify-center w-9 h-9"
          title={`${Math.round(progress * 100)}%`}
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 30 30">
            <circle cx="15" cy="15" r={r} fill="none" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="15" cy="15" r={r} fill="none" stroke="var(--accent, #3b82f6)" strokeWidth="2.5"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
          </svg>
          <svg className="w-3.5 h-3.5 relative" style={{ color: 'var(--accent, #22d3ee)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
