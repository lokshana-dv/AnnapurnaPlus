import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { getVolunteerDeliveries, updateDeliveryStatus, awardBadge } from '../api/endpoints'
import { toast } from '../components/Toast'

const getTheme   = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

const STAGES = [
  { key:'DONATED',            label:'Donated',    icon:'🍱', color:'#2d8a4e', lightBg:'#e8f8ee' },
  { key:'ACCEPTED',           label:'Accepted',   icon:'✅', color:'#2563eb', lightBg:'#dbeafe' },
  { key:'PICKUP_IN_PROGRESS', label:'Picked Up',  icon:'🚴', color:'#e8720c', lightBg:'#fff4ec' },
  { key:'DELIVERED',          label:'Delivered!', icon:'🎉', color:'#7c3aed', lightBg:'#f3e8ff' },
]

function StatusStepper({ currentStatus }) {
  const currentIdx = STAGES.findIndex(s => s.key === currentStatus)
  return (
    <div style={{ width:'100%', margin:'20px 0' }}>
      <div style={{ display:'flex', alignItems:'flex-start' }}>
        {STAGES.map((stage, i) => (
          <div key={stage.key} style={{ display:'flex', alignItems:'center', flex:1 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{
                width:48, height:48, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:20, fontWeight:700,
                background: i <= currentIdx ? stage.color : 'var(--bg-surface)',
                color: i <= currentIdx ? '#fff' : 'var(--text-muted)',
                border: i <= currentIdx ? 'none' : '2px solid var(--border)',
                transform: i === currentIdx ? 'scale(1.15)' : 'scale(1)',
                boxShadow: i === currentIdx ? `0 4px 16px ${stage.color}50` : 'none',
                transition:'all 0.3s ease',
              }}>
                {i < currentIdx ? '✓' : stage.icon}
              </div>
              <span style={{ fontSize:10, marginTop:8, textAlign:'center', fontWeight:600, maxWidth:64, color: i <= currentIdx ? stage.color : 'var(--text-muted)', lineHeight:1.3 }}>
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ flex:1, height:3, margin:'0 6px', marginBottom:20, borderRadius:9999, background: i < currentIdx ? STAGES[i].color : 'var(--border)', transition:'background 0.5s ease' }}/>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Feature 6: Star Rating Component
function StarRating({ deliveryId, foodName, onRate, onClose }) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const labels = ['','Poor','Fair','Good','Great','Excellent!']
  const colors = ['','#dc2626','#e8720c','#f59e0b','#2d8a4e','#2563eb']

  const handleSubmit = async () => {
    if (!selected) return
    await onRate(deliveryId, selected)
    setSubmitted(true)
    setTimeout(onClose, 1800)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'var(--bg-card)', borderRadius:24, padding:32,
        maxWidth:360, width:'100%', textAlign:'center',
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {submitted ? (
          <>
            <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
            <h3 style={{ fontWeight:900, fontSize:20, color:'var(--text-primary)', marginBottom:8 }}>Thank you!</h3>
            <p style={{ color:'var(--text-muted)', fontSize:14 }}>Your rating helps improve our volunteer network.</p>
          </>
        ) : (
          <>
            <div style={{ fontSize:48, marginBottom:12 }}>⭐</div>
            <h3 style={{ fontWeight:900, fontSize:18, color:'var(--text-primary)', marginBottom:4 }}>Rate this delivery</h3>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>
              How was your experience with <strong>{foodName}</strong>?
            </p>

            {/* Stars */}
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:12 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(n)}
                  style={{
                    fontSize: 36, background:'none', border:'none', cursor:'pointer',
                    transform: (hovered >= n || selected >= n) ? 'scale(1.2)' : 'scale(1)',
                    filter: (hovered >= n || selected >= n) ? 'none' : 'grayscale(1)',
                    transition:'all 0.15s ease',
                  }}>
                  ⭐
                </button>
              ))}
            </div>

            {/* Label */}
            {(hovered || selected) > 0 && (
              <div style={{ fontSize:14, fontWeight:700, color: colors[hovered || selected], marginBottom:16, height:20 }}>
                {labels[hovered || selected]}
              </div>
            )}

            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={handleSubmit} disabled={!selected}
                style={{ padding:'10px 24px', borderRadius:12, background: selected ? 'linear-gradient(135deg, #2d8a4e, #1f6b3a)' : 'var(--bg-surface)', color: selected ? '#fff' : 'var(--text-muted)', fontWeight:700, fontSize:14, border:'none', cursor: selected ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}>
                Submit Rating
              </button>
              <button onClick={onClose}
                style={{ padding:'10px 20px', borderRadius:12, background:'var(--bg-surface)', color:'var(--text-muted)', fontWeight:700, fontSize:14, border:'1px solid var(--border)', cursor:'pointer' }}>
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function TrackingPage() {
  const { dbUser } = useAuth()
  const [deliveries, setDeliveries]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [ratingModal, setRatingModal]   = useState(null) // { deliveryId, foodName }
  const [ratedIds, setRatedIds]         = useState(new Set())

  useEffect(() => { applyTheme(getTheme()) }, [])

  useEffect(() => {
    if (!dbUser) return
    getVolunteerDeliveries(dbUser.id)
      .then(r => { setDeliveries(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [dbUser])

  const advanceStatus = async (delivery) => {
    const stages    = ['DONATED','ACCEPTED','PICKUP_IN_PROGRESS','DELIVERED']
    const nextIdx   = stages.indexOf(delivery.status) + 1
    if (nextIdx >= stages.length) return
    const nextStatus = stages[nextIdx]
    try {
      const res = await updateDeliveryStatus(delivery.id, nextStatus)
      setDeliveries(prev => prev.map(d => d.id === delivery.id ? res.data : d))
      if (nextStatus === 'DELIVERED') {
        await awardBadge(dbUser.id)
        toast.success('🏅 Badge awarded! Great job delivering!', '✅ Delivered!')
        // ── Feature 6: Show rating modal after delivery
        setTimeout(() => {
          setRatingModal({ deliveryId: delivery.id, foodName: delivery.donation?.foodName || 'Food' })
        }, 800)
      } else {
        toast.info(`Status updated to ${nextStatus.replace(/_/g,' ')}`)
      }
    } catch {
      toast.error('Update failed. Please try again.')
    }
  }

  const handleRate = async (deliveryId, stars) => {
    try {
      // POST to your feedback endpoint
      // await submitFeedback(deliveryId, { rating: stars, comment: '' })
      setRatedIds(prev => new Set([...prev, deliveryId]))
      toast.success(`Thanks for rating ${stars} ⭐!`, 'Rating Submitted')
    } catch {
      toast.error('Could not submit rating')
    }
  }

  const nextActionMap = {
    DONATED:            { label:'✅ Accept This Delivery', bg:'linear-gradient(135deg,#2563eb,#1d4ed8)' },
    ACCEPTED:           { label:'🚴 Start Pickup Now',     bg:'linear-gradient(135deg,#e8720c,#c45e08)' },
    PICKUP_IN_PROGRESS: { label:'✅ Mark as Delivered',    bg:'linear-gradient(135deg,#7c3aed,#5b21b6)' },
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-page)' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full animate-spin mx-auto mb-4"
          style={{ border:'4px solid var(--brand-light)', borderTopColor:'var(--brand)' }}/>
        <p style={{ color:'var(--text-muted)', fontWeight:600 }}>Loading deliveries...</p>
      </div>
    </div>
  )

  const active    = deliveries.filter(d => d.status !== 'DELIVERED')
  const completed = deliveries.filter(d => d.status === 'DELIVERED')

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-page)' }}>
      <Navbar />

      {/* ── Feature 6: Rating Modal ── */}
      {ratingModal && (
        <StarRating
          deliveryId={ratingModal.deliveryId}
          foodName={ratingModal.foodName}
          onRate={handleRate}
          onClose={() => setRatingModal(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg, #e8720c, #c45e08)', borderRadius:20, padding:24, marginBottom:24, color:'white', boxShadow:'0 8px 32px rgba(232,114,12,0.3)' }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 style={{ fontSize:24, fontWeight:900, marginBottom:4 }}>🚚 Delivery Tracking</h1>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>Track your deliveries from pickup to doorstep</p>
            </div>
            <div className="flex gap-3">
              <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'8px 16px', textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:900 }}>{active.length}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)' }}>Active</div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'8px 16px', textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:900 }}>{completed.length}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)' }}>Completed</div>
              </div>
            </div>
          </div>
          {deliveries.length > 0 && (
            <div style={{ marginTop:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,0.6)', marginBottom:6 }}>
                <span>Overall Progress</span>
                <span>{completed.length}/{deliveries.length} completed</span>
              </div>
              <div style={{ height:4, background:'rgba(255,255,255,0.2)', borderRadius:9999, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'rgba(255,255,255,0.9)', borderRadius:9999, width:`${deliveries.length ? (completed.length/deliveries.length)*100 : 0}%`, transition:'width 0.5s ease' }}/>
              </div>
            </div>
          )}
        </div>

        {deliveries.length === 0 ? (
          <div className="card text-center" style={{ padding:48 }}>
            <div style={{ fontSize:64, marginBottom:16 }}>📭</div>
            <h3 style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>No Deliveries Yet</h3>
            <p style={{ color:'var(--text-muted)', marginBottom:24 }}>Accept a pickup from the map to get started!</p>
            <Link to="/map" className="btn-primary" style={{ textDecoration:'none', display:'inline-flex', padding:'12px 28px', fontSize:14 }}>
              📍 Go to Live Map
            </Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Active deliveries */}
            {active.length > 0 && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <span style={{ fontSize:18 }}>🔥</span>
                  <h2 style={{ fontWeight:700, color:'var(--text-primary)', fontSize:16 }}>Active Deliveries</h2>
                  <span style={{ background:'#fff4ec', color:'#e8720c', fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:9999 }}>{active.length}</span>
                </div>
                {active.map((delivery, i) => {
                  const next      = nextActionMap[delivery.status]
                  const stageInfo = STAGES.find(s => s.key === delivery.status)
                  const pickup    = delivery.donation
                  const dropoff   = delivery.request
                  const mapsUrl   = (pickup?.latitude && dropoff?.latitude)
                    ? `https://www.google.com/maps/dir/${pickup.latitude},${pickup.longitude}/${dropoff.latitude},${dropoff.longitude}`
                    : (pickup?.pickupAddress && dropoff?.location)
                    ? `https://www.google.com/maps/dir/${encodeURIComponent(pickup.pickupAddress)}/${encodeURIComponent(dropoff.location)}`
                    : null

                  return (
                    <div key={i} className="card" style={{ marginBottom:12, border:`1px solid ${stageInfo?.color}25` }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:8, marginBottom:8 }}>
                        <div>
                          <h3 style={{ fontWeight:900, color:'var(--text-primary)', fontSize:16, marginBottom:3 }}>
                            Delivery #{delivery.id}
                          </h3>
                          <p style={{ fontSize:13, color:'var(--text-muted)' }}>
                            🍱 <span style={{ fontWeight:600 }}>{delivery.donation?.foodName || 'Food'}</span>
                            {delivery.request?.location && <> → 📍 {delivery.request.location}</>}
                          </p>
                          {delivery.donation?.pickupAddress && (
                            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>
                              📌 Pickup: {delivery.donation.pickupAddress}
                            </p>
                          )}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                          <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:9999, background: stageInfo?.lightBg, color: stageInfo?.color }}>
                            {delivery.status?.replace(/_/g,' ')}
                          </span>
                          {mapsUrl && (
                            <a href={mapsUrl} target="_blank" rel="noreferrer"
                              style={{ fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:10, background:'#dbeafe', color:'#1d4ed8', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5 }}>
                              🗺️ Get Directions
                            </a>
                          )}
                        </div>
                      </div>
                      <StatusStepper currentStatus={delivery.status} />
                      {next && (
                        <button onClick={() => advanceStatus(delivery)}
                          style={{ width:'100%', padding:'13px', color:'white', fontWeight:900, borderRadius:14, border:'none', cursor:'pointer', fontSize:14, background:next.bg, boxShadow:`0 4px 16px rgba(0,0,0,0.2)`, transition:'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
                          onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                          {next.label}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Completed deliveries */}
            {completed.length > 0 && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <span style={{ fontSize:18 }}>✅</span>
                  <h2 style={{ fontWeight:700, color:'var(--text-primary)', fontSize:16 }}>Completed Deliveries</h2>
                  <span style={{ background:'#f3e8ff', color:'#7c3aed', fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:9999 }}>{completed.length}</span>
                </div>
                {completed.map((delivery, i) => (
                  <div key={i} className="card" style={{ marginBottom:10, border:'1px solid #e9d5ff' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                      <div>
                        <h3 style={{ fontWeight:700, color:'var(--text-primary)', fontSize:15 }}>Delivery #{delivery.id}</h3>
                        <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{delivery.donation?.foodName}</p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:9999, background:'#f3e8ff', color:'#7c3aed' }}>
                          ✓ DELIVERED
                        </span>
                        {/* ── Feature 6: Rate button for completed ── */}
                        {!ratedIds.has(delivery.id) && (
                          <button
                            onClick={() => setRatingModal({ deliveryId: delivery.id, foodName: delivery.donation?.foodName || 'Food' })}
                            style={{ fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:10, background:'#fef9c3', color:'#854d0e', border:'none', cursor:'pointer' }}>
                            ⭐ Rate
                          </button>
                        )}
                        {ratedIds.has(delivery.id) && (
                          <span style={{ fontSize:11, fontWeight:600, color:'#166534' }}>⭐ Rated</span>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop:12, background:'linear-gradient(135deg, #f3e8ff, #fce7f3)', borderRadius:12, padding:'12px 16px', textAlign:'center' }}>
                      <span style={{ color:'#7c3aed', fontWeight:700, fontSize:13 }}>🎉 You earned a badge for this delivery! 🏅</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}