'use client'
import { useEffect } from 'react'

export default function Security() {
  useEffect(() => {
    const onContext = (e: MouseEvent) => e.preventDefault()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F12') { e.preventDefault(); return }
      if (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) { e.preventDefault(); return }
      if (e.ctrlKey && ['u','U','s','S'].includes(e.key)) { e.preventDefault(); return }
    }
    document.addEventListener('contextmenu', onContext)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('contextmenu', onContext)
      document.removeEventListener('keydown', onKey)
    }
  }, [])
  return null
}
