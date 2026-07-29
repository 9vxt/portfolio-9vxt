import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

const projects = [
  {
    title: 'ESP32-S3 Calculator',
    desc: 'Advanced standalone embedded calculator on dual-core ESP32-S3. Custom Chorded Input System for multi-button shortcuts, Hybrid Execution Engine (C++ & MicroPython) for CAS/Non-CAS modes with unlimited custom functions.',
    tags: ['C++', 'Python', 'ESP32-S3', 'Dual-Core', 'MicroPython'],
    lang: 'C++ / Python',
    star: '★',
    accent: 'border-[#22d3ee] hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]',
    badge: 'bg-[#22d3ee]/10 text-[#22d3ee]',
  },
  {
    title: 'Rucyd OS on ESP32-S3',
    desc: 'Lightweight Linux NoMMU framework (<2MB) with custom ASCII TUI. Software-Defined Memory Access Validation via Tagged Object Registry & Gatekeeper API — prevents runtime memory corruption without physical MMU.',
    tags: ['C', 'C++', 'ESP32-S3', 'NoMMU', 'OS Dev', 'Memory Safety'],
    lang: 'C / C++',
    star: '★',
    accent: 'border-[#3b82f6] hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    badge: 'bg-[#3b82f6]/10 text-[#3b82f6]',
  },
  {
    title: 'ESP32-S3 Guitar Multi-Effect',
    desc: 'In R&D phase. Real-time Digital Signal Processing (DSP) on microcontrollers, low-latency audio processing, and hardware circuit interfacing for guitar effects on ESP32-S3.',
    tags: ['C++', 'ESP32-S3', 'DSP', 'Audio', 'I2S'],
    lang: 'C++',
    star: '☆',
    accent: 'border-[#f59e0b] hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]',
    badge: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  },
]

function ProjectCard({ project, index, visible }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`eng-card p-5 border ${project.accent} transition-all hover:-translate-y-1 cursor-default group`}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="w-2 h-2 rounded-full bg-[#34d399]" />
          </div>
          <span className="text-[10px] text-[#475569] font-mono">{project.lang}</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${project.badge} font-mono`}>
          {project.star} featured
        </span>
      </div>

      <h3 className="text-base font-bold text-[#f1f5f9] mb-1.5 font-mono">
        <span className="text-[#475569]">{'> '}</span>{project.title}
      </h3>
      <p className="text-xs text-[#64748b] font-mono leading-relaxed mb-3 min-h-[48px]">{project.desc}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {project.tags.map((t) => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 border border-[#1e293b] text-[#475569] font-mono">
            {t}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-[#1e293b]">
        <a href="#" className="text-[10px] font-mono text-[#475569] hover:text-[#3b82f6] transition-colors group/link">
          <span className="text-[#3b82f6] group-hover/link:mr-0.5 transition-all">❯</span> source
        </a>
        <a href="#" className="text-[10px] font-mono text-[#475569] hover:text-[#3b82f6] transition-colors group/link">
          <span className="text-[#3b82f6] group-hover/link:mr-0.5 transition-all">❯</span> demo
        </a>
        <span className="text-[9px] font-mono text-[#1e293b]">v2.0.1</span>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const [ref, visible] = useOnScreen(0.05)

  return (
    <section id="projects" className="py-28 bg-[#0a0e17] border-t border-[#1e293b]">
      <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs text-[#64748b] font-mono mb-2 tracking-widest">
            <span className="text-[#8b5cf6]">//</span> featured_work
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-12 font-mono">
            projects<span className="text-[#8b5cf6]">_</span>
          </h2>
        </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <p className="text-[11px] font-mono text-[#64748b] col-span-full -mt-8 mb-2">
              <span className="text-[#34d399]">$</span> ls -la /projects/
              <span className="text-[#475569] ml-2"># 3 entries</span>
            </p>
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  )
}
