import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { getDonationsByDonor, getRequestsByUser, getVolunteerDeliveries, getAdminStats, getNotifications, markAllRead, getAllDonations } from '../api/endpoints'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from '../components/Toast'
import ImpactCertificate from '../components/ImpactCertificate'

const getTheme   = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

// ── Tamil/English translations
const T = {
  en: {
    welcome:        'Welcome back',
    ready:          'Ready to make a difference today?',
    badges:         'Badges',
    certificate:    'Certificate',
    quickActions:   'Quick Actions',
    platformStats:  'Platform Statistics',
    myDonations:    'My Donations',
    myDeliveries:   'My Deliveries',
    myRequests:     'My Requests',
    noRecords:      'No records yet',
    noRecordsSub:   'Get started using the quick actions above!',
    postFirst:      '🍱 Post First Donation',
    searchPlaceholder: '🔍 Search food name...',
    total:          'total',
    moreRecords:    'more records',
    notifications:  'Notifications',
    markAllRead:    'Mark all read',
    noNotif:        'No notifications yet',
    yourImpact:     '🌍 Your Impact',
    impactSub:      'Every action you take reduces hunger and food waste',
    contributions:  'Contributions',
    badgesEarned:   'Badges Earned',
    wasteSaved:     'kg Waste Saved',
    downloadCert:   '📥 Download Certificate',
    editProfile:    '✏️ Edit Profile',
    leaderboard:    '🏆 Leaderboard',
    donateFoodBtn:  '🍱 Donate',
    breakdown:      'My Donation Breakdown',
    safetyBadge:    'Safety',
    expired:        'EXPIRED',
    autoRemoved:    '⛔ Auto-removed — food expired',
    verifyEmail:    'Verify your email to unlock all features',
    verifySub:      'We sent a link to',
    checkInbox:     '— check your inbox',
    emailSent:      '✅ Email sent!',
    resendEmail:    '📧 Resend Email',
    sending:        '⏳ Sending...',
    openAdminPanel: '⚙️ Open Full Admin Panel →',
    clearFilters:   'Clear filters',
    noResults:      'No results for',
    shareWhatsApp:  'Share on WhatsApp',
  },
  ta: {
    welcome:        'மீண்டும் வருக',
    ready:          'இன்று மாற்றம் கொண்டுவர தயாரா?',
    badges:         'பதக்கங்கள்',
    certificate:    'சான்றிதழ்',
    quickActions:   'விரைவு செயல்கள்',
    platformStats:  'தளம் புள்ளிவிவரங்கள்',
    myDonations:    'என் தானங்கள்',
    myDeliveries:   'என் டெலிவரிகள்',
    myRequests:     'என் கோரிக்கைகள்',
    noRecords:      'இன்னும் பதிவுகள் இல்லை',
    noRecordsSub:   'மேலே உள்ள விரைவு செயல்களை பயன்படுத்தவும்!',
    postFirst:      '🍱 முதல் தானம் பதிவு செய்',
    searchPlaceholder: '🔍 உணவு பெயர் தேடவும்...',
    total:          'மொத்தம்',
    moreRecords:    'மேலும் பதிவுகள்',
    notifications:  'அறிவிப்புகள்',
    markAllRead:    'அனைத்தும் படித்ததாக குறி',
    noNotif:        'இன்னும் அறிவிப்புகள் இல்லை',
    yourImpact:     '🌍 உங்கள் தாக்கம்',
    impactSub:      'நீங்கள் செய்யும் ஒவ்வொரு செயலும் பசியை குறைக்கிறது',
    contributions:  'பங்களிப்புகள்',
    badgesEarned:   'பெற்ற பதக்கங்கள்',
    wasteSaved:     'கி.கி கழிவு குறைப்பு',
    downloadCert:   '📥 சான்றிதழ் பதிவிறக்கம்',
    editProfile:    '✏️ சுயவிவரம் திருத்து',
    leaderboard:    '🏆 தரவரிசை',
    donateFoodBtn:  '🍱 தானம்',
    breakdown:      'என் தானம் பிரிப்பு',
    safetyBadge:    'பாதுகாப்பு',
    expired:        'காலாவதி',
    autoRemoved:    '⛔ தானியங்கி நீக்கம் — உணவு காலாவதியானது',
    verifyEmail:    'அனைத்து அம்சங்களையும் திறக்க மின்னஞ்சலை சரிபார்க்கவும்',
    verifySub:      'நாங்கள் ஒரு இணைப்பை அனுப்பினோம்',
    checkInbox:     '— உங்கள் இன்பாக்ஸ் சரிபார்க்கவும்',
    emailSent:      '✅ மின்னஞ்சல் அனுப்பப்பட்டது!',
    resendEmail:    '📧 மீண்டும் அனுப்பு',
    sending:        '⏳ அனுப்புகிறது...',
    openAdminPanel: '⚙️ முழு நிர்வாக பேனல் திற →',
    clearFilters:   'வடிகட்டிகளை அழி',
    noResults:      'எதுவும் கிடைக்கவில்லை',
    shareWhatsApp:  'வாட்ஸ்அப்பில் பகிர்',
  }
}

// ── Safety badge config
const SAFETY_CONFIG = {
  SAFE:    { icon:'✅', label:'Safe',    labelTa:'பாதுகாப்பானது', color:'#2d8a4e', bg:'#e8f8ee' },
  QUICK:   { icon:'⚡', label:'Quick',   labelTa:'விரைவாக உண்ணவும்', color:'#e8720c', bg:'#fff4ec' },
  ANIMAL:  { icon:'🐄', label:'Animal',  labelTa:'விலங்கு தீவனம்', color:'#854d0e', bg:'#fef9c3' },
  COMPOST: { icon:'♻️', label:'Compost', labelTa:'உரமாக்கல்', color:'#dc2626', bg:'#fee2e2' },
}

function SafetyBadge({ category, score, lang }) {
  if (!category) return null
  const cfg = SAFETY_CONFIG[category] || SAFETY_CONFIG.SAFE
  const label = lang === 'ta' ? cfg.labelTa : cfg.label
  return (
    <span title={`AI Safety Score: ${score ?? '—'}`} style={{
      fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:9999,
      background:cfg.bg, color:cfg.color,
      display:'inline-flex', alignItems:'center', gap:3,
      border:`1px solid ${cfg.color}40`,
    }}>
      {cfg.icon} {label}{score != null ? ` ${score}` : ''}
    </span>
  )
}

// ── Expiry countdown
function useCountdown(expiryTime) {
  const calc = useCallback(() => {
    if (!expiryTime) return null
    const diff = new Date(expiryTime) - new Date()
    if (diff <= 0) return { text:'EXPIRED', urgent:true, expired:true }
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { text: h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`, urgent: diff < 3600000, warning: diff < 7200000, expired:false }
  }, [expiryTime])
  const [countdown, setCountdown] = useState(calc)
  useEffect(() => { const t = setInterval(() => setCountdown(calc()), 1000); return () => clearInterval(t) }, [calc])
  return countdown
}

function ExpiryBadge({ expiryTime, lang }) {
  const cd = useCountdown(expiryTime)
  if (!cd) return null
  const bg    = cd.expired ? '#fee2e2' : cd.urgent ? '#fee2e2' : cd.warning ? '#fff4ec' : '#dcfce7'
  const color = cd.expired ? '#dc2626' : cd.urgent ? '#dc2626' : cd.warning ? '#e8720c' : '#166534'
  const icon  = cd.expired ? '💀' : cd.urgent ? '🔴' : cd.warning ? '🟡' : '🟢'
  const expiredLabel = lang === 'ta' ? 'காலாவதி' : 'EXPIRED'
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:9999, background:bg, color, display:'inline-flex', alignItems:'center', gap:3 }}>
      {icon} {cd.expired ? expiredLabel : `⏰ ${cd.text}`}
    </span>
  )
}

// ── Auto-expiry banner for a donation card
function AutoExpiredOverlay({ lang }) {
  const msg = lang === 'ta' ? '⛔ தானியங்கி நீக்கம் — உணவு காலாவதியானது' : '⛔ Auto-removed — food expired'
  return (
    <div style={{
      position:'absolute', inset:0, borderRadius:12,
      background:'rgba(220,38,38,0.07)',
      border:'1.5px solid #dc262640',
      display:'flex', alignItems:'center', justifyContent:'center',
      pointerEvents:'none', zIndex:2,
    }}>
      <span style={{ fontSize:10, fontWeight:800, color:'#dc2626', background:'#fee2e2', padding:'3px 10px', borderRadius:9999 }}>
        {msg}
      </span>
    </div>
  )
}

// ── WhatsApp share
function whatsappShare(item) {
  const msg = `🍱 *Food Available on ANNAPURNA+*\n\n*${item.foodName}*\n📦 Qty: ${item.quantity} servings\n📍 ${item.pickupAddress || 'Location set'}\n\nClaim it now before it expires!`
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  toast.success('WhatsApp opened!', '💬 Share')
}

export default function DashboardPage() {
  const { dbUser, currentUser } = useAuth()
  const [data, setData]                   = useState([])
  const [stats, setStats]                 = useState({})
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifySent, setVerifySent]       = useState(false)

  // ── Search & Filter
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // ── Impact Certificate
  const [showCert, setShowCert] = useState(false)

  // ── Language
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'en')
  useEffect(() => {
    const fn = () => setLangState(localStorage.getItem('lang') || 'en')
    window.addEventListener('langchange', fn)
    return () => window.removeEventListener('langchange', fn)
  }, [])
  const t = (key) => T[lang]?.[key] || T.en[key] || key

  // ── Real-time volunteer alert
  const prevDonationCount = useRef(null)

  useEffect(() => { applyTheme(getTheme()) }, [])

  useEffect(() => {
    if (!dbUser) return
    const fetchData = async () => {
      try {
        if      (dbUser.role === 'DONOR')     { const r = await getDonationsByDonor(dbUser.id);   setData(r.data) }
        else if (dbUser.role === 'VOLUNTEER') { const r = await getVolunteerDeliveries(dbUser.id); setData(r.data) }
        else if (dbUser.role === 'NGO')       { const r = await getRequestsByUser(dbUser.id);      setData(r.data) }
        else if (dbUser.role === 'ADMIN')     { const r = await getAdminStats();                   setStats(r.data) }
        const nr = await getNotifications(dbUser.id)
        setNotifications(nr.data.slice(0, 5))
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    fetchData()
  }, [dbUser])

  // ── Poll for new donations every 30s (VOLUNTEER only)
  useEffect(() => {
    if (dbUser?.role !== 'VOLUNTEER') return
    const poll = async () => {
      try {
        const res   = await getAllDonations()
        const avail = res.data.filter(d => d.status === 'AVAILABLE')
        if (prevDonationCount.current !== null && avail.length > prevDonationCount.current) {
          const newest = avail[0]
          toast.food(
            `${newest?.foodName || 'Food'} — ${newest?.quantity || '?'} servings near you!`,
            '🍱 New Donation Available!'
          )
        }
        prevDonationCount.current = avail.length
      } catch {}
    }
    poll()
    const interval = setInterval(poll, 30000)
    return () => clearInterval(interval)
  }, [dbUser])

  // ── Auto-expiry: every 60s check if any AVAILABLE donation is expired and update status
  useEffect(() => {
    if (dbUser?.role !== 'DONOR') return
    const check = () => {
      setData(prev => prev.map(item => {
        if (item.status === 'AVAILABLE' && item.expiryTime) {
          const expired = new Date(item.expiryTime) <= new Date()
          if (expired) return { ...item, status: 'EXPIRED', _autoExpired: true }
        }
        return item
      }))
    }
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [dbUser, data.length])

  const handleResendVerification = async () => {
    setVerifyLoading(true)
    try {
      await currentUser.sendEmailVerification()
      setVerifySent(true)
      toast.success('Verification email sent! Check your inbox.')
    } catch {
      toast.error('Could not send verification email. Try again later.')
    }
    setVerifyLoading(false)
  }

  const handleMarkRead = async () => {
    await markAllRead(dbUser.id)
    setNotifications(notifications.map(n => ({ ...n, isRead:true })))
    toast.success('All notifications marked as read')
  }

  const roleConfig = {
    DONOR:     { bg:'linear-gradient(135deg,#2d8a4e,#1f6b3a)', icon:'🏠', label:'Food Donor',  color:'#2d8a4e' },
    VOLUNTEER: { bg:'linear-gradient(135deg,#2563eb,#1d4ed8)', icon:'🚴', label:'Volunteer',    color:'#2563eb' },
    NGO:       { bg:'linear-gradient(135deg,#e8720c,#c45e08)', icon:'🏢', label:'NGO Partner',  color:'#e8720c' },
    ADMIN:     { bg:'linear-gradient(135deg,#7c3aed,#5b21b6)', icon:'⚙️', label:'Admin',        color:'#7c3aed' },
  }
  const rc = roleConfig[dbUser?.role] || roleConfig.DONOR

  const quickLinks = {
    DONOR:     [
      { to:'/donate',      icon:'🍱', label: lang==='ta' ? 'உணவு தானம்'   : 'Donate Food',   bg:'#e8f8ee', color:'#2d8a4e', border:'#b8e0c4' },
      { to:'/map',         icon:'📍', label: lang==='ta' ? 'வரைபடம்'       : 'View Map',       bg:'#dbeafe', color:'#2563eb', border:'#bfdbfe' },
      { to:'/leaderboard', icon:'🏆', label: lang==='ta' ? 'தரவரிசை'       : 'Leaderboard',    bg:'#fef9c3', color:'#854d0e', border:'#fde68a' },
    ],
    VOLUNTEER: [
      { to:'/map',         icon:'📍', label: lang==='ta' ? 'பிக்அப் கண்டுபிடி' : 'Find Pickups', bg:'#dbeafe', color:'#2563eb', border:'#bfdbfe' },
      { to:'/tracking',    icon:'🚚', label: lang==='ta' ? 'என் டெலிவரி'    : 'My Deliveries', bg:'#fff4ec', color:'#e8720c', border:'#fed7aa' },
      { to:'/leaderboard', icon:'🏆', label: lang==='ta' ? 'தரவரிசை'       : 'Leaderboard',    bg:'#fef9c3', color:'#854d0e', border:'#fde68a' },
    ],
    NGO: [
      { to:'/request',     icon:'🙏', label: lang==='ta' ? 'உணவு கோரு'     : 'Request Food',   bg:'#fff4ec', color:'#e8720c', border:'#fed7aa' },
      { to:'/map',         icon:'📍', label: lang==='ta' ? 'வரைபடம்'       : 'View Map',       bg:'#dbeafe', color:'#2563eb', border:'#bfdbfe' },
      { to:'/tracking',    icon:'🔍', label: lang==='ta' ? 'கண்காணி'       : 'Track Orders',   bg:'#f3e8ff', color:'#7c3aed', border:'#ddd6fe' },
    ],
    ADMIN: [
      { to:'/admin',       icon:'⚙️', label: lang==='ta' ? 'நிர்வாக பேனல்' : 'Admin Panel',    bg:'#fce7f3', color:'#be185d', border:'#fbcfe8' },
      { to:'/map',         icon:'📍', label: lang==='ta' ? 'வரைபடம்'       : 'View Map',       bg:'#dbeafe', color:'#2563eb', border:'#bfdbfe' },
      { to:'/leaderboard', icon:'🏆', label: lang==='ta' ? 'தரவரிசை'       : 'Leaderboard',    bg:'#fef9c3', color:'#854d0e', border:'#fde68a' },
    ],
  }

  const statusStyle = {
    AVAILABLE: { bg:'#dcfce7', color:'#166534' },
    PENDING:   { bg:'#fef9c3', color:'#854d0e' },
    DELIVERED: { bg:'#dbeafe', color:'#1e40af' },
    FULFILLED: { bg:'#dbeafe', color:'#1e40af' },
    MATCHED:   { bg:'#f3e8ff', color:'#6b21a8' },
    ACCEPTED:  { bg:'#ffedd5', color:'#c2410c' },
    EXPIRED:   { bg:'#fee2e2', color:'#dc2626' },
  }
  const roleEmoji = { DONOR:'🍱', VOLUNTEER:'🚴', NGO:'🙏' }

  // ── Filtered data
  const filteredData = data.filter(item => {
    const name = (item.foodName || item.donation?.foodName || '').toLowerCase()
    const matchSearch = name.includes(search.toLowerCase()) || search === ''
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter
    return matchSearch && matchStatus
  })

  // ── Food type donut data
  const foodTypeData = [
    { name: lang==='ta' ? 'சாகாரம்'  : 'Veg',      value: data.filter(d => d.foodType === 'VEG').length,      color:'#2d8a4e' },
    { name: lang==='ta' ? 'அசாகாரம்' : 'Non-Veg',  value: data.filter(d => d.foodType === 'NON_VEG').length,  color:'#dc2626' },
    { name: lang==='ta' ? 'பேக்கேஜ்' : 'Packaged', value: data.filter(d => d.foodType === 'PACKAGED').length, color:'#2563eb' },
  ].filter(d => d.value > 0)

  // ── Safety breakdown (donor only)
  const safetyBreakdown = Object.entries(SAFETY_CONFIG).map(([cat, cfg]) => ({
    ...cfg,
    cat,
    value: data.filter(d => d.safetyCategory === cat).length,
  })).filter(d => d.value > 0)

  const statusOptions = {
    DONOR:     ['ALL','AVAILABLE','MATCHED','DELIVERED','EXPIRED'],
    VOLUNTEER: ['ALL','ACCEPTED','PICKUP_IN_PROGRESS','DELIVERED'],
    NGO:       ['ALL','PENDING','FULFILLED'],
  }

  const activityTitle = dbUser?.role === 'DONOR'
    ? t('myDonations')
    : dbUser?.role === 'VOLUNTEER'
    ? t('myDeliveries')
    : t('myRequests')

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-page)' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full animate-spin mx-auto mb-4"
          style={{ border:'4px solid var(--brand-light)', borderTopColor:'var(--brand)' }}/>
        <p style={{ color:'var(--text-muted)', fontWeight:600 }}>Loading your dashboard...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-page)' }}>
      <Navbar />

      {/* ── Impact Certificate Modal ── */}
      {showCert && (
        <ImpactCertificate
          user={dbUser}
          stats={{ estimatedMealsServed: data.length * 5, wasteReducedKg: Math.floor(data.length * 2.5) }}
          onClose={() => setShowCert(false)}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Email verification gate ── */}
        {currentUser && !currentUser.emailVerified && (
          <div style={{
            background:'linear-gradient(135deg, #fef3c7, #fef9c3)',
            border:'1.5px solid #fde68a', borderLeft:'4px solid #f59e0b',
            borderRadius:16, padding:'14px 18px', marginBottom:20,
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12,
          }}>
            <div className="flex items-center gap-3">
              <div style={{ fontSize:28 }}>⚠️</div>
              <div>
                <div style={{ fontWeight:800, color:'#92400e', fontSize:14 }}>{t('verifyEmail')}</div>
                <div style={{ color:'#a16207', fontSize:12, marginTop:2 }}>
                  {t('verifySub')} <strong>{currentUser.email}</strong> {t('checkInbox')}
                </div>
              </div>
            </div>
            {verifySent ? (
              <span style={{ fontSize:12, fontWeight:700, color:'#166534', background:'#dcfce7', padding:'6px 14px', borderRadius:9999 }}>{t('emailSent')}</span>
            ) : (
              <button onClick={handleResendVerification} disabled={verifyLoading}
                style={{ fontSize:12, fontWeight:700, color:'#fff', background:'#f59e0b', border:'none', borderRadius:10, padding:'8px 16px', cursor:'pointer', opacity: verifyLoading ? 0.7 : 1 }}>
                {verifyLoading ? t('sending') : t('resendEmail')}
              </button>
            )}
          </div>
        )}

        {/* ── Welcome banner ── */}
        <div className="rounded-3xl p-6 mb-8 text-white relative overflow-hidden"
          style={{ background:rc.bg, boxShadow:`0 8px 32px ${rc.color}30` }}>
          <div className="absolute -right-4 -top-4 text-[140px] opacity-10 select-none">{rc.icon}</div>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background:'rgba(255,255,255,0.3)' }}/>
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{rc.label}</span>
                <span className="w-1 h-1 rounded-full bg-white/40"/>
                <span className="text-white/60 text-xs">
                  {new Date().toLocaleDateString('en-IN',{ weekday:'long', day:'numeric', month:'short' })}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black">
                {t('welcome')}, {dbUser?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-white/70 mt-1 text-sm">{t('ready')}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="text-center px-5 py-3 rounded-2xl" style={{ background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)' }}>
                <div className="text-2xl font-black">{dbUser?.badgeCount || 0}</div>
                <div className="text-xs text-white/70 mt-0.5">🏅 {t('badges')}</div>
              </div>
              <button onClick={() => setShowCert(true)}
                className="text-center px-5 py-3 rounded-2xl hover:-translate-y-0.5 transition-all"
                style={{ background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)', border:'none', cursor:'pointer', color:'white' }}>
                <div className="text-2xl">🏆</div>
                <div className="text-xs text-white/70 mt-0.5">{t('certificate')}</div>
              </button>
              <Link to="/profile"
                className="text-center px-5 py-3 rounded-2xl hover:-translate-y-0.5 transition-all"
                style={{ background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', textDecoration:'none', color:'white' }}>
                <div className="text-2xl">✏️</div>
                <div className="text-xs text-white/70 mt-0.5">{t('editProfile')}</div>
              </Link>
              {dbUser?.role === 'DONOR' && (
                <Link to="/donate"
                  className="text-center px-5 py-3 rounded-2xl hover:-translate-y-0.5 transition-all font-black text-sm flex flex-col items-center justify-center"
                  style={{ background:'rgba(255,255,255,0.25)', backdropFilter:'blur(8px)', textDecoration:'none', color:'white' }}>
                  <div className="text-2xl">🍱</div>
                  <div className="text-xs text-white/80 mt-0.5">{t('donateFoodBtn')}</div>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Quick Actions */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">⚡</span>
                <h2 className="font-black text-base" style={{ color:'var(--text-primary)' }}>{t('quickActions')}</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(quickLinks[dbUser?.role] || []).map((l,i) => (
                  <Link key={i} to={l.to}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                    style={{ background:l.bg, borderColor:l.border, textDecoration:'none' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background:'rgba(255,255,255,0.7)' }}>
                      {l.icon}
                    </div>
                    <span className="text-xs font-bold text-center" style={{ color:l.color }}>{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats (admin) or Activity (others) */}
            {dbUser?.role === 'ADMIN' ? (
              <div className="card">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-lg">📊</span>
                  <h2 className="font-black text-base" style={{ color:'var(--text-primary)' }}>{t('platformStats')}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(stats).map(([key,val],i) => {
                    const colors = ['#2d8a4e','#e8720c','#2563eb','#7c3aed','#be185d','#0891b2']
                    const c = colors[i % colors.length]
                    return (
                      <div key={i} className="rounded-2xl p-4 text-center"
                        style={{ background:c+'12', border:`1px solid ${c}25` }}>
                        <div className="text-2xl font-black" style={{ color:c }}>{val ?? '—'}</div>
                        <div className="text-xs font-medium mt-1 capitalize" style={{ color:'var(--text-muted)' }}>
                          {key.replace(/([A-Z])/g,' $1').trim()}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 pt-4" style={{ borderTop:'1px solid var(--border)' }}>
                  <Link to="/admin" className="btn-primary w-full text-center text-sm py-2.5 rounded-xl"
                    style={{ textDecoration:'none', display:'block' }}>
                    {t('openAdminPanel')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{roleEmoji[dbUser?.role] || '📋'}</span>
                    <h2 className="font-black text-base" style={{ color:'var(--text-primary)' }}>
                      {activityTitle}
                    </h2>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background:'var(--bg-surface)', color:'var(--text-muted)' }}>
                    {filteredData.length} / {data.length} {t('total')}
                  </span>
                </div>

                {/* Search + Filter bar */}
                {data.length > 0 && (
                  <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                    <input
                      value={search} onChange={e => setSearch(e.target.value)}
                      placeholder={t('searchPlaceholder')}
                      className="input-field"
                      style={{ flex:1, minWidth:140, fontSize:12, padding:'7px 12px' }}
                    />
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {(statusOptions[dbUser?.role] || ['ALL']).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                          style={{
                            fontSize:11, fontWeight:700, padding:'5px 10px', borderRadius:9999, border:'none', cursor:'pointer',
                            background: statusFilter === s ? 'var(--brand)' : 'var(--bg-surface)',
                            color:      statusFilter === s ? '#fff' : 'var(--text-muted)',
                            transition: 'all 0.15s',
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {data.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="font-bold mb-1" style={{ color:'var(--text-primary)' }}>{t('noRecords')}</p>
                    <p className="text-sm" style={{ color:'var(--text-muted)' }}>{t('noRecordsSub')}</p>
                    {dbUser?.role === 'DONOR' && (
                      <Link to="/donate" className="btn-primary inline-flex mt-4 text-sm px-6 py-2" style={{ textDecoration:'none' }}>
                        {t('postFirst')}
                      </Link>
                    )}
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🔍</div>
                    <p style={{ color:'var(--text-muted)', fontSize:14 }}>{t('noResults')} "{search}"</p>
                    <button onClick={() => { setSearch(''); setStatusFilter('ALL') }}
                      style={{ fontSize:12, color:'var(--brand)', background:'none', border:'none', cursor:'pointer', marginTop:6, fontWeight:600 }}>
                      {t('clearFilters')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredData.slice(0,5).map((item,i) => {
                      const s          = statusStyle[item.status] || { bg:'var(--bg-surface)', color:'var(--text-muted)' }
                      const isDonation = dbUser?.role === 'DONOR'
                      const isExpired  = item._autoExpired || item.status === 'EXPIRED'
                      return (
                        <div key={i}
                          className="p-3 rounded-xl transition-all hover:-translate-y-0.5"
                          style={{
                            background:'var(--bg-surface)',
                            border:`1px solid ${isExpired ? '#dc262630' : 'var(--border)'}`,
                            position:'relative',
                            opacity: isExpired ? 0.75 : 1,
                          }}>
                          {/* Auto-expired overlay */}
                          {item._autoExpired && <AutoExpiredOverlay lang={lang}/>}

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Food image thumbnail if available */}
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.foodName}
                                  style={{ width:36, height:36, borderRadius:10, objectFit:'cover', flexShrink:0 }}/>
                              ) : (
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                  style={{ background:'var(--brand-light)' }}>
                                  {roleEmoji[dbUser?.role] || '📋'}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate" style={{ color:'var(--text-primary)' }}>
                                  {item.foodName || item.donation?.foodName || `Request #${item.id}`}
                                </div>
                                {/* Badges row */}
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs" style={{ color:'var(--text-muted)' }}>
                                    {item.createdAt?.slice(0,10)}
                                  </span>
                                  {isDonation && item.expiryTime && <ExpiryBadge expiryTime={item.expiryTime} lang={lang}/>}
                                  {/* ── Safety Badge ── */}
                                  {isDonation && item.safetyCategory && (
                                    <SafetyBadge category={item.safetyCategory} score={item.safetyScore} lang={lang}/>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs font-bold px-3 py-1 rounded-full"
                                style={{ background:s.bg, color:s.color }}>
                                {item.status}
                              </span>
                              {isDonation && item.status === 'AVAILABLE' && !isExpired && (
                                <button onClick={() => whatsappShare(item)} title={t('shareWhatsApp')}
                                  style={{ width:30, height:30, borderRadius:9999, background:'#dcfce7', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                                  💬
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {filteredData.length > 5 && (
                      <p className="text-center text-xs pt-1" style={{ color:'var(--text-muted)' }}>
                        + {filteredData.length - 5} {t('moreRecords')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Food Type Donut (DONOR only) ── */}
            {dbUser?.role === 'DONOR' && foodTypeData.length > 0 && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🥗</span>
                  <h2 className="font-black text-base" style={{ color:'var(--text-primary)' }}>{t('breakdown')}</h2>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={foodTypeData} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={3}>
                        {foodTypeData.map((d,i) => <Cell key={i} fill={d.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', fontSize:12 }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                    {foodTypeData.map((d,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:12, height:12, borderRadius:'50%', background:d.color, flexShrink:0 }}/>
                        <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', flex:1 }}>{d.name}</span>
                        <span style={{ fontSize:13, fontWeight:900, color:d.color }}>{d.value}</span>
                        <span style={{ fontSize:11, color:'var(--text-muted)' }}>
                          ({Math.round((d.value / data.length) * 100)}%)
                        </span>
                      </div>
                    ))}
                    <div style={{ marginTop:4, paddingTop:10, borderTop:'1px solid var(--border)' }}>
                      <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>
                        {lang==='ta' ? 'மொத்தம்:' : 'Total:'} <span style={{ color:'var(--text-primary)', fontWeight:900 }}>{data.length} {lang==='ta' ? 'தானங்கள்' : 'donations'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Safety Category Breakdown ── */}
                {safetyBreakdown.length > 0 && (
                  <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid var(--border)' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>
                      🛡️ {lang==='ta' ? 'பாதுகாப்பு வகைப்பிரிவு' : 'Safety Breakdown'}
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {safetyBreakdown.map((s,i) => (
                        <div key={i} style={{
                          padding:'6px 12px', borderRadius:10,
                          background:s.bg, border:`1px solid ${s.color}40`,
                          display:'flex', alignItems:'center', gap:6,
                        }}>
                          <span style={{ fontSize:14 }}>{s.icon}</span>
                          <div>
                            <div style={{ fontSize:11, fontWeight:700, color:s.color }}>
                              {lang==='ta' ? s.labelTa : s.label}
                            </div>
                            <div style={{ fontSize:13, fontWeight:900, color:s.color }}>{s.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Impact card */}
            {dbUser?.role !== 'ADMIN' && (
              <div className="rounded-2xl p-5 text-white relative overflow-hidden"
                style={{ background:'linear-gradient(135deg, #1a2d0f 0%, #2d5016 60%, #1a2d0f 100%)' }}>
                <div className="absolute inset-0" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize:'32px 32px' }}/>
                <div className="relative z-10">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <h3 className="font-black">{t('yourImpact')}</h3>
                    <button onClick={() => setShowCert(true)}
                      style={{ fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:10, background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'white', cursor:'pointer' }}>
                      {t('downloadCert')}
                    </button>
                  </div>
                  <p className="text-white/60 text-xs mb-4">{t('impactSub')}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon:'🍱', label:t('contributions'),  value: data.length },
                      { icon:'🏅', label:t('badgesEarned'),   value: dbUser?.badgeCount || 0 },
                      { icon:'♻️', label:t('wasteSaved'),     value: Math.floor((data.length || 0) * 2.5) },
                    ].map((m,i) => (
                      <div key={i} className="text-center p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.1)' }}>
                        <div className="text-2xl mb-1">{m.icon}</div>
                        <div className="text-xl font-black">{m.value}</div>
                        <div className="text-white/50 text-xs">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications + Profile */}
          <div className="space-y-5">
            <div className="card h-fit">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔔</span>
                  <h2 className="font-black text-base" style={{ color:'var(--text-primary)' }}>{t('notifications')}</h2>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ background:'#dc2626' }}>
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </div>
                <button onClick={handleMarkRead}
                  className="text-xs font-semibold hover:underline"
                  style={{ color:'var(--brand)', background:'none', border:'none', cursor:'pointer' }}>
                  {t('markAllRead')}
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔕</div>
                  <p className="text-sm" style={{ color:'var(--text-muted)' }}>{t('noNotif')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n,i) => (
                    <div key={i} className="p-3 rounded-xl transition-all"
                      style={{ background: n.isRead ? 'var(--bg-surface)' : 'var(--brand-light)', border:`1px solid ${n.isRead ? 'var(--border)' : 'var(--brand)'}30` }}>
                      <div className="flex items-start gap-2">
                        {!n.isRead && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background:'var(--brand)' }}/>}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs" style={{ color:'var(--text-primary)' }}>{n.title}</div>
                          <div className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{n.message}</div>
                          <div className="text-xs mt-1" style={{ color:'var(--text-muted)', opacity:0.6 }}>
                            {n.createdAt?.slice(0,16).replace('T',' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white"
                  style={{ background: rc.bg }}>
                  {dbUser?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm truncate" style={{ color:'var(--text-primary)' }}>{dbUser?.name}</div>
                  <div className="text-xs truncate" style={{ color:'var(--text-muted)' }}>{dbUser?.role}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/profile" className="text-center py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
                  style={{ background:'var(--brand-light)', color:'var(--brand)', textDecoration:'none' }}>
                  {t('editProfile')}
                </Link>
                <Link to="/leaderboard" className="text-center py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
                  style={{ background:'#fef9c3', color:'#854d0e', textDecoration:'none' }}>
                  {t('leaderboard')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
