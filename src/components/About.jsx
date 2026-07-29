import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

const languages = [
  { name: 'C++', level: 95, years: '5+ yrs', color: 'bg-[#3b82f6]' },
  { name: 'Rust', level: 88, years: '3+ yrs', color: 'bg-[#22d3ee]' },
  { name: 'Python', level: 92, years: '5+ yrs', color: 'bg-[#f59e0b]' },
  { name: 'C', level: 90, years: '4+ yrs', color: 'bg-[#64748b]' },
  { name: 'C#', level: 85, years: '3+ yrs', color: 'bg-[#8b5cf6]' },
  { name: 'TypeScript', level: 90, years: '3+ yrs', color: 'bg-[#3b82f6]' },
  { name: 'JavaScript', level: 92, years: '4+ yrs', color: 'bg-[#f59e0b]' },
  { name: 'Assembly (x86)', level: 60, years: '1+ yrs', color: 'bg-[#34d399]' },
]

const domains = [
  { label: 'Systems Programming', desc: 'OS dev, memory allocators, kernels' },
  { label: 'Full-Stack Web', desc: 'React, Node.js, Next.js, APIs' },
  { label: 'Embedded Systems', desc: 'Firmware, RTOS, IoT, microcontrollers' },
  { label: 'Graphics & Simulation', desc: 'WebGL, Three.js, ray tracing' },
  { label: 'Compiler / Language', desc: 'Lexers, parsers, AST, codegen' },
  { label: 'Cryptography & Security', desc: 'ZKP, encryption, secure protocols' },
]

export default function About() {
  const [ref, visible] = useOnScreen(0.1)

  return (
    <section id="about" className="py-28 bg-[#080c14] border-t border-[#1e293b]">
      <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs text-[#64748b] font-mono mb-2 tracking-widest">
            <span className="text-[#3b82f6]">//</span> personal_profile
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-12 font-mono">
            about<span className="text-[#3b82f6]">_</span>me
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="eng-card p-6"
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e293b]">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
                </div>
                <span className="text-xs text-[#475569] font-mono ml-2">about.md — profile</span>
              </div>

              <div className="space-y-3 text-sm text-[#94a3b8] font-mono leading-relaxed">
                <p>
                  <span className="text-[#64748b]">$</span>{' '}
                  <span className="text-[#22d3ee]">cat</span> bio.txt
                </p>
                <p className="text-xs text-[#64748b]">───</p>
                <p>
                  Hey, I'm Athibordee — a high school student (Grade 10) who lives and breathes
                  systems programming. I've been writing C++ since middle school, fell in love
                  with Rust's memory safety, and use Python to glue everything together.
                </p>
                <p>
                  I build compilers, experiment with OS development, contribute to open-source
                  databases, and create full-stack apps with React and TypeScript. My current
                  obsession is GPU compute — using Vulkan and WebGPU for simulation work.
                </p>
                <p>
                  I'm aiming for MIT because I want to push computer engineering further —
                  designing chips, building kernels, and architecting distributed systems that
                  scale. Think lower than C, higher than the cloud.
                </p>
                <p className="text-xs text-[#64748b]">───</p>
                <p className="text-xs text-[#475569]">
                  <span className="text-[#34d399]">✔</span> profile loaded —{' '}
                  <span className="text-[#64748b]">status: building</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="eng-card p-6"
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e293b]">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
                </div>
                <span className="text-xs text-[#475569] font-mono ml-2">domains.txt — expertise</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {domains.map((d) => (
                  <div key={d.label} className="p-3 border border-[#1e293b] rounded-md hover:border-[#3b82f6]/30 transition-all">
                    <p className="text-xs font-mono text-[#3b82f6] mb-0.5">{'> '}{d.label}</p>
                    <p className="text-[11px] font-mono text-[#64748b]">{d.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="eng-card p-6"
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e293b]">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
                </div>
                <span className="text-xs text-[#475569] font-mono ml-2">languages.bin</span>
              </div>

              <div className="space-y-3">
                {languages.map((lang) => (
                  <div key={lang.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-[#f1f5f9]">{lang.name}</span>
                      <span className="text-[10px] font-mono text-[#475569]">{lang.years}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={visible ? { width: `${lang.level}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                        className={`h-full rounded-full ${lang.color}`}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[8px] text-[#475569] font-mono">
                        [{lang.level}%]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="eng-card p-6 text-center"
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e293b] justify-center">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
                </div>
                <span className="text-xs text-[#475569] font-mono ml-2">avatar</span>
              </div>
              <div className="w-40 h-40 mx-auto bg-[#0f172a] border-2 border-[#1e293b] flex items-center justify-center mb-3">
                <span className="text-5xl font-mono text-[#3b82f6]/30">A</span>
              </div>
              <p className="text-xs font-mono text-[#f1f5f9]">Athibordee Thongboonma</p>
              <p className="text-[10px] font-mono text-[#64748b]">Grade 10 · Computer Engineering</p>
              <div className="flex justify-center gap-3 mt-3 pt-3 border-t border-[#1e293b]">
                <span className="text-[10px] text-[#475569] font-mono">C++</span>
                <span className="text-[10px] text-[#475569] font-mono">Rust</span>
                <span className="text-[10px] text-[#475569] font-mono">Python</span>
                <span className="text-[10px] text-[#475569] font-mono">C</span>
                <span className="text-[10px] text-[#475569] font-mono">C#</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
