import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getLeaderboard } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'

const getTheme   = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

const BADGE_TIERS = [
  { min:20, label:'🌟 Champion', color:'#854d0e', bg:'#fef9c3', bar:'#f59e0b' },
  { min:10, label:'🥈 Expert',   color:'#374151', bg:'#f3f4f6', bar:'#9ca3af' },
  { min:5,  label:'🥉 Active',   color:'#c2410c', bg:'#fff4ec', bar:'#fb923c' },
  { min:1,  label:'🌱 Beginner', color:'#166534', bg:'#dcfce7', bar:'#4ade80' },
  { min:0,  label:'👋 New',      color:'#1d4ed8', bg:'#dbeafe', bar:'#60a5fa' },
]
function getBadgeTier(count) {
  return BADGE_TIERS.find(t => count >= t.min) || BADGE_TIERS[BADGE_TIERS.length - 1]
}

const podiumColors = [
  { bg:'#fef9c3', color:'#854d0e', ring:'#f59e0b', medal:'🥇', size:80 },
  { bg:'#f3f4f6', color:'#374151', ring:'#9ca3af', medal:'🥈', size:64 },
  { bg:'#fff4ec', color:'#c2410c', ring:'#fb923c', medal:'🥉', size:64 },
]

export default function LeaderboardPage() {
  const { dbUser }  = useAuth()
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [tierFilter, setTierFilter] = useState('ALL')

  useEffect(() => { applyTheme(getTheme()) }, [])

  useEffect(() => {
    getLeaderboard()
      .then(r => { setVolunteers(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const maxBadges = volunteers[0]?.badgeCount || 1

  // ── My rank
  const myRank = volunteers.findIndex(v => v.id === dbUser?.id) + 1

  // ── Filtered list
  const filtered = volunteers.filter(v => {
    const matchSearch = v.name?.toLowerCase().includes(search.toLowerCase()) || search === ''
    const tier        = getBadgeTier(v.badgeCount || 0)
    const matchTier   = tierFilter === 'ALL' || tier.label === tierFilter
    return matchSearch && matchTier
  })

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-page)' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg, #1a0a00 0%, #451a03 50%, #1a0a00 100%)', padding:'40px 16px', textAlign:'center', color:'white', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize:'40px 40px' }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:64, marginBottom:12 }}>🏆</div>
          <h1 style={{ fontSize:36, fontWeight:900, marginBottom:8 }}>Volunteer Leaderboard</h1>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:15 }}>Heroes saving food and feeding lives across India</p>
          <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:14, flexWrap:'wrap' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:9999, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', fontSize:12, color:'rgba(255,255,255,0.6)' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', display:'inline-block' }}/>
              {volunteers.length} volunteers ranked
            </div>
            {/* ── My rank badge ── */}
            {myRank > 0 && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:9999, border:'1px solid rgba(45,138,78,0.4)', background:'rgba(45,138,78,0.15)', fontSize:12, color:'#4ade80', fontWeight:700 }}>
                🎯 You are ranked #{myRank}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Podium — top 3 */}
        {volunteers.length >= 3 && (
          <div className="card" style={{ marginBottom:24, padding:24 }}>
            <h3 style={{ fontWeight:700, color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em', textAlign:'center', marginBottom:20 }}>
              Top 3 This Month
            </h3>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:12 }}>
              {/* 2nd */}
              {[1, 0, 2].map(pos => {
                const v  = volunteers[pos]
                const pc = podiumColors[pos]
                const isFirst = pos === 0
                return (
                  <div key={pos} style={{ flex:1, maxWidth: isFirst ? 150 : 130, textAlign:'center' }}>
                    <div style={{ width:pc.size, height:pc.size, borderRadius:'50%', background:pc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize: isFirst ? 34 : 28, fontWeight:900, color:pc.color, margin:'0 auto 8px', border:`${isFirst?4:3}px solid ${pc.ring}`, boxShadow: isFirst ? `0 0 20px ${pc.ring}60` : 'none' }}>
                      {v?.name?.[0]}
                    </div>
                    <div style={{ fontSize: isFirst ? 36 : 28, marginBottom:4 }}>{pc.medal}</div>
                    <div style={{ background:'var(--bg-surface)', borderRadius:'12px 12px 0 0', padding: isFirst ? '16px 10px' : '14px 10px', border:'1px solid var(--border)', height: isFirst ? 90 : 70 }}>
                      <div style={{ fontWeight:900, color:'var(--text-primary)', fontSize: isFirst ? 14 : 13, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                        {v?.name?.split(' ')[0]}
                      </div>
                      <div style={{ fontWeight:900, color: isFirst ? '#f59e0b' : 'var(--text-muted)', fontSize: isFirst ? 24 : 18 }}>
                        {v?.badgeCount || 0}
                      </div>
                      <div style={{ fontSize:10, color: isFirst ? '#854d0e' : 'var(--text-muted)' }}>badges</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Search + Filter ── */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search volunteers..."
            style={{
              flex:1, minWidth:180, padding:'8px 14px', borderRadius:12, fontSize:13,
              border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)',
              outline:'none',
            }}/>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['ALL', ...BADGE_TIERS.map(t => t.label)].map(t => (
              <button key={t} onClick={() => setTierFilter(t)}
                style={{
                  padding:'6px 12px', borderRadius:9999, fontSize:11, fontWeight:700, border:'none', cursor:'pointer',
                  background: tierFilter === t ? 'var(--brand)' : 'var(--bg-surface)',
                  color:      tierFilter === t ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}>
                {t === 'ALL' ? '🌐 All' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Full list */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <div className="w-12 h-12 rounded-full animate-spin mx-auto mb-3"
              style={{ border:'4px solid #fef9c3', borderTopColor:'#f59e0b' }}/>
            <p style={{ color:'var(--text-muted)' }}>Loading leaderboard...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center" style={{ padding:48 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <p style={{ fontWeight:600, color:'var(--text-muted)' }}>
              {search ? `No results for "${search}"` : 'No volunteers yet. Be the first!'}
            </p>
            {search && (
              <button onClick={() => { setSearch(''); setTierFilter('ALL') }}
                style={{ marginTop:12, fontSize:12, color:'var(--brand)', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h2 style={{ fontWeight:700, color:'var(--text-muted)', fontSize:12, textTransform:'uppercase', letterSpacing:'0.12em' }}>
                {filtered.length} Volunteers
              </h2>
              {filtered.length !== volunteers.length && (
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>Filtered from {volunteers.length} total</span>
              )}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {filtered.map((v, i) => {
                const tier     = getBadgeTier(v.badgeCount || 0)
                const isMe     = dbUser?.id === v.id
                const globalRank = volunteers.findIndex(x => x.id === v.id) + 1
                const progress = Math.round(((v.badgeCount || 0) / maxBadges) * 100)
                const avatarColors = [
                  { bg:'#fef9c3', color:'#854d0e' },
                  { bg:'#f3f4f6', color:'#374151' },
                  { bg:'#fff4ec', color:'#c2410c' },
                ]
                const av = avatarColors[i % 3] || { bg:'var(--bg-surface)', color:'var(--text-muted)' }

                return (
                  <div key={i} style={{
                    background: isMe ? 'linear-gradient(135deg, var(--brand-light), var(--bg-card))' : 'var(--bg-card)',
                    border: isMe ? '2px solid var(--brand)' : '1px solid var(--border)',
                    borderRadius:16, padding:14,
                    boxShadow: isMe ? '0 0 0 3px rgba(45,138,78,0.12)' : 'none',
                    transition:'all 0.2s',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      {/* Rank */}
                      <div style={{ width:36, textAlign:'center', fontWeight:900, fontSize:16, color:'var(--text-muted)', flexShrink:0 }}>
                        {globalRank === 1 ? '🥇' : globalRank === 2 ? '🥈' : globalRank === 3 ? '🥉' : `#${globalRank}`}
                      </div>
                      {/* Avatar */}
                      <div style={{ width:46, height:46, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, flexShrink:0, background: isMe ? 'var(--brand-light)' : av.bg, color: isMe ? 'var(--brand)' : av.color, border: isMe ? '2px solid var(--brand)' : 'none' }}>
                        {v.name?.[0]}
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                          <span style={{ fontWeight:900, color:'var(--text-primary)', fontSize:14 }}>{v.name}</span>
                          {isMe && (
                            <span style={{ background:'var(--brand)', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:9999 }}>
                              You 🎯
                            </span>
                          )}
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:9999, background:tier.bg, color:tier.color, border:`1px solid ${tier.bar}40` }}>
                            {tier.label}
                          </span>
                        </div>
                        <div style={{ height:6, background:'var(--border)', borderRadius:9999, overflow:'hidden' }}>
                          <div style={{ height:'100%', borderRadius:9999, background: isMe ? 'var(--brand)' : tier.bar, width:`${progress}%`, transition:'width 0.5s ease' }}/>
                        </div>
                      </div>
                      {/* Badge count */}
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:24, fontWeight:900, color: isMe ? 'var(--brand)' : 'var(--text-primary)' }}>{v.badgeCount || 0}</div>
                        <div style={{ fontSize:10, color:'var(--text-muted)' }}>badges</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Badge guide */}
        <div className="card" style={{ marginTop:24, padding:20 }}>
          <h3 style={{ fontWeight:900, color:'var(--text-primary)', marginBottom:14, fontSize:14 }}>🏅 How to Earn Badges</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {BADGE_TIERS.map((t, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:9999, background:t.bg, color:t.color, minWidth:100, textAlign:'center', border:`1px solid ${t.bar}40` }}>
                  {t.label}
                </span>
                <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:9999, overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:9999, background:t.bar, width:`${(t.min/20)*100}%` }}/>
                </div>
                <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, minWidth:90, textAlign:'right' }}>
                  {i < BADGE_TIERS.length-1 ? `${t.min}+ deliveries` : 'First delivery!'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}