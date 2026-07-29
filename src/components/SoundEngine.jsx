/* eslint-disable react-refresh/only-export-components */
import { useCallback, useState } from 'react'

let ctx = null
let masterGain = null
let droneNodes = []
let enabled = false

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.15
    masterGain.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function startDrone() {
  stopDrone()
  const c = getCtx()
  const g = masterGain
  const freqs = [55, 82.5, 110, 165]
  droneNodes = freqs.map((f, i) => {
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = f
    const gain = c.createGain()
    gain.gain.value = 0.04 + (i === 0 ? 0.06 : 0)
    osc.connect(gain)
    gain.connect(g)
    osc.start()
    return { osc, gain }
  })
  // LFO for subtle movement
  const lfo = c.createOscillator()
  lfo.frequency.value = 0.1
  const lfoGain = c.createGain()
  lfoGain.gain.value = 2
  lfo.connect(lfoGain)
  lfoGain.connect(droneNodes[0].gain.gain)
  lfo.start()
  droneNodes.push({ osc: lfo, gain: lfoGain })
}

function stopDrone() {
  droneNodes.forEach((n) => { try { n.osc.stop() } catch {} })
  droneNodes = []
}

export function toggleSound() {
  enabled = !enabled
  if (enabled) { getCtx(); startDrone() }
  else stopDrone()
  return enabled
}

export function isSoundEnabled() { return enabled }

export function playBlip() {
  if (!enabled) return
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'square'
    osc.frequency.value = 800
    g.gain.value = 0.03
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08)
    osc.connect(g)
    g.connect(masterGain)
    osc.start()
    osc.stop(c.currentTime + 0.08)
  } catch {}
}

export function playCommand() {
  if (!enabled) return
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'triangle'
    osc.frequency.value = 600
    g.gain.value = 0.04
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)
    osc.connect(g)
    g.connect(masterGain)
    osc.start()
    osc.stop(c.currentTime + 0.15)
    // Second tone
    const osc2 = c.createOscillator()
    const g2 = c.createGain()
    osc2.type = 'triangle'
    osc2.frequency.value = 900
    g2.gain.value = 0.02
    g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1)
    osc2.connect(g2)
    g2.connect(masterGain)
    osc2.start()
    osc2.stop(c.currentTime + 0.1)
  } catch {}
}

export default function SoundToggle() {
  const [on, setOn] = useState(false)

  const toggle = useCallback(() => {
    const v = toggleSound()
    setOn(v)
    if (v) playBlip()
  }, [])

  return (
    <button onClick={toggle}
      className="fixed bottom-3 left-3 z-[999] flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono transition-all"
      style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(30,41,59,0.8)', backdropFilter: 'blur(4px)', color: on ? '#34d399' : '#475569' }}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {on ? (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.5l4-3v13l-4-3H4a1 1 0 01-1-1v-5a1 1 0 011-1h2.5z" />
          </>
        ) : (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </>
        )}
      </svg>
      <span>{on ? 'sound on' : 'sound off'}</span>
    </button>
  )
}
