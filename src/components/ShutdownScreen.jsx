import { useEffect, useRef, useState } from 'react'
import { playShutdown } from './SoundEngine'

const lines = [
  'init: beginning shutdown sequence...',
  'init: sending SIGTERM to all processes',
  'systemd: Stopping ambient sound engine...',
  'systemd: Stopping GPU compute pipeline...',
  'systemd: Stopping WASM terrain module...',
  'systemd: Stopping 3D renderer (R3F)...',
  'kernel: Unmounting /home/9vxt/portfolio',
  'kernel: Flushing cursor glow buffer...',
  'kernel: HALT',
]

export default function ShutdownScreen({ onClose }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [poweroff, setPoweroff] = useState(false)
  const canvasRef = useRef()
  const animRef = useRef()
  const frameCountRef = useRef(0)
  const doneRef = useRef(false)

  useEffect(() => {
    playShutdown()
    const ids = []
    const lastIdx = lines.length - 1
    const lastLineTime = 80 + lastIdx * 220
    lines.forEach((_, i) => ids.push(setTimeout(() => setVisibleLines(p => [...p, i]), 80 + i * 220)))
    ids.push(setTimeout(() => {
      doneRef.current = true
      setPoweroff(true)
      setTimeout(() => onClose(), 300)
    }, lastLineTime + 400))
    return () => { ids.forEach(clearTimeout) }
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
      frameCountRef.current++
      ctx.fillStyle = 'rgba(8, 12, 20, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = '14px monospace'
      for (let i = 0; i < drops.length; i++) {
        if (frameCountRef.current % 3 !== 0 && i % 2 === 0) continue
        const char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
        ctx.fillStyle = `rgba(52, 211, 153, ${0.2 + Math.random() * 0.4})`
        ctx.fillText(char, i * 14, drops[i] * 14)
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { doneRef.current = true; cancelAnimationFrame(animRef.current) }
  }, [])

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080c14] transition-opacity duration-700 ${poweroff ? 'opacity-0' : 'opacity-100'}`} style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />
      <div className="relative z-10 max-w-md w-full px-6">
        <p className="text-[10px] font-mono text-[#64748b] mb-4 tracking-widest">shutdown</p>
        <div className="space-y-1.5">
          {lines.map((line, i) => visibleLines.includes(i) ? (
            <p key={i} className="font-mono text-xs animate-fadeIn">
              <span className="text-[#ef4444]">[{(i + 1).toString().padStart(2, '0')}:00]</span>{' '}
              <span className="text-[#94a3b8]">{line}</span>
            </p>
          ) : null)}
        </div>
        {poweroff && (
          <div className="mt-4 flex flex-col items-center gap-2 text-[10px] font-mono text-[#ef4444]">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
            <span>System halted.</span>
          </div>
        )}
      </div>
    </div>
  )
}
