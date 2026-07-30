import { useEffect, useState, useRef } from 'react'

export default function LoginScreen({ onLogin }) {
  const [text, setText] = useState('')
  const [cursor, setCursor] = useState(true)
  const [ready, setReady] = useState(false)
  const idxRef = useRef(0)
  const line = ' athibordee@9vxt-portfolio'

  useEffect(() => {
    const cursorId = setInterval(() => setCursor(p => !p), 530)
    const typeId = setInterval(() => {
      idxRef.current++
      setText(line.slice(0, idxRef.current))
      if (idxRef.current >= line.length) {
        clearInterval(typeId)
        setReady(true)
      }
    }, 60)
    return () => { clearInterval(cursorId); clearInterval(typeId) }
  }, [])

  useEffect(() => {
    if (!ready) return
    const handler = (e) => { if (e.key === 'Enter') onLogin() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [ready, onLogin])

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#080c14]/70 backdrop-blur-sm">
      <div className="relative z-10 text-center">
        <div className="mb-6">
          <pre className="text-[#3b82f6] text-[8px] sm:text-[10px] leading-tight font-mono whitespace-pre">
{` _  _  __   __   _  _  __    __
/ )( \\/ _\\ (  ) / )( \\/ _\\  / _\\
) __ (/    \\/ --\\\\ \\/ /    \\(  _)
\\_)(_/\\_/\\_/\\____/\\_/\\_\\_/\\_/ \\___/`}
          </pre>
        </div>
        <div className="eng-card px-8 py-6 inline-block">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1e293b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] animate-pulse" />
            <span className="text-[10px] font-mono text-[#64748b]">9vxt-login — secure shell</span>
          </div>
          <div className="font-mono text-left">
            <p className="text-[#94a3b8] text-xs mb-2">archlinux login:</p>
            <p className="text-[#f1f5f9] text-sm">
              <span className="text-[#34d399]">$</span> login{text}
              <span className={`text-[#22d3ee] ${cursor ? 'opacity-100' : 'opacity-0'}`}>▊</span>
            </p>
            {ready && (
              <p className="text-[#64748b] text-[10px] mt-3 animate-fadeIn">
                <span className="text-[#475569]">password: </span>
                <span className="text-[#22d3ee]">········</span>
              </p>
            )}
          </div>
        </div>
        {ready && (
          <p className="text-[10px] font-mono text-[#475569] mt-4 animate-fadeIn">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#1e293b] text-[#3b82f6] border border-[#334155] text-[9px]">Enter</kbd> to continue
          </p>
        )}
      </div>
    </div>
  )
}
