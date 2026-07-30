import { useEffect } from 'react'

const css = `
/* 1. Link hover underline slide */
.eng-link { position: relative; display: inline-block; }
.eng-link::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 100%;
  height: 1px; background: #3b82f6; transition: right 0.3s ease;
}
.eng-link:hover::after { right: 0; }

/* 2. Tag subtle pulse */
@keyframes tagPulse {
  0%, 100% { box-shadow: 0 0 4px rgba(34,211,238,0.15); }
  50% { box-shadow: 0 0 10px rgba(34,211,238,0.3); }
}
.eng-tag { animation: tagPulse 3s ease-in-out infinite; }

/* 3. Button glow on hover */
.eng-btn:hover {
  box-shadow: 0 0 12px rgba(59,130,246,0.2), 0 0 24px rgba(59,130,246,0.08);
}

/* 4. Nav link active glow */
.nav-link-active::after {
  content: ''; position: absolute; bottom: -2px; left: 4px; right: 4px;
  height: 2px; background: #3b82f6; border-radius: 1px; box-shadow: 0 0 6px #3b82f6;
}

/* 5. Section h2 heading after gradient */
.section-heading::after {
  content: ''; display: block; width: 40px; height: 2px;
  margin-top: 6px; background: linear-gradient(90deg, #3b82f6, #22d3ee); border-radius: 1px;
}

/* 6. Fade-in for terminal lines */
.terminal-line {
  animation: fadeInLine 0.3s ease-out forwards;
  opacity: 0;
}
@keyframes fadeInLine { to { opacity: 1; } }
`

export default function VisualEnhancements() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = css
    document.head.appendChild(style)
    return () => style.remove()
  }, [])
  return null
}
