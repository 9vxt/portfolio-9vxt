import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const courses = [
  { code: 'CS50x', name: 'Harvard CS50 — Intro to CS', type: 'course', status: 'active', progress: 72, color: '#ef4444' },
  { code: '6.006', name: 'MIT — Introduction to Algorithms', type: 'course', status: 'active', progress: 15, color: '#f59e0b' },
  { code: 'ASM', name: 'Assembly & CPU Architecture', type: 'self', status: 'active', progress: 40, color: '#3b82f6' },
  { code: 'Rust', name: 'Systems Programming in Rust', type: 'self', status: 'active', progress: 55, color: '#34d399' },
  { code: 'Embed', name: 'Embedded Systems (ESP32-S3)', type: 'self', status: 'active', progress: 78, color: '#22d3ee' },
  { code: 'COMPILER', name: 'Compiler Design & LLVM', type: 'self', status: 'exploring', progress: 25, color: '#8b5cf6' },
  { code: 'OS', name: 'Operating Systems (Rucyd OS)', type: 'self', status: 'active', progress: 60, color: '#f59e0b' },
  { code: 'CPU', name: 'CPU Design & Computer Architecture', type: 'self', status: 'exploring', progress: 20, color: '#64748b' },
]

const roadmap = [
  { period: 'NOW', items: ['POSN Computer — competitive programming training', 'CS50x — complete problem sets + final project', 'MIT 6.006 — start algorithms & data structures', 'ESP32-S3 Guitar multi-effect — R&D phase'] },
  { period: 'Q2 2026', items: ['SAT 1600 — consistent practice & mock exams', 'TOEFL 110+ — English proficiency prep', 'Compiler design — build a toy compiler in Rust', 'Rucyd OS — memory safety framework v1 release'] },
  { period: 'Q3 2026', items: ['MIT application prep — essays & portfolio', 'CPU design — Verilog/VHDL CPU simulation', 'Deepen ASM & reverse engineering skills', 'Publish technical blog on embedded systems'] },
  { period: 'Q4 2026', items: ['College applications — MIT EA 🔥', 'Complete Rucyd OS documentation & talks', 'Compiler & OS projects — public releases', 'Prepare for Computer Engineering at MIT'] },
]

function ProgressBar({ course, index, visible }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    if (visible) {
      setW(0)
      const timer = setTimeout(() => setW(course.progress), 100 + index * 60)
      return () => clearTimeout(timer)
    } else { setW(0) }
  }, [visible, course.progress, index])

  const statusColor = course.status === 'active' ? 'text-[#34d399]'
    : course.status === 'next' ? 'text-[#f59e0b]'
    : 'text-[#64748b]'

  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#f1f5f9]">{course.code}</span>
          <span className={`text-[10px] font-mono ${statusColor}`}>[{course.status.toUpperCase()}]</span>
        </span>
        <span className="text-[10px] font-mono text-[#475569]">{course.progress}%</span>
      </div>
      <p className="text-[10px] font-mono text-[#64748b] mb-1.5">{course.name}</p>
      <div className="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-[1000ms] ease-out"
          style={{ width: `${w}%`, backgroundColor: course.color }}
        />
      </div>
    </div>
  )
}

export default function Learning() {
  const [ref, visible] = useOnScreen(0.05)

  return (
    <section id="learning" className="py-28 bg-[#080c14] border-t border-[#1e293b]">
      <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs text-[#64748b] font-mono mb-2 tracking-widest">
            <span className="text-[#f59e0b]">//</span> goals_roadmap
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-12 font-mono">
            engineer<span className="text-[#f59e0b]">_</span>in<span className="text-[#f59e0b]">_</span>progress
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="eng-card p-5"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e293b]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
              </div>
              <span className="text-xs text-[#475569] font-mono ml-2">current — learning track</span>
            </div>

            <p className="text-xs text-[#64748b] font-mono mb-4">
              <span className="text-[#34d399]">$</span> ./track --status=active
            </p>

            <div className="space-y-4">
              {courses.map((c, i) => (
                <ProgressBar key={c.code} course={c} index={i} visible={visible} />
              ))}
            </div>

            <p className="text-xs text-[#64748b] mt-4 pt-3 border-t border-[#1e293b] font-mono">
              <span className="text-[#34d399]">✔</span>{' '}
              {courses.filter(c => c.status === 'active').length} active ·{' '}
              {courses.filter(c => c.status === 'exploring').length} exploring
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="eng-card p-5"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e293b]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
              </div>
              <span className="text-xs text-[#475569] font-mono ml-2">goals — mit_2026</span>
            </div>

            <p className="text-xs text-[#64748b] font-mono mb-4">
              <span className="text-[#34d399]">$</span> cat goals.json
            </p>

            <div className="relative">
              <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-[#1e293b]" />
              <div className="space-y-5">
                {roadmap.map((q, i) => (
                  <motion.div
                    key={q.period}
                    initial={{ opacity: 0, x: -10 }}
                    animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="relative pl-6"
                  >
                    <div className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 border-[#f59e0b] bg-[#080c14] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                    </div>
                    <p className="text-xs font-mono text-[#f59e0b] mb-1.5">{q.period}</p>
                    <div className="space-y-0.5">
                      {q.items.map((item) => (
                        <p key={item} className="text-[11px] font-mono text-[#64748b]">
                          <span className="text-[#475569]">→</span> {item}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="text-xs text-[#64748b] mt-4 pt-3 border-t border-[#1e293b] font-mono">
              <span className="text-[#f59e0b]">★</span> POSN Computer · SAT 1600 · TOEFL 110+ · MIT
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
