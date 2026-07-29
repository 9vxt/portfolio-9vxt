import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search)
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (a) document.documentElement.classList.add('smooth')
})
document.addEventListener('scroll', () => {
  document.documentElement.classList.remove('smooth')
}, { once: true })

createRoot(document.getElementById('root')).render(<App />)
