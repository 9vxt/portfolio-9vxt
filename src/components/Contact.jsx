import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'

const socials = [
  { label: 'GitHub', user: '@9vxt', href: 'https://github.com/9vxt' },
  { label: 'Instagram', user: '@9vxt_fr', href: 'https://www.instagram.com/9vxt_fr/' },
  { label: 'LinkedIn', user: 'Athibordee Thongboonma', href: 'https://www.linkedin.com/in/athibordee-thongboonma-879194426/' },
  { label: 'Spotify', user: '9vxt', href: 'https://open.spotify.com/user/31k3tzzxmyzsxg6tuwbmpeg43znq' },
]

export default function Contact() {
  const [ref, visible] = useOnScreen(0.1)

  return (
    <section id="contact" className="py-24 bg-[#080c14] border-t border-[#1e293b]">
      <div ref={ref} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-xs text-[#64748b] font-mono mb-2 tracking-widest"><span className="text-[#34d399]">//</span> reach_out</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-3 font-mono">contact<span className="text-[#34d399]">_</span>me</h2>
          <p className="text-xs font-mono text-[#64748b]">
            No backend — email me directly at{' '}
            <a href="mailto:9vxt.fr@gmail.com" className="text-[#3b82f6] hover:underline">9vxt.fr@gmail.com</a>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="eng-card p-6 max-w-lg mx-auto"
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e293b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
            <span className="text-xs text-[#475569] font-mono ml-2">social_links</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-[#0a0e17] border border-[#1e293b] hover:border-[#3b82f6]/50 transition-all group rounded">
                <span className="text-xs text-[#3b82f6] font-mono">&gt;</span>
                <div>
                  <p className="text-xs font-mono text-[#f1f5f9] group-hover:text-[#3b82f6] transition-colors">{s.label}</p>
                  <p className="text-[10px] font-mono text-[#475569]">{s.user}</p>
                </div>
                <span className="ml-auto text-[10px] text-[#475569] group-hover:text-[#3b82f6] transition-colors">↗</span>
              </a>
            ))}
            <a href="mailto:9vxt.fr@gmail.com"
              className="sm:col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-[#3b82f6]/10 border border-[#3b82f6]/30 hover:bg-[#3b82f6]/20 transition-all group rounded">
              <span className="text-xs font-mono text-[#3b82f6]">$</span>
              <span className="text-xs font-mono text-[#f1f5f9] group-hover:text-[#3b82f6] transition-colors">9vxt.fr@gmail.com</span>
              <span className="text-[10px] text-[#475569] group-hover:text-[#3b82f6] transition-colors">↗</span>
            </a>
          </div>
          <p className="text-[10px] font-mono text-[#475569] text-center mt-4 pt-3 border-t border-[#1e293b]">
            Response time: <span className="text-[#34d399]">&lt; 48h</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
