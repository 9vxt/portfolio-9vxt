import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const W = 64; const H = 48
let worker = null
let reqId = 0
let pendingId = -1
let cache = new Float32Array(W * H)

function getWorker() {
  if (!worker) worker = new Worker('/terrain.worker.js')
  return worker
}

export default function WasmTerrain({ scrollP = 0 }) {
  const meshRef = useRef()
  const wireRef = useRef()
  const [ready, setReady] = useState(false)
  const frameCountRef = useRef(0)
  const rotRef = useRef(0)

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(7, 5, W - 1, H - 1)
    g.rotateX(-Math.PI / 2)
    const colors = new Float32Array(g.attributes.position.count * 3)
    for (let i = 0; i < colors.length; i += 3) {
      colors[i] = 0.46; colors[i + 1] = 0.40; colors[i + 2] = 0.06
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [])

  const wireGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(7, 5, W - 1, H - 1)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  function updateColors(pos, colors) {
    const arr = colors.array
    for (let i = 0; i < pos.count; i++) {
      const y = Math.floor(i / W), x = i % W
      const h = cache[y * W + x] * 0.5
      const nh = (h + 0.5)
      let r, g, b
      if (nh < 0.25) {
        r = 0.02; g = 0.04; b = 0.12
      } else if (nh < 0.35) {
        const t = (nh - 0.25) / 0.1
        r = 0.02 + t * 0.44; g = 0.04 + t * 0.36; b = 0.12 + t * (-0.06)
      } else if (nh < 0.55) {
        const t = (nh - 0.35) / 0.2
        r = 0.46 + t * 0.13; g = 0.40 + t * 0.25; b = 0.06 + t * 0.03
      } else if (nh < 0.75) {
        const t = (nh - 0.55) / 0.2
        r = 0.59 + t * (-0.16); g = 0.65 + t * (-0.18); b = 0.09 + t * 0.08
      } else {
        const t = (nh - 0.75) / 0.25
        r = 0.43 + t * 0.42; g = 0.47 + t * 0.38; b = 0.17 + t * 0.63
      }
      arr[i * 3] = r; arr[i * 3 + 1] = g; arr[i * 3 + 2] = b
    }
    colors.needsUpdate = true
  }

  useEffect(() => {
    const w = getWorker(); let mounted = true
    w.onmessage = (e) => {
      if (!mounted) return
      const { id, heights } = e.data
      if (id !== pendingId) return
      cache = new Float32Array(heights)
      if (!ready) setReady(true)
    }
    return () => { mounted = false }
  }, [ready])

  useFrame((state) => {
    const fc = frameCountRef.current++

    if (fc % 2 === 0) {
      const t = state.clock.elapsedTime * 0.25
      const id = ++reqId; pendingId = id
      getWorker().postMessage({ id, w: W, h: H, t, s: 3.0 })
    }

    if (fc % 2 === 0 && ready) {
      const pos = geo.attributes.position
      const colors = geo.attributes.color
      const wpos = wireGeo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const x = i % W; const y = Math.floor(i / W)
        const h = cache[y * W + x] * 0.5
        pos.setY(i, h)
        wpos.setY(i, h)
      }
      pos.needsUpdate = true; wpos.needsUpdate = true
      geo.computeVertexNormals()
      updateColors(pos, colors)
    }

    rotRef.current += 0.004 + scrollP * 0.005
    const yPos = -0.6 - scrollP * 0.8
    if (meshRef.current) {
      meshRef.current.position.y = yPos
      meshRef.current.rotation.y = rotRef.current
    }
    if (wireRef.current) {
      wireRef.current.position.y = yPos
      wireRef.current.rotation.y = rotRef.current
    }
  })

  return (
    <group>
      <mesh ref={meshRef} geometry={geo}>
        <meshPhysicalMaterial vertexColors metalness={0.05} roughness={0.85} flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={wireRef} geometry={wireGeo}>
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.06} />
      </mesh>
    </group>
  )
}
