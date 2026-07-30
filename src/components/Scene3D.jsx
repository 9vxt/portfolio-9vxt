import { useRef, useMemo, useEffect, createContext, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import WasmTerrain from './WasmTerrain'

const FrameCtx = createContext({ current: 0 })

const vertexShader = `
uniform float uTime;
uniform float uIntensity;
uniform float uScroll;
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
uniform float uScroll;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vFresnel;

void main() {
  vec3 c1 = mix(uColor1, vec3(0.53, 0.15, 0.96), uScroll);
  vec3 c2 = mix(uColor2, vec3(0.93, 0.51, 0.93), uScroll);
  vec3 col = mix(c1, c2, vFresnel);
  col += vec3(0.1, 0.5, 0.8) * pow(vFresnel, 2.0) * 0.6;
  float a = 0.15 + vFresnel * 0.35;
  gl_FragColor = vec4(col, a);
}`

function IcosahedronShader({ scrollP }) {
  const frameRef = useContext(FrameCtx)
  const meshRef = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 1 },
    uScroll: { value: 0 },
    uColor1: { value: new THREE.Color('#3b82f6') },
    uColor2: { value: new THREE.Color('#22d3ee') },
  }), [])

  useFrame((st) => {
    if (frameRef.current % 2 !== 0) return
    const t = st.clock.elapsedTime
    uniforms.uTime.value = t
    uniforms.uScroll.value += (scrollP - uniforms.uScroll.value) * 0.05
    meshRef.current.rotation.x += 0.003 + scrollP * 0.004
    meshRef.current.rotation.y += 0.005 + scrollP * 0.006
    const s = 1 + scrollP * 0.3
    meshRef.current.scale.setScalar(s)
  })

  return (
    <group position={[0, 0.4 - scrollP * 0.3, 0]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <shaderMaterial uniforms={uniforms} vertexShader={vertexShader}
          fragmentShader={fragmentShader} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh scale={1.25}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.10} />
      </mesh>
    </group>
  )
}

function TorusSpiral({ scrollP }) {
  const frameRef = useContext(FrameCtx)
  const ref = useRef()
  const count = 18
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pts = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const th = (i / count) * Math.PI * 2
      const r = 2.0 + Math.sin(th * 3) * 0.3
      pts[i*3] = Math.cos(th) * r
      pts[i*3+1] = Math.sin(th * 2) * 0.4
      pts[i*3+2] = Math.sin(th) * r
    }
    g.setAttribute('position', new THREE.BufferAttribute(pts, 3))
    return g
  }, [])

  useFrame(() => {
    if (frameRef.current % 3 !== 0) return
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!ref.current) return
    ref.current.rotation.x += 0.003 + mx * 0.001 + scrollP * 0.002
    ref.current.rotation.y += 0.005 + my * 0.001 + scrollP * 0.003
  })

  return <line ref={ref} position={[0, 0.4 - scrollP * 0.3, 0]}>
    <primitive object={geo} />
    <lineBasicMaterial color="#3b82f6" transparent opacity={0.15 + scrollP * 0.1} />
  </line>
}

function FloatGeo({ geom, pos, color, speed = 1, mf = 1, wire = true, scrollP = 0 }) {
  const frameRef = useContext(FrameCtx)
  const ref = useRef()
  const off = useMemo(() => Math.random() * Math.PI * 2, [])
  useFrame((st) => {
    if (frameRef.current % 2 !== 0 && !wire) return
    const t = st.clock.elapsedTime
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!ref.current) return
    const s = scrollP
    ref.current.position.x = pos.x + mx * 0.3 * mf + Math.sin(t * 0.3 * speed + off) * 0.35
    ref.current.position.y = pos.y - s * 1.5 + my * 0.3 * mf + Math.cos(t * 0.4 * speed + off) * 0.35
    ref.current.position.z = pos.z - s * 0.5 + Math.sin(t * 0.2 * speed + off * 1.5) * 0.25
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

function ShaderParticles({ scrollP }) {
  const frameRef = useContext(FrameCtx)
  const ref = useRef(); const count = 600
  const data = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * 5; const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1)
      p[i*3] = r * Math.sin(ph) * Math.cos(th); p[i*3+1] = r * Math.sin(ph) * Math.sin(th); p[i*3+2] = r * Math.cos(ph)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [])

  useFrame(() => {
    if (frameRef.current % 3 !== 0) return
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!ref.current) return
    ref.current.rotation.y += 0.001 + mx * 0.0003 + scrollP * 0.001
    ref.current.rotation.x += 0.0005 + my * 0.0003 + scrollP * 0.0005
  })

  return (
    <points ref={ref}>
      <primitive object={data} />
      <pointsMaterial size={0.02 + scrollP * 0.01} color="#3b82f6" transparent opacity={0.2} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  )
}

function Rings({ scrollP }) {
  const frameRef = useContext(FrameCtx)
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
    if (frameRef.current % 3 !== 0) return
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!gr.current) return
    gr.current.rotation.x += 0.002 + mx * 0.0008 + scrollP * 0.002
    gr.current.rotation.y += 0.004 + my * 0.0008 + scrollP * 0.003
  })
  return (
    <group ref={gr} position={[0, 0.4 - scrollP * 0.3, 0]}>
      {data.map((d, i) => (
        <group key={i} rotation={[d.rx, d.ry, 0]}>
          <line>
            <bufferGeometry><bufferAttribute attach="attributes-position" count={seg + 1} array={d.pts} itemSize={3} /></bufferGeometry>
            <lineBasicMaterial color={d.c} transparent opacity={d.o} />
          </line>
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

function OrbitingShapes() {
  const frameRef = useContext(FrameCtx)
  const groupRef = useRef()
  const items = useMemo(() => {
    const geoTypes = [
      () => new THREE.TorusKnotGeometry(0.08, 0.03, 12, 6),
      () => new THREE.IcosahedronGeometry(0.07),
      () => new THREE.OctahedronGeometry(0.07),
      () => new THREE.TetrahedronGeometry(0.07),
      () => new THREE.DodecahedronGeometry(0.06),
      () => new THREE.TorusGeometry(0.08, 0.03, 8, 12),
    ]
    const arr = []
    for (let i = 0; i < 28; i++) {
      const th = (i / 28) * Math.PI * 2
      const r = 2.2 + Math.sin(i * 0.7) * 0.6
      arr.push({
        base: new THREE.Vector3(Math.cos(th) * r, Math.sin(th * 1.3 + i * 0.2) * 1.2, Math.sin(th) * r * 0.6),
        geo: geoTypes[i % geoTypes.length](),
        color: COLORS[i % COLORS.length],
        speed: 0.25 + Math.random() * 0.35,
        off: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return arr
  }, [])
  useFrame((st) => {
    if (frameRef.current % 2 !== 0) return
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      const item = items[i]
      const t = st.clock.elapsedTime * item.speed
      child.position.x = item.base.x + mx * 0.6 + Math.sin(t + item.off) * 0.15
      child.position.y = item.base.y + my * 0.6 + Math.cos(t * 0.7 + item.off) * 0.15
      child.position.z = item.base.z + Math.sin(t * 0.5 + item.phase) * 0.12
      child.rotation.x += 0.008 * item.speed
      child.rotation.y += 0.012 * item.speed
    })
  })
  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <mesh key={i}>
          <primitive object={item.geo} />
          <meshPhysicalMaterial color={item.color} emissive={item.color} emissiveIntensity={0.1} transparent opacity={0.2} metalness={0.4} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function HelixTube() {
  const frameRef = useContext(FrameCtx)
  const ref = useRef()
  const count = 160
  const positions = useMemo(() => {
    const pts = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 5
      const r = 1.3 + Math.sin(t * 0.3) * 0.15
      pts[i*3] = Math.cos(t) * r
      pts[i*3+1] = (i / count - 0.5) * 3.0
      pts[i*3+2] = Math.sin(t) * r
      cols[i*3] = 0.23 + Math.sin(t) * 0.1; cols[i*3+1] = 0.5 + Math.cos(t * 0.7) * 0.15; cols[i*3+2] = 0.9 + Math.sin(t * 0.5) * 0.1
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pts, 3))
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3))
    return g
  }, [])
  useFrame(() => {
    if (frameRef.current % 2 !== 0) return
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!ref.current) return
    ref.current.rotation.x = my * 0.3
    ref.current.rotation.y += 0.004 + mx * 0.002
  })
  return (
    <line ref={ref} position={[0, 0.3, -0.6]}>
      <primitive object={positions} />
      <lineBasicMaterial vertexColors transparent opacity={0.2} linewidth={2} />
    </line>
  )
}

function InteractiveStars() {
  const frameRef = useContext(FrameCtx)
  const ref = useRef()
  const count = 120
  const data = useMemo(() => {
    const p = new Float32Array(count * 3); const s = new Float32Array(count); const c = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1)
      const r = 1.5 + Math.random() * 3.0
      p[i*3] = r * Math.sin(ph) * Math.cos(th); p[i*3+1] = r * Math.sin(ph) * Math.sin(th); p[i*3+2] = r * Math.cos(ph)
      s[i] = 0.015 + Math.random() * 0.035
      c[i*3] = 0.2 + Math.random() * 0.3; c[i*3+1] = 0.5 + Math.random() * 0.4; c[i*3+2] = 0.8 + Math.random() * 0.2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    g.setAttribute('size', new THREE.BufferAttribute(s, 1))
    g.setAttribute('color', new THREE.BufferAttribute(c, 3))
    return g
  }, [])
  useFrame(() => {
    if (frameRef.current % 3 !== 0) return
    const mx = window._mouseX || 0; const my = window._mouseY || 0
    if (!ref.current) return
    ref.current.rotation.y = mx * 0.4
    ref.current.rotation.x = my * 0.25
    ref.current.position.y = 0.2 + my * 0.2
  })
  return (
    <points ref={ref}>
      <primitive object={data} />
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.35} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  )
}


export default function Scene3D({ scrollP = 0 }) {
  const frameRef = useRef(0)

  useEffect(() => {
    window._mouseX = 0; window._mouseY = 0
    let raf
    const onMove = (e) => { raf = requestAnimationFrame(() => { window._mouseX = (e.clientX / window.innerWidth) * 2 - 1; window._mouseY = -(e.clientY / window.innerHeight) * 2 + 1 }) }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  useFrame(() => { frameRef.current++ })

  return (
    <FrameCtx.Provider value={frameRef}>
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} />
      <directionalLight position={[-5, -5, -5]} intensity={0.15} color="#3b82f6" />
      <ShaderParticles scrollP={scrollP} />
      <IcosahedronShader scrollP={scrollP} />
      <Rings scrollP={scrollP} />
      <TorusSpiral scrollP={scrollP} />
      <HelixTube />
      <OrbitingShapes />
      <InteractiveStars />
      <WasmTerrain scrollP={scrollP} />
      {GEOMS.map((g, i) => (<FloatGeo key={i} geom={g} pos={POS[i]} color={COLORS[i % COLORS.length]} speed={0.7 + i * 0.1} mf={0.4 + i * 0.07} scrollP={scrollP} />))}
      {SOLID_G.map((g, i) => (<FloatGeo key={`s${i}`} geom={g} pos={SOLID_P[i]} color={COLORS[i + 1]} speed={0.5 + i * 0.1} mf={0.3} wire={false} scrollP={scrollP} />))}
    </FrameCtx.Provider>
  )
}
