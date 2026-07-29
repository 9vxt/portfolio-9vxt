import { useState, useEffect, useRef } from 'react'
import useOnScreen from '../hooks/useOnScreen'

let wasmInstance = null

async function loadWasm() {
  if (wasmInstance) return wasmInstance
  try {
    const res = await fetch('./portfolio.wasm')
    const bytes = await res.arrayBuffer()
    const { instance } = await WebAssembly.instantiate(bytes, {})
    wasmInstance = instance.exports
    return wasmInstance
  } catch (e) {
    console.error('WASM load failed:', e)
    return null
  }
}

function jsFib(n) {
  if (n <= 1) return n
  let a = 0, b = 1
  for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c }
  return b
}

function jsCountPrimes(n) {
  let count = 0
  for (let i = 2; i <= n; i++) {
    let prime = 1
    for (let j = 2; j * j <= i; j++) { if (i % j === 0) { prime = 0; break } }
    if (prime) count++
  }
  return count
}

const benchmarks = [
  { name: 'fib(45)', fn: 'fib', arg: 45, jsFn: jsFib, jsArg: 45 },
  { name: 'count_primes(50000)', fn: 'count_primes', arg: 50000, jsFn: jsCountPrimes, jsArg: 50000 },
  { name: 'fib(40)', fn: 'fib', arg: 40, jsFn: jsFib, jsArg: 40 },
  { name: 'count_primes(30000)', fn: 'count_primes', arg: 30000, jsFn: jsCountPrimes, jsArg: 30000 },
]

export default function WasmDemo() {
  const [ref, visible] = useOnScreen(0.1)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [wasmLoaded, setWasmLoaded] = useState(false)
  const [log, setLog] = useState('')

  useEffect(() => {
    loadWasm().then((w) => { if (w) setWasmLoaded(true) })
  }, [])

  const run = async () => {
    setLoading(true)
    setLog('')
    const w = await loadWasm()
    if (!w) { setLog('✖ WASM failed to load'); setLoading(false); return }
    setWasmLoaded(true)

    const res = []
    for (const b of benchmarks) {
      setLog((prev) => prev + `Running ${b.name}...\n`)

      const jsStart = performance.now()
      const jsResult = b.jsFn(b.jsArg)
      const jsTime = performance.now() - jsStart

      const wasmStart = performance.now()
      const wasmResult = w[b.fn](b.arg)
      const wasmTime = performance.now() - wasmStart

      const speedup = jsTime / wasmTime
      res.push({ name: b.name, jsResult, jsTime, wasmResult, wasmTime, speedup })
      setLog((prev) => prev + `  JS: ${jsTime.toFixed(1)}ms | WASM: ${wasmTime.toFixed(1)}ms | ${speedup.toFixed(2)}x faster\n`)
    }
    setResults(res)
    setLog((prev) => prev + '\n✔ C++ → WASM benchmarks complete!\n')
    setLoading(false)
  }

  return (
    <section id="wasm" className="py-24 bg-[#0a0e17] border-t border-[#1e293b]">
      <div ref={ref} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-4 text-center font-mono transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-[#34d399]">//</span> wasm<span className="text-[#34d399]">_</span>bench
        </h2>
        <p className={`text-xs text-[#64748b] text-center mb-8 font-mono transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-[#475569]">$</span> C++ compiled to WebAssembly — benchmark vs JavaScript
        </p>

        <div className={`eng-card p-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e293b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
            <span className="text-xs text-[#475569] font-mono ml-2">wasm_benchmark — C++ compiled with clang</span>
            <span className="ml-auto">
              {wasmLoaded ? <span className="text-[10px] text-[#34d399] font-mono">● loaded</span> : <span className="text-[10px] text-[#f59e0b] font-mono">● loading...</span>}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <button onClick={run} disabled={loading}
              className="px-4 py-2 bg-[#3b82f6] text-[#080c14] text-xs font-mono font-semibold rounded hover:bg-[#2563eb] transition-all disabled:opacity-40">
              <span className="text-[#080c14]/60">$</span> {loading ? 'running...' : 'run_benchmarks'}
            </button>
            {results && (
              <span className="text-[10px] text-[#34d399] font-mono">✔ {results.length} tests complete</span>
            )}
          </div>

          {log && (
            <div className="mb-4 p-3 font-mono text-xs text-[#94a3b8] whitespace-pre-wrap leading-relaxed" style={{ background: '#080c14', border: '1px solid #1e293b', borderRadius: 4, maxHeight: 160, overflow: 'auto' }}>
              {log}
            </div>
          )}

          {results && (
            <div className="space-y-3">
              <p className="text-xs font-mono text-[#64748b]">Results:</p>
              {results.map((r, i) => (
                <div key={i} className="p-3 border border-[#1e293b] rounded" style={{ background: '#080c14' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-[#f1f5f9]">{'> '}{r.name}</span>
                    <span className="text-[10px] font-mono text-[#34d399]">{r.speedup.toFixed(2)}x faster</span>
                  </div>
                  <div className="flex gap-6 text-[10px] font-mono">
                    <div>
                      <span className="text-[#475569]">JS: </span>
                      <span className="text-[#f59e0b]">{r.jsTime.toFixed(1)}ms</span>
                      <span className="text-[#475569]"> (result: {r.jsResult})</span>
                    </div>
                    <div>
                      <span className="text-[#475569]">WASM: </span>
                      <span className="text-[#34d399]">{r.wasmTime.toFixed(1)}ms</span>
                      <span className="text-[#475569]"> (result: {r.wasmResult})</span>
                    </div>
                  </div>
                  <div className="mt-2 w-full h-2 bg-[#1e293b] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#f59e0b] transition-all" style={{ width: `${100 / (1 + r.speedup)}%` }} />
                    <div className="h-full bg-[#34d399] transition-all" style={{ width: `${100 * r.speedup / (1 + r.speedup)}%` }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-[#475569] font-mono mt-0.5">
                    <span>JS time</span>
                    <span>WASM time</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
