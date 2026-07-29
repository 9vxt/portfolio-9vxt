import { useRef, useEffect } from 'react'

export default function CursorGlow() {
  const glowRef = useRef()

  useEffect(() => {
    const el = glowRef.current
    if (!el) return
    let raf
    const onMove = (e) => {
      raf = requestAnimationFrame(() => {
        el.style.left = e.clientX + 'px'
        el.style.top = e.clientY + 'px'
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div ref={glowRef}
      className="fixed pointer-events-none z-[9998]"
      style={{
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.05s, top 0.05s',
      }}
    />
  )
}
