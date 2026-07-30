import { useEffect } from 'react'

const art = `
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
`

export default function ConsoleArt() {
  useEffect(() => {
    console.log(`%c${art}`, 'color: #22d3ee; font-size: 11px;')
    console.log('%c🔍 curious? check out the source on GitHub', 'color: #3b82f6; font-size: 12px; font-weight: bold;')
  }, [])
  return null
}
