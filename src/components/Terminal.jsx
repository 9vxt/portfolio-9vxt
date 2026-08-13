import { useState, useEffect, useRef, useCallback } from 'react'
import { playCommand } from './SoundEngine'
import { shutdown } from '../lib/shutdown'

const BANNER = `  ______     __      __        __  __                                  __                     
 /      \\   |  \\    |  \\      |  \\|  \\                                |  \\                    
|  $$$$$$\\ _| $$_   | $$____   \\$$| $$____    ______    ______    ____| $$  ______    ______  
| $$__| $$|   $$ \\  | $$    \\ |  \\| $$    \\  /      \\  /      \\  /      $$ /      \\  /      \\ 
| $$    $$ \\$$$$$$  | $$$$$$$\\| $$| $$$$$$$\\|  $$$$$$\\|  $$$$$$\\|  $$$$$$$|  $$$$$$\\|  $$$$$$\\
| $$$$$$$$  | $$ __ | $$  | $$| $$| $$  | $$| $$  | $$| $$   \\$$| $$  | $$| $$    $$| $$    $$
| $$  | $$  | $$|  \\| $$  | $$| $$| $$__/ $$| $$__/ $$| $$      | $$__| $$| $$$$$$$$| $$$$$$$$
| $$  | $$   \\$$  $$| $$  | $$| $$| $$    $$ \\$$    $$| $$       \\$$    $$ \\$$     \\ \\$$     \\
 \\$$   \\$$    \\$$$$  \\$$   \\$$ \\$$ \\$$$$$$$   \\$$$$$$  \\$$        \\$$$$$$$  \\$$$$$$$  \\$$$$$$$`

function scrollDepth() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0
  const sections = ['hero','about','skills','learning','projects','showcase','wasm','gpu','contact']
  let current = sections[0]
  for (let i = sections.length - 1; i >= 0; i--) {
    const el = document.getElementById(sections[i])
    if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) { current = sections[i]; break }
  }
  return `Scroll depth: ${pct}%
Current section: ${current}
Viewport: ${window.innerWidth}x${window.innerHeight}`
}

const aboutText = `Hi! I'm Gust (9vxt).
I'm a 15-year-old Computer Engineering enthusiast from Thailand.
Grade 10 @ Watkhienkhet School (Science-Math-Technology Program).

My focus is the boundary between hardware and software:
  • Embedded systems & firmware (ESP32-S3, bare-metal C/C++)
  • OS frameworks & memory safety (Rucyd OS, NoMMU)
  • Computer architecture & compiler design
  • Reverse engineering (Ghidra, x64dbg)

Current mission: POSN Computer → SAT 1600 → TOEFL 110+ → MIT`

const skillsText = `Technical Skills:
  C++           ████████████████  90%  (embedded, ESP32-S3)
  C             ██████████████░░  85%  (firmware, bare-metal)
  Python        ██████████████░░  80%  (scripting, MicroPython)
  Rust          █████████████░░░  70%  (systems, memory safety)
  TypeScript    █████████████░░░  75%  (React, frontend)
  C#            ███████████░░░░░  65%  (Godot, tooling)
  JavaScript    █████████████░░░  78%  (frontend, Canvas)
  Assembly      █████████░░░░░░░  55%  (x86, ARM, RE)`

const projectsText = `Projects:
  [1] ESP32-S3 Calculator — C++/Python hybrid embedded calc
  [2] Rucyd OS on ESP32-S3 — NoMMU framework (<2MB)
  [3] Guitar Multi-Effect — R&D phase, DSP on ESP32-S3

Type 'project 1' (or any number) for details.`

const contactText = `  GitHub:    github.com/9vxt
  Instagram: instagram.com/9vxt_fr
  LinkedIn:  linkedin.com/in/9vxt
  Email:     9vxt.fr@gmail.com
  Spotify:   open.spotify.com/user/31k3tzzxmyzsxg6tuwbmpeg43znq
  LINE:      qwertyuiop0246`

const easterEggs = {
  sudo: "Nice try. You don't have root here. 🔐",
  neofetch: `
         ██▀▀▀▀███        9vxt@portfolio
       ██░░░░░░░░██       ─────────────────────
     ██░░░░░░░░░░░░██     OS: RucydOS v1 (NoMMU)
    ██░░░░░░░░░░░░░░██    User: 9vxt (Grade 10)
   ██░░░░░░░░████░░░░██   Kernel: ESP32-S3 @ 240MHz
   ██░░░░░░░░████░░░░██   Shell: C++ bare-metal
   ██░░░░░░░░░░░░░░░░██   Uptime: 15 years 9 months
    ██░░░░░░░░░░░░░░██    IDE: VS Code
     ██░░░░░░░░░░░░██     Board: ESP32-S3
       ██░░░░░░░░██       Lang: Thai, English
         ██████████       Target: MIT '30
  `,
  '42': 'The answer to life, the universe, and everything.',
  mit: '🏛️  MIT — Mens et Manus (Mind and Hand)\n    Founded 1861 · Cambridge, MA\n    Let\'s build the future together.',
  wasm: '⚡ WebAssembly is active!\n    This portfolio uses C++ compiled to WASM.\n    Check the WASM section below for benchmarks.',
}

const commands = {
  help: () => ({
    text: `Available commands:
  whoami     — Who are you?
  about      — About me
  skills     — Technical skills
  projects   — Projects
  contact    — Contact info
  ls         — List sections
  cat [file] — Read a file
  echo [txt] — Echo text
  date       — Show date/time
  clock      — Show current clock
  scroll     — Scroll depth & viewport info
  uptime     — Session uptime
  pwd        — Print working directory
  banner     — Show ASCII banner
  neofetch   — Fun system info
  sudo       42    mit    wasm  solar — Easter eggs
  clear      — Clear terminal
  exit       — Shutdown
  help       — Show this message`,
    type: 'help'
  }),
  whoami: () => ({ text: `9vxt\n  ────────────\n  Name: Gust\n  Grade: 10 · Watkhienkhet School\n  Status: 🚀 Building towards MIT`, type: 'output' }),
  about: () => ({ text: aboutText, type: 'output' }),
  skills: () => ({ text: skillsText, type: 'output' }),
  projects: () => ({ text: projectsText, type: 'output' }),
  contact: () => ({ text: contactText, type: 'output' }),
  ls: () => ({ text: 'about/  skills/  learning/  projects/  contact/  wasm/', type: 'output' }),
  pwd: () => ({ text: '/home/9vxt/portfolio', type: 'output' }),
  date: () => ({ text: new Date().toString(), type: 'output' }),
  banner: () => ({ text: BANNER, type: 'banner' }),
  clear: () => null,
  exit: () => { setTimeout(shutdown, 100); return { text: 'Shutting down...', type: 'system' } },
  sudo: () => ({ text: easterEggs.sudo, type: 'easteregg' }),
  neofetch: () => ({ text: easterEggs.neofetch, type: 'easteregg' }),
  '42': () => ({ text: easterEggs['42'], type: 'easteregg' }),
  mit: () => ({ text: easterEggs.mit, type: 'easteregg' }),
  wasm: () => ({ text: easterEggs.wasm, type: 'easteregg' }),
  echo: (args) => ({ text: args || '...', type: 'output' }),
  scroll: () => ({ text: scrollDepth(), type: 'output' }),
  clock: () => ({ text: new Date().toLocaleString(), type: 'output' }),
  uptime: () => ({ text: `Portfolio online since ${new Date(document.querySelector('script')?.getAttribute('data-timestamp') || Date.now()).toLocaleString()}\nCurrent session: ${Math.floor(performance.now() / 1000)}s`, type: 'output' }),
  solar: () => { window.location.hash = '#gpu'; return { text: 'Navigating to Solar System simulation...', type: 'system' } },
}

function catHandler(args) {
  const files = { about: aboutText, skills: skillsText, projects: projectsText, contact: contactText }
  if (!args) return { text: 'Usage: cat [about|skills|projects|contact]', type: 'error' }
  const f = args.toLowerCase()
  if (files[f]) return { text: files[f], type: 'output' }
  return { text: `cat: ${f}: No such file`, type: 'error' }
}

function projectHandler(args) {
  const n = parseInt(args)
  const details = [
    { t: 'ESP32-S3 Calculator', d: 'Advanced standalone embedded calculator on dual-core ESP32-S3. Custom Chorded Input System for multi-button shortcuts. Hybrid Execution Engine (C++ & MicroPython) toggling between CAS and Non-CAS modes with unlimited user-defined functions.', s: 'C++, Python, ESP32-S3' },
    { t: 'Rucyd OS on ESP32-S3', d: 'Lightweight Linux NoMMU framework (<2MB footprint) with custom ASCII TUI. Software-Defined Memory Access Validation via Tagged Object Registry & Gatekeeper API — prevents runtime memory corruption without physical MMU.', s: 'C, C++, NoMMU, ESP32-S3' },
    { t: 'ESP32-S3 Guitar Multi-Effect', d: 'In R&D phase. Real-time Digital Signal Processing (DSP) on microcontrollers, low-latency audio processing, and hardware circuit interfacing for guitar effects.', s: 'C++, DSP, I2S, ESP32-S3' },
  ]
  if (isNaN(n) || n < 1 || n > details.length) return { text: `Usage: project [1-${details.length}]`, type: 'error' }
  const p = details[n - 1]
  return { text: `Project ${n}: ${p.t}\n  ${p.d}\n  Stack: ${p.s}`, type: 'output' }
}

export default function Terminal({ className = '' }) {
  const [history, setHistory] = useState([
    //{ text: BANNER, type: 'banner' },
    { text: 'Portfolio terminal. Type "help" to start.', type: 'system' },
    { text: '', type: 'blank' },
  ])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const [clock, setClock] = useState('')
  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history])
  useEffect(() => { inputRef.current?.focus() }, [])

  const execute = useCallback((raw) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    playCommand()
    setCmdHistory((prev) => [...prev.slice(-99), trimmed])
    setHistIdx(-1)
    const parts = trimmed.split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1).join(' ')

    let result
    if (cmd === 'cat') result = catHandler(args)
    else if (cmd === 'project') result = projectHandler(args)
    else if (cmd === 'clear') { setHistory([]); return }
    else if (commands[cmd]) result = commands[cmd](args)
    else result = { text: `bash: ${cmd}: command not found. Try "help".`, type: 'error' }

    setHistory((prev) => [...prev, { text: trimmed, type: 'input' }, result])
  }, [])

  const handleKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); execute(input); setInput('') }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (!cmdHistory.length) return; const idx = histIdx === -1 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1); setHistIdx(idx); setInput(cmdHistory[idx]) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (histIdx === -1) return; const idx = histIdx + 1; if (idx >= cmdHistory.length) { setHistIdx(-1); setInput('') } else { setHistIdx(idx); setInput(cmdHistory[idx]) } }
    else if (e.key === 'Tab') { e.preventDefault(); const all = Object.keys(commands).concat(['cat', 'project']); const match = all.find((c) => c.startsWith(input.toLowerCase()) && c !== input.toLowerCase()); if (match) setInput(match) }
  }

  const copyLine = (text) => {
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  const renderLine = (line, i) => {
    if (line.type === 'blank') return <div key={i} className="h-2" />
    if (line.type === 'input') return (
      <p key={i} className="mb-0.5 text-xs">
        <span className="text-[#3b82f6]">9vxt</span><span className="text-[#1e293b]">@</span><span className="text-[#22d3ee]">portfolio</span><span className="text-[#1e293b]">:</span><span className="text-[#8b5cf6]">~</span><span className="text-[#f1f5f9]">$ </span><span className="text-[#f1f5f9]">{line.text}</span>
      </p>
    )
    if (line.type === 'system') return <p key={i} className="text-[#22d3ee] text-xs mb-0.5">{'◆'} {line.text}</p>
    if (line.type === 'error') return <p key={i} className="text-[#ef4444] text-xs mb-0.5">{'✖'} {line.text}</p>
    if (line.type === 'easteregg') return <pre key={i} className="text-[#8b5cf6] text-[10px] mb-0.5 leading-tight whitespace-pre">{line.text}</pre>
    if (line.type === 'banner') return <pre key={i} className="text-[#3b82f6] text-[6px] sm:text-[7px] leading-tight whitespace-pre mb-2">{line.text}</pre>
    return (
      <div key={i} className="group flex items-start gap-1">
        <pre className="text-[#94a3b8] text-xs mb-0.5 whitespace-pre-wrap leading-relaxed flex-1">{line.text}</pre>
        <button onClick={() => copyLine(typeof line.text === 'string' ? line.text : '')}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono text-[#475569] hover:text-[#3b82f6] shrink-0 mt-0.5"
          title="Copy output">⎘</button>
      </div>
    )
  }

  return (
    <div className={`rounded-lg font-mono ${className}`} style={{ border: '1px solid #1e293b', background: 'rgba(8,12,20,0.88)' }} onClick={() => inputRef.current?.focus()}>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e293b]" style={{ background: '#0a0e17' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
        <span className="text-xs text-[#475569] ml-2">9vxt@portfolio:~/terminal</span>
        <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--accent, #64748b)' }}>{clock}</span>
      </div>
      <div className="p-4 h-56 sm:h-64 overflow-y-auto" ref={scrollRef}>
        {history.map((line, i) => renderLine(line, i))}
        <div className="flex items-center mt-1">
          <span className="text-[#3b82f6] shrink-0 text-xs">9vxt</span><span className="text-[#1e293b] shrink-0 text-xs">@</span>
          <span className="text-[#22d3ee] shrink-0 text-xs">portfolio</span><span className="text-[#1e293b] shrink-0 text-xs">:</span>
          <span className="text-[#8b5cf6] shrink-0 text-xs">~</span><span className="text-[#f1f5f9] shrink-0 text-xs">$ </span>
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
            className="flex-1 bg-transparent text-[#f1f5f9] text-xs outline-none border-none ml-0.5 caret-[#3b82f6]" spellCheck={false} autoComplete="off" aria-label="Terminal input" />
        </div>
      </div>
    </div>
  )
}
