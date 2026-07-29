import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Terminal from './Terminal'

function MatrixRain() {
  const canvasRef = useRef()
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let id
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01'
    const fontSize = 10
    const cols = Math.floor(canvas.width / fontSize)
    const drops = Array.from({ length: cols }, () => Math.random() * canvas.height)
    const draw = () => {
      ctx.fillStyle = 'rgba(8, 12, 20, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px monospace`
      for (let i = 0; i < drops.length; i++) {
        if (i % 3 !== 0) continue
        if (drops[i] - 10 > canvas.height / fontSize && Math.random() > 0.98) { drops[i] = 0; continue }
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillStyle = Math.random() > 0.97 ? '#f1f5f9' : '#3b82f6'
        ctx.globalAlpha = 0.2
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)
        ctx.globalAlpha = 1
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
      id = requestAnimationFrame(draw)
    }
    draw()
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 opacity-10 pointer-events-none" />
}

function GlitchText({ children }) {
  const [glitching, setGlitching] = useState(false)
  useEffect(() => {
    const id = setInterval(() => {
      setGlitching(true)
      setTimeout(() => setGlitching(false), 200)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className={`relative inline-block transition-none ${glitching ? 'glitch-active' : ''}`}>
      {children}
      {glitching && (
        <span className="absolute inset-0 pointer-events-none" aria-hidden>
          <span className="absolute inset-0 text-[#ff0040] opacity-60" style={{ clipPath: 'inset(20% 0 60% 0)', transform: 'translate(-2px, 0)' }}>{children}</span>
          <span className="absolute inset-0 text-[#00f0ff] opacity-60" style={{ clipPath: 'inset(60% 0 10% 0)', transform: 'translate(2px, 0)' }}>{children}</span>
        </span>
      )}
    </span>
  )
}

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen w-full overflow-hidden pt-14">
      <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/5 via-transparent to-[#080c14]/90 pointer-events-none z-[1]" />
      <MatrixRain />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-3xl mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#1e293b] rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-[#34d399] pulse-slow" />
            <span className="text-[11px] text-[#94a3b8] font-mono">open for opportunities</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#f1f5f9] mb-2 tracking-tight">
            <GlitchText>
              Athibordee
              <br />
              <span className="text-[#3b82f6]">Thongboonma</span>
            </GlitchText>
          </h1>

          <p className="text-xs sm:text-sm text-[#94a3b8] font-mono max-w-xl mx-auto leading-relaxed">
            <span className="text-[#475569]">#include</span>{' '}
            <span className="text-[#22d3ee]">&lt;engineer&gt;</span>{' '}
            <span className="text-[#64748b]">|</span>{' '}
            <span className="text-[#34d399]">C++</span>
            <span className="text-[#475569]"> · </span>
            <span className="text-[#34d399]">C</span>
            <span className="text-[#475569]"> · </span>
            <span className="text-[#34d399]">Python</span>
            <span className="text-[#475569]"> · </span>
            <span className="text-[#3b82f6]">Rust</span>
            <span className="text-[#475569]"> · </span>
            <span className="text-[#22d3ee]">C#</span>
            <span className="text-[#475569]"> · </span>
            <span className="text-[#f59e0b]">TypeScript</span>
          </p>

          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            <a href="#projects" className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#3b82f6] text-[#080c14] text-xs font-mono font-semibold hover:bg-[#2563eb] transition-all eng-glow-blue">
              <span>View Projects</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
            <a href="#contact" className="inline-flex items-center gap-2 px-4 py-2 rounded border border-[#1e293b] text-[#94a3b8] text-xs font-mono hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all">
              _contact
            </a>
            <a href="https://github.com/9vxt" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded border border-[#1e293b] text-[#94a3b8] text-xs font-mono hover:border-[#22d3ee] hover:text-[#22d3ee] transition-all">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-xl"
        >
          <Terminal />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-1 text-[#475569]">
            <span className="text-[10px] font-mono">scroll</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
