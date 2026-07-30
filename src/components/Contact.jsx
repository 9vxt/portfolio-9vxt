import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

const socials = [
  { label: 'GitHub', user: '@9vxt', href: 'https://github.com/9vxt', icon: 'gh' },
  { label: 'Instagram', user: '@9vxt_fr', href: 'https://www.instagram.com/9vxt_fr/', icon: 'ig' },
  { label: 'LinkedIn', user: 'Athibordee Thongboonma', href: 'https://www.linkedin.com/in/athibordee-thongboonma', icon: 'in' },
  { label: 'Spotify', user: '9vxt', href: 'https://open.spotify.com/user/31k3tzzxmyzsxg6tuwbmpeg43znq', icon: 'sp' },
  { label: 'LINE', user: 'qwertyuiop0246', href: 'https://line.me/ti/p/~qwertyuiop0246', icon: 'line' },
]

function SocialIcon({ icon }) {
  switch (icon) {
    case 'gh': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
    case 'ig': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
    case 'in': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
    case 'sp': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
    case 'line': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.52 13.46h-1.16v-4.86l-1.76 4.86h-1.12l-1.76-4.86v4.86H4.04v-7h1.56l1.76 4.98 1.72-4.98h1.56v7h-.16zm5.52-1.48c0 .6-.24.92-.72.92s-.72-.32-.72-.92v-3.1c0-.6.24-.92.72-.92s.72.32.72.92v3.1zm1.48-2.46c.48 0 .72.28.72.96s-.24.96-.72.96h-.72v-1.92h.72zm0-1.08h-2.2v7h1.48v-2.24h.72c1.08 0 1.8-.72 1.8-1.76s-.72-1.76-1.8-1.76v.76z" /></svg>
    default: return null
  }
}

export default function Contact() {
  const [ref, visible] = useOnScreen(0.1)

  return (
    <section id="contact" className="py-24 bg-[#080c14] border-t border-[#1e293b]">
      <div ref={ref} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-xs text-[#64748b] font-mono mb-2 tracking-widest"><span className="text-[#34d399]">//</span> reach_out</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-3 font-mono">contact<span className="text-[#34d399]">_</span>me</h2>
          <p className="text-xs font-mono text-[#64748b]">
            No backend — email me directly at{' '}
            <a href="mailto:9vxt.fr@gmail.com" className="text-[#3b82f6] hover:underline">9vxt.fr@gmail.com</a>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="eng-card p-6 max-w-lg mx-auto"
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e293b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
            <span className="text-xs text-[#475569] font-mono ml-2">social_links</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-[#0a0e17] border border-[#1e293b] hover:border-[#3b82f6]/50 transition-all group rounded">
                <span className="text-[#3b82f6] group-hover:scale-110 transition-transform"><SocialIcon icon={s.icon} /></span>
                <div>
                  <p className="text-xs font-mono text-[#f1f5f9] group-hover:text-[#3b82f6] transition-colors">{s.label}</p>
                  <p className="text-[10px] font-mono text-[#475569]">{s.user}</p>
                </div>
                <span className="ml-auto text-[10px] text-[#475569] group-hover:text-[#3b82f6] transition-colors">↗</span>
              </a>
            ))}
            <a href="mailto:9vxt.fr@gmail.com"
              className="sm:col-span-2 flex items-center justify-center gap-3 px-4 py-3 bg-[#3b82f6]/10 border border-[#3b82f6]/30 hover:bg-[#3b82f6]/20 transition-all group rounded">
              <span className="text-[#3b82f6] group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </span>
              <span className="text-xs font-mono text-[#f1f5f9] group-hover:text-[#3b82f6] transition-colors">9vxt.fr@gmail.com</span>
              <span className="text-[10px] text-[#475569] group-hover:text-[#3b82f6] transition-colors">↗</span>
            </a>
          </div>
          <p className="text-[10px] font-mono text-[#475569] text-center mt-4 pt-3 border-t border-[#1e293b]">
            Response time: <span className="text-[#34d399]">&lt; 48h</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
