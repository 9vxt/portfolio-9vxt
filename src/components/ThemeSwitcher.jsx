import { useState, useEffect, useCallback } from 'react'

const themes = [
  { id: 'cyber', label: 'cyber', icon: '◈', color: '#3b82f6', bg: '#080c14' },
  { id: 'matrix', label: 'matrix', icon: '■', color: '#34d399', bg: '#0a140e' },
  { id: 'synth', label: 'synthwave', icon: '◆', color: '#8b5cf6', bg: '#0e0a14' },
]

function applyTheme(id) {
  const root = document.documentElement
  root.setAttribute('data-theme', id)
  try { localStorage.setItem('theme', id) } catch {}
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'cyber' } catch { return 'cyber' }
  })

  useEffect(() => { applyTheme(theme) }, [theme])

  const cycle = useCallback(() => {
    setTheme(p => {
      const idx = themes.findIndex(t => t.id === p)
      return themes[(idx + 1) % themes.length].id
    })
  }, [])

  const current = themes.find(t => t.id === theme) || themes[0]

  return (
    <button onClick={cycle} title={`Theme: ${current.label}`}
      className="fixed bottom-3 left-3 z-[999] flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono transition-all"
      style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(30,41,59,0.8)', backdropFilter: 'blur(4px)', color: current.color }}>
      <span>{current.icon}</span>
      <span className="hidden sm:inline">{current.label}</span>
    </button>
  )
}
