import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const getTheme  = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

export default function LandingPage() {
  const [count, setCount]   = useState({ meals:0, volunteers:0, ngos:0, tons:0 })
  const [slide, setSlide]   = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const [paused, setPaused] = useState(false)
  const [theme, setTheme]   = useState(getTheme)

  useEffect(() => { applyTheme(theme) }, [theme])

  const slides = [
    {
      img:     'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1400&q=80',
      tag:     '🌾 Smart Food Rescue Platform',
      headline:'Hunger is more\nthan missing a meal.',
      sub:     'Every day, tonnes of food goes to waste while millions sleep hungry. We are changing that — one delivery at a time.',
      accent:  '#2d8a4e',
      glow:    'rgba(45,138,78,0.55)',
      cta:     'Start Donating',
      ctaTo:   '/register',
    },
    {
      img:     'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1400&q=80',
      tag:     '🤖 AI-Powered Matching',
      headline:'Not just donating —\nintelligently saving.',
      sub:     'Smart matching connects every donation to the nearest requester before food expires.',
      accent:  '#e8720c',
      glow:    'rgba(232,114,12,0.55)',
      cta:     'How It Works',
      ctaTo:   '/register',
    },
    {
      img:     'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1400&q=80',
      tag:     '🚴 Volunteer Network',
      headline:'Serve the hungry\ncitizen.',
      sub:     'Join 500+ volunteers across India who pick up and deliver food every day — earn badges as you go.',
      accent:  '#2d8a4e',
      glow:    'rgba(45,138,78,0.55)',
      cta:     'Join as Volunteer',
      ctaTo:   '/register',
    },
    {
      img:     'https://images.unsplash.com/photo-1547592180-85f173990554?w=1400&q=80',
      tag:     '📍 Real-Time Live Map',
      headline:'See every donation,\nlive on the map.',
      sub:     'City map shows all active donations, pending requests, and volunteer positions in real time.',
      accent:  '#e8720c',
      glow:    'rgba(232,114,12,0.55)',
      cta:     'View Live Map',
      ctaTo:   '/map',
    },
    {
      img:     'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1400&q=80',
      tag:     '🏆 Gamified Impact',
      headline:'Every delivery\nearns a badge.',
      sub:     'Track your impact, climb the leaderboard, and unlock champion status. Food rescue, rewarded.',
      accent:  '#2d8a4e',
      glow:    'rgba(45,138,78,0.55)',
      cta:     'See Leaderboard',
      ctaTo:   '/leaderboard',
    },
  ]

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => { setSlide(s => (s+1) % slides.length); setFadeIn(true) }, 500)
    }, 5500)
    return () => clearInterval(t)
  }, [paused])

  const goTo = (i) => {
    if (i === slide) return
    setFadeIn(false)
    setTimeout(() => { setSlide(i); setFadeIn(true) }, 400)
  }

  useEffect(() => {
    const targets = { meals:10000, volunteers:500, ngos:200, tons:5 }
    let step = 0
    const t = setInterval(() => {
      step++
      const p = 1 - Math.pow(1 - step/80, 3)
      setCount({
        meals:      Math.floor(targets.meals * p),
        volunteers: Math.floor(targets.volunteers * p),
        ngos:       Math.floor(targets.ngos * p),
        tons:       Math.floor(targets.tons * p),
      })
      if (step >= 80) clearInterval(t)
    }, 20)
    return () => clearInterval(t)
  }, [])

  const cur = slides[slide]

  const features = [
    { icon:'🤖', title:'AI-Powered Matching',  desc:'Smart scoring finds the perfect donor-requester match before food expires.',      bg:'#e8f8ee', color:'#1f6b3a' },
    { icon:'📍', title:'Real-Time Map',         desc:'Live map showing all donations and requests across your city right now.',          bg:'#dbeafe', color:'#1d4ed8' },
    { icon:'🚴', title:'Volunteer Network',     desc:'Volunteers accept, pickup and deliver food — tracked every step of the way.',     bg:'#fff4ec', color:'#c45e08' },
    { icon:'📊', title:'Impact Analytics',      desc:'Admin dashboard with live charts showing meals saved and waste reduced.',         bg:'#f3e8ff', color:'#7e22ce' },
    { icon:'🔔', title:'Smart Notifications',   desc:'Instant alerts for new donations, volunteer assignments and deliveries.',         bg:'#e0f7fa', color:'#00838f' },
    { icon:'🏆', title:'Badges & Leaderboard',  desc:'Gamified rewards for top volunteers — badges, rankings, and recognition.',        bg:'#fef9c3', color:'#854d0e' },
  ]

  const steps = [
    { num:'01', icon:'🍱', title:'Donor Posts Food',    desc:'Food name, quantity, expiry time, pickup address — done in 60 seconds.' },
    { num:'02', icon:'🤖', title:'AI Calculates Score', desc:'Priority = (1/distance) + (1/expiry hours). Closest expiring food wins.' },
    { num:'03', icon:'🚴', title:'Volunteer Accepts',   desc:'Nearest volunteer picks up the food and begins delivery, tracked live.'  },
    { num:'04', icon:'🎉', title:'Food Delivered',      desc:'Requester receives food. Badge awarded. Impact tracked on dashboard.'    },
  ]

  return (
    <div style={{ background:'var(--bg-page)', color:'var(--text-body)', minHeight:'100vh' }}>

      {/* ══ HERO CAROUSEL ══ */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}>

        {/* BG image */}
        <div className="absolute inset-0">
          <img key={slide} src={cur.img} alt=""
            className="w-full h-full object-cover"
            style={{ filter:'brightness(0.35) saturate(1.1)' }}/>
          <div className="absolute inset-0" style={{
            background:`linear-gradient(160deg, ${cur.glow.replace('0.55','0.2')} 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.55) 100%)`
          }}/>
        </div>

        {/* NAVBAR */}
        <nav className="relative z-20 flex items-center justify-between px-6 md:px-14 h-16 flex-shrink-0"
          style={{ borderBottom:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(10px)', background:'rgba(0,0,0,0.18)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:cur.accent+'30', border:`1px solid ${cur.accent}50` }}>
              <span className="text-lg">🌾</span>
            </div>
            <div>
              <div className="text-sm font-black text-white tracking-tight">
                ANNAPURNA<span style={{ color:cur.accent }}>+</span>
              </div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', letterSpacing:'0.18em' }}>SMART FOOD RESCUE</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(t => t==='light'?'dark':'light')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110"
              style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)' }}>
              {theme==='light'?'🌙':'☀️'}
            </button>
            <Link to="/login" className="text-xs font-semibold px-3 py-1.5 transition hover:text-white"
              style={{ color:'rgba(255,255,255,0.7)' }}>Sign In</Link>
            <Link to="/register"
              className="text-xs font-black px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 text-white"
              style={{ background:cur.accent, boxShadow:`0 4px 16px ${cur.accent}50` }}>
              Get Started →
            </Link>
          </div>
        </nav>

        {/* SLIDE CONTENT */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">

          {/* Tag */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8, marginBottom:28,
            padding:'8px 18px', borderRadius:9999,
            border:`1px solid ${cur.accent}50`, background:cur.accent+'20',
            color:cur.accent, fontSize:13, fontWeight:700,
            opacity:fadeIn?1:0, transform:fadeIn?'translateY(0)':'translateY(14px)',
            transition:'opacity 0.5s ease, transform 0.5s ease',
          }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:cur.accent, animation:'pulse-dot 2s ease infinite' }}/>
            {cur.tag}
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize:'clamp(2.6rem, 7.5vw, 5.2rem)', fontWeight:900,
            lineHeight:1.05, letterSpacing:'-0.03em',
            color:'#fff', whiteSpace:'pre-line', marginBottom:24,
            textShadow:'0 4px 40px rgba(0,0,0,0.5)',
            opacity:fadeIn?1:0, transform:fadeIn?'translateY(0)':'translateY(22px)',
            transition:'opacity 0.55s ease 0.05s, transform 0.55s ease 0.05s',
          }}>
            {cur.headline}
          </h1>

          {/* Sub */}
          <p style={{
            maxWidth:520, fontSize:16, lineHeight:1.75,
            color:'rgba(255,255,255,0.62)', marginBottom:40,
            opacity:fadeIn?1:0, transform:fadeIn?'translateY(0)':'translateY(16px)',
            transition:'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
          }}>
            {cur.sub}
          </p>

          {/* CTAs */}
          <div style={{
            display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center', marginBottom:48,
            opacity:fadeIn?1:0, transform:fadeIn?'translateY(0)':'translateY(12px)',
            transition:'opacity 0.65s ease 0.15s, transform 0.65s ease 0.15s',
          }}>
            <Link to={cur.ctaTo}
              className="inline-flex items-center gap-2 font-black text-white rounded-2xl transition-all hover:-translate-y-1"
              style={{ background:cur.accent, padding:'13px 32px', fontSize:15, boxShadow:`0 6px 24px ${cur.accent}50` }}>
              {cur.cta} →
            </Link>
            <Link to="/map"
              className="inline-flex items-center gap-2 font-bold text-white rounded-2xl transition-all hover:bg-white/10 hover:-translate-y-1"
              style={{ border:'1.5px solid rgba(255,255,255,0.28)', padding:'13px 32px', fontSize:15 }}>
              📍 Live Map
            </Link>
          </div>

          {/* Dots + bar */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', gap:10 }}>
              {slides.map((_,i) => (
                <button key={i} onClick={() => goTo(i)} style={{
                  height:6, borderRadius:9999, border:'none', cursor:'pointer',
                  width: i===slide ? 28 : 6,
                  background: i===slide ? cur.accent : 'rgba(255,255,255,0.3)',
                  transition:'all 0.4s ease',
                }}/>
              ))}
            </div>
            <div style={{ width:100, height:2, borderRadius:9999, background:'rgba(255,255,255,0.15)', overflow:'hidden' }}>
              <div key={slide} style={{
                height:'100%', borderRadius:9999, background:cur.accent,
                animation: paused?'none':'heroProgress 5.5s linear forwards'
              }}/>
            </div>
            <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'monospace' }}>
              {String(slide+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}
            </span>
          </div>
        </div>

        {/* Arrows */}
        {[['‹', ()=>goTo((slide-1+slides.length)%slides.length), 'left-4 md:left-8'],
          ['›', ()=>goTo((slide+1)%slides.length), 'right-4 md:right-8']
        ].map(([ch,fn,pos]) => (
          <button key={pos} onClick={fn}
            className={`absolute ${pos} top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold transition-all hover:scale-110`}
            style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.8)' }}>
            {ch}
          </button>
        ))}
      </section>

      {/* ══ STATS ══ */}
      <section style={{ borderTop:'1px solid var(--border)', padding:'56px 16px' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value:`${count.meals.toLocaleString()}+`, label:'Meals Rescued',    icon:'🍽️' },
            { value:`${count.volunteers}+`,             label:'Active Volunteers', icon:'🚴' },
            { value:`${count.ngos}+`,                   label:'NGO Partners',      icon:'🏢' },
            { value:`${count.tons} Tons`,               label:'Waste Reduced',     icon:'♻️' },
          ].map((s,i) => (
            <div key={i}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-4xl md:text-5xl font-black mb-1" style={{ color:'var(--brand)' }}>{s.value}</div>
              <div className="text-xs uppercase tracking-wider font-medium" style={{ color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ borderTop:'1px solid var(--border)', padding:'80px 16px', background:'var(--bg-surface)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p style={{ color:'var(--brand)', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:10 }}>How It Works</p>
            <h2 className="text-5xl font-black" style={{ color:'var(--text-primary)' }}>Four Steps.</h2>
            <h2 className="text-5xl font-black" style={{ color:'var(--text-muted)' }}>Zero Waste.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {steps.map((s,i) => (
              <div key={i} className="card-hover group relative overflow-hidden">
                <div className="text-6xl font-black mb-4 leading-none" style={{ color:'var(--border)' }}>{s.num}</div>
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-black text-sm mb-2" style={{ color:'var(--text-primary)' }}>{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color:'var(--text-muted)' }}>{s.desc}</p>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                  style={{ background:'var(--brand)' }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ borderTop:'1px solid var(--border)', padding:'80px 16px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p style={{ color:'var(--brand)', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:10 }}>Features</p>
            <h2 className="text-5xl font-black" style={{ color:'var(--text-primary)' }}>Everything Built.</h2>
            <h2 className="text-5xl font-black" style={{ color:'var(--text-muted)' }}>Nothing Missing.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f,i) => (
              <div key={i} className="card-hover group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                  style={{ background:f.bg }}>
                  {f.icon}
                </div>
                <h3 className="font-black text-sm mb-2" style={{ color:'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color:'var(--text-muted)' }}>{f.desc}</p>
                <div className="mt-4 h-px w-0 group-hover:w-full transition-all duration-500 rounded-full"
                  style={{ background:f.color }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ROLES ══ */}
      <section style={{ borderTop:'1px solid var(--border)', padding:'80px 16px', background:'var(--bg-surface)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p style={{ color:'var(--brand)', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:10 }}>Who Is It For</p>
            <h2 className="text-5xl font-black" style={{ color:'var(--text-primary)' }}>Three Roles.</h2>
            <h2 className="text-5xl font-black" style={{ color:'var(--text-muted)' }}>One Mission.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon:'🏠', num:'01', role:'Food Donor',     desc:'Restaurants, households, caterers with surplus food. Post in 60 seconds.',     tag:'I have food',   accent:'#2d8a4e', bg:'#e8f8ee' },
              { icon:'🚴', num:'02', role:'Volunteer',       desc:'Pick up and deliver food to those in need. Earn badges and climb leaderboard.', tag:'I can deliver', accent:'#2563eb', bg:'#dbeafe' },
              { icon:'🏢', num:'03', role:'NGO / Requester', desc:'Shelters, communities and families who need regular food support.',             tag:'I need food',   accent:'#e8720c', bg:'#fff4ec' },
            ].map((r,i) => (
              <div key={i} className="card-hover group flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background:r.bg }}>
                    {r.icon}
                  </div>
                  <span className="font-black text-xl" style={{ color:'var(--border)' }}>{r.num}</span>
                </div>
                <div className="text-xs uppercase tracking-widest font-bold mb-1.5" style={{ color:r.accent }}>{r.tag}</div>
                <h3 className="text-xl font-black mb-3" style={{ color:'var(--text-primary)' }}>{r.role}</h3>
                <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color:'var(--text-muted)' }}>{r.desc}</p>
                <Link to="/register"
                  className="inline-flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 w-fit"
                  style={{ border:`1.5px solid ${r.accent}`, color:r.accent, background:r.accent+'12' }}>
                  Join as {r.role} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ AI SECTION ══ */}
      <section style={{ borderTop:'1px solid var(--border)', padding:'80px 16px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="card rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <p style={{ color:'var(--brand)', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:10 }}>AI Algorithm</p>
                <h2 className="text-4xl font-black mb-4" style={{ color:'var(--text-primary)' }}>Smart Priority Scoring</h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color:'var(--text-muted)' }}>
                  Food that's about to expire gets delivered FIRST — reducing waste while urgently feeding those who need it most.
                </p>
                <div className="rounded-2xl p-5 font-mono text-sm" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                  <div className="mb-2 text-xs" style={{ color:'var(--text-muted)' }}>// Matching Formula</div>
                  <div className="font-bold mb-1" style={{ color:'var(--brand)' }}>Priority Score =</div>
                  <div className="ml-4" style={{ color:'var(--text-primary)' }}>(1 / distance_km)</div>
                  <div className="ml-4" style={{ color:'var(--text-muted)' }}>+</div>
                  <div className="ml-4" style={{ color:'var(--text-primary)' }}>(1 / hours_until_expiry)</div>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { label:'Distance Weight', value:75, color:'#2d8a4e' },
                  { label:'Expiry Priority', value:90, color:'#e8720c' },
                  { label:'Quantity Match',  value:60, color:'#2563eb' },
                  { label:'Food Type Match', value:50, color:'#8b5cf6' },
                ].map((m,i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-2">
                      <span style={{ color:'var(--text-muted)' }}>{m.label}</span>
                      <span className="font-black" style={{ color:'var(--text-primary)' }}>{m.value}%</span>
                    </div>
                    <div className="rounded-full h-1.5" style={{ background:'var(--border)' }}>
                      <div className="h-1.5 rounded-full" style={{ width:`${m.value}%`, background:m.color }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section style={{ padding:'96px 16px', textAlign:'center', background:'linear-gradient(135deg, #1a2d0f 0%, #2d5016 50%, #1a2d0f 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize:'60px 60px' }}/>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(45,138,78,0.25) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-5xl mb-6">🌾</div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Start Saving<br/>
            <span style={{ color:'rgba(255,255,255,0.3)' }}>Food Today.</span>
          </h2>
          <p className="mb-10 text-base" style={{ color:'rgba(255,255,255,0.5)' }}>
            Join donors, volunteers and NGOs across India making a real impact every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center font-black text-black rounded-2xl transition-all hover:-translate-y-1 shadow-2xl"
              style={{ background:'#fff', padding:'14px 40px', fontSize:15 }}>
              Create Free Account →
            </Link>
            <Link to="/login"
              className="inline-flex items-center font-bold text-white rounded-2xl transition-all hover:-translate-y-1"
              style={{ border:'1.5px solid rgba(255,255,255,0.25)', padding:'14px 40px', fontSize:15 }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'36px 16px' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background:'var(--brand)' }}>🌾</div>
            <span className="font-black text-sm" style={{ color:'var(--text-primary)' }}>
              ANNAPURNA<span style={{ color:'var(--orange)' }}>+</span>
            </span>
          </div>
          <div className="flex gap-5 text-xs font-medium">
            {[['Register','/register'],['Login','/login'],['Map','/map'],['Leaderboard','/leaderboard']].map(([l,t]) => (
              <Link key={t} to={t} className="hover:underline" style={{ color:'var(--text-muted)' }}>{l}</Link>
            ))}
          </div>
          <div className="text-xs" style={{ color:'var(--text-muted)' }}>© 2026 ANNAPURNA+. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}