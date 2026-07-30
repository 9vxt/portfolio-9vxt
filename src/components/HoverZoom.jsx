import { useEffect } from 'react'

export default function HoverZoom() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .hover-zoom {
        transition: transform 0.3s cubic-bezier(.2,.8,.3,1);
      }
      .hover-zoom:hover {
        transform: scale(1.03);
        z-index: 10;
      }
    `
    document.head.appendChild(style)
    const cards = document.querySelectorAll('.eng-card, .project-card')
    cards.forEach(c => c.classList.add('hover-zoom'))
    return () => { style.remove(); cards.forEach(c => c.classList.remove('hover-zoom')) }
  }, [])
  return null
}
