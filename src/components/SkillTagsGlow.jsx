import { useEffect } from 'react'

export default function SkillTagsGlow() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes tagPulse {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
      }
      .skill-tag {
        transition: all 0.3s;
      }
      .skill-tag:hover {
        animation: tagPulse 0.6s ease-in-out 2;
        box-shadow: 0 0 12px currentColor, 0 0 24px currentColor;
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])
  return null
}
