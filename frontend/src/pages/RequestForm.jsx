import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { createRequest, getAllDonations } from '../api/endpoints'
import { toast } from '../components/Toast'

const getTheme   = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

// ── Feature 13: NGO Auto-Match Modal
function AutoMatchModal({ matches, onClose, onNavigate }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(0,0,0,0.65)', backdropFilter:'blur(5px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'var(--bg-card)', borderRadius:24, padding:28,
        maxWidth:440, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🤖</div>
          <h3 style={{ fontWeight:900, fontSize:20, color:'var(--text-primary)', marginBottom:4 }}>
            AI Found {matches.length} Match{matches.length !== 1 ? 'es' : ''}!
          </h3>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>
            These donations near you match your food request
          </p>
        </div>

        {/* Match list */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20, maxHeight:280, overflowY:'auto' }}>
          {matches.length === 0 ? (
            <div style={{ textAlign:'center', padding:24 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
              <p style={{ color:'var(--text-muted)', fontSize:13 }}>No nearby matches found right now.</p>
              <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:4 }}>We'll notify you when food becomes available!</p>
            </div>
          ) : matches.map((d, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:12, padding:12, borderRadius:14,
              background:'var(--bg-surface)', border:'1px solid var(--border)',
            }}>
              <div style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, background:'#e8f8ee', flexShrink:0 }}>
                {d.foodType === 'VEG' ? '🥦' : d.foodType === 'NON_VEG' ? '🍗' : '📦'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {d.foodName}
                </div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                  📦 {d.quantity} servings · {d.foodType}
                </div>
                {d.pickupAddress && (
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    📍 {d.pickupAddress}
                  </div>
                )}
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:9999, background:'#dcfce7', color:'#166534' }}>
                  AVAILABLE
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onNavigate}
            style={{
              flex:1, padding:'12px', borderRadius:14, border:'none', cursor:'pointer',
              background:'linear-gradient(135deg, #e8720c, #c45e08)',
              color:'#fff', fontWeight:700, fontSize:14,
            }}>
            📍 View on Map
          </button>
          <button onClick={onClose}
            style={{
              padding:'12px 20px', borderRadius:14, border:'1px solid var(--border)',
              background:'var(--bg-surface)', color:'var(--text-muted)', fontWeight:700, fontSize:14, cursor:'pointer',
            }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RequestForm() {
  const { dbUser } = useAuth()
  const navigate   = useNavigate()
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [matches, setMatches]     = useState([])
  const [showMatch, setShowMatch] = useState(false)
  const [form, setForm] = useState({
    numberOfPeople:'', foodTypeNeeded:'ANY',
    urgencyLevel:'MEDIUM', location:'', latitude:'', longitude:''
  })

  useEffect(() => { applyTheme(getTheme()) }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        set('latitude',  pos.coords.latitude.toFixed(6))
        set('longitude', pos.coords.longitude.toFixed(6))
        toast.success('Location detected!')
      },
      () => toast.error('Could not detect location')
    )
  }

  // ── Feature 13: Find nearby matches
  const findMatches = async () => {
    try {
      const res  = await getAllDonations()
      const avail = res.data.filter(d => d.status === 'AVAILABLE')

      if (!form.latitude || !form.longitude) {
        // No GPS — match by food type only
        return avail.filter(d =>
          form.foodTypeNeeded === 'ANY' ||
          d.foodType === form.foodTypeNeeded ||
          d.foodType === 'VEG'
        ).slice(0, 5)
      }

      // Match by distance (within 10km) + food type
      const lat = parseFloat(form.latitude)
      const lng = parseFloat(form.longitude)
      return avail.filter(d => {
        if (!d.latitude || !d.longitude) return false
        const dlat = (parseFloat(d.latitude) - lat) * 111
        const dlng = (parseFloat(d.longitude) - lng) * 111 * Math.cos(lat * Math.PI/180)
        const dist = Math.sqrt(dlat*dlat + dlng*dlng)
        const foodOk = form.foodTypeNeeded === 'ANY' || d.foodType === form.foodTypeNeeded || d.foodType === 'VEG'
        return dist <= 10 && foodOk
      }).slice(0, 5)
    } catch { return [] }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await createRequest(dbUser.id, {
        ...form,
        numberOfPeople: parseInt(form.numberOfPeople),
        latitude:  parseFloat(form.latitude)  || null,
        longitude: parseFloat(form.longitude) || null,
      })
      toast.success('Food request submitted successfully!')

      // ── Feature 13: Find and show matches
      const found = await findMatches()
      setMatches(found)
      setShowMatch(true)
      setSuccess(true)
    } catch {
      toast.error('Failed to submit request. Please try again.')
    }
    setLoading(false)
  }

  const foodTypes = [
    { value:'ANY',     icon:'🍽️', label:'Any Food',        desc:'We accept all types'     },
    { value:'VEG',     icon:'🥦', label:'Vegetarian Only', desc:'No meat or eggs please'  },
    { value:'NON_VEG', icon:'🍗', label:'Non-Vegetarian',  desc:'Includes meat/fish/eggs' },
  ]
  const urgencyLevels = [
    { key:'HIGH',   icon:'🔴', label:'HIGH',   desc:'Need food urgently — today',    color:'#dc2626', bg:'#fee2e2', border:'#fca5a5' },
    { key:'MEDIUM', icon:'🟡', label:'MEDIUM', desc:'Need within 1–2 days',          color:'#854d0e', bg:'#fef9c3', border:'#fde68a' },
    { key:'LOW',    icon:'🟢', label:'LOW',    desc:'Planning ahead — 3+ days',      color:'#166534', bg:'#dcfce7', border:'#86efac' },
  ]

  if (success && !showMatch) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #431407, #7c2d12)' }}>
      <div style={{ background:'var(--bg-card)', borderRadius:24, padding:40, textAlign:'center', maxWidth:400, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ width:96, height:96, background:'#fff4ec', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:48 }}>🙏</div>
        <h2 style={{ fontSize:24, fontWeight:900, color:'var(--orange)', marginBottom:8 }}>Request Submitted!</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:16 }}>Finding the best food matches for you...</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'var(--orange)', fontSize:14 }}>
          <span className="spinner" style={{ width:16, height:16, borderTopColor:'var(--orange)' }}/>
          Searching nearby donations...
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-page)' }}>
      <Navbar />

      {/* ── Feature 13: Auto-Match Modal ── */}
      {showMatch && (
        <AutoMatchModal
          matches={matches}
          onClose={() => { setShowMatch(false); navigate('/dashboard') }}
          onNavigate={() => { setShowMatch(false); navigate('/map') }}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg, #e8720c, #c45e08)', borderRadius:20, padding:24, marginBottom:24, color:'white', boxShadow:'0 8px 32px rgba(232,114,12,0.3)' }}>
          <div className="flex items-center gap-3">
            <div style={{ width:48, height:48, background:'rgba(255,255,255,0.2)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🙏</div>
            <div>
              <h1 style={{ fontSize:22, fontWeight:900, marginBottom:2 }}>Request Food</h1>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>AI matching will find nearby donors for you</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding:28 }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Number of people */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                👥 Number of People *
              </label>
              <input type="number" min="1" value={form.numberOfPeople}
                onChange={e => set('numberOfPeople', e.target.value)}
                className="input-field" placeholder="e.g. 50 people" style={{ fontSize:18, fontWeight:700 }} required/>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>This helps us match the right quantity of food</p>
            </div>

            {/* Food preference */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                🍽️ Food Preference
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {foodTypes.map(ft => (
                  <label key={ft.value} style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                    padding:12, borderRadius:14, cursor:'pointer',
                    border:`2px solid ${form.foodTypeNeeded===ft.value ? 'var(--orange)' : 'var(--border)'}`,
                    background: form.foodTypeNeeded===ft.value ? 'var(--orange-light)' : 'var(--bg-card)',
                    transition:'all 0.2s',
                  }}>
                    <input type="radio" name="foodType" value={ft.value}
                      checked={form.foodTypeNeeded===ft.value}
                      onChange={() => set('foodTypeNeeded', ft.value)} style={{ display:'none' }}/>
                    <span style={{ fontSize:24 }}>{ft.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color: form.foodTypeNeeded===ft.value ? 'var(--orange)' : 'var(--text-muted)', textAlign:'center' }}>{ft.label}</span>
                    <span style={{ fontSize:10, color:'var(--text-muted)', textAlign:'center' }}>{ft.desc}</span>
                    {form.foodTypeNeeded===ft.value && <span style={{ fontSize:10, fontWeight:700, color:'var(--orange)' }}>✓ Selected</span>}
                  </label>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                ⚡ Urgency Level
              </label>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {urgencyLevels.map(u => (
                  <label key={u.key} style={{
                    display:'flex', alignItems:'center', gap:12, padding:14, borderRadius:14, cursor:'pointer',
                    border:`2px solid ${form.urgencyLevel===u.key ? u.border : 'var(--border)'}`,
                    background: form.urgencyLevel===u.key ? u.bg : 'var(--bg-card)',
                    transition:'all 0.2s',
                  }}>
                    <input type="radio" name="urgency" value={u.key}
                      checked={form.urgencyLevel===u.key}
                      onChange={() => set('urgencyLevel', u.key)} style={{ display:'none' }}/>
                    <span style={{ fontSize:24 }}>{u.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, fontSize:13, color: form.urgencyLevel===u.key ? u.color : 'var(--text-primary)' }}>{u.label}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{u.desc}</div>
                    </div>
                    {form.urgencyLevel===u.key && (
                      <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${u.color}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <div style={{ width:10, height:10, borderRadius:'50%', background:u.color }}/>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                📍 Delivery Location *
              </label>
              <input value={form.location} onChange={e => set('location', e.target.value)}
                className="input-field" placeholder="Enter full address or area name" required/>
            </div>

            {/* GPS */}
            <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:14, padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'var(--orange)' }}>📡 GPS Coordinates</label>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Helps AI find nearest available food within 10km</p>
                </div>
                <button type="button" onClick={getLocation} className="btn-secondary"
                  style={{ padding:'6px 14px', fontSize:12, borderRadius:10 }}>
                  Auto-detect
                </button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <input type="number" step="any" value={form.latitude} onChange={e => set('latitude', e.target.value)}
                  className="input-field" placeholder="Latitude" style={{ fontSize:13 }}/>
                <input type="number" step="any" value={form.longitude} onChange={e => set('longitude', e.target.value)}
                  className="input-field" placeholder="Longitude" style={{ fontSize:13 }}/>
              </div>
              {form.latitude && form.longitude && (
                <p style={{ fontSize:11, color:'var(--orange)', marginTop:8, fontWeight:600 }}>
                  ✅ GPS set · AI will find donations within 10km
                </p>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display:'flex', gap:12, paddingTop:4 }}>
              <button type="submit" disabled={loading} className="btn-secondary"
                style={{ flex:1, padding:'14px', fontSize:15, borderRadius:14 }}>
                {loading
                  ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                      <span className="spinner" style={{ width:18, height:18, borderTopColor:'#fff' }}/> Finding matches...
                    </span>
                  : '🙏 Submit & Find Matches'}
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-outline"
                style={{ padding:'14px 24px', borderRadius:14, fontSize:15 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}