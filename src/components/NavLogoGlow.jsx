export default function NavLogoGlow() {
  return (
    <style>{`
      @keyframes logoPulse {
        0%, 100% { box-shadow: 0 0 6px #3b82f6, 0 0 12px rgba(59,130,246,0.3); border-color: #3b82f6; }
        25% { box-shadow: 0 0 6px #22d3ee, 0 0 12px rgba(34,211,238,0.3); border-color: #22d3ee; }
        50% { box-shadow: 0 0 6px #8b5cf6, 0 0 12px rgba(139,92,246,0.3); border-color: #8b5cf6; }
        75% { box-shadow: 0 0 6px #34d399, 0 0 12px rgba(52,211,153,0.3); border-color: #34d399; }
      }
      .nav-logo { animation: logoPulse 4s ease-in-out infinite; }
    `}</style>
  )
}
