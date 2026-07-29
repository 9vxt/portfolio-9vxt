/* eslint-disable react-refresh/only-export-components */
import { useCallback, useState } from 'react'

let ctx = null
let masterGain = null
let droneNodes = []
let melodyInterval = null
let _enabled = false

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
  const c = getCtx(); const g = masterGain
  const freqs = [55, 82.5, 110, 165]
  droneNodes = freqs.map((f, i) => {
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = f
    const gain = c.createGain()
    gain.gain.value = 0.02 + (i === 0 ? 0.04 : 0)
    osc.connect(gain); gain.connect(g); osc.start()
    return { osc, gain }
  })
  const lfo = c.createOscillator()
  lfo.frequency.value = 0.06
  const lfoG = c.createGain()
  lfoG.gain.value = 2
  lfo.connect(lfoG); lfoG.connect(droneNodes[0].gain.gain); lfo.start()
  droneNodes.push({ osc: lfo, gain: lfoG })
}

function stopDrone() {
  droneNodes.forEach((n) => { try { n.osc.stop() } catch {} })
  droneNodes = []
}

function startMelody() {
  stopMelody()
  const notes = [262, 330, 392, 523, 659, 784, 1047, 784, 659, 523, 392, 330]
  let i = 0
  melodyInterval = setInterval(() => {
    if (!_enabled) return
    try {
      const c = getCtx()
      const osc = c.createOscillator(); const g = c.createGain()
      osc.type = 'triangle'
      osc.frequency.value = notes[i % notes.length]
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.015, c.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35)
      osc.connect(g); g.connect(masterGain); osc.start(); osc.stop(c.currentTime + 0.35)
      i++
    } catch {}
  }, 400)
}

function stopMelody() {
  if (melodyInterval) { clearInterval(melodyInterval); melodyInterval = null }
}

export function enableSound() {
  if (_enabled) return
  _enabled = true
  getCtx(); startDrone(); startMelody()
}

export function disableSound() {
  _enabled = false; stopDrone(); stopMelody()
}

export function toggleSound() {
  if (_enabled) disableSound()
  else enableSound()
  return _enabled
}

export function isSoundEnabled() { return _enabled }

export function playBlip(freq = 800, dur = 0.08, vol = 0.03) {
  if (!_enabled) return
  try {
    const c = getCtx()
    const osc = c.createOscillator(); const g = c.createGain()
    osc.type = 'square'; osc.frequency.value = freq
    g.gain.value = vol; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
    osc.connect(g); g.connect(masterGain); osc.start(); osc.stop(c.currentTime + dur)
  } catch {}
}

export function playCommand() {
  if (!_enabled) return
  try {
    const c = getCtx()
    const osc = c.createOscillator(); const g = c.createGain()
    osc.type = 'triangle'; osc.frequency.value = 600
    g.gain.value = 0.04; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)
    osc.connect(g); g.connect(masterGain); osc.start(); osc.stop(c.currentTime + 0.15)
    const osc2 = c.createOscillator(); const g2 = c.createGain()
    osc2.type = 'triangle'; osc2.frequency.value = 900
    g2.gain.value = 0.02; g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1)
    osc2.connect(g2); g2.connect(masterGain); osc2.start(); osc2.stop(c.currentTime + 0.1)
  } catch {}
}

export function playBoot() {
  if (!_enabled) return
  try {
    const c = getCtx()
    const notes = [262, 330, 392, 523, 659]
    notes.forEach((f, i) => {
      const osc = c.createOscillator(); const g = c.createGain()
      osc.type = 'sine'; osc.frequency.value = f
      g.gain.value = 0.06
      g.gain.setValueAtTime(0, c.currentTime + i * 0.1)
      g.gain.linearRampToValueAtTime(0.06, c.currentTime + i * 0.1 + 0.05)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.1 + 0.3)
      osc.connect(g); g.connect(masterGain); osc.start(c.currentTime + i * 0.1); osc.stop(c.currentTime + i * 0.1 + 0.3)
    })
  } catch {}
}

export function playClick() {
  playBlip(1200, 0.04, 0.015)
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', () => { if (_enabled) playClick() }, { passive: true })
  setTimeout(() => { if (!_enabled) enableSound() }, 5000)
}

export default function SoundToggle() {
  const [on, setOn] = useState(_enabled)

  const toggle = useCallback(() => {
    const v = toggleSound()
    setOn(v)
  }, [])

  return (
    <button onClick={toggle}
      className="fixed bottom-3 left-3 z-[999] flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono transition-all"
      style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(30,41,59,0.8)', backdropFilter: 'blur(4px)', color: on ? '#34d399' : '#475569' }}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {on ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.5l4-3v13l-4-3H4a1 1 0 01-1-1v-5a1 1 0 011-1h2.5z" />
        ) : (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </>
        )}
      </svg>
      <span>{on ? '♫ melody on' : 'off'}</span>
    </button>
  )
}
