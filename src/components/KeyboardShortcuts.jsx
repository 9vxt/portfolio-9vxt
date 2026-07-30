import { useState, useEffect } from 'react'

const shortcuts = [
  ['g + h', 'Go to Hero'],
  ['g + a', 'Go to About'],
  ['g + s', 'Go to Skills'],
  ['g + l', 'Go to Learning'],
  ['g + p', 'Go to Projects'],
  ['g + c', 'Go to Contact'],
  ['?', 'Toggle this menu'],
  ['Esc', 'Close overlay'],
]

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setOpen(p => !p)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="relative bg-[#0f172a] border border-[#1e293b] rounded-lg p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 0 30px rgba(59,130,246,0.1)' }}>
        <p className="text-[10px] font-mono text-[#64748b] tracking-widest mb-4">keyboard shortcuts</p>
        <div className="space-y-2">
          {shortcuts.map(([key, desc]) => (
            <div key={key} className="flex items-center gap-3 font-mono text-xs">
              <kbd className="px-2 py-0.5 rounded bg-[#1e293b] text-[#3b82f6] text-[10px] border border-[#334155]">{key}</kbd>
              <span className="text-[#94a3b8]">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
