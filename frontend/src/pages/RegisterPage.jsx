import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const getTheme   = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

export default function RegisterPage() {
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirmPassword:'', role:'DONOR' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [step, setStep]       = useState(1) // 1=details, 2=role
  const { signup }            = useAuth()

  useEffect(() => { applyTheme(getTheme()) }, [])

  const roles = [
    { value:'DONOR',     icon:'🏠', label:'Food Donor',     desc:'I have surplus food to share with those in need',    color:'#2d8a4e', bg:'#e8f8ee', border:'#b8e0c4' },
    { value:'VOLUNTEER', icon:'🚴', label:'Volunteer',       desc:'I can pick up and deliver food to communities',      color:'#2563eb', bg:'#dbeafe', border:'#bfdbfe' },
    { value:'NGO',       icon:'🏢', label:'NGO / Requester', desc:'We need food for our shelter or community',          color:'#e8720c', bg:'#fff4ec', border:'#fed7aa' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      await signup(form.email, form.password, form.name, form.role)
      setSuccess(true)
    } catch (err) {
      setError({ 'auth/email-already-in-use':'This email is already registered' }[err.code] || 'Registration failed: ' + err.message)
    }
    setLoading(false)
  }

  if (success) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #1a2d0f, #2d5016)', padding:16 }}>
      <div style={{ background:'var(--bg-card)', borderRadius:24, padding:40, textAlign:'center', maxWidth:420, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ width:88, height:88, background:'#e8f8ee', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:44 }}>📧</div>
        <h2 style={{ fontSize:24, fontWeight:900, color:'var(--brand)', marginBottom:8 }}>Check Your Email!</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:6 }}>We sent a verification link to</p>
        <p style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:6 }}>{form.email}</p>
        <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>Click the link in the email before logging in.</p>
        <Link to="/login" className="btn-primary"
          style={{ textDecoration:'none', display:'block', padding:'13px', borderRadius:14, fontSize:14, textAlign:'center' }}>
          Go to Login →
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg-page)' }}>

      {/* ── LEFT PANEL (desktop) ── */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden"
        style={{ background:'linear-gradient(145deg, #1a2d0f 0%, #2d5016 40%, #3a6b1a 70%, #1a2d0f 100%)' }}>
        <div className="absolute inset-0" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'48px 48px' }}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(61,172,96,0.2) 0%, transparent 70%)' }}/>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group" style={{ textDecoration:'none' }}>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
              <span style={{ fontSize:24 }}>🌾</span>
            </div>
            <div>
              <div className="text-2xl font-black text-white">ANNAPURNA<span style={{ color:'#f28c3a' }}>+</span></div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', letterSpacing:'0.2em' }}>SMART FOOD RESCUE</div>
            </div>
          </Link>
        </div>

        {/* Middle */}
        <div className="relative z-10">
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:20, padding:'6px 14px', borderRadius:9999, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.07)', fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:600 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse 2s infinite' }}/>
            Join 500+ volunteers making an impact
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Join the Food<br/>Rescue Movement.
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.75, marginBottom:28 }}>
            Every plate shared is a life changed. Be part of India's growing network of food donors, volunteers, and NGOs.
          </p>

          {/* Role previews */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {roles.map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:14, background:'rgba(255,255,255,0.07)', border:`1px solid ${r.color}30` }}>
                <div style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, background:r.bg, flexShrink:0 }}>
                  {r.icon}
                </div>
                <div>
                  <div style={{ fontWeight:700, color:'#fff', fontSize:13 }}>{r.label}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ color:'rgba(255,255,255,0.18)', fontSize:11, position:'relative', zIndex:10 }}>
          © 2026 ANNAPURNA+. Feeding India, one delivery at a time.
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2" style={{ textDecoration:'none' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ background:'var(--brand)' }}>🌾</div>
              <span className="font-black text-sm" style={{ color:'var(--text-primary)' }}>
                ANNAPURNA<span style={{ color:'var(--orange)' }}>+</span>
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs" style={{ color:'var(--text-muted)' }}>Already a member?</span>
              <Link to="/login"
                className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
                style={{ textDecoration:'none', background:'var(--bg-surface)', color:'var(--brand)', border:'1px solid var(--border)' }}>
                Sign In
              </Link>
            </div>
          </div>

          {/* Card */}
          <div className="card" style={{ padding:'28px 32px' }}>
            <div className="mb-6">
              <h1 className="text-2xl font-black mb-1" style={{ color:'var(--text-primary)' }}>Create your account</h1>
              <p className="text-sm" style={{ color:'var(--text-muted)' }}>Join the food rescue movement — free forever</p>
            </div>

            {error && (
              <div style={{ background:'#fef2f2', borderLeft:'3px solid #dc2626', color:'#dc2626', borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* Name */}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  Full Name
                </label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name:e.target.value})}
                  className="input-field" placeholder="e.g. Loks Vaish  kavi" required/>
              </div>

              {/* Email */}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  Email Address
                </label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})}
                  className="input-field" placeholder="you@example.com" required/>
              </div>

              {/* Password */}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  Password
                </label>
                <div style={{ position:'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({...form, password:e.target.value})}
                    className="input-field" placeholder="Min 6 characters" style={{ paddingRight:44 }} required/>
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16 }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  Confirm Password
                </label>
                <input type="password" value={form.confirmPassword}
                  onChange={e => setForm({...form, confirmPassword:e.target.value})}
                  className="input-field" placeholder="Re-enter password" required/>
              </div>

              {/* Role selection */}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  I am joining as...
                </label>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {roles.map(r => (
                    <label key={r.value} style={{
                      display:'flex', alignItems:'center', gap:12, padding:12, borderRadius:14, cursor:'pointer',
                      border:`2px solid ${form.role===r.value ? r.color : 'var(--border)'}`,
                      background: form.role===r.value ? r.bg : 'var(--bg-card)',
                      transition:'all 0.2s ease',
                    }}>
                      <input type="radio" name="role" value={r.value}
                        checked={form.role===r.value} onChange={e => setForm({...form, role:e.target.value})}
                        style={{ display:'none' }}/>
                      <div style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, background: form.role===r.value ? 'rgba(255,255,255,0.7)' : 'var(--bg-surface)' }}>
                        {r.icon}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13, color: form.role===r.value ? r.color : 'var(--text-primary)' }}>{r.label}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>{r.desc}</div>
                      </div>
                      {form.role===r.value && (
                        <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${r.color}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <div style={{ width:10, height:10, borderRadius:'50%', background:r.color }}/>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-primary"
                style={{ padding:'14px', fontSize:15, borderRadius:14, marginTop:4 }}>
                {loading
                  ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                      <span className="spinner" style={{ width:18, height:18 }}/> Creating account...
                    </span>
                  : '🚀 Create My Account'}
              </button>
            </form>

            {/* Terms note */}
            <p style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:16 }}>
              By joining you agree to our mission of reducing food waste and hunger in India.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}