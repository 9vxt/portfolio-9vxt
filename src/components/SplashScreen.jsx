import { useState, useEffect, useRef } from 'react'
import { enableSound, playBoot } from './SoundEngine'

const banner = `______     __      __        __  __                                  __                     
 /      \\   |  \\    |  \\      |  \\|  \\                                |  \\                    
|  $$$$$$\\ _| $$_   | $$____   \\$$| $$____    ______    ______    ____| $$  ______    ______  
| $$__| $$|   $$ \\  | $$    \\ |  \\| $$    \\  /      \\  /      \\  /      $$ /      \\  /      \\ 
| $$    $$ \\$$$$$$  | $$$$$$$\\| $$| $$$$$$$\\|  $$$$$$\\|  $$$$$$\\|  $$$$$$$|  $$$$$$\\|  $$$$$$\\
| $$$$$$$$  | $$ __ | $$  | $$| $$| $$  | $$| $$  | $$| $$   \\$$| $$  | $$| $$    $$| $$    $$
| $$  | $$  | $$|  \\| $$  | $$| $$| $$__/ $$| $$__/ $$| $$      | $$__| $$| $$$$$$$$| $$$$$$$$
| $$  | $$   \\$$  $$| $$  | $$| $$| $$    $$ \\$$    $$| $$       \\$$    $$ \\$$     \\ \\$$     \\
 \\$$   \\$$    \\$$$$  \\$$   \\$$ \\$$ \\$$$$$$$   \\$$$$$$  \\$$        \\$$$$$$$  \\$$$$$$$  \\$$$$$$$`

const bootLines = [
  { text: 'Initializing portfolio kernel...', delay: 200 },
  { text: 'Loading WASM terrain module (C++ → clang --target=wasm32)...', delay: 400 },
  { text: 'Compiling 3D shaders (GLSL + WGSL)...', delay: 600 },
  { text: 'Initializing WebGPU compute pipeline...', delay: 800 },
  { text: 'Starting Three.js renderer (R3F v9)...', delay: 1000 },
  { text: 'Mounting /home/athibordee/portfolio', delay: 1200 },
  { text: 'Starting ambient sound engine...', delay: 1400 },
  { text: 'Calibrating cursor glow field...', delay: 1600 },
  { text: 'All systems operational.', delay: 2000 },
  { text: '', delay: 2200 },
  { text: 'Press any key or click to enter...', delay: 2400, blink: true },
]

export default function SplashScreen({ onFinish }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [showCursor, setShowCursor] = useState(true)
  const [done, setDone] = useState(false)
  const [fading, setFading] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    bootLines.forEach((line, i) => setTimeout(() => { setVisibleLines((p) => [...p, i]); if (i === bootLines.length - 1) setDone(true) }, line.delay))
  }, [])

  useEffect(() => {
    if (!done) return
    let idx = 0
    const id = setInterval(() => { idx++; setShowCursor(idx % 2 === 0) }, 530)
    const handler = () => { enableSound(); playBoot(); setFading(true); setTimeout(onFinish, 600) }
    window.addEventListener('keydown', handler, { once: true })
    window.addEventListener('click', handler, { once: true })
    const fb = setTimeout(handler, 6000)
    return () => { clearInterval(id); clearTimeout(fb); window.removeEventListener('keydown', handler); window.removeEventListener('click', handler) }
  }, [done, onFinish])

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080c14] transition-opacity duration-600 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      <div className="max-w-lg w-full px-6">
        <pre className="text-[#3b82f6] text-[6px] sm:text-[7px] leading-tight mb-6 whitespace-pre text-center">{banner}</pre>
        <div className="space-y-1">
          {bootLines.map((line, i) => visibleLines.includes(i) ? (
            <p key={i} className="font-mono text-xs">
              <span className="text-[#34d399]">[{(i + 1).toString().padStart(2, '0')}:00]</span>{' '}
              {i === bootLines.length - 1 ? (
                <span className="text-[#3b82f6]">{line.text}{showCursor && <span className="text-[#22d3ee] blink">_</span>}</span>
              ) : <span className="text-[#94a3b8]">{line.text}</span>}
            </p>
          ) : null)}
        </div>
        {visibleLines.length < bootLines.length && (
          <div className="mt-3 flex items-center gap-1 text-[10px] font-mono text-[#475569]">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" /><span>Booting...</span>
          </div>
        )}
      </div>
      <p className="absolute bottom-4 text-[9px] font-mono text-[#1e293b]">Athibordee Thongboonma · portfolio v1.0 · MIT 2026</p>
    </div>
  )
}
