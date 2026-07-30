export default function Footer() {
  return (
    <footer className="py-6 bg-[#080c14] border-t border-[#1e293b]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-mono text-[#475569]">
            <span className="text-[#3b82f6]">9vxt</span>
            <span className="text-[#1e293b]">@</span>
            <span className="text-[#22d3ee]">portfolio</span>
            <span className="text-[#1e293b]">:</span>
            <span className="text-[#8b5cf6]">~</span>
            <span className="text-[#1e293b]">$</span>{' '}
            echo &copy;{new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs font-mono text-[#475569]">
            <span className="text-[#1e293b]">// </span>crafted with{' '}
               <span className="text-[#3b82f6]">React</span>
               <span className="text-[#1e293b]"> + </span>
               <span className="text-[#22d3ee]">Three.js</span>
               <span className="text-[#1e293b]"> + </span>
               <span className="text-[#34d399]">TailwindCSS</span>
               <span className="text-[#1e293b]"> + </span>
               <span className="text-[#f59e0b]">Framer Motion</span>
            </p>
          </div>
        </div>
        <p className="text-[9px] font-mono text-[#1e293b] text-center mt-3">
          ── built with brain from a grade 10 engineer ──
        </p>
      </div>
    </footer>
  )
}
