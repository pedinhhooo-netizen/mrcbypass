'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Particles from '@/components/Particles'
import CustomCursor from '@/components/CustomCursor'
import Security from '@/components/Security'
import Image from 'next/image'

// ─── Configuração ───────────────────────────────────────────────────────────
// Troque para o IP/domínio da sua VPS
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

// ─── Tipos ──────────────────────────────────────────────────────────────────
const STEPS = [
  'Initializing MRC core...',
  'Hooking bypass engine...',
  'Bypassing Sysmon driver...',
  'Injecting memory patches...',
  'Bypassing Blackbox scanner...',
  'Clearing trace signatures...',
  'Validating license token...',
  'Access granted — loading panel...',
]
const DELAYS = [320, 480, 560, 420, 500, 380, 440, 300]
const STATUS_TEXTS = ['BYPASS ONLINE','KERNEL ACTIVE','SYSMON BYPASSED','MEMORY CLEAN','UNDETECTED']

interface FeatureState {
  aimHead: boolean
  aimLegit: boolean
  aimScope: boolean
  noRecoil: boolean
  pixelEstendido: boolean
  precision: boolean
  chams: boolean
  loaded: boolean
}
type FeatureKey = keyof FeatureState

const AIMBOT_FEATURES: { key: FeatureKey; label: string; description: string }[] = [
  { key: 'aimHead',  label: 'AimHead',  description: 'Foco automático na cabeça' },
  { key: 'aimLegit', label: 'AimLegit', description: 'Aim suave e discreta' },
  { key: 'aimScope', label: 'AimScope', description: 'Ativa mira com escopo' },
]
const MISC_FEATURES: { key: FeatureKey; label: string; description: string }[] = [
  { key: 'noRecoil',       label: 'No Recoil',      description: 'Recoil completamente removido' },
  { key: 'pixelEstendido', label: 'Pixel Estendido', description: 'Visibilidade ampliada em pixels' },
  { key: 'precision',      label: 'Precision',       description: 'Mira mais precisa e estável' },
]
const CHAMS_FEATURES: { key: FeatureKey; label: string; description: string }[] = [
  { key: 'chams', label: 'Chams', description: 'Visualização de inimigos através dos objetos' },
]

const EMPTY_STATE: FeatureState = {
  aimHead: false, aimLegit: false, aimScope: false,
  noRecoil: false, pixelEstendido: false, precision: false,
  chams: false, loaded: false,
}

// ─── Tela de código ─────────────────────────────────────────────────────────
function CodeScreen({ onConnect }: { onConnect: (code: string) => void }) {
  const [digits, setDigits] = useState(['','','','','',''])
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, val: string) => {
    // Aceita só dígito
    const d = val.replace(/\D/g,'').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    setError('')
    if (d && i < 5) refs.current[i+1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i-1]?.focus()
    }
    if (e.key === 'Enter') handleConnect()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      refs.current[5]?.focus()
    }
  }

  const handleConnect = async () => {
    const code = digits.join('')
    if (code.length < 6) { setError('Digite os 6 dígitos.'); return }
    setLoading(true)
    setError('')
    // Verifica se o código existe via REST antes de abrir WS
    try {
      const res  = await fetch(`${WS_URL.replace('ws://', 'http://').replace('wss://', 'https://')}/check/${code}`)
      const data = await res.json()
      if (!data.valid) {
        setError('Código inválido ou Remote offline.')
        setLoading(false)
        return
      }
    } catch {
      // Se a checagem REST falhar, tenta mesmo assim via WS
    }
    onConnect(code)
  }

  return (
    <div className="code-screen">
      <div className="code-box">
        <div className="code-box-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2>Conectar ao Remote</h2>
        <p>Digite o código de 6 dígitos exibido no console do Remote</p>

        <div className="code-digits" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el }}
              className={`code-digit${d ? ' filled' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && <p className="code-error">{error}</p>}

        <button
          className={`btn-code-connect${loading ? ' loading' : ''}`}
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? 'Conectando...' : 'Conectar'}
        </button>
      </div>
    </div>
  )
}

// ─── Dashboard Principal ─────────────────────────────────────────────────────
export default function DashboardPage() {
  // Fase: 'code' | 'loading' | 'panel'
  const [phase, setPhase]         = useState<'code'|'loading'|'panel'>('code')
  const [loaded, setLoaded]       = useState(false)
  const [loaderOut, setLoaderOut] = useState(false)
  const [stepIdx, setStepIdx]     = useState(-1)
  const [barW, setBarW]           = useState(0)
  const [statusIdx, setStatusIdx] = useState(0)
  const [statusOpacity, setStatusOpacity] = useState(1)
  const [bypassActive, setBypassActive]   = useState(false)
  const [remoteOnline, setRemoteOnline]   = useState(false)
  const [toast, setToast]   = useState({ msg: '', type: 'info', show: false })
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [features, setFeatures]     = useState<FeatureState>(EMPTY_STATE)
  const [connCode, setConnCode]     = useState('')

  const wsRef       = useRef<WebSocket | null>(null)
  const toastTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phaseRef    = useRef<'code'|'loading'|'panel'>('code')

  const showToast = (msg: string, type = 'info') => {
    setToast({ msg, type, show: true })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
  }

  // ── Mantém phaseRef sincronizada ──────────────────────────────────────────
  useEffect(() => { phaseRef.current = phase }, [phase])

  // ── WebSocket ──────────────────────────────────────────────────────────────
  const connect = useCallback((code: string) => {
    setConnCode(code)
    setPhase('loading')

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'client_join', code }))
    }

    ws.onmessage = (evt) => {
      let msg: Record<string, unknown>
      try { msg = JSON.parse(evt.data) } catch { return }

      const type = msg.type as string

      if (type === 'joined') {
        setRemoteOnline(true)
        if (msg.state) {
          const s = msg.state as FeatureState
          setFeatures(s)
          setBypassActive(!!s.loaded)
        }
        // Inicia o loader animado
        runLoader()
        return
      }

      if (type === 'error') {
        showToast((msg.message as string) || 'Erro ao conectar.', 'error')
        setPhase('code')
        ws.close()
        return
      }

      if (type === 'state') {
        const s = msg.state as FeatureState
        setFeatures(s)
        setBypassActive(!!s.loaded)
        return
      }

      if (type === 'remote_disconnected') {
        setRemoteOnline(false)
        showToast('Remote desconectou.', 'error')
        return
      }

      if (type === 'client_connected') return
    }

    ws.onclose = () => {
      setRemoteOnline(false)
      if (phaseRef.current === 'panel') {
        showToast('Conexão perdida. Reconectando...', 'error')
        reconnTimer.current = setTimeout(() => connect(code), 4000)
      } else {
        // Caiu antes de chegar no painel — volta pra tela de código
        setPhase('code')
      }
    }

    ws.onerror = () => {
      showToast('Erro de WebSocket.', 'error')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendWs = (msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }

  // ── Loader animado ─────────────────────────────────────────────────────────
  const runLoader = () => {
    let si = 0
    const run = () => {
      setStepIdx(si)
      setBarW(Math.round((si + 1) / STEPS.length * 100))
      si++
      if (si < STEPS.length) setTimeout(run, DELAYS[si - 1] || 400)
      else setTimeout(() => {
        setLoaderOut(true)
        setTimeout(() => { setLoaded(true); setPhase('panel') }, 650)
      }, 400)
    }
    setTimeout(run, 300)
  }

  // ── Status rotativo ────────────────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      setStatusOpacity(0)
      setTimeout(() => { setStatusIdx(i => (i + 1) % STATUS_TEXTS.length); setStatusOpacity(1) }, 300)
    }, 2500)
    return () => clearInterval(iv)
  }, [])

  // ── Ping ao Render a cada 5min para não dormir ────────────────────────────
  useEffect(() => {
    const API_URL = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001')
      .replace('wss://', 'https://')
      .replace('ws://', 'http://')
    const ping = () => fetch(`${API_URL}/ping`).catch(() => {})
    ping()
    const iv = setInterval(ping, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [])

  // ── Última atualização (GitHub) ────────────────────────────────────────────
  useEffect(() => {
    fetch('https://api.github.com/repos/psicosunncity/havoc/commits?per_page=1')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.[0]?.commit?.committer?.date) {
          const d = new Date(data[0].commit.committer.date)
          setLastUpdate(d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }))
        }
      }).catch(() => {})
  }, [])

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      wsRef.current?.close()
      if (reconnTimer.current) clearTimeout(reconnTimer.current)
    }
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLoad = () => {
    showToast('Enviando comando...', 'info')
    sendWs({ type: 'command', command: 'load' })
    showToast('Comando enviado!', 'success')
  }

  const handleDestroy = () => {
    showToast('Enviando comando de encerramento...', 'info')
    sendWs({ type: 'command', command: 'destruct' })
    setBypassActive(false)
    showToast('Bypass encerrado.', 'info')
  }

  const handleToggleFeature = (key: FeatureKey, label: string, value: boolean) => {
    setFeatures(prev => ({ ...prev, [key]: value }))
    showToast(`${label} ${value ? 'ativado' : 'desativado'}`, 'success')
    sendWs({ type: 'toggle', feature: key, state: value })
  }

  const handleLogout = () => {
    wsRef.current?.close()
    sessionStorage.clear()
    window.location.href = '/login'
  }

  const expires   = new Date('2099-12-31')
  const days      = Math.ceil((expires.getTime() - Date.now()) / 86400000)
  const barPct    = Math.min(100, Math.max(0, days / 365 * 100))

  // ── Render: tela de código ─────────────────────────────────────────────────
  if (phase === 'code') {
    return (
      <>
        <Particles />
        <CustomCursor />
        <Security />
        <div className={`dash-toast ${toast.type}${toast.show ? ' show' : ''}`}>
          <span className="tdot" />{toast.msg}
        </div>
        <CodeScreen onConnect={connect} />
      </>
    )
  }

  // ── Render: loader ─────────────────────────────────────────────────────────
  return (
    <>
      {!loaded && (
        <div className={`dash-loader${loaderOut ? ' out' : ''}`}>
          <Image src="/havoc-logo.png" alt="MRC" width={180} height={80} className="dash-loader-logo" priority />
          <div className="loader-steps">
            {STEPS.map((s, i) => (
              <div key={i} className={`ls${i < stepIdx ? ' done' : i === stepIdx ? ' active' : ''}`}>
                <span className="ls-dot" />{s}
              </div>
            ))}
          </div>
          <div className="dash-bar-wrap"><div className="dash-bar" style={{ width: barW + '%' }} /></div>
        </div>
      )}

      <Particles />
      <CustomCursor />
      <Security />

      <div className={`dash-toast ${toast.type}${toast.show ? ' show' : ''}`}>
        <span className="tdot" />{toast.msg}
      </div>

      <nav className="dash-navbar">
        <Image src="/havoc-logo.png" alt="MRC" width={46} height={46} />
        <div className="nav-status">
          <span className="nav-status-dot" />
          <span className="nav-status-text" style={{ opacity: statusOpacity }}>{STATUS_TEXTS[statusIdx]}</span>
        </div>
        <div className="dash-nav-right">
          <p className="dash-nav-user">Código: <b style={{ letterSpacing: '0.15em', color: '#ffffff' }}>{connCode}</b></p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
            {remoteOnline
              ? <span style={{ color: '#22c55e' }}>● Remote Online</span>
              : <span style={{ color: '#ff4d4d' }}>● Remote Offline</span>}
          </div>
          <button className="btn-out" onClick={handleLogout}>Sair</button>
        </div>
      </nav>

      <main className="dash-main">
        <div className="pg-title">
          <h1><span>MRC</span> Bypass Panel</h1>
          <p>Gerencie suas conexões e operações de bypass</p>
        </div>

        <div className="dash-grid">
          {/* Connection Status */}
          <div className="dash-card">
            <div className="card-head">
              <div className="c-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="#fff"/>
                </svg>
              </div>
              <div className="c-head-text"><h3>Connection Status</h3><p>Status atual do bypass</p></div>
            </div>
            <div className="card-div" />
            <div className="c-row">
              <div className="c-row-left">
                <div className="r-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
                Remote Connection
              </div>
              <div className={remoteOnline ? 'badge-on' : 'badge-off'}><span className="dot" /> {remoteOnline ? 'Online' : 'Offline'}</div>
            </div>
            <div className="c-row">
              <div className="c-row-left">
                <div className="r-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                Bypass Status
              </div>
              <div className={bypassActive ? 'badge-on' : 'badge-off'}><span className="dot" /> {bypassActive ? 'Running' : 'Not Loaded'}</div>
            </div>
            <div className="c-row">
              <div className="c-row-left">
                <div className="r-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                Última Atualização
              </div>
              <span className="info-val" style={{ color:'#ffffff', fontFamily:'Courier New,monospace', fontSize:11 }}>{lastUpdate || '...'}</span>
            </div>
            <div className="c-row">
              <div className="c-row-left">
                <div className="r-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></div>
                Sala / Código
              </div>
              <span className="info-val" style={{ color:'#ffffff', fontFamily:'Courier New,monospace', fontSize:13, letterSpacing:'0.2em' }}>{connCode}</span>
            </div>
          </div>

          {/* Control Center */}
          <div className="dash-card">
            <div className="card-head">
              <div className="c-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
              <div className="c-head-text"><h3>Control Center</h3><p>Carregue e encerre o bypass</p></div>
            </div>
            <div className="card-div" />
            <div className="btn-row">
              <button className={`btn-load${bypassActive ? ' active' : ''}`} onClick={handleLoad}>
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                {bypassActive ? 'Bypass Ativo ✓' : 'Load Bypass'}
              </button>
              <button className="btn-destroy" onClick={handleDestroy}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                Destroy
              </button>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="dash-card dash-card-wide">
            <div className="card-head">
              <div className="c-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l7 7-7 7-7-7 7-7z"/><path d="M5 17l7 5 7-5"/></svg></div>
              <div className="c-head-text"><h3>Feature Toggles</h3><p>Ative / desative controles em tempo real</p></div>
            </div>
            <div className="card-div" />
            <div className="feature-grid">
              <div className="feature-section">
                <div className="feature-header">Aimbot</div>
                {AIMBOT_FEATURES.map(item => (
                  <label key={item.key} className="feature-card">
                    <div><strong>{item.label}</strong><span>{item.description}</span></div>
                    <div className="tog">
                      <input type="checkbox" checked={features[item.key]} onChange={e => handleToggleFeature(item.key, item.label, e.target.checked)} />
                      <span className="tog-sl" />
                    </div>
                  </label>
                ))}
              </div>
              <div className="feature-section">
                <div className="feature-header">Misc</div>
                {MISC_FEATURES.map(item => (
                  <label key={item.key} className="feature-card">
                    <div><strong>{item.label}</strong><span>{item.description}</span></div>
                    <div className="tog">
                      <input type="checkbox" checked={features[item.key]} onChange={e => handleToggleFeature(item.key, item.label, e.target.checked)} />
                      <span className="tog-sl" />
                    </div>
                  </label>
                ))}
              </div>
              <div className="feature-section">
                <div className="feature-header">Chams</div>
                {CHAMS_FEATURES.map(item => (
                  <label key={item.key} className="feature-card">
                    <div><strong>{item.label}</strong><span>{item.description}</span></div>
                    <div className="tog">
                      <input type="checkbox" checked={features[item.key]} onChange={e => handleToggleFeature(item.key, item.label, e.target.checked)} />
                      <span className="tog-sl" />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* License */}
          <div className="dash-card">
            <div className="card-head">
              <div className="c-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
              <div className="c-head-text"><h3>License</h3><p>Informações da sua licença</p></div>
            </div>
            <div className="card-div" />
            <div className="c-row">
              <div className="c-row-left"><div className="r-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>Plano</div>
              <span className="plan-tag remote">Remote</span>
            </div>
            <div className="c-row">
              <div className="c-row-left"><div className="r-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>Expira em</div>
              <span className="info-val">{expires.toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="exp-wrap">
              <div className="exp-labels"><span>Tempo restante</span><span>{days > 0 ? `${days} dias` : 'Expirado'}</span></div>
              <div className="exp-bg"><div className="exp-fill" style={{ width: barPct + '%' }} /></div>
            </div>
          </div>

          {/* Suporte */}
          <div className="dash-card">
            <div className="card-head">
              <div className="c-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
              <div className="c-head-text"><h3>Suporte</h3><p>Precisa de ajuda?</p></div>
            </div>
            <div className="card-div" />
            <div className="c-row">
              <div className="c-row-left"><div className="r-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>Discord</div>
              <a href="https://discord.gg/havocbypass" target="_blank" rel="noreferrer" style={{ fontSize:13, color:'#ffffff', textDecoration:'none', fontWeight:600 }}>discord.gg/havocbypass →</a>
            </div>
          </div>
        </div>
      </main>

      <a href="https://discord.gg/havocbypass" target="_blank" rel="noreferrer" className="disc-float" title="Discord">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
      </a>
    </>
  )
}
