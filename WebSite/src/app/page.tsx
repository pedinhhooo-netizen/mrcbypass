'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Particles from '@/components/Particles'
import CustomCursor from '@/components/CustomCursor'
import Security from '@/components/Security'

/* ── LOADER ── */
function Loader() {
  useEffect(() => {
    const loader  = document.getElementById('loader')
    const bar     = document.querySelector('.loader-bar') as HTMLElement
    if (!loader || !bar) return
    let progress = 0
    const iv = setInterval(() => {
      progress += Math.random() * 18 + 6
      if (progress >= 100) {
        progress = 100; clearInterval(iv)
        setTimeout(() => {
          loader.classList.add('loader-out')
          setTimeout(() => { loader.style.display = 'none' }, 600)
        }, 300)
      }
      bar.style.width = progress + '%'
    }, 120)
  }, [])
  return (
    <div id="loader">
      <div className="loader-content">
        <Image src="/havoc-logo.png" alt="MRC" width={220} height={100} className="loader-logo" priority />
        <div className="loader-bar-wrap"><div className="loader-bar" /></div>
        <p className="loader-text">Carregando...</p>
      </div>
    </div>
  )
}

/* ── NAVBAR ── */
function Navbar() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const onScroll = () => {
      const bar = document.getElementById('scroll-progress')
      if (bar) bar.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%'
      sections.forEach(sec => {
        if (window.scrollY >= (sec as HTMLElement).offsetTop - 120) setActive(sec.id)
      })
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = ['home','showcase','features','products','faq']
  return (
    <>
      <div id="scroll-progress" />
      <nav className="navbar">
        <div className="nav-logo">
          <Image src="/havoc-logo.png" alt="MRC" width={52} height={52} className="nav-logo-img" />
        </div>
        <ul className="nav-links">
          {links.map(l => (
            <li key={l}><a href={`#${l}`} className={active === l ? 'nav-active' : ''}>{l.charAt(0).toUpperCase()+l.slice(1)}</a></li>
          ))}
        </ul>
        <div className="nav-actions">
          <Link href="/login" className="btn-dashboard">Dashboard</Link>
          <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>
      <nav className={`nav-mobile${open ? ' open' : ''}`}>
        {links.map(l => <a key={l} href={`#${l}`} onClick={() => setOpen(false)}>{l.charAt(0).toUpperCase()+l.slice(1)}</a>)}
      </nav>
    </>
  )
}

/* ── HERO ── */
function Hero() {
  const logoRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!logoRef.current) return
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy
      logoRef.current.style.transform = `translate(${dx*18}px,${dy*12}px) rotate(${dx*2}deg)`
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const h1 = document.querySelector('.hero-content h1') as HTMLElement
    if (!h1) return
    const iv = setInterval(() => {
      h1.classList.add('glitch')
      setTimeout(() => h1.classList.remove('glitch'), 150)
    }, 4000)
    return () => clearInterval(iv)
  }, [])

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={logoRef} src="/havoc-logo.png" alt="MRC" className="hero-logo" />
        <h1 data-text="no logs. no traces. no cheat.">
          <span className="pink">no logs.</span> no traces. no cheat.
        </h1>
        <div className="hero-tags">
          {['FREEFIRE PRIVATE','FREEFIRE REMOTE','FREEFIRE INTERNAL','FREEFIRE EXTERNAL','Melhor Custo Beneficio','Suporte 24/7'].map(t => <span key={t}>{t}</span>)}
        </div>
      </div>
      <div className="hero-cards">
        <div className="hero-card">
          <div className="hero-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg></div>
          <h3>Atualizado Toda Semana</h3>
          <p>Patches silenciosos a cada update do anti-cheat. Sempre um passo a frente dos scanners.</p>
        </div>
        <a href="https://discord.gg/havocbypass" target="_blank" rel="noreferrer" className="hero-card hero-card--discord">
          <div className="hero-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg></div>
          <h3>Suporte 24/7 Discord</h3>
          <p>Atendimento rapido a qualquer hora. Entre em discord.gg/havocbypass</p>
        </a>
        <div className="hero-card">
          <div className="hero-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <h3>Bypass All Scanners</h3>
          <p>Bypass Blackbox, Sysmon, Windows Defender e todos os scanners do Free Fire. 100% automatico.</p>
        </div>
        <div className="hero-card">
          <div className="hero-card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
          <h3>Zero Traces</h3>
          <p>Roda inteiramente em RAM. Nada escrito em disco, nada deixado apos fechar.</p>
        </div>
      </div>
    </section>
  )
}

/* ── SHOWCASE ── */
function VideoCard({ src, label }: { src: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const barRef   = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(true)

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return
    v.paused ? v.play() : v.pause()
    setPlaying(!v.paused)
  }
  const toggleMute = () => {
    const v = videoRef.current; if (!v) return
    v.muted = !v.muted; setMuted(v.muted)
  }
  const onTimeUpdate = () => {
    const v = videoRef.current; const b = barRef.current
    if (v && b && v.duration) b.style.width = (v.currentTime / v.duration * 100) + '%'
  }
  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current; if (!v) return
    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration
  }
  const goFS = () => { const w = videoRef.current?.parentElement; w?.requestFullscreen?.() }

  return (
    <div className="showcase-video-card">
      <div className="showcase-video-label"><span className="showcase-dot" />{label}</div>
      <div className="showcase-video-wrap">
        <video ref={videoRef} autoPlay muted loop playsInline onTimeUpdate={onTimeUpdate}>
          <source src={src} type="video/mp4" />
        </video>
        <div className="vid-controls">
          <button className="vid-btn" onClick={togglePlay}>
            {playing
              ? <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>}
          </button>
          <div className="vid-progress" onClick={onProgressClick}><div className="vid-bar" ref={barRef} /></div>
          <button className="vid-btn" onClick={toggleMute}>
            {muted
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>}
          </button>
          <button className="vid-btn" onClick={goFS}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,3 21,3 21,9"/><polyline points="9,21 3,21 3,15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── PRODUCTS ── */
const PRODUCTS = [
  { name: 'External', desc: 'Bypassa todos os scanners do Free Fire. Ideal para analises padrao.', featured: false,
    periods: [{label:'Semana',price:25,unit:'semana'},{label:'Mes',price:45,unit:'mes'},{label:'Permanente',price:100,unit:'permanente'}],
    features: ['Todas as funcoes de cheat inclusas','Bypass todos os Scanners FF','Eficacia em analises padrao','Suporte 24/7'] },
  { name: 'Internal', desc: 'Maior eficacia em analises avancadas. Recomendado para uso frequente.', featured: true,
    periods: [{label:'Semana',price:40,unit:'semana'},{label:'Mes',price:70,unit:'mes'},{label:'Permanente',price:145,unit:'permanente'}],
    features: ['Todas as funcoes de cheat inclusas','Bypass todos os Scanners FF','Eficacia em analises intermediarias','Bypass Sysmon + Blackbox','Suporte 24/7 prioritario'] },
  { name: 'Private', desc: 'Maxima eficacia em analises avancadas. Para quem nao aceita risco.', featured: false,
    periods: [{label:'Mes',price:240,unit:'mes'},{label:'Lifetime',price:450,unit:'lifetime'}],
    features: ['Todas as funcoes de cheat inclusas','Bypass todos os Scanners FF','Maxima eficacia em analises avancadas','Bypass Kernel nivel maximo','Windows Defender sem exclusao','Suporte 24/7 VIP'] },
]

function ProductCard({ product, onBuy }: { product: typeof PRODUCTS[0]; onBuy: () => void }) {
  const [idx, setIdx] = useState(0)
  const p = product.periods[idx]
  return (
    <div className={`product-card${product.featured ? ' product-card--featured' : ''}`}>
      <div className="product-preview">
        <Image src="/havoc-logo.png" alt="MRC" width={160} height={80} className="product-img-cover" />
      </div>
      <div className="product-body">
        <h3>{product.name}</h3>
        <p>{product.desc}</p>
        <div className="product-periods">
          {product.periods.map((per, i) => (
            <button key={per.label} className={`period-btn${i === idx ? ' active' : ''}`} onClick={() => setIdx(i)}>{per.label}</button>
          ))}
        </div>
        <div className="product-price">
          <span className="price-val">R$ {p.price}</span>{' '}
          <span className="price-unit">/{p.unit}</span>
        </div>
        <ul className="product-features">
          {product.features.map(f => (
            <li key={f}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{f}</li>
          ))}
        </ul>
        <button className={`btn-product${product.featured ? ' btn-product--pink' : ''}`} onClick={onBuy}>Comprar</button>
      </div>
    </div>
  )
}

/* ── FAQ ── */
const FAQS = [
  { q: 'Funciona no emulador?', a: 'Sim. O Remote MRC V3 funciona tanto no PC nativo quanto em emuladores como LDPlayer e BlueStacks. O bypass cobre os dois ambientes.' },
  { q: 'Precisa desativar o Windows Defender?', a: 'Nao. O bypass do Remote MRC V3 contorna o Windows Defender automaticamente, sem necessidade de exclusoes manuais ou desativar a protecao.' },
  { q: 'Como recebo o produto apos comprar?', a: 'Apos o pagamento, voce recebe o acesso diretamente pelo Discord. Entre no servidor discord.gg/havocbypass e abra um ticket. A entrega e feita em minutos.' },
  { q: 'Qual a diferenca entre External, Internal e Private?', a: 'Todos os planos tem as mesmas funcoes de cheat. A diferenca e a eficacia do bypass em analises avancadas.' },
  { q: 'O cheat deixa rastro no PC?', a: 'Nao. O Remote MRC V3 roda inteiramente em RAM. Nada e escrito em disco e nenhum arquivo e deixado apos fechar. Zero traces.' },
  { q: 'Com que frequencia o cheat e atualizado?', a: 'O bypass e atualizado toda semana para acompanhar os scanners do Free Fire. As atualizacoes sao silenciosas e automaticas.' },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="faq" id="faq">
      <div className="section-header"><h2>FAQ</h2><p>Duvidas frequentes sobre o Remote MRC V3</p></div>
      <div className="faq-list">
        {FAQS.map((f, i) => (
          <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
            <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
              <span>{f.q}</span>
              <svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="faq-answer"><p>{f.a}</p></div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── MAIN PAGE ── */
export default function Home() {
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = () => {
    setToastVisible(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2800)
    setTimeout(() => window.open('https://discord.gg/havocbypass', '_blank'), 600)
  }

  useEffect(() => {
    const els = document.querySelectorAll('.hero-card, .showcase-video-card, .feature-card, .product-card, .faq-item, .products-info')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    els.forEach(el => { el.classList.add('hidden'); obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <Loader />
      <Particles fullPage />
      <CustomCursor />
      <Security />
      <Navbar />

      <Hero />

      <section className="showcase" id="showcase">
        <div className="section-header"><h2>Showcase</h2><p>Resultados reais das nossas ferramentas em acao</p></div>
        <div className="showcase-videos">
          <VideoCard src="/videoanalise.mp4"  label="Analise 01" />
          <VideoCard src="/videoanalisee.mp4" label="Analise 02" />
          <VideoCard src="/showcase.mp4"      label="Showcase" />
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-header"><h2>Features</h2><p>Construido para ficar indetectavel, toda vez</p></div>
        <div className="features-grid">
          {[
            { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, title: 'Bypass Scam', desc: 'Bypass total para EMV, KELLER, SHARK e FARM. Metodo atualizado toda semana.' },
            { icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>, title: 'Kernel Bypass', desc: 'Bypass em kernel totalmente anti-ban. Injecao a nivel de kernel sem assinaturas detectaveis.' },
            { icon: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></>, title: 'Auto Updates', desc: 'Patches silenciosos a cada atualizacao do anti-cheat. Sempre um passo a frente.' },
            { icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>, title: 'Memory Injection', desc: 'Roda inteiramente em RAM. Nada escrito em disco, nada deixado apos fechar.' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon-wrap"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg></div>
              <h3>{f.title}</h3><p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="products" id="products">
        <div className="section-header"><h2>Our <span className="pink">Products</span></h2><p>Sistemas de Bypass separados em 3 planos</p></div>
        <div className="products-info">
          <div className="products-info-col">
            <p className="info-label">Cheat Features</p>
            <ul>{['Aimbots: Head / Legit / Left / Right / Scope','Visuals: Chams / ESP','StreamMode (UD Scanners e Sysmon)','NoCrashes: Bug F11 Msi / Blue5 sem Crash','Sem perda de desempenho ao ativar aimbots','StreamMode Bind'].map(i=><li key={i}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{i}</li>)}</ul>
          </div>
          <div className="products-info-divider" />
          <div className="products-info-col">
            <p className="info-label">Bypass Features</p>
            <ul>{['Bypass Blackbox','Bypass Windows Defender sem exclusao','Bypass Sysmon indetectavel','Bypass All Scanners','100% Automatico - sem metodo manual'].map(i=><li key={i}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{i}</li>)}</ul>
          </div>
        </div>
        <div className="products-grid">
          {PRODUCTS.map(p => <ProductCard key={p.name} product={p} onBuy={showToast} />)}
        </div>
      </section>

      <FAQ />

      <footer className="footer">
        <div className="footer-logo">MRC</div>
        <p>2025 Remote MRC V3. All rights reserved.</p>
      </footer>

      <a href="https://discord.gg/havocbypass" target="_blank" rel="noreferrer" className="discord-float" title="Discord">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
      </a>

      <div className={`toast-index${toastVisible ? ' show' : ''}`}>
        <span className="toast-icon" /> Redirecionando para o Discord...
      </div>
    </>
  )
}
