import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { label: '_about', href: '#about' },
  { label: '_skills', href: '#skills' },
  { label: '_learning', href: '#learning' },
  { label: '_projects', href: '#projects' },
  { label: '_contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
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
              A
            </span>
            <span className="text-xs text-[#94a3b8] group-hover:text-[#3b82f6] transition-colors">
              athibordee<span className="text-[#475569]">.dev</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a key={l.href} href={l.href}
                className="px-3 py-1.5 text-xs text-[#64748b] hover:text-[#3b82f6] hover:bg-[#1e293b]/50 rounded-md transition-all">
                {l.label}
              </a>
            ))}
          </div>

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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#080c14]/95 border-b border-[#1e293b] overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className="block py-1.5 text-xs text-[#64748b] hover:text-[#3b82f6] transition-colors">
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
