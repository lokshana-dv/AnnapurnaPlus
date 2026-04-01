import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const getTheme  = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

export default function LoginPage() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [theme, setTheme]         = useState(getTheme)
  const { login, resetPassword }  = useAuth()
  const navigate = useNavigate()

  useEffect(() => { applyTheme(theme) }, [theme])

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/dashboard') }
    catch (err) { setError(getFirebaseError(err.code)) }
    setLoading(false)
  }

  const handleReset = async () => {
    if (!email) return setError('Enter your email first to reset password')
    try { await resetPassword(email); setResetSent(true); setError('') }
    catch { setError('Could not send reset email. Check your email address.') }
  }

  const getFirebaseError = (code) => ({
    'auth/user-not-found':    'No account found with this email',
    'auth/wrong-password':    'Incorrect password',
    'auth/invalid-email':     'Invalid email address',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/invalid-credential':'Email or password is incorrect',
  }[code] || 'Login failed. Please try again.')

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg-page)', transition:'all 0.3s' }}>

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background:'linear-gradient(145deg, #1a2d0f 0%, #2d5016 40%, #3a6b1a 70%, #1a2d0f 100%)' }}>

        {/* Grid overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize:'48px 48px'
        }}/>
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(61,172,96,0.25) 0%, transparent 70%)' }}/>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
              <span className="text-2xl">🌾</span>
            </div>
            <div>
              <div className="text-2xl font-black text-white">ANNAPURNA<span style={{ color:'#f28c3a' }}>+</span></div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', letterSpacing:'0.2em' }}>SMART FOOD RESCUE</div>
            </div>
          </Link>
        </div>

        {/* Middle content */}
        <div className="relative z-10">
          {/* Photo strip */}
          <div className="grid grid-cols-2 gap-3 mb-8" style={{ opacity:0.85 }}>
            <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=70"
              className="rounded-2xl h-28 w-full object-cover" alt="Food rescue"/>
            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=70"
              className="rounded-2xl h-28 w-full object-cover" alt="Volunteers"/>
          </div>

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border text-xs font-semibold"
            style={{ borderColor:'rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.65)' }}>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            10,000+ meals rescued across India
          </div>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Feed More.<br/>Waste Less.<br/>
            <span style={{ color:'rgba(255,255,255,0.28)', WebkitTextStroke:'1px rgba(255,255,255,0.18)' }}>Together.</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.75 }}>
            Connecting food donors, volunteers, and NGOs through intelligent matching and real-time delivery tracking.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[{ v:'500+', l:'Volunteers' },{ v:'200+', l:'NGO Partners' },{ v:'5 Tons', l:'Waste Saved' }].map((s,i) => (
              <div key={i} className="text-center p-3 rounded-2xl border"
                style={{ borderColor:'rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)' }}>
                <div className="text-xl font-black text-white">{s.v}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Steps preview */}
          <div className="mt-8 space-y-3">
            {[
              { n:'01', t:'Post surplus food in 60 seconds' },
              { n:'02', t:'AI matches to nearest requester'  },
              { n:'03', t:'Volunteer delivers, badge earned'  },
            ].map((s,i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background:'rgba(61,172,96,0.3)', color:'#86efac' }}>
                  {s.n}
                </div>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.55)' }}>{s.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div style={{ color:'rgba(255,255,255,0.18)', fontSize:11, position:'relative', zIndex:10 }}>
          © 2026 ANNAPURNA+. Feeding India, one delivery at a time.
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md fade-in">

          {/* Theme toggle */}
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ background:'var(--brand)' }}>🌾</div>
              <span className="font-black text-sm" style={{ color:'var(--text-primary)' }}>
                ANNAPURNA<span style={{ color:'var(--orange)' }}>+</span>
              </span>
            </Link>
            <div className="ml-auto">
              <button
                onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-110"
                style={{ background:'var(--bg-card)', border:'1.5px solid var(--border)', boxShadow:'var(--shadow-sm)' }}
                title="Toggle dark/light mode">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>

          {/* Main card */}
          <div className="card" style={{ padding:'32px 36px' }}>

            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background:'var(--brand-light)' }}>
                  <span className="text-xl">🌾</span>
                </div>
                <div>
                  <div className="font-black text-sm" style={{ color:'var(--brand)' }}>ANNAPURNA+</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:'0.1em' }}>SMART FOOD RESCUE</div>
                </div>
              </div>
              <h1 className="text-2xl font-black mb-1" style={{ color:'var(--text-primary)' }}>Welcome back 👋</h1>
              <p className="text-sm" style={{ color:'var(--text-muted)' }}>Sign in to continue making an impact</p>
            </div>

            {/* Alerts */}
            {error && (
              <div style={{ background:'#fef2f2', borderLeft:'3px solid #dc2626', color:'#dc2626', borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <span>⚠️</span> {error}
              </div>
            )}
            {resetSent && (
              <div style={{ background:'#f0fdf4', borderLeft:'3px solid #2d8a4e', color:'#1f6b3a', borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <span>✅</span> Password reset email sent! Check your inbox.
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Email */}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  Email Address
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field" placeholder="you@example.com" required />
              </div>

              {/* Password */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                    Password
                  </label>
                  <button type="button" onClick={handleReset}
                    style={{ fontSize:12, fontWeight:600, color:'var(--brand)', background:'none', border:'none', cursor:'pointer' }}>
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position:'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field" placeholder="••••••••"
                    style={{ paddingRight:44 }} required />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16 }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-primary"
                style={{ padding:'13px', fontSize:14, borderRadius:14, marginTop:4 }}>
                {loading
                  ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                      <span className="spinner" style={{ width:18, height:18 }}/> Signing in...
                    </span>
                  : '🔐 Sign In to ANNAPURNA+'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
              <div style={{ flex:1, height:1, background:'var(--border)' }}/>
              <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.1em' }}>NEW TO ANNAPURNA+?</span>
              <div style={{ flex:1, height:1, background:'var(--border)' }}/>
            </div>

            {/* Register */}
            <Link to="/register" className="btn-outline"
              style={{ width:'100%', padding:'13px', fontSize:14, borderRadius:14, display:'block', textAlign:'center', textDecoration:'none' }}>
              Create Free Account →
            </Link>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-3 gap-3 mt-4 fade-in-2">
            {[
              { icon:'🏠', label:'Food Donor',  desc:'Share surplus',  color:'#2d8a4e', bg:'#e8f8ee' },
              { icon:'🚴', label:'Volunteer',   desc:'Deliver food',   color:'#2563eb', bg:'#dbeafe' },
              { icon:'🏢', label:'NGO',         desc:'Request food',   color:'#e8720c', bg:'#fff4ec' },
            ].map((r,i) => (
              <Link key={i} to="/register"
                className="card text-center hover:-translate-y-1 transition-all duration-200"
                style={{ padding:'12px 8px', textDecoration:'none' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg mx-auto mb-2"
                  style={{ background:r.bg }}>
                  {r.icon}
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:r.color }}>{r.label}</div>
                <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{r.desc}</div>
              </Link>
            ))}
          </div>

          {/* Back to home */}
          <div className="text-center mt-5">
            <Link to="/" style={{ fontSize:12, color:'var(--text-muted)', textDecoration:'none' }}
              className="hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}