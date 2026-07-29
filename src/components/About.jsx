import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

const languages = [
  { name: 'C++', level: 92, years: 'C++17/20, embedded', color: 'bg-[#3b82f6]' },
  { name: 'C', level: 85, years: 'Firmware, bare-metal', color: 'bg-[#64748b]' },
  { name: 'C#', level: 65, years: 'Game dev, tooling', color: 'bg-[#8b5cf6]' },
  { name: 'Python', level: 80, years: 'Scripting, tooling', color: 'bg-[#f59e0b]' },
  { name: 'Rust', level: 70, years: 'Systems, memory safety', color: 'bg-[#22d3ee]' },
  { name: 'TypeScript', level: 75, years: 'React, frontend', color: 'bg-[#3b82f6]' },
  { name: 'JavaScript', level: 78, years: 'Frontend, Canvas', color: 'bg-[#f59e0b]' },
  { name: 'GDScript', level: 60, years: 'Godot engine', color: 'bg-[#34d399]' },
]

const domains = [
  { label: 'System Design', desc: 'Low-level architecture, OS frameworks, memory safety' },
  { label: 'Embedded Systems', desc: 'ESP32-S3, firmware, bare-metal C/C++' },
  { label: 'Frontend Dev', desc: 'React, TypeScript, UI engineering' },
  { label: 'OS Design', desc: 'Rucyd OS, Linux NoMMU, custom kernels' },
  { label: 'Game Dev', desc: 'Godot engine, GDScript, interactive tools' },
  { label: 'Modeling & CAD', desc: 'Blender, AutoCAD, technical drawing' },
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
                  Hey, I'm Gust — a 15-year-old Computer Engineering enthusiast from Thailand,
                  currently in Grade 10 at Watkhienkhet School (Science-Math-Technology Program).
                </p>
                <p>
                  I don't just write code — I need to know what happens at the silicon level.
                  My work lives at the boundary between hardware and software: building custom
                  OS frameworks, designing microcontroller logic, and enforcing memory safety
                  where physical MMUs don't exist.
                </p>
                <p>
                  I build embedded systems & firmware (ESP32-S3, bare-metal C/C++), architect
                  memory-safe OS frameworks (Rucyd OS), and explore compiler design, CPU
                  architecture, and reverse engineering with Ghidra/x64dbg.
                </p>
                <p>
                  My mission: POSN Computer, SAT 1600, TOEFL 110+, and studying Computer
                  Engineering at MIT.
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
                <span className="text-5xl font-mono text-[#3b82f6]/30">G</span>
              </div>
              <p className="text-xs font-mono text-[#f1f5f9]">Athibordee "Gust" Thongboonma</p>
              <p className="text-[10px] font-mono text-[#64748b]">Grade 10 · Computer Engineering · Thailand</p>
              <div className="flex justify-center gap-3 mt-3 pt-3 border-t border-[#1e293b]">
                <span className="text-[10px] text-[#475569] font-mono">C++</span>
                <span className="text-[10px] text-[#475569] font-mono">C</span>
                <span className="text-[10px] text-[#475569] font-mono">Python</span>
                <span className="text-[10px] text-[#475569] font-mono">Rust</span>
                <span className="text-[10px] text-[#475569] font-mono">C#</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
