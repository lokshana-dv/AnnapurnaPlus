import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import { getAllDonations, getAllRequests } from '../api/endpoints'
import { toast } from '../components/Toast'

const getTheme   = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

export default function MapPage() {
  const [donations, setDonations]   = useState([])
  const [requests, setRequests]     = useState([])
  const [filter, setFilter]         = useState('ALL')
  const [foodFilter, setFoodFilter] = useState('ALL')  // ✅ Feature 4
  const [selected, setSelected]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [mapMode, setMapMode]       = useState('markers') // ✅ Feature 1: 'markers' | 'heatmap'
  const [userLocation, setUserLocation] = useState(null)  // ✅ Feature 3
  const [showRadius, setShowRadius] = useState(false)     // ✅ Feature 5
  const [locating, setLocating]     = useState(false)
  const mapRef = useRef(null)

  useEffect(() => { applyTheme(getTheme()) }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donRes, reqRes] = await Promise.all([getAllDonations(), getAllRequests()])
        setDonations(donRes.data)
        setRequests(reqRes.data)
      } catch(e) { console.error(e) }
      setLoading(false)
    }
    fetchData()
  }, [])

  // ── Feature 3: Get user location
  const handleLocateMe = () => {
    setLocating(true)
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        setLocating(false)
        toast.success('Location found! Centered map on you.')
        // Pan map to user
        if (mapRef.current) {
          mapRef.current.setView([loc.lat, loc.lng], 12)
        }
      },
      () => {
        setLocating(false)
        toast.error('Could not get your location. Please allow location access.')
      }
    )
  }

  // ── Build/rebuild map whenever data, mode, userLocation, or showRadius changes
  useEffect(() => {
    if (loading) return
    if (typeof window === 'undefined') return
    const L = window.L
    if (!L) return

    setTimeout(() => {
      const mapEl = document.getElementById('leaflet-map')
      if (!mapEl) return
      if (mapEl._leaflet_id) { mapRef.current?.remove(); mapEl._leaflet_id = null }

      const map = L.map('leaflet-map').setView(
        userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629],
        userLocation ? 12 : 5
      )
      mapRef.current = map

      // Tile layer — dark inversion for dark mode
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:'© OpenStreetMap contributors'
      }).addTo(map)
      if (isDark) {
        tileLayer.getContainer && setTimeout(() => {
          const el = document.querySelector('#leaflet-map .leaflet-layer')
          if (el) el.style.filter = 'invert(1) hue-rotate(180deg)'
        }, 400)
      }

      const makeIcon = (emoji, color) => L.divIcon({
        html:`<div style="font-size:28px;filter:drop-shadow(0 3px 6px ${color}80)">${emoji}</div>`,
        className:'', iconSize:[36,36], iconAnchor:[18,18]
      })

      // ── Feature 4: food type filtered donations
      const filteredDonations = donations.filter(d => {
        if (foodFilter !== 'ALL' && d.foodType !== foodFilter) return false
        return d.latitude && d.longitude
      })

      // ── Feature 1: HEATMAP MODE
      if (mapMode === 'heatmap') {
        if (window.L.heatLayer) {
          const heatPoints = filteredDonations.map(d => [
            parseFloat(d.latitude), parseFloat(d.longitude), 1
          ])
          window.L.heatLayer(heatPoints, {
            radius: 35, blur: 20, maxZoom: 10,
            gradient: { 0.2:'#2d8a4e', 0.5:'#f59e0b', 0.8:'#e8720c', 1.0:'#dc2626' }
          }).addTo(map)
        } else {
          // Fallback if leaflet.heat not loaded
          filteredDonations.forEach(d => {
            L.circleMarker([d.latitude, d.longitude], {
              radius:16, fillColor:'#2d8a4e', color:'#fff',
              weight:2, opacity:0.9, fillOpacity:0.6
            }).addTo(map)
          })
        }
      } else {
        // ── MARKERS MODE (default)

        // ── Feature 2: Simple cluster grouping using bounds
        // Group markers that are very close — show count badge
        const placed = new Set()

        filteredDonations.forEach((d, idx) => {
          const key = `${parseFloat(d.latitude).toFixed(2)}_${parseFloat(d.longitude).toFixed(2)}`
          const nearby = filteredDonations.filter((x, xi) =>
            xi !== idx &&
            Math.abs(parseFloat(x.latitude) - parseFloat(d.latitude)) < 0.02 &&
            Math.abs(parseFloat(x.longitude) - parseFloat(d.longitude)) < 0.02
          )

          const icon = nearby.length > 0 && !placed.has(key)
            ? L.divIcon({
                html:`<div style="position:relative;font-size:24px">🍱<span style="position:absolute;top:-4px;right:-8px;background:#dc2626;color:#fff;font-size:10px;font-weight:900;border-radius:9999px;padding:1px 5px;min-width:16px;text-align:center">${nearby.length + 1}</span></div>`,
                className:'', iconSize:[40,40], iconAnchor:[20,20]
              })
            : makeIcon('🍱','#2d8a4e')

          placed.add(key)

          L.marker([d.latitude, d.longitude], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family:sans-serif;min-width:210px;padding:4px">
                <div style="font-size:15px;font-weight:900;margin-bottom:6px;color:#1c3a1c">🍱 ${d.foodName}</div>
                <div style="color:#6b7280;font-size:12px;margin-bottom:3px">📦 Qty: <b>${d.quantity}</b> servings</div>
                <div style="color:#6b7280;font-size:12px;margin-bottom:3px">🥗 Type: ${d.foodType}</div>
                <div style="color:#6b7280;font-size:12px;margin-bottom:6px">👤 Donor: ${d.donor?.name || '—'}</div>
                <span style="background:${d.status==='AVAILABLE'?'#dcfce7':'#fef9c3'};color:${d.status==='AVAILABLE'?'#166534':'#854d0e'};padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700">
                  ${d.status}
                </span>
                ${d.pickupAddress ? `<div style="color:#9ca3af;font-size:11px;margin-top:6px">📍 ${d.pickupAddress}</div>` : ''}
                ${d.expiryTime ? `<div style="color:#e8720c;font-size:11px;margin-top:4px">⏰ Expires: ${new Date(d.expiryTime).toLocaleString('en-IN',{hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'})}</div>` : ''}
              </div>`)
        })

        requests.filter(r => r.latitude && r.longitude).forEach(r => {
          L.marker([r.latitude, r.longitude], { icon: makeIcon('🙏','#e8720c') })
            .addTo(map)
            .bindPopup(`
              <div style="font-family:sans-serif;min-width:210px;padding:4px">
                <div style="font-size:15px;font-weight:900;margin-bottom:6px;color:#431407">🙏 Food Request</div>
                <div style="color:#6b7280;font-size:12px;margin-bottom:3px">👥 People: <b>${r.numberOfPeople}</b></div>
                <div style="color:#6b7280;font-size:12px;margin-bottom:6px">🍽️ Type: ${r.foodTypeNeeded}</div>
                <span style="background:${r.urgencyLevel==='HIGH'?'#fee2e2':r.urgencyLevel==='MEDIUM'?'#fef9c3':'#dcfce7'};color:${r.urgencyLevel==='HIGH'?'#dc2626':r.urgencyLevel==='MEDIUM'?'#854d0e':'#166534'};padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700">
                  ${r.urgencyLevel} URGENCY
                </span>
              </div>`)
        })
      }

      // ── Feature 3: User location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          html:`<div style="width:18px;height:18px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(37,99,235,0.3)"></div>`,
          className:'', iconSize:[18,18], iconAnchor:[9,9]
        })
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family:sans-serif;font-weight:700;color:#2563eb">📍 You are here</div>`)
          .openPopup()

        // ── Feature 5: 5km radius circle
        if (showRadius) {
          L.circle([userLocation.lat, userLocation.lng], {
            radius: 5000,
            color: '#2563eb', fillColor: '#2563eb',
            fillOpacity: 0.06, weight: 2, dashArray: '6,4'
          }).addTo(map)

          // Count donations within radius (simple haversine approximation)
          const nearby = donations.filter(d => {
            if (!d.latitude || !d.longitude) return false
            const dlat = (parseFloat(d.latitude) - userLocation.lat) * 111
            const dlng = (parseFloat(d.longitude) - userLocation.lng) * 111 * Math.cos(userLocation.lat * Math.PI/180)
            return Math.sqrt(dlat*dlat + dlng*dlng) <= 5
          })

          if (nearby.length > 0) {
            toast.info(`${nearby.length} donation${nearby.length > 1 ? 's' : ''} within 5km of you!`)
          }
        }
      }

      window._annapurnaMap = map
    }, 300)
  }, [loading, donations, requests, mapMode, userLocation, showRadius, foodFilter])

  // ── Filtered sidebar list
  const sidebarItems = (() => {
    let items = filter === 'DONATIONS' ? donations
              : filter === 'REQUESTS'  ? requests
              : [...donations, ...requests]
    if (foodFilter !== 'ALL') {
      items = items.filter(item => !item.foodName || item.foodType === foodFilter)
    }
    return items
  })()

  const statusStyle = {
    AVAILABLE: { bg:'#dcfce7', color:'#166534' },
    MATCHED:   { bg:'#f3e8ff', color:'#6b21a8' },
    DELIVERED: { bg:'#dbeafe', color:'#1e40af' },
    PENDING:   { bg:'#fef9c3', color:'#854d0e' },
  }
  const urgencyStyle = {
    HIGH:   { bg:'#fee2e2', color:'#dc2626' },
    MEDIUM: { bg:'#fef9c3', color:'#854d0e' },
    LOW:    { bg:'#dcfce7', color:'#166534' },
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-page)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #1d4ed8 100%)', padding:'20px 16px', color:'white' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black flex items-center gap-2">📍 Live Food Map</h1>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, marginTop:2 }}>
                Real-time donations and requests across India
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="text-center px-4 py-2 rounded-xl" style={{ background:'rgba(255,255,255,0.15)' }}>
                <div className="font-black text-lg" style={{ color:'#86efac' }}>{donations.length}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>🍱 Donations</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl" style={{ background:'rgba(255,255,255,0.15)' }}>
                <div className="font-black text-lg" style={{ color:'#fdba74' }}>{requests.length}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>🙏 Requests</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl" style={{ background:'rgba(255,255,255,0.15)' }}>
                <div className="font-black text-lg text-white">{donations.length + requests.length}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>🌐 Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* ── Controls row ── */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>

          {/* Type filter */}
          {[
            { key:'ALL',       label:'🌐 All',           count: donations.length + requests.length, color:'#2563eb' },
            { key:'DONATIONS', label:'🍱 Donations',      count: donations.length,                  color:'#2d8a4e' },
            { key:'REQUESTS',  label:'🙏 Requests',       count: requests.length,                   color:'#e8720c' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'7px 14px', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer',
                background: filter === f.key ? f.color : 'var(--bg-card)',
                color:      filter === f.key ? '#fff'  : 'var(--text-muted)',
                border:     `1px solid ${filter === f.key ? f.color : 'var(--border)'}`,
                boxShadow:  filter === f.key ? `0 4px 16px ${f.color}40` : 'none',
                transition: 'all 0.15s',
              }}>
              {f.label}
              <span style={{ fontSize:11, fontWeight:900, padding:'1px 7px', borderRadius:9999, background: filter === f.key ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface)', color: filter === f.key ? '#fff' : 'var(--text-muted)' }}>
                {f.count}
              </span>
            </button>
          ))}

          {/* ── Feature 4: Food type filter ── */}
          <div style={{ marginLeft:4, display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>Type:</span>
            {[
              { key:'ALL',      label:'All'     },
              { key:'VEG',      label:'🥦 Veg'  },
              { key:'NON_VEG',  label:'🍗 Non-Veg' },
              { key:'PACKAGED', label:'📦 Packed'  },
            ].map(f => (
              <button key={f.key} onClick={() => setFoodFilter(f.key)}
                style={{
                  padding:'5px 11px', borderRadius:9999, fontSize:11, fontWeight:700, cursor:'pointer',
                  background: foodFilter === f.key ? 'var(--brand)' : 'var(--bg-card)',
                  color:      foodFilter === f.key ? '#fff' : 'var(--text-muted)',
                  border:     `1px solid ${foodFilter === f.key ? 'var(--brand)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* ── Feature 1: Map mode toggle ── */}
          <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
            <button onClick={() => setMapMode('markers')}
              style={{
                padding:'7px 14px', borderRadius:12, fontSize:12, fontWeight:700, cursor:'pointer',
                background: mapMode === 'markers' ? '#2563eb' : 'var(--bg-card)',
                color:      mapMode === 'markers' ? '#fff' : 'var(--text-muted)',
                border:     `1px solid ${mapMode === 'markers' ? '#2563eb' : 'var(--border)'}`,
              }}>
              📍 Markers
            </button>
            <button onClick={() => setMapMode('heatmap')}
              style={{
                padding:'7px 14px', borderRadius:12, fontSize:12, fontWeight:700, cursor:'pointer',
                background: mapMode === 'heatmap' ? '#dc2626' : 'var(--bg-card)',
                color:      mapMode === 'heatmap' ? '#fff' : 'var(--text-muted)',
                border:     `1px solid ${mapMode === 'heatmap' ? '#dc2626' : 'var(--border)'}`,
              }}>
              🔥 Heatmap
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* ── MAP ── */}
          <div className="lg:col-span-3">

            {/* ── Feature 3 + 5: Map action buttons overlay ── */}
            <div style={{ position:'relative' }}>
              <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid var(--border)', boxShadow:'var(--shadow-md)' }}>
                <div id="leaflet-map" style={{ height:520, width:'100%' }}>
                  {loading && (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'var(--bg-surface)' }}>
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full animate-spin mx-auto mb-3"
                          style={{ border:'4px solid #bfdbfe', borderTopColor:'#2563eb' }}/>
                        <p style={{ color:'var(--text-muted)', fontWeight:600, fontSize:14 }}>Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating map controls */}
              <div style={{
                position:'absolute', top:12, right:12, zIndex:1000,
                display:'flex', flexDirection:'column', gap:8,
              }}>
                {/* ── Feature 3: Locate me button ── */}
                <button onClick={handleLocateMe} disabled={locating}
                  title="Show my location"
                  style={{
                    width:40, height:40, borderRadius:10,
                    background: userLocation ? '#2563eb' : 'white',
                    color: userLocation ? '#fff' : '#374151',
                    border:'2px solid #e5e7eb', cursor:'pointer',
                    fontSize:18, display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
                    transition:'all 0.2s',
                  }}>
                  {locating ? '⏳' : '🧭'}
                </button>

                {/* ── Feature 5: Radius toggle ── */}
                {userLocation && (
                  <button onClick={() => setShowRadius(r => !r)}
                    title="Toggle 5km radius"
                    style={{
                      width:40, height:40, borderRadius:10,
                      background: showRadius ? '#2563eb' : 'white',
                      color: showRadius ? '#fff' : '#374151',
                      border:'2px solid #e5e7eb', cursor:'pointer',
                      fontSize:16, display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
                      transition:'all 0.2s',
                    }}>
                    ⭕
                  </button>
                )}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, marginTop:10, flexWrap:'wrap' }}>
              {[
                { icon:'🍱', label:'Donation available',   color:'#2d8a4e' },
                { icon:'🙏', label:'Food request pending', color:'#e8720c' },
                ...(userLocation ? [{ icon:'🔵', label:'Your location', color:'#2563eb' }] : []),
                ...(mapMode==='heatmap' ? [{ icon:'🔥', label:'Heatmap density', color:'#dc2626' }] : []),
              ].map((l,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>
                  <span>{l.icon}</span><span>{l.label}</span>
                </div>
              ))}
              {showRadius && userLocation && (
                <div style={{ fontSize:12, color:'#2563eb', fontWeight:600 }}>⭕ 5km radius active</div>
              )}
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>· Click markers for details</span>
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

            {/* Summary card */}
            <div className="card">
              <div style={{ fontWeight:900, fontSize:15, color:'var(--text-primary)', marginBottom:4 }}>
                {sidebarItems.length} Items
              </div>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10 }}>
                Showing {filter === 'ALL' ? 'all types' : filter.toLowerCase()}
                {foodFilter !== 'ALL' ? ` · ${foodFilter}` : ''}
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <div style={{ textAlign:'center', padding:'8px 4px', borderRadius:10, background:'#e8f8ee' }}>
                  <div style={{ fontWeight:900, fontSize:14, color:'#2d8a4e' }}>
                    {donations.filter(d => d.status === 'AVAILABLE').length}
                  </div>
                  <div style={{ fontSize:10, color:'#2d8a4e' }}>Available</div>
                </div>
                <div style={{ textAlign:'center', padding:'8px 4px', borderRadius:10, background:'#fee2e2' }}>
                  <div style={{ fontWeight:900, fontSize:14, color:'#dc2626' }}>
                    {requests.filter(r => r.urgencyLevel === 'HIGH').length}
                  </div>
                  <div style={{ fontSize:10, color:'#dc2626' }}>High Urgency</div>
                </div>
              </div>

              {/* ── Feature 5: Nearby count ── */}
              {userLocation && (
                <div style={{ marginTop:10, padding:'8px 10px', borderRadius:10, background:'#dbeafe', display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:14 }}>🧭</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#1d4ed8' }}>
                      {donations.filter(d => {
                        if (!d.latitude || !d.longitude) return false
                        const dlat = (parseFloat(d.latitude) - userLocation.lat) * 111
                        const dlng = (parseFloat(d.longitude) - userLocation.lng) * 111 * Math.cos(userLocation.lat * Math.PI/180)
                        return Math.sqrt(dlat*dlat + dlng*dlng) <= 5
                      }).length} donations within 5km
                    </div>
                    <div style={{ fontSize:10, color:'#3b82f6' }}>of your location</div>
                  </div>
                </div>
              )}
            </div>

            {/* Item list */}
            <div style={{ maxHeight:400, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
              {loading ? (
                <div style={{ textAlign:'center', padding:24, color:'var(--text-muted)' }}>Loading...</div>
              ) : sidebarItems.length === 0 ? (
                <div style={{ textAlign:'center', padding:32 }} className="card">
                  <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
                  <p style={{ fontSize:13, color:'var(--text-muted)' }}>No items found</p>
                </div>
              ) : (
                sidebarItems.slice(0,15).map((item,i) => {
                  const isDonation = !!item.foodName
                  const ss = isDonation
                    ? (statusStyle[item.status]       || { bg:'var(--bg-surface)', color:'var(--text-muted)' })
                    : (urgencyStyle[item.urgencyLevel] || { bg:'var(--bg-surface)', color:'var(--text-muted)' })

                  // ── Feature 5: Is this item within 5km?
                  const isNearby = userLocation && item.latitude && item.longitude && (() => {
                    const dlat = (parseFloat(item.latitude) - userLocation.lat) * 111
                    const dlng = (parseFloat(item.longitude) - userLocation.lng) * 111 * Math.cos(userLocation.lat * Math.PI/180)
                    return Math.sqrt(dlat*dlat + dlng*dlng) <= 5
                  })()

                  return (
                    <div key={i} onClick={() => setSelected(selected===i?null:i)}
                      style={{
                        borderRadius:12, padding:12, cursor:'pointer',
                        background: 'var(--bg-card)',
                        border:`2px solid ${selected===i ? (isDonation ? '#2d8a4e' : '#e8720c') : isNearby ? '#2563eb30' : 'var(--border)'}`,
                        boxShadow: selected===i ? 'var(--shadow-md)' : 'none',
                        transition:'all 0.15s',
                      }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                        <div style={{ width:32, height:32, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, background: isDonation ? '#e8f8ee' : '#fff4ec' }}>
                          {isDonation ? '🍱' : '🙏'}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:4, flexWrap:'wrap' }}>
                            <div style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {isDonation ? item.foodName : `${item.numberOfPeople} people need food`}
                            </div>
                            {isNearby && (
                              <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:9999, background:'#dbeafe', color:'#1d4ed8', flexShrink:0 }}>
                                📍 Nearby
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {item.pickupAddress || item.location || 'Location not set'}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:5, flexWrap:'wrap' }}>
                            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:9999, background:ss.bg, color:ss.color }}>
                              {isDonation ? item.status : `${item.urgencyLevel} URGENCY`}
                            </span>
                            {isDonation && item.foodType && (
                              <span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>
                                {item.foodType === 'VEG' ? '🥦' : item.foodType === 'NON_VEG' ? '🍗' : '📦'} {item.foodType}
                              </span>
                            )}
                            {isDonation && item.quantity && (
                              <span style={{ fontSize:10, color:'var(--text-muted)' }}>
                                ×{item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}