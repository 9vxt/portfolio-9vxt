import useOnScreen from '../hooks/useOnScreen'
import { motion } from 'framer-motion'
import { useState } from 'react'

const socials = [
  { label: 'GitHub', user: '@athibordee', href: '#', icon: '#' },
  { label: 'LinkedIn', user: 'in/athibordee', href: '#', icon: '#' },
  { label: 'Instagram', user: '@athibordee', href: '#', icon: '#' },
  { label: 'Email', user: 'athibordee.t@example.com', href: '#', icon: '@' },
  { label: 'Twitter / X', user: '@athibordee', href: '#', icon: '#' },
]

export default function Contact() {
  const [ref, visible] = useOnScreen(0.1)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  return (
    <section id="contact" className="py-28 bg-[#080c14] border-t border-[#1e293b]">
      <div ref={ref} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs text-[#64748b] font-mono mb-2 tracking-widest">
            <span className="text-[#34d399]">//</span> reach_out
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-12 font-mono">
            contact<span className="text-[#34d399]">_</span>me
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-3">
            {submitted ? (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="eng-card p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#34d399]/10 border border-[#34d399]/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#34d399] text-xl">✓</span>
                </div>
                <h3 className="text-sm font-mono text-[#f1f5f9] mb-2">Message Sent</h3>
                <p className="text-xs font-mono text-[#94a3b8] mb-1">Status: <span className="text-[#34d399]">200 OK</span></p>
                <p className="text-xs font-mono text-[#64748b]">I'll respond within 24-48 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  className="mt-4 text-xs font-mono text-[#3b82f6] hover:text-[#f1f5f9] transition-colors underline underline-offset-4">
                  send another
                </button>
              </motion.div>
            ) : (
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
                  <span className="text-xs text-[#475569] font-mono ml-2">message_form</span>
                </div>

                <form onSubmit={submit} className="space-y-4 font-mono">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-[#64748b] mb-1">
                        <span className="text-[#3b82f6]">❯</span> name
                      </label>
                      <div className="flex">
                        <span className="text-[#475569] text-xs bg-[#0a0e17] border border-r-0 border-[#1e293b] px-2 py-2.5 flex items-center">$</span>
                        <input type="text" value={form.name} onChange={set('name')} required
                          className="flex-1 bg-[#0a0e17] border border-[#1e293b] px-3 py-2.5 text-xs text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#3b82f6] transition-colors"
                          placeholder="your name" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#64748b] mb-1">
                        <span className="text-[#3b82f6]">❯</span> email
                      </label>
                      <div className="flex">
                        <span className="text-[#475569] text-xs bg-[#0a0e17] border border-r-0 border-[#1e293b] px-2 py-2.5 flex items-center">$</span>
                        <input type="email" value={form.email} onChange={set('email')} required
                          className="flex-1 bg-[#0a0e17] border border-[#1e293b] px-3 py-2.5 text-xs text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#3b82f6] transition-colors"
                          placeholder="your@email.com" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#64748b] mb-1">
                      <span className="text-[#3b82f6]">❯</span> subject
                    </label>
                    <div className="flex">
                      <span className="text-[#475569] text-xs bg-[#0a0e17] border border-r-0 border-[#1e293b] px-2 py-2.5 flex items-center">$</span>
                      <input type="text" value={form.subject} onChange={set('subject')} required
                        className="flex-1 bg-[#0a0e17] border border-[#1e293b] px-3 py-2.5 text-xs text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#3b82f6] transition-colors"
                        placeholder="what's this about?" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#64748b] mb-1">
                      <span className="text-[#3b82f6]">❯</span> message
                    </label>
                    <div className="flex">
                      <span className="text-[#475569] text-xs bg-[#0a0e17] border border-r-0 border-[#1e293b] px-2 py-2.5 flex items-start">$</span>
                      <textarea rows={4} value={form.message} onChange={set('message')} required
                        className="flex-1 bg-[#0a0e17] border border-[#1e293b] px-3 py-2.5 text-xs text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#3b82f6] transition-colors resize-none"
                        placeholder="your message..." />
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full py-2.5 bg-[#3b82f6] text-[#080c14] text-xs font-semibold font-mono hover:bg-[#2563eb] transition-all rounded-sm eng-glow-blue">
                    <span className="text-[#080c14]/60">$</span> send_message
                  </button>
                </form>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
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
                <span className="text-xs text-[#475569] font-mono ml-2">socials</span>
              </div>

              <div className="space-y-2">
                {socials.map((s) => (
                  <a key={s.label} href={s.href}
                    className="flex items-center gap-3 px-3 py-2.5 bg-[#0a0e17] border border-[#1e293b] hover:border-[#3b82f6]/50 transition-all group">
                    <span className="w-7 h-7 rounded border border-[#1e293b] flex items-center justify-center text-xs text-[#475569] group-hover:text-[#3b82f6] group-hover:border-[#3b82f6] transition-all">
                      {s.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-[#f1f5f9] group-hover:text-[#3b82f6] transition-colors truncate">{s.label}</p>
                      <p className="text-[10px] font-mono text-[#475569] truncate">{s.user}</p>
                    </div>
                    <span className="text-[10px] text-[#475569] group-hover:text-[#3b82f6] transition-colors">↗</span>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="eng-card p-5"
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1e293b]">
                <span className="text-[10px] text-[#475569] font-mono">quick_response</span>
              </div>
              <div className="text-center py-3">
                <p className="text-xs font-mono text-[#94a3b8]">
                  Response time:{' '}
                  <span className="text-[#34d399]">&lt; 48h</span>
                </p>
                <p className="text-[10px] font-mono text-[#475569] mt-1">
                  I typically reply within 24 hours
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
