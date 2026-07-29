import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

const projects = [
  {
    title: 'ZetaDB',
    desc: 'Embedded key-value storage engine written in Rust with LSM-tree architecture, WAL recovery, and ACID transactions. Benchmarked at 50k writes/sec.',
    tags: ['Rust', 'LSM-Tree', 'Storage', 'CLI'],
    lang: 'Rust',
    star: '★',
    accent: 'border-[#22d3ee] hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]',
    badge: 'bg-[#22d3ee]/10 text-[#22d3ee]',
  },
  {
    title: 'CypherVM',
    desc: 'A lightweight stack-based virtual machine written in C++ with a custom bytecode format, JIT compilation via LLVM, and a minimal runtime for embedded systems.',
    tags: ['C++', 'LLVM', 'VM', 'JIT'],
    lang: 'C++',
    star: '★',
    accent: 'border-[#3b82f6] hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    badge: 'bg-[#3b82f6]/10 text-[#3b82f6]',
  },
  {
    title: 'PyTorch Ray',
    desc: 'GPU-accelerated ray tracer implemented in Python with CUDA kernels, BVH acceleration, and support for PBR materials. Renders at 4K resolution.',
    tags: ['Python', 'CUDA', 'Graphics', 'GPU'],
    lang: 'Python',
    star: '★',
    accent: 'border-[#f59e0b] hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]',
    badge: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  },
  {
    title: 'NeXus Engine',
    desc: 'Real-time collaborative 3D editor with CRDT-based conflict resolution, WebRTC P2P networking, and a Three.js-powered viewport. Think Figma for 3D.',
    tags: ['TypeScript', 'Three.js', 'WebRTC', 'React'],
    lang: 'TypeScript',
    star: '★',
    accent: 'border-[#8b5cf6] hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]',
    badge: 'bg-[#8b5cf6]/10 text-[#8b5cf6]',
  },
  {
    title: 'AetherOS',
    desc: 'A toy Unix-like kernel for x86-64 with a custom bootloader, interrupt handling, virtual memory paging, and a simple FAT32 filesystem driver.',
    tags: ['C', 'Assembly', 'x86', 'OS Dev'],
    lang: 'C',
    star: '★',
    accent: 'border-[#34d399] hover:shadow-[0_0_20px_rgba(52,211,153,0.1)]',
    badge: 'bg-[#34d399]/10 text-[#34d399]',
  },
  {
    title: 'Protocol Zero',
    desc: 'Automated security auditor for Ethereum smart contracts using symbolic execution via Z3 SMT solver. Detects reentrancy, overflow, and access control bugs.',
    tags: ['Rust', 'Solidity', 'SMT', 'CLI'],
    lang: 'Rust',
    star: '★',
    accent: 'border-[#ef4444] hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]',
    badge: 'bg-[#ef4444]/10 text-[#ef4444]',
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
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  )
}
