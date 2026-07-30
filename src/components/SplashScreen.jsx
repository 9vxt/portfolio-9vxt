import { useState, useEffect, useRef } from 'react'
import { enableSound, playBoot } from './SoundEngine'

const banner = `░▒▓███████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░▒▓████████▓▒░▒▓████████▓▒░▒▓██████▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓██████▓▒░  
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░  ░▒▓█▓▒░   ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░       ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░      ░▒▓██████▓▒░░▒▓████████▓▒░▒▓█▓▒░░▒▓██████▓▒░ `

const bootLines = [
  { text: 'Booting BIOS...                    ', metric: [0, 10] },
  { text: 'Loading bootloader (GRUB)...       ', metric: [0, 15] },
  { text: 'Initializing kernel 6.8.0-arch...  ', metric: [0, 25] },
  { text: 'Starting systemd (PID 1)...         ', metric: [0, 35] },
  { text: 'Mounting /home/athibordee/portfolio', metric: [0, 45] },
  { text: 'Enabling networking stack...        ', metric: [0, 55] },
  { text: 'Starting 3D renderer (GLX)...       ', metric: [0, 65] },
  { text: 'Initializing audio system (ALSA)... ', metric: [0, 75] },
  { text: 'Loading user environment...         ', metric: [0, 85] },
  { text: 'Starting display manager...         ', metric: [0, 95] },
  { text: 'All systems operational             ', metric: [0, 100] },
]

function randByte() { return Math.floor(Math.random() * 256) }

/** subtle CRT-like scan line overlay drawn on canvas */
function BootBg() {
  const ref = useRef()
  useEffect(() => {
    const c = ref.current; const ctx = c.getContext('2d')
    let w, h, id
    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)

    const dots = Array.from({ length: 80 }, () => ({
      x: Math.random() * (w || 1920), y: Math.random() * (h || 1080),
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: 0.5 + Math.random() * 1
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7)
      grad.addColorStop(0, 'rgba(59,130,246,0.03)')
      grad.addColorStop(0.5, 'rgba(34,211,238,0.01)')
      grad.addColorStop(1, 'rgba(8,12,20,0)')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = 'rgba(59,130,246,0.15)'
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy
        if (d.x < 0 || d.x > w) d.vx *= -1
        if (d.y < 0 || d.y > h) d.vy *= -1
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill()
      }

      ctx.strokeStyle = 'rgba(59,130,246,0.04)'
      ctx.lineWidth = 1
      ctx.strokeRect(40, 40, w - 80, h - 80)
      const step = 60
      for (let x = 40; x < w - 40; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, h - 40); ctx.stroke()
      }
      for (let y = 40; y < h - 40; y += step) {
        ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(w - 40, y); ctx.stroke()
      }

      id = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" />
}

export default function SplashScreen({ onFinish }) {
  const [lineIdx, setLineIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [done, setDone] = useState(false)
  const [fading, setFading] = useState(false)
  const started = useRef(false)
  const lineRef = useRef(0)

  useEffect(() => {
    const cursorId = setInterval(() => setShowCursor(p => !p), 530)
    return () => clearInterval(cursorId)
  }, [])

  /* sequential boot‑line reveal + progress bar */
  useEffect(() => {
    if (started.current) return
    started.current = true
    let i = 0
    const tick = () => {
      if (i >= bootLines.length) { setDone(true); return }
      lineRef.current = i
      setLineIdx(i)
      const target = bootLines[i].metric[1]
      setProgress(target)
      i++
      const delay = 150 + Math.random() * 250
      setTimeout(tick, delay)
    }
    tick()
  }, [])

  /* wait for interaction after done */
  useEffect(() => {
    if (!done) return
    const handler = () => { enableSound(); playBoot(); setFading(true); setTimeout(onFinish, 600) }
    window.addEventListener('keydown', handler, { once: true })
    window.addEventListener('click', handler, { once: true })
    const fb = setTimeout(handler, 7000)
    return () => { clearTimeout(fb); window.removeEventListener('keydown', handler); window.removeEventListener('click', handler) }
  }, [done, onFinish])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080c14] transition-opacity duration-700 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      <BootBg />

      <div className="relative z-10 w-full max-w-3xl px-4 sm:px-8">
        {/* header bar */}
        <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-[#475569]">
          <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <span className="w-2 h-2 rounded-full bg-[#34d399]" />
          <span className="ml-2 tracking-widest">PORTFOLIO BOOT v1.0</span>
          <span className="ml-auto text-[#3b82f6]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* banner */}
        <pre className="text-[#3b82f6] text-[3px] sm:text-[4.5px] md:text-[5.5px] leading-tight mb-5 whitespace-pre text-center select-none">{banner}</pre>

        {/* boot log */}
        <div className="space-y-[2px] mb-4">
          {bootLines.map((line, i) => (
            <p key={i} className={`font-mono text-[11px] sm:text-xs transition-all duration-300 ${lineIdx >= i ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
              <span className="text-[#34d399]">[{String(i + 1).padStart(2, '0')}:00]</span>{' '}
              {i < lineIdx || (i === lineIdx && i === bootLines.length - 1) ? (
                <>
                  <span className="text-[#94a3b8]">{line.text}</span>
                  {i === bootLines.length - 1 && done && (
                    <span className="text-[#34d399] ml-1">[ OK ]</span>
                  )}
                </>
              ) : i === lineIdx ? (
                <span className="text-[#94a3b8]">{line.text}<span className={`text-[#22d3ee] ${showCursor ? 'opacity-100' : 'opacity-0'}`}>_</span></span>
              ) : null}
            </p>
          ))}
        </div>

        {/* progress bar */}
        <div className="w-full h-[3px] bg-[#1e293b] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-[#3b82f6] via-[#22d3ee] to-[#34d399] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* fake metrics */}
        <div className="flex items-center justify-between text-[9px] font-mono text-[#475569]">
          <span>MEM: {16 + Math.floor(Math.random() * 4)}GB / 16GB</span>
          <span>CPU: {10 + Math.floor(Math.random() * 60)}%</span>
          <span>UPTIME: 0:{String(Math.floor(Date.now() / 1000) % 60).padStart(2, '0')}</span>
        </div>

        {/* enter prompt */}
        {done && (
          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#3b82f6] animate-pulse">
            <span>Press any key or click to enter</span>
            <span className={`text-[#22d3ee] ${showCursor ? 'opacity-100' : 'opacity-0'}`}>_</span>
          </div>
        )}
      </div>

      <p className="absolute bottom-3 text-[8px] font-mono text-[#1e293b] tracking-wider">
        Athibordee Thongboonma · portfolio v1.0 · MIT 2026
      </p>
    </div>
  )
}
