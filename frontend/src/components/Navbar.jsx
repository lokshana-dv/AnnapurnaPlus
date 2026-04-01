import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { toast } from './Toast'

const getTheme   = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

// ── Feature 15: Language system (inline, no context needed)
const LANGS = {
  en: { flag:'🇬🇧', name:'EN' },
  ta: { flag:'🇮🇳', name:'தமிழ்' },
  hi: { flag:'🇮🇳', name:'हिन्दी' },
}
export const getLang = () => localStorage.getItem('lang') || 'en'
export const setLang = (l) => { localStorage.setItem('lang', l); window.dispatchEvent(new Event('langchange')) }

export default function Navbar() {
  const { currentUser, dbUser, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [menuOpen, setMenuOpen]       = useState(false)
  const [scrolled, setScrolled]       = useState(false)
  const [dropOpen, setDropOpen]       = useState(false)
  const [theme, setTheme]             = useState(getTheme)
  const [lang, setLangState]          = useState(getLang)
  const [langOpen, setLangOpen]       = useState(false)

  // ── Feature 14: Volunteer availability toggle
  const [isAvailable, setIsAvailable] = useState(() =>
    localStorage.getItem('volunteer_available') !== 'false'
  )

  useEffect(() => { applyTheme(theme) }, [theme])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false); setDropOpen(false); setLangOpen(false) }, [location.pathname])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  // ── Feature 14: Toggle volunteer availability
  const toggleAvailability = () => {
    const next = !isAvailable
    setIsAvailable(next)
    localStorage.setItem('volunteer_available', String(next))
    toast[next ? 'success' : 'warning'](
      next ? 'You are now ONLINE — you\'ll receive delivery requests!' : 'You are now OFFLINE — no new requests will be assigned.',
      next ? '🟢 Available' : '🔴 Unavailable'
    )
  }

  // ── Feature 15: Change language
  const handleLangChange = (code) => {
    setLangState(code)
    setLang(code)
    setLangOpen(false)
    toast.info(`Language changed to ${LANGS[code].name}`, '🌐 Language')
  }

  const handleLogout = async () => { await logout(); navigate('/') }
  const isActive = (path) => location.pathname === path

  const navLinks = currentUser ? [
    { to:'/dashboard',   label:'Dashboard', show: true },
    { to:'/donate',      label:'Donate',    show: dbUser?.role === 'DONOR' },
    { to:'/request',     label:'Request',   show: dbUser?.role === 'NGO' },
    { to:'/map',         label:'Live Map',  show: true },
    { to:'/tracking',    label:'Track',     show: ['VOLUNTEER','NGO'].includes(dbUser?.role) },
    { to:'/leaderboard', label:'🏆 Ranks',  show: true },
    { to:'/admin',       label:'⚙️ Admin',  show: dbUser?.role === 'ADMIN' },
  ].filter(l => l.show) : []

  const roleColors = {
    DONOR:     { bg:'#e8f8ee', color:'#2d8a4e', dot:'#2d8a4e' },
    VOLUNTEER: { bg:'#dbeafe', color:'#2563eb', dot: isAvailable ? '#2d8a4e' : '#dc2626' },
    NGO:       { bg:'#fff4ec', color:'#e8720c', dot:'#e8720c' },
    ADMIN:     { bg:'#fce7f3', color:'#be185d', dot:'#be185d' },
  }
  const rc = roleColors[dbUser?.role] || roleColors.DONOR

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300"
      style={{ background:'var(--bg-card)', borderBottom:'1px solid var(--border)', boxShadow: scrolled ? 'var(--shadow-md)' : 'none', backdropFilter:'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={currentUser ? '/dashboard' : '/'} className="flex items-center gap-2.5 group" style={{ textDecoration:'none' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background:'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
              <span style={{ fontSize:18 }}>🌾</span>
            </div>
            <div>
              <div className="font-black text-sm tracking-tight" style={{ color:'var(--text-primary)', lineHeight:1.1 }}>
                ANNAPURNA<span style={{ color:'var(--orange)' }}>+</span>
              </div>
              <div style={{ fontSize:8, color:'var(--text-muted)', letterSpacing:'0.2em' }}>FOOD RESCUE</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((l, i) => (
                <Link key={i} to={l.to}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    textDecoration:'none',
                    background: isActive(l.to) ? 'var(--brand)' : 'transparent',
                    color: isActive(l.to) ? '#fff' : 'var(--text-muted)',
                    boxShadow: isActive(l.to) ? '0 2px 12px rgba(45,138,78,0.3)' : 'none',
                  }}>
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* ── Feature 15: Language toggle ── */}
            <div style={{ position:'relative' }}>
              <button onClick={() => setLangOpen(o => !o)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all"
                style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', cursor:'pointer', fontSize:12, fontWeight:700, color:'var(--text-muted)' }}>
                <span>{LANGS[lang]?.flag}</span>
                <span>{LANGS[lang]?.name}</span>
                <span style={{ fontSize:9, opacity:0.6 }}>▼</span>
              </button>
              {langOpen && (
                <div style={{
                  position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:200,
                  background:'var(--bg-card)', border:'1px solid var(--border)',
                  borderRadius:14, boxShadow:'var(--shadow-lg)', overflow:'hidden', minWidth:130,
                }}>
                  {Object.entries(LANGS).map(([code, l]) => (
                    <button key={code} onClick={() => handleLangChange(code)}
                      style={{
                        width:'100%', display:'flex', alignItems:'center', gap:8,
                        padding:'9px 14px', fontSize:12, fontWeight:700,
                        background: lang === code ? 'var(--bg-surface)' : 'none',
                        color: lang === code ? 'var(--brand)' : 'var(--text-secondary)',
                        border:'none', cursor:'pointer', textAlign:'left',
                      }}>
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                      {lang === code && <span style={{ marginLeft:'auto', fontSize:10 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <span style={{ fontSize:16 }}>{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>

            {/* ── Feature 14: Volunteer availability toggle ── */}
            {dbUser?.role === 'VOLUNTEER' && (
              <button onClick={toggleAvailability}
                title={isAvailable ? 'Click to go offline' : 'Click to go online'}
                style={{
                  display:'flex', alignItems:'center', gap:5,
                  padding:'5px 10px', borderRadius:10, border:'none', cursor:'pointer',
                  background: isAvailable ? '#dcfce7' : '#fee2e2',
                  color: isAvailable ? '#166534' : '#dc2626',
                  fontSize:11, fontWeight:700, transition:'all 0.2s',
                }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background: isAvailable ? '#2d8a4e' : '#dc2626', flexShrink:0 }}/>
                {isAvailable ? 'Online' : 'Offline'}
              </button>
            )}

            {currentUser ? (
              <div style={{ position:'relative' }}>
                <button onClick={() => setDropOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                  style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', cursor:'pointer' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background:rc.bg, color:rc.color }}>
                    {dbUser?.name?.[0] || currentUser.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden md:block text-xs font-bold max-w-[80px] truncate"
                    style={{ color:'var(--text-primary)' }}>
                    {dbUser?.name?.split(' ')[0] || 'User'}
                  </span>
                  {/* Live dot — green if volunteer online, role color otherwise */}
                  <div style={{ width:6, height:6, borderRadius:'50%', background:rc.dot, flexShrink:0 }}/>
                  <span style={{ fontSize:10, color:'var(--text-muted)', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>▼</span>
                </button>

                {/* Dropdown */}
                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden"
                    style={{ width:220, background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)', zIndex:100 }}>

                    {/* User info */}
                    <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black"
                          style={{ background:rc.bg, color:rc.color, fontSize:18 }}>
                          {dbUser?.name?.[0] || '?'}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="font-black text-sm truncate" style={{ color:'var(--text-primary)' }}>{dbUser?.name}</div>
                          <div style={{ fontSize:10, padding:'2px 8px', borderRadius:9999, background:rc.bg, color:rc.color, fontWeight:700, display:'inline-block', marginTop:2 }}>
                            {dbUser?.role}
                          </div>
                        </div>
                      </div>
                      {dbUser?.badgeCount > 0 && (
                        <div style={{ marginTop:10, padding:'6px 10px', borderRadius:10, background:'var(--bg-surface)', display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
                          <span>🏅</span>
                          <span style={{ fontWeight:700, color:'var(--text-primary)' }}>{dbUser.badgeCount} badges earned</span>
                        </div>
                      )}
                      {/* ── Feature 14: Availability status in dropdown ── */}
                      {dbUser?.role === 'VOLUNTEER' && (
                        <button onClick={toggleAvailability}
                          style={{
                            marginTop:8, width:'100%', display:'flex', alignItems:'center', gap:8,
                            padding:'7px 10px', borderRadius:10, border:'none', cursor:'pointer',
                            background: isAvailable ? '#dcfce7' : '#fee2e2',
                            color: isAvailable ? '#166534' : '#dc2626',
                            fontSize:12, fontWeight:700, transition:'all 0.2s',
                          }}>
                          <span style={{ width:8, height:8, borderRadius:'50%', background: isAvailable ? '#2d8a4e' : '#dc2626' }}/>
                          {isAvailable ? '🟢 You are Online — receiving requests' : '🔴 You are Offline — not receiving requests'}
                        </button>
                      )}
                    </div>

                    {/* Nav links */}
                    <div style={{ padding:'6px 0' }}>
                      {[
                        { to:'/dashboard',   icon:'📊', label:'Dashboard'   },
                        { to:'/profile',     icon:'✏️', label:'Edit Profile' },
                        { to:'/map',         icon:'📍', label:'Live Map'     },
                        { to:'/leaderboard', icon:'🏆', label:'Leaderboard'  },
                        ...(dbUser?.role === 'ADMIN' ? [{ to:'/admin', icon:'⚙️', label:'Admin Panel' }] : []),
                      ].map((item, i) => (
                        <Link key={i} to={item.to}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-all"
                          style={{ textDecoration:'none', color:'var(--text-secondary)', background: isActive(item.to) ? 'var(--bg-surface)' : 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background='var(--bg-surface)'}
                          onMouseLeave={e => e.currentTarget.style.background= isActive(item.to) ? 'var(--bg-surface)' : 'transparent'}>
                          <span>{item.icon}</span>{item.label}
                        </Link>
                      ))}
                    </div>

                    {/* ── Feature 15: Language picker in dropdown ── */}
                    <div style={{ borderTop:'1px solid var(--border)', padding:'8px 10px' }}>
                      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6, paddingLeft:4 }}>🌐 Language</div>
                      <div style={{ display:'flex', gap:4 }}>
                        {Object.entries(LANGS).map(([code, l]) => (
                          <button key={code} onClick={() => handleLangChange(code)}
                            style={{
                              flex:1, padding:'5px 4px', borderRadius:8, fontSize:11, fontWeight:700,
                              background: lang === code ? 'var(--brand)' : 'var(--bg-surface)',
                              color: lang === code ? '#fff' : 'var(--text-muted)',
                              border:`1px solid ${lang === code ? 'var(--brand)' : 'var(--border)'}`,
                              cursor:'pointer', transition:'all 0.15s',
                            }}>
                            {l.flag} {l.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logout */}
                    <div style={{ borderTop:'1px solid var(--border)', padding:'6px 0' }}>
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold w-full text-left transition-all"
                        style={{ color:'#dc2626', background:'none', border:'none', cursor:'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background='#fee2e2'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ color:'var(--text-muted)', textDecoration:'none' }}>
                  Sign In
                </Link>
                <Link to="/register"
                  className="text-xs font-black px-4 py-2 rounded-xl text-white transition-all hover:-translate-y-0.5"
                  style={{ background:'linear-gradient(135deg, var(--brand), var(--brand-dark))', textDecoration:'none', boxShadow:'0 2px 12px rgba(45,138,78,0.35)' }}>
                  Get Started →
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
              style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display:'block', width:18, height:1.5, borderRadius:9999, background:'var(--text-primary)',
                  transform: menuOpen
                    ? i===0 ? 'rotate(45deg) translateY(5px)' : i===2 ? 'rotate(-45deg) translateY(-5px)' : 'scaleX(0)'
                    : 'none',
                  transition:'all 0.25s ease',
                }}/>
              ))}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background:'var(--bg-card)', borderTop:'1px solid var(--border)', padding:'12px 16px' }}>
          {currentUser ? (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:14, background:'var(--bg-surface)', marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, background:rc.bg, color:rc.color }}>
                  {dbUser?.name?.[0] || '?'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)' }}>{dbUser?.name}</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)' }}>{dbUser?.role} · {dbUser?.badgeCount || 0} badges</div>
                </div>
                {/* Mobile availability toggle */}
                {dbUser?.role === 'VOLUNTEER' && (
                  <button onClick={toggleAvailability}
                    style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:8, border:'none', cursor:'pointer', background: isAvailable ? '#dcfce7' : '#fee2e2', color: isAvailable ? '#166534' : '#dc2626' }}>
                    {isAvailable ? '🟢 Online' : '🔴 Offline'}
                  </button>
                )}
              </div>

              {/* Mobile language picker */}
              <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                {Object.entries(LANGS).map(([code, l]) => (
                  <button key={code} onClick={() => handleLangChange(code)}
                    style={{
                      flex:1, padding:'6px 4px', borderRadius:8, fontSize:11, fontWeight:700,
                      background: lang === code ? 'var(--brand)' : 'var(--bg-surface)',
                      color: lang === code ? '#fff' : 'var(--text-muted)',
                      border:`1px solid ${lang === code ? 'var(--brand)' : 'var(--border)'}`,
                      cursor:'pointer',
                    }}>
                    {l.flag} {l.name}
                  </button>
                ))}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:10 }}>
                {navLinks.map((l, i) => (
                  <Link key={i} to={l.to} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ textDecoration:'none', background: isActive(l.to) ? 'var(--brand)' : 'transparent', color: isActive(l.to) ? '#fff' : 'var(--text-secondary)' }}>
                    {l.label}
                  </Link>
                ))}
              </div>
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:10 }}>
                <button onClick={handleLogout}
                  style={{ width:'100%', padding:'10px', borderRadius:12, background:'#fee2e2', color:'#dc2626', fontWeight:700, fontSize:13, border:'none', cursor:'pointer' }}>
                  🚪 Sign Out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="text-center py-2.5 rounded-xl text-sm font-semibold"
                style={{ textDecoration:'none', color:'var(--text-muted)', background:'var(--bg-surface)' }}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="text-center py-2.5 rounded-xl text-sm font-black text-white"
                style={{ textDecoration:'none', background:'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                Get Started →
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}