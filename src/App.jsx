import { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Learning from './components/Learning'
import Projects from './components/Projects'
import WasmDemo from './components/WasmDemo'
import WebGPUDemo from './components/WebGPUDemo'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FpsMonitor from './components/FpsMonitor'
import ScrollProgress from './components/ScrollProgress'
import CursorGlow from './components/CursorGlow'
import Scene3D from './components/Scene3D'
import ShowcaseWall from './components/ShowcaseWall'

export default function App() {
  const [scrollP, setScrollP] = useState(0)
  const scrollRaf = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)
      scrollRaf.current = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setScrollP(max > 0 ? window.scrollY / max : 0)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <ErrorBoundary>
      <div className="bg-[#080c14] text-[#f1f5f9] min-h-screen">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }}>
            <Scene3D scrollP={scrollP} />
          </Canvas>
        </div>

        <div className="relative z-10">
          <Navbar />
          <Hero />
          <About />
          <Skills />
          <Learning />
          <Projects />
          <ShowcaseWall />
          <WasmDemo />
          <WebGPUDemo />
          <Contact />
          <Footer />
        </div>

        <FpsMonitor />
        <ScrollProgress />
        <CursorGlow />
      </div>
    </ErrorBoundary>
  )
}
