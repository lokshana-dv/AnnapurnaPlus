import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { createDonation } from '../api/endpoints'
import { storage } from '../api/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { toast } from '../components/Toast'

const getTheme   = () => localStorage.getItem('theme') || 'light'
const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t) }

// ── Tamil/English translations
const T = {
  en: {
    title:        'Donate Food',
    subtitle:     'Your surplus food can feed someone in need today',
    foodName:     'Food Name *',
    foodHolder:   'e.g. Rice and Dal, Biryani, Idli...',
    foodType:     'Food Type *',
    quantity:     'Quantity (servings) *',
    expiry:       '⏰ Expiry Date & Time *',
    address:      '📍 Pickup Address *',
    addressHolder:'Full address where volunteer can pickup',
    notes:        'Additional Notes',
    notesHolder:  'e.g. Hot food, contains nuts, please bring containers...',
    submit:       '🚀 Post Donation',
    cancel:       'Cancel',
    posting:      'Posting...',
    summary:      '📋 Donation Summary',
    uploadPhoto:  '📷 Upload Food Photo',
    analyzing:    '🤖 Analyzing freshness...',
    safetyScore:  'AI Safety Score',
  },
  ta: {
    title:        'உணவு தானம் செய்யுங்கள்',
    subtitle:     'உங்கள் மிகுதி உணவு யாரோ ஒருவரின் பசியை போக்கும்',
    foodName:     'உணவின் பெயர் *',
    foodHolder:   'எ.கா. சாதம், பிரியாணி, இட்லி...',
    foodType:     'உணவு வகை *',
    quantity:     'அளவு (பரிமாறல்கள்) *',
    expiry:       '⏰ காலாவதி தேதி & நேரம் *',
    address:      '📍 எடுக்கும் இடம் *',
    addressHolder:'தன்னார்வலர் எடுக்க வரும் முழு முகவரி',
    notes:        'கூடுதல் குறிப்புகள்',
    notesHolder:  'எ.கா. சூடான உணவு, நட்ஸ் உள்ளது...',
    submit:       '🚀 தானம் பதிவு செய்',
    cancel:       'ரத்து செய்',
    posting:      'பதிவு செய்கிறது...',
    summary:      '📋 தானம் சுருக்கம்',
    uploadPhoto:  '📷 உணவு படம் பதிவேற்றவும்',
    analyzing:    '🤖 புதுமை பகுப்பாய்வு...',
    safetyScore:  'AI பாதுகாப்பு மதிப்பெண்',
  }
}

// ── AI Food Safety Analyzer (rule-based, no API needed)
function analyzeFoodSafety(foodName, expiryTime, foodType) {
  if (!foodName) return null
  const name     = foodName.toLowerCase()
  const hoursLeft = expiryTime
    ? Math.floor((new Date(expiryTime) - new Date()) / 3600000)
    : null

  // Determine base safety by food type and name
  let score    = 100
  let category = 'SAFE'
  let label    = '✅ Safe to Consume'
  let color    = '#2d8a4e'
  let bg       = '#e8f8ee'
  let advice   = 'This food appears safe for human consumption.'
  let icon     = '✅'

  // Deduct based on time left
  if (hoursLeft !== null) {
    if (hoursLeft <= 0)  { score = 0;  category = 'UNSAFE' }
    else if (hoursLeft <= 1)  { score = 20; category = 'URGENT' }
    else if (hoursLeft <= 3)  { score = 45; category = 'QUICK' }
    else if (hoursLeft <= 6)  { score = 70; category = 'GOOD' }
    else                      { score = 95; category = 'SAFE' }
  }

  // Adjust for food type
  const perishable = ['milk','curd','fish','meat','egg','chicken','mutton']
  const durable    = ['packaged','sealed','biscuit','chips','can','bottle']

  if (perishable.some(w => name.includes(w))) score = Math.min(score, 60)
  if (durable.some(w => name.includes(w)))    score = Math.max(score, 80)

  // Set category based on final score
  if (score >= 80) {
    category = 'SAFE'
    label    = '✅ Safe for Humans'
    color    = '#2d8a4e'
    bg       = '#e8f8ee'
    advice   = 'Food is fresh and safe for human consumption.'
    icon     = '✅'
  } else if (score >= 50) {
    category = 'QUICK'
    label    = '⚡ Consume Quickly'
    color    = '#e8720c'
    bg       = '#fff4ec'
    advice   = 'Food is still edible but must be consumed within 2-3 hours.'
    icon     = '⚡'
  } else if (score >= 25) {
    category = 'ANIMAL'
    label    = '🐄 Better for Animals'
    color    = '#854d0e'
    bg       = '#fef9c3'
    advice   = 'Food may not be ideal for humans. Consider donating to animal shelters.'
    icon     = '🐄'
  } else {
    category = 'COMPOST'
    label    = '♻️ Redirect to Compost'
    color    = '#dc2626'
    bg       = '#fee2e2'
    advice   = 'Food has expired. Please redirect to composting to avoid waste.'
    icon     = '♻️'
  }

  return { score, category, label, color, bg, advice, icon }
}

// ── Shelf life lookup
const SHELF_LIFE = [
  { words:['rice','dal','sambar','rasam','curry','gravy'],       hours:6,  label:'~6h',    hint:'Cooked food' },
  { words:['biryani','fried rice','pulao','khichdi'],            hours:8,  label:'~8h',    hint:'Rice dish' },
  { words:['idli','dosa','vada','pongal','uttapam'],             hours:8,  label:'~8h',    hint:'South Indian breakfast' },
  { words:['chapati','roti','paratha','naan','puri'],            hours:6,  label:'~6h',    hint:'Bread/flatbread' },
  { words:['bread','sandwich','toast','burger'],                 hours:24, label:'~1 day', hint:'Bakery item' },
  { words:['milk','curd','yogurt','lassi','buttermilk'],         hours:12, label:'~12h',   hint:'Dairy product' },
  { words:['fruit','salad','cut fruit'],                         hours:6,  label:'~6h',    hint:'Fresh produce' },
  { words:['cake','pastry','sweet','halwa','kheer','payasam'],   hours:24, label:'~1 day', hint:'Sweets/dessert' },
  { words:['packaged','sealed','biscuit','chips','snack','can'], hours:72, label:'~3 days',hint:'Packaged food' },
  { words:['juice','drink','beverage','tea','coffee'],           hours:4,  label:'~4h',    hint:'Beverages' },
  { words:['soup','broth','stew'],                               hours:6,  label:'~6h',    hint:'Soups/stews' },
  { words:['pizza','pasta','noodle','maggi'],                    hours:6,  label:'~6h',    hint:'Fast food' },
]

function getShelfLife(foodName) {
  if (!foodName) return null
  const name = foodName.toLowerCase()
  return SHELF_LIFE.find(s => s.words.some(w => name.includes(w))) || null
}

export default function DonationForm() {
  const { dbUser }  = useAuth()
  const navigate    = useNavigate()
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState('')
  const [shelfHint, setShelfHint]   = useState(null)
  const [safety, setSafety]         = useState(null)
  const [analyzing, setAnalyzing]   = useState(false)
  const [imageFile, setImageFile]   = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading]   = useState(false)

  // ── Language
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'en')
  useEffect(() => {
    const fn = () => setLangState(localStorage.getItem('lang') || 'en')
    window.addEventListener('langchange', fn)
    return () => window.removeEventListener('langchange', fn)
  }, [])
  const t = (key) => T[lang]?.[key] || T.en[key] || key

  const [form, setForm] = useState({
    foodName:'', foodType:'VEG', quantity:'',
    expiryTime:'', pickupAddress:'',
    latitude:'', longitude:'', notes:'', imageUrl:''
  })

  useEffect(() => { applyTheme(getTheme()) }, [])

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
    if (key === 'foodName') {
      setShelfHint(getShelfLife(val))
      // Re-analyze safety when food name changes
      if (val.length > 2) {
        triggerAnalysis(val, form.expiryTime, form.foodType)
      }
    }
    if (key === 'expiryTime') {
      triggerAnalysis(form.foodName, val, form.foodType)
    }
  }

  // ── AI Safety Analysis with delay
  const triggerAnalysis = (name, expiry, type) => {
    if (!name || name.length < 3) return
    setAnalyzing(true)
    setTimeout(() => {
      const result = analyzeFoodSafety(name, expiry, type)
      setSafety(result)
      setAnalyzing(false)
    }, 800)
  }

  const applyShelfLife = () => {
    if (!shelfHint) return
    const suggested = new Date(Date.now() + shelfHint.hours * 3600000)
      .toISOString().slice(0,16)
    set('expiryTime', suggested)
  }

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(prev => ({
          ...prev,
          latitude:  pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }))
        toast.success('Location detected!')
      },
      () => toast.error('Could not get location. Please enter manually.')
    )
  }

  // ── Feature: Image Upload to Firebase Storage
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    toast.info('Photo selected! It will upload when you post.')
  }

  const uploadImage = async () => {
    if (!imageFile) return null
    setUploading(true)
    try {
      const fileName = `donations/${dbUser.id}_${Date.now()}_${imageFile.name}`
      const storageRef = ref(storage, fileName)
      const uploadTask = uploadBytesResumable(storageRef, imageFile)

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          snapshot => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            setUploadProgress(progress)
          },
          error => { reject(error) },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            setUploading(false)
            resolve(url)
          }
        )
      })
    } catch (e) {
      setUploading(false)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Block submission if food is unsafe
    if (safety?.category === 'COMPOST') {
      setError('⚠️ This food has expired and cannot be donated. Please compost it.')
      setLoading(false)
      return
    }

    try {
      // Upload image first if selected
      let imageUrl = form.imageUrl
      if (imageFile) {
        toast.info('Uploading photo...')
        imageUrl = await uploadImage() || ''
      }

      await createDonation(dbUser.id, {
        ...form,
        imageUrl,
        safetyCategory: safety?.category || 'SAFE',
        safetyScore:    safety?.score    || 100,
        quantity:       parseInt(form.quantity),
        latitude:       parseFloat(form.latitude)  || null,
        longitude:      parseFloat(form.longitude) || null,
        expiryTime:     form.expiryTime ? new Date(form.expiryTime).toISOString() : null,
      })
      setSuccess(true)
      toast.success('Donation posted! Volunteers notified.')
      setTimeout(() => navigate('/dashboard'), 2500)
    } catch {
      setError('Failed to submit donation. Please try again.')
      toast.error('Failed to post donation')
    }
    setLoading(false)
  }

  const getExpiryStatus = () => {
    if (!form.expiryTime) return null
    const diff = new Date(form.expiryTime) - new Date()
    const h    = Math.floor(diff / 3600000)
    if (diff <= 0) return { text:'⚠️ Expiry is in the past!',       color:'#dc2626' }
    if (h < 2)     return { text:`🔴 Very urgent — expires in ${h}h`, color:'#dc2626' }
    if (h < 6)     return { text:`🟡 Expires in ~${h} hours`,         color:'#e8720c' }
    return           { text:`🟢 Good — ${h} hours until expiry`,      color:'#166534' }
  }

  const foodTypes = [
    { value:'VEG',      icon:'🥦', label: lang==='ta' ? 'சாகாரம்'    : 'Vegetarian',      desc: lang==='ta' ? 'தாவர உணவு'         : 'Plant-based food',      color:'#2d8a4e', bg:'#e8f8ee' },
    { value:'NON_VEG',  icon:'🍗', label: lang==='ta' ? 'அசாகாரம்'   : 'Non-Vegetarian',  desc: lang==='ta' ? 'இறைச்சி/முட்டை'   : 'Includes meat/eggs',    color:'#dc2626', bg:'#fee2e2' },
    { value:'PACKAGED', icon:'📦', label: lang==='ta' ? 'பேக்கேஜ்'   : 'Packaged/Sealed', desc: lang==='ta' ? 'சீல் செய்யப்பட்டது': 'Sealed & store-bought', color:'#2563eb', bg:'#dbeafe' },
  ]

  const expiryStatus = getExpiryStatus()

  if (success) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #1a2d0f, #2d5016)' }}>
      <div style={{ background:'var(--bg-card)', borderRadius:24, padding:40, textAlign:'center', maxWidth:400, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ width:96, height:96, background:'#e8f8ee', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:48 }}>🎉</div>
        <h2 style={{ fontSize:24, fontWeight:900, color:'var(--brand)', marginBottom:8 }}>
          {lang === 'ta' ? 'தானம் பதிவு செய்யப்பட்டது!' : 'Donation Posted!'}
        </h2>
        <p style={{ color:'var(--text-muted)', marginBottom:16 }}>
          {lang === 'ta' ? 'அருகிலுள்ள தன்னார்வலர்களுக்கு தெரிவிக்கப்பட்டது.' : 'Volunteers nearby have been notified.'}
        </p>
        {imagePreview && (
          <img src={imagePreview} alt="donated food"
            style={{ width:80, height:80, borderRadius:12, objectFit:'cover', margin:'0 auto 12px', display:'block' }}/>
        )}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'var(--brand)', fontSize:14 }}>
          <span className="spinner" style={{ width:16, height:16 }}/>
          {lang === 'ta' ? 'டாஷ்போர்டுக்கு திரும்புகிறது...' : 'Redirecting to dashboard...'}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-page)' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg, #2d8a4e, #1f6b3a)', borderRadius:20, padding:24, marginBottom:24, color:'white', boxShadow:'0 8px 32px rgba(45,138,78,0.3)' }}>
          <div className="flex items-center gap-3">
            <div style={{ width:48, height:48, background:'rgba(255,255,255,0.2)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🍱</div>
            <div>
              <h1 style={{ fontSize:22, fontWeight:900, marginBottom:2 }}>{t('title')}</h1>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>{t('subtitle')}</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:16 }}>
            {['Food Details','Location','Review'].map((s,i) => (
              <div key={i} style={{ flex:1, height:3, borderRadius:9999, background: i===0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)' }}/>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:28 }}>
          {error && (
            <div style={{ background:'#fef2f2', borderLeft:'3px solid #dc2626', color:'#dc2626', borderRadius:10, padding:'10px 14px', marginBottom:20, fontSize:13 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* ── Feature: Food Image Upload ── */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                {t('uploadPhoto')}
              </label>
              <div style={{
                border:`2px dashed ${imagePreview ? 'var(--brand)' : 'var(--border)'}`,
                borderRadius:14, padding:16, textAlign:'center', cursor:'pointer',
                background: imagePreview ? 'var(--brand-light)' : 'var(--bg-surface)',
                transition:'all 0.2s',
              }}
                onClick={() => document.getElementById('food-image-input').click()}>
                {imagePreview ? (
                  <div style={{ position:'relative', display:'inline-block' }}>
                    <img src={imagePreview} alt="preview"
                      style={{ width:120, height:120, borderRadius:12, objectFit:'cover', display:'block' }}/>
                    <button type="button"
                      onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
                      style={{ position:'absolute', top:-8, right:-8, width:24, height:24, borderRadius:'50%', background:'#dc2626', color:'#fff', border:'none', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      ✕
                    </button>
                    {uploading && (
                      <div style={{ position:'absolute', inset:0, borderRadius:12, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700 }}>
                        {uploadProgress}%
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:36, marginBottom:8 }}>📷</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)' }}>
                      Click to upload food photo
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
                      JPG, PNG up to 5MB
                    </div>
                  </>
                )}
              </div>
              <input id="food-image-input" type="file" accept="image/*"
                onChange={handleImageChange} style={{ display:'none' }}/>
            </div>

            {/* ── Food Name ── */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                {t('foodName')}
              </label>
              <input value={form.foodName} onChange={e => set('foodName', e.target.value)}
                className="input-field" placeholder={t('foodHolder')} required/>

              {/* Shelf life hint */}
              {shelfHint && (
                <div style={{ marginTop:8, padding:'10px 14px', borderRadius:10, background:'linear-gradient(135deg, #dbeafe, #e0f2fe)', border:'1px solid #93c5fd', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:18 }}>💡</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#1d4ed8' }}>AI Shelf Life Prediction</div>
                      <div style={{ fontSize:11, color:'#3b82f6' }}>{shelfHint.hint} typically lasts <strong>{shelfHint.label}</strong></div>
                    </div>
                  </div>
                  <button type="button" onClick={applyShelfLife}
                    style={{ fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:8, background:'#2563eb', color:'#fff', border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
                    Set {shelfHint.label} →
                  </button>
                </div>
              )}
            </div>

            {/* ── Feature: AI Safety Score ── */}
            {(analyzing || safety) && (
              <div style={{
                padding:16, borderRadius:14,
                background: analyzing ? 'var(--bg-surface)' : safety.bg,
                border:`1.5px solid ${analyzing ? 'var(--border)' : safety.color}`,
                transition:'all 0.3s',
              }}>
                {analyzing ? (
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span className="spinner" style={{ width:16, height:16, borderTopColor:'var(--brand)' }}/>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)' }}>
                      {t('analyzing')}
                    </span>
                  </div>
                ) : (
                  <>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:24 }}>{safety.icon}</span>
                        <div>
                          <div style={{ fontSize:13, fontWeight:800, color:safety.color }}>{safety.label}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{safety.advice}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:24, fontWeight:900, color:safety.color }}>{safety.score}</div>
                        <div style={{ fontSize:10, color:'var(--text-muted)' }}>{t('safetyScore')}</div>
                      </div>
                    </div>
                    {/* Score bar */}
                    <div style={{ height:6, background:'var(--border)', borderRadius:9999, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:9999, background:safety.color, width:`${safety.score}%`, transition:'width 0.5s ease' }}/>
                    </div>
                    {/* Safety categories */}
                    <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
                      {[
                        { cat:'SAFE',    icon:'✅', label:'Human Safe',    color:'#2d8a4e', bg:'#e8f8ee' },
                        { cat:'QUICK',   icon:'⚡', label:'Consume Quick', color:'#e8720c', bg:'#fff4ec' },
                        { cat:'ANIMAL',  icon:'🐄', label:'Animal Feed',   color:'#854d0e', bg:'#fef9c3' },
                        { cat:'COMPOST', icon:'♻️', label:'Compost',       color:'#dc2626', bg:'#fee2e2' },
                      ].map(c => (
                        <span key={c.cat} style={{
                          fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:9999,
                          background: safety.category === c.cat ? c.bg : 'var(--bg-surface)',
                          color:      safety.category === c.cat ? c.color : 'var(--text-muted)',
                          border:     `1px solid ${safety.category === c.cat ? c.color : 'var(--border)'}`,
                          opacity:    safety.category === c.cat ? 1 : 0.5,
                        }}>
                          {c.icon} {c.label}
                        </span>
                      ))}
                    </div>
                    {safety.category === 'COMPOST' && (
                      <div style={{ marginTop:10, padding:'8px 12px', borderRadius:10, background:'#fee2e2', color:'#dc2626', fontSize:12, fontWeight:700 }}>
                        ⛔ Cannot post — food has expired. Please compost.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Food Type ── */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                {t('foodType')}
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {foodTypes.map(ft => (
                  <label key={ft.value} style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                    padding:14, borderRadius:14, cursor:'pointer',
                    border:`2px solid ${form.foodType===ft.value ? ft.color : 'var(--border)'}`,
                    background: form.foodType===ft.value ? ft.bg : 'var(--bg-card)',
                    transition:'all 0.2s ease',
                  }}>
                    <input type="radio" name="foodType" value={ft.value}
                      checked={form.foodType===ft.value} onChange={() => set('foodType', ft.value)}
                      style={{ display:'none' }}/>
                    <span style={{ fontSize:26 }}>{ft.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color: form.foodType===ft.value ? ft.color : 'var(--text-muted)', textAlign:'center' }}>{ft.label}</span>
                    <span style={{ fontSize:10, color:'var(--text-muted)', textAlign:'center' }}>{ft.desc}</span>
                    {form.foodType===ft.value && <span style={{ fontSize:10, fontWeight:700, color:ft.color }}>✓ Selected</span>}
                  </label>
                ))}
              </div>
            </div>

            {/* ── Quantity + Expiry ── */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  {t('quantity')}
                </label>
                <input type="number" min="1" value={form.quantity}
                  onChange={e => set('quantity', e.target.value)}
                  className="input-field" placeholder="e.g. 20" required/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  {t('expiry')}
                </label>
                <input type="datetime-local" value={form.expiryTime}
                  onChange={e => set('expiryTime', e.target.value)}
                  className="input-field" required/>
                {expiryStatus && (
                  <p style={{ fontSize:11, fontWeight:600, color:expiryStatus.color, marginTop:5 }}>
                    {expiryStatus.text}
                  </p>
                )}
              </div>
            </div>

            {/* ── Pickup Address ── */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                {t('address')}
              </label>
              <input value={form.pickupAddress} onChange={e => set('pickupAddress', e.target.value)}
                className="input-field" placeholder={t('addressHolder')} required/>
            </div>

            {/* ── GPS ── */}
            <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:14, padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'var(--brand)' }}>📡 GPS Coordinates</label>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Helps AI match with nearest volunteers</p>
                </div>
                <button type="button" onClick={getLocation} className="btn-primary"
                  style={{ padding:'6px 14px', fontSize:12, borderRadius:10 }}>
                  Auto-detect
                </button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <input type="number" step="any" value={form.latitude}
                  onChange={e => set('latitude', e.target.value)}
                  className="input-field" placeholder="Latitude e.g. 11.6643" style={{ fontSize:13 }}/>
                <input type="number" step="any" value={form.longitude}
                  onChange={e => set('longitude', e.target.value)}
                  className="input-field" placeholder="Longitude e.g. 78.1460" style={{ fontSize:13 }}/>
              </div>
              {form.latitude && form.longitude && (
                <p style={{ fontSize:11, color:'var(--brand)', marginTop:8, fontWeight:600 }}>
                  ✅ Location set: {form.latitude}, {form.longitude}
                </p>
              )}
            </div>

            {/* ── Notes ── */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                {t('notes')}
              </label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                className="input-field" rows={3}
                placeholder={t('notesHolder')}
                style={{ resize:'vertical' }}/>
            </div>

            {/* ── Donation Summary ── */}
            {form.foodName && form.quantity && form.expiryTime && (
              <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:14, padding:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
                  {t('summary')}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[
                    { label:'Food',     value: form.foodName },
                    { label:'Quantity', value: `${form.quantity} servings` },
                    { label:'Type',     value: form.foodType },
                    { label:'Safety',   value: safety ? `${safety.icon} ${safety.label}` : '—' },
                    { label:'Expires',  value: form.expiryTime ? new Date(form.expiryTime).toLocaleString('en-IN',{ hour:'2-digit', minute:'2-digit', day:'numeric', month:'short' }) : '—' },
                    { label:'Photo',    value: imagePreview ? '✅ Added' : '— Not added' },
                  ].map((s,i) => (
                    <div key={i}>
                      <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginTop:2 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Buttons ── */}
            <div style={{ display:'flex', gap:12, paddingTop:4 }}>
              <button type="submit"
                disabled={loading || safety?.category === 'COMPOST'}
                className="btn-primary"
                style={{ flex:1, padding:'14px', fontSize:15, borderRadius:14, opacity: safety?.category === 'COMPOST' ? 0.5 : 1 }}>
                {loading
                  ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                      <span className="spinner" style={{ width:18, height:18 }}/>
                      {uploading ? `Uploading ${uploadProgress}%...` : t('posting')}
                    </span>
                  : t('submit')}
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-outline"
                style={{ padding:'14px 24px', borderRadius:14, fontSize:15 }}>
                {t('cancel')}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}