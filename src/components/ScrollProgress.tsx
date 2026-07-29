import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.to(el, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0,
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[999] pointer-events-none" style={{ transformOrigin: '0% 50%' }}>
      <div ref={barRef} className="h-full w-full bg-gradient-to-r from-[#3b82f6] via-[#22d3ee] to-[#8b5cf6]"
        style={{ transform: 'scaleX(0)', transformOrigin: '0% 50%' }} />
    </div>
  )
}
