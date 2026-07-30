import { useState } from 'react'
import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

const techs = [
  { name: 'C++', desc: 'Systems programming, STL, templates, RAII', icon: '<>', color: '#3b82f6' },
  { name: 'Rust', desc: 'Ownership, zero-cost abstractions, async', icon: 'RS', color: '#22d3ee' },
  { name: 'Python', desc: 'ML, data pipelines, automation, scripting', icon: 'PY', color: '#f59e0b' },
  { name: 'TypeScript', desc: 'Full-stack, generics, advanced types', icon: 'TS', color: '#3b82f6' },
  { name: 'WebGPU', desc: 'Compute shaders, WGSL, GPU pipelines', icon: 'GPU', color: '#8b5cf6' },
  { name: 'WASM', desc: 'C++ → WASM, benchmarking, optimization', icon: 'W🜁', color: '#34d399' },
  { name: 'Three.js', desc: '3D rendering, shaders, R3F integration', icon: '3D', color: '#22d3ee' },
  { name: 'React', desc: 'Hooks, fiber, suspense, concurrent mode', icon: '⚛', color: '#3b82f6' },
]

const projects = [
  { name: 'ESP32-S3 Calculator', desc: 'Embedded calculator with dual-core ESP32-S3, Chorded Input System, Hybrid CAS/Non-CAS engine.', color: '#22d3ee' },
  { name: 'Rucyd OS', desc: 'Linux NoMMU framework (<2MB) with Software-Defined Memory Validation & Gatekeeper API.', color: '#8b5cf6' },
  { name: 'Guitar Multi-Effect', desc: 'R&D phase — real-time DSP audio processing on ESP32-S3 with low-latency I2S.', color: '#f59e0b' },
]

export default function ShowcaseWall() {
  const [ref, visible] = useOnScreen(0.05)
  const [flip, setFlip] = useState(null)

  return (
    <section id="showcase" className="py-20 bg-[#0a0e17] border-t border-[#1e293b]">
      <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p className="text-xs text-[#64748b] font-mono mb-2 tracking-widest"><span className="text-[#3b82f6]">//</span> stack</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-2 font-mono">tech<span className="text-[#3b82f6]">_</span>wall</h2>
          <p className="text-xs font-mono text-[#64748b]">Click a card to flip — hover for glow</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {techs.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => setFlip(flip === `t${i}` ? null : `t${i}`)}
              className="eng-card p-4 cursor-pointer select-none group"
              style={{ perspective: 600, position: 'relative' }}
            >
              <motion.div
                animate={{ rotateY: flip === `t${i}` ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div style={{ backfaceVisibility: 'hidden' }}>
                  <div className="w-8 h-8 rounded border border-[#1e293b] flex items-center justify-center text-xs font-mono mb-2"
                    style={{ color: t.color, borderColor: t.color + '40' }}>
                    {t.icon}
                  </div>
                  <p className="text-xs font-mono text-[#f1f5f9] group-hover:text-[#3b82f6] transition-colors">{t.name}</p>
                  <p className="text-[9px] font-mono text-[#475569] mt-1">{t.desc.split(',')[0]}</p>
                </div>
                <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, overflowY: 'auto' }}>
                  <p className="text-[10px] font-mono text-[#94a3b8] text-center leading-relaxed">{t.desc}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-xs text-[#64748b] font-mono mb-3 text-center tracking-widest"><span className="text-[#34d399]">//</span> featured_projects</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {projects.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                className="eng-card p-4 group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <p className="text-xs font-mono text-[#f1f5f9] group-hover:text-[#3b82f6] transition-colors">{p.name}</p>
                </div>
                <p className="text-[10px] font-mono text-[#64748b] leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
