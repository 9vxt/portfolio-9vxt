import { useState, useEffect } from 'react'
import useOnScreen from '../hooks/useOnScreen'

const CppSource = `extern "C" {

float heightmap[196608];

static float hash(int x, int y) {
  int n = x + y * 57;
  n = (n << 13) ^ n;
  return 1.0 - ((n*(n*n*15731+789221)+1376312589)&0x7fffffff)/1073741824.0;
}

static float fbm(float x, float y) {
  float v=0, a=1, f=1;
  for (int i=0; i<6; i++) { v += a * smooth(x*f, y*f); f*=2.1f; a*=0.48f; }
  return v;
}

void gen_terrain(int w, int h, float t, float s) {
  for (int y=0; y<h; y++)
    for (int x=0; x<w; x++)
      heightmap[y*w+x] = fbm(x/w*s+t*0.08f, y/h*s+t*0.06f)*2-1;
}

float* get_heightmap() { return heightmap; }

int fib(int n) {
  int a=0, b=1;
  for (int i=2; i<=n; i++) { int c=a+b; a=b; b=c; }
  return b;
}

int is_prime(int n) {
  if (n<2) return 0;
  for (int i=3; i*i<=n; i+=2) if (n%i==0) return 0;
  return 1;
}

int count_primes(int n) {
  int c=0;
  for (int i=2; i<=n; i++) { int p=1;
    for (int j=2; j*j<=i; j++) { if (i%j==0) { p=0; break; } } if (p) c++; }
  return c;
}

int factorial(int n) {
  int r=1;
  for (int i=2; i<=n; i++) r*=i;
  return r;
}
}`

let wasmCache = null
let loadErr = null
async function load() {
  if (wasmCache) return wasmCache
  if (loadErr) throw loadErr
  try {
    const res = await fetch('/wasm/portfolio.wasm')
    const { instance } = await WebAssembly.instantiate(await res.arrayBuffer(), {})
    wasmCache = instance.exports
    return wasmCache
  } catch (e) {
    loadErr = e
    throw e
  }
}

function benchJS(type, n) {
  if (type === 'fib') {
    if (n <= 1) return n; let a = 0, b = 1
    for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c }
    return b
  }
  if (type === 'prime') {
    if (n < 2) return 0
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return 0
    return 1
  }
  if (type === 'count') {
    let c = 0
    for (let i = 2; i <= n; i++) { let p = 1; for (let j = 2; j * j <= i; j++) { if (i % j === 0) { p = 0; break } } if (p) c++ }
    return c
  }
  if (type === 'fact') { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r }
}

const tests = [
  { name: 'fib(45)',       wasmFn: 'fib',           arg: 45, jsFn: () => benchJS('fib', 45) },
  { name: 'factorial(20)', wasmFn: 'factorial',     arg: 20, jsFn: () => benchJS('fact', 20) },
  { name: 'is_prime(1e7)', wasmFn: 'is_prime',      arg: 9999991, jsFn: () => benchJS('prime', 9999991) },
  { name: 'count_p(50000)',wasmFn: 'count_primes',  arg: 50000, jsFn: () => benchJS('count', 50000) },
]

export default function WasmDemo() {
  const [ref, visible] = useOnScreen(0.1)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState('')
  const [ready, setReady] = useState(false)
  const [showSource, setShowSource] = useState(false)

  useEffect(() => { let m = true; load().then(() => { if (m) setReady(true) }); return () => { m = false } }, [])

  const run = async () => {
    setLoading(true); setLog(''); setResults(null)
    const w = await load()
    if (!w) { setLog('✖ WASM failed to load'); setLoading(false); return }
    const res = []
    const logLines = []
    for (const t of tests) {
      logLines.push(`Running ${t.name}...`)
      const js0 = performance.now(); const jsR = t.jsFn(); const jsT = performance.now() - js0
      let wsT = 0, wsR = 'err'
      try {
        const ws0 = performance.now()
        wsR = w[t.wasmFn](t.arg)
        wsT = performance.now() - ws0
      } catch (e) { wsT = 0; wsR = 'ERR'; logLines.push(`  ⚠ WASM error: ${e.message}`); continue }
      const spd = wsT > 0 ? jsT / wsT : 0
      const safeWsR = typeof wsR === 'number' && isFinite(wsR) ? wsR : 0
      res.push({ name: t.name, jsT, wsT, spd, jsR, wsR: safeWsR })
      logLines.push(`  JS: ${jsT.toFixed(1)}ms | WASM: ${wsT.toFixed(1)}ms | ${spd.toFixed(1)}x faster`)
    }
    setResults(res)
    logLines.push('', '✔ Benchmarks complete! C++ → WASM running on portfolio.wasm')
    setLog(logLines.join('\n'))
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
            <span className="text-xs text-[#475569] font-mono ml-2">wasm_bench — compiled with clang --target=wasm32</span>
            <span className="ml-auto">{ready ? <span className="text-[10px] text-[#34d399] font-mono">● loaded</span> : <span className="text-[10px] text-[#f59e0b] font-mono">● loading...</span>}</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={run} disabled={loading}
              className="px-4 py-2 bg-[#3b82f6] text-[#080c14] text-xs font-mono font-semibold rounded hover:bg-[#2563eb] transition-all disabled:opacity-40">
              <span className="text-[#080c14]/60">$</span> {loading ? 'running...' : 'run_benchmarks'}
            </button>
            <span className="text-[10px] text-[#475569] font-mono">
              <span className="text-[#64748b]">$</span> cat wasm/portfolio.cpp
            </span>
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
                    <span className="text-[10px] font-mono text-[#34d399]">{r.spd.toFixed(1)}x faster</span>
                  </div>
                  <div className="flex gap-6 text-[10px] font-mono">
                    <div><span className="text-[#475569]">JS: </span><span className="text-[#f59e0b]">{r.jsT.toFixed(1)}ms</span><span className="text-[#475569]"> ({r.jsR})</span></div>
                    <div><span className="text-[#475569]">WASM: </span><span className="text-[#34d399]">{r.wsT.toFixed(1)}ms</span><span className="text-[#475569]"> ({r.wsR})</span></div>
                  </div>
                  <div className="mt-2 w-full h-2 bg-[#1e293b] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#f59e0b] transition-all" style={{ width: `${100 / (1 + r.spd)}%` }} />
                    <div className="h-full bg-[#34d399] transition-all" style={{ width: `${100 * r.spd / (1 + r.spd)}%` }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-[#475569] font-mono mt-0.5"><span>JS</span><span>WASM (C++)</span></div>
                </div>
              ))}
              <p className="text-[10px] text-[#475569] font-mono pt-2 border-t border-[#1e293b]">
                <span className="text-[#34d399]">✔</span> C++ compiled with clang --target=wasm32 -O3 -nostdlib
              </p>
            </div>
          )}
        </div>

        <button onClick={() => setShowSource(!showSource)}
          className="mt-4 w-full py-2 px-4 eng-card text-xs font-mono text-[#64748b] hover:text-[#3b82f6] hover:border-[#3b82f6]/50 transition-all text-center">
          <span className="text-[#475569]">$</span> {showSource ? 'hide' : 'view'} source — wasm/portfolio.cpp <span className="text-[#475569]">(68 lines)</span>
        </button>
        {showSource && (
          <div className="mt-3 eng-card p-4 overflow-auto" style={{ maxHeight: 400 }}>
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#1e293b]">
              <span className="text-[10px] text-[#22d3ee] font-mono">wasm/portfolio.cpp</span>
              <span className="ml-auto text-[9px] text-[#475569] font-mono">clang --target=wasm32 -O3 -nostdlib -Wl,--no-entry -Wl,--export-all</span>
            </div>
            <pre className="text-[11px] font-mono text-[#94a3b8] whitespace-pre-wrap leading-relaxed">{CppSource}</pre>
          </div>
        )}
      </div>
    </section>
  )
}
