import { useState, useEffect, useRef, useCallback } from 'react'
import { enableSound, playBoot } from './SoundEngine'

const banner = `░▒▓███████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░▒▓████████▓▒░▒▓████████▓▒░▒▓██████▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓██████▓▒░  
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░  ░▒▓█▓▒░   ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░       ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░      ░▒▓██████▓▒░░▒▓████████▓▒░▒▓█▓▒░░▒▓██████▓▒░ `

const bootMessages = [
  'BIOS POST: OK                       ',
  'Boot device: NVMe 0.1               ',
  'Loading kernel 6.8.0-arch           ',
  'Starting systemd (PID 1)            ',
  'Mounting /home/athibordee/portfolio ',
  'Enabling networking — DHCP OK       ',
  'Starting 3D renderer (GLX/WGSL)     ',
  'Initializing audio (ALSA)           ',
  'Loading user environment            ',
  'Starting display manager            ',
  'System ready — awaiting input       ',
]

function rand(min, max) { return min + Math.random() * (max - min) }

function ParticleBg() {
  const ref = useRef()

  useEffect(() => {
    const c = ref.current
    const ctx = c.getContext('2d')
    let w, h, id, particles

    const resize = () => {
      w = c.width = window.innerWidth
      h = c.height = window.innerHeight
    }
    resize()

    particles = Array.from({ length: 55 }, () => ({
      x: rand(0, w), y: rand(0, h),
      vx: rand(-0.15, 0.15), vy: rand(-0.15, 0.15),
      r: rand(0.5, 1.8), a: rand(0.2, 0.6),
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59,130,246,${p.a})`
        ctx.fill()
      }

      id = requestAnimationFrame(draw)
    }
    draw()
    let resizeTimer
    const debouncedResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 100) }
    window.addEventListener('resize', debouncedResize)
    return () => { cancelAnimationFrame(id); clearTimeout(resizeTimer); window.removeEventListener('resize', debouncedResize) }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 pointer-events-none opacity-60" />
}

function Clock() {
  const [t, setT] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id) }, [])
  return <span>{t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
}

function FakeMetrics() {
  const [mem, setMem] = useState(24)
  const [cpu, setCpu] = useState(0)
  const [procs, setProcs] = useState(128)

  useEffect(() => {
    const id = setInterval(() => {
      setMem(24 + Math.floor(Math.random() * 12))
      setCpu(Math.floor(Math.random() * 45) + 8)
      setProcs(128 + Math.floor(Math.random() * 16))
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex gap-4 text-[9px] font-mono text-[#475569]">
      <span>MEM: {mem}%</span>
      <span>CPU: {cpu}%</span>
      <span>PROCS: {procs}</span>
    </div>
  )
}

export default function SplashScreen({ onFinish }) {
  const [lineIdx, setLineIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [fading, setFading] = useState(false)
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    let cancelled = false
    let i = 0
    let bootTimer
    const next = () => {
      if (cancelled) return
      if (i >= bootMessages.length) { setDone(true); return }
      setLineIdx(i)
      setProgress(Math.round(((i + 1) / bootMessages.length) * 100))
      i++
      bootTimer = setTimeout(next, 140 + Math.random() * 220)
    }
    next()
    return () => { cancelled = true; clearTimeout(bootTimer) }
  }, [])

  const handleEnter = useCallback(() => {
    enableSound()
    playBoot()
    setFading(true)
    const t = setTimeout(onFinish, 700)
    return () => clearTimeout(t)
  }, [onFinish])

  useEffect(() => {
    if (!done) return
    const cursorId = setInterval(() => setCursor(p => !p), 530)
    window.addEventListener('keydown', handleEnter, { once: true })
    window.addEventListener('click', handleEnter, { once: true })
    const fb = setTimeout(handleEnter, 8000)
    return () => {
      clearTimeout(fb)
      clearInterval(cursorId)
      window.removeEventListener('keydown', handleEnter)
      window.removeEventListener('click', handleEnter)
    }
  }, [done, handleEnter])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080c14] transition-opacity duration-700 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      <ParticleBg />

      {/* CRT scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)' }}
      />

      <div className="relative z-10 w-full max-w-2xl px-4 sm:px-8">
        {/* title bar */}
        <div className="flex items-center gap-2 mb-5 text-[10px] font-mono text-[#475569] border-b border-[#1e293b] pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
          <span className="ml-2 tracking-[0.15em] text-[#64748b]">PORTFOLIO_BOOT v1.0</span>
          <span className="ml-auto text-[#3b82f6]"><Clock /> UTC</span>
        </div>

        {/* banner */}
        <pre className="text-[#3b82f6] text-[6px] sm:text-[7px] md:text-[8px] leading-tight mb-6 whitespace-pre text-center select-none">{banner}</pre>

        {/* boot log */}
        <div className="space-y-[1px] mb-4">
          {bootMessages.map((msg, i) => (
            <p key={i} className={`font-mono text-[11px] sm:text-xs transition-opacity duration-300 ${
              i < lineIdx ? 'opacity-100' : i === lineIdx ? 'opacity-100' : 'opacity-0'
            }`}>
              <span className="text-[#34d399]">[{String(i + 1).padStart(2, '0')}:00]</span>{' '}
              {i < lineIdx ? (
                <span className="text-[#94a3b8]">{msg}<span className="text-[#34d399] ml-1">✓</span></span>
              ) : i === lineIdx && !done ? (
                <span className="text-[#94a3b8]">{msg}<span className={`text-[#22d3ee] ${cursor ? 'opacity-100' : 'opacity-0'}`}>_</span></span>
              ) : i === lineIdx && done ? (
                <span className="text-[#94a3b8]">{msg}<span className="text-[#34d399] ml-1">✓</span></span>
              ) : null}
            </p>
          ))}
        </div>

        {/* progress */}
        <div className="w-full h-[2px] bg-[#1e293b] rounded-full mb-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#3b82f6] via-[#22d3ee] to-[#34d399] rounded-full transition-all duration-[400ms] ease-out"
            style={{ width: `${progress}%` }} />
        </div>

        {/* metrics */}
        <FakeMetrics />

        {/* enter prompt */}
        {done && (
          <div className="mt-5 flex items-center gap-2 text-xs font-mono text-[#3b82f6]">
            <span className="animate-pulse">▶</span>
            <span>Press any key or click to continue</span>
            <span className={`text-[#22d3ee] ${cursor ? 'opacity-100' : 'opacity-0'}`}>_</span>
          </div>
        )}
      </div>

      <p className="absolute bottom-3 text-[7px] font-mono text-[#1e293b] tracking-[0.2em]">
        Athibordee Thongboonma · portfolio v1.0 · MIT 2026
      </p>
    </div>
  )
}
