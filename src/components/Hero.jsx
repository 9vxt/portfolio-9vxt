import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Scene3D from './Scene3D'

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen w-full overflow-hidden circuit-bg pt-14">
      <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/5 via-transparent to-[#080c14]/90 pointer-events-none z-[1]" />

      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }} fallback={<div className="w-full h-full bg-[#080c14]" />}>
          <Scene3D />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#1e293b] rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-[#34d399] pulse-slow" />
            <span className="text-[11px] text-[#94a3b8] font-mono">open for opportunities</span>
          </div>

          <p className="text-xs sm:text-sm text-[#64748b] font-mono mb-3 tracking-wider">
            <span className="text-[#3b82f6]">#include</span> {'<'}engineer{'/>'}
          </p>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#f1f5f9] mb-3 tracking-tight">
            Athibordee
            <br />
            <span className="text-[#3b82f6]">Thongboonma</span>
          </h1>

          <p className="text-sm sm:text-base text-[#94a3b8] font-mono mb-2 max-w-xl mx-auto leading-relaxed">
            <span className="text-[#475569]">const</span>{' '}
            <span className="text-[#22d3ee]">engineer</span>{' '}
            <span className="text-[#64748b]">=</span>{' '}
            <span className="text-[#f59e0b]">{'{'} </span>
            <span className="text-[#64748b]">lang</span>: [
            <span className="text-[#34d399]">C++</span>,{' '}
            <span className="text-[#34d399]">Rust</span>,{' '}
            <span className="text-[#34d399]">Python</span>,{' '}
            <span className="text-[#34d399]">TypeScript</span>
            ], <span className="text-[#64748b]">vibe</span>:{' '}
            <span className="text-[#22d3ee]">"computer engineer"</span>
            <span className="text-[#f59e0b]">{' }'}</span>;
          </p>

          <p className="text-xs text-[#475569] font-mono mb-8">
            <span className="text-[#64748b]">// </span>building robust systems from embedded to cloud
          </p>

          <div className="flex justify-center gap-3 flex-wrap">
            <a href="#projects"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#3b82f6] text-[#080c14] text-xs font-mono font-semibold hover:bg-[#2563eb] transition-all eng-glow-blue">
              <span>View Projects</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
            <a href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#1e293b] text-[#94a3b8] text-xs font-mono hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all">
              <span>_contact</span>
            </a>
            <a href="#"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#1e293b] text-[#94a3b8] text-xs font-mono hover:border-[#22d3ee] hover:text-[#22d3ee] transition-all">
              <span>resume.pdf</span>
              <span className="text-[#475569]">↓</span>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-1 text-[#475569]">
            <span className="text-[10px] font-mono">scroll</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
