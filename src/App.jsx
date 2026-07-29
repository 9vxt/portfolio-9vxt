import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Learning from './components/Learning'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <ErrorBoundary>
      <div className="bg-[#080c14] text-[#f1f5f9] min-h-screen">
        <Navbar />
        <Hero />
        <About />
        <Skills />
        <Learning />
        <Projects />
        <Contact />
        <Footer />
      </div>
    </ErrorBoundary>
  )
}
