import { useEffect } from 'react'

const titles = [
  'Athibordee · Portfolio',
  '>_ Athibordee',
  '9vxt · dev',
  'Gust · portfolio',
  'Athibordee Thongboonma',
]

export default function DynamicTitle() {
  useEffect(() => {
    let i = 0; let dir = 1
    const id = setInterval(() => {
      document.title = titles[i % titles.length]
      i++
    }, 3000)
    const handleVis = () => {
      if (document.hidden) document.title = '💤 away · Athibordee'
      else document.title = titles[0]
    }
    document.addEventListener('visibilitychange', handleVis)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', handleVis) }
  }, [])
  return null
}
