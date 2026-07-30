import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (a) document.documentElement.classList.add('smooth')
})
const removeSmooth = () => document.documentElement.classList.remove('smooth')
document.addEventListener('scroll', removeSmooth, { passive: true })

createRoot(document.getElementById('root')).render(<App />)
