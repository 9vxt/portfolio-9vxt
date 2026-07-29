import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

const categories = [
  {
    title: 'systems_programming',
    icon: '⚙',
    skills: [
      { name: 'C++', level: 90, sub: 'C++17/20, embedded, ESP32-S3, bare-metal' },
      { name: 'C', level: 85, sub: 'Memory management, firmware, Linux NoMMU' },
      { name: 'Rust', level: 70, sub: 'Ownership, async, systems programming' },
      { name: 'Assembly', level: 55, sub: 'x86/ARM, registers, reverse engineering' },
    ],
  },
  {
    title: 'full_stack_dev',
    icon: '◈',
    skills: [
      { name: 'TypeScript', level: 75, sub: 'React, Node.js, type systems' },
      { name: 'Python', level: 80, sub: 'Scripting, tooling, MicroPython on ESP32' },
      { name: 'C#', level: 65, sub: 'Game dev, Godot, .NET tooling' },
      { name: 'JavaScript', level: 78, sub: 'Frontend, Canvas API, WebGPU' },
    ],
  },
  {
    title: 'embedded_tools',
    icon: '◆',
    skills: [
      { name: 'ESP32-S3', level: 92, sub: 'Dual-core, GPIO, I2S, SPI, custom firmware' },
      { name: 'Godot', level: 70, sub: 'GDScript, game engine development' },
      { name: 'Blender', level: 60, sub: '3D modeling, rendering' },
      { name: 'AutoCAD', level: 65, sub: 'Technical drawing, hardware design' },
    ],
  },
  {
    title: 'infra_tools',
    icon: '⎔',
    skills: [
      { name: 'Linux CLI', level: 88, sub: 'Arch Linux, shell scripting, system admin' },
      { name: 'Git', level: 85, sub: 'Version control, CI/CD workflows' },
      { name: 'Ghidra / x64dbg', level: 50, sub: 'Reverse engineering, disassembly' },
      { name: 'CMake', level: 75, sub: 'Build systems, cross-compilation toolchains' },
    ],
  },
]

function SkillCard({ cat, index, visible }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="eng-card p-5"
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e293b]">
        <span className="text-base">{cat.icon}</span>
        <span className="text-xs font-mono text-[#22d3ee]">{cat.title}</span>
      </div>
      <div className="space-y-3">
        {cat.skills.map((s, i) => (
          <SkillRow key={s.name} skill={s} index={i} visible={visible} parentIndex={index} />
        ))}
      </div>
    </motion.div>
  )
}

function SkillRow({ skill, index, visible, parentIndex }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    if (visible) {
      setW(0)
      const timer = setTimeout(() => setW(skill.level), 200 + index * 100 + parentIndex * 50)
      return () => clearTimeout(timer)
    } else { setW(0) }
  }, [visible, skill.level, index, parentIndex])

  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-xs font-mono text-[#f1f5f9]">{skill.name}</span>
        <span className="text-[10px] font-mono text-[#475569]">{skill.level}%</span>
      </div>
      <p className="text-[10px] font-mono text-[#475569] mb-1">{skill.sub}</p>
      <div className="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden">
        <div className="h-full bg-[#22d3ee] rounded-full transition-all duration-[1200ms] ease-out" style={{ width: `${w}%` }} />
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'

export default function Skills() {
  const [ref, visible] = useOnScreen(0.05)

  return (
    <section id="skills" className="py-28 bg-[#0a0e17] border-t border-[#1e293b]">
      <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs text-[#64748b] font-mono mb-2 tracking-widest">
            <span className="text-[#22d3ee]">//</span> technical_skills
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-12 font-mono">
            skills<span className="text-[#22d3ee]">_</span>matrix
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="eng-card p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1e293b]">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
            </div>
            <span className="text-xs text-[#475569] font-mono ml-2">skills.sh — comprehensive assessment</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-mono text-[#475569]">
            <span className="text-[#64748b]">$</span> ./assess --all --format=detailed
            <span className="text-[#64748b] ml-2"># 16 modules scanned</span>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <SkillCard key={cat.title} cat={cat} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  )
}
