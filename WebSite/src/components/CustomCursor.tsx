'use client'
import { useEffect } from 'react'

export default function CustomCursor() {
  useEffect(() => {
    const dot  = document.getElementById('cursor-dot')
    const ring = document.getElementById('cursor-ring')
    if (!dot || !ring) return

    let rx = 0, ry = 0, mx = 0, my = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      dot.style.left = mx + 'px'
      dot.style.top  = my + 'px'

      const trail = document.createElement('div')
      trail.className = 'cursor-trail'
      const s = Math.random() * 4 + 3
      trail.style.cssText = `width:${s}px;height:${s}px;left:${mx}px;top:${my}px`
      document.body.appendChild(trail)
      setTimeout(() => trail.remove(), 500)
    }

    const onDown = () => dot.classList.add('clicking')
    const onUp   = () => dot.classList.remove('clicking')

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup',   onUp)

    const loop = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      ring.style.left = rx + 'px'
      ring.style.top  = ry + 'px'
      requestAnimationFrame(loop)
    }
    loop()

    const addHover = () => {
      document.querySelectorAll('a, button, label, .period-btn, .faq-question').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovering'))
        el.addEventListener('mouseleave', () => ring.classList.remove('hovering'))
      })
    }
    addHover()

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup',   onUp)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot"  id="cursor-dot" />
      <div className="cursor-ring" id="cursor-ring" />
    </>
  )
}
