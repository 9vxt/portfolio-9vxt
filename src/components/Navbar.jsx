import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PingIndicator from './PingIndicator'

const links = [
  { label: '_about', href: '#about', section: 'about' },
  { label: '_skills', href: '#skills', section: 'skills' },
  { label: '_learning', href: '#learning', section: 'learning' },
  { label: '_projects', href: '#projects', section: 'projects' },
  { label: '_wasm', href: '#wasm', section: 'wasm' },
  { label: '_gpu', href: '#gpu', section: 'gpu' },
  { label: '_contact', href: '#contact', section: 'contact' },
]

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="text-[10px] font-mono text-[#475569] tabular-nums">
      {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
    </span>
  )
}

const statusMessages = ['ALL SYSTEMS NOMINAL', 'KERNEL: RUNNING', 'WASM: LOADED', 'GPU: ONLINE', 'NEURAL: IDLE', 'UPTIME: ∞']
function StatusTicker() {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)
  useEffect(() => {
    const id = setInterval(() => {
      setFade(false)
      setTimeout(() => { setIdx(p => (p + 1) % statusMessages.length); setFade(true) }, 300)
    }, 2500)
    return () => clearInterval(id)
  }, [])
  return (
    <span className={`text-[9px] font-mono text-[#34d399] tracking-wider transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
      ◆ {statusMessages[idx]}
    </span>
  )
}

const sectionIds = links.map(l => l.section)

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      const mid = window.scrollY + window.innerHeight / 2
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop; const bot = top + el.offsetHeight
          if (mid >= top && mid < bot) { setActive(id); return }
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 font-mono transition-all duration-300 ${
        scrolled ? 'bg-[#080c14]/90 backdrop-blur-md border-b border-[#1e293b]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <a href="#hero" className="group flex items-center gap-2">
            <span className="w-6 h-6 rounded border border-[#3b82f6] flex items-center justify-center text-[10px] text-[#3b82f6] font-bold group-hover:bg-[#3b82f6] group-hover:text-[#080c14] transition-all">
              G
            </span>
            <span className="text-xs text-[#94a3b8] group-hover:text-[#3b82f6] transition-colors hidden sm:inline">
              9vxt<span className="text-[#475569]">.dev</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const isActive = active === l.section
              return (
                <a key={l.href} href={l.href}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                    isActive ? 'text-[#3b82f6] bg-[#1e293b]/70' : 'text-[#64748b] hover:text-[#3b82f6] hover:bg-[#1e293b]/50'
                  }`}>
                  {l.label}
                </a>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2"><PingIndicator /></div>
            <div className="hidden lg:block"><StatusTicker /></div>
            <div className="hidden sm:block"><Clock /></div>
            <a href="https://github.com/9vxt" target="_blank" rel="noopener noreferrer"
              className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <button className="md:hidden text-[#3b82f6] p-1" onClick={() => setOpen(!open)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#080c14]/95 border-b border-[#1e293b] overflow-hidden">
            <div className="px-4 pb-3 space-y-1">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className={`block py-1.5 text-xs transition-colors ${active === l.section ? 'text-[#3b82f6]' : 'text-[#64748b] hover:text-[#3b82f6]'}`}>
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
