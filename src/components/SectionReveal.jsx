import { useEffect, useRef, useState } from 'react'

export default function SectionReveal() {
  const [active, setActive] = useState('')
  const rafRef = useRef()

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(e.target.id)
            e.target.classList.add('section-revealed')
          }
        }
      },
      { threshold: 0.25 }
    )
    for (const s of sections) observer.observe(s)
    return () => observer.disconnect()
  }, [])

  return null
}
