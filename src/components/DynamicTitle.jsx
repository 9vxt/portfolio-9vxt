import { useEffect } from 'react'

const titles = [
  '9vxt · dev',
  '>_ dev',
  'dev 9vxt · Portfolio',
  'Gust · portfolio',
  '9vxt',
]

export default function DynamicTitle() {
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      document.title = titles[i % titles.length]
      i++
    }, 3000)
    const handleVis = () => {
      if (document.hidden) document.title = '💤 away · 9vxt'
      else document.title = titles[0]
    }
    document.addEventListener('visibilitychange', handleVis)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', handleVis) }
  }, [])
  return null
}
