import { useEffect } from 'react'

export default function SectionReveal() {
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('section-revealed')
            observer.unobserve(e.target)
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    for (const s of sections) {
      if (!s.classList.contains('section-revealed')) observer.observe(s)
    }
    return () => observer.disconnect()
  }, [])

  return null
}
