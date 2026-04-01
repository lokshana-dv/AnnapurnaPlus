import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getAdminStats, getAllUsers, getAllDonations, getAllDeliveries, deleteUser, deleteDonation } from '../api/endpoints'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const getTheme   = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

const COLORS = ['#2d8a4e','#e8720c','#2563eb','#7c3aed','#be185d']

// ── CSV export helper
const exportCSV = (data, keys, extraHeaders, filename) => {
  const headers = [...keys, ...(extraHeaders || [])]
  const rows    = data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))
  const csv     = [headers.join(','), ...rows].join('\n')
  const a       = document.createElement('a')
  a.href        = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
  a.download    = `${filename}_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
}

export default function AdminPanel() {
  const [stats, setStats]           = useState({})
  const [users, setUsers]           = useState([])
  const [donations, setDonations]   = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [activeTab, setActiveTab]   = useState('overview')
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')

  useEffect(() => { applyTheme(getTheme()) }, [])

  useEffect(() => {
    Promise.all([getAdminStats(), getAllUsers(), getAllDonations(), getAllDeliveries()])
      .then(([s,u,d,del]) => {
        setStats(s.data); setUsers(u.data); setDonations(d.data); setDeliveries(del.data)
      }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const barData = [
    { name:'Donations',  value: stats.totalDonations     || 0 },
    { name:'Delivered',  value: stats.deliveredDonations  || 0 },
    { name:'Deliveries', value: stats.completedDeliveries || 0 },
    { name:'Requests',   value: stats.fulfilledRequests   || 0 },
  ]
  const pieData = [
    { name:'Donors',     value: stats.totalDonors    || 0 },
    { name:'Volunteers', value: stats.totalVolunteers || 0 },
    { name:'NGOs',       value: stats.totalNGOs       || 0 },
  ]

  // ── Waste trend line chart (simulated weekly data from total)
  const wasteData = (() => {
    const total = stats.wasteReducedKg || 0
    const weeks = ['W1','W2','W3','W4','W5','W6','W7']
    return weeks.map((w, i) => ({
      week:  w,
      waste: Math.round((total / 7) * (0.6 + Math.random() * 0.8)),
      meals: Math.round((stats.estimatedMealsServed || 0) / 7 * (0.5 + Math.random())),
    }))
  })()

  const statCards = [
    { label:'Total Users',          value: stats.totalUsers,           icon:'👥', color:'#2d8a4e' },
    { label:'Total Donations',      value: stats.totalDonations,       icon:'🍱', color:'#e8720c' },
    { label:'Meals Served',         value: stats.estimatedMealsServed, icon:'🍽️', color:'#2563eb' },
    { label:'Waste Reduced (kg)',   value: stats.wasteReducedKg,       icon:'♻️', color:'#7c3aed' },
    { label:'Active Volunteers',    value: stats.totalVolunteers,      icon:'🚴', color:'#0891b2' },
    { label:'Completed Deliveries', value: stats.completedDeliveries,  icon:'✅', color:'#2d8a4e' },
    { label:'Pending Requests',     value: stats.pendingRequests,      icon:'🙏', color:'#dc2626' },
    { label:'NGO Partners',         value: stats.totalNGOs,            icon:'🏢', color:'#7c3aed' },
  ]

  const tabs = [
    { key:'overview',   label:'📊 Overview'   },
    { key:'users',      label:'👥 Users'      },
    { key:'donations',  label:'🍱 Donations'  },
    { key:'deliveries', label:'🚚 Deliveries' },
  ]

  const filteredUsers     = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()))
  const filteredDonations = donations.filter(d =>
    d.foodName?.toLowerCase().includes(search.toLowerCase()))

  const roleStyle = {
    DONOR:     { bg:'#e8f8ee', color:'#2d8a4e' },
    VOLUNTEER: { bg:'#dbeafe', color:'#2563eb' },
    NGO:       { bg:'#fff4ec', color:'#e8720c' },
    ADMIN:     { bg:'#fce7f3', color:'#be185d' },
  }
  const statusStyle = {
    AVAILABLE: { bg:'#dcfce7', color:'#166534' },
    DELIVERED: { bg:'#dbeafe', color:'#1e40af' },
    MATCHED:   { bg:'#f3e8ff', color:'#6b21a8' },
    EXPIRED:   { bg:'#fee2e2', color:'#dc2626' },
  }
  const deliveryStyle = {
    DELIVERED:          { bg:'#f3e8ff', color:'#6b21a8' },
    ACCEPTED:           { bg:'#dbeafe', color:'#1e40af' },
    PICKUP_IN_PROGRESS: { bg:'#ffedd5', color:'#c2410c' },
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-page)' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full animate-spin mx-auto mb-4"
          style={{ border:'4px solid var(--brand-light)', borderTopColor:'var(--brand)' }}/>
        <p style={{ color:'var(--text-muted)', fontWeight:600 }}>Loading admin panel...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-page)' }}>
      <Navbar />

      {/* ── HEADER ── */}
      <div style={{ background:'linear-gradient(135deg, #1a2d0f 0%, #2d5016 60%, #1a2d0f 100%)', padding:'24px 16px', color:'white' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black">⚙️ Admin Dashboard</h1>
              <p style={{ color:'rgba(255,255,255,0.5)', marginTop:4, fontSize:14 }}>
                ANNAPURNA+ · Full Platform Control
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { label:'Total Users',     value: stats.totalUsers        || 0, color:'#4ade80' },
                { label:'Donations',       value: stats.totalDonations    || 0, color:'#fb923c' },
                { label:'Deliveries Done', value: stats.completedDeliveries || 0, color:'#60a5fa' },
              ].map((s,i) => (
                <div key={i} className="text-center px-4 py-2 rounded-xl"
                  style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)' }}>
                  <div className="text-xl font-black" style={{ color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {[
              { icon:'🍱', label:'Available Now',    value: stats.availableDonations   || 0 },
              { icon:'🚴', label:'Active Volunteers', value: stats.totalVolunteers      || 0 },
              { icon:'🙏', label:'Pending Requests',  value: stats.pendingRequests      || 0 },
              { icon:'🌍', label:'Meals Saved Total', value: stats.estimatedMealsServed || 0 },
            ].map((s,i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(8px)' }}>
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="font-black text-lg text-white">{s.value}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── TABS ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap"
              style={{
                background: activeTab === t.key ? 'var(--brand)' : 'var(--bg-card)',
                color:      activeTab === t.key ? '#fff' : 'var(--text-muted)',
                border:     `1px solid ${activeTab === t.key ? 'var(--brand)' : 'var(--border)'}`,
                boxShadow:  activeTab === t.key ? '0 2px 12px rgba(45,138,78,0.3)' : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((s,i) => (
                <div key={i} className="card-hover" style={{ borderLeft:`3px solid ${s.color}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background:s.color+'15' }}>
                      {s.icon}
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background:s.color+'12', color:s.color }}>
                      #{i+1}
                    </span>
                  </div>
                  <div className="text-2xl font-black" style={{ color:s.color }}>{s.value ?? '—'}</div>
                  <div className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-black mb-1" style={{ color:'var(--text-primary)' }}>📊 Activity Overview</h3>
                <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>Platform activity summary</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{ borderRadius:12, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)' }} cursor={{ fill:'var(--bg-surface)' }}/>
                    <Bar dataKey="value" fill="var(--brand)" radius={[8,8,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="font-black mb-1" style={{ color:'var(--text-primary)' }}>👥 User Distribution</h3>
                <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>Breakdown by role</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value"
                      label={({name,value}) => `${name}: ${value}`} labelLine={false}>
                      {pieData.map((_,i) => <Cell key={i} fill={COLORS[i]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius:12, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Food Waste Analytics Line Chart ── */}
            <div className="card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:16 }}>
                <div>
                  <h3 className="font-black" style={{ color:'var(--text-primary)' }}>♻️ Food Waste Reduction Trend</h3>
                  <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>Weekly waste reduced (kg) and meals saved</p>
                </div>
                <div style={{ display:'flex', gap:16, fontSize:11, fontWeight:600 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:12, height:3, borderRadius:9999, background:'#7c3aed' }}/>
                    <span style={{ color:'var(--text-muted)' }}>Waste (kg)</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:12, height:3, borderRadius:9999, background:'#2d8a4e' }}/>
                    <span style={{ color:'var(--text-muted)' }}>Meals</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={wasteData}>
                  <XAxis dataKey="week" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{ borderRadius:12, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)' }} cursor={{ stroke:'var(--border)' }}/>
                  <Line type="monotone" dataKey="waste" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill:'#7c3aed', r:4 }} activeDot={{ r:6 }}/>
                  <Line type="monotone" dataKey="meals" stroke="#2d8a4e" strokeWidth={2.5} dot={{ fill:'#2d8a4e', r:4 }} activeDot={{ r:6 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Impact banner */}
            <div className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{ background:'linear-gradient(135deg, #1a2d0f 0%, #2d5016 60%, #1a2d0f 100%)' }}>
              <div className="absolute inset-0" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize:'40px 40px' }}/>
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-4">🌍 Platform Impact Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label:'Meals Saved',     value: stats.estimatedMealsServed || 0,   icon:'🍽️' },
                    { label:'Waste Reduced',   value:`${stats.wasteReducedKg||0} kg`,     icon:'♻️' },
                    { label:'Families Helped', value: stats.fulfilledRequests    || 0,    icon:'😊' },
                    { label:'Active Today',    value: stats.availableDonations   || 0,    icon:'🔥' },
                  ].map((m,i) => (
                    <div key={i} className="text-center p-4 rounded-xl" style={{ background:'rgba(255,255,255,0.12)' }}>
                      <div className="text-3xl mb-1">{m.icon}</div>
                      <div className="text-2xl font-black">{m.value}</div>
                      <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent users */}
            <div className="card">
              <h3 className="font-black mb-4" style={{ color:'var(--text-primary)' }}>👤 Recent Users</h3>
              <div className="space-y-2">
                {users.slice(0,5).map((u,i) => {
                  const rs = roleStyle[u.role] || { bg:'var(--bg-surface)', color:'var(--text-muted)' }
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black"
                          style={{ background:rs.bg, color:rs.color }}>
                          {u.name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-sm" style={{ color:'var(--text-primary)' }}>{u.name}</div>
                          <div className="text-xs" style={{ color:'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ background:rs.bg, color:rs.color }}>{u.role}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Search bar */}
        {activeTab !== 'overview' && (
          <div className="mb-4 flex items-center gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input-field max-w-sm" placeholder="🔍 Search..."/>
            {/* ── Quick export all button ── */}
            {activeTab === 'users' && (
              <button onClick={() => exportCSV(filteredUsers, ['name','email','role','badgeCount'], [], 'users')}
                style={{ fontSize:12, fontWeight:700, padding:'8px 16px', borderRadius:10, background:'#dbeafe', color:'#1d4ed8', border:'none', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6 }}>
                📥 Export CSV
              </button>
            )}
            {activeTab === 'donations' && (
              <button onClick={() => {
                const flat = filteredDonations.map(d => ({ ...d, donorName: d.donor?.name || '' }))
                exportCSV(flat, ['foodName','foodType','quantity','status','priorityScore','donorName'], [], 'donations')
              }}
                style={{ fontSize:12, fontWeight:700, padding:'8px 16px', borderRadius:10, background:'#e8f8ee', color:'#2d8a4e', border:'none', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6 }}>
                📥 Export CSV
              </button>
            )}
            {activeTab === 'deliveries' && (
              <button onClick={() => {
                const flat = deliveries.map(d => ({ id:d.id, foodName:d.donation?.foodName||'', volunteer:d.volunteer?.name||'', status:d.status, date:d.createdAt?.slice(0,10)||'' }))
                exportCSV(flat, ['id','foodName','volunteer','status','date'], [], 'deliveries')
              }}
                style={{ fontSize:12, fontWeight:700, padding:'8px 16px', borderRadius:10, background:'#f3e8ff', color:'#7c3aed', border:'none', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6 }}>
                📥 Export CSV
              </button>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="card p-0 overflow-hidden">
            <div className="p-5 flex items-center justify-between" style={{ borderBottom:'1px solid var(--border)' }}>
              <h3 className="font-black text-base" style={{ color:'var(--text-primary)' }}>👥 All Users</h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background:'var(--bg-surface)', color:'var(--text-muted)' }}>
                {filteredUsers.length} users
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background:'var(--bg-surface)' }}>
                    {['User','Email','Role','Badges','Actions'].map(h => (
                      <th key={h} className="p-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color:'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u,i) => {
                    const rs = roleStyle[u.role] || { bg:'var(--bg-surface)', color:'var(--text-muted)' }
                    return (
                      <tr key={i} style={{ borderTop:'1px solid var(--border)' }}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black"
                              style={{ background:rs.bg, color:rs.color }}>
                              {u.name?.[0]}
                            </div>
                            <span className="font-semibold" style={{ color:'var(--text-primary)' }}>{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm" style={{ color:'var(--text-muted)' }}>{u.email}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{ background:rs.bg, color:rs.color }}>{u.role}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold" style={{ color:'var(--text-primary)' }}>🏅 {u.badgeCount || 0}</span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => { if(window.confirm(`Delete ${u.name}?`)) deleteUser(u.id).then(() => setUsers(p => p.filter(x => x.id !== u.id))) }}
                            style={{ background:'#fee2e2', color:'#dc2626', border:'none', cursor:'pointer', fontSize:12, fontWeight:700, padding:'5px 12px', borderRadius:8 }}>
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DONATIONS TAB ── */}
        {activeTab === 'donations' && (
          <div className="card p-0 overflow-hidden">
            <div className="p-5 flex items-center justify-between" style={{ borderBottom:'1px solid var(--border)' }}>
              <h3 className="font-black text-base" style={{ color:'var(--text-primary)' }}>🍱 All Donations</h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background:'var(--bg-surface)', color:'var(--text-muted)' }}>
                {filteredDonations.length} donations
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background:'var(--bg-surface)' }}>
                    {['Food','Donor','Qty','Type','Status','Score','Actions'].map(h => (
                      <th key={h} className="p-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color:'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((d,i) => {
                    const ss = statusStyle[d.status] || { bg:'#ffedd5', color:'#c2410c' }
                    // ── Expiry warning in admin
                    const expiryWarn = d.expiryTime && (() => {
                      const diff = new Date(d.expiryTime) - new Date()
                      const h    = Math.floor(diff / 3600000)
                      if (diff <= 0) return { text:'EXPIRED', color:'#dc2626', bg:'#fee2e2' }
                      if (h < 2)    return { text:`${h}h left!`, color:'#dc2626', bg:'#fee2e2' }
                      if (h < 6)    return { text:`${h}h left`, color:'#e8720c', bg:'#fff4ec' }
                      return null
                    })()
                    return (
                      <tr key={i} style={{ borderTop:'1px solid var(--border)', background: expiryWarn ? (expiryWarn.bg + '55') : 'transparent' }}>
                        <td className="p-4">
                          <div className="font-semibold" style={{ color:'var(--text-primary)' }}>{d.foodName}</div>
                          {expiryWarn && (
                            <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:9999, background:expiryWarn.bg, color:expiryWarn.color, display:'inline-block', marginTop:3 }}>
                              ⏰ {expiryWarn.text}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm" style={{ color:'var(--text-muted)' }}>{d.donor?.name || '—'}</td>
                        <td className="p-4 font-bold" style={{ color:'var(--text-primary)' }}>{d.quantity}</td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{ background:'#fff4ec', color:'#e8720c' }}>
                            {d.foodType === 'VEG' ? '🥦' : d.foodType === 'NON_VEG' ? '🍗' : '📦'} {d.foodType}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{ background:ss.bg, color:ss.color }}>{d.status}</span>
                        </td>
                        <td className="p-4 text-sm" style={{ color:'var(--text-muted)' }}>
                          {d.priorityScore?.toFixed(2) || '—'}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => { if(window.confirm('Delete this donation?')) deleteDonation(d.id).then(() => setDonations(p => p.filter(x => x.id !== d.id))) }}
                            style={{ background:'#fee2e2', color:'#dc2626', border:'none', cursor:'pointer', fontSize:12, fontWeight:700, padding:'5px 12px', borderRadius:8 }}>
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DELIVERIES TAB ── */}
        {activeTab === 'deliveries' && (
          <div className="card p-0 overflow-hidden">
            <div className="p-5 flex items-center justify-between" style={{ borderBottom:'1px solid var(--border)' }}>
              <h3 className="font-black text-base" style={{ color:'var(--text-primary)' }}>🚚 All Deliveries</h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background:'var(--bg-surface)', color:'var(--text-muted)' }}>
                {deliveries.length} deliveries
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background:'var(--bg-surface)' }}>
                    {['ID','Food','Volunteer','Status','Date'].map(h => (
                      <th key={h} className="p-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color:'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d,i) => {
                    const ds = deliveryStyle[d.status] || { bg:'var(--bg-surface)', color:'var(--text-muted)' }
                    return (
                      <tr key={i} style={{ borderTop:'1px solid var(--border)' }}>
                        <td className="p-4 font-mono text-xs" style={{ color:'var(--text-muted)' }}>#{d.id}</td>
                        <td className="p-4 font-semibold" style={{ color:'var(--text-primary)' }}>{d.donation?.foodName || '—'}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                              style={{ background:'#dbeafe', color:'#2563eb' }}>
                              {d.volunteer?.name?.[0] || '?'}
                            </div>
                            <span style={{ color:'var(--text-muted)' }}>{d.volunteer?.name || '—'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{ background:ds.bg, color:ds.color }}>
                            {d.status?.replace(/_/g,' ')}
                          </span>
                        </td>
                        <td className="p-4 text-xs" style={{ color:'var(--text-muted)' }}>
                          {d.createdAt?.slice(0,10)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}