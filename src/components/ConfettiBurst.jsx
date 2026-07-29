import { useRef, useEffect } from 'react'

const colors = ['#3b82f6', '#22d3ee', '#8b5cf6', '#34d399', '#f59e0b', '#ef4444', '#f1f5f9']
const COUNT = 60

export default function ConfettiBurst({ x = 0.5, y = 0.5 }) {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')
    const cx = x * canvas.width
    const cy = y * canvas.height
    let running = true

    const particles = Array.from({ length: COUNT }, () => ({
      x: cx, y: cy,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.8) * 12,
      r: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      decay: 0.01 + Math.random() * 0.02,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.2,
    }))

    const draw = () => {
      if (!running) return
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of particles) {
        if (p.life <= 0) continue
        alive = true
        p.x += p.vx; p.y += p.vy
        p.vy += 0.15
        p.life -= p.decay
        p.rot += p.rotV
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6)
        ctx.restore()
      }
      if (alive) requestAnimationFrame(draw)
    }
    draw()
    setTimeout(() => { running = false; if (canvas.parentNode) canvas.parentNode.removeChild(canvas) }, 3000)
    return () => { running = false }
  }, [x, y])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
