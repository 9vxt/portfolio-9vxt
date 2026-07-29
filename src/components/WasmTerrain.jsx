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

export default function WasmTerrain({ active = true }) {
  const meshRef = useRef()
  const wireRef = useRef()
  const [ready, setReady] = useState(false)
  const frameCountRef = useRef(0)

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(7, 5, W - 1, H - 1)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  const wireGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(7, 5, W - 1, H - 1)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

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
    if (!active) return
    frameCountRef.current++
    if (frameCountRef.current % 2 !== 0) return

    const t = state.clock.elapsedTime * 0.25
    const id = ++reqId; pendingId = id
    getWorker().postMessage({ id, w: W, h: H, t, s: 3.0 })

    if (!ready) return
    const pos = geo.attributes.position
    const wpos = wireGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = i % W; const y = Math.floor(i / W)
      const h = cache[y * W + x] * 0.5
      pos.setZ(i, h); pos.setY(i, h)
      wpos.setZ(i, h); wpos.setY(i, h)
    }
    pos.needsUpdate = true; wpos.needsUpdate = true
    geo.computeVertexNormals()

    if (meshRef.current) meshRef.current.rotation.y += 0.004
    if (wireRef.current) wireRef.current.rotation.y = meshRef.current?.rotation.y || 0
  })

  return (
    <group position={[0, -0.6, 0]}>
      <mesh ref={meshRef} geometry={geo}>
        <meshPhysicalMaterial color="#3b82f6" metalness={0.3} roughness={0.7} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={wireRef} geometry={wireGeo}>
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  )
}
