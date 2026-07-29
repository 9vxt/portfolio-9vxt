import { useState, useEffect, useRef, useCallback } from 'react'

const BANNER = `
 █████╗ ████████╗██╗  ██╗██╗██████╗  ██████╗ ██████╗ ██████╗ ███████╗███████╗
██╔══██╗╚══██╔══╝██║  ██║██║██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝
███████║   ██║   ███████║██║██║  ██║██║   ██║██████╔╝██║  ██║█████╗  █████╗
██╔══██║   ██║   ██╔══██║██║██║  ██║██║   ██║██╔══██╗██║  ██║██╔══╝  ██╔══╝
██║  ██║   ██║   ██║  ██║██║██████╔╝╚██████╔╝██████╔╝██████╔╝███████╗███████╗
╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝
`

const aboutText = `Hi! I'm Athibordee Thongboonma.
I'm a Grade 10 student passionate about:
  • Systems programming (C++, Rust, C)
  • Full-stack development
  • 3D graphics & GPU compute
  • AI/ML and compilers

I build things that push the boundaries of what's possible.`

const skillsText = `Technical Skills:
  C++           ████████████████  95%
  Rust          ██████████████░  88%
  Python        ███████████████░  92%
  C             ██████████████░  90%
  C#            █████████████░░  85%
  TypeScript    ██████████████░  90%
  React         ███████████████░  92%
  Three.js      █████████████░░  82%`

const projectsText = `Projects:
  [1] ZetaDB    — Embedded KV store in Rust (50k writes/sec)
  [2] CypherVM  — Stack VM with JIT in C++ (LLVM)
  [3] PyTorch   — GPU ray tracer in Python + CUDA
  [4] NeXus     — 3D collaborative editor
  [5] AetherOS  — Toy x86-64 kernel in C
  [6] ZeroAudit — Smart contract security auditor

Type 'project 1' (or any number) for details.`

const contactText = `  GitHub:    github.com/athibordee
  LinkedIn:  linkedin.com/in/athibordee
  Email:     athibordee@example.com
  Instagram: @athibordee`

const easterEggs = {
  sudo: "Nice try. You don't have root here. 🔐",
  neofetch: `
         ██▀▀▀▀███        athibordee@portfolio
       ██░░░░░░░░██       ─────────────────────
     ██░░░░░░░░░░░░██     OS: Web BrowserOS v1
    ██░░░░░░░░░░░░░░██    Host: Human (Grade 10)
   ██░░░░░░░░████░░░░██   Kernel: JS ES2025
   ██░░░░░░░░████░░░░██   Shell: C++/Rust
   ██░░░░░░░░░░░░░░░░██   Uptime: 16 years
    ██░░░░░░░░░░░░░░██    IDE: Neovim + clangd
     ██░░░░░░░░░░░░██     GPU: Integrated + RTX
       ██░░░░░░░░██       CPU: Bio CPU 1.5GHz
         ██████████       MEM: 16GB + 5TB SSD
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
  pwd        — Print working directory
  banner     — Show ASCII banner
  neofetch   — Fun system info
  sudo       42    mit    wasm   — Easter eggs
  clear      — Clear terminal
  exit       — Close this tab
  help       — Show this message`,
    type: 'help'
  }),
  whoami: () => ({ text: `athibordee\n  ────────────\n  Name: Athibordee Thongboonma\n  Grade: 10\n  School: High School\n  Status: 🚀 Building`, type: 'output' }),
  about: () => ({ text: aboutText, type: 'output' }),
  skills: () => ({ text: skillsText, type: 'output' }),
  projects: () => ({ text: projectsText, type: 'output' }),
  contact: () => ({ text: contactText, type: 'output' }),
  ls: () => ({ text: 'about/  skills/  learning/  projects/  contact/  wasm/', type: 'output' }),
  pwd: () => ({ text: '/home/athibordee/portfolio', type: 'output' }),
  date: () => ({ text: new Date().toString(), type: 'output' }),
  banner: () => ({ text: BANNER, type: 'banner' }),
  clear: () => null,
  exit: () => { window.open('', '_self'); window.close(); return { text: 'Closing window...', type: 'system' } },
  sudo: () => ({ text: easterEggs.sudo, type: 'easteregg' }),
  neofetch: () => ({ text: easterEggs.neofetch, type: 'easteregg' }),
  '42': () => ({ text: easterEggs['42'], type: 'easteregg' }),
  mit: () => ({ text: easterEggs.mit, type: 'easteregg' }),
  wasm: () => ({ text: easterEggs.wasm, type: 'easteregg' }),
  echo: (args) => ({ text: args || '...', type: 'output' }),
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
    { t: 'ZetaDB', d: 'Embedded KV store in Rust with LSM-tree, WAL, ACID. 50k writes/sec.', s: 'Rust, LSM-Tree, CLI' },
    { t: 'CypherVM', d: 'Stack VM with JIT compilation via LLVM. Custom bytecode format.', s: 'C++, LLVM, JIT' },
    { t: 'PyTorch Ray', d: 'GPU ray tracer in Python with CUDA, BVH, PBR materials.', s: 'Python, CUDA, GPU' },
    { t: 'NeXus Engine', d: 'Real-time collab 3D editor. CRDT conflict resolution, WebRTC.', s: 'Three.js, WebRTC, CRDT' },
    { t: 'AetherOS', d: 'Toy x86-64 kernel. Bootloader, interrupts, paging, FAT32.', s: 'C, Assembly, OS Dev' },
    { t: 'Protocol Zero', d: 'Smart contract auditor via Z3 SMT solver. Detects reentrancy.', s: 'Rust, SMT, Solidity' },
  ]
  if (isNaN(n) || n < 1 || n > details.length) return { text: `Usage: project [1-${details.length}]`, type: 'error' }
  const p = details[n - 1]
  return { text: `Project ${n}: ${p.t}\n  ${p.d}\n  Stack: ${p.s}`, type: 'output' }
}

export default function Terminal({ className = '' }) {
  const [history, setHistory] = useState([
    { text: BANNER, type: 'banner' },
    { text: 'Portfolio terminal. Type "help" to start.', type: 'system' },
    { text: '', type: 'blank' },
  ])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef(null)
  const sentinelRef = useRef(null)

  useEffect(() => { sentinelRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history])
  useEffect(() => { inputRef.current?.focus() }, [])

  const execute = useCallback((raw) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    setCmdHistory((prev) => [...prev, trimmed])
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
    if (e.key === 'Enter') { execute(input); setInput('') }
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!cmdHistory.length) return
      const idx = histIdx === -1 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(idx); setInput(cmdHistory[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx === -1) return
      const idx = histIdx + 1
      if (idx >= cmdHistory.length) { setHistIdx(-1); setInput('') }
      else { setHistIdx(idx); setInput(cmdHistory[idx]) }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const all = Object.keys(commands).concat(['cat', 'project'])
      const match = all.find((c) => c.startsWith(input.toLowerCase()))
      if (match) setInput(match)
    }
  }

  const renderLine = (line, i) => {
    if (line.type === 'blank') return <div key={i} className="h-2" />
    if (line.type === 'input') return (
      <p key={i} className="mb-0.5 text-xs">
        <span className="text-[#3b82f6]">athibordee</span>
        <span className="text-[#1e293b]">@</span>
        <span className="text-[#22d3ee]">portfolio</span>
        <span className="text-[#1e293b]">:</span>
        <span className="text-[#8b5cf6]">~</span>
        <span className="text-[#f1f5f9]">$ </span>
        <span className="text-[#f1f5f9]">{line.text}</span>
      </p>
    )
    if (line.type === 'system') return <p key={i} className="text-[#22d3ee] text-xs mb-0.5">{'◆'} {line.text}</p>
    if (line.type === 'error') return <p key={i} className="text-[#ef4444] text-xs mb-0.5">{'✖'} {line.text}</p>
    if (line.type === 'easteregg') return <pre key={i} className="text-[#8b5cf6] text-[10px] mb-0.5 leading-tight whitespace-pre">{line.text}</pre>
    if (line.type === 'banner') return <pre key={i} className="text-[#3b82f6] text-[7px] sm:text-[9px] leading-tight whitespace-pre mb-2">{line.text}</pre>
    return <pre key={i} className="text-[#94a3b8] text-xs mb-0.5 whitespace-pre-wrap leading-relaxed">{line.text}</pre>
  }

  return (
    <div className={`rounded-lg font-mono ${className}`} style={{ border: '1px solid #1e293b', background: 'rgba(8,12,20,0.88)' }} onClick={() => inputRef.current?.focus()}>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e293b]" style={{ background: '#0a0e17' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
        <span className="text-xs text-[#475569] ml-2">athibordee@portfolio:~/terminal</span>
      </div>
      <div className="p-4 h-56 sm:h-64 overflow-y-auto">
        {history.map((line, i) => renderLine(line, i))}
        <div ref={sentinelRef} />
        <div className="flex items-center mt-1">
          <span className="text-[#3b82f6] shrink-0 text-xs">athibordee</span>
          <span className="text-[#1e293b] shrink-0 text-xs">@</span>
          <span className="text-[#22d3ee] shrink-0 text-xs">portfolio</span>
          <span className="text-[#1e293b] shrink-0 text-xs">:</span>
          <span className="text-[#8b5cf6] shrink-0 text-xs">~</span>
          <span className="text-[#f1f5f9] shrink-0 text-xs">$ </span>
          <input ref={inputRef} type="text" value={input}
            onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
            className="flex-1 bg-transparent text-[#f1f5f9] text-xs outline-none border-none ml-0.5 caret-[#3b82f6]"
            spellCheck={false} autoComplete="off" aria-label="Terminal input" />
        </div>
      </div>
    </div>
  )
}
