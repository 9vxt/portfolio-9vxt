import { useEffect, useRef } from 'react'

const arts = [
  {
    text: `
  ╔══════════════════════════════════╗
  ║   █████╗ ████████╗██╗  ██╗     ║
  ║  ██╔══██╗╚══██╔══╝██║  ██║     ║
  ║  ███████║   ██║   ███████║     ║
  ║  ██╔══██║   ██║   ██╔══██║     ║
  ║  ██║  ██║   ██║   ██║  ██║     ║
  ║  ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝     ║
  ╠══════════════════════════════════╣
  ║  Embedded · OS · Low-Level      ║
  ╚══════════════════════════════════╝
  👋 hey there, thanks for peeking under the hood!
  🔧 built with React + Three.js + WebAudio
  ⭐ star the repo if you like what you see: https://github.com/9vxt/portfolio
`, color: '#22d3ee' },
  {
    text: `
   ░▒▓█ 9VXT █▓▒░
   ┌─────────────────────────────┐
   │  ▄▀  █  ▄▀  ▄▀▀▀▄  █▄ ▄█   │
   │  █   █  █   █   █  █ ▀ █   │
   │  █▄▄ █  █▄▄ █▄▄▄█  █   █   │
   └─────────────────────────────┘
   >_ human.txt loaded
   >_ engineer.mind decoded
   >_ mission: MIT
`, color: '#8b5cf6' },
  {
    text: `
   ╭──────────────────────────╮
   │  [root@portfolio ~]#    │
   │  █▀▀ █▀▀ █▀▀█ █▀▀ █ █  │
   │  █▀▀ ▀▀█ █▄▄▀ █   █▄█  │
   │  ▀   ▀▀▀ ▀ ▀▀ ▀▀▀ ▄ ▄  │
   │                        │
   │  "hardware meets code" │
   ╰──────────────────────────╯
   ⚡ 9vxt — building the future, one transistor at a time
`, color: '#f59e0b' },
]

export default function ConsoleArt() {
  const idxRef = useRef(Math.floor(Math.random() * arts.length))
  useEffect(() => {
    const a = arts[idxRef.current]
    console.log(`%c${a.text}`, `color: ${a.color}; font-size: 11px;`)
    console.log('%c🔍 curious? check out the source on GitHub', 'color: #3b82f6; font-size: 12px; font-weight: bold;')
  }, [])
  return null
}
