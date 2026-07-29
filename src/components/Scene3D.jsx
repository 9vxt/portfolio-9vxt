import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import WasmTerrain from './WasmTerrain'

let frame = 0

const vertexShader = `
uniform float uTime;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vFresnel;

void main() {
  vec3 pos = position;
  float n = sin(pos.x*4.0+uTime)*cos(pos.y*4.0+uTime*0.7)*sin(pos.z*4.0+uTime*1.3);
  pos += normal * n * 0.06 * uIntensity;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vPosition = mv.xyz;
  vec3 v = normalize(-mv.xyz);
  vFresnel = 1.0 - max(abs(dot(v, normalize(normalMatrix * normal))), 0.0);
  gl_Position = projectionMatrix * mv;
}`

const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vFresnel;

void main() {
  vec3 col = mix(uColor1, uColor2, vFresnel);
  col += vec3(0.1, 0.5, 0.8) * pow(vFresnel, 2.0) * 0.6;
  float a = 0.15 + vFresnel * 0.35;
  gl_FragColor = vec4(col, a);
}`

function IcosahedronShader({ active }) {
  const meshRef = useRef()
  const matRef = useRef()
  const rotRef = useRef(0)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 0 },
    uColor1: { value: new THREE.Color('#3b82f6') },
    uColor2: { value: new THREE.Color('#22d3ee') },
  }), [])

  useFrame((st) => {
    if (!active) return
    frame++
    if (frame % 2 !== 0) return
    const t = st.clock.elapsedTime
    uniforms.uTime.value = t
    uniforms.uIntensity.value += ((active ? 1 : 0) - uniforms.uIntensity.value) * 0.05
    rotRef.current += 0.005
    meshRef.current.rotation.x = rotRef.current
    meshRef.current.rotation.y = rotRef.current * 1.3
  })

  return (
    <group position={[0, 0.4, 0]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <shaderMaterial ref={matRef} uniforms={uniforms} vertexShader={vertexShader}
          fragmentShader={fragmentShader} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh scale={1.25}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.02} />
      </mesh>
    </group>
  )
}

function TorusSpiral() {
  const ref = useRef()
  const count = 18
  const { geo } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pts = new Float32Array(count * 3)
    const c = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const th = (i / count) * Math.PI * 2
      const r = 2.0 + Math.sin(th * 3) * 0.3
      pts[i*3] = Math.cos(th) * r
      pts[i*3+1] = Math.sin(th * 2) * 0.4
      pts[i*3+2] = Math.sin(th) * r
      const cl = new THREE.Color().setHSL(0.58 + i * 0.02, 0.8, 0.5)
      c[i*3] = cl.r; c[i*3+1] = cl.g; c[i*3+2] = cl.b
    }
    g.setAttribute('position', new THREE.BufferAttribute(pts, 3))
    g.setAttribute('color', new THREE.BufferAttribute(c, 3))
    return { geo: g, cols: c }
  }, [])

  useFrame((st) => {
    if (frame % 3 !== 0) return
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!ref.current) return
    ref.current.rotation.x += 0.003 + mx * 0.001
    ref.current.rotation.y += 0.005 + my * 0.001
    ref.current.rotation.z = Math.sin(st.clock.elapsedTime * 0.1) * 0.04
  })

  return (
    <line ref={ref} position={[0, 0.4, 0]}>
      <primitive object={geo} />
      <lineBasicMaterial vertexColors transparent opacity={0.2} />
    </line>
  )
}

function FloatGeo({ geom, pos, color, speed = 1, mf = 1, wire = true }) {
  const ref = useRef()
  const off = useMemo(() => Math.random() * Math.PI * 2, [])
  useFrame((st) => {
    if (frame % 2 !== 0 && !wire) return
    const t = st.clock.elapsedTime
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!ref.current) return
    ref.current.position.x = pos.x + mx * 0.3 * mf + Math.sin(t * 0.3 * speed + off) * 0.35
    ref.current.position.y = pos.y + my * 0.3 * mf + Math.cos(t * 0.4 * speed + off) * 0.35
    ref.current.position.z = pos.z + Math.sin(t * 0.2 * speed + off * 1.5) * 0.25
    ref.current.rotation.x += 0.005 * speed
    ref.current.rotation.y += 0.008 * speed
  })
  return (
    <mesh ref={ref}>
      <primitive object={geom} />
      {wire ? (
        <meshPhysicalMaterial color={color} wireframe transparent opacity={0.2} metalness={0.3} roughness={0.6} />
      ) : (
        <meshPhysicalMaterial color={color} transparent opacity={0.04} metalness={0.6} roughness={0.2} />
      )}
    </mesh>
  )
}

function ShaderParticles() {
  const ref = useRef(); const count = 600
  const data = useMemo(() => {
    const p = new Float32Array(count * 3); const s = new Float32Array(count); const o = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * 5; const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1)
      p[i*3] = r * Math.sin(ph) * Math.cos(th); p[i*3+1] = r * Math.sin(ph) * Math.sin(th); p[i*3+2] = r * Math.cos(ph)
      s[i] = 0.008 + Math.random() * 0.02; o[i] = Math.random() * Math.PI * 2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    g.setAttribute('size', new THREE.BufferAttribute(s, 1))
    g.setAttribute('offset', new THREE.BufferAttribute(o, 1))
    return g
  }, [])

  useFrame(() => {
    if (frame % 3 !== 0) return
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!ref.current) return
    ref.current.rotation.y += 0.001 + mx * 0.0003; ref.current.rotation.x += 0.0005 + my * 0.0003
  })

  return (
    <points ref={ref}>
      <primitive object={data} />
      <pointsMaterial size={0.02} color="#3b82f6" transparent opacity={0.2} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  )
}

function Rings() {
  const gr = useRef()
  const seg = 80
  const data = useMemo(() => [
    { r: 1.6, rx: 0, ry: 0, c: '#3b82f6', o: 0.12 },
    { r: 2.0, rx: Math.PI / 3.5, ry: Math.PI / 5, c: '#22d3ee', o: 0.08 },
    { r: 2.4, rx: Math.PI / 2.2, ry: Math.PI / 3, c: '#8b5cf6', o: 0.06 },
  ].map(c => {
    const pts = new Float32Array((seg + 1) * 3)
    for (let j = 0; j <= seg; j++) { const th = (j / seg) * Math.PI * 2; pts[j*3] = Math.cos(th) * c.r; pts[j*3+1] = Math.sin(th) * c.r; pts[j*3+2] = 0 }
    return { ...c, pts }
  }), [])
  useFrame(() => {
    if (frame % 3 !== 0) return
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!gr.current) return
    gr.current.rotation.x += 0.002 + mx * 0.0008; gr.current.rotation.y += 0.004 + my * 0.0008
  })
  return (
    <group ref={gr} position={[0, 0.4, 0]}>
      {data.map((d, i) => (
        <group key={i} rotation={[d.rx, d.ry, 0]}>
          <lineSegments>
            <bufferGeometry><bufferAttribute attach="attributes-position" count={seg + 1} array={d.pts} itemSize={3} /></bufferGeometry>
            <lineBasicMaterial color={d.c} transparent opacity={d.o} />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}

const POS = [
  new THREE.Vector3(-2.2, 1.8, -0.5), new THREE.Vector3(2.4, -1.6, -0.8),
  new THREE.Vector3(-1.8, -2.0, -1.2), new THREE.Vector3(2.0, 1.4, -1.0),
  new THREE.Vector3(-2.6, 0.6, -1.5), new THREE.Vector3(2.8, 0.4, -1.8),
  new THREE.Vector3(-1.2, 2.4, -1.3),
]
const GEOMS = [
  new THREE.TorusKnotGeometry(0.3, 0.1, 20, 6), new THREE.OctahedronGeometry(0.35),
  new THREE.DodecahedronGeometry(0.3), new THREE.TorusGeometry(0.35, 0.12, 8, 16),
  new THREE.TetrahedronGeometry(0.35), new THREE.ConeGeometry(0.3, 0.5, 6),
  new THREE.BoxGeometry(0.35, 0.35, 0.35),
]
const COLORS = ['#3b82f6', '#22d3ee', '#8b5cf6', '#34d399', '#f59e0b']
const SOLID_P = [new THREE.Vector3(1.6, 2.2, -0.8), new THREE.Vector3(-2.4, -0.8, -1.6), new THREE.Vector3(0.8, -2.4, -1.0)]
const SOLID_G = [new THREE.IcosahedronGeometry(0.25), new THREE.OctahedronGeometry(0.2), new THREE.DodecahedronGeometry(0.2)]

export default function Scene3D({ active = true }) {
  useEffect(() => {
    window._mouseX = 0; window._mouseY = 0
    let raf
    const onMove = (e) => { raf = requestAnimationFrame(() => { window._mouseX = (e.clientX / window.innerWidth) * 2 - 1; window._mouseY = -(e.clientY / window.innerHeight) * 2 + 1 }) }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} />
      <directionalLight position={[-5, -5, -5]} intensity={0.15} color="#3b82f6" />
      <ShaderParticles />
      <IcosahedronShader active={active} />
      <Rings />
      <TorusSpiral />
      <WasmTerrain active={active} />
      {GEOMS.map((g, i) => (<FloatGeo key={i} geom={g} pos={POS[i]} color={COLORS[i % COLORS.length]} speed={0.7 + i * 0.1} mf={0.4 + i * 0.07} />))}
      {SOLID_G.map((g, i) => (<FloatGeo key={`s${i}`} geom={g} pos={SOLID_P[i]} color={COLORS[i + 1]} speed={0.5 + i * 0.1} mf={0.3} wire={false} />))}
    </>
  )
}
