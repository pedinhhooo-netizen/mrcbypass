'use client'
import { useEffect, useRef, useState } from 'react'
import Particles from '@/components/Particles'
import CustomCursor from '@/components/CustomCursor'
import Security from '@/components/Security'
import Link from 'next/link'

type ToastType = 'info' | 'success' | 'error'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export default function LoginPage() {
  const [license, setLicense]       = useState('')
  const [btnText, setBtnText]       = useState('Login Now')
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [btnSuccess, setBtnSuccess]  = useState(false)
  const [toast, setToast]   = useState({ msg: '', type: 'info' as ToastType, show: false })
  const [shake, setShake]   = useState(false)
  const [glitch, setGlitch] = useState(false)
  const logoRef    = useRef<HTMLImageElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // parallax no logo
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!logoRef.current) return
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy
      logoRef.current.style.transform = `translate(${dx * 14}px,${dy * 9}px) rotate(${dx * 1.5}deg)`
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  const showToast = (msg: string, type: ToastType = 'info') => {
    setToast({ msg, type, show: true })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3200)
  }

  const saveSession = (username: string) => {
    sessionStorage.setItem('mrc_uid',     username)
    sessionStorage.setItem('mrc_user',    username)
    sessionStorage.setItem('mrc_license', license || 'TEST-KEY')
    sessionStorage.setItem('mrc_role',    'user')
    sessionStorage.setItem('mrc_plan',    'remote')
    sessionStorage.setItem('mrc_expires', '2099-12-31')
  }

  const tryLogin = async () => {
    setBtnDisabled(true)
    setBtnText('Access granted ✓')
    setBtnSuccess(true)
    showToast('Welcome!', 'success')
    saveSession(license.trim() || 'TestUser')
    await sleep(600)
    window.location.href = '/dashboard'
  }

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') tryLogin() }

  const toastClass = `toast toast-${toast.type}${toast.show ? ' show' : ''}`

  return (
    <>
      <Particles /><CustomCursor /><Security />

      {/* Toast */}
      <div
        className={toastClass}
        style={{
          position: 'fixed', top: 28, right: 28,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 18px', borderRadius: 10,
          fontSize: 13, fontWeight: 600,
          pointerEvents: 'none', zIndex: 99999,
          transform: toast.show ? 'translateY(0)' : 'translateY(-16px)',
          opacity: toast.show ? 1 : 0,
          transition: 'opacity .3s, transform .3s',
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 5px currentColor', flexShrink: 0 }} />
        {toast.msg}
      </div>

      <div className="login-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={logoRef}
          src="/havoc-logo.png"
          alt="MRC"
          className={`login-logo${glitch ? ' glitch' : ''}`}
          style={{
            width: 210, height: 'auto', marginBottom: 44,
            display: 'block', filter: 'drop-shadow(0 0 28px #ffffff22)',
            transition: 'transform .12s ease-out', willChange: 'transform',
          }}
        />

        <div className={`login-fields${shake ? ' shake' : ''}`} id="login-fields">
          <input
            type="text"
            placeholder="License Key"
            value={license}
            onChange={e => setLicense(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          className={`btn-login${btnSuccess ? ' success' : ''}`}
          disabled={btnDisabled}
          onClick={tryLogin}
        >
          {btnText}
        </button>

        <Link href="/" className="back-link">← Back to site</Link>
      </div>
    </>
  )
}
