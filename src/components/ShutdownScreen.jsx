import { useEffect, useRef, useState } from 'react'

const lines = [
  'init: beginning shutdown sequence...',
  'init: sending SIGTERM to all processes',
  'systemd: Stopping ambient sound engine...',
  'systemd: Stopping GPU compute pipeline...',
  'systemd: Stopping WASM terrain module...',
  'systemd: Stopping 3D renderer (R3F)...',
  'kernel: Unmounting /home/athibordee/portfolio',
  'kernel: Flushing cursor glow buffer...',
  'kernel: HALT',
]

export default function ShutdownScreen({ onClose }) {
  const [visibleLines, setVisibleLines] = useState([])
  const canvasRef = useRef()
  const animRef = useRef()
  const doneRef = useRef(false)

  useEffect(() => {
    lines.forEach((line, i) => setTimeout(() => setVisibleLines((p) => [...p, i]), 80 + i * 220))
    const timer = setTimeout(() => { doneRef.current = true; setTimeout(onClose, 400) }, 80 + lines.length * 220 + 1200)
    return () => clearTimeout(timer)
  }, [onClose])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cols = Math.floor(canvas.width / 14)
    const drops = Array.from({ length: cols }, () => Math.floor(Math.random() * (canvas.height / 14)))

    const draw = () => {
      if (doneRef.current) return
      ctx.fillStyle = 'rgba(8, 12, 20, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = '14px monospace'
      for (let i = 0; i < drops.length; i++) {
        const char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
        ctx.fillStyle = `rgba(52, 211, 153, ${0.3 + Math.random() * 0.5})`
        ctx.fillText(char, i * 14, drops[i] * 14)
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080c14]" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
      <div className="relative z-10 max-w-md w-full px-6">
        <p className="text-[10px] font-mono text-[#64748b] mb-4 tracking-widest">shutdown</p>
        <div className="space-y-1.5">
          {lines.map((line, i) => visibleLines.includes(i) ? (
            <p key={i} className="font-mono text-xs">
              <span className="text-[#ef4444]">[{(i + 1).toString().padStart(2, '0')}:00]</span>{' '}
              <span className="text-[#94a3b8]">{line}</span>
            </p>
          ) : null)}
        </div>
        {visibleLines.length >= lines.length && (
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-[#ef4444]">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
            <span>System halted. Power off...</span>
          </div>
        )}
      </div>
    </div>
  )
}
