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
    const fc = frameCountRef.current++

    // Request new terrain data every 2 frames
    if (fc % 2 === 0) {
      const t = state.clock.elapsedTime * 0.25
      const id = ++reqId; pendingId = id
      getWorker().postMessage({ id, w: W, h: H, t, s: 3.0 })
    }

    // Update mesh vertices every 2 frames (when new data arrives)
    if (fc % 2 === 0 && ready) {
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
    }

    // Update position and rotation EVERY frame for smooth animation
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
        <meshPhysicalMaterial color="#3b82f6" metalness={0.3} roughness={0.7} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={wireRef} geometry={wireGeo}>
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  )
}
