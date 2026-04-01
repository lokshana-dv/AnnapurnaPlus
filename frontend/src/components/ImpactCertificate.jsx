// Impact Certificate Modal — shows volunteer's contribution
export default function ImpactCertificate({ user, stats, onClose }) {
  const today = new Date().toLocaleDateString('en-IN', {
    year:'numeric', month:'long', day:'numeric'
  })

  const handlePrint = () => window.print()

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Certificate Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-8 text-white text-center">
          <div className="text-5xl mb-2">🏆</div>
          <div className="text-xs tracking-widest uppercase text-green-200 mb-1">Certificate of Impact</div>
          <div className="text-2xl font-black">ANNAPURNA+</div>
        </div>

        {/* Certificate Body */}
        <div className="p-8 text-center">
          <div className="text-gray-500 text-sm mb-2">This is to certify that</div>
          <div className="text-3xl font-black text-gray-800 mb-1">{user?.name}</div>
          <div className="text-gray-400 text-sm mb-6">as a valued {user?.role} of ANNAPURNA+</div>

          <div className="text-gray-600 text-sm mb-6 leading-relaxed">
            has made a remarkable contribution to the fight against food waste
            and hunger by actively participating in the Smart Food Rescue Platform.
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon:'🏅', label:'Badges Earned',  value: user?.badgeCount || 0      },
              { icon:'🍽️', label:'Meals Impacted',  value: stats?.estimatedMealsServed || 0 },
              { icon:'♻️', label:'Waste Saved (kg)', value: stats?.wasteReducedKg || 0 },
            ].map((s, i) => (
              <div key={i} className="bg-green-50 rounded-xl p-3 border border-green-100">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-black text-green-700">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 mb-6">
            <div className="text-xs text-gray-400">Issued on {today}</div>
            <div className="text-xs text-gray-400 mt-1">ANNAPURNA+ Smart Food Rescue Platform</div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={handlePrint}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition">
              🖨️ Print Certificate
            </button>
            <button onClick={onClose}
              className="py-3 px-6 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}