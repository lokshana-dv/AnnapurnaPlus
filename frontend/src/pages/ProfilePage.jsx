import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { updateProfile, getVolunteerRating } from '../api/endpoints'
import { toast } from '../components/Toast'
import ImpactCertificate from '../components/ImpactCertificate'

const getTheme   = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

// ── Feature 9: Profile completion calculator
function calcCompletion(dbUser, currentUser) {
  const fields = [
    { key:'name',      label:'Full name',    done: !!dbUser?.name },
    { key:'phone',     label:'Phone number', done: !!dbUser?.phone },
    { key:'address',   label:'Address',      done: !!dbUser?.address },
    { key:'latitude',  label:'GPS location', done: !!dbUser?.latitude },
    { key:'verified',  label:'Email verified',done: !!currentUser?.emailVerified },
  ]
  const done = fields.filter(f => f.done).length
  return { fields, done, total: fields.length, pct: Math.round((done / fields.length) * 100) }
}

export default function ProfilePage() {
  const { dbUser, currentUser } = useAuth()
  const [editing, setEditing]   = useState(false)
  const [rating, setRating]     = useState(null)
  const [saved, setSaved]       = useState(false)
  const [loading, setLoading]   = useState(false)
  const [showCert, setShowCert] = useState(false)
  const [form, setForm] = useState({
    name:'', phone:'', address:'', latitude:'', longitude:''
  })

  useEffect(() => { applyTheme(getTheme()) }, [])

  useEffect(() => {
    if (!dbUser) return
    setForm({
      name:      dbUser.name      || '',
      phone:     dbUser.phone     || '',
      address:   dbUser.address   || '',
      latitude:  dbUser.latitude  || '',
      longitude: dbUser.longitude || '',
    })
    if (dbUser.role === 'VOLUNTEER') {
      getVolunteerRating(dbUser.id)
        .then(r => setRating(r.data.averageRating))
        .catch(() => {})
    }
  }, [dbUser])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(dbUser.id, form)
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Update failed. Please try again.')
    }
    setLoading(false)
  }

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setForm(f => ({
        ...f,
        latitude:  pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }))
      toast.success('Location detected!')
    }, () => toast.error('Could not detect location'))
  }

  const badgeTiers = [
    { min:20, label:'🌟 Champion', color:'#854d0e', bg:'#fef9c3' },
    { min:10, label:'🥈 Expert',   color:'#374151', bg:'#f3f4f6' },
    { min:5,  label:'🥉 Active',   color:'#c2410c', bg:'#fff4ec' },
    { min:1,  label:'🌱 Beginner', color:'#166534', bg:'#dcfce7' },
    { min:0,  label:'👋 New',      color:'#1d4ed8', bg:'#dbeafe' },
  ]
  const tier = badgeTiers.find(t => (dbUser?.badgeCount || 0) >= t.min) || badgeTiers[badgeTiers.length - 1]

  const roleConfig = {
    DONOR:     { bg:'linear-gradient(135deg,#2d8a4e,#1f6b3a)', icon:'🏠', color:'#2d8a4e', lightBg:'#e8f8ee' },
    VOLUNTEER: { bg:'linear-gradient(135deg,#2563eb,#1d4ed8)', icon:'🚴', color:'#2563eb', lightBg:'#dbeafe' },
    NGO:       { bg:'linear-gradient(135deg,#e8720c,#c45e08)', icon:'🏢', color:'#e8720c', lightBg:'#fff4ec' },
    ADMIN:     { bg:'linear-gradient(135deg,#7c3aed,#5b21b6)', icon:'⚙️', color:'#7c3aed', lightBg:'#f3e8ff' },
  }
  const rc = roleConfig[dbUser?.role] || roleConfig.DONOR

  const nextTierMin = badgeTiers[badgeTiers.findIndex(t => (dbUser?.badgeCount||0) >= t.min) - 1]?.min || 20
  const progress    = Math.min(((dbUser?.badgeCount || 0) / nextTierMin) * 100, 100)

  // ── Feature 9: Profile completion
  const completion = calcCompletion(dbUser, currentUser)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-page)' }}>
      <Navbar />

      {/* Certificate Modal */}
      {showCert && (
        <ImpactCertificate
          user={dbUser}
          stats={{ estimatedMealsServed: (dbUser?.badgeCount||0) * 5, wasteReducedKg: Math.floor((dbUser?.badgeCount||0) * 2.5) }}
          onClose={() => setShowCert(false)}
        />
      )}

      {/* Header */}
      <div style={{ background: rc.bg, padding:'24px 16px', color:'white' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black">My Profile</h1>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:13, marginTop:2 }}>
              Manage your account and preferences
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setShowCert(true)}
              style={{ textDecoration:'none', background:'rgba(255,255,255,0.2)', color:'white', padding:'8px 16px', borderRadius:12, fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>
              🏆 Certificate
            </button>
            <Link to="/dashboard"
              style={{ textDecoration:'none', background:'rgba(255,255,255,0.15)', color:'white', padding:'8px 16px', borderRadius:12, fontSize:13, fontWeight:700 }}>
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6" style={{ display:'flex', flexDirection:'column', gap:20 }}>

        {saved && (
          <div style={{ background:'#e8f8ee', border:'1px solid #b8e0c4', borderLeft:'3px solid #2d8a4e', color:'#1f6b3a', borderRadius:12, padding:'12px 16px', fontSize:14, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
            ✅ Profile updated successfully!
          </div>
        )}

        {/* ── Feature 9: Profile Completion Meter ── */}
        {completion.pct < 100 && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderLeft: `4px solid ${completion.pct >= 80 ? '#2d8a4e' : completion.pct >= 60 ? '#e8720c' : '#dc2626'}`,
            borderRadius: 16, padding: '16px 20px',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:14, color:'var(--text-primary)' }}>
                  Complete your profile — {completion.pct}%
                </div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                  {completion.done}/{completion.total} fields filled · Better matching with donors & volunteers
                </div>
              </div>
              <div style={{
                width:48, height:48, borderRadius:'50%',
                background: `conic-gradient(${completion.pct >= 80 ? '#2d8a4e' : completion.pct >= 60 ? '#e8720c' : '#dc2626'} ${completion.pct * 3.6}deg, var(--border) 0deg)`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--bg-card)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'var(--text-primary)' }}>
                  {completion.pct}%
                </div>
              </div>
            </div>
            {/* Missing fields list */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {completion.fields.filter(f => !f.done).map((f,i) => (
                <span key={i} style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:9999, background:'#fee2e2', color:'#dc2626' }}>
                  ✕ {f.label}
                </span>
              ))}
              {completion.fields.filter(f => f.done).map((f,i) => (
                <span key={i} style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:9999, background:'#dcfce7', color:'#166534' }}>
                  ✓ {f.label}
                </span>
              ))}
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)}
                style={{ marginTop:12, fontSize:12, fontWeight:700, padding:'6px 16px', borderRadius:10, background:'var(--brand)', color:'#fff', border:'none', cursor:'pointer' }}>
                Complete Profile Now →
              </button>
            )}
          </div>
        )}

        {/* Profile Hero Card */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ height:6, background: rc.bg }}/>
          <div style={{ padding:24 }}>
            <div className="flex items-start gap-5 flex-wrap">
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background: rc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:900, color:'white', boxShadow:`0 4px 20px ${rc.color}40` }}>
                  {dbUser?.name?.[0] || '?'}
                </div>
                <div style={{ position:'absolute', bottom:4, right:4, width:14, height:14, borderRadius:'50%', background:'#2d8a4e', border:'2px solid var(--bg-card)' }}/>
              </div>
              <div style={{ flex:1, minWidth:200 }}>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 style={{ fontSize:22, fontWeight:900, color:'var(--text-primary)' }}>{dbUser?.name}</h2>
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:9999, background:tier.bg, color:tier.color }}>
                    {tier.label}
                  </span>
                </div>
                <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:8 }}>{currentUser?.email}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:9999, background:rc.lightBg, color:rc.color }}>
                    {rc.icon} {dbUser?.role}
                  </span>
                  {currentUser?.emailVerified
                    ? <span style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:9999, background:'#dcfce7', color:'#166534' }}>✅ Verified</span>
                    : <span style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:9999, background:'#fef9c3', color:'#854d0e' }}>⚠️ Unverified</span>
                  }
                </div>
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)} className="btn-outline"
                  style={{ padding:'8px 18px', fontSize:13, borderRadius:12, flexShrink:0 }}>
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {/* Badge progress */}
            <div style={{ marginTop:20, padding:16, borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)' }}>Badge Progress</span>
                <span style={{ fontSize:12, fontWeight:700, color:tier.color }}>{dbUser?.badgeCount || 0} / {nextTierMin} for next tier</span>
              </div>
              <div style={{ height:8, background:'var(--border)', borderRadius:9999, overflow:'hidden', marginBottom:6 }}>
                <div style={{ height:'100%', borderRadius:9999, background: rc.bg, width:`${progress}%`, transition:'width 0.8s ease' }}/>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-muted)' }}>
                <span>Current: {tier.label}</span>
                <span>{Math.round(progress)}% to next tier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[
            { icon:'🏅', label:'Badges Earned', value: dbUser?.badgeCount || 0, color:'#854d0e', bg:'#fef9c3' },
            { icon:'⭐', label:'Avg Rating',    value: rating !== null ? `${rating}/5` : '—', color:'#e8720c', bg:'#fff4ec' },
            { icon:'✉️', label:'Email Status',  value: currentUser?.emailVerified ? 'Verified' : 'Pending', color: currentUser?.emailVerified ? '#166534' : '#854d0e', bg: currentUser?.emailVerified ? '#dcfce7' : '#fef9c3' },
          ].map((s, i) => (
            <div key={i} className="card text-center" style={{ padding:16 }}>
              <div style={{ fontSize:28, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Profile Details / Edit Form */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ fontWeight:900, fontSize:16, color:'var(--text-primary)' }}>
              {editing ? '✏️ Edit Your Details' : '📋 Profile Details'}
            </h3>
            {editing && (
              <button onClick={() => setEditing(false)}
                style={{ fontSize:12, color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>
                Cancel
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[
                { key:'name',    label:'Full Name',       placeholder:'Your full name',       type:'text' },
                { key:'phone',   label:'Phone Number',    placeholder:'+91 XXXXXXXXXX',       type:'text' },
                { key:'address', label:'Address / Area',  placeholder:'Your area/city',       type:'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                    {f.label}
                  </label>
                  <input type={f.type} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                    className="input-field" placeholder={f.placeholder}/>
                </div>
              ))}

              {/* GPS */}
              <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:14, padding:16 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div>
                    <label style={{ fontSize:13, fontWeight:700, color:'var(--brand)' }}>📡 GPS Location</label>
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Used for AI matching with nearby donations</p>
                  </div>
                  <button type="button" onClick={getLocation} className="btn-primary"
                    style={{ padding:'6px 14px', fontSize:12, borderRadius:10 }}>
                    Auto-detect
                  </button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <input type="number" step="any" value={form.latitude} onChange={e => set('latitude', e.target.value)}
                    className="input-field" placeholder="Latitude e.g. 11.6643" style={{ fontSize:13 }}/>
                  <input type="number" step="any" value={form.longitude} onChange={e => set('longitude', e.target.value)}
                    className="input-field" placeholder="Longitude e.g. 78.1460" style={{ fontSize:13 }}/>
                </div>
              </div>

              <div style={{ display:'flex', gap:12 }}>
                <button type="submit" disabled={loading} className="btn-primary"
                  style={{ flex:1, padding:'13px', fontSize:14, borderRadius:14 }}>
                  {loading
                    ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                        <span className="spinner" style={{ width:16, height:16 }}/> Saving...
                      </span>
                    : '💾 Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-outline"
                  style={{ padding:'13px 20px', borderRadius:14, fontSize:14 }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { icon:'👤', label:'Full Name',    value: dbUser?.name     || 'Not set' },
                { icon:'📧', label:'Email',        value: currentUser?.email },
                { icon:'📱', label:'Phone',        value: dbUser?.phone    || 'Not set' },
                { icon:'🏠', label:'Address',      value: dbUser?.address  || 'Not set' },
                { icon:'📍', label:'GPS Location', value: dbUser?.latitude ? `${dbUser.latitude}, ${dbUser.longitude}` : 'Not set' },
              ].map((row, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:12, background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                  <div style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, background:'var(--bg-card)', flexShrink:0 }}>
                    {row.icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>{row.label}</div>
                    <div style={{ fontSize:13, fontWeight:600, color: row.value === 'Not set' ? 'var(--text-muted)' : 'var(--text-primary)', fontStyle: row.value === 'Not set' ? 'italic' : 'normal', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {row.value}
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setEditing(true)} className="btn-primary"
                style={{ padding:'13px', fontSize:14, borderRadius:14, marginTop:4 }}>
                ✏️ Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
          {[
            { to:'/dashboard',   icon:'📊', label:'Dashboard',   color:'#2d8a4e', bg:'#e8f8ee' },
            { to:'/leaderboard', icon:'🏆', label:'Leaderboard', color:'#854d0e', bg:'#fef9c3' },
            { to:'/map',         icon:'📍', label:'Live Map',    color:'#2563eb', bg:'#dbeafe' },
            ...(dbUser?.role === 'DONOR'     ? [{ to:'/donate',   icon:'🍱', label:'Donate Food',   color:'#2d8a4e', bg:'#e8f8ee' }] : []),
            ...(dbUser?.role === 'NGO'       ? [{ to:'/request',  icon:'🙏', label:'Request Food',  color:'#e8720c', bg:'#fff4ec' }] : []),
            ...(dbUser?.role === 'VOLUNTEER' ? [{ to:'/tracking', icon:'🚚', label:'My Deliveries', color:'#e8720c', bg:'#fff4ec' }] : []),
            ...(dbUser?.role === 'ADMIN'     ? [{ to:'/admin',    icon:'⚙️', label:'Admin Panel',   color:'#7c3aed', bg:'#f3e8ff' }] : []),
          ].map((l, i) => (
            <Link key={i} to={l.to} className="card-hover flex items-center gap-3"
              style={{ textDecoration:'none', padding:14 }}>
              <div style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, background:l.bg, flexShrink:0 }}>
                {l.icon}
              </div>
              <span style={{ fontWeight:700, fontSize:13, color:l.color }}>{l.label}</span>
              <span style={{ marginLeft:'auto', fontSize:16, color:'var(--text-muted)' }}>→</span>
            </Link>
          ))}
        </div>

        {/* Badge Guide */}
        <div className="card">
          <h3 style={{ fontWeight:900, fontSize:15, color:'var(--text-primary)', marginBottom:16 }}>🏅 Badge Tiers</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { min:20, label:'🌟 Champion', color:'#854d0e', bg:'#fef9c3', bar:'#f59e0b' },
              { min:10, label:'🥈 Expert',   color:'#374151', bg:'#f3f4f6', bar:'#9ca3af' },
              { min:5,  label:'🥉 Active',   color:'#c2410c', bg:'#fff4ec', bar:'#fb923c' },
              { min:1,  label:'🌱 Beginner', color:'#166534', bg:'#dcfce7', bar:'#4ade80' },
              { min:0,  label:'👋 New',      color:'#1d4ed8', bg:'#dbeafe', bar:'#60a5fa' },
            ].map((t, i, arr) => {
              const isCurrentTier = (dbUser?.badgeCount || 0) >= t.min && (i === 0 || (dbUser?.badgeCount || 0) < arr[i-1].min)
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:12, background: isCurrentTier ? t.bg : 'var(--bg-surface)', border: isCurrentTier ? `2px solid ${t.bar}` : '1px solid var(--border)' }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:9999, background:t.bg, color:t.color, minWidth:100, textAlign:'center' }}>{t.label}</span>
                  <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:9999, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:9999, background:t.bar, width:`${(t.min/20)*100}%` }}/>
                  </div>
                  <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, minWidth:80, textAlign:'right' }}>
                    {t.min > 0 ? `${t.min}+ deliveries` : 'First delivery'}
                  </span>
                  {isCurrentTier && (
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:9999, background:t.bar, color:'#fff', flexShrink:0 }}>YOU</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}